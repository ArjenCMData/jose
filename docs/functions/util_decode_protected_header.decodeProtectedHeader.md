# Function: decodeProtectedHeader

▸ **decodeProtectedHeader**(`token`): [`ProtectedHeaderParameters`](../types/util_decode_protected_header.ProtectedHeaderParameters.md)

Decodes the Protected Header of a JWE/JWS/JWT token utilizing any JOSE serialization.

**`example`** ESM import
```js
import { decodeProtectedHeader } from 'jose/util/decode_protected_header'
```

**`example`** CJS import
```js
const { decodeProtectedHeader } = require('jose/util/decode_protected_header')
```

**`example`** Deno import
```js
import { decodeProtectedHeader } from 'https://deno.land/x/jose@v3.20.4/util/decode_protected_header.ts'
```

**`example`** Usage
```js
const protectedHeader = decodeProtectedHeader(token)
console.log(protectedHeader)
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `token` | `string` \| `object` | JWE/JWS/JWT token in any JOSE serialization. |

#### Returns

[`ProtectedHeaderParameters`](../types/util_decode_protected_header.ProtectedHeaderParameters.md)
