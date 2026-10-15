// What counts as the right spoken answer (public/voice.js).
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ABC, ABC_EN, ANIMALS, COLORS, FRUITS, PLANTS, SHAPES, THINGS, VEHICLES, WORDS_EN, seeded, pick } from '../public/data.js'
import { setLang } from '../public/i18n.js'
import { letterWords, numberWords, said } from '../public/voice.js'

test('numbers: digits or Indonesian words', () => {
  assert.ok(said(['7'], numberWords(7), { exact: true }))
  assert.ok(said(['Tujuh!'], numberWords(7), { exact: true }))
  assert.ok(said(['angka tujuh'], numberWords(7), { exact: true }))
  assert.ok(said(['dua belas'], numberWords(12), { exact: true }))
  assert.ok(!said(['tujuh belas'], numberWords(7), { exact: true }))  // 17 is not 7
  assert.ok(!said(['delapan'], numberWords(7), { exact: true }))
})

test('letters: the name or the letter, exactly', () => {
  assert.ok(said(['be'], letterWords('B'), { exact: true }))
  assert.ok(said(['B.'], letterWords('B'), { exact: true }))
  assert.ok(!said(['de'], letterWords('B'), { exact: true }))
  assert.ok(said(['zet'], letterWords('Z'), { exact: true }))
})

test('words and animal names: whole, in a sentence, or one letter off when long', () => {
  assert.ok(said(['Kucing'], ['Kucing']))
  assert.ok(said(['itu kucing'], ['Kucing']))
  assert.ok(said(['kucin'], ['Kucing']))            // a child's slip
  assert.ok(!said(['kuda'], ['Kucing']))
  assert.ok(!said(['susu'], ['SAPI']))               // short words: exact only
  assert.ok(said(['burung hantu'], ['Burung Hantu']))
  assert.ok(!said(['burung'], ['Burung Hantu']))
  assert.ok(said(['kura kura'], ['Kura-kura']))
  assert.ok(said(['ayam'], ['Ayam Jago', 'ayam']))
  assert.ok(said(['meong', 'kucing'], ['Kucing']))   // any alternative counts
})

test('picture lists: every name is accepted as said, and no picture or answer repeats', () => {
  for (const list of [ANIMALS, FRUITS, THINGS, VEHICLES, PLANTS, COLORS, SHAPES]) {
    assert.equal(new Set(list.map(x => x.id)).size, list.length)
    assert.equal(new Set(list.map(x => x.name)).size, list.length)  // tap-mode choices must differ
    for (const x of list) assert.ok(said([x.name.toLowerCase()], [x.name, ...(x.also ?? [])]), x.name)
  }
  const pool = [...ANIMALS, ...FRUITS, ...THINGS, ...VEHICLES, ...PLANTS].map(x => x.emoji)  // "Cari di Gambar"
  assert.equal(new Set(pool).size, pool.length)
  assert.ok(said(['itu kereta api'], ['Kereta', 'kereta api']))
  assert.ok(said(['mobil pemadam'], ['Pemadam Kebakaran', 'mobil pemadam', 'pemadam', 'damkar']))
  assert.deepEqual(ABC.map(([letter]) => letter).join(''), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')
  for (const [letter, word] of ABC) assert.equal(word[0], letter)
})

test('a longer answer that contains this one is a different answer', () => {
  assert.ok(said(['merah'], ['Merah'], { not: ['Merah Muda'] }))
  assert.ok(said(['itu merah'], ['Merah'], { not: ['Merah Muda'] }))
  assert.ok(!said(['merah muda'], ['Merah'], { not: ['Merah Muda'] }))
  assert.ok(!said(['persegi panjang'], ['Persegi', 'kotak'], { not: ['Persegi Panjang'] }))
  assert.ok(said(['abu-abu'], ['Abu-abu', 'abu', 'kelabu']))
})

test('English: every name is accepted as said, names differ, numbers and letters are understood', () => {
  setLang('en')
  try {
    for (const list of [ANIMALS, FRUITS, THINGS, VEHICLES, PLANTS, COLORS, SHAPES]) {
      assert.equal(new Set(list.map(x => x.en)).size, list.length)
      for (const x of list) assert.ok(said([x.en.toLowerCase()], [x.en, ...(x.alsoEn ?? [])]), x.en)
    }
    for (const a of ANIMALS.filter(a => a.food)) assert.ok(a.foodEn, a.id)
    for (const f of FRUITS) assert.ok(f.pl, f.id)
    assert.ok(said(['seven'], numberWords(7), { exact: true }))
    assert.ok(said(['two'], numberWords(2), { exact: true }) && said(['to'], numberWords(2), { exact: true }))
    assert.ok(!said(['seventeen'], numberWords(7), { exact: true }))
    assert.ok(said(['bee'], letterWords('B'), { exact: true }))
    assert.ok(said(['double you'], letterWords('W'), { exact: true }))
    assert.ok(!said(['police car'], ['Car'], { not: ['Police Car'] }))
    assert.deepEqual(ABC_EN.map(([letter]) => letter).join(''), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')
    for (const [letter, word] of ABC_EN) assert.equal(word[0], letter)
    assert.equal(new Set(WORDS_EN.map(w => w.word)).size, WORDS_EN.length)
  } finally { setLang('id') }
})

test('levels: the same level always gets the same content', () => {
  const a = pick(ANIMALS, 4, seeded('shadow#3')).map(x => x.id)
  const b = pick(ANIMALS, 4, seeded('shadow#3')).map(x => x.id)
  const c = pick(ANIMALS, 4, seeded('shadow#4')).map(x => x.id)
  assert.deepEqual(a, b)
  assert.notDeepEqual(a, c)
  const r = seeded('x')
  for (let i = 0; i < 1000; i++) { const v = r(); assert.ok(v >= 0 && v < 1) }
})
