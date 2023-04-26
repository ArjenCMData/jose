import { decode as base64url } from '../../runtime/base64url.ts'
import decrypt from '../../runtime/decrypt.ts'
import { inflate } from '../../runtime/zlib.ts'

import { JOSEAlgNotAllowed, JOSENotSupported, JWEInvalid } from '../../util/errors.ts'
import isDisjoint from '../../lib/is_disjoint.ts'
import isObject from '../../lib/is_object.ts'
import decryptKeyManagement from '../../lib/decrypt_key_management.ts'
import type {
  FlattenedDecryptResult,
  KeyLike,
  FlattenedJWE,
  JWEHeaderParameters,
  DecryptOptions,
  GetKeyFunction,
  ResolvedKey,
} from '../../types.d.ts'
import { encoder, decoder, concat } from '../../lib/buffer_utils.ts'
import generateCek from '../../lib/cek.ts'
import validateCrit from '../../lib/validate_crit.ts'
import validateAlgorithms from '../../lib/validate_algorithms.ts'

/**
 * Interface for Flattened JWE Decryption dynamic key resolution. No token components have been
 * verified at the time of this function call.
 */
export interface FlattenedDecryptGetKey
  extends GetKeyFunction<JWEHeaderParameters | undefined, FlattenedJWE> {}

/**
 * Decrypts a Flattened JWE.
 *
 * @param jwe Flattened JWE.
 * @param key Private Key or Secret to decrypt the JWE with. See
 *   {@link https://github.com/panva/jose/issues/210#jwe-alg Algorithm Key Requirements}.
 * @param options JWE Decryption options.
 */
export function flattenedDecrypt(
  jwe: FlattenedJWE,
  key: KeyLike | Uint8Array,
  options?: DecryptOptions,
): Promise<FlattenedDecryptResult>
/**
 * @param jwe Flattened JWE.
 * @param getKey Function resolving Private Key or Secret to decrypt the JWE with. See
 *   {@link https://github.com/panva/jose/issues/210#jwe-alg Algorithm Key Requirements}.
 * @param options JWE Decryption options.
 */
export function flattenedDecrypt<T extends KeyLike = KeyLike>(
  jwe: FlattenedJWE,
  getKey: FlattenedDecryptGetKey,
  options?: DecryptOptions,
): Promise<FlattenedDecryptResult & ResolvedKey<T>>
export async function flattenedDecrypt(
  jwe: FlattenedJWE,
  key: KeyLike | Uint8Array | FlattenedDecryptGetKey,
  options?: DecryptOptions,
) {
  if (!isObject(jwe)) {
    throw new JWEInvalid('Flattened JWE must be an object')
  }

  if (jwe.protected === undefined && jwe.header === undefined && jwe.unprotected === undefined) {
    throw new JWEInvalid('JOSE Header missing')
  }

  if (typeof jwe.iv !== 'string') {
    throw new JWEInvalid('JWE Initialization Vector missing or incorrect type')
  }

  if (typeof jwe.ciphertext !== 'string') {
    throw new JWEInvalid('JWE Ciphertext missing or incorrect type')
  }

  if (typeof jwe.tag !== 'string') {
    throw new JWEInvalid('JWE Authentication Tag missing or incorrect type')
  }

  if (jwe.protected !== undefined && typeof jwe.protected !== 'string') {
    throw new JWEInvalid('JWE Protected Header incorrect type')
  }

  if (jwe.encrypted_key !== undefined && typeof jwe.encrypted_key !== 'string') {
    throw new JWEInvalid('JWE Encrypted Key incorrect type')
  }

  if (jwe.aad !== undefined && typeof jwe.aad !== 'string') {
    throw new JWEInvalid('JWE AAD incorrect type')
  }

  if (jwe.header !== undefined && !isObject(jwe.header)) {
    throw new JWEInvalid('JWE Shared Unprotected Header incorrect type')
  }

  if (jwe.unprotected !== undefined && !isObject(jwe.unprotected)) {
    throw new JWEInvalid('JWE Per-Recipient Unprotected Header incorrect type')
  }

  let parsedProt!: JWEHeaderParameters
  if (jwe.protected) {
    try {
      const protectedHeader = base64url(jwe.protected)
      parsedProt = JSON.parse(decoder.decode(protectedHeader))
    } catch {
      throw new JWEInvalid('JWE Protected Header is invalid')
    }
  }
  if (!isDisjoint(parsedProt, jwe.header, jwe.unprotected)) {
    throw new JWEInvalid(
      'JWE Protected, JWE Unprotected Header, and JWE Per-Recipient Unprotected Header Parameter names must be disjoint',
    )
  }

  const joseHeader: JWEHeaderParameters = {
    ...parsedProt,
    ...jwe.header,
    ...jwe.unprotected,
  }

  validateCrit(JWEInvalid, new Map(), options?.crit, parsedProt, joseHeader)

  if (joseHeader.zip !== undefined) {
    if (!parsedProt || !parsedProt.zip) {
      throw new JWEInvalid('JWE "zip" (Compression Algorithm) Header MUST be integrity protected')
    }

    if (joseHeader.zip !== 'DEF') {
      throw new JOSENotSupported(
        'Unsupported JWE "zip" (Compression Algorithm) Header Parameter value',
      )
    }
  }

  const { alg, enc } = joseHeader

  if (typeof alg !== 'string' || !alg) {
    throw new JWEInvalid('missing JWE Algorithm (alg) in JWE Header')
  }

  if (typeof enc !== 'string' || !enc) {
    throw new JWEInvalid('missing JWE Encryption Algorithm (enc) in JWE Header')
  }

  const keyManagementAlgorithms =
    options && validateAlgorithms('keyManagementAlgorithms', options.keyManagementAlgorithms)
  const contentEncryptionAlgorithms =
    options &&
    validateAlgorithms('contentEncryptionAlgorithms', options.contentEncryptionAlgorithms)

  if (keyManagementAlgorithms && !keyManagementAlgorithms.has(alg)) {
    throw new JOSEAlgNotAllowed('"alg" (Algorithm) Header Parameter not allowed')
  }

  if (contentEncryptionAlgorithms && !contentEncryptionAlgorithms.has(enc)) {
    throw new JOSEAlgNotAllowed('"enc" (Encryption Algorithm) Header Parameter not allowed')
  }

  let encryptedKey!: Uint8Array
  if (jwe.encrypted_key !== undefined) {
    encryptedKey = base64url(jwe.encrypted_key!)
  }

  let resolvedKey = false
  if (typeof key === 'function') {
    key = await key(parsedProt, jwe)
    resolvedKey = true
  }

  let cek: KeyLike | Uint8Array
  try {
    cek = await decryptKeyManagement(alg, key, encryptedKey, joseHeader, options)
  } catch (err) {
    if (err instanceof TypeError || err instanceof JWEInvalid || err instanceof JOSENotSupported) {
      throw err
    }
    // https://www.rfc-editor.org/rfc/rfc7516#section-11.5
    // To mitigate the attacks described in RFC 3218, the
    // recipient MUST NOT distinguish between format, padding, and length
    // errors of encrypted keys.  It is strongly recommended, in the event
    // of receiving an improperly formatted key, that the recipient
    // substitute a randomly generated CEK and proceed to the next step, to
    // mitigate timing attacks.
    cek = generateCek(enc)
  }

  const iv = base64url(jwe.iv)
  const tag = base64url(jwe.tag)

  const protectedHeader: Uint8Array = encoder.encode(jwe.protected ?? '')
  let additionalData: Uint8Array

  if (jwe.aad !== undefined) {
    additionalData = concat(protectedHeader, encoder.encode('.'), encoder.encode(jwe.aad))
  } else {
    additionalData = protectedHeader
  }

  let plaintext = await decrypt(enc, cek, base64url(jwe.ciphertext), iv, tag, additionalData)

  if (joseHeader.zip === 'DEF') {
    plaintext = await (options?.inflateRaw || inflate)(plaintext)
  }

  const result: FlattenedDecryptResult = { plaintext }

  if (jwe.protected !== undefined) {
    result.protectedHeader = parsedProt
  }

  if (jwe.aad !== undefined) {
    result.additionalAuthenticatedData = base64url(jwe.aad!)
  }

  if (jwe.unprotected !== undefined) {
    result.sharedUnprotectedHeader = jwe.unprotected
  }

  if (jwe.header !== undefined) {
    result.unprotectedHeader = jwe.header
  }

  if (resolvedKey) {
    return { ...result, key }
  }

  return result
}