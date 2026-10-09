// POST { type: 'donate_tap' }: a tap on "Beri dukungan", counted for the owner's
// dashboard (with the account if signed in). Sent with navigator.sendBeacon.
import { body, currentUser, db, json, ready } from './_lib.js'

const TYPES = new Set(['donate_tap'])

export async function POST(request) {
  const { type } = await body(request)
  if (!TYPES.has(type)) return json({ error: 'unknown event' }, { status: 400 })
  await ready()
  await db.execute({ sql: 'INSERT INTO events (user_id, type, created_at) VALUES (?, ?, ?)', args: [await currentUser(request), type, Date.now()] })
  return json({ ok: true })
}
