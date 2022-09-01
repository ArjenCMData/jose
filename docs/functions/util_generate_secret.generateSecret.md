# Function: generateSecret

▸ **generateSecret**(`alg`, `options?`): `Promise`<[`KeyLike`](../types/types.KeyLike.md) \| `Uint8Array`\>

Generates a symmetric secret key for a given JWA algorithm identifier.

Note: Under Web Cryptography API runtime the secret key is generated with
`extractable` set to `false` by default.

**`example`** ESM import
```js
import { generateSecret } from 'jose/util/generate_secret'
```

**`example`** CJS import
```js
const { generateSecret } = require('jose/util/generate_secret')
```

**`example`** Deno import
```js
import { generateSecret } from 'https://deno.land/x/jose@v3.20.4/util/generate_secret.ts'
```

**`example`** Usage
```js
const secret = await generateSecret('HS256')
console.log(secret)
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `alg` | `string` | JWA Algorithm Identifier to be used with the generated secret. |
| `options?` | [`GenerateSecretOptions`](../interfaces/util_generate_secret.GenerateSecretOptions.md) | Additional options passed down to the secret generation. |

#### Returns

`Promise`<[`KeyLike`](../types/types.KeyLike.md) \| `Uint8Array`\>
