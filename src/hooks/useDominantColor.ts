import { useState, useEffect } from 'react'
import { FastAverageColor } from 'fast-average-color'

const fac = new FastAverageColor()

export function useDominantColor(
  imageUrl: string | null,
  fallback: string
): string {
  const [color, setColor] = useState(fallback)

  useEffect(() => {
    if (!imageUrl) {
      setColor(fallback)
      return
    }

    let cancelled = false
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = imageUrl

    img.onload = async () => {
      if (cancelled) return
      try {
        const result = await fac.getColorAsync(img, {
          algorithm: 'dominant',
          ignoredColor: [255, 255, 255, 255, 10],
        })
        if (!cancelled) setColor(result.hex)
      } catch {
        if (!cancelled) setColor(fallback)
      }
    }

    img.onerror = () => {
      if (!cancelled) setColor(fallback)
    }

    return () => {
      cancelled = true
    }
  }, [imageUrl, fallback])

  return color
}
