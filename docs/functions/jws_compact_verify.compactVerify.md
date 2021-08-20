# Function: compactVerify

[jws/compact/verify](../modules/jws_compact_verify.md).compactVerify

▸ **compactVerify**(`jws`, `key`, `options?`): `Promise`<[`CompactVerifyResult`](../interfaces/types.CompactVerifyResult.md)\>

Verifies the signature and format of and afterwards decodes the Compact JWS.

**`example`** ESM import
```js
import { compactVerify } from 'jose/jws/compact/verify'
```

**`example`** CJS import
```js
const { compactVerify } = require('jose/jws/compact/verify')
```

**`example`** Deno import
```js
import { compactVerify } from 'https://deno.land/x/jose@v3.15.3/jws/compact/verify.ts'
```

**`example`** Usage
```js
const decoder = new TextDecoder()
const jws = 'eyJhbGciOiJFUzI1NiJ9.SXTigJlzIGEgZGFuZ2Vyb3VzIGJ1c2luZXNzLCBGcm9kbywgZ29pbmcgb3V0IHlvdXIgZG9vci4.kkAs_gPPxWMI3rHuVlxHaTPfDWDoqdI8jSvuSmqV-8IHIWXg9mcAeC9ggV-45ZHRbiRJ3obUIFo1rHphPA5URg'

const { payload, protectedHeader } = await compactVerify(jws, publicKey)

console.log(protectedHeader)
console.log(decoder.decode(payload))
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `jws` | `string` \| `Uint8Array` | Compact JWS. |
| `key` | [`KeyLike`](../types/types.KeyLike.md) \| [`CompactVerifyGetKey`](../interfaces/jws_compact_verify.CompactVerifyGetKey.md) | Key, or a function resolving a key, to verify the JWS with. |
| `options?` | [`VerifyOptions`](../interfaces/types.VerifyOptions.md) | JWS Verify options. |

#### Returns

`Promise`<[`CompactVerifyResult`](../interfaces/types.CompactVerifyResult.md)\>

#### Defined in

[jws/compact/verify.ts:56](https://github.com/panva/jose/blob/v3.15.3/src/jws/compact/verify.ts#L56)