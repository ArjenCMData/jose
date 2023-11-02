# Class: JWKSTimeout

## [💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

---

Timeout was reached when retrieving the JWKS response.

**`Example`**

Checking thrown error is this one using a stable error code

```js
if (err.code === 'ERR_JWKS_TIMEOUT') {
  // ...
}
```

**`Example`**

Checking thrown error is this one using `instanceof`

```js
if (err instanceof jose.errors.JWKSTimeout) {
  // ...
}
```

## Table of contents

### Constructors

- [constructor](util_errors.JWKSTimeout.md#constructor)

### Properties

- [code](util_errors.JWKSTimeout.md#code)
- [message](util_errors.JWKSTimeout.md#message)

### Accessors

- [code](util_errors.JWKSTimeout.md#code-1)

## Constructors

### constructor

• **new JWKSTimeout**(`message?`): [`JWKSTimeout`](util_errors.JWKSTimeout.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message?` | `string` |

#### Returns

[`JWKSTimeout`](util_errors.JWKSTimeout.md)

## Properties

### code

• **code**: `string` = `'ERR_JWKS_TIMEOUT'`

A unique error code for the particular error subclass.

___

### message

• **message**: `string` = `'request timed out'`

## Accessors

### code

• `get` **code**(): ``"ERR_JWKS_TIMEOUT"``

A unique error code for the particular error subclass.

#### Returns

``"ERR_JWKS_TIMEOUT"``
