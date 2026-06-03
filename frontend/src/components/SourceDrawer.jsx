import { useState } from 'react'

const ChevronIcon = ({ open }) => (
  <svg
    className={`source-toggle-icon ${open ? 'open' : ''}`}
    width="12" height="12" viewBox="0 0 12 12"
    fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round"
  >
    <polyline points="2 4 6 8 10 4" />
  </svg>
)

export default function SourceDrawer({ sources }) {
  const [open, setOpen] = useState(false)

  if (!sources?.length) return null

  return (
    <div className="source-drawer">
      <button
        className="source-toggle-btn"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-label="Toggle source chunks"
        id={`source-toggle-${sources[0]?.chunk_index ?? 0}`}
      >
        <ChevronIcon open={open} />
        {open ? 'Hide' : 'Show'} {sources.length} source chunk{sources.length !== 1 ? 's' : ''}
      </button>

      {open && (
        <div className="source-chunks" role="list">
          {sources.map((src, idx) => {
            const preview = src.text.length > 120 ? src.text.slice(0, 120) + '…' : src.text
            return (
              <div
                key={idx}
                className="source-chunk-card"
                role="listitem"
                id={`chunk-card-${src.chunk_index}`}
              >
                <div className="source-chunk-label">
                  Chunk #{src.chunk_index} · Match {idx + 1}
                </div>
                <div className="source-chunk-text">{preview}</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
