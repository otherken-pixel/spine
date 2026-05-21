#!/usr/bin/env node
/**
 * Generates icon-192.png and icon-512.png using only Node built-ins.
 * Design: dark mahogany room, 4 coloured book spines on a wood shelf.
 */
import { deflateSync } from 'zlib';
import { writeFileSync, mkdirSync } from 'fs';

// ── PNG encoder ──────────────────────────────────────────────────────────────

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = (c >>> 8) ^ CRC_TABLE[(c ^ b) & 0xff];
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const tb = Buffer.from(type, 'ascii');
  const lb = Buffer.alloc(4); lb.writeUInt32BE(data.length);
  const cb = Buffer.alloc(4); cb.writeUInt32BE(crc32(Buffer.concat([tb, data])));
  return Buffer.concat([lb, tb, data, cb]);
}

function encodePNG(w, h, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  const row = w * 4;
  const raw = Buffer.alloc(h * (row + 1));
  for (let y = 0; y < h; y++) {
    raw[y * (row + 1)] = 0; // filter: None
    rgba.copy(raw, y * (row + 1) + 1, y * row, (y + 1) * row);
  }
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

// ── Drawing helpers ───────────────────────────────────────────────────────────

function hexRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function blend(pixels, size, x, y, w, h, r, g, b, a) {
  const A = a / 255;
  const xEnd = Math.min(Math.round(x + w), size);
  const yEnd = Math.min(Math.round(y + h), size);
  for (let py = Math.max(0, Math.round(y)); py < yEnd; py++) {
    for (let px = Math.max(0, Math.round(x)); px < xEnd; px++) {
      const i = (py * size + px) * 4;
      pixels[i]     = Math.round(pixels[i]     * (1 - A) + r * A);
      pixels[i + 1] = Math.round(pixels[i + 1] * (1 - A) + g * A);
      pixels[i + 2] = Math.round(pixels[i + 2] * (1 - A) + b * A);
      pixels[i + 3] = 255;
    }
  }
}

function fill(pixels, size, x, y, w, h, hex, alpha = 255) {
  const [r, g, b] = hexRgb(hex);
  blend(pixels, size, x, y, w, h, r, g, b, alpha);
}

// ── Icon renderer ─────────────────────────────────────────────────────────────

function createIcon(SIZE) {
  const S = SIZE / 192; // scale factor
  const pixels = Buffer.alloc(SIZE * SIZE * 4);

  // ── Background: deep brown radial gradient ──
  for (let py = 0; py < SIZE; py++) {
    for (let px = 0; px < SIZE; px++) {
      // distance from centre as 0-1
      const dx = (px / SIZE - 0.5) * 2;
      const dy = (py / SIZE - 0.5) * 2;
      const d  = Math.min(1, Math.sqrt(dx * dx + dy * dy));
      // interpolate #2a1508 → #0d0704
      const r = Math.round(42  * (1 - d) + 13 * d);
      const g = Math.round(21  * (1 - d) +  7 * d);
      const b = Math.round(8   * (1 - d) +  4 * d);
      const i = (py * SIZE + px) * 4;
      pixels[i] = r; pixels[i + 1] = g; pixels[i + 2] = b; pixels[i + 3] = 255;
    }
  }

  // ── Warm ambient glow at top ──
  for (let row = 0; row < Math.round(55 * S); row++) {
    const a = Math.round(55 * (1 - row / (55 * S)));
    blend(pixels, SIZE, 24 * S, row, 144 * S, 1, 201, 123, 56, a);
  }

  // ── Books ──
  const shelfY  = Math.round(154 * S);

  const books = [
    { x: 34, w: 28, h: 116, spine: '#2d5986', hi: '#5a8fc0', lo: '#1a3a5a' },
    { x: 65, w: 36, h: 128, spine: '#8b2020', hi: '#c04040', lo: '#5a0e0e' },
    { x: 104, w: 24, h: 112, spine: '#1a5c2e', hi: '#2e8a44', lo: '#0e3a1c' },
    { x: 131, w: 32, h: 122, spine: '#6b4c8b', hi: '#9a72bb', lo: '#3e2a5a' },
  ];

  for (const bk of books) {
    const bx = bk.x * S;
    const bw = bk.w * S;
    const bh = bk.h * S;
    const by = shelfY - bh;

    // Main body (left 60% → base, right 40% → slightly darker)
    fill(pixels, SIZE, bx,            by, bw * 0.6, bh, bk.spine);
    fill(pixels, SIZE, bx + bw * 0.6, by, bw * 0.4, bh, bk.lo);

    // Left highlight strip (spine curve illusion)
    fill(pixels, SIZE, bx, by, Math.max(2, bw * 0.11), bh, bk.hi);

    // Top edge cap
    fill(pixels, SIZE, bx, by, bw, Math.max(2, 2 * S), '#e8e0d0', 70);

    // Page edge (right side, cream)
    fill(pixels, SIZE, bx + bw, by + bh * 0.05, Math.max(2, 2 * S), bh * 0.9, '#d0c8b8', 120);
  }

  // ── Shelf surface ──
  const shelfH  = Math.round(10 * S);
  const edgeH   = Math.round(7  * S);

  // Top highlight line
  blend(pixels, SIZE, 0, shelfY - 1, SIZE, 1, 255, 220, 160, 45);
  // Main board
  fill(pixels, SIZE, 0, shelfY,          SIZE, shelfH, '#5c2e00');
  // Front edge (darker)
  fill(pixels, SIZE, 0, shelfY + shelfH, SIZE, edgeH,  '#2d1400');
  // Drop shadow
  for (let row = 0; row < Math.round(10 * S); row++) {
    const a = Math.round(80 * (1 - row / (10 * S)));
    blend(pixels, SIZE, 0, shelfY + shelfH + edgeH + row, SIZE, 1, 0, 0, 0, a);
  }

  return encodePNG(SIZE, SIZE, pixels);
}

// ── Write files ───────────────────────────────────────────────────────────────

mkdirSync('public/icons', { recursive: true });
writeFileSync('public/icons/icon-192.png', createIcon(192));
writeFileSync('public/icons/icon-512.png', createIcon(512));
// iOS also wants apple-touch-icon at root
writeFileSync('public/apple-touch-icon.png', createIcon(180));
console.log('✓ icon-192.png, icon-512.png, apple-touch-icon.png written to public/');
