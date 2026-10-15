// Smart Worksheet by childplay — the shell: home, routing, account, stars.
// Each worksheet lives in sheets.js and reports back when it's finished.
import { h } from './dom.js'
import { ABC, ABC_EN, ANIMALS, COLORS, FRUITS, PLANTS, SHAPES, THINGS, VEHICLES, seeded } from './data.js'
import { lang, nm, setLang, tr } from './i18n.js'
import { GROUPS, SHEETS, colorBlob, shapePic } from './sheets.js'
import { sfx } from './sfx.js'
import { numberWords, say } from './voice.js'

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

// Every sheet has levels (stages); stars are kept per level under "<sheet>-<level>".
// Level 1 also counts stars saved before sheets had levels, under the sheet's own id.
const levelKey = (sheet, k) => `${sheet.id}-${k}`
const starsOf = (sheet, k) => Math.max(best[levelKey(sheet, k)] ?? 0, k === 1 ? best[sheet.id] ?? 0 : 0)
const levels = sheet => Array.from({ length: sheet.stages }, (_, i) => starsOf(sheet, i + 1))
const sheetStars = sheet => levels(sheet).reduce((a, b) => a + b, 0)
const levelsDone = sheet => levels(sheet).filter(Boolean).length
const levelOpen = (sheet, k) => k === 1 || starsOf(sheet, k - 1) > 0
const totalStars = () => SHEETS.reduce((n, sheet) => n + sheetStars(sheet), 0)
const title = sheet => tr(...sheet.title)

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
  if (!clientId) return h('p', { class: 'note' }, tr('Masuk dengan Google belum disiapkan.', 'Sign-in with Google is not set up yet.'))
  if (homeScreenApp) return safariSignIn()
  const slot = h('div', { class: 'gsi' })
  loadGoogle()
    .then(() => google.accounts.id.renderButton(slot, { theme: 'outline', size: 'large', shape: 'pill', text: 'signin_with', locale: lang }))
    .catch(() => slot.replaceChildren(h('p', { class: 'note' }, tr('Tidak bisa memuat Google. Periksa internet lalu coba lagi.', "Couldn't load Google. Check the internet and try again."))))
  return slot
}

async function signedIn({ credential }) {
  try {
    adopt(await api('POST', '/api/auth', { credential }))
    dialog.close()
    route()
  } catch {
    sheetDialog(h('p', {}, tr('Gagal masuk. Coba lagi ya.', "Couldn't sign in. Please try again.")))
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
      status.textContent = tr('Selesaikan masuk di Safari, lalu kembali ke sini.', 'Finish signing in in Safari, then come back here.')
      awaitHandoff()
    },
  }, tr('Masuk dengan Google', 'Sign in with Google')), status)
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
  sheetDialog(h('div', { class: 'big-emoji' }, '🗑️'), h('h2', {}, tr('Hapus akun?', 'Delete account?')),
    h('p', {}, tr(`Akun ${user.email} dan semua bintangnya akan dihapus permanen dari Smart Worksheet. Ini tidak bisa dibatalkan.`,
      `The account ${user.email} and all its stars will be permanently deleted from Smart Worksheet. This can't be undone.`)),
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
          sheetDialog(h('div', { class: 'big-emoji' }, '👋'), h('h2', {}, tr('Akun sudah dihapus', 'Account deleted')), h('p', {}, tr('Semua data akun ini sudah dihapus.', "All of this account's data has been deleted.")))
          route()
        } catch {
          sheetDialog(h('p', {}, tr('Gagal menghapus akun. Coba lagi nanti.', "Couldn't delete the account. Please try again later.")))
        }
      },
    }, tr('Ya, hapus akun', 'Yes, delete it')))
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
    h('button', { class: 'btn ghost', onclick: () => dialog.close() }, tr('Tutup', 'Close'))))
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
  sheetDialog(h('div', { class: 'big-emoji' }, '⭐'), h('h2', {}, `"${tr(...group.title)}"`),
    h('p', {}, tr(`Kumpulkan ${missing} bintang lagi untuk membuka bagian ini (butuh ${group.need} ⭐, kamu punya ${totalStars()} ⭐).`,
      `Collect ${missing} more stars to open this part (it needs ${group.need} ⭐, you have ${totalStars()} ⭐).`)),
    h('p', { class: 'note' }, tr('Mainkan level-level yang sudah terbuka untuk mengumpulkan bintang!', 'Play the open levels to collect more stars!')))
}
const lockedDialog = sheet => (user ? starsDialog(sheet) : accountDialog(sheet))

function accountDialog(locked) {
  if (user) {
    return sheetDialog(h('div', { class: 'big-emoji' }, '🙌'), h('h2', {}, `${tr('Halo', 'Hi')}, ${user.name ?? tr('teman', 'friend')}!`),
      h('p', {}, tr(`Masuk sebagai ${user.email}. Bintang tersimpan di akunmu, di perangkat mana pun.`, `Signed in as ${user.email}. Your stars are saved to your account, on any device.`)),
      h('button', { class: 'btn ghost', onclick: signOut }, tr('Keluar', 'Sign out')),
      h('button', { class: 'link-btn', onclick: deleteAccount }, tr('Hapus akun & datanya', 'Delete account & data')))
  }
  const intro = locked
    ? [h('div', { class: 'big-emoji' }, '🔒'), h('h2', {}, `${tr('Buka', 'Open')} "${title(locked)}"`),
       h('p', {}, tr(`"${tr(...GROUPS[0].title)}" bisa dimainkan langsung. Masuk dengan Google untuk membuka bagian berikutnya dengan bintang yang kamu kumpulkan. Bintang tersimpan di akunmu, di semua perangkat.`,
         `"${tr(...GROUPS[0].title)}" is open to everyone. Sign in with Google to open the next parts with the stars you collect. Stars are saved to your account, on every device.`))]
    : [h('div', { class: 'big-emoji' }, '⭐'), h('h2', {}, tr('Buka semua lembar kerja', 'Open every worksheet')),
       h('p', {}, tr('Masuk dengan Google untuk membuka semua lembar kerja dan menyimpan bintang di HP, tablet, atau laptop lain.', 'Sign in with Google to open every worksheet and keep your stars on other phones, tablets and laptops.'))]
  sheetDialog(...intro, googleButton(),
    h('p', { class: 'note' }, tr('Minta orang tua untuk masuk ya. ', 'Ask a parent to sign in. '), h('a', { href: '/privacy' }, tr('Kebijakan Privasi', 'Privacy Policy'))))
}

// ── Support (donations by QRIS) ─────────────────────────────────────────────
// The QRIS is Ayok Ngaji's: same maker, so payment apps show that name.

function donateCard() {
  return h('section', { class: 'donate' },
    h('div', { class: 'big-emoji', 'aria-hidden': 'true' }, '💝'),
    h('div', {},
      h('h2', {}, tr('Dukung Smart Worksheet', 'Support Smart Worksheet')),
      h('p', {}, tr('Smart Worksheet gratis dan tanpa iklan. Dukungan dari Ayah Bunda membantu biaya server, membuat lembar kerja baru, dan menjaganya tetap aman untuk anak.',
        'Smart Worksheet is free and has no ads. Your support pays for the server, new worksheets, and keeping it safe for children.')),
      h('button', { class: 'btn donate-btn', onclick: showQris }, tr('Beri dukungan 💝', 'Give support 💝'))))
}

/** The QRIS, with a way to save it: the phone showing it can't also scan it. */
function showQris() {
  beacon('/api/event', { type: 'donate_tap' })
  sheetDialog(
    h('h2', {}, tr('Dukung lewat QRIS', 'Support via QRIS')),
    h('img', { class: 'qris', src: 'qris.jpg', alt: tr('QRIS dukungan Smart Worksheet', 'Smart Worksheet support QRIS'), width: 874, height: 1240 }),
    h('p', { class: 'note' }, tr('Pindai dengan aplikasi bank atau e-wallet apa pun (GoPay, OVO, DANA, ShopeePay, m-banking). Pakai HP ini? Simpan gambarnya, lalu pilih dari galeri di aplikasimu.',
      'Scan with any Indonesian bank or e-wallet app (GoPay, OVO, DANA, ShopeePay, m-banking). Using this phone? Save the image, then pick it from your gallery in the app.')),
    h('p', { class: 'note' }, tr('Nama penerima tertulis "Ayok Ngaji" — pembuat yang sama dengan Smart Worksheet.', 'The recipient shows as "Ayok Ngaji", made by the same maker as Smart Worksheet.')),
    h('a', { class: 'btn', href: 'qris.jpg', download: 'QRIS-Smart-Worksheet.jpg' }, tr('⬇ Simpan gambar QR', '⬇ Save QR image')),
    h('p', {}, tr('Berapa pun sangat membantu. Terima kasih! 🙏', 'Any amount helps. Thank you! 🙏')))
}

/** 1–5 stars and an optional note for the maker, sent to /api/rating. */
function ratingForm() {
  let chosen = 0
  const stars = h('div', { class: 'rate-stars', role: 'group', 'aria-label': tr('Nilai', 'Rating') }, [1, 2, 3, 4, 5].map(n =>
    h('button', { class: 'rate-star', 'aria-label': `${n} ${tr('bintang', 'stars')}`, 'aria-pressed': 'false', onclick: () => pick(n) }, '★')))
  const note = h('textarea', { rows: 4, maxlength: 1000, 'aria-label': tr('Ulasan', 'Review'),
    placeholder: tr('Ceritakan pengalaman anak, atau lembar kerja apa yang ingin ditambah (opsional). Jangan tulis data pribadi ya.',
      "Tell us how your child found it, or which worksheets you'd like next (optional). Please don't include personal details.") })
  const send = h('button', { class: 'btn', disabled: true, onclick: submit }, tr('Kirim ulasan', 'Send review'))
  const status = h('p', { class: 'note', 'aria-live': 'polite' })
  function pick(n) {
    chosen = n
    ;[...stars.children].forEach((b, i) => { b.classList.toggle('on', i < n); b.setAttribute('aria-pressed', String(i < n)) })
    send.disabled = false
  }
  async function submit() {
    send.disabled = true
    try {
      await api('POST', '/api/rating', { stars: chosen, text: note.value })
      note.value = ''
      // Only a happy parent hears about donating; a low rating just gets thanks.
      status.textContent = chosen >= 4 ? tr('Terima kasih! Kalau berkenan, dukung juga lewat QRIS di atas 💝', 'Thank you! If you like, you can also support us with the QRIS above 💝')
        : tr('Terima kasih! Masukan Ayah Bunda kami pakai untuk memperbaiki Smart Worksheet 🙏', 'Thank you! We use your feedback to make Smart Worksheet better 🙏')
    } catch {
      status.textContent = tr('Gagal mengirim. Periksa internet lalu coba lagi.', "Couldn't send. Check the internet and try again.")
      send.disabled = false
    }
  }
  return h('div', { class: 'rate' }, stars, note, send, status)
}

// ── Screens ─────────────────────────────────────────────────────────────────

let leave = () => {}
const $nav = document.body.appendChild(h('nav', { class: 'tabs' }))

function tabs(active) {
  return [['main', '#/', '🧩', tr('Main', 'Play')], ['belajar', '#/belajar', '📚', tr('Belajar', 'Learn')], ['dukung', '#/dukung', '💝', tr('Dukung', 'Support')]]
    .map(([id, href, icon, label]) => h('a', { class: `tab${id === active ? ' on' : ''}`, href, 'aria-current': id === active ? 'page' : null },
      h('span', { class: 'tab-icon', 'aria-hidden': 'true' }, icon), h('span', {}, label)))
}

/** The page's fixed footer and language follow the switcher too. */
function staticText() {
  document.documentElement.lang = lang
  document.querySelector('.legal-links')?.replaceChildren(
    h('a', { href: '/privacy' }, tr('Kebijakan Privasi', 'Privacy Policy')), ' · ',
    h('a', { href: '/terms' }, tr('Syarat & Ketentuan', 'Terms')), ' · childplay')
}

function switchLanguage() {
  setLang(lang === 'en' ? 'id' : 'en')
  staticText()
  route()
}

/** `back`: where the arrow goes; without one, the brand shows instead. */
function topBar(back) {
  return h('header', { class: 'top' },
    back ? h('a', { class: 'round', href: back, 'aria-label': tr('Kembali', 'Back') }, '←')
      : h('a', { class: 'brand', href: '#/' }, h('img', { src: 'brand/childplay-logo-icon.svg', alt: '' }),
          h('span', {}, h('b', {}, 'Smart Worksheet'), h('small', {}, 'by childplay'))),
    h('span', { class: 'grow' }),
    h('button', { class: 'pill lang', onclick: switchLanguage, 'aria-label': tr('Ganti bahasa ke English', 'Switch language to Indonesian') }, lang === 'en' ? '🇬🇧 EN' : '🇮🇩 ID'),
    h('span', { class: 'pill stars', 'aria-label': `${totalStars()} ${tr('bintang', 'stars')}` }, `⭐ ${totalStars()}`),
    h('button', { class: 'round avatar', onclick: () => accountDialog(), 'aria-label': user ? tr('Akun', 'Account') : tr('Masuk', 'Sign in') },
      user?.picture ? h('img', { src: user.picture, alt: '', referrerpolicy: 'no-referrer' }) : user ? (user.name ?? user.email)[0].toUpperCase() : '👤'))
}

function homeScreen() {
  $app.replaceChildren(h('main', { class: 'home' },
    topBar(),
    h('section', { class: 'hero' },
      h('h1', {}, tr('Mau belajar apa hari ini?', 'What shall we learn today?')),
      h('p', {}, tr('Belajar sambil bermain: geser, cocokkan, dengarkan, dan warnai!', 'Learn through play: drag, match, listen and color!'))),
    GROUPS.map((group, i) => h('section', { class: `level${groupOpen(group) ? '' : ' closed'}` },
      h('header', { class: 'level-head' },
        h('h2', {}, h('span', { class: 'level-n' }, `${tr('Bagian', 'Part')} ${i + 1}`), ` ${group.emoji} ${tr(...group.title)}`),
        groupOpen(group) ? h('span', { class: 'level-state open' }, group.need ? tr('✓ Terbuka', '✓ Open') : tr('Gratis', 'Free'))
          : !user ? h('span', { class: 'level-state' }, tr('🔒 Masuk untuk membuka', '🔒 Sign in to open'))
            : h('span', { class: 'level-state' }, `🔒 ${totalStars()} / ${group.need} ⭐`)),
      h('div', { class: 'cards' }, SHEETS.filter(sheet => sheet.group === group.id).map(sheet => h('a', {
        class: `card tint-${sheet.color}${open(sheet) ? '' : ' locked'}`, href: `#/sheet/${sheet.id}`,
        onclick: e => { if (!open(sheet)) { e.preventDefault(); lockedDialog(sheet) } },
      },
        h('span', { class: 'card-art', 'aria-hidden': 'true' }, sheet.emoji, open(sheet) ? null : h('i', { class: 'lock' }, '🔒')),
        h('b', {}, title(sheet)),
        h('small', {}, tr(...sheet.blurb)),
        open(sheet)
          ? h('span', { class: 'card-progress', 'aria-label': tr(`${levelsDone(sheet)} dari ${sheet.stages} level selesai`, `${levelsDone(sheet)} of ${sheet.stages} levels done`) },
              h('span', { class: 'bar' }, h('i', { style: `--p:${levelsDone(sheet) / sheet.stages}` })), `${levelsDone(sheet)}/${sheet.stages}`)
          : h('span', { class: 'card-lock' }, user ? tr(`Butuh ${group.need} ⭐`, `Needs ${group.need} ⭐`) : tr('Masuk untuk membuka', 'Sign in to open'))))))),
    h('footer', { class: 'foot' },
      h('img', { src: 'brand/childplay-logo-horizontal.svg', alt: tr('childplay — belajar sambil bermain', 'childplay — learn through play') }),
      h('p', {}, tr('Tanpa iklan. Suara hewan: rekaman CC0 dari BigSoundBank & Wikimedia Commons.', 'No ads. Animal sounds: CC0 recordings from BigSoundBank & Wikimedia Commons.')))))
  return () => {}
}

// ── Level map: each sheet's levels as a winding path, like a game's world map ─

function mapScreen(sheet) {
  const n = sheet.stages
  const next = levels(sheet).findIndex(stars => !stars) + 1 || 0 // 0: all done
  const ROW = 104, TOP = 46, WIDTH = 300
  const OFF = [0, -64, 0, 64]
  const points = Array.from({ length: n }, (_, i) => [WIDTH / 2 + OFF[i % 4], TOP + i * ROW])
  const path = points.map(([x, y], i) => (i ? `C ${points[i - 1][0]} ${points[i - 1][1] + ROW / 2} ${x} ${y - ROW / 2} ${x} ${y}` : `M ${x} ${y}`)).join(' ')
  const route = h('div', { class: 'route', style: `width:${WIDTH}px;height:${TOP * 2 + (n - 1) * ROW + 20}px` })
  route.innerHTML = `<svg class="route-line" viewBox="0 0 ${WIDTH} ${TOP * 2 + (n - 1) * ROW + 20}" aria-hidden="true"><path d="${path}"/></svg>`
  const status = h('p', { class: 'route-status', 'aria-live': 'polite' })
  route.append(...points.map(([x, y], i) => {
    const k = i + 1, stars = starsOf(sheet, k), opened = levelOpen(sheet, k)
    const cls = `node${stars ? ' done' : ''}${k === next ? ' next' : ''}${opened ? '' : ' locked'}`
    const body = [h('span', { class: 'dot' }, opened ? String(k) : '🔒'),
      h('span', { class: 'st', 'aria-hidden': 'true' }, [1, 2, 3].map(j => h('i', { class: j <= stars ? 'on' : '' }, '★')))]
    const style = `left:${x - 37}px;top:${y - 37}px`
    return opened
      ? h('a', { class: cls, style, href: `#/sheet/${sheet.id}/${k}`, 'aria-label': `Level ${k}, ${stars} ${tr('bintang', 'stars')}` }, body)
      : h('button', { class: cls, style, 'aria-label': `Level ${k} ${tr('terkunci', 'locked')}`,
          onclick: e => { sfx.tryAgain(); e.currentTarget.classList.remove('nope'); void e.currentTarget.offsetWidth; e.currentTarget.classList.add('nope')
            status.textContent = tr(`Selesaikan level ${k - 1} dulu untuk membuka level ${k}.`, `Finish level ${k - 1} first to open level ${k}.`) } }, body)
  }))
  $app.replaceChildren(h('main', { class: `sheet-screen tint-${sheet.color}` },
    topBar('#/'),
    h('section', { class: 'sheet-head' }, h('span', { class: 'sheet-emoji', 'aria-hidden': 'true' }, sheet.emoji),
      h('div', {}, h('h1', {}, title(sheet)), h('p', {}, tr(...sheet.how)),
        h('p', { class: 'route-sum' }, tr(`${levelsDone(sheet)} dari ${n} level · ⭐ ${sheetStars(sheet)} / ${n * 3}`, `${levelsDone(sheet)} of ${n} levels · ⭐ ${sheetStars(sheet)} / ${n * 3}`)))),
    status, route))
  $app.querySelector('.node.next')?.scrollIntoView({ block: 'center' })
  return () => {}
}

/** One level of a worksheet: its own play area, then stars when it reports it's done. */
function sheetScreen(sheet, k) {
  const area = h('div', { class: 'play' })
  $app.replaceChildren(h('main', { class: `sheet-screen tint-${sheet.color}` },
    topBar(`#/sheet/${sheet.id}`),
    h('section', { class: 'sheet-head' }, h('span', { class: 'sheet-emoji', 'aria-hidden': 'true' }, sheet.emoji),
      h('div', {}, h('h1', {}, `${title(sheet)} · Level ${k}`), h('p', {}, tr(...sheet.how)))),
    area))
  // The same level always gets the same content, whatever the language.
  let stop = sheet.start(area, ({ mistakes }) => finish(sheet, k, mistakes, area), { stage: k, rand: seeded(`${sheet.id}#${k}`) })
  return () => { stop?.(); stop = null }
}

function finish(sheet, k, mistakes, area) {
  const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1
  record(levelKey(sheet, k), stars)
  const pill = document.querySelector('.pill.stars')
  if (pill) pill.textContent = `⭐ ${totalStars()}`
  beacon('/api/play', { sheet: sheet.id, stars, mistakes, device })
  for (let i = 0; i < stars; i++) sfx.star(i, 0.25 + i * 0.22)
  sfx.win(0.95)
  const last = k >= sheet.stages
  area.replaceChildren(h('div', { class: 'done' },
    h('div', { class: 'confetti', 'aria-hidden': 'true' }, Array.from({ length: 24 }, (_, i) => h('i', { style: `--i:${i}` }))),
    h('div', { class: 'done-stars', 'aria-label': `${stars} ${tr('bintang', 'stars')}` }, [1, 2, 3].map(n => h('span', { class: n <= stars ? 'on' : '', style: `--n:${n}` }, '★'))),
    h('h2', {}, stars === 3 ? tr('Hebat sekali! 🎉', 'Amazing! 🎉') : stars === 2 ? tr('Bagus! 👏', 'Great job! 👏') : tr('Kamu berhasil! 💪', 'You did it! 💪')),
    h('p', {}, mistakes ? tr(`Selesai dengan ${mistakes} kali coba lagi.`, `Finished with ${mistakes} ${mistakes === 1 ? 'retry' : 'retries'}.`) : tr('Semuanya benar tanpa salah!', 'All correct, no mistakes!')),
    last ? h('p', { class: 'note' }, tr(`Semua ${sheet.stages} level sudah selesai! 🏆`, `All ${sheet.stages} levels done! 🏆`)) : null,
    h('div', { class: 'row' },
      last ? null : h('a', { class: 'btn', href: `#/sheet/${sheet.id}/${k + 1}` }, tr('Level berikutnya ▶', 'Next level ▶')),
      h('button', { class: `btn${last ? '' : ' ghost'}`, onclick: () => route() }, tr('🔁 Main lagi', '🔁 Play again')),
      h('a', { class: 'btn ghost', href: `#/sheet/${sheet.id}` }, tr('🗺️ Peta level', '🗺️ Level map')))))
}

// ── Belajar: picture cards to look at and listen to (free for everyone) ─────

const big = text => h('b', { class: 'big' }, text)
const pic = (emoji, size = '') => h('span', { class: `emoji learn-emoji ${size}` }, emoji)
const label = text => h('span', { class: 'name' }, text)
const word = n => numberWords(n)[1]
const fives = n => Array.from({ length: Math.ceil(n / 5) }, (_, i) => '⭐'.repeat(Math.min(5, n - i * 5))).join(' ') // easier to count
const named = list => list.map(x => ({ nodes: [pic(x.emoji), label(nm(x))], say: nm(x) }))

/** Adding up to 5 + 5 and taking away from up to 6, with fruit to count. */
function sums() {
  const cards = []
  const fruit = (a, b) => FRUITS[(a * 3 + b) % FRUITS.length].emoji
  for (let a = 1; a <= 5; a++) for (let b = 1; b <= 5; b++) cards.push({
    nodes: [h('span', { class: 'emoji math-art' }, fruit(a, b).repeat(a), ' + ', fruit(a, b).repeat(b)), big(`${a} + ${b} = ?`)],
    answer: `${a} + ${b} = ${a + b}`, say: tr(`${word(a)} tambah ${word(b)} sama dengan ${word(a + b)}`, `${word(a)} plus ${word(b)} equals ${word(a + b)}`),
  })
  for (let a = 2; a <= 6; a++) for (let b = 1; b < a; b++) cards.push({
    nodes: [h('span', { class: 'emoji math-art' }, Array.from({ length: a }, (_, i) => h('span', { class: i >= a - b ? 'gone' : '' }, fruit(a, b)))), big(`${a} − ${b} = ?`)],
    answer: `${a} − ${b} = ${a - b}`, say: tr(`${word(a)} kurang ${word(b)} sama dengan ${word(a - b)}`, `${word(a)} minus ${word(b)} equals ${word(a - b)}`),
  })
  return cards
}

const TOPICS = [
  ['huruf', ['🔤 Huruf', '🔤 Letters'], () => (lang === 'en' ? ABC_EN : ABC).map(([letter, name, emoji]) =>
    ({ nodes: [big(`${letter}${letter.toLowerCase()}`), pic(emoji, 'small'), label(name)], say: `${letter}. ${name}` }))],
  ['angka', ['🔢 Angka', '🔢 Numbers'], () => Array.from({ length: 20 }, (_, i) => ({ nodes: [big(String(i + 1)), h('span', { class: 'emoji dots' }, fives(i + 1)), label(word(i + 1))], say: word(i + 1) }))],
  ['warna', ['🎨 Warna', '🎨 Colors'], () => COLORS.map(c => ({ nodes: [colorBlob(c), label(nm(c))], say: nm(c) }))],
  ['bentuk', ['🔷 Bentuk', '🔷 Shapes'], () => SHAPES.map((s, i) => ({ nodes: [shapePic(s, ['#27847B', '#E9785E', '#F6C344', '#7CCBDD', '#8E6CE0'][i % 5]), label(nm(s))], say: nm(s) }))],
  ['hewan', ['🐾 Hewan', '🐾 Animals'], () => named(ANIMALS)],
  ['tanaman', ['🌳 Tanaman', '🌳 Plants'], () => named(PLANTS)],
  ['buah', ['🍎 Buah', '🍎 Fruit'], () => named(FRUITS)],
  ['benda', ['🧸 Benda', '🧸 Things'], () => named(THINGS)],
  ['kendaraan', ['🚗 Kendaraan', '🚗 Vehicles'], () => named(VEHICLES)],
  ['hitung', ['➕ Berhitung', '➕ Sums'], sums],
]

function learnScreen(topic) {
  const [id, , cards] = TOPICS.find(t => t[0] === topic) ?? TOPICS[0]
  $app.replaceChildren(h('main', { class: 'home' },
    topBar(),
    h('section', { class: 'hero' }, h('h1', {}, tr('Ayo belajar!', "Let's learn!")), h('p', {}, tr('Ketuk kartunya untuk mendengar namanya.', 'Tap a card to hear its name.'))),
    h('nav', { class: 'topics', 'aria-label': tr('Topik', 'Topics') }, TOPICS.map(([t, name]) =>
      h('a', { class: `chip${t === id ? ' on' : ''}`, href: `#/belajar/${t}`, 'aria-current': t === id ? 'page' : null }, tr(...name)))),
    h('div', { class: `learn-grid ${id}` }, cards().map(c => h('button', {
      class: 'learn-card',
      onclick(e) {
        const el = e.currentTarget
        el.classList.remove('on'); void el.offsetWidth; el.classList.add('on')
        if (c.answer) el.querySelector('.big').textContent = c.answer
        say(c.say)
      },
    }, c.nodes)))))
  // The chosen topic stays in view when switching between them.
  $app.querySelector('.topics .on')?.scrollIntoView({ block: 'nearest', inline: 'center' })
  return () => { if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel() }
}

/** For parents: a review and a donation. */
function supportScreen() {
  $app.replaceChildren(h('main', { class: 'home' },
    topBar(),
    h('section', { class: 'hero' },
      h('h1', {}, tr('Untuk Ayah Bunda', 'For Parents')),
      h('p', {}, tr('Beri ulasan, dan bantu kami terus membuat lembar kerja baru.', 'Leave a review, and help us keep making new worksheets.'))),
    donateCard(),
    h('section', { class: 'rate-card' },
      h('h2', {}, tr('🖨️ Lembar kerja untuk dicetak', '🖨️ Printable worksheets')),
      h('p', {}, tr('Mau main tanpa layar? Ada buku mewarnai, busy book, dan gunting-tempel dari childplay untuk dicetak di rumah, beberapa gratis. Setiap pembelian ikut mendukung Smart Worksheet.',
        'Want some screen-free play? childplay has colouring books, busy books and cut-and-paste sheets to print at home, some of them free. Every purchase also supports Smart Worksheet.')),
      h('a', { class: 'btn ghost', href: 'https://lynk.id/singshop', target: '_blank', rel: 'noopener', onclick: () => beacon('/api/event', { type: 'shop_tap' }) }, tr('Lihat di lynk.id ↗', 'See them on lynk.id ↗'))),
    h('section', { class: 'rate-card' },
      h('h2', {}, tr('⭐ Beri ulasan', '⭐ Leave a review')),
      h('p', {}, tr('Bagaimana pengalaman anak memakai Smart Worksheet? Semua masukan kami baca.', 'How does your child find Smart Worksheet? We read every message.')),
      ratingForm())))
  return () => {}
}

/** Where Google's full-page sign-in (iPhone home-screen app, in Safari) lands. */
function signinScreen(result) {
  if (homeScreenApp) { location.replace('#/'); awaitHandoff(); return () => {} }
  $app.replaceChildren(h('main', { class: 'home' }, topBar('#/'),
    h('section', { class: 'done' }, h('div', { class: 'big-emoji' }, result === 'done' ? '✅' : '😕'),
      h('h2', {}, result === 'done' ? tr('Berhasil masuk!', 'Signed in!') : tr('Gagal masuk', "Couldn't sign in")),
      h('p', {}, result === 'done' ? tr('Kembali ke aplikasi Smart Worksheet di layar utama.', 'Go back to the Smart Worksheet app on your home screen.') : tr('Coba lagi dari aplikasi ya.', 'Please try again from the app.')))))
  return () => {}
}

function route() {
  leave()
  leave = () => {}
  const [, page, id, sub] = location.hash.split('/')
  const sheet = page === 'sheet' && SHEETS.find(s => s.id === id)
  const k = sheet && sub ? Math.max(1, Math.min(sheet.stages, Number(sub) || 1)) : 0
  if (sheet && !open(sheet)) {
    // Until we know whether someone is signed in, wait rather than bounce them.
    if (!accountKnown) { $app.replaceChildren(h('p', { class: 'loading' }, h('img', { src: 'brand/childplay-logo-icon.svg', alt: '', width: 72, height: 72 }))); return }
    location.replace('#/')
    return lockedDialog(sheet)
  }
  if (sheet && k && !levelOpen(sheet, k)) return location.replace(`#/sheet/${sheet.id}`)
  if (sheet && dialog.open) dialog.close() // a lock message must not follow the child into a worksheet
  const playing = !!(sheet && k)
  document.body.classList.toggle('has-nav', !playing)
  $nav.replaceChildren(...(playing ? [] : tabs(['belajar', 'dukung'].includes(page) ? page : 'main')))
  leave = playing ? sheetScreen(sheet, k) : sheet ? mapScreen(sheet) : page === 'signin' ? signinScreen(id)
    : page === 'dukung' ? supportScreen() : page === 'belajar' ? learnScreen(id) : homeScreen()
  if (!sheet || k) window.scrollTo(0, 0)
}
addEventListener('hashchange', route)

// Every button press gets a soft click (the sheets add their own sounds).
document.addEventListener('click', e => { if (e.target.closest('button, a.btn, a.card, a.tab, a.node')) sfx.tap() }, true)

// ── Start ───────────────────────────────────────────────────────────────────

let accountKnown = false
staticText()
route()
// The account is optional: offline, the app goes on with the last account on this device.
Promise.all([api('GET', '/api/config'), api('GET', '/api/me')])
  .then(([config, me]) => {
    clientId = config.googleClientId ?? null
    // Don't restart a level a child is in the middle of.
    if (me.user) { adopt(me); if (!document.querySelector('.play')) route() }
  })
  .catch(() => {
    const saved = store.get('account')
    if (saved) { user = saved; useAccount(saved.email.toLowerCase()); if (!document.querySelector('.play')) route() }
  })
  .finally(() => {
    accountKnown = true
    if (location.hash.startsWith('#/sheet/') && !document.querySelector('.play, .route')) route() // was waiting on a locked sheet
    if (!user && store.get('handoff')) awaitHandoff()
  })
