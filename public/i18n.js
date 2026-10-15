// Indonesian or English: every word on screen, every name a child says, and the
// voices that listen and speak. Indonesian unless the switcher has picked English.
const KEY = 'sw.lang'
const saved = (() => { try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null } })()

export let lang = saved === 'en' ? 'en' : 'id'

export function setLang(next) {
  lang = next === 'en' ? 'en' : 'id'
  try { localStorage.setItem(KEY, JSON.stringify(lang)) } catch { /* private mode: this visit only */ }
  if (typeof document !== 'undefined') document.documentElement.lang = lang
}

/** The Indonesian or English text, whichever is on. */
export const tr = (id, en) => (lang === 'en' ? en : id)
/** A picture's name, and the other names that also count when said. */
export const nm = x => (lang === 'en' ? x.en : x.name)
export const alsoOf = x => (lang === 'en' ? x.alsoEn : x.also) ?? []
export const speechLang = () => (lang === 'en' ? 'en-US' : 'id-ID')
