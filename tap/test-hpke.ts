import type QUnit from 'qunit'
import type * as jose from '../src/index.js'

export default (QUnit: QUnit, lib: typeof jose) => {
  const { module, test } = QUnit
  module('test-hpke.ts')

  test('HPKE alg (ECDH)', async (t) => {
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

  test('HPKE alg (X25519)', async (t) => {
    const publicJwk = {
      crv: 'X25519',
      alg: 'THIS CAN BE ANYTHING',
      d: 'WCN6m3ZhxgzgsmacDlbq_O347na7uQe6cW8T6ZJ19mw',
      kty: 'OKP',
      x: 'aq1ZuCRIE3XXXcRpbC_txuESJ4KFH8VwQlz1nVa8Ugk',
    }

    await crypto.subtle.importKey('jwk', publicJwk, 'X25519', true, [])

    t.ok(1)
  })
}
