// What counts as the right spoken answer (public/voice.js).
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ABC, ANIMALS, COLORS, FRUITS, PLANTS, SHAPES, THINGS, VEHICLES } from '../public/data.js'
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
