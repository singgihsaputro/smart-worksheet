// GET: who is signed in, and their best stars per worksheet.
import { currentUser, db, json, ready } from './_lib.js'

export async function GET(request) {
  const id = await currentUser(request)
  if (!id) return json({ user: null })
  await ready()
  const [user, stars] = await db.batch([
    { sql: 'SELECT email, name, picture FROM users WHERE id = ?', args: [id] },
    { sql: 'SELECT sheet, stars FROM stars WHERE user_id = ?', args: [id] },
  ], 'read')
  if (!user.rows.length) return json({ user: null })
  return json({ user: user.rows[0], stars: Object.fromEntries(stars.rows.map(r => [r.sheet, Number(r.stars)])) })
}
