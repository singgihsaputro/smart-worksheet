// Listening for a child's answer with the browser's speech recognition
// (Chrome, Safari, Edge). The browser's own service turns speech into text;
// nothing is recorded or stored here. Where it's missing (e.g. Firefox), the
// voice games fall back to tapping the answer.

const Recognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
export const canListen = !!Recognition

/**
 * Listens once (one utterance, Indonesian) and resolves with what was heard:
 * every alternative the recogniser offers, best first. Resolves [] on silence;
 * rejects with the browser's error code when listening isn't possible.
 */
export function listen({ onStart } = {}) {
  return new Promise((resolve, reject) => {
    const rec = new Recognition()
    rec.lang = 'id-ID'
    rec.continuous = false
    rec.interimResults = false
    rec.maxAlternatives = 5
    let heard = [], failed = null
    const stop = setTimeout(() => rec.abort(), 9000) // never leave the mic open
    rec.onstart = () => onStart?.()
    rec.onresult = e => { heard = Array.from(e.results[0] ?? [], alt => alt.transcript) }
    rec.onerror = e => { if (e.error !== 'no-speech' && e.error !== 'aborted') failed = e.error }
    rec.onend = () => { clearTimeout(stop); failed ? reject(new Error(failed)) : resolve(heard) }
    try { rec.start() } catch (e) { clearTimeout(stop); reject(e) }
  })
}

const clean = text => text.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .replace(/[-_]/g, ' ').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim()

function distance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return d[a.length][b.length]
}

/**
 * Whether any heard alternative says one of the accepted answers: the whole
 * thing, a word in it, or — for longer words — one letter off (a child's
 * "kucin" for kucing). Short answers must be exact, and so must everything
 * when `exact` (numbers and letters, where one letter off is another answer).
 */
export function said(heard, accepted, { exact = false } = {}) {
  const answers = accepted.map(clean).filter(Boolean)
  return heard.map(clean).some(text => {
    const words = text.split(' ')
    return answers.some(answer => {
      if (text === answer) return true
      // Inside a sentence — but "tujuh belas" (17) doesn't say "tujuh" (7).
      const at = ` ${text} `.indexOf(` ${answer} `)
      if (at >= 0 && !/^(belas|puluh|ratus|ribu)\b/.test(text.slice(at + answer.length).trim())) return true
      if (exact || answer.includes(' ')) return false
      return answer.length >= 5 && words.some(w => distance(w, answer) <= 1)
    })
  })
}

// ── What counts as the right answer ─────────────────────────────────────────

const UNITS = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan']
/** The ways a child (or the recogniser) may say n, 0..20. */
export function numberWords(n) {
  const words = n < 10 ? [UNITS[n]] : n === 10 ? ['sepuluh'] : n === 11 ? ['sebelas'] : n < 20 ? [`${UNITS[n - 10]} belas`] : ['dua puluh']
  return [String(n), ...words]
}

// Indonesian letter names, plus what recognisers tend to write for them.
const LETTERS = {
  A: ['a', 'ah'], B: ['be', 'b', 'beh'], C: ['ce', 'c', 'che', 'se'], D: ['de', 'd', 'deh'], E: ['e', 'eh'],
  F: ['ef', 'f', 'ep'], G: ['ge', 'g', 'geh'], H: ['ha', 'h'], I: ['i', 'ih'], J: ['je', 'j', 'jeh'],
  K: ['ka', 'k'], L: ['el', 'l'], M: ['em', 'm'], N: ['en', 'n'], O: ['o', 'oh'], P: ['pe', 'p', 'peh'],
  Q: ['ki', 'q', 'kiu', 'kyu', 'qi'], R: ['er', 'r'], S: ['es', 's'], T: ['te', 't', 'teh'], U: ['u', 'uh'],
  V: ['ve', 'v', 'fe', 'veh'], W: ['we', 'w', 'weh'], X: ['eks', 'x', 'ex', 'iks'], Y: ['ye', 'y', 'yeh'], Z: ['zet', 'z', 'set', 'zed'],
}
export const ALPHABET = Object.keys(LETTERS)
export const letterWords = letter => LETTERS[letter]
