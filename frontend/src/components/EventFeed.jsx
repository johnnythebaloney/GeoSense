// src/components/EventFeed.jsx
import { useState, useMemo, memo } from 'react'
import { BiasBadge, BiasDistributionPanel } from './BiasPanel.jsx'

const SEV_COLOR = { critical: '#ff3b3b', high: '#ff7722', medium: '#ffcc00', low: '#00ff88' }
const SEV_BG    = { critical: 'rgba(255,59,59,0.06)', high: 'rgba(255,119,34,0.06)', medium: 'rgba(255,204,0,0.06)', low: 'rgba(0,255,136,0.04)' }

export default function EventFeed({ events, meta, loading, selectedEvent, onSelectEvent, filters, onFilterChange }) {
  const regions   = ['all', 'Europe', 'Middle East', 'Africa', 'Asia', 'Americas', 'Global']
  const severities = ['all', 'critical', 'high', 'medium', 'low']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Filter bar */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ fontSize: '9px', letterSpacing: '2px', color: 'var(--muted)', marginBottom: '8px' }}>FILTER INTELLIGENCE</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
          {severities.map(s => (
            <button key={s} onClick={() => onFilterChange({ severity: s })} style={{
              padding: '3px 8px', fontSize: '9px', letterSpacing: '1px',
              cursor: 'pointer', border: '1px solid',
              borderColor: filters.severity === s ? SEV_COLOR[s] || 'var(--accent)' : 'var(--border2)',
              background: filters.severity === s ? (SEV_BG[s] || 'rgba(0,255,136,0.08)') : 'transparent',
              color: filters.severity === s ? (SEV_COLOR[s] || 'var(--accent)') : 'var(--muted)',
              textTransform: 'uppercase', transition: 'all 0.15s',
            }}>{s}</button>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {regions.map(r => (
            <button key={r} onClick={() => onFilterChange({ region: r })} style={{
              padding: '3px 8px', fontSize: '9px', letterSpacing: '1px',
              cursor: 'pointer', border: '1px solid',
              borderColor: filters.region === r ? 'var(--blue)' : 'var(--border)',
              background: filters.region === r ? 'rgba(68,136,255,0.08)' : 'transparent',
              color: filters.region === r ? 'var(--blue)' : 'var(--dim)',
              textTransform: 'uppercase', transition: 'all 0.15s',
            }}>{r}</button>
          ))}
        </div>
      </div>

      <BiasDistributionPanel meta={meta} />

      {/* Event count */}
      <div style={{
        padding: '6px 12px', fontSize: '9px', letterSpacing: '1px',
        color: 'var(--muted)', borderBottom: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <span>{loading ? 'FETCHING INTEL...' : `${events.length} EVENTS LOGGED`}</span>
        {loading && <span style={{ color: 'var(--accent)', animation: 'blink 1s infinite' }}>●</span>}
      </div>

      {/* Events list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{
                height: '70px', background: 'var(--surface)', marginBottom: '4px',
                opacity: 1 - i * 0.15,
                animation: 'blink 1.5s infinite',
                animationDelay: `${i * 0.1}s`,
              }}/>
            ))}
          </div>
        ) : events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            selected={selectedEvent?.id === event.id}
            onClick={() => onSelectEvent(event)}
          />
        ))}
      </div>
    </div>
  )
}

function EventCard({ event, selected, onClick }) {
  const color = SEV_COLOR[event.severity] || 'var(--accent)'
  const timeAgo = useMemo(() => getTimeAgo(event.publishedAt), [event.publishedAt])
  const tags = useMemo(() => (event.tags || []).slice(0, 2), [event.tags])

  return (
    <div onClick={onClick} style={{
      padding: '10px 12px',
      borderBottom: '1px solid var(--border)',
      borderLeft: `2px solid ${selected ? color : 'transparent'}`,
      background: selected ? SEV_BG[event.severity] : 'transparent',
      cursor: 'pointer',
      transition: 'all 0.15s',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = SEV_BG[event.severity] || 'rgba(0,255,136,0.03)' }}
    onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent' }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            width: '5px', height: '5px', borderRadius: '50%',
            background: color, display: 'inline-block',
            boxShadow: `0 0 4px ${color}`,
            animation: event.severity === 'critical' ? 'pulse-dot 1.5s infinite' : 'none',
            flexShrink: 0,
          }}/>
          <span style={{ fontSize: '9px', color, letterSpacing: '1px', textTransform: 'uppercase' }}>
            {event.severity}
          </span>
          <span style={{ fontSize: '9px', color: 'var(--dim)', letterSpacing: '1px' }}>// {event.region}</span>
        </div>
        <span style={{ fontSize: '9px', color: 'var(--muted)' }}>{timeAgo}</span>
      </div>

      {/* Title */}
      <div style={{
        fontSize: '11px', color: 'var(--primary)', lineHeight: '1.4',
        marginBottom: '5px', fontFamily: 'var(--font-mono)',
      }}>
        {event.title}
      </div>

      {/* Bottom row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {tags.map(tag => (
            <span key={tag} style={{
              fontSize: '8px', letterSpacing: '1px',
              color: 'var(--dim)', border: '1px solid var(--border)',
              padding: '1px 4px', textTransform: 'uppercase',
            }}>#{tag}</span>
          ))}
        </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {event.biasData && <BiasBadge biasData={event.biasData} compact={true} />}
            <span style={{ fontSize: '9px', color: 'var(--muted)' }}>{event.source}</span>
          </div>
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

// Memoize EventCard to prevent re-renders when props haven't changed
export const MemoEventCard = memo(EventCard);
