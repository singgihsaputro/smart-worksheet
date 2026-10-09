// The owner's dashboard. The page is public; /api/analytics only answers admins.
import { h } from './dom.js'
import { SHEETS } from './sheets.js'

const $dash = document.getElementById('dash')
const when = ms => new Date(ms).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
const sheetName = id => { const s = SHEETS.find(x => x.id === id); return s ? `${s.emoji} ${s.title}` : id }
const who = email => email ?? h('span', { class: 'guest' }, 'tamu')
let view = 'sheets'

function table(headers, rows) {
  if (!rows.length) return h('p', { class: 'note' }, 'Belum ada data.')
  return h('div', { class: 'scroll' }, h('table', {},
    h('thead', {}, h('tr', {}, headers.map(([label, num]) => h('th', { class: num ? 'num' : null }, label)))),
    h('tbody', {}, rows)))
}

function chart(daily) {
  const days = []
  for (let i = 29; i >= 0; i--) days.push(new Date(Date.now() + 7 * 3600e3 - i * 864e5).toISOString().slice(0, 10))
  const by = Object.fromEntries(daily.map(d => [d.day, d]))
  const max = Math.max(1, ...days.map(d => (by[d]?.plays ?? 0) + (by[d]?.logins ?? 0)))
  return [
    h('div', { class: 'bars', role: 'img', 'aria-label': 'Permainan dan login per hari, 30 hari terakhir' }, days.map(d => h('div', { title: `${d}: ${by[d]?.plays ?? 0} permainan, ${by[d]?.logins ?? 0} login` },
      h('i', { class: 'l', style: `height:${((by[d]?.logins ?? 0) / max) * 100}%` }),
      h('i', { class: 'p', style: `height:${((by[d]?.plays ?? 0) / max) * 100}%` })))),
    h('div', { class: 'axis' }, h('span', {}, days[0]), h('span', {}, 'hari ini')),
    h('div', { class: 'legend' }, h('span', {}, h('i', { style: 'background:var(--teal)' }), 'Permainan selesai'), h('span', {}, h('i', { style: 'background:var(--coral)' }), 'Login')),
  ]
}

function render(data) {
  const t = data.totals
  const kpi = (value, label) => h('div', { class: 'kpi' }, h('b', {}, value ?? 0), h('span', {}, label))
  const views = {
    sheets: ['Lembar kerja (30 hari)', table([['Lembar'], ['Dimainkan', true], ['Pemain', true], ['Login', true], ['Rata ★', true], ['Rata salah', true]],
      data.sheets.map(r => h('tr', {}, h('td', {}, sheetName(r.sheet)), h('td', { class: 'num' }, r.plays), h('td', { class: 'num' }, r.players),
        h('td', { class: 'num' }, r.signed_in), h('td', { class: 'num' }, r.avg_stars), h('td', { class: 'num' }, r.avg_mistakes))))],
    users: ['Akun', table([['Email'], ['Nama'], ['Lembar berbintang', true], ['Total ★', true], ['Terakhir aktif', true], ['Daftar', true]],
      data.users.map(u => h('tr', {}, h('td', {}, u.email), h('td', {}, u.name ?? ''), h('td', { class: 'num' }, u.sheets), h('td', { class: 'num' }, u.stars),
        h('td', { class: 'num' }, when(u.last_seen)), h('td', { class: 'num' }, when(u.created_at)))))],
    logins: ['Login', table([['Email'], ['Nama'], ['Waktu', true]],
      data.logins.map(l => h('tr', {}, h('td', {}, l.email), h('td', {}, l.name ?? ''), h('td', { class: 'num' }, when(l.created_at)))))],
    plays: ['Permainan terakhir', table([['Siapa'], ['Lembar'], ['★', true], ['Salah', true], ['Waktu', true]],
      data.plays.map(p => h('tr', {}, h('td', {}, who(p.email)), h('td', {}, sheetName(p.sheet)), h('td', { class: 'num' }, '★'.repeat(p.stars) || '—'),
        h('td', { class: 'num' }, p.mistakes), h('td', { class: 'num' }, when(p.created_at)))))],
    taps: ['Ketuk "Beri dukungan"', table([['Siapa'], ['Waktu', true]],
      data.taps.map(e => h('tr', {}, h('td', {}, who(e.email)), h('td', { class: 'num' }, when(e.created_at)))))],
  }
  const [title, body] = views[view]
  $dash.replaceChildren(
    h('header', { class: 'top' }, h('a', { class: 'brand', href: '/' }, h('img', { src: 'brand/childplay-logo-icon.svg', alt: '' }),
      h('span', {}, h('b', {}, 'Analytics'), h('small', {}, 'Smart Worksheet'))), h('span', { class: 'grow' }),
      h('span', { class: 'note' }, `Diperbarui ${when(Date.now())}`)),
    h('div', { class: 'kpis' },
      kpi(t.accounts, 'Akun'), kpi(t.new_7d, 'Akun baru (7 hari)'), kpi(t.signed_in_7d, 'Login (7 hari)'),
      kpi(t.plays_7d, 'Permainan (7 hari)'), kpi(t.players_7d, 'Pemain (7 hari)'), kpi(t.avg_stars_7d ?? '—', 'Rata ★ (7 hari)'),
      kpi(`${t.donate_taps_7d} / ${t.donate_taps}`, 'Ketuk dukungan (7 hari / total)')),
    h('section', { class: 'panel' }, h('h2', {}, '30 hari terakhir'), chart(data.daily)),
    h('div', { class: 'tabs-row', role: 'group' }, Object.entries(views).map(([id, [label]]) =>
      h('button', { class: `chip${id === view ? ' on' : ''}`, 'aria-pressed': String(id === view), onclick: () => { view = id; render(data) } }, label))),
    h('section', { class: 'panel' }, h('h2', {}, title), body))
}

async function signInGate(message) {
  const { googleClientId } = await fetch('/api/config').then(r => r.json()).catch(() => ({}))
  const slot = h('div', { class: 'gsi' })
  $dash.replaceChildren(h('section', { class: 'panel gate' }, h('img', { src: 'brand/childplay-logo-icon.svg', alt: '', width: 64 }),
    h('h2', {}, 'Smart Worksheet · Analytics'), h('p', {}, message), slot))
  if (!googleClientId) return slot.append(h('p', { class: 'note' }, 'Masuk dengan Google belum disiapkan.'))
  const script = h('script', { src: 'https://accounts.google.com/gsi/client', async: true })
  script.onload = () => {
    google.accounts.id.initialize({
      client_id: googleClientId,
      callback: async ({ credential }) => {
        await fetch('/api/auth', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ credential }) })
        load()
      },
    })
    google.accounts.id.renderButton(slot, { theme: 'outline', size: 'large', shape: 'pill' })
  }
  document.head.append(script)
}

async function load() {
  const res = await fetch('/api/analytics').catch(() => null)
  if (!res) return signInGate('Tidak bisa terhubung ke server.')
  if (res.status === 401) return signInGate('Masuk dengan akun pemilik.')
  if (res.status === 403) return signInGate('Akun ini bukan admin. Masuk dengan akun pemilik.')
  render(await res.json())
}
load()
