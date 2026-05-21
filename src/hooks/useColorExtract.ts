import { useState, useEffect, useRef } from 'react';

// ── Canvas-based dominant colour extraction ───────────────────────────────────
// Draws the cover to a small off-screen canvas, samples every pixel, and
// returns the saturated average — skipping near-white and near-black areas.
// Uses crossOrigin="anonymous" so CORS-enabled images (Google Books) work.

const SAMPLE_SIZE = 48;
const cache = new Map<string, string>();

function extractColor(src: string): Promise<string> {
  if (cache.has(src)) return Promise.resolve(cache.get(src)!);

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = SAMPLE_SIZE;
        canvas.height = SAMPLE_SIZE;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve('#666'); return; }

        ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
        const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

        let rSum = 0, gSum = 0, bSum = 0, totalWeight = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          if (lum < 30 || lum > 225) continue; // skip near-black and near-white

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const sat = max === 0 ? 0 : (max - min) / max;
          const weight = 1 + sat * 3; // vivid colours count 4× more

          rSum += r * weight;
          gSum += g * weight;
          bSum += b * weight;
          totalWeight += weight;
        }

        if (totalWeight === 0) { resolve('rgb(80,60,50)'); return; }

        const r = Math.round(rSum / totalWeight);
        const g = Math.round(gSum / totalWeight);
        const b = Math.round(bSum / totalWeight);
        const result = `rgb(${r},${g},${b})`;
        cache.set(src, result);
        resolve(result);
      } catch {
        resolve('rgb(80,60,50)');
      }
    };

    img.onerror = () => resolve('rgb(80,60,50)');
    img.src = src;
  });
}

// Returns [dominantColor, isDark]
export function useColorExtract(src: string | undefined): [string, boolean] {
  const [color, setColor] = useState('rgb(80,60,50)');
  const srcRef = useRef(src);

  useEffect(() => {
    srcRef.current = src;
    if (!src) return;

    extractColor(src).then((c) => {
      if (srcRef.current === src) setColor(c);
    });
  }, [src]);

  // Determine if extracted colour is perceptually dark
  const rgbNums = color.match(/\d+/g)?.map(Number) ?? [80, 60, 50];
  const lum = 0.299 * rgbNums[0] + 0.587 * rgbNums[1] + 0.114 * rgbNums[2];
  const isDark = lum < 128;

  return [color, isDark];
}
