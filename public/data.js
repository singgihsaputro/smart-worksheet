// What the worksheets are made of. Pictures are emoji (drawn by the device, no
// image files to license); sounds are CC0 recordings in public/sounds (see README).

export const ANIMALS = [
  { id: 'cat', emoji: '🐱', name: 'Kucing', food: '🐟', foodName: 'Ikan', sound: 'cat' },
  { id: 'dog', emoji: '🐶', name: 'Anjing', food: '🦴', foodName: 'Tulang', sound: 'dog' },
  { id: 'cow', emoji: '🐮', name: 'Sapi', food: '🌿', foodName: 'Rumput', sound: 'cow' },
  { id: 'rooster', emoji: '🐓', name: 'Ayam Jago', also: ['ayam'], food: '🌽', foodName: 'Jagung', sound: 'rooster' },
  { id: 'duck', emoji: '🦆', name: 'Bebek', also: ['itik'], sound: 'duck' },
  { id: 'sheep', emoji: '🐑', name: 'Domba', also: ['biri biri'], sound: 'sheep' },
  { id: 'horse', emoji: '🐴', name: 'Kuda', food: '🥕', foodName: 'Wortel', sound: 'horse' },
  { id: 'frog', emoji: '🐸', name: 'Katak', also: ['kodok'], sound: 'frog' },
  { id: 'goat', emoji: '🐐', name: 'Kambing', sound: 'goat' },
  { id: 'owl', emoji: '🦉', name: 'Burung Hantu', sound: 'owl' },
  { id: 'bee', emoji: '🐝', name: 'Lebah', food: '🌻', foodName: 'Bunga', sound: 'bee' },
  { id: 'bird', emoji: '🐦', name: 'Burung', food: '🐛', foodName: 'Ulat', sound: 'bird' },
  { id: 'elephant', emoji: '🐘', name: 'Gajah', sound: 'elephant' },
  { id: 'rabbit', emoji: '🐰', name: 'Kelinci', food: '🥕', foodName: 'Wortel' },
  { id: 'monkey', emoji: '🐵', name: 'Monyet', also: ['kera'], food: '🍌', foodName: 'Pisang' },
  { id: 'mouse', emoji: '🐭', name: 'Tikus', food: '🧀', foodName: 'Keju' },
  { id: 'panda', emoji: '🐼', name: 'Panda', food: '🎋', foodName: 'Bambu' },
  { id: 'squirrel', emoji: '🐿️', name: 'Tupai', food: '🌰', foodName: 'Kacang' },
  { id: 'lion', emoji: '🦁', name: 'Singa', food: '🍖', foodName: 'Daging' },
  { id: 'turtle', emoji: '🐢', name: 'Kura-kura', also: ['kurakura'] },
  { id: 'giraffe', emoji: '🦒', name: 'Jerapah' },
  { id: 'penguin', emoji: '🐧', name: 'Penguin', also: ['pinguin'] },
  { id: 'fish', emoji: '🐠', name: 'Ikan' },
  { id: 'butterfly', emoji: '🦋', name: 'Kupu-kupu', also: ['kupukupu'] },
  { id: 'crab', emoji: '🦀', name: 'Kepiting' },
]

export const FRUITS = [
  { id: 'apple', emoji: '🍎', name: 'Apel' }, { id: 'banana', emoji: '🍌', name: 'Pisang' },
  { id: 'grapes', emoji: '🍇', name: 'Anggur' }, { id: 'orange', emoji: '🍊', name: 'Jeruk' },
  { id: 'strawberry', emoji: '🍓', name: 'Stroberi' }, { id: 'watermelon', emoji: '🍉', name: 'Semangka' },
  { id: 'pineapple', emoji: '🍍', name: 'Nanas' }, { id: 'mango', emoji: '🥭', name: 'Mangga' },
  { id: 'pear', emoji: '🍐', name: 'Pir' }, { id: 'cherry', emoji: '🍒', name: 'Ceri' },
  { id: 'kiwi', emoji: '🥝', name: 'Kiwi' }, { id: 'peach', emoji: '🍑', name: 'Persik' },
]

export const THINGS = [
  { id: 'car', emoji: '🚗', name: 'Mobil' }, { id: 'ball', emoji: '⚽', name: 'Bola' },
  { id: 'pencil', emoji: '✏️', name: 'Pensil' }, { id: 'bag', emoji: '🎒', name: 'Tas' },
  { id: 'teddy', emoji: '🧸', name: 'Boneka' }, { id: 'bike', emoji: '🚲', name: 'Sepeda' },
  { id: 'umbrella', emoji: '☂️', name: 'Payung' }, { id: 'shoe', emoji: '👟', name: 'Sepatu' },
  { id: 'balloon', emoji: '🎈', name: 'Balon' }, { id: 'clock', emoji: '⏰', name: 'Jam' },
  { id: 'book', emoji: '📚', name: 'Buku' }, { id: 'kite', emoji: '🪁', name: 'Layang-layang' },
]

// Short, everyday words for "Tebak Kata": read it aloud, and the picture appears.
export const WORDS = [
  { word: 'BOLA', emoji: '⚽' }, { word: 'APEL', emoji: '🍎' }, { word: 'IKAN', emoji: '🐟' }, { word: 'BUKU', emoji: '📚' },
  { word: 'KUDA', emoji: '🐴' }, { word: 'SAPI', emoji: '🐮' }, { word: 'RUMAH', emoji: '🏠' }, { word: 'MOBIL', emoji: '🚗' },
  { word: 'BULAN', emoji: '🌙' }, { word: 'BINTANG', emoji: '⭐' }, { word: 'PISANG', emoji: '🍌' }, { word: 'KUCING', emoji: '🐱' },
  { word: 'TOPI', emoji: '🎩' }, { word: 'SUSU', emoji: '🥛' }, { word: 'ROTI', emoji: '🍞' }, { word: 'JERUK', emoji: '🍊' },
  { word: 'BUNGA', emoji: '🌸' }, { word: 'PAYUNG', emoji: '☂️' }, { word: 'SEPATU', emoji: '👟' }, { word: 'BALON', emoji: '🎈' },
]

/** Fisher–Yates; returns a new array. */
export function shuffle(list) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const pick = (list, n) => shuffle(list).slice(0, n)
