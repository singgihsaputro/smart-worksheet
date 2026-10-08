// Sign in → stars → read back → plays → iPhone handoff → sign out, against an
// in-memory database and a stand-in for Google's signing keys.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose'

process.env.TURSO_DATABASE_URL = ':memory:'
process.env.GOOGLE_CLIENT_ID = 'test-client'
process.env.SESSION_SECRET = 'test-secret-that-is-long-enough-for-hs256'

const { google, db } = await import('../api/_lib.js')
const auth = await import('../api/auth.js')
const me = await import('../api/me.js')
const progress = await import('../api/progress.js')
const play = await import('../api/play.js')
const handoff = await import('../api/handoff.js')

const { publicKey, privateKey } = await generateKeyPair('RS256')
google.keys = createLocalJWKSet({ keys: [{ ...(await exportJWK(publicKey)), kid: 'k', alg: 'RS256' }] })
const idToken = (claims, sub = 'google-1') => new SignJWT({ email_verified: true, ...claims })
  .setProtectedHeader({ alg: 'RS256', kid: 'k' }).setIssuer('https://accounts.google.com')
  .setAudience('test-client').setSubject(sub).setExpirationTime('5m').sign(privateKey)
const req = (method, data, cookie) => new Request('http://localhost/api', {
  method, headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}) },
  body: data ? JSON.stringify(data) : undefined,
})
const cookieOf = res => res.headers.get('set-cookie').split(';')[0]

test('Google sign-in, stars that only go up, read back on another device', async () => {
  assert.equal((await auth.POST(req('POST', { credential: 'nonsense' }))).status, 401)
  const res = await auth.POST(req('POST', { credential: await idToken({ email: 'Kid@Example.com', name: 'Kid' }) }))
  assert.equal(res.status, 200)
  const cookie = cookieOf(res)
  assert.equal((await progress.PUT(req('PUT', { stars: { shadow: 2 } }))).status, 401)
  await progress.PUT(req('PUT', { stars: { shadow: 2, puzzle: 3, 'BAD sheet!': 3, count: 9 } }, cookie))
  await progress.PUT(req('PUT', { stars: { shadow: 1 } }, cookie)) // a worse try doesn't lower it
  const data = await (await me.GET(req('GET', null, cookie))).json()
  assert.equal(data.user.email, 'Kid@Example.com')
  assert.deepEqual(data.stars, { shadow: 2, puzzle: 3 })
  // Same email, signing in again: same account.
  const again = cookieOf(await auth.POST(req('POST', { credential: await idToken({ email: 'kid@example.com' }, 'google-other') })))
  assert.deepEqual((await (await me.GET(req('GET', null, again))).json()).stars, { shadow: 2, puzzle: 3 })
  assert.match((await auth.DELETE()).headers.get('set-cookie'), /Max-Age=0/)
})

test('finished worksheets are logged, bad ones refused', async () => {
  assert.equal((await play.POST(req('POST', { sheet: 'sound', stars: 3, mistakes: 0, device: 'device-1234' }))).status, 200)
  assert.equal((await play.POST(req('POST', { sheet: 'sound', stars: 7, mistakes: 0 }))).status, 400)
  assert.equal((await play.POST(req('POST', { sheet: '../x', stars: 1, mistakes: 0 }))).status, 400)
  assert.equal((await db.execute("SELECT COUNT(*) AS n FROM plays WHERE sheet = 'sound'")).rows[0].n, 1)
})

test('iPhone home-screen app: sign in in Safari, pick the session up with the code', async () => {
  const code = crypto.randomUUID()
  const pick = id => handoff.POST(req('POST', { id }))
  const fromGoogle = fields => auth.POST(new Request('http://localhost/api/auth', {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(fields).toString(),
  }))
  assert.equal((await (await pick(code)).json()).user, null)
  const other = await idToken({ email: 'ios@example.com', nonce: crypto.randomUUID() }, 'google-ios')
  assert.equal((await fromGoogle({ id_token: other, state: code })).headers.get('location'), `/#/signin/failed/${code}`)
  const good = await idToken({ email: 'ios@example.com', nonce: code }, 'google-ios')
  assert.equal((await fromGoogle({ id_token: good, state: code })).status, 303)
  const res = await pick(code)
  assert.equal((await res.json()).user.email, 'ios@example.com')
  assert.equal((await (await me.GET(req('GET', null, cookieOf(res)))).json()).user.email, 'ios@example.com')
  assert.equal((await (await pick(code)).json()).user, null) // single use
})
