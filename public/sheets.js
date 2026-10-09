// The worksheets. Each one builds itself into `area`, calls done({ mistakes })
// when the child has finished, and returns a cleanup for when they leave early.
// Stars come from mistakes (app.js): none → 3, one or two → 2, more → 1.
import { ANIMALS, FRUITS, THINGS, WORDS, pick, shuffle } from './data.js'
import { h } from './dom.js'
import { draggable } from './drag.js'
import { sfx } from './sfx.js'
import { ALPHABET, canListen, letterWords, listen, numberWords, said } from './voice.js'

const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'
const later = (fn, ms) => setTimeout(fn, ms)

/** A drag-to-the-right-place sheet: shared by shadows, food and sorting. */
function placeAll(area, { slots, pieces, fits, onPlace, done, total }) {
  let mistakes = 0, placed = 0
  for (const piece of pieces) {
    draggable(piece, '.slot', (slot, el) => {
      if (!fits(slot, el)) { mistakes++; sfx.tryAgain(); slot.classList.add('nope'); later(() => slot.classList.remove('nope'), 400); return false }
      el.classList.add('placed')
      onPlace(slot, el)
      sfx.good()
      if (++placed === total) later(() => done({ mistakes }), 700)
      return true
    })
  }
  area.replaceChildren(h('div', { class: 'board' }, slots), h('div', { class: 'tray' }, pieces))
}

// ── 1. Shadows: drag each animal onto its silhouette ──────────────────────────
function shadows(area, done) {
  const animals = pick(ANIMALS, 4)
  const slots = shuffle(animals).map(a => h('div', { class: 'slot shadow', 'data-id': a.id },
    h('span', { class: 'emoji silhouette', 'aria-hidden': 'true' }, a.emoji), h('small', {}, '?')))
  const pieces = shuffle(animals).map(a => h('div', { class: 'piece', 'data-id': a.id, 'aria-label': a.name }, h('span', { class: 'emoji' }, a.emoji)))
  placeAll(area, {
    slots, pieces, total: animals.length, done,
    fits: (slot, el) => slot.dataset.id === el.dataset.id,
    onPlace: (slot, el) => {
      slot.querySelector('.silhouette').replaceWith(el)
      slot.querySelector('small').textContent = animals.find(a => a.id === el.dataset.id).name
      slot.classList.add('filled')
    },
  })
}

// ── 2. Animal food: drag each food to the animal that eats it ────────────────
function food(area, done) {
  const eaters = []
  for (const a of shuffle(ANIMALS.filter(a => a.food))) if (eaters.length < 4 && !eaters.some(e => e.food === a.food)) eaters.push(a)
  const slots = eaters.map(a => h('div', { class: 'slot eater', 'data-food': a.food },
    h('span', { class: 'emoji' }, a.emoji), h('small', {}, a.name), h('span', { class: 'plate' }, '🍽️')))
  const pieces = shuffle(eaters).map(a => h('div', { class: 'piece', 'data-food': a.food, 'aria-label': a.foodName }, h('span', { class: 'emoji' }, a.food)))
  placeAll(area, {
    slots, pieces, total: eaters.length, done,
    fits: (slot, el) => slot.dataset.food === el.dataset.food,
    onPlace: (slot, el) => { slot.querySelector('.plate').replaceWith(el); slot.classList.add('filled') },
  })
}

// ── 3. Sorting: animals, fruit and things into their baskets ─────────────────
function sorting(area, done) {
  const groups = [['animal', '🐾 Hewan', ANIMALS], ['fruit', '🍎 Buah', FRUITS], ['thing', '🧸 Benda', THINGS]]
  const items = shuffle(groups.flatMap(([kind, , list]) => pick(list, 3).map(x => ({ ...x, kind }))))
  const slots = groups.map(([kind, label]) => h('div', { class: 'slot basket', 'data-kind': kind }, h('b', {}, label), h('div', { class: 'basket-in' })))
  const pieces = items.map(x => h('div', { class: 'piece small', 'data-kind': x.kind, 'aria-label': x.name }, h('span', { class: 'emoji' }, x.emoji)))
  placeAll(area, {
    slots, pieces, total: items.length, done,
    fits: (slot, el) => slot.dataset.kind === el.dataset.kind,
    onPlace: (slot, el) => slot.querySelector('.basket-in').append(el),
  })
  area.querySelector('.board').classList.add('baskets')
}

// ── 4. Puzzle: rebuild a picture from its pieces ─────────────────────────────
function picture(emoji, size = 600) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')
  g.fillStyle = '#FFF4DE'; g.fillRect(0, 0, size, size)
  g.fillStyle = '#E3F3F1'; g.beginPath(); g.arc(size / 2, size / 2, size * 0.46, 0, Math.PI * 2); g.fill()
  g.font = `${size * 0.7}px ${EMOJI_FONT}`
  g.textAlign = 'center'; g.textBaseline = 'middle'
  g.fillText(emoji, size / 2, size * 0.54)
  return c.toDataURL('image/png')
}

/** A picture cut into n×n pieces to drag into place. `again()` redraws at a new level. */
function puzzleBoard(area, done, { src, label, again, extra }) {
  const level = (area.dataset.level ??= '2')
  const n = Number(level)
  const tile = i => `background-image:url(${src});background-size:${n * 100}% ${n * 100}%;background-position:${(i % n) * 100 / (n - 1)}% ${Math.floor(i / n) * 100 / (n - 1)}%`
  const indices = [...Array(n * n).keys()]
  const slots = indices.map(i => h('div', { class: 'slot cell', 'data-i': i }))
  const pieces = shuffle(indices).map(i => h('div', { class: 'piece tile', 'data-i': i, style: tile(i) }))
  const board = h('div', { class: 'puzzle', style: `--n:${n};--guide:url(${src})` }, slots)
  const caption = h('p', { class: 'caption' })
  let mistakes = 0, placed = 0
  for (const piece of pieces) {
    draggable(piece, '.cell', (slot, el) => {
      if (slot.dataset.i !== el.dataset.i) { mistakes++; sfx.tryAgain(); return false }
      el.classList.add('placed'); slot.append(el); slot.classList.add('filled'); sfx.good()
      if (++placed === n * n) {
        board.classList.add('complete')
        caption.textContent = label
        later(() => done({ mistakes }), 1300)
      }
      return true
    })
  }
  area.replaceChildren(
    h('div', { class: 'levels', role: 'group', 'aria-label': 'Tingkat' }, [['2', 'Mudah · 4'], ['3', 'Sedang · 9'], ['4', 'Sulit · 16']].map(([v, text]) =>
      h('button', { class: `chip${v === level ? ' on' : ''}`, 'aria-pressed': String(v === level), onclick: () => { area.dataset.level = v; again() } }, text)), extra),
    board, caption, h('div', { class: 'tray tiles', style: `--n:${n}` }, pieces))
}

function puzzle(area, done) {
  const animal = pick(ANIMALS, 1)[0]
  puzzleBoard(area, done, { src: picture(animal.emoji), label: `${animal.emoji} ${animal.name}!`, again: () => puzzle(area, done) })
}

// ── 4b. Photo puzzle: the child's own photo, which never leaves the device ───
/** The middle square of a photo, 600 px, as a data URL (EXIF rotation is applied by the browser). */
async function squarePhoto(file) {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    const side = Math.min(img.naturalWidth, img.naturalHeight)
    const c = document.createElement('canvas')
    c.width = c.height = 600
    c.getContext('2d').drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, 600, 600)
    return c.toDataURL('image/jpeg', 0.85)
  } finally { URL.revokeObjectURL(url) }
}

function photoPuzzle(area, done) {
  const saved = (() => { try { return localStorage.getItem('sw.photo') } catch { return null } })()
  const input = h('input', {
    type: 'file', accept: 'image/*', hidden: true,
    async onchange(e) {
      const file = e.target.files[0]
      if (!file) return
      try {
        const src = await squarePhoto(file)
        try { localStorage.setItem('sw.photo', src) } catch { /* too big or private mode: still playable now */ }
        start(src)
      } catch { area.querySelector('.note')?.replaceChildren('Foto tidak bisa dibuka. Coba foto lain ya.') }
    },
  })
  const choose = label => h('button', { class: 'btn big', onclick: () => input.click() }, label)
  function start(src) {
    puzzleBoard(area, done, {
      src, label: '📸 Fotomu jadi utuh!', again: () => start(src),
      extra: h('button', { class: 'chip', onclick: () => input.click() }, '🔄 Ganti foto'),
    })
    area.append(input)
  }
  if (saved) return start(saved)
  area.replaceChildren(h('div', { class: 'start' },
    h('div', { class: 'big-emoji' }, '📸'),
    h('p', {}, 'Pilih foto dari galeri atau ambil foto baru, lalu jadikan puzzle!'),
    choose('📷 Pilih foto'),
    h('p', { class: 'note' }, 'Foto tidak diunggah ke mana pun — hanya ada di perangkat ini.')), input)
}

// ── 5. Guess the sound ───────────────────────────────────────────────────────
function sounds(area, done) {
  const voiced = ANIMALS.filter(a => a.sound)
  const rounds = pick(voiced, 5)
  const audio = new Audio()
  let k = 0, mistakes = 0
  const play = () => { audio.src = `sounds/${rounds[k].sound}.mp3`; audio.currentTime = 0; audio.play().catch(() => {}) }
  function round() {
    const answer = rounds[k]
    const choices = shuffle([answer, ...pick(voiced.filter(a => a.id !== answer.id), 2)])
    area.replaceChildren(
      h('p', { class: 'progress-dots' }, rounds.map((_, i) => h('i', { class: i < k ? 'on' : i === k ? 'now' : '' }))),
      h('button', { class: 'listen', onclick: play, 'aria-label': 'Dengar lagi' }, '🔊', h('small', {}, 'Dengar lagi')),
      h('div', { class: 'choices' }, choices.map(a => h('button', {
        class: 'choice',
        onclick(e) {
          const btn = e.currentTarget
          if (a.id !== answer.id) { mistakes++; sfx.tryAgain(); btn.classList.add('wrong'); btn.disabled = true; return }
          audio.pause(); sfx.good()
          btn.classList.add('right')
          area.querySelectorAll('.choice').forEach(c => { c.disabled = true })
          later(() => (++k < rounds.length ? (round(), play()) : done({ mistakes })), 900)
        },
      }, h('span', { class: 'emoji' }, a.emoji), h('b', {}, a.name)))))
  }
  // The first sound needs a tap: browsers only play sound a child started.
  area.replaceChildren(h('div', { class: 'start' }, h('p', {}, 'Dengarkan suaranya, lalu pilih hewan yang benar!'),
    h('button', { class: 'btn big', onclick: () => { round(); play() } }, '▶ Mulai')))
  return () => audio.pause()
}

// ── 6. Counting ──────────────────────────────────────────────────────────────
function counting(area, done) {
  let k = 0, mistakes = 0
  const ROUNDS = 5
  function round() {
    const fruit = pick(FRUITS, 1)[0]
    const count = 1 + Math.floor(Math.random() * (k < 2 ? 5 : 9))
    const options = shuffle([count, ...shuffle([...Array(10).keys()].map(i => i + 1).filter(x => x !== count && Math.abs(x - count) <= 3)).slice(0, 2)])
    area.replaceChildren(
      h('p', { class: 'progress-dots' }, Array.from({ length: ROUNDS }, (_, i) => h('i', { class: i < k ? 'on' : i === k ? 'now' : '' }))),
      h('p', { class: 'question' }, `Ada berapa ${fruit.name.toLowerCase()}?`),
      h('div', { class: 'count-box' }, Array.from({ length: count }, () => h('span', { class: 'emoji' }, fruit.emoji))),
      h('div', { class: 'numbers' }, options.map(n => h('button', {
        class: 'number',
        onclick(e) {
          const btn = e.currentTarget
          if (n !== count) { mistakes++; sfx.tryAgain(); btn.classList.add('wrong'); btn.disabled = true; return }
          sfx.good(); btn.classList.add('right')
          area.querySelectorAll('.number').forEach(b => { b.disabled = true })
          later(() => (++k < ROUNDS ? round() : done({ mistakes })), 800)
        },
      }, String(n)))))
  }
  round()
}

// ── 7. Memory: find the pairs ────────────────────────────────────────────────
function memory(area, done) {
  const set = pick([...ANIMALS, ...FRUITS], 6)
  const cards = shuffle([...set, ...set]).map((x, i) => ({ ...x, key: i }))
  let open = [], matched = 0, misses = 0, busy = false
  const els = cards.map(card => h('button', {
    class: 'memo', 'aria-label': 'Kartu tertutup',
    onclick(e) {
      const el = e.currentTarget
      if (busy || el.classList.contains('flip')) return
      el.classList.add('flip'); el.setAttribute('aria-label', card.name)
      open.push([card, el])
      if (open.length < 2) return
      const [[a, ea], [b, eb]] = open
      open = []
      if (a.id === b.id) {
        sfx.good(); ea.classList.add('match'); eb.classList.add('match')
        // Some misses are part of the game; only many count as mistakes.
        if (++matched === set.length) later(() => done({ mistakes: Math.max(0, misses - 6) }), 800)
        return
      }
      misses++; busy = true
      later(() => { ea.classList.remove('flip'); eb.classList.remove('flip'); busy = false }, 850)
    },
  }, h('span', { class: 'back' }, '⭐'), h('span', { class: 'front emoji' }, card.emoji)))
  area.replaceChildren(h('div', { class: 'memory' }, els))
}

// ── 8. Colouring: draw over a faint animal ───────────────────────────────────
function drawing(area, done) {
  const COLORS = ['#243447', '#E9785E', '#F6C344', '#27847B', '#7CCBDD', '#8E6CE0', '#F48FB1', '#8D5A3B', '#4CAF50', '#FFFFFF']
  let color = COLORS[1], size = 14, animal = pick(ANIMALS, 1)[0]
  const guide = h('canvas', { class: 'guide', 'aria-hidden': 'true' })
  const paint = h('canvas', { class: 'paint', 'aria-label': 'Kanvas gambar' })
  const stage = h('div', { class: 'stage' }, guide, paint)
  let dpr = 1
  function layout() {
    const w = stage.clientWidth
    dpr = Math.min(2, window.devicePixelRatio || 1)
    for (const c of [guide, paint]) { c.width = c.height = Math.round(w * dpr) }
    const g = guide.getContext('2d')
    g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, guide.width, guide.height)
    g.globalAlpha = 0.18
    g.font = `${guide.width * 0.78}px ${EMOJI_FONT}`
    g.textAlign = 'center'; g.textBaseline = 'middle'
    g.fillText(animal.emoji, guide.width / 2, guide.height * 0.54)
    g.globalAlpha = 1
  }
  let last = null
  const pos = e => { const r = paint.getBoundingClientRect(); return [(e.clientX - r.left) * dpr, (e.clientY - r.top) * dpr] }
  paint.addEventListener('pointerdown', e => { e.preventDefault(); paint.setPointerCapture(e.pointerId); last = pos(e); stroke(last, last) })
  paint.addEventListener('pointermove', e => { if (!last) return; const p = pos(e); stroke(last, p); last = p })
  for (const ev of ['pointerup', 'pointercancel']) paint.addEventListener(ev, () => { last = null })
  function stroke([x0, y0], [x1, y1]) {
    const g = paint.getContext('2d')
    g.globalCompositeOperation = color === 'erase' ? 'destination-out' : 'source-over'
    g.strokeStyle = color === 'erase' ? '#000' : color
    g.lineWidth = size * dpr; g.lineCap = g.lineJoin = 'round'
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1 + 0.01, y1); g.stroke()
  }
  const swatches = h('div', { class: 'swatches' },
    COLORS.map(c => h('button', { class: `swatch${c === color ? ' on' : ''}`, style: `--c:${c}`, 'aria-label': `Warna ${c}`, onclick: e => choose(c, e.currentTarget) })),
    h('button', { class: 'swatch erase', 'aria-label': 'Penghapus', onclick: e => choose('erase', e.currentTarget) }, '🧽'))
  function choose(c, btn) { color = c; swatches.querySelectorAll('.swatch').forEach(s => s.classList.toggle('on', s === btn)) }
  const sizes = h('div', { class: 'sizes' }, [[6, 'Kecil'], [14, 'Sedang'], [28, 'Besar']].map(([s, label]) =>
    h('button', { class: `chip${s === size ? ' on' : ''}`, onclick: e => { size = s; sizes.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === e.currentTarget)) } }, label)))
  function save() {
    const out = document.createElement('canvas')
    out.width = guide.width; out.height = guide.height
    const g = out.getContext('2d'); g.drawImage(guide, 0, 0); g.drawImage(paint, 0, 0)
    h('a', { href: out.toDataURL('image/png'), download: `gambar-${animal.id}.png` }).click()
  }
  area.replaceChildren(
    h('p', { class: 'question' }, `Ayo warnai ${animal.name.toLowerCase()}! ${animal.emoji}`),
    stage, swatches, sizes,
    h('div', { class: 'row' },
      h('button', { class: 'btn ghost', onclick: () => { animal = pick(ANIMALS.filter(a => a.id !== animal.id), 1)[0]; area.querySelector('.question').textContent = `Ayo warnai ${animal.name.toLowerCase()}! ${animal.emoji}`; layout() } }, '🔄 Ganti'),
      h('button', { class: 'btn ghost', onclick: () => paint.getContext('2d').clearRect(0, 0, paint.width, paint.height) }, '🗑️ Hapus'),
      h('button', { class: 'btn ghost', onclick: save }, '💾 Simpan'),
      h('button', { class: 'btn', onclick: () => done({ mistakes: 0 }) }, '✅ Selesai')))
  layout()
  const ro = new ResizeObserver(() => { if (Math.round(stage.clientWidth * dpr) !== guide.width) layout() })
  ro.observe(stage)
  return () => ro.disconnect()
}

// ── 9–12. Say it: numbers, letters, words, animal names ─────────────────────
/**
 * Shared by the speaking games. Each round shows something and accepts some
 * answers; the child taps the mic and says it. Two misses offer the answer and
 * a skip. Without speech recognition (or a mic), it's a tap-the-answer game.
 */
function speak(area, done, rounds) {
  let k = 0, mistakes = 0, tapMode = !canListen
  function round() {
    const r = rounds[k]
    let misses = 0, busy = false
    const status = h('p', { class: 'status', 'aria-live': 'polite' }, tapMode ? 'Ketuk jawaban yang benar.' : 'Ketuk 🎤 lalu ucapkan jawabannya.')
    const reveal = h('div', { class: 'reveal' })
    const win = () => {
      sfx.good()
      reveal.replaceChildren(r.reveal ?? '')
      status.textContent = `Benar! ${r.answer} 🎉`
      area.querySelectorAll('.choice, .mic').forEach(b => { b.disabled = true })
      later(() => (++k < rounds.length ? round() : done({ mistakes })), 1100)
    }
    const miss = text => {
      mistakes++; misses++; sfx.tryAgain()
      status.textContent = text
      if (misses >= 2) area.querySelector('.skip')?.removeAttribute('hidden')
    }
    const mic = h('button', {
      class: 'mic', 'aria-label': 'Ucapkan jawaban',
      async onclick() {
        if (busy) return
        busy = true; mic.classList.add('on')
        try {
          const heard = await listen({ onStart: () => { status.textContent = 'Aku mendengarkan… 👂' } })
          if (said(heard, r.accept, { exact: r.exact })) win()
          else miss(heard.length ? `Aku dengar "${heard[0]}". Coba lagi ya!` : 'Aku belum dengar. Ucapkan lebih keras ya!')
        } catch {
          // No mic permission or no recogniser: carry on by tapping.
          tapMode = true; round(); return
        } finally { busy = false; mic.classList.remove('on') }
        if (misses >= 2) status.textContent += ` Jawabannya: ${r.answer}.`
      },
    }, '🎤')
    const choices = h('div', { class: 'choices' }, shuffle(r.choices).map(c => h('button', {
      class: 'choice',
      onclick(e) { if (c === r.answer) { e.currentTarget.classList.add('right'); win() } else { e.currentTarget.classList.add('wrong'); e.currentTarget.disabled = true; miss('Coba lagi ya!') } },
    }, h('b', {}, c))))
    area.replaceChildren(
      h('p', { class: 'progress-dots' }, rounds.map((_, i) => h('i', { class: i < k ? 'on' : i === k ? 'now' : '' }))),
      h('div', { class: 'prompt' }, r.show), reveal,
      tapMode ? choices : mic, status,
      h('button', { class: 'link-btn skip', hidden: true, onclick: () => { ++k < rounds.length ? round() : done({ mistakes }) } }, 'Lewati →'))
  }
  round()
}

const near = (n, max) => shuffle([...Array(max).keys()].map(i => i + 1).filter(x => x !== n && Math.abs(x - n) <= 3)).slice(0, 2)

function sayNumber(area, done) {
  speak(area, done, Array.from({ length: 5 }, (_, i) => {
    const max = i < 3 ? 10 : 20
    const n = 1 + Math.floor(Math.random() * max)
    return { show: h('span', { class: 'big-text' }, String(n)), accept: numberWords(n), exact: true, answer: String(n), choices: [n, ...near(n, max)].map(String) }
  }))
}

function sayLetter(area, done) {
  speak(area, done, pick(ALPHABET, 5).map(letter => ({
    show: h('span', { class: 'big-text' }, `${letter}${letter.toLowerCase()}`), accept: letterWords(letter), exact: true, answer: letter,
    choices: [letter, ...pick(ALPHABET.filter(l => l !== letter), 2)],
  })))
}

function sayWord(area, done) {
  speak(area, done, pick(WORDS, 5).map(w => ({
    show: h('span', { class: 'big-text word' }, w.word), accept: [w.word], answer: w.word,
    reveal: h('span', { class: 'emoji big-emoji' }, w.emoji),
    choices: [w.word, ...pick(WORDS.filter(x => x.word !== w.word), 2).map(x => x.word)],
  })))
}

function sayAnimal(area, done) {
  speak(area, done, pick(ANIMALS, 5).map(a => ({
    show: h('span', { class: 'emoji prompt-emoji' }, a.emoji), accept: [a.name, ...(a.also ?? [])], answer: a.name,
    choices: [a.name, ...pick(ANIMALS.filter(x => x.id !== a.id), 2).map(x => x.name)],
  })))
}

/** Levels: each opens once a child has collected enough stars (saved per account). */
export const GROUPS = [
  { id: 'start', title: 'Ayo Mulai', emoji: '🐣', need: 0 },
  { id: 'match', title: 'Pintar Mencocokkan', emoji: '🧩', need: 5 },
  { id: 'create', title: 'Kreasi & Suara', emoji: '🎨', need: 12 },
  { id: 'talk', title: 'Ayo Bicara', emoji: '🎤', need: 20 },
  { id: 'read', title: 'Huruf & Kata', emoji: '🔤', need: 28 },
]

export const SHEETS = [
  { id: 'shadow', group: 'start', title: 'Cari Bayangan', emoji: '🦒', color: 'teal', blurb: 'Cocokkan hewan dengan bayangannya', how: 'Geser setiap hewan ke bayangannya yang pas.', start: shadows },
  { id: 'food', group: 'start', title: 'Makanan Hewan', emoji: '🐰', color: 'coral', blurb: 'Siapa makan apa?', how: 'Geser makanan ke hewan yang memakannya.', start: food },
  { id: 'puzzle', group: 'match', title: 'Puzzle Gambar', emoji: '🧩', color: 'sun', blurb: 'Susun potongan jadi gambar utuh', how: 'Geser potongan ke tempat yang benar.', start: puzzle },
  { id: 'sound', group: 'create', title: 'Tebak Suara', emoji: '🔊', color: 'sky', blurb: 'Hewan apa yang bersuara?', how: 'Dengarkan suaranya, lalu ketuk hewan yang benar.', start: sounds },
  { id: 'draw', group: 'create', title: 'Mewarnai', emoji: '🖍️', color: 'coral', blurb: 'Gambar dan warnai hewan', how: 'Pilih warna, lalu gambar di atas hewan.', start: drawing },
  { id: 'count', group: 'start', title: 'Ayo Berhitung', emoji: '🍎', color: 'sun', blurb: 'Hitung buahnya', how: 'Hitung buahnya, lalu ketuk angka yang benar.', start: counting },
  { id: 'sort', group: 'match', title: 'Kelompokkan', emoji: '🧺', color: 'teal', blurb: 'Hewan, buah, atau benda?', how: 'Geser setiap gambar ke keranjang yang benar.', start: sorting },
  { id: 'photo', group: 'create', title: 'Puzzle Fotoku', emoji: '📸', color: 'coral', blurb: 'Puzzle dari fotomu sendiri', how: 'Pilih foto, lalu susun potongannya.', start: photoPuzzle },
  { id: 'say-animal', group: 'talk', title: 'Tebak Nama Hewan', emoji: '🐼', color: 'teal', blurb: 'Sebutkan nama hewannya', how: 'Ketuk 🎤 lalu sebutkan nama hewan di gambar.', start: sayAnimal },
  { id: 'say-number', group: 'talk', title: 'Tebak Angka', emoji: '🔢', color: 'sun', blurb: 'Sebutkan angkanya', how: 'Ketuk 🎤 lalu sebutkan angka yang tampil.', start: sayNumber },
  { id: 'say-letter', group: 'read', title: 'Tebak Huruf', emoji: '🔤', color: 'sky', blurb: 'Sebutkan hurufnya', how: 'Ketuk 🎤 lalu sebutkan huruf yang tampil.', start: sayLetter },
  { id: 'say-word', group: 'read', title: 'Tebak Kata', emoji: '📖', color: 'coral', blurb: 'Baca katanya keras-keras', how: 'Ketuk 🎤 lalu baca kata yang tampil.', start: sayWord },
  { id: 'memory', group: 'match', title: 'Kartu Ingatan', emoji: '🃏', color: 'sky', blurb: 'Temukan pasangan kartu', how: 'Buka dua kartu. Cari yang gambarnya sama!', start: memory },
]
