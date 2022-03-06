import { compactDecrypt } from '../jwe/compact/decrypt.js'
import type {
  KeyLike,
  DecryptOptions,
  JWTClaimVerificationOptions,
  GetKeyFunction,
  CompactJWEHeaderParameters,
  FlattenedJWE,
  JWTDecryptResult,
  ResolvedKey,
} from '../types.d'
import jwtPayload from '../lib/jwt_claims_set.js'
import { JWTClaimValidationFailed } from '../util/errors.js'

/**
 * Combination of JWE Decryption options and JWT Claims Set verification options.
 */
export interface JWTDecryptOptions extends DecryptOptions, JWTClaimVerificationOptions {}

/**
 * Interface for JWT Decryption dynamic key resolution.
 * No token components have been verified at the time of this function call.
 */
export interface JWTDecryptGetKey
  extends GetKeyFunction<CompactJWEHeaderParameters, FlattenedJWE> {}

/**
 * Verifies the JWT format (to be a JWE Compact format), decrypts the ciphertext, validates the JWT Claims Set.
 *
 * @param jwt JSON Web Token value (encoded as JWE).
 * @param key Private Key or Secret to decrypt and verify the JWT with.
 * @param options JWT Decryption and JWT Claims Set validation options.
 *
 * @example Usage
 * ```js
 * const jwt = 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..KVcNLqK-3-8ZkYIC.xSwF4VxO0kUMUD2W-cifsNUxnr-swyBq-nADBptyt6y9n79-iNc5b0AALJpRwc0wwDkJw8hNOMjApNUTMsK9b-asToZ3DXFMvwfJ6n1aWefvd7RsoZ2LInWFfVAuttJDzoGB.uuexQoWHwrLMEYRElT8pBQ'
 *
 * const { payload, protectedHeader } = await jose.jwtDecrypt(jwt, secretKey, {
 *   issuer: 'urn:example:issuer',
 *   audience: 'urn:example:audience'
 * })
 *
 * console.log(protectedHeader)
 * console.log(payload)
 * ```
 */
export async function jwtDecrypt(
  jwt: string | Uint8Array,
  key: KeyLike | Uint8Array,
  options?: JWTDecryptOptions & { publicKey?: KeyLike },
): Promise<JWTDecryptResult>
/**
 * @param jwt JSON Web Token value (encoded as JWE).
 * @param getKey Function resolving Private Key or Secret to decrypt and verify the JWT with.
 * @param options JWT Decryption and JWT Claims Set validation options.
 */
export async function jwtDecrypt(
  jwt: string | Uint8Array,
  getKey: JWTDecryptGetKey,
  options?: JWTDecryptOptions & { publicKey?: KeyLike },
): Promise<JWTDecryptResult & ResolvedKey>
export async function jwtDecrypt(
  jwt: string | Uint8Array,
  key: KeyLike | Uint8Array | JWTDecryptGetKey,
  options?: JWTDecryptOptions & { publicKey?: KeyLike },
) {
  const decrypted = await compactDecrypt(jwt, <Parameters<typeof compactDecrypt>[1]>key, options)
  const payload = jwtPayload(decrypted.protectedHeader, decrypted.plaintext, options)

  const { protectedHeader, contentEncryptionKey } = decrypted

  if (protectedHeader.iss !== undefined && protectedHeader.iss !== payload.iss) {
    throw new JWTClaimValidationFailed(
      'replicated "iss" claim header parameter mismatch',
      'iss',
      'mismatch',
    )
  }

  if (protectedHeader.sub !== undefined && protectedHeader.sub !== payload.sub) {
    throw new JWTClaimValidationFailed(
      'replicated "sub" claim header parameter mismatch',
      'sub',
      'mismatch',
    )
  }

  if (
    protectedHeader.aud !== undefined &&
    JSON.stringify(protectedHeader.aud) !== JSON.stringify(payload.aud)
  ) {
    throw new JWTClaimValidationFailed(
      'replicated "aud" claim header parameter mismatch',
      'aud',
      'mismatch',
    )
  }

  const result = { payload, protectedHeader }

  if (contentEncryptionKey) {
    ;(<JWTDecryptResult>result).contentEncryptionKey = contentEncryptionKey
  }

  if (typeof key === 'function') {
    return { ...result, key: decrypted.key }
  }

  return result
}
