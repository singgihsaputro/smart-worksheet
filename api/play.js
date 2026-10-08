// POST { sheet, stars: 0..3, mistakes, device }: a finished worksheet, sent with
// navigator.sendBeacon. Anonymous for guests (a random id kept in the browser).
import { body, currentUser, db, json, ready } from './_lib.js'

const SHEET = /^[a-z][a-z0-9-]{1,30}$/
const int = (v, lo, hi) => (Number.isInteger(v) && v >= lo && v <= hi ? v : null)

export async function POST(request) {
  const b = await body(request)
  const stars = int(b.stars, 0, 3), mistakes = int(b.mistakes, 0, 999)
  if (typeof b.sheet !== 'string' || !SHEET.test(b.sheet) || stars === null || mistakes === null) {
    return json({ error: 'bad play' }, { status: 400 })
  }
  const device = typeof b.device === 'string' && /^[a-z0-9-]{8,40}$/i.test(b.device) ? b.device : null
  await ready()
  // ponytail: no rate limit on anonymous plays; add a per-IP limit (Vercel WAF) if counts look inflated.
  await db.execute({
    sql: 'INSERT INTO plays (user_id, device, sheet, stars, mistakes, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    args: [await currentUser(request), device, b.sheet, stars, mistakes, Date.now()],
  })
  return json({ ok: true })
}
