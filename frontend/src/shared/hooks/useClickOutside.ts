import { useEffect, type RefObject } from 'react'

/**
 * Detecta clicks fuera de un elemento referenciado.
 * Se usa en dropdowns, modales, y cualquier overlay que cierre al click fuera.
 */
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: () => void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return

    function handleClick(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        handler()
      }
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('touchstart', handleClick)

    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('touchstart', handleClick)
    }
  }, [ref, handler, enabled])
}
