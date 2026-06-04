// src/components/EventDetail.jsx
import { BiasBadge } from './BiasPanel.jsx'

const SEV_COLOR = { critical: '#ff3b3b', high: '#ff7722', medium: '#ffcc00', low: '#00ff88' }
const SEV_BG    = { critical: 'rgba(255,59,59,0.06)', high: 'rgba(255,119,34,0.06)', medium: 'rgba(255,204,0,0.06)', low: 'rgba(0,255,136,0.04)' }

export default function EventDetail({ event, onClose }) {
  if (!event) return null

  const color = SEV_COLOR[event.severity] || 'var(--accent)'
  const timeAgo = getTimeAgo(event.publishedAt)
  const fullDate = new Date(event.publishedAt).toLocaleString()

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(5,6,8,0.92)',
      zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.2s ease',
      backdropFilter: 'blur(2px)',
    }}
    onClick={onClose}
    >
      <div style={{
        background: 'var(--surface)',
        border: `1px solid ${color}`,
        maxWidth: '520px', width: '90%',
        padding: '24px',
        boxShadow: `0 0 40px ${color}22`,
        animation: 'scanIn 0.2s ease',
      }}
      onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              padding: '3px 8px', fontSize: '9px', letterSpacing: '2px',
              background: SEV_BG[event.severity], color,
              border: `1px solid ${color}`, textTransform: 'uppercase',
            }}>{event.severity}</span>
            <span style={{ fontSize: '9px', color: 'var(--muted)', letterSpacing: '1px' }}>
              {event.region} // {event.country}
            </span>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: '1px solid var(--border2)',
            color: 'var(--muted)', cursor: 'pointer',
            padding: '2px 8px', fontSize: '11px',
            fontFamily: 'var(--font-mono)',
          }}>✕ CLOSE</button>
        </div>

        {/* Title */}
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '20px', fontWeight: 600,
          color: 'var(--bright)', lineHeight: '1.3',
          marginBottom: '12px', letterSpacing: '0.5px',
        }}>{event.title}</h2>

        {/* Description */}
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '13px', color: 'var(--body)',
          lineHeight: '1.7', marginBottom: '16px',
          borderLeft: `2px solid ${color}`,
          paddingLeft: '12px',
        }}>{event.description}</p>

        {/* Metadata grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '8px', marginBottom: '16px',
          padding: '12px', background: 'var(--black)',
          border: '1px solid var(--border)',
        }}>
          {[
            { label: 'SOURCE',    value: event.source },
            { label: 'REPORTED',  value: timeAgo },
            { label: 'COUNTRY',   value: event.country },
            { label: 'TIMESTAMP', value: fullDate },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: '8px', letterSpacing: '2px', color: 'var(--muted)', marginBottom: '2px' }}>{item.label}</div>
              <div style={{ fontSize: '11px', color: 'var(--primary)' }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Tags */}
        {event.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {event.tags.map(tag => (
              <span key={tag} style={{
                fontSize: '9px', letterSpacing: '1px',
                color: 'var(--dim)', border: '1px solid var(--border)',
                padding: '2px 6px', textTransform: 'uppercase',
              }}>#{tag}</span>
            ))}
          </div>
        )}

        {/* Coordinates */}
        {event.coordinates && (
          <div style={{
            fontSize: '9px', color: 'var(--muted)', letterSpacing: '1px',
            marginBottom: '16px', fontFamily: 'var(--font-mono)',
          }}>
            📍 {event.coordinates.lat.toFixed(4)}°N, {event.coordinates.lng.toFixed(4)}°E
          </div>
        )}

        {/* Bias panel */}
        {event.biasData && (
          <div style={{ marginBottom: '16px' }}>
            <BiasBadge biasData={event.biasData} compact={false} />
          </div>
        )}

        {/* Link */}
        {event.url && event.url !== '#' && (
          <a href={event.url} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-block',
            fontSize: '9px', letterSpacing: '2px',
            color: color, border: `1px solid ${color}`,
            padding: '6px 14px', textDecoration: 'none',
            textTransform: 'uppercase',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.target.style.background = SEV_BG[event.severity] }}
          onMouseLeave={e => { e.target.style.background = 'transparent' }}
          >→ READ FULL REPORT</a>
        )}
      </div>
    </div>
  )
}

function getTimeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 23) return `${Math.floor(h/24)}d ago`
  if (h > 0)  return `${h}h ago`
  return `${m}m ago`
}
