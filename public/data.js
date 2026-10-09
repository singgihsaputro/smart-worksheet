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
  { id: 'apple', emoji: '🍎', name: 'Apel', also: ['apple'] }, { id: 'banana', emoji: '🍌', name: 'Pisang' },
  { id: 'grapes', emoji: '🍇', name: 'Anggur' }, { id: 'orange', emoji: '🍊', name: 'Jeruk' },
  { id: 'strawberry', emoji: '🍓', name: 'Stroberi', also: ['strawberry', 'stroberry'] }, { id: 'watermelon', emoji: '🍉', name: 'Semangka' },
  { id: 'pineapple', emoji: '🍍', name: 'Nanas', also: ['nenas'] }, { id: 'mango', emoji: '🥭', name: 'Mangga' },
  { id: 'pear', emoji: '🍐', name: 'Pir', also: ['pear', 'per'] }, { id: 'cherry', emoji: '🍒', name: 'Ceri', also: ['cherry'] },
  { id: 'kiwi', emoji: '🥝', name: 'Kiwi' }, { id: 'peach', emoji: '🍑', name: 'Persik', also: ['peach'] },
  { id: 'lemon', emoji: '🍋', name: 'Lemon' }, { id: 'coconut', emoji: '🥥', name: 'Kelapa' },
]

export const THINGS = [
  { id: 'ball', emoji: '⚽', name: 'Bola' }, { id: 'pencil', emoji: '✏️', name: 'Pensil' },
  { id: 'bag', emoji: '🎒', name: 'Tas', also: ['ransel'] }, { id: 'teddy', emoji: '🧸', name: 'Boneka', also: ['boneka beruang'] },
  { id: 'umbrella', emoji: '☂️', name: 'Payung' }, { id: 'shoe', emoji: '👟', name: 'Sepatu' },
  { id: 'balloon', emoji: '🎈', name: 'Balon' }, { id: 'clock', emoji: '⏰', name: 'Jam', also: ['jam weker', 'weker'] },
  { id: 'book', emoji: '📚', name: 'Buku' }, { id: 'kite', emoji: '🪁', name: 'Layang-layang', also: ['layangan'] },
  { id: 'spoon', emoji: '🥄', name: 'Sendok' }, { id: 'key', emoji: '🔑', name: 'Kunci' },
  { id: 'scissors', emoji: '✂️', name: 'Gunting' }, { id: 'lamp', emoji: '💡', name: 'Lampu', also: ['bohlam'] },
  { id: 'tv', emoji: '📺', name: 'Televisi', also: ['tv', 'tivi', 'teve'] }, { id: 'gift', emoji: '🎁', name: 'Kado', also: ['hadiah'] },
  { id: 'bell', emoji: '🔔', name: 'Lonceng', also: ['bel'] }, { id: 'bed', emoji: '🛏️', name: 'Kasur', also: ['tempat tidur', 'ranjang'] },
  { id: 'broom', emoji: '🧹', name: 'Sapu' }, { id: 'glasses', emoji: '👓', name: 'Kacamata', also: ['kaca mata'] },
  { id: 'hat', emoji: '🎩', name: 'Topi' }, { id: 'camera', emoji: '📷', name: 'Kamera' },
]

export const VEHICLES = [
  { id: 'car', emoji: '🚗', name: 'Mobil' }, { id: 'bus', emoji: '🚌', name: 'Bus', also: ['bis'] },
  { id: 'train', emoji: '🚆', name: 'Kereta', also: ['kereta api'] }, { id: 'plane', emoji: '✈️', name: 'Pesawat', also: ['pesawat terbang'] },
  { id: 'ship', emoji: '🚢', name: 'Kapal', also: ['kapal laut'] }, { id: 'bike', emoji: '🚲', name: 'Sepeda' },
  { id: 'motorbike', emoji: '🏍️', name: 'Motor', also: ['sepeda motor'] }, { id: 'helicopter', emoji: '🚁', name: 'Helikopter', also: ['heli'] },
  { id: 'boat', emoji: '⛵', name: 'Perahu', also: ['perahu layar'] }, { id: 'truck', emoji: '🚚', name: 'Truk', also: ['truck'] },
  { id: 'ambulance', emoji: '🚑', name: 'Ambulans', also: ['ambulan', 'ambulance'] },
  { id: 'firetruck', emoji: '🚒', name: 'Pemadam Kebakaran', also: ['mobil pemadam', 'pemadam', 'damkar'] },
  { id: 'taxi', emoji: '🚕', name: 'Taksi', also: ['taxi'] }, { id: 'rocket', emoji: '🚀', name: 'Roket' },
  { id: 'tractor', emoji: '🚜', name: 'Traktor' }, { id: 'police', emoji: '🚓', name: 'Mobil Polisi', also: ['polisi'] },
]

export const PLANTS = [
  { id: 'tree', emoji: '🌳', name: 'Pohon' }, { id: 'pine', emoji: '🌲', name: 'Cemara', also: ['pohon cemara'] },
  { id: 'palm', emoji: '🌴', name: 'Pohon Kelapa', also: ['pohon palem', 'palem'] }, { id: 'cactus', emoji: '🌵', name: 'Kaktus' },
  { id: 'sunflower', emoji: '🌻', name: 'Bunga Matahari' }, { id: 'rose', emoji: '🌹', name: 'Mawar', also: ['bunga mawar'] },
  { id: 'tulip', emoji: '🌷', name: 'Tulip', also: ['bunga tulip'] }, { id: 'hibiscus', emoji: '🌺', name: 'Kembang Sepatu' },
  { id: 'sprout', emoji: '🌱', name: 'Tunas' }, { id: 'clover', emoji: '🍀', name: 'Semanggi' },
  { id: 'rice', emoji: '🌾', name: 'Padi' }, { id: 'bamboo', emoji: '🎋', name: 'Bambu' },
  { id: 'corn', emoji: '🌽', name: 'Jagung' }, { id: 'carrot', emoji: '🥕', name: 'Wortel' },
  { id: 'broccoli', emoji: '🥦', name: 'Brokoli' }, { id: 'tomato', emoji: '🍅', name: 'Tomat' },
  { id: 'chili', emoji: '🌶️', name: 'Cabai', also: ['cabe', 'lombok'] }, { id: 'eggplant', emoji: '🍆', name: 'Terong', also: ['terung'] },
]

// One picture word per letter, for Belajar → Huruf.
export const ABC = [
  ['A', 'Apel', '🍎'], ['B', 'Bola', '⚽'], ['C', 'Ceri', '🍒'], ['D', 'Domba', '🐑'], ['E', 'Elang', '🦅'],
  ['F', 'Foto', '📷'], ['G', 'Gajah', '🐘'], ['H', 'Harimau', '🐯'], ['I', 'Ikan', '🐟'], ['J', 'Jeruk', '🍊'],
  ['K', 'Kucing', '🐱'], ['L', 'Lebah', '🐝'], ['M', 'Mobil', '🚗'], ['N', 'Nanas', '🍍'], ['O', 'Ombak', '🌊'],
  ['P', 'Pisang', '🍌'], ['Q', 'Quran', '📖'], ['R', 'Rumah', '🏠'], ['S', 'Sapi', '🐮'], ['T', 'Topi', '🎩'],
  ['U', 'Ular', '🐍'], ['V', 'Vas', '🏺'], ['W', 'Wortel', '🥕'], ['X', 'Xilofon', '🎶'], ['Y', 'Yoyo', '🪀'], ['Z', 'Zebra', '🦓'],
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
