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

export const COLORS = [
  { id: 'red', name: 'Merah', hex: '#E53935' }, { id: 'orange', name: 'Oranye', hex: '#FB8C00', also: ['jingga', 'orange', 'oren'] },
  { id: 'yellow', name: 'Kuning', hex: '#FDD835' }, { id: 'green', name: 'Hijau', hex: '#43A047' },
  { id: 'blue', name: 'Biru', hex: '#1E88E5' }, { id: 'purple', name: 'Ungu', hex: '#8E24AA' },
  { id: 'pink', name: 'Merah Muda', hex: '#F06292', also: ['pink', 'merah jambu'] }, { id: 'brown', name: 'Cokelat', hex: '#8D5A3B', also: ['coklat'] },
  { id: 'black', name: 'Hitam', hex: '#263238' }, { id: 'white', name: 'Putih', hex: '#FFFFFF' },
  { id: 'gray', name: 'Abu-abu', hex: '#9E9E9E', also: ['abu', 'kelabu'] },
]

// Flat shapes, drawn in a 100×100 SVG box.
export const SHAPES = [
  { id: 'circle', name: 'Lingkaran', also: ['bulat', 'bundar'], svg: '<circle cx="50" cy="50" r="42"/>' },
  { id: 'square', name: 'Persegi', also: ['kotak', 'segi empat'], svg: '<rect x="12" y="12" width="76" height="76" rx="3"/>' },
  { id: 'rectangle', name: 'Persegi Panjang', svg: '<rect x="4" y="25" width="92" height="50" rx="3"/>' },
  { id: 'triangle', name: 'Segitiga', also: ['segi tiga'], svg: '<polygon points="50,8 95,88 5,88"/>' },
  { id: 'star', name: 'Bintang', svg: '<polygon points="50,7 61.2,37.6 93.7,38.8 68.1,58.9 77,90.2 50,72 23,90.2 31.9,58.9 6.3,38.8 38.8,37.6"/>' },
  { id: 'heart', name: 'Hati', also: ['love', 'cinta'], svg: '<path d="M50 88C20 68 4 50 4 32 4 16 16 6 29 6c10 0 17 6 21 14 4-8 11-14 21-14 13 0 25 10 25 26 0 18-16 36-46 56z"/>' },
  { id: 'oval', name: 'Oval', also: ['lonjong', 'elips'], svg: '<ellipse cx="50" cy="50" rx="45" ry="30"/>' },
  { id: 'diamond', name: 'Belah Ketupat', also: ['wajik', 'ketupat'], svg: '<polygon points="50,4 88,50 50,96 12,50"/>' },
  { id: 'pentagon', name: 'Segi Lima', also: ['pentagon'], svg: '<polygon points="50,10 91.8,40.4 75.9,89.6 24.1,89.6 8.2,40.4"/>' },
  { id: 'hexagon', name: 'Segi Enam', also: ['heksagon'], svg: '<polygon points="96,50 73,89.8 27,89.8 4,50 27,10.2 73,10.2"/>' },
  { id: 'crescent', name: 'Bulan Sabit', also: ['bulan'], svg: '<path d="M72 8A42 42 0 1 0 72 92 50 50 0 0 1 72 8z"/>' },
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
