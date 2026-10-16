// The worksheets. Each one builds itself into `area` for one level (`stage`),
// calls done({ mistakes }) when the child has finished, and returns a cleanup
// for when they leave early. `rand` is seeded by the sheet and level, so a level
// always has the same content (see the level map in app.js), and harder levels
// get more pieces, bigger pictures and bigger numbers.
// Stars come from mistakes (app.js): none → 3, one or two → 2, more → 1.
import { ANIMALS, COLORS, FRUITS, HIJAIYAH, PLANTS, SHAPES, THINGS, VEHICLES, WORDS, WORDS_EN, pick, shuffle } from './data.js'
import { h } from './dom.js'
import { draggable } from './drag.js'
import { alsoOf, lang, nm, tr } from './i18n.js'
import { sfx } from './sfx.js'
import { ALPHABET, canListen, letterWords, listen, numberWords, said, say } from './voice.js'

const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'
const later = (fn, ms) => setTimeout(fn, ms)
/** The value for this level: the list's last value once levels run past it. */
const at = (stage, values) => values[Math.min(stage, values.length) - 1]
const progress = (total, k) => h('p', { class: 'progress-dots' }, Array.from({ length: total }, (_, i) => h('i', { class: i < k ? 'on' : i === k ? 'now' : '' })))

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
  // Five or more: three across and smaller, so the whole board stays on a phone screen while dragging.
  const many = slots.length > 4 ? ' many' : ''
  area.replaceChildren(h('div', { class: `board${many}` }, slots), h('div', { class: `tray${many}` }, pieces))
}

// ── 1. Shadows: drag each animal onto its silhouette ──────────────────────────
function shadows(area, done, { stage, rand }) {
  const animals = pick(ANIMALS, at(stage, [2, 3, 3, 4, 4, 4, 5, 5, 5, 5]), rand)
  const slots = shuffle(animals, rand).map(a => h('div', { class: 'slot shadow', 'data-id': a.id },
    h('span', { class: 'emoji silhouette', 'aria-hidden': 'true' }, a.emoji), h('small', {}, '?')))
  const pieces = shuffle(animals, rand).map(a => h('div', { class: 'piece', 'data-id': a.id, 'aria-label': nm(a) }, h('span', { class: 'emoji' }, a.emoji)))
  placeAll(area, {
    slots, pieces, total: animals.length, done,
    fits: (slot, el) => slot.dataset.id === el.dataset.id,
    onPlace: (slot, el) => {
      slot.querySelector('.silhouette').replaceWith(el)
      slot.querySelector('small').textContent = nm(animals.find(a => a.id === el.dataset.id))
      slot.classList.add('filled')
    },
  })
}

// ── 2. Animal food: drag each food to the animal that eats it ────────────────
function food(area, done, { stage, rand }) {
  const eaters = []
  const count = at(stage, [2, 3, 3, 4, 4, 4, 5, 5, 5, 5])
  for (const a of shuffle(ANIMALS.filter(a => a.food), rand)) if (eaters.length < count && !eaters.some(e => e.food === a.food)) eaters.push(a)
  const slots = eaters.map(a => h('div', { class: 'slot eater', 'data-food': a.food },
    h('span', { class: 'emoji' }, a.emoji), h('small', {}, nm(a)), h('span', { class: 'plate' }, '🍽️')))
  const pieces = shuffle(eaters, rand).map(a => h('div', { class: 'piece', 'data-food': a.food, 'aria-label': tr(a.foodName, a.foodEn) }, h('span', { class: 'emoji' }, a.food)))
  placeAll(area, {
    slots, pieces, total: eaters.length, done,
    fits: (slot, el) => slot.dataset.food === el.dataset.food,
    onPlace: (slot, el) => { slot.querySelector('.plate').replaceWith(el); slot.classList.add('filled') },
  })
}

// ── 3. Sorting: animals, fruit and things into their baskets ─────────────────
function sorting(area, done, { stage, rand }) {
  const all = [['animal', tr('🐾 Hewan', '🐾 Animals'), ANIMALS], ['fruit', tr('🍎 Buah', '🍎 Fruit'), FRUITS], ['thing', tr('🧸 Benda', '🧸 Things'), THINGS]]
  const groups = all.slice(0, stage <= 3 ? 2 : 3)
  const each = at(stage, [2, 3, 3, 2, 3, 3, 3, 4, 4, 4])
  const items = shuffle(groups.flatMap(([kind, , list]) => pick(list, each, rand).map(x => ({ ...x, kind }))), rand)
  const slots = groups.map(([kind, label]) => h('div', { class: 'slot basket', 'data-kind': kind }, h('b', {}, label), h('div', { class: 'basket-in' })))
  const pieces = items.map(x => h('div', { class: 'piece small', 'data-kind': x.kind, 'aria-label': nm(x) }, h('span', { class: 'emoji' }, x.emoji)))
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

/** A picture cut into n×n pieces to drag into place. */
function puzzleBoard(area, done, { src, label, n, rand, extra }) {
  const tile = i => `background-image:url(${src});background-size:${n * 100}% ${n * 100}%;background-position:${(i % n) * 100 / (n - 1)}% ${Math.floor(i / n) * 100 / (n - 1)}%`
  const indices = [...Array(n * n).keys()]
  const slots = indices.map(i => h('div', { class: 'slot cell', 'data-i': i }))
  const pieces = shuffle(indices, rand).map(i => h('div', { class: 'piece tile', 'data-i': i, style: tile(i) }))
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
  area.replaceChildren(...(extra ? [h('div', { class: 'levels' }, extra)] : []),
    board, caption, h('div', { class: 'tray tiles', style: `--n:${n}` }, pieces))
}

function puzzle(area, done, { stage, rand }) {
  const animal = pick(ANIMALS, 1, rand)[0]
  puzzleBoard(area, done, { src: picture(animal.emoji), label: `${animal.emoji} ${nm(animal)}!`, n: stage <= 3 ? 2 : stage <= 7 ? 3 : 4, rand })
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

function photoPuzzle(area, done, { stage, rand }) {
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
      } catch { area.querySelector('.note')?.replaceChildren(tr('Foto tidak bisa dibuka. Coba foto lain ya.', "That photo can't be opened. Try another one!")) }
    },
  })
  function start(src) {
    puzzleBoard(area, done, {
      src, label: tr('📸 Fotomu jadi utuh!', '📸 Your photo is complete!'), n: stage + 1, rand,
      extra: h('button', { class: 'chip', onclick: () => input.click() }, tr('🔄 Ganti foto', '🔄 Change photo')),
    })
    area.append(input)
  }
  if (saved) return start(saved)
  area.replaceChildren(h('div', { class: 'start' },
    h('div', { class: 'big-emoji' }, '📸'),
    h('p', {}, tr('Pilih foto dari galeri atau ambil foto baru, lalu jadikan puzzle!', 'Pick a photo from your gallery or take a new one, then turn it into a puzzle!')),
    h('button', { class: 'btn big', onclick: () => input.click() }, tr('📷 Pilih foto', '📷 Choose a photo')),
    h('p', { class: 'note' }, tr('Foto tidak diunggah ke mana pun — hanya ada di perangkat ini.', 'The photo is never uploaded. It stays on this device.'))), input)
}

// ── 5. Guess the sound ───────────────────────────────────────────────────────
function sounds(area, done, { stage, rand }) {
  const voiced = ANIMALS.filter(a => a.sound)
  const rounds = pick(voiced, at(stage, [3, 3, 4, 4, 4, 5, 5, 5, 5, 5]), rand)
  const others = at(stage, [1, 1, 2, 2, 2, 2, 3, 3, 3, 3])
  const audio = new Audio()
  let k = 0, mistakes = 0
  const play = () => { audio.src = `sounds/${rounds[k].sound}.mp3`; audio.currentTime = 0; audio.play().catch(() => {}) }
  function round() {
    const answer = rounds[k]
    const choices = shuffle([answer, ...pick(voiced.filter(a => a.id !== answer.id), others, rand)], rand)
    area.replaceChildren(
      progress(rounds.length, k),
      h('button', { class: 'listen', onclick: play, 'aria-label': tr('Dengar lagi', 'Listen again') }, '🔊', h('small', {}, tr('Dengar lagi', 'Listen again'))),
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
      }, h('span', { class: 'emoji' }, a.emoji), h('b', {}, nm(a))))))
  }
  // The first sound needs a tap: browsers only play sound a child started.
  area.replaceChildren(h('div', { class: 'start' }, h('p', {}, tr('Dengarkan suaranya, lalu pilih hewan yang benar!', 'Listen to the sound, then pick the right animal!')),
    h('button', { class: 'btn big', onclick: () => { round(); play() } }, tr('▶ Mulai', '▶ Start'))))
  return () => audio.pause()
}

// ── 6. Counting ──────────────────────────────────────────────────────────────
function counting(area, done, { stage, rand }) {
  let k = 0, mistakes = 0
  const ROUNDS = 5
  const max = at(stage, [3, 4, 5, 5, 6, 7, 8, 9, 10, 10])
  const plan = Array.from({ length: ROUNDS }, (_, i) => ({ fruit: pick(FRUITS, 1, rand)[0], count: 1 + Math.floor(rand() * (i < 2 ? Math.min(max, 5) : max)) }))
  function round() {
    const { fruit, count } = plan[k]
    const options = shuffle([count, ...shuffle([...Array(max + 2).keys()].map(i => i + 1).filter(x => x !== count && Math.abs(x - count) <= 3), rand).slice(0, 2)], rand)
    area.replaceChildren(
      progress(ROUNDS, k),
      h('p', { class: 'question' }, tr(`Ada berapa ${fruit.name.toLowerCase()}?`, `How many ${fruit.pl}?`)),
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

// ── 6b. Find it: spot what's asked for in a busy picture ────────────────────
function findIt(area, done, { stage, rand }) {
  const [COLS, ROWS, ROUNDS] = at(stage, [[4, 3, 3], [4, 3, 4], [5, 4, 4], [5, 4, 4], [5, 4, 5], [5, 4, 5], [6, 5, 5], [6, 5, 5], [6, 5, 6], [6, 5, 6]])
  const items = pick([...ANIMALS, ...FRUITS, ...THINGS, ...VEHICLES, ...PLANTS], COLS * ROWS, rand)
  const targets = pick(items, ROUNDS, rand)
  let k = 0, mistakes = 0
  const ask = h('p', { class: 'question find-what' })
  // One thing per cell of the grid, nudged, sized and tilted so it looks scattered.
  const spots = items.map((x, i) => h('button', {
    class: 'spot emoji', 'aria-label': nm(x),
    style: `left:${(i % COLS + 0.04 + rand() * 0.26) * 100 / COLS}%;top:${(Math.floor(i / COLS) + 0.04 + rand() * 0.26) * 100 / ROWS}%;` +
      `--s:${((0.75 + rand() * 0.4) * 5 / COLS).toFixed(2)};--r:${Math.round(rand() * 40 - 20)}deg`,
    onclick(e) {
      const el = e.currentTarget
      if (x !== targets[k]) { mistakes++; sfx.tryAgain(); el.classList.remove('nope'); void el.offsetWidth; el.classList.add('nope'); return }
      el.classList.add('found'); el.disabled = true; sfx.good()
      if (++k < ROUNDS) refresh()
      else { area.querySelector('.progress-dots').replaceWith(progress(ROUNDS, ROUNDS)); later(() => done({ mistakes }), 900) }
    },
  }, x.emoji))
  function refresh() {
    area.querySelector('.progress-dots').replaceWith(progress(ROUNDS, k))
    ask.replaceChildren(tr('Temukan ', 'Find '), h('span', { class: 'emoji' }, targets[k].emoji), ` ${nm(targets[k])}!`)
  }
  area.replaceChildren(progress(ROUNDS, 0), ask, h('div', { class: 'scene' }, spots))
  refresh()
}

// ── 7. Memory: find the pairs ────────────────────────────────────────────────
function memory(area, done, { stage, rand }) {
  const pairs = at(stage, [3, 3, 4, 4, 5, 5, 6, 6, 6, 6])
  const set = pick([...ANIMALS, ...FRUITS], pairs, rand)
  const cards = shuffle([...set, ...set], rand)
  let open = [], matched = 0, misses = 0, busy = false
  const els = cards.map(card => h('button', {
    class: 'memo', 'aria-label': tr('Kartu tertutup', 'Hidden card'),
    onclick(e) {
      const el = e.currentTarget
      if (busy || el.classList.contains('flip')) return
      el.classList.add('flip'); el.setAttribute('aria-label', nm(card))
      open.push([card, el])
      if (open.length < 2) return
      const [[a, ea], [b, eb]] = open
      open = []
      if (a.id === b.id) {
        sfx.good(); ea.classList.add('match'); eb.classList.add('match')
        // Some misses are part of the game; only many count as mistakes.
        if (++matched === set.length) later(() => done({ mistakes: Math.max(0, misses - pairs) }), 800)
        return
      }
      misses++; busy = true
      later(() => { ea.classList.remove('flip'); eb.classList.remove('flip'); busy = false }, 850)
    },
  }, h('span', { class: 'back' }, '⭐'), h('span', { class: 'front emoji' }, card.emoji)))
  area.replaceChildren(h('div', { class: 'memory' }, els))
}

// ── 8. Colouring: draw over a faint animal, one animal per level ─────────────
const TO_COLOUR = ['cat', 'fish', 'bird', 'butterfly', 'turtle', 'rabbit', 'elephant', 'lion', 'frog', 'owl']
function drawing(area, done, { stage }) {
  const PAINTS = ['#243447', '#E9785E', '#F6C344', '#27847B', '#7CCBDD', '#8E6CE0', '#F48FB1', '#8D5A3B', '#4CAF50', '#FFFFFF']
  const animal = ANIMALS.find(a => a.id === at(stage, TO_COLOUR))
  let color = PAINTS[1], size = 14
  const guide = h('canvas', { class: 'guide', 'aria-hidden': 'true' })
  const paint = h('canvas', { class: 'paint', 'aria-label': tr('Kanvas gambar', 'Drawing canvas') })
  const stageEl = h('div', { class: 'stage' }, guide, paint)
  let dpr = 1
  function layout() {
    const w = stageEl.clientWidth
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
    PAINTS.map(c => h('button', { class: `swatch${c === color ? ' on' : ''}`, style: `--c:${c}`, 'aria-label': `${tr('Warna', 'Color')} ${c}`, onclick: e => choose(c, e.currentTarget) })),
    h('button', { class: 'swatch erase', 'aria-label': tr('Penghapus', 'Eraser'), onclick: e => choose('erase', e.currentTarget) }, '🧽'))
  function choose(c, btn) { color = c; swatches.querySelectorAll('.swatch').forEach(s => s.classList.toggle('on', s === btn)) }
  const sizes = h('div', { class: 'sizes' }, [[6, tr('Kecil', 'Small')], [14, tr('Sedang', 'Medium')], [28, tr('Besar', 'Large')]].map(([s, label]) =>
    h('button', { class: `chip${s === size ? ' on' : ''}`, onclick: e => { size = s; sizes.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === e.currentTarget)) } }, label)))
  function save() {
    const out = document.createElement('canvas')
    out.width = guide.width; out.height = guide.height
    const g = out.getContext('2d'); g.drawImage(guide, 0, 0); g.drawImage(paint, 0, 0)
    h('a', { href: out.toDataURL('image/png'), download: `${tr('gambar', 'drawing')}-${animal.id}.png` }).click()
  }
  area.replaceChildren(
    h('p', { class: 'question' }, tr(`Ayo warnai ${animal.name.toLowerCase()}! ${animal.emoji}`, `Let's color the ${animal.en.toLowerCase()}! ${animal.emoji}`)),
    stageEl, swatches, sizes,
    h('div', { class: 'row' },
      h('button', { class: 'btn ghost', onclick: () => paint.getContext('2d').clearRect(0, 0, paint.width, paint.height) }, tr('🗑️ Hapus', '🗑️ Clear')),
      h('button', { class: 'btn ghost', onclick: save }, tr('💾 Simpan', '💾 Save')),
      h('button', { class: 'btn', onclick: () => done({ mistakes: 0 }) }, tr('✅ Selesai', '✅ Done'))))
  layout()
  const ro = new ResizeObserver(() => { if (Math.round(stageEl.clientWidth * dpr) !== guide.width) layout() })
  ro.observe(stageEl)
  return () => ro.disconnect()
}

// ── 9–17. Say it: numbers, letters, words, names of animals, fruit, things, vehicles, colours, shapes ─────
/**
 * Shared by the speaking games. Each round shows something and accepts some
 * answers; the child taps the mic and says it. Two misses offer the answer and
 * a skip. Without speech recognition (or a mic), it's a tap-the-answer game.
 */
function speak(area, done, rounds, rand) {
  let k = 0, mistakes = 0, tapMode = !canListen
  function round() {
    const r = rounds[k]
    let misses = 0, busy = false
    const status = h('p', { class: 'status', 'aria-live': 'polite' }, tapMode ? tr('Ketuk jawaban yang benar.', 'Tap the right answer.') : tr('Ketuk 🎤 lalu ucapkan jawabannya.', 'Tap 🎤 and say the answer.'))
    const reveal = h('div', { class: 'reveal' })
    const win = () => {
      sfx.good()
      reveal.replaceChildren(r.reveal ?? '')
      status.textContent = `${tr('Benar!', 'Correct!')} ${r.answer} 🎉`
      area.querySelectorAll('.choice, .mic').forEach(b => { b.disabled = true })
      later(() => (++k < rounds.length ? round() : done({ mistakes })), 1100)
    }
    const miss = text => {
      mistakes++; misses++; sfx.tryAgain()
      status.textContent = text
      if (misses >= 2) area.querySelector('.skip')?.removeAttribute('hidden')
    }
    const mic = h('button', {
      class: 'mic', 'aria-label': tr('Ucapkan jawaban', 'Say the answer'),
      async onclick() {
        if (busy) return
        busy = true; mic.classList.add('on')
        try {
          const heard = await listen({ onStart: () => { status.textContent = tr('Aku mendengarkan… 👂', "I'm listening… 👂") } })
          if (said(heard, r.accept, { exact: r.exact, not: r.not })) win()
          else miss(heard.length ? tr(`Aku dengar "${heard[0]}". Coba lagi ya!`, `I heard "${heard[0]}". Try again!`) : tr('Aku belum dengar. Ucapkan lebih keras ya!', "I didn't hear you. Say it a bit louder!"))
        } catch {
          // No mic permission or no recogniser: carry on by tapping.
          tapMode = true; round(); return
        } finally { busy = false; mic.classList.remove('on') }
        if (misses >= 2) status.textContent += ` ${tr('Jawabannya:', 'The answer is:')} ${r.answer}.`
      },
    }, '🎤')
    const choices = h('div', { class: 'choices' }, shuffle(r.choices, rand).map(c => h('button', {
      class: 'choice',
      onclick(e) { if (c === r.answer) { e.currentTarget.classList.add('right'); win() } else { e.currentTarget.classList.add('wrong'); e.currentTarget.disabled = true; miss(tr('Coba lagi ya!', 'Try again!')) } },
    }, h('b', {}, c))))
    area.replaceChildren(
      progress(rounds.length, k),
      h('div', { class: 'prompt' }, r.show), reveal,
      tapMode ? choices : mic, status,
      h('button', { class: 'link-btn skip', hidden: true, onclick: () => { ++k < rounds.length ? round() : done({ mistakes }) } }, tr('Lewati →', 'Skip →')))
  }
  round()
}

function sayNumber(area, done, { stage, rand }) {
  const max = at(stage, [5, 5, 10, 10, 10, 15, 15, 20, 20, 20])
  const numbers = pick([...Array(max).keys()].map(i => i + 1), 5, rand)
  const near = n => pick([...Array(max).keys()].map(i => i + 1).filter(x => x !== n && Math.abs(x - n) <= 3), 2, rand)
  speak(area, done, numbers.map(n => ({
    show: h('span', { class: 'big-text' }, String(n)), accept: numberWords(n), exact: true, answer: String(n), choices: [n, ...near(n)].map(String),
  })), rand)
}

function sayLetter(area, done, { stage, rand }) {
  // Levels 1–5 go through the alphabet in order (A–E, F–J, …); after that, all of it.
  const pool = stage <= 5 ? ALPHABET.slice((stage - 1) * 5, stage === 5 ? 26 : stage * 5) : ALPHABET
  speak(area, done, pick(pool, 5, rand).map(letter => ({
    show: h('span', { class: 'big-text' }, `${letter}${letter.toLowerCase()}`), accept: letterWords(letter), exact: true, answer: letter,
    choices: [letter, ...pick(ALPHABET.filter(l => l !== letter), 2, rand)],
  })), rand)
}

function sayWord(area, done, { stage, rand }) {
  // Short words first; each level adds longer ones.
  const words = [...(lang === 'en' ? WORDS_EN : WORDS)].sort((a, b) => a.word.length - b.word.length)
  const pool = words.slice(0, Math.min(words.length, 6 + (stage - 1) * 2))
  speak(area, done, pick(pool, 5, rand).map(w => ({
    show: h('span', { class: 'big-text word' }, w.word), accept: [w.word], answer: w.word,
    reveal: h('span', { class: 'emoji big-emoji' }, w.emoji),
    choices: [w.word, ...pick(pool.filter(x => x.word !== w.word), 2, rand).map(x => x.word)],
  })), rand)
}

// ── 18–21. Trace it: letters, hijaiyah, animals and fruit from dotted guides ──
// The guide is worked out on a 300×300 grid: a letter drawn in a font, or an
// emoji's silhouette, gives a shape; its edge, thinned to one point per few
// pixels, is drawn as dots. Letters are traced by colouring inside the letter,
// pictures by following the dotted outline. After each stroke the child's lines
// are compared with the shape: enough of it covered finishes the picture, and
// lines far outside it cost stars.
const GRID = 300
const grid = () => { const c = document.createElement('canvas'); c.width = c.height = GRID; return c }
function maskOf(c) {
  const d = c.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, GRID, GRID).data
  const m = new Uint8Array(GRID * GRID)
  for (let i = 0; i < m.length; i++) m[i] = d[i * 4 + 3] > 110 ? 1 : 0
  return m
}
/** Points along the edge of a mask, one per `step`×`step` cell, so they draw as dots. */
function edgeDots(m, step = 9) {
  const seen = new Set(), dots = []
  for (let y = 1; y < GRID - 1; y++) for (let x = 1; x < GRID - 1; x++) {
    const i = y * GRID + x
    if (!m[i] || (m[i - 1] && m[i + 1] && m[i - GRID] && m[i + GRID])) continue
    const cell = Math.floor(y / step) * 100 + Math.floor(x / step)
    if (seen.has(cell)) continue
    seen.add(cell); dots.push([x, y])
  }
  return dots
}
const discs = (dots, r) => { const c = grid(), g = c.getContext('2d'); for (const [x, y] of dots) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill() } return c }

/** What to cover (`target`) and where lines may go (`allowed`), from a shape-drawing function. */
function guideOf(draw, outline) {
  const shape = grid(); draw(shape.getContext('2d'))
  const m = maskOf(shape), dots = edgeDots(m)
  if (outline) return { dots, target: maskOf(discs(dots, 8)), allowed: maskOf(discs(dots, 20)) }
  const wide = discs(dots, 12); wide.getContext('2d').drawImage(shape, 0, 0)
  return { dots, target: m, allowed: maskOf(wide) }
}

const BRUSH = 22
function strokesMask(strokes, width) {
  const c = grid(), g = c.getContext('2d')
  g.lineWidth = width; g.lineCap = g.lineJoin = 'round'
  for (const line of strokes) {
    g.beginPath(); line.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)))
    if (line.length === 1) g.lineTo(line[0][0] + 0.1, line[0][1])
    g.stroke()
  }
  return maskOf(c)
}
/** How much of the shape the lines cover (with a little slack), and how much ink went astray. */
function traceScore(strokes, { target, allowed }) {
  const wide = strokesMask(strokes, BRUSH + 14), thin = strokesMask(strokes, BRUSH)
  let t = 0, hit = 0, ink = 0, out = 0
  for (let i = 0; i < target.length; i++) {
    if (target[i]) { t++; if (wide[i]) hit++ }
    if (thin[i]) { ink++; if (!allowed[i]) out++ }
  }
  return { cover: t ? hit / t : 0, outside: ink ? out / ink : 0 }
}

/**
 * Rounds of { draw(g) → the shape on the 300 grid, reveal(g) → the finished
 * picture, ask, say }. `outline`: follow the edge (pictures) instead of
 * colouring inside the letter.
 */
function trace(area, done, rounds, { outline = false, font } = {}) {
  const NEED = outline ? 0.6 : 0.62
  const INK = ['#27847B', '#E9785E', '#8E6CE0', '#1E88E5', '#F06292']
  let k = 0, mistakes = 0, ro = null
  async function round() {
    ro?.disconnect()
    const r = rounds[k]
    if (font) await document.fonts?.load(font, r.text ?? 'A').catch(() => {})
    const guide = guideOf(r.draw, outline)
    const strokes = []
    let finished = false, current = null, dpr = 1
    const guideEl = h('canvas', { class: 'guide', 'aria-hidden': 'true' })
    const paint = h('canvas', { class: 'paint', 'aria-label': r.ask })
    const stageEl = h('div', { class: 'stage trace' }, guideEl, paint)
    const fill = h('i')
    const finishBtn = h('button', { class: 'btn ghost', disabled: true, onclick: () => win(true) }, tr('✅ Selesai', '✅ Done'))
    const color = INK[k % INK.length]
    function drawGuide(revealed) {
      const g = guideEl.getContext('2d'), s = guideEl.width / GRID
      g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, guideEl.width, guideEl.height)
      g.setTransform(s, 0, 0, s, 0, 0)
      if (revealed) { r.reveal(g); return }
      if (!outline) { g.globalAlpha = 0.12; r.draw(g); g.globalAlpha = 1 }
      g.fillStyle = '#93A1B3'
      for (const [x, y] of guide.dots) { g.beginPath(); g.arc(x, y, 2.6, 0, Math.PI * 2); g.fill() }
    }
    function drawInk() {
      const g = paint.getContext('2d'), s = paint.width / GRID
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, paint.width, paint.height)
      g.setTransform(s, 0, 0, s, 0, 0)
      g.strokeStyle = color; g.lineWidth = BRUSH; g.lineCap = g.lineJoin = 'round'
      for (const line of strokes) {
        g.beginPath(); line.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)))
        if (line.length === 1) g.lineTo(line[0][0] + 0.1, line[0][1])
        g.stroke()
      }
    }
    function layout() {
      dpr = Math.min(2, window.devicePixelRatio || 1)
      for (const c of [guideEl, paint]) c.width = c.height = Math.round(stageEl.clientWidth * dpr)
      drawGuide(finished); drawInk()
    }
    const pos = e => { const b = paint.getBoundingClientRect(); return [(e.clientX - b.left) * GRID / b.width, (e.clientY - b.top) * GRID / b.height] }
    paint.addEventListener('pointerdown', e => {
      if (finished) return
      e.preventDefault()
      try { paint.setPointerCapture(e.pointerId) } catch { /* a pointer the browser no longer tracks */ }
      current = [pos(e)]; strokes.push(current); drawInk()
    })
    paint.addEventListener('pointermove', e => { if (!current) return; current.push(pos(e)); drawInk() })
    for (const ev of ['pointerup', 'pointercancel']) paint.addEventListener(ev, () => { if (!current) return; current = null; check() })
    function check() {
      const { cover } = traceScore(strokes, guide)
      fill.style.width = `${Math.min(100, (cover / NEED) * 100)}%`
      finishBtn.disabled = cover < 0.35
      if (cover >= NEED) win(false)
    }
    function win(early) {
      if (finished) return
      finished = true
      const { outside } = traceScore(strokes, guide)
      mistakes += (early ? 1 : 0) + (outside < 0.15 ? 0 : outside < 0.3 ? 1 : 2)
      fill.style.width = '100%'
      drawGuide(true); sfx.good(); say(r.say)
      area.querySelectorAll('.trace-tools button').forEach(b => { b.disabled = true })
      later(() => (++k < rounds.length ? round() : done({ mistakes })), 1600)
    }
    area.replaceChildren(
      progress(rounds.length, k),
      h('p', { class: 'question' }, r.ask),
      stageEl,
      h('div', { class: 'trace-bar', 'aria-hidden': 'true' }, fill),
      h('div', { class: 'row trace-tools' },
        h('button', { class: 'btn ghost', onclick: () => { strokes.length = 0; drawInk(); check() } }, tr('🗑️ Hapus', '🗑️ Clear')),
        finishBtn))
    layout()
    ro = new ResizeObserver(() => { if (Math.round(stageEl.clientWidth * dpr) !== guideEl.width) layout() })
    ro.observe(stageEl)
  }
  round()
  return () => ro?.disconnect()
}

const LETTER_FONT = '700 250px Fredoka, Nunito, sans-serif'
const ARABIC_FONT = '700 200px "Noto Naskh Arabic", "Geeza Pro", serif'
/** A letter scaled to fill the middle of the grid, whatever its font's proportions. */
function glyph(text, font, color) {
  return g => {
    g.font = font; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillStyle = color ?? '#000'
    const m = g.measureText(text)
    const w = m.actualBoundingBoxLeft + m.actualBoundingBoxRight, tall = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent
    const scale = 210 / Math.max(w, tall, 1)
    g.save(); g.translate(GRID / 2, GRID / 2); g.scale(scale, scale)
    g.fillText(text, m.actualBoundingBoxLeft - w / 2, m.actualBoundingBoxAscent - tall / 2)
    g.restore()
  }
}
const emojiAt = (emoji, alpha = 1) => g => {
  g.globalAlpha = alpha; g.font = `230px ${EMOJI_FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'
  g.fillText(emoji, GRID / 2, GRID * 0.54); g.globalAlpha = 1
}

function traceLetters(area, done, { stage }) {
  const letters = ALPHABET.slice((stage - 1) * 3, stage * 3)
  return trace(area, done, letters.map(letter => ({
    text: letter, draw: glyph(letter, LETTER_FONT), reveal: glyph(letter, LETTER_FONT, '#27847B'),
    ask: tr(`Tebalkan huruf ${letter}`, `Trace the letter ${letter}`), say: letter,
  })), { font: LETTER_FONT })
}

function traceHijaiyah(area, done, { stage }) {
  return trace(area, done, HIJAIYAH.slice((stage - 1) * 3, stage * 3).map(([letter, id, en]) => ({
    text: letter, draw: glyph(letter, ARABIC_FONT), reveal: glyph(letter, ARABIC_FONT, '#27847B'),
    ask: tr(`Tebalkan huruf ${id}`, `Trace the letter ${en}`), say: tr(id, en),
  })), { font: ARABIC_FONT })
}

// One picture per level, from simple outlines to busier ones.
const TRACE_ANIMALS = ['fish', 'turtle', 'duck', 'bird', 'rabbit', 'elephant', 'crab', 'butterfly', 'giraffe', 'owl']
const TRACE_FRUITS = ['apple', 'pear', 'cherry', 'banana', 'orange', 'lemon', 'strawberry', 'grapes', 'watermelon', 'pineapple']
const tracePicture = (list, ids) => (area, done, { stage }) => {
  const x = list.find(item => item.id === at(stage, ids))
  return trace(area, done, [{
    draw: emojiAt(x.emoji), reveal: emojiAt(x.emoji),
    ask: tr(`Ikuti garis titik-titik: ${x.name}`, `Follow the dotted line: ${x.en}`), say: nm(x),
  }], { outline: true })
}

const spaced = text => ` ${text.toLowerCase().replace(/-/g, ' ')} `
const BRIGHT = ['#E9785E', '#27847B', '#F6C344', '#7CCBDD', '#8E6CE0', '#F06292']

/** A colour as a paint blob. */
export const colorBlob = c => h('span', { class: `color-blob${c.id === 'white' ? ' light' : ''}`, style: `--c:${c.hex}`, role: 'img', 'aria-label': nm(c) })

/** A shape from data.js, filled with a colour. */
export function shapePic(shape, fill) {
  const pic = h('span', { class: 'shape-pic', role: 'img', 'aria-label': nm(shape) })
  pic.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="${fill}">${shape.svg}</g></svg>`
  return pic
}

/**
 * Name the picture: animals, fruit, things, vehicles, colours or shapes.
 * Early levels use the first, most familiar names in the list; each level adds more.
 */
const sayName = (list, draw = (x, rand) => h('span', { class: 'emoji prompt-emoji' }, x.emoji)) => (area, done, { stage, rand }) => {
  const pool = list.slice(0, Math.min(list.length, 5 + (stage - 1) * 2))
  speak(area, done, pick(pool, 5, rand).map(x => ({
    show: draw(x, rand), accept: [nm(x), ...alsoOf(x)], answer: nm(x),
    // Others' answers that contain this one ("burung hantu", "police car") don't count for it.
    not: list.filter(y => y !== x).flatMap(y => [nm(y), ...alsoOf(y)]).filter(other => spaced(other).includes(spaced(nm(x)))),
    choices: [nm(x), ...pick(pool.filter(y => y.id !== x.id), 2, rand).map(nm)],
  })), rand)
}

/** Groups of sheets: each opens once a child has collected enough stars (saved per account). */
export const GROUPS = [
  { id: 'start', title: ['Ayo Mulai', "Let's Start"], emoji: '🐣', need: 0 },
  { id: 'match', title: ['Pintar Mencocokkan', 'Match It'], emoji: '🧩', need: 5 },
  { id: 'trace', title: ['Menulis & Menebalkan', 'Write & Trace'], emoji: '✍️', need: 8 },
  { id: 'create', title: ['Kreasi & Suara', 'Create & Listen'], emoji: '🎨', need: 12 },
  { id: 'talk', title: ['Ayo Bicara', "Let's Talk"], emoji: '🎤', need: 20 },
  { id: 'read', title: ['Huruf & Kata', 'Letters & Words'], emoji: '🔤', need: 28 },
]

/** Every sheet has `stages` levels (10 unless set); text is [Indonesian, English]. */
export const SHEETS = [
  { id: 'shadow', group: 'start', emoji: '🦒', color: 'teal', start: shadows,
    title: ['Cari Bayangan', 'Shadow Match'], blurb: ['Cocokkan hewan dengan bayangannya', 'Match animals to their shadows'], how: ['Geser setiap hewan ke bayangannya yang pas.', 'Drag each animal onto its shadow.'] },
  { id: 'food', group: 'start', emoji: '🐰', color: 'coral', start: food,
    title: ['Makanan Hewan', 'Feed the Animals'], blurb: ['Siapa makan apa?', 'Who eats what?'], how: ['Geser makanan ke hewan yang memakannya.', 'Drag the food to the animal that eats it.'] },
  { id: 'find', group: 'start', emoji: '🔍', color: 'sky', start: findIt,
    title: ['Cari di Gambar', 'Find It'], blurb: ['Temukan benda yang dicari', 'Spot what is asked for'], how: ['Lihat gambarnya, lalu ketuk benda yang diminta.', 'Look at the picture and tap what is asked for.'] },
  { id: 'count', group: 'start', emoji: '🍎', color: 'sun', start: counting,
    title: ['Ayo Berhitung', "Let's Count"], blurb: ['Hitung buahnya', 'Count the fruit'], how: ['Hitung buahnya, lalu ketuk angka yang benar.', 'Count the fruit, then tap the right number.'] },
  { id: 'puzzle', group: 'match', emoji: '🧩', color: 'sun', start: puzzle,
    title: ['Puzzle Gambar', 'Picture Puzzle'], blurb: ['Susun potongan jadi gambar utuh', 'Put the pieces together'], how: ['Geser potongan ke tempat yang benar.', 'Drag each piece to the right place.'] },
  { id: 'sort', group: 'match', emoji: '🧺', color: 'teal', start: sorting,
    title: ['Kelompokkan', 'Sort It'], blurb: ['Hewan, buah, atau benda?', 'Animal, fruit or thing?'], how: ['Geser setiap gambar ke keranjang yang benar.', 'Drag each picture into the right basket.'] },
  { id: 'memory', group: 'match', emoji: '🃏', color: 'sky', start: memory,
    title: ['Kartu Ingatan', 'Memory Cards'], blurb: ['Temukan pasangan kartu', 'Find the matching pairs'], how: ['Buka dua kartu. Cari yang gambarnya sama!', 'Open two cards. Find the ones that match!'] },
  { id: 'trace-animal', group: 'trace', emoji: '🐢', color: 'teal', start: tracePicture(ANIMALS, TRACE_ANIMALS),
    title: ['Gambar Hewan', 'Draw Animals'], blurb: ['Ikuti garis titik-titik hewan', 'Follow the dotted animal'], how: ['Ikuti garis titik-titik dengan jarimu sampai hewannya muncul.', 'Follow the dotted line with your finger until the animal appears.'] },
  { id: 'trace-fruit', group: 'trace', emoji: '🍐', color: 'coral', start: tracePicture(FRUITS, TRACE_FRUITS),
    title: ['Gambar Buah', 'Draw Fruit'], blurb: ['Ikuti garis titik-titik buah', 'Follow the dotted fruit'], how: ['Ikuti garis titik-titik dengan jarimu sampai buahnya muncul.', 'Follow the dotted line with your finger until the fruit appears.'] },
  { id: 'trace-letter', group: 'trace', emoji: '✏️', color: 'sun', start: traceLetters, stages: 9,
    title: ['Menulis Huruf', 'Write Letters'], blurb: ['Tebalkan huruf A sampai Z', 'Trace the letters A to Z'], how: ['Warnai huruf yang bertitik-titik dengan jarimu sampai penuh.', 'Color in the dotted letter with your finger.'] },
  { id: 'trace-hijaiyah', group: 'trace', emoji: 'ب', color: 'sky', start: traceHijaiyah,
    title: ['Menulis Hijaiyah', 'Write Hijaiyah'], blurb: ['Tebalkan huruf hijaiyah', 'Trace the hijaiyah letters'], how: ['Warnai huruf hijaiyah yang bertitik-titik dengan jarimu sampai penuh.', 'Color in the dotted hijaiyah letter with your finger.'] },
  { id: 'sound', group: 'create', emoji: '🔊', color: 'sky', start: sounds,
    title: ['Tebak Suara', 'Guess the Sound'], blurb: ['Hewan apa yang bersuara?', 'Which animal makes this sound?'], how: ['Dengarkan suaranya, lalu ketuk hewan yang benar.', 'Listen, then tap the right animal.'] },
  { id: 'draw', group: 'create', emoji: '🖍️', color: 'coral', start: drawing,
    title: ['Mewarnai', 'Coloring'], blurb: ['Gambar dan warnai hewan', 'Draw and color animals'], how: ['Pilih warna, lalu gambar di atas hewan.', 'Pick a color, then draw over the animal.'] },
  { id: 'photo', group: 'create', emoji: '📸', color: 'coral', start: photoPuzzle, stages: 3,
    title: ['Puzzle Fotoku', 'My Photo Puzzle'], blurb: ['Puzzle dari fotomu sendiri', 'A puzzle from your own photo'], how: ['Pilih foto, lalu susun potongannya.', 'Pick a photo, then put the pieces together.'] },
  { id: 'say-animal', group: 'talk', emoji: '🐼', color: 'teal', start: sayName(ANIMALS),
    title: ['Tebak Nama Hewan', 'Name the Animal'], blurb: ['Sebutkan nama hewannya', 'Say the animal’s name'], how: ['Ketuk 🎤 lalu sebutkan nama hewan di gambar.', 'Tap 🎤 and say the name of the animal.'] },
  { id: 'say-number', group: 'talk', emoji: '🔢', color: 'sun', start: sayNumber,
    title: ['Tebak Angka', 'Say the Number'], blurb: ['Sebutkan angkanya', 'Say the number'], how: ['Ketuk 🎤 lalu sebutkan angka yang tampil.', 'Tap 🎤 and say the number you see.'] },
  { id: 'say-fruit', group: 'talk', emoji: '🍓', color: 'coral', start: sayName(FRUITS),
    title: ['Tebak Nama Buah', 'Name the Fruit'], blurb: ['Sebutkan nama buahnya', 'Say the fruit’s name'], how: ['Ketuk 🎤 lalu sebutkan nama buah di gambar.', 'Tap 🎤 and say the name of the fruit.'] },
  { id: 'say-thing', group: 'talk', emoji: '🎈', color: 'sky', start: sayName(THINGS),
    title: ['Tebak Nama Benda', 'Name the Thing'], blurb: ['Sebutkan nama bendanya', 'Say what it is'], how: ['Ketuk 🎤 lalu sebutkan nama benda di gambar.', 'Tap 🎤 and say what the thing is.'] },
  { id: 'say-vehicle', group: 'talk', emoji: '🚌', color: 'sun', start: sayName(VEHICLES),
    title: ['Tebak Transportasi', 'Name the Vehicle'], blurb: ['Sebutkan nama kendaraannya', 'Say the vehicle’s name'], how: ['Ketuk 🎤 lalu sebutkan nama kendaraan di gambar.', 'Tap 🎤 and say the name of the vehicle.'] },
  { id: 'say-color', group: 'talk', emoji: '🎨', color: 'coral', start: sayName(COLORS, colorBlob),
    title: ['Tebak Warna', 'Name the Color'], blurb: ['Sebutkan warnanya', 'Say the color'], how: ['Ketuk 🎤 lalu sebutkan warna yang tampil.', 'Tap 🎤 and say the color you see.'] },
  { id: 'say-shape', group: 'talk', emoji: '🔷', color: 'teal', start: sayName(SHAPES, (s, rand) => shapePic(s, pick(BRIGHT, 1, rand)[0])),
    title: ['Tebak Bentuk', 'Name the Shape'], blurb: ['Sebutkan nama bentuknya', 'Say the shape’s name'], how: ['Ketuk 🎤 lalu sebutkan nama bentuk yang tampil.', 'Tap 🎤 and say the name of the shape.'] },
  { id: 'say-letter', group: 'read', emoji: '🔤', color: 'sky', start: sayLetter,
    title: ['Tebak Huruf', 'Say the Letter'], blurb: ['Sebutkan hurufnya', 'Say the letter'], how: ['Ketuk 🎤 lalu sebutkan huruf yang tampil.', 'Tap 🎤 and say the letter you see.'] },
  { id: 'say-word', group: 'read', emoji: '📖', color: 'coral', start: sayWord,
    title: ['Tebak Kata', 'Read the Word'], blurb: ['Baca katanya keras-keras', 'Read the word out loud'], how: ['Ketuk 🎤 lalu baca kata yang tampil.', 'Tap 🎤 and read the word you see.'] },
]
for (const sheet of SHEETS) sheet.stages ??= 10
