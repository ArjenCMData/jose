import type QUnit from 'qunit'
import type * as jose from '../src/index.js'

export default (QUnit: QUnit, lib: typeof jose) => {
  const { module, test } = QUnit
  module('test-hpke.ts')

  test('HPKE alg', async (t) => {
    const publicJwk = {
      kty: 'EC',
      crv: 'P-256',
      alg: 'THIS CAN BE ANYTHING',
      x: 'Ze2loSV3wrroKUN_4zhwGhCqo3Xhu1td4QjeQ5wIVR0',
      y: 'HlLtdXARY_f55A3fnzQbPcm6hgr34Mp8p-nuzQCE0Zw',
    }

    await crypto.subtle.importKey('jwk', publicJwk, { name: 'ECDH', namedCurve: 'P-256' }, true, [])

    t.ok(1)
  })
}
