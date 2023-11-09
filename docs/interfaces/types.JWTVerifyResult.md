# Interface: JWTVerifyResult\<PayloadType\>

## [💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

---

## Type parameters

| Name | Type |
| :------ | :------ |
| `PayloadType` | [`JWTPayload`](types.JWTPayload.md) |

## Table of contents

### Properties

- [payload](types.JWTVerifyResult.md#payload)
- [protectedHeader](types.JWTVerifyResult.md#protectedheader)

## Properties

### payload

• **payload**: `PayloadType` & [`JWTPayload`](types.JWTPayload.md)

JWT Claims Set.

___

### protectedHeader

• **protectedHeader**: [`JWTHeaderParameters`](types.JWTHeaderParameters.md)

JWS Protected Header.
