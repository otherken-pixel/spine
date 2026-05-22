import { useState } from 'react'

interface Props {
  value: number            // 0.5–5.0
  onChange?: (v: number) => void
  size?: number
  readOnly?: boolean
  color?: string
}

// Polygon path for a 5-point star fitting in a 20×20 viewBox
const STAR = 'M10 1.8L12.4 7.2H18.4L13.7 10.8L15.5 16.8L10 13.2L4.5 16.8L6.3 10.8L1.6 7.2H7.6Z'

export function HalfStarRating({ value, onChange, size = 20, readOnly = false, color = '#f59e0b' }: Props) {
  const [hovered, setHovered] = useState<number | null>(null)
  const display = hovered ?? value

  return (
    <div className="flex" style={{ gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const fullFilled = display >= star
        const halfFilled = !fullFilled && display >= star - 0.5

        return (
          <div
            key={star}
            className="relative select-none"
            style={{ width: size, height: size }}
          >
            {/* Empty star base */}
            <svg width={size} height={size} viewBox="0 0 20 20" style={{ display: 'block' }}>
              <path d={STAR} fill="rgba(255,255,255,0.15)" />
            </svg>

            {/* Filled overlay — full or half width */}
            {(fullFilled || halfFilled) && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: fullFilled ? '100%' : '50%' }}
              >
                <svg width={size} height={size} viewBox="0 0 20 20" style={{ display: 'block' }}>
                  <path d={STAR} fill={color} />
                </svg>
              </div>
            )}

            {/* Interaction zones */}
            {!readOnly && (
              <>
                <div
                  className="absolute inset-y-0 left-0"
                  style={{ width: '50%', cursor: 'pointer' }}
                  onMouseEnter={() => setHovered(star - 0.5)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => onChange?.(star - 0.5)}
                />
                <div
                  className="absolute inset-y-0 right-0"
                  style={{ width: '50%', cursor: 'pointer' }}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => onChange?.(star)}
                />
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
