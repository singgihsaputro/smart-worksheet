// What the worksheets are made of. Pictures are emoji (drawn by the device, no
// image files to license); sounds are CC0 recordings in public/sounds (see README).
// Every picture has an Indonesian name (`name`, `also`) and an English one
// (`en`, `alsoEn`); `also*` are other names that count when a child says them.

export const ANIMALS = [
  { id: 'cat', emoji: '🐱', name: 'Kucing', en: 'Cat', alsoEn: ['kitty'], food: '🐟', foodName: 'Ikan', foodEn: 'Fish', sound: 'cat' },
  { id: 'dog', emoji: '🐶', name: 'Anjing', en: 'Dog', alsoEn: ['puppy'], food: '🦴', foodName: 'Tulang', foodEn: 'Bone', sound: 'dog' },
  { id: 'cow', emoji: '🐮', name: 'Sapi', en: 'Cow', food: '🌿', foodName: 'Rumput', foodEn: 'Grass', sound: 'cow' },
  { id: 'rooster', emoji: '🐓', name: 'Ayam Jago', also: ['ayam'], en: 'Rooster', alsoEn: ['chicken', 'hen'], food: '🌽', foodName: 'Jagung', foodEn: 'Corn', sound: 'rooster' },
  { id: 'duck', emoji: '🦆', name: 'Bebek', also: ['itik'], en: 'Duck', sound: 'duck' },
  { id: 'sheep', emoji: '🐑', name: 'Domba', also: ['biri biri'], en: 'Sheep', alsoEn: ['lamb'], sound: 'sheep' },
  { id: 'horse', emoji: '🐴', name: 'Kuda', en: 'Horse', alsoEn: ['pony'], food: '🥕', foodName: 'Wortel', foodEn: 'Carrot', sound: 'horse' },
  { id: 'frog', emoji: '🐸', name: 'Katak', also: ['kodok'], en: 'Frog', alsoEn: ['toad'], sound: 'frog' },
  { id: 'goat', emoji: '🐐', name: 'Kambing', en: 'Goat', sound: 'goat' },
  { id: 'owl', emoji: '🦉', name: 'Burung Hantu', en: 'Owl', sound: 'owl' },
  { id: 'bee', emoji: '🐝', name: 'Lebah', en: 'Bee', alsoEn: ['honeybee', 'bumblebee'], food: '🌻', foodName: 'Bunga', foodEn: 'Flower', sound: 'bee' },
  { id: 'bird', emoji: '🐦', name: 'Burung', en: 'Bird', food: '🐛', foodName: 'Ulat', foodEn: 'Caterpillar', sound: 'bird' },
  { id: 'elephant', emoji: '🐘', name: 'Gajah', en: 'Elephant', sound: 'elephant' },
  { id: 'rabbit', emoji: '🐰', name: 'Kelinci', en: 'Rabbit', alsoEn: ['bunny'], food: '🥕', foodName: 'Wortel', foodEn: 'Carrot' },
  { id: 'monkey', emoji: '🐵', name: 'Monyet', also: ['kera'], en: 'Monkey', food: '🍌', foodName: 'Pisang', foodEn: 'Banana' },
  { id: 'mouse', emoji: '🐭', name: 'Tikus', en: 'Mouse', food: '🧀', foodName: 'Keju', foodEn: 'Cheese' },
  { id: 'panda', emoji: '🐼', name: 'Panda', en: 'Panda', alsoEn: ['panda bear'], food: '🎋', foodName: 'Bambu', foodEn: 'Bamboo' },
  { id: 'squirrel', emoji: '🐿️', name: 'Tupai', en: 'Squirrel', food: '🌰', foodName: 'Kacang', foodEn: 'Nut' },
  { id: 'lion', emoji: '🦁', name: 'Singa', en: 'Lion', food: '🍖', foodName: 'Daging', foodEn: 'Meat' },
  { id: 'turtle', emoji: '🐢', name: 'Kura-kura', also: ['kurakura'], en: 'Turtle', alsoEn: ['tortoise'] },
  { id: 'giraffe', emoji: '🦒', name: 'Jerapah', en: 'Giraffe' },
  { id: 'penguin', emoji: '🐧', name: 'Penguin', also: ['pinguin'], en: 'Penguin' },
  { id: 'fish', emoji: '🐠', name: 'Ikan', en: 'Fish' },
  { id: 'butterfly', emoji: '🦋', name: 'Kupu-kupu', also: ['kupukupu'], en: 'Butterfly' },
  { id: 'crab', emoji: '🦀', name: 'Kepiting', en: 'Crab' },
]

// `pl`: the English plural, for "How many apples?".
export const FRUITS = [
  { id: 'apple', emoji: '🍎', name: 'Apel', also: ['apple'], en: 'Apple', pl: 'apples' },
  { id: 'banana', emoji: '🍌', name: 'Pisang', en: 'Banana', pl: 'bananas' },
  { id: 'grapes', emoji: '🍇', name: 'Anggur', en: 'Grapes', alsoEn: ['grape'], pl: 'grapes' },
  { id: 'orange', emoji: '🍊', name: 'Jeruk', en: 'Orange', pl: 'oranges' },
  { id: 'strawberry', emoji: '🍓', name: 'Stroberi', also: ['strawberry', 'stroberry'], en: 'Strawberry', pl: 'strawberries' },
  { id: 'watermelon', emoji: '🍉', name: 'Semangka', en: 'Watermelon', pl: 'watermelons' },
  { id: 'pineapple', emoji: '🍍', name: 'Nanas', also: ['nenas'], en: 'Pineapple', pl: 'pineapples' },
  { id: 'mango', emoji: '🥭', name: 'Mangga', en: 'Mango', pl: 'mangoes' },
  { id: 'pear', emoji: '🍐', name: 'Pir', also: ['pear', 'per'], en: 'Pear', alsoEn: ['pair'], pl: 'pears' },
  { id: 'cherry', emoji: '🍒', name: 'Ceri', also: ['cherry'], en: 'Cherry', alsoEn: ['cherries'], pl: 'cherries' },
  { id: 'kiwi', emoji: '🥝', name: 'Kiwi', en: 'Kiwi', pl: 'kiwis' },
  { id: 'peach', emoji: '🍑', name: 'Persik', also: ['peach'], en: 'Peach', pl: 'peaches' },
  { id: 'lemon', emoji: '🍋', name: 'Lemon', en: 'Lemon', pl: 'lemons' },
  { id: 'coconut', emoji: '🥥', name: 'Kelapa', en: 'Coconut', pl: 'coconuts' },
]

export const THINGS = [
  { id: 'ball', emoji: '⚽', name: 'Bola', en: 'Ball', alsoEn: ['football', 'soccer ball'] },
  { id: 'pencil', emoji: '✏️', name: 'Pensil', en: 'Pencil' },
  { id: 'bag', emoji: '🎒', name: 'Tas', also: ['ransel'], en: 'Bag', alsoEn: ['backpack', 'school bag'] },
  { id: 'teddy', emoji: '🧸', name: 'Boneka', also: ['boneka beruang'], en: 'Teddy Bear', alsoEn: ['teddy', 'doll'] },
  { id: 'umbrella', emoji: '☂️', name: 'Payung', en: 'Umbrella' },
  { id: 'shoe', emoji: '👟', name: 'Sepatu', en: 'Shoe', alsoEn: ['shoes', 'sneaker'] },
  { id: 'balloon', emoji: '🎈', name: 'Balon', en: 'Balloon' },
  { id: 'clock', emoji: '⏰', name: 'Jam', also: ['jam weker', 'weker'], en: 'Clock', alsoEn: ['alarm clock'] },
  { id: 'book', emoji: '📚', name: 'Buku', en: 'Book', alsoEn: ['books'] },
  { id: 'kite', emoji: '🪁', name: 'Layang-layang', also: ['layangan'], en: 'Kite' },
  { id: 'spoon', emoji: '🥄', name: 'Sendok', en: 'Spoon' },
  { id: 'key', emoji: '🔑', name: 'Kunci', en: 'Key' },
  { id: 'scissors', emoji: '✂️', name: 'Gunting', en: 'Scissors' },
  { id: 'lamp', emoji: '💡', name: 'Lampu', also: ['bohlam'], en: 'Light Bulb', alsoEn: ['lamp', 'bulb', 'light'] },
  { id: 'tv', emoji: '📺', name: 'Televisi', also: ['tv', 'tivi', 'teve'], en: 'Television', alsoEn: ['tv', 'telly'] },
  { id: 'gift', emoji: '🎁', name: 'Kado', also: ['hadiah'], en: 'Gift', alsoEn: ['present'] },
  { id: 'bell', emoji: '🔔', name: 'Lonceng', also: ['bel'], en: 'Bell' },
  { id: 'bed', emoji: '🛏️', name: 'Kasur', also: ['tempat tidur', 'ranjang'], en: 'Bed' },
  { id: 'broom', emoji: '🧹', name: 'Sapu', en: 'Broom' },
  { id: 'glasses', emoji: '👓', name: 'Kacamata', also: ['kaca mata'], en: 'Glasses', alsoEn: ['spectacles'] },
  { id: 'hat', emoji: '🎩', name: 'Topi', en: 'Hat', alsoEn: ['top hat'] },
  { id: 'camera', emoji: '📷', name: 'Kamera', en: 'Camera' },
]

export const VEHICLES = [
  { id: 'car', emoji: '🚗', name: 'Mobil', en: 'Car' },
  { id: 'bus', emoji: '🚌', name: 'Bus', also: ['bis'], en: 'Bus' },
  { id: 'train', emoji: '🚆', name: 'Kereta', also: ['kereta api'], en: 'Train' },
  { id: 'plane', emoji: '✈️', name: 'Pesawat', also: ['pesawat terbang'], en: 'Airplane', alsoEn: ['plane', 'aeroplane', 'jet'] },
  { id: 'ship', emoji: '🚢', name: 'Kapal', also: ['kapal laut'], en: 'Ship' },
  { id: 'bike', emoji: '🚲', name: 'Sepeda', en: 'Bicycle', alsoEn: ['bike'] },
  { id: 'motorbike', emoji: '🏍️', name: 'Motor', also: ['sepeda motor'], en: 'Motorbike', alsoEn: ['motorcycle', 'motor bike'] },
  { id: 'helicopter', emoji: '🚁', name: 'Helikopter', also: ['heli'], en: 'Helicopter' },
  { id: 'boat', emoji: '⛵', name: 'Perahu', also: ['perahu layar'], en: 'Boat', alsoEn: ['sailboat', 'sailing boat'] },
  { id: 'truck', emoji: '🚚', name: 'Truk', also: ['truck'], en: 'Truck', alsoEn: ['lorry'] },
  { id: 'ambulance', emoji: '🚑', name: 'Ambulans', also: ['ambulan', 'ambulance'], en: 'Ambulance' },
  { id: 'firetruck', emoji: '🚒', name: 'Pemadam Kebakaran', also: ['mobil pemadam', 'pemadam', 'damkar'], en: 'Fire Truck', alsoEn: ['fire engine'] },
  { id: 'taxi', emoji: '🚕', name: 'Taksi', also: ['taxi'], en: 'Taxi', alsoEn: ['cab'] },
  { id: 'rocket', emoji: '🚀', name: 'Roket', en: 'Rocket' },
  { id: 'tractor', emoji: '🚜', name: 'Traktor', en: 'Tractor' },
  { id: 'police', emoji: '🚓', name: 'Mobil Polisi', also: ['polisi'], en: 'Police Car', alsoEn: ['police'] },
]

export const PLANTS = [
  { id: 'tree', emoji: '🌳', name: 'Pohon', en: 'Tree' },
  { id: 'pine', emoji: '🌲', name: 'Cemara', also: ['pohon cemara'], en: 'Pine Tree', alsoEn: ['pine', 'christmas tree'] },
  { id: 'palm', emoji: '🌴', name: 'Pohon Kelapa', also: ['pohon palem', 'palem'], en: 'Palm Tree', alsoEn: ['palm', 'coconut tree'] },
  { id: 'cactus', emoji: '🌵', name: 'Kaktus', en: 'Cactus' },
  { id: 'sunflower', emoji: '🌻', name: 'Bunga Matahari', en: 'Sunflower' },
  { id: 'rose', emoji: '🌹', name: 'Mawar', also: ['bunga mawar'], en: 'Rose' },
  { id: 'tulip', emoji: '🌷', name: 'Tulip', also: ['bunga tulip'], en: 'Tulip' },
  { id: 'hibiscus', emoji: '🌺', name: 'Kembang Sepatu', en: 'Hibiscus' },
  { id: 'sprout', emoji: '🌱', name: 'Tunas', en: 'Sprout', alsoEn: ['seedling'] },
  { id: 'clover', emoji: '🍀', name: 'Semanggi', en: 'Clover', alsoEn: ['four leaf clover'] },
  { id: 'rice', emoji: '🌾', name: 'Padi', en: 'Rice Plant', alsoEn: ['rice', 'paddy', 'wheat'] },
  { id: 'bamboo', emoji: '🎋', name: 'Bambu', en: 'Bamboo' },
  { id: 'corn', emoji: '🌽', name: 'Jagung', en: 'Corn', alsoEn: ['maize'] },
  { id: 'carrot', emoji: '🥕', name: 'Wortel', en: 'Carrot' },
  { id: 'broccoli', emoji: '🥦', name: 'Brokoli', en: 'Broccoli' },
  { id: 'tomato', emoji: '🍅', name: 'Tomat', en: 'Tomato' },
  { id: 'chili', emoji: '🌶️', name: 'Cabai', also: ['cabe', 'lombok'], en: 'Chili', alsoEn: ['chili pepper', 'chilli', 'pepper'] },
  { id: 'eggplant', emoji: '🍆', name: 'Terong', also: ['terung'], en: 'Eggplant', alsoEn: ['aubergine'] },
]

export const COLORS = [
  { id: 'red', name: 'Merah', en: 'Red', hex: '#E53935' },
  { id: 'orange', name: 'Oranye', also: ['jingga', 'orange', 'oren'], en: 'Orange', hex: '#FB8C00' },
  { id: 'yellow', name: 'Kuning', en: 'Yellow', hex: '#FDD835' },
  { id: 'green', name: 'Hijau', en: 'Green', hex: '#43A047' },
  { id: 'blue', name: 'Biru', en: 'Blue', hex: '#1E88E5' },
  { id: 'purple', name: 'Ungu', en: 'Purple', alsoEn: ['violet'], hex: '#8E24AA' },
  { id: 'pink', name: 'Merah Muda', also: ['pink', 'merah jambu'], en: 'Pink', hex: '#F06292' },
  { id: 'brown', name: 'Cokelat', also: ['coklat'], en: 'Brown', hex: '#8D5A3B' },
  { id: 'black', name: 'Hitam', en: 'Black', hex: '#263238' },
  { id: 'white', name: 'Putih', en: 'White', hex: '#FFFFFF' },
  { id: 'gray', name: 'Abu-abu', also: ['abu', 'kelabu'], en: 'Gray', alsoEn: ['grey'], hex: '#9E9E9E' },
]

// Flat shapes, drawn in a 100×100 SVG box.
export const SHAPES = [
  { id: 'circle', name: 'Lingkaran', also: ['bulat', 'bundar'], en: 'Circle', alsoEn: ['round'], svg: '<circle cx="50" cy="50" r="42"/>' },
  { id: 'square', name: 'Persegi', also: ['kotak', 'segi empat'], en: 'Square', svg: '<rect x="12" y="12" width="76" height="76" rx="3"/>' },
  { id: 'rectangle', name: 'Persegi Panjang', en: 'Rectangle', svg: '<rect x="4" y="25" width="92" height="50" rx="3"/>' },
  { id: 'triangle', name: 'Segitiga', also: ['segi tiga'], en: 'Triangle', svg: '<polygon points="50,8 95,88 5,88"/>' },
  { id: 'star', name: 'Bintang', en: 'Star', svg: '<polygon points="50,7 61.2,37.6 93.7,38.8 68.1,58.9 77,90.2 50,72 23,90.2 31.9,58.9 6.3,38.8 38.8,37.6"/>' },
  { id: 'heart', name: 'Hati', also: ['love', 'cinta'], en: 'Heart', alsoEn: ['love'], svg: '<path d="M50 88C20 68 4 50 4 32 4 16 16 6 29 6c10 0 17 6 21 14 4-8 11-14 21-14 13 0 25 10 25 26 0 18-16 36-46 56z"/>' },
  { id: 'oval', name: 'Oval', also: ['lonjong', 'elips'], en: 'Oval', alsoEn: ['ellipse'], svg: '<ellipse cx="50" cy="50" rx="45" ry="30"/>' },
  { id: 'diamond', name: 'Belah Ketupat', also: ['wajik', 'ketupat'], en: 'Diamond', alsoEn: ['rhombus'], svg: '<polygon points="50,4 88,50 50,96 12,50"/>' },
  { id: 'pentagon', name: 'Segi Lima', also: ['pentagon'], en: 'Pentagon', svg: '<polygon points="50,10 91.8,40.4 75.9,89.6 24.1,89.6 8.2,40.4"/>' },
  { id: 'hexagon', name: 'Segi Enam', also: ['heksagon'], en: 'Hexagon', svg: '<polygon points="96,50 73,89.8 27,89.8 4,50 27,10.2 73,10.2"/>' },
  { id: 'crescent', name: 'Bulan Sabit', also: ['bulan'], en: 'Crescent', alsoEn: ['moon', 'crescent moon'], svg: '<path d="M72 8A42 42 0 1 0 72 92 50 50 0 0 1 72 8z"/>' },
]

// One picture word per letter, for Belajar → Huruf (Learn → Letters).
export const ABC = [
  ['A', 'Apel', '🍎'], ['B', 'Bola', '⚽'], ['C', 'Ceri', '🍒'], ['D', 'Domba', '🐑'], ['E', 'Elang', '🦅'],
  ['F', 'Foto', '📷'], ['G', 'Gajah', '🐘'], ['H', 'Harimau', '🐯'], ['I', 'Ikan', '🐟'], ['J', 'Jeruk', '🍊'],
  ['K', 'Kucing', '🐱'], ['L', 'Lebah', '🐝'], ['M', 'Mobil', '🚗'], ['N', 'Nanas', '🍍'], ['O', 'Ombak', '🌊'],
  ['P', 'Pisang', '🍌'], ['Q', 'Quran', '📖'], ['R', 'Rumah', '🏠'], ['S', 'Sapi', '🐮'], ['T', 'Topi', '🎩'],
  ['U', 'Ular', '🐍'], ['V', 'Vas', '🏺'], ['W', 'Wortel', '🥕'], ['X', 'Xilofon', '🎶'], ['Y', 'Yoyo', '🪀'], ['Z', 'Zebra', '🦓'],
]
export const ABC_EN = [
  ['A', 'Apple', '🍎'], ['B', 'Ball', '⚽'], ['C', 'Cat', '🐱'], ['D', 'Dog', '🐶'], ['E', 'Elephant', '🐘'],
  ['F', 'Fish', '🐟'], ['G', 'Grapes', '🍇'], ['H', 'Hat', '🎩'], ['I', 'Ice cream', '🍦'], ['J', 'Juice', '🧃'],
  ['K', 'Key', '🔑'], ['L', 'Lion', '🦁'], ['M', 'Monkey', '🐵'], ['N', 'Nose', '👃'], ['O', 'Orange', '🍊'],
  ['P', 'Panda', '🐼'], ['Q', 'Queen', '👸'], ['R', 'Rabbit', '🐰'], ['S', 'Sun', '☀️'], ['T', 'Tree', '🌳'],
  ['U', 'Umbrella', '☂️'], ['V', 'Violin', '🎻'], ['W', 'Whale', '🐳'], ['X', 'Xylophone', '🎶'], ['Y', 'Yo-yo', '🪀'], ['Z', 'Zebra', '🦓'],
]

// The hijaiyah letters in the order Indonesian children learn them (as in Ayok Ngaji):
// [letter, Indonesian name, English name].
export const HIJAIYAH = [
  ['ا', 'Alif', 'Alif'], ['ب', 'Ba', 'Ba'], ['ت', 'Ta', 'Ta'], ['ث', 'Tsa', 'Tha'], ['ج', 'Jim', 'Jim'],
  ['ح', 'Ha', 'Ha'], ['خ', 'Kho', 'Kha'], ['د', 'Dal', 'Dal'], ['ذ', 'Dzal', 'Dhal'], ['ر', 'Ro', 'Ra'],
  ['ز', 'Zai', 'Zay'], ['س', 'Sin', 'Sin'], ['ش', 'Syin', 'Shin'], ['ص', 'Shod', 'Sad'], ['ض', 'Dhod', 'Dad'],
  ['ط', 'Tho', 'Ta'], ['ظ', 'Dzho', 'Za'], ['ع', "'Ain", "'Ayn"], ['غ', 'Ghoin', 'Ghayn'], ['ف', 'Fa', 'Fa'],
  ['ق', 'Qof', 'Qaf'], ['ك', 'Kaf', 'Kaf'], ['ل', 'Lam', 'Lam'], ['م', 'Mim', 'Mim'], ['ن', 'Nun', 'Nun'],
  ['و', 'Wau', 'Waw'], ['ه', 'Ha', 'Ha'], ['لا', 'Lam Alif', 'Lam Alif'], ['ء', 'Hamzah', 'Hamza'], ['ي', 'Ya', 'Ya'],
]

// Short, everyday words for "Tebak Kata" / "Read the Word": read it aloud, and the picture appears.
export const WORDS = [
  { word: 'BOLA', emoji: '⚽' }, { word: 'APEL', emoji: '🍎' }, { word: 'IKAN', emoji: '🐟' }, { word: 'BUKU', emoji: '📚' },
  { word: 'KUDA', emoji: '🐴' }, { word: 'SAPI', emoji: '🐮' }, { word: 'RUMAH', emoji: '🏠' }, { word: 'MOBIL', emoji: '🚗' },
  { word: 'BULAN', emoji: '🌙' }, { word: 'BINTANG', emoji: '⭐' }, { word: 'PISANG', emoji: '🍌' }, { word: 'KUCING', emoji: '🐱' },
  { word: 'TOPI', emoji: '🎩' }, { word: 'SUSU', emoji: '🥛' }, { word: 'ROTI', emoji: '🍞' }, { word: 'JERUK', emoji: '🍊' },
  { word: 'BUNGA', emoji: '🌸' }, { word: 'PAYUNG', emoji: '☂️' }, { word: 'SEPATU', emoji: '👟' }, { word: 'BALON', emoji: '🎈' },
]
export const WORDS_EN = [
  { word: 'CAT', emoji: '🐱' }, { word: 'DOG', emoji: '🐶' }, { word: 'SUN', emoji: '☀️' }, { word: 'HAT', emoji: '🎩' },
  { word: 'CAR', emoji: '🚗' }, { word: 'BUS', emoji: '🚌' }, { word: 'BEE', emoji: '🐝' }, { word: 'COW', emoji: '🐮' },
  { word: 'BALL', emoji: '⚽' }, { word: 'FISH', emoji: '🐟' }, { word: 'MOON', emoji: '🌙' }, { word: 'STAR', emoji: '⭐' },
  { word: 'BOOK', emoji: '📚' }, { word: 'CAKE', emoji: '🍰' }, { word: 'MILK', emoji: '🥛' }, { word: 'DUCK', emoji: '🦆' },
  { word: 'TREE', emoji: '🌳' }, { word: 'APPLE', emoji: '🍎' }, { word: 'HOUSE', emoji: '🏠' }, { word: 'BREAD', emoji: '🍞' },
]

/**
 * A repeatable random number generator: the same text always gives the same
 * sequence, so a level always has the same puzzle (see the level map in app.js).
 */
export function seeded(text) {
  let h = 1779033703 ^ text.length
  for (let i = 0; i < text.length; i++) { h = Math.imul(h ^ text.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19) }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return (h >>> 0) / 4294967296
  }
}

/** Fisher–Yates; returns a new array. */
export function shuffle(list, rand = Math.random) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const pick = (list, n, rand = Math.random) => shuffle(list, rand).slice(0, n)
