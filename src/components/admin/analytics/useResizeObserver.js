import { useState, useEffect, useRef } from 'react'

/**
 * Hook pour mesurer les dimensions réelles en pixels d'un conteneur
 */
export function useResizeObserver() {
  const ref = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new ResizeObserver((entries) => {
      if (!entries || !entries[0]) return
      const { width, height } = entries[0].contentRect
      if (width > 0 && height > 0) {
        setDimensions({
          width: Math.floor(width),
          height: Math.floor(height),
        })
      }
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return [ref, dimensions]
}
