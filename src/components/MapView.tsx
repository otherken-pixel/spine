import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Book } from '../data/books'
import 'leaflet/dist/leaflet.css'

interface Props {
  books: Book[]
  onSelectBook: (book: Book) => void
}

// Leaflet's default marker icons break with bundlers; use DivIcon with cover art instead
function makeCoverIcon(book: Book): L.DivIcon {
  const color = book.dominantColor
  const img = book.coverUrl
    ? `<img src="${book.coverUrl}" style="width:44px;height:66px;object-fit:cover;border-radius:4px 4px 4px 4px;display:block;" />`
    : `<div style="width:44px;height:66px;background:${color};border-radius:4px;display:flex;align-items:center;justify-content:center;padding:4px;box-sizing:border-box;">
        <span style="color:#fff;font-size:8px;text-align:center;font-family:Georgia,serif;line-height:1.2;">${book.title}</span>
       </div>`

  return L.divIcon({
    html: `
      <div style="
        position:relative;
        filter: drop-shadow(0 4px 12px rgba(0,0,0,0.55));
        cursor:pointer;
      ">
        <div style="
          border: 2px solid rgba(255,255,255,0.85);
          border-radius:6px;
          overflow:hidden;
          width:44px;
        ">
          ${img}
        </div>
        <div style="
          position:absolute;
          bottom:-7px;
          left:50%;
          transform:translateX(-50%);
          width:0;height:0;
          border-left:6px solid transparent;
          border-right:6px solid transparent;
          border-top:8px solid rgba(255,255,255,0.85);
        "></div>
      </div>`,
    className: '',
    iconSize: [44, 82],
    iconAnchor: [22, 82],
    popupAnchor: [0, -86],
  })
}

// Fit map to all markers after mount
function BoundsController({ books }: { books: Book[] }) {
  const map = useMap()
  useEffect(() => {
    const points = books
      .filter((b) => b.coordinates)
      .map((b) => [b.coordinates!.lat, b.coordinates!.lng] as [number, number])
    if (points.length === 0) return
    if (points.length === 1) {
      map.setView(points[0], 8)
    } else {
      map.fitBounds(points, { padding: [60, 60] })
    }
  }, [books, map])
  return null
}

export function MapView({ books, onSelectBook }: Props) {
  const mappedBooks = books.filter((b) => b.coordinates)

  return (
    <div className="absolute inset-0" style={{ paddingTop: 'calc(var(--safe-top) + 80px)' }}>
      {mappedBooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full gap-3 px-8 text-center">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity={0.3}>
            <path d="M24 4C15.16 4 8 11.16 8 20C8 31 24 44 24 44C24 44 40 31 40 20C40 11.16 32.84 4 24 4Z"
              stroke="white" strokeWidth="2" fill="none" />
            <circle cx="24" cy="20" r="5" stroke="white" strokeWidth="2" />
          </svg>
          <p className="font-serif text-white/70 text-lg">No mapped reads yet</p>
          <p className="font-sans text-white/40 text-sm leading-relaxed">
            Open any book and add a location tag to pin it on your reading map.
          </p>
        </div>
      ) : (
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: '100%', width: '100%', background: '#0d1117' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            subdomains="abcd"
            maxZoom={19}
          />
          <BoundsController books={books} />
          {mappedBooks.map((book) => (
            <Marker
              key={book.id}
              position={[book.coordinates!.lat, book.coordinates!.lng]}
              icon={makeCoverIcon(book)}
              eventHandlers={{ click: () => onSelectBook(book) }}
            >
              <Popup className="book-map-popup">
                <div style={{ fontFamily: 'Georgia, serif', minWidth: 120 }}>
                  <p style={{ fontWeight: 600, fontSize: 13, margin: '0 0 2px' }}>{book.title}</p>
                  <p style={{ fontSize: 11, color: '#666', margin: 0 }}>{book.author}</p>
                  {book.locationTags && book.locationTags.length > 0 && (
                    <p style={{ fontSize: 10, color: '#888', marginTop: 4 }}>
                      📍 {book.locationTags.join(', ')}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  )
}
