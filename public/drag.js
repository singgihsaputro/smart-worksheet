// Drag and drop with Pointer Events, so a finger, an Apple Pencil and a mouse
// all work the same on phones, iPads and laptops. The piece follows the pointer;
// on release, the drop target under the pointer decides: accept (onDrop returns
// true and usually moves the piece in) or the piece glides back home.

/**
 * @param {HTMLElement} el            the piece
 * @param {string} targets            CSS selector of the places it can be dropped
 * @param {(target: Element, el: HTMLElement) => boolean} onDrop
 */
export function draggable(el, targets, onDrop) {
  el.classList.add('drag')
  el.addEventListener('pointerdown', e => {
    if (el.classList.contains('placed') || (e.pointerType === 'mouse' && e.button !== 0)) return
    e.preventDefault()
    el.setPointerCapture(e.pointerId)
    const x0 = e.clientX, y0 = e.clientY
    let over = null
    el.classList.add('dragging')

    const targetAt = (x, y) => document.elementsFromPoint(x, y).find(n => n !== el && !el.contains(n) && n.matches?.(targets))
    const move = ev => {
      el.style.transform = `translate(${ev.clientX - x0}px, ${ev.clientY - y0}px) scale(1.1)`
      const hit = targetAt(ev.clientX, ev.clientY) ?? null
      if (hit !== over) {
        over?.classList.remove('over')
        hit?.classList.add('over')
        over = hit
      }
    }
    const end = ev => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', end)
      el.removeEventListener('pointercancel', end)
      el.classList.remove('dragging')
      over?.classList.remove('over')
      const hit = ev.type === 'pointerup' ? targetAt(ev.clientX, ev.clientY) : null
      if (hit && onDrop(hit, el)) { el.style.transform = ''; return }
      // Not here: glide back home (the transition comes with .homing).
      el.classList.add('homing')
      el.style.transform = ''
      setTimeout(() => el.classList.remove('homing'), 300)
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', end)
    el.addEventListener('pointercancel', end)
  })
}
