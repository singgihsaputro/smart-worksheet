/** document.createElement with props and children; on* props become listeners. */
export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag)
  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue
    if (key.startsWith('on')) el.addEventListener(key.slice(2), value)
    else if (key === 'class') el.className = value
    else if (key === 'style') el.style.cssText = value
    else el.setAttribute(key, value === true ? '' : value)
  }
  for (const child of children.flat(Infinity)) if (child != null && child !== false) el.append(child)
  return el
}
