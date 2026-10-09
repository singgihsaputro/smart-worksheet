// Smart Worksheet by childplay — the shell: home, routing, account, stars.
// Each worksheet lives in sheets.js and reports back when it's finished.
import { h } from './dom.js'
import { GROUPS, SHEETS } from './sheets.js'
import { sfx } from './sfx.js'

const $app = document.getElementById('app')

// ── Little helpers ──────────────────────────────────────────────────────────

// Browser storage can be missing (private mode); the app works without it.
const store = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem(`sw.${key}`)) ?? fallback } catch { return fallback } },
  set(key, value) { try { localStorage.setItem(`sw.${key}`, JSON.stringify(value)) } catch { /* private mode */ } },
}

async function api(method, path, data) {
  const res = await fetch(path, {
    method, credentials: 'same-origin',
    headers: data ? { 'content-type': 'application/json' } : {},
    body: data ? JSON.stringify(data) : undefined,
  })
  if (!res.ok) throw Object.assign(new Error(`${path}: ${res.status}`), { status: res.status })
  return res.json()
}

const device = store.get('device', null) ?? (() => { const id = crypto.randomUUID(); store.set('device', id); return id })()
const beacon = (path, data) => {
  try { navigator.sendBeacon(path, new Blob([JSON.stringify(data)], { type: 'application/json' })) } catch { /* never block a child */ }
}

const iphone = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
const homeScreenApp = iphone && (matchMedia('(display-mode: standalone)').matches || navigator.standalone === true)

// No pinch-zoom: little fingers pinch by accident while dragging.
document.addEventListener('gesturestart', e => e.preventDefault())
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {})

// ── Stars: best per worksheet, per account on this device, synced when signed in ─

let user = null
let clientId = null
let owner = 'guest'
let best = {}
const useAccount = email => { owner = email ?? 'guest'; best = store.get(`stars:${owner}`, {}) }
useAccount(null)
const totalStars = () => Object.values(best).reduce((a, b) => a + b, 0)

function record(sheet, stars) {
  if (stars <= (best[sheet] ?? 0)) return
  best[sheet] = stars
  store.set(`stars:${owner}`, best)
  if (user) api('PUT', '/api/progress', { stars: { [sheet]: stars } }).catch(() => { /* kept locally; sent with the next sign-in */ })
}

/** Takes on the account's stars, plus anything this device earned for it offline. */
function adopt(data) {
  user = data.user
  store.set('account', user)
  useAccount(user.email.toLowerCase())
  for (const [sheet, n] of Object.entries(data.stars ?? {})) if (n > (best[sheet] ?? 0)) best[sheet] = n
  store.set(`stars:${owner}`, best)
  if (Object.keys(best).length) api('PUT', '/api/progress', { stars: best }).catch(() => {})
}

// ── Sign in with Google ─────────────────────────────────────────────────────

let gis
function loadGoogle() {
  gis ??= new Promise((resolve, reject) => {
    const script = h('script', { src: 'https://accounts.google.com/gsi/client', async: true })
    script.onload = () => {
      google.accounts.id.initialize({ client_id: clientId, callback: signedIn, ux_mode: 'popup', auto_select: false })
      resolve()
    }
    script.onerror = () => { gis = null; reject(new Error('gsi')) }
    document.head.append(script)
  })
  return gis
}

function googleButton() {
  if (!clientId) return h('p', { class: 'note' }, 'Masuk dengan Google belum disiapkan.')
  if (homeScreenApp) return safariSignIn()
  const slot = h('div', { class: 'gsi' })
  loadGoogle()
    .then(() => google.accounts.id.renderButton(slot, { theme: 'outline', size: 'large', shape: 'pill', text: 'signin_with', locale: 'id' }))
    .catch(() => slot.replaceChildren(h('p', { class: 'note' }, 'Tidak bisa memuat Google. Periksa internet lalu coba lagi.')))
  return slot
}

async function signedIn({ credential }) {
  try {
    adopt(await api('POST', '/api/auth', { credential }))
    dialog.close()
    route()
  } catch {
    sheetDialog(h('p', {}, 'Gagal masuk. Coba lagi ya.'))
  }
}

/**
 * On an iPhone home screen Google's popup opens in Safari and never reports
 * back, so the sign-in happens on Google's own page in Safari, which posts to
 * /api/auth with a random code; the app then trades the code for its session
 * at /api/handoff. The code is kept in storage: iOS may restart the app meanwhile.
 */
function safariSignIn() {
  const status = h('p', { class: 'note', 'aria-live': 'polite' })
  return h('div', { class: 'gsi' }, h('button', {
    class: 'btn',
    onclick() {
      const code = crypto.randomUUID()
      store.set('handoff', { code, until: Date.now() + 10 * 60 * 1000 })
      window.open(`https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
        client_id: clientId, redirect_uri: `${location.origin}/api/auth`, response_type: 'id_token',
        response_mode: 'form_post', scope: 'openid email profile', state: code, nonce: code, prompt: 'select_account',
      })}`, '_blank')
      status.textContent = 'Selesaikan masuk di Safari, lalu kembali ke sini.'
      awaitHandoff()
    },
  }, 'Masuk dengan Google'), status)
}

let polling
async function checkHandoff() {
  const pending = store.get('handoff')
  if (!pending || user || Date.now() > pending.until) return clearInterval(polling)
  if (document.hidden) return
  try {
    const data = await api('POST', '/api/handoff', { id: pending.code })
    if (!data.user) return
    store.set('handoff', null)
    clearInterval(polling)
    adopt(data)
    dialog.close()
    route()
  } catch { /* offline for a moment */ }
}
function awaitHandoff() {
  clearInterval(polling)
  polling = setInterval(checkHandoff, 2000)
  checkHandoff()
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) checkHandoff() })

/** Asks once more, then deletes the account and all its data (see /privacy). */
function deleteAccount() {
  sheetDialog(h('div', { class: 'big-emoji' }, '🗑️'), h('h2', {}, 'Hapus akun?'),
    h('p', {}, `Akun ${user.email} dan semua bintangnya akan dihapus permanen dari Smart Worksheet. Ini tidak bisa dibatalkan.`),
    h('button', {
      class: 'btn danger',
      async onclick(e) {
        e.currentTarget.disabled = true
        try {
          await api('DELETE', '/api/me')
          store.set(`stars:${owner}`, null)
          user = null
          store.set('account', null)
          useAccount(null)
          sheetDialog(h('div', { class: 'big-emoji' }, '👋'), h('h2', {}, 'Akun sudah dihapus'), h('p', {}, 'Semua data akun ini sudah dihapus.'))
          route()
        } catch {
          sheetDialog(h('p', {}, 'Gagal menghapus akun. Coba lagi nanti.'))
        }
      },
    }, 'Ya, hapus akun'))
}

async function signOut() {
  try { await api('DELETE', '/api/auth') } catch { /* the cookie expires on its own */ }
  window.google?.accounts.id.disableAutoSelect()
  user = null
  store.set('account', null)
  useAccount(null)
  dialog.close()
  route()
}

// ── Dialog ──────────────────────────────────────────────────────────────────

const dialog = document.body.appendChild(h('dialog', { class: 'sheet' }))
dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close() })
function sheetDialog(...children) {
  dialog.replaceChildren(h('div', { class: 'sheet-body' }, ...children,
    h('button', { class: 'btn ghost', onclick: () => dialog.close() }, 'Tutup')))
  if (!dialog.open) dialog.showModal()
}

// Level 1 is open to everyone; the others need a signed-in account with enough
// stars. Stars are kept per account (and synced), so each child's progress is theirs.
const groupOf = sheet => GROUPS.find(g => g.id === sheet.group)
const groupOpen = group => group.need === 0 || (!!user && totalStars() >= group.need)
const open = sheet => groupOpen(groupOf(sheet))

/** A signed-in child who needs more stars for this level. */
function starsDialog(sheet) {
  const group = groupOf(sheet)
  const missing = group.need - totalStars()
  sheetDialog(h('div', { class: 'big-emoji' }, '⭐'), h('h2', {}, `Level "${group.title}"`),
    h('p', {}, `Kumpulkan ${missing} bintang lagi untuk membuka level ini (butuh ${group.need} ⭐, kamu punya ${totalStars()} ⭐).`),
    h('p', { class: 'note' }, 'Main lagi lembar yang sudah terbuka untuk dapat 3 bintang!'))
}
const lockedDialog = sheet => (user ? starsDialog(sheet) : accountDialog(sheet))

function accountDialog(locked) {
  if (user) {
    return sheetDialog(h('div', { class: 'big-emoji' }, '🙌'), h('h2', {}, `Halo, ${user.name ?? 'teman'}!`),
      h('p', {}, `Masuk sebagai ${user.email}. Semua lembar kerja terbuka, dan bintang tersimpan di akunmu di perangkat mana pun.`),
      h('button', { class: 'btn ghost', onclick: signOut }, 'Keluar'),
      h('button', { class: 'link-btn', onclick: deleteAccount }, 'Hapus akun & datanya'))
  }
  const intro = locked
    ? [h('div', { class: 'big-emoji' }, '🔒'), h('h2', {}, `Buka "${locked.title}"`),
       h('p', {}, `Level "${GROUPS[0].title}" bisa dimainkan langsung. Masuk dengan Google untuk membuka level berikutnya dengan bintang yang kamu kumpulkan. Bintang tersimpan di akunmu, di semua perangkat.`)]
    : [h('div', { class: 'big-emoji' }, '⭐'), h('h2', {}, 'Buka semua lembar kerja'),
       h('p', {}, 'Masuk dengan Google untuk membuka semua lembar kerja dan menyimpan bintang di HP, tablet, atau laptop lain.')]
  sheetDialog(...intro, googleButton(),
    h('p', { class: 'note' }, 'Minta orang tua untuk masuk ya. ', h('a', { href: '/privacy' }, 'Kebijakan Privasi')))
}

// ── Support (donations by QRIS) ─────────────────────────────────────────────
// The QRIS is Ayok Ngaji's: same maker, so payment apps show that name.

function donateCard() {
  return h('section', { class: 'donate' },
    h('div', { class: 'big-emoji', 'aria-hidden': 'true' }, '💝'),
    h('div', {},
      h('h2', {}, 'Dukung Smart Worksheet'),
      h('p', {}, 'Smart Worksheet gratis dan tanpa iklan. Dukungan dari Ayah Bunda membantu biaya server, membuat lembar kerja baru, dan menjaganya tetap aman untuk anak.'),
      h('button', { class: 'btn donate-btn', onclick: showQris }, 'Beri dukungan 💝')))
}

/** The QRIS, with a way to save it: the phone showing it can't also scan it. */
function showQris() {
  beacon('/api/event', { type: 'donate_tap' })
  sheetDialog(
    h('h2', {}, 'Dukung lewat QRIS'),
    h('img', { class: 'qris', src: 'qris.jpg', alt: 'QRIS dukungan Smart Worksheet', width: 874, height: 1240 }),
    h('p', { class: 'note' }, 'Pindai dengan aplikasi bank atau e-wallet apa pun (GoPay, OVO, DANA, ShopeePay, m-banking). Pakai HP ini? Simpan gambarnya, lalu pilih dari galeri di aplikasimu.'),
    h('p', { class: 'note' }, 'Nama penerima tertulis "Ayok Ngaji" — pembuat yang sama dengan Smart Worksheet.'),
    h('a', { class: 'btn', href: 'qris.jpg', download: 'QRIS-Smart-Worksheet.jpg' }, '⬇ Simpan gambar QR'),
    h('p', {}, 'Berapa pun sangat membantu. Terima kasih! 🙏'))
}

// ── Screens ─────────────────────────────────────────────────────────────────

let leave = () => {}

function topBar(back) {
  return h('header', { class: 'top' },
    back ? h('a', { class: 'round', href: '#/', 'aria-label': 'Kembali' }, '←')
      : h('a', { class: 'brand', href: '#/' }, h('img', { src: 'brand/childplay-logo-icon.svg', alt: '' }),
          h('span', {}, h('b', {}, 'Smart Worksheet'), h('small', {}, 'by childplay'))),
    h('span', { class: 'grow' }),
    h('span', { class: 'pill stars', 'aria-label': `${totalStars()} bintang` }, `⭐ ${totalStars()}`),
    h('button', { class: 'round avatar', onclick: accountDialog, 'aria-label': user ? 'Akun' : 'Masuk' },
      user?.picture ? h('img', { src: user.picture, alt: '', referrerpolicy: 'no-referrer' }) : user ? (user.name ?? user.email)[0].toUpperCase() : '👤'))
}

function homeScreen() {
  $app.replaceChildren(h('main', { class: 'home' },
    topBar(false),
    h('section', { class: 'hero' },
      h('h1', {}, 'Mau belajar apa hari ini?'),
      h('p', {}, 'Belajar sambil bermain: geser, cocokkan, dengarkan, dan warnai!')),
    GROUPS.map((group, i) => h('section', { class: `level${groupOpen(group) ? '' : ' closed'}` },
      h('header', { class: 'level-head' },
        h('h2', {}, h('span', { class: 'level-n' }, `Level ${i + 1}`), ` ${group.emoji} ${group.title}`),
        groupOpen(group) ? h('span', { class: 'level-state open' }, group.need ? '✓ Terbuka' : 'Gratis')
          : !user ? h('span', { class: 'level-state' }, '🔒 Masuk untuk membuka')
            : h('span', { class: 'level-state' }, `🔒 ${totalStars()} / ${group.need} ⭐`)),
      h('div', { class: 'cards' }, SHEETS.filter(sheet => sheet.group === group.id).map(sheet => h('a', {
        class: `card tint-${sheet.color}${open(sheet) ? '' : ' locked'}`, href: `#/sheet/${sheet.id}`,
        onclick: e => { if (!open(sheet)) { e.preventDefault(); lockedDialog(sheet) } },
      },
        h('span', { class: 'card-art', 'aria-hidden': 'true' }, sheet.emoji, open(sheet) ? null : h('i', { class: 'lock' }, '🔒')),
        h('b', {}, sheet.title),
        h('small', {}, sheet.blurb),
        open(sheet)
          ? h('span', { class: 'card-stars', 'aria-label': `${best[sheet.id] ?? 0} dari 3 bintang` },
              [1, 2, 3].map(n => h('i', { class: n <= (best[sheet.id] ?? 0) ? 'on' : '' }, '★')))
          : h('span', { class: 'card-lock' }, user ? `Butuh ${group.need} ⭐` : 'Masuk untuk membuka')))))),
    donateCard(),
    h('footer', { class: 'foot' },
      h('img', { src: 'brand/childplay-logo-horizontal.svg', alt: 'childplay — belajar sambil bermain' }),
      h('p', {}, 'Tanpa iklan. Suara hewan: rekaman CC0 dari BigSoundBank & Wikimedia Commons.'))))
  return () => {}
}

/** One worksheet: its own play area, then stars when it reports it's done. */
function sheetScreen(sheet) {
  const area = h('div', { class: 'play' })
  $app.replaceChildren(h('main', { class: `sheet-screen tint-${sheet.color}` },
    topBar(true),
    h('section', { class: 'sheet-head' }, h('span', { class: 'sheet-emoji', 'aria-hidden': 'true' }, sheet.emoji),
      h('div', {}, h('h1', {}, sheet.title), h('p', {}, sheet.how))),
    area))
  let stop = sheet.start(area, ({ mistakes }) => finish(sheet, mistakes, area))
  return () => { stop?.(); stop = null }
}

function finish(sheet, mistakes, area) {
  const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1
  record(sheet.id, stars)
  const pill = document.querySelector('.pill.stars')
  if (pill) pill.textContent = `⭐ ${totalStars()}`
  beacon('/api/play', { sheet: sheet.id, stars, mistakes, device })
  for (let i = 0; i < stars; i++) sfx.star(i, 0.25 + i * 0.22)
  sfx.win(0.95)
  area.replaceChildren(h('div', { class: 'done' },
    h('div', { class: 'confetti', 'aria-hidden': 'true' }, Array.from({ length: 24 }, (_, i) => h('i', { style: `--i:${i}` }))),
    h('div', { class: 'done-stars', 'aria-label': `${stars} bintang` }, [1, 2, 3].map(n => h('span', { class: n <= stars ? 'on' : '', style: `--n:${n}` }, '★'))),
    h('h2', {}, stars === 3 ? 'Hebat sekali! 🎉' : stars === 2 ? 'Bagus! 👏' : 'Kamu berhasil! 💪'),
    h('p', {}, mistakes ? `Selesai dengan ${mistakes} kali coba lagi.` : 'Semuanya benar tanpa salah!'),
    h('div', { class: 'row' },
      h('button', { class: 'btn', onclick: () => route() }, '🔁 Main lagi'),
      h('a', { class: 'btn ghost', href: '#/' }, '🏠 Lembar lain'))))
}

/** Where Google's full-page sign-in (iPhone home-screen app, in Safari) lands. */
function signinScreen(result) {
  if (homeScreenApp) { location.replace('#/'); awaitHandoff(); return () => {} }
  $app.replaceChildren(h('main', { class: 'home' }, topBar(true),
    h('section', { class: 'done' }, h('div', { class: 'big-emoji' }, result === 'done' ? '✅' : '😕'),
      h('h2', {}, result === 'done' ? 'Berhasil masuk!' : 'Gagal masuk'),
      h('p', {}, result === 'done' ? 'Kembali ke aplikasi Smart Worksheet di layar utama.' : 'Coba lagi dari aplikasi ya.'))))
  return () => {}
}

function route() {
  leave()
  leave = () => {}
  const [, page, id] = location.hash.split('/')
  const sheet = page === 'sheet' && SHEETS.find(s => s.id === id)
  if (sheet && !open(sheet)) {
    // Until we know whether someone is signed in, wait rather than bounce them.
    if (!accountKnown) { $app.replaceChildren(h('p', { class: 'loading' }, h('img', { src: 'brand/childplay-logo-icon.svg', alt: '', width: 72, height: 72 }))); return }
    location.replace('#/')
    return lockedDialog(sheet)
  }
  if (sheet && dialog.open) dialog.close() // a lock message must not follow the child into a worksheet
  leave = sheet ? sheetScreen(sheet) : page === 'signin' ? signinScreen(id) : homeScreen()
  window.scrollTo(0, 0)
}
addEventListener('hashchange', route)

// Every button press gets a soft click (the sheets add their own sounds).
document.addEventListener('click', e => { if (e.target.closest('button, a.btn, a.card')) sfx.tap() }, true)

// ── Start ───────────────────────────────────────────────────────────────────

let accountKnown = false
route()
// The account is optional: offline, the app goes on with the last account on this device.
Promise.all([api('GET', '/api/config'), api('GET', '/api/me')])
  .then(([config, me]) => {
    clientId = config.googleClientId ?? null
    // Don't restart a worksheet a child is in the middle of.
    if (me.user) { adopt(me); if (!location.hash.startsWith('#/sheet/')) route() }
  })
  .catch(() => {
    const saved = store.get('account')
    if (saved) { user = saved; useAccount(saved.email.toLowerCase()); route() }
  })
  .finally(() => {
    accountKnown = true
    if (location.hash.startsWith('#/sheet/') && !document.querySelector('.play')) route() // was waiting on a locked sheet
    if (!user && store.get('handoff')) awaitHandoff()
  })
