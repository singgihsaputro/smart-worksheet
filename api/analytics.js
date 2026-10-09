// GET: the owner's dashboard — who signs in, which worksheets children play and
// how they do. Admins only (ADMIN_EMAILS); everyone else gets 401/403 and no data.
import { currentUser, db, isAdmin, json, ready } from './_lib.js'

const DAY = 864e5

export async function GET(request) {
  const id = await currentUser(request)
  if (!id) return json({ error: 'sign in first' }, { status: 401 })
  await ready()
  if (!(await isAdmin(id))) return json({ error: 'not an admin' }, { status: 403 })

  const now = Date.now(), week = now - 7 * DAY, month = now - 30 * DAY
  const [totals, sheets, daily, users, logins, plays, taps] = await db.batch([
    {
      sql: `SELECT
        (SELECT COUNT(*) FROM users) AS accounts,
        (SELECT COUNT(*) FROM users WHERE created_at >= ?) AS new_7d,
        (SELECT COUNT(DISTINCT user_id) FROM events WHERE type = 'login' AND created_at >= ?) AS signed_in_7d,
        (SELECT COUNT(*) FROM plays WHERE created_at >= ?) AS plays_7d,
        (SELECT COUNT(DISTINCT COALESCE(user_id, device)) FROM plays WHERE created_at >= ?) AS players_7d,
        (SELECT ROUND(AVG(stars), 1) FROM plays WHERE created_at >= ?) AS avg_stars_7d,
        (SELECT COUNT(*) FROM events WHERE type = 'donate_tap' AND created_at >= ?) AS donate_taps_7d,
        (SELECT COUNT(*) FROM events WHERE type = 'donate_tap') AS donate_taps`,
      args: [week, week, week, week, week, week],
    },
    // Per worksheet, last 30 days (bounded, so the dashboard stays cheap as plays grow).
    {
      sql: `SELECT sheet, COUNT(*) AS plays, COUNT(DISTINCT COALESCE(user_id, device)) AS players,
              SUM(user_id IS NOT NULL) AS signed_in, ROUND(AVG(stars), 1) AS avg_stars, ROUND(AVG(mistakes), 1) AS avg_mistakes
            FROM plays WHERE created_at >= ? GROUP BY sheet ORDER BY plays DESC`,
      args: [month],
    },
    {
      sql: `SELECT day, SUM(plays) AS plays, SUM(logins) AS logins FROM (
              SELECT date(created_at / 1000, 'unixepoch', '+7 hours') AS day, 1 AS plays, 0 AS logins FROM plays WHERE created_at >= ?
              UNION ALL
              SELECT date(created_at / 1000, 'unixepoch', '+7 hours'), 0, 1 FROM events WHERE type = 'login' AND created_at >= ?)
            GROUP BY day ORDER BY day`,
      args: [month, month],
    },
    `SELECT u.email, u.name, u.created_at, u.last_seen,
        (SELECT COUNT(*) FROM stars s WHERE s.user_id = u.id) AS sheets, (SELECT COALESCE(SUM(stars), 0) FROM stars s WHERE s.user_id = u.id) AS stars
      FROM users u ORDER BY u.last_seen DESC LIMIT 200`,
    `SELECT u.email, u.name, e.created_at FROM events e JOIN users u ON u.id = e.user_id
      WHERE e.type = 'login' ORDER BY e.created_at DESC LIMIT 200`,
    `SELECT p.sheet, p.stars, p.mistakes, p.created_at, u.email FROM plays p LEFT JOIN users u ON u.id = p.user_id
      ORDER BY p.created_at DESC LIMIT 300`,
    `SELECT e.created_at, u.email FROM events e LEFT JOIN users u ON u.id = e.user_id
      WHERE e.type = 'donate_tap' ORDER BY e.created_at DESC LIMIT 200`,
  ], 'read')

  const plain = rs => rs.rows.map(r => Object.fromEntries(rs.columns.map(c => [c, typeof r[c] === 'bigint' ? Number(r[c]) : r[c]])))
  return json({
    totals: plain(totals)[0], sheets: plain(sheets), daily: plain(daily),
    users: plain(users), logins: plain(logins), plays: plain(plays), taps: plain(taps),
  })
}
