// PUT { stars: { "<sheet>": 1..3 } }: best stars per worksheet, which only ever go up.
import { body, currentUser, db, json, ready } from './_lib.js'

const SHEET = /^[a-z][a-z0-9-]{1,30}$/

export async function PUT(request) {
  const id = await currentUser(request)
  if (!id) return json({ error: 'sign in first' }, { status: 401 })
  const { stars = {} } = await body(request)
  const entries = Object.entries(stars).filter(([sheet, n]) => SHEET.test(sheet) && Number.isInteger(n) && n >= 1 && n <= 3)
  if (entries.length > 100) return json({ error: 'too many sheets' }, { status: 413 })
  if (!entries.length) return json({ ok: true })
  await ready()
  const now = Date.now()
  await db.batch(entries.map(([sheet, n]) => ({
    sql: `INSERT INTO stars (user_id, sheet, stars, updated_at) VALUES (?, ?, ?, ?)
          ON CONFLICT(user_id, sheet) DO UPDATE SET stars = MAX(stars, excluded.stars), updated_at = excluded.updated_at`,
    args: [id, sheet, n, now],
  })), 'write')
  return json({ ok: true })
}
