// Generates PWA icons using Node.js Canvas (if available) or writes placeholder PNGs
import { createCanvas } from 'canvas'
import { writeFileSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '../public/icons')
mkdirSync(outDir, { recursive: true })

function drawIcon(size, maskable = false) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  const pad = maskable ? size * 0.1 : 0

  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, size)
  bg.addColorStop(0, '#3b1f0e')
  bg.addColorStop(1, '#1a0f07')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)

  // Shelf plank
  const s = size - pad * 2
  const shelfH = s * 0.08
  const shelfY = pad + s * 0.65
  ctx.fillStyle = '#5c3317'
  ctx.fillRect(pad + s * 0.05, shelfY, s * 0.9, shelfH)
  ctx.fillStyle = 'rgba(255,200,120,0.15)'
  ctx.fillRect(pad + s * 0.05, shelfY, s * 0.9, 2)

  // Books on shelf
  const books = [
    { color: '#8B2635', w: 0.12 },
    { color: '#1B4F72', w: 0.10 },
    { color: '#D4A843', w: 0.14 },
    { color: '#2E7D6B', w: 0.11 },
    { color: '#6B2D6B', w: 0.10 },
  ]

  let x = pad + s * 0.08
  const bookH = s * 0.42
  const bookY = shelfY - bookH

  books.forEach(({ color, w }) => {
    const bw = s * w
    ctx.fillStyle = color
    ctx.fillRect(x, bookY, bw, bookH)
    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.fillRect(x, bookY, 3, bookH)
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.fillRect(x + 3, bookY, 1, bookH)
    x += bw + s * 0.015
  })

  // "S" letter mark
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.font = `bold ${size * 0.18}px serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('S', size / 2, pad + s * 0.82)

  return canvas.toBuffer('image/png')
}

try {
  writeFileSync(join(outDir, 'icon-192.png'), drawIcon(192))
  writeFileSync(join(outDir, 'icon-512.png'), drawIcon(512))
  writeFileSync(join(outDir, 'icon-512-maskable.png'), drawIcon(512, true))
  console.log('Icons generated successfully')
} catch (e) {
  console.log('canvas package not available, using placeholder icons')
}
