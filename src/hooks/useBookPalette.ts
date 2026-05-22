import { useState, useEffect } from 'react'
import ColorThief from 'color-thief-browser'

export interface BookPalette {
  primary: string
  secondary: string
  accent: string
  isDark: boolean
}

const thief = new ColorThief()

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')
}

export function darkenHex(hex: string, factor: number): string {
  const r = Math.min(255, Math.max(0, Math.round(parseInt(hex.slice(1, 3), 16) * factor)))
  const g = Math.min(255, Math.max(0, Math.round(parseInt(hex.slice(3, 5), 16) * factor)))
  const b = Math.min(255, Math.max(0, Math.round(parseInt(hex.slice(5, 7), 16) * factor)))
  return rgbToHex(r, g, b)
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function buildFallback(hex: string): BookPalette {
  const r = parseInt(hex.slice(1, 3), 16) || 60
  const g = parseInt(hex.slice(3, 5), 16) || 30
  const b = parseInt(hex.slice(5, 7), 16) || 15
  return {
    primary: hex,
    secondary: darkenHex(hex, 0.6),
    accent: rgbToHex(
      Math.min(255, r + 45),
      Math.min(255, g + 25),
      Math.max(0, b - 5)
    ),
    isDark: relativeLuminance(r, g, b) < 0.3,
  }
}

export function useBookPalette(
  imageUrl: string | null,
  fallbackHex: string
): BookPalette {
  const [palette, setPalette] = useState<BookPalette>(() => buildFallback(fallbackHex))

  useEffect(() => {
    setPalette(buildFallback(fallbackHex))
    if (!imageUrl) return

    let cancelled = false
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = imageUrl

    img.onload = () => {
      if (cancelled) return
      try {
        const colors = thief.getPalette(img, 4)
        if (!colors || colors.length < 2) return
        const [p, s, a] = colors
        const sec = s ?? p
        const acc = a ?? p
        setPalette({
          primary: rgbToHex(p[0], p[1], p[2]),
          secondary: darkenHex(rgbToHex(sec[0], sec[1], sec[2]), 0.65),
          accent: rgbToHex(acc[0], acc[1], acc[2]),
          isDark: relativeLuminance(p[0], p[1], p[2]) < 0.3,
        })
      } catch {
        // keep fallback
      }
    }

    img.onerror = () => { /* keep fallback */ }

    return () => { cancelled = true }
  }, [imageUrl, fallbackHex])

  return palette
}
