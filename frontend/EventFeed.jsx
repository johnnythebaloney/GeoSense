// src/components/EventFeed.jsx
import { useState } from 'react'

const SEV_COLOR = { critical: '#ff3b3b', high: '#ff7722', medium: '#ffcc00', low: '#00ff88' }
const SEV_BG    = { critical: 'rgba(255,59,59,0.06)', high: 'rgba(255,119,34,0.06)', medium: 'rgba(255,204,0,0.06)', low: 'rgba(0,255,136,0.04)' }

function getTimeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 23) return `${Math.floor(h/24)}d ago`
  if (h > 0) return `${h}h ago`
  return `${m}m ago`
}

export default function EventFeed({ events, loading, selectedEvent, onSelectEvent, filters, onFilterChange }) {
  const regions    = ['all', 'Europe', 'Middle East', 'Africa', 'Asia', 'Americas', 'Global']
  const severities = ['all', 'critical', 'high', 'medium', 'low']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Filters */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid #1e2530', flexShrink: 0 }}>
        <div style={{ fontSize: '9px', letterSpacing: '2px', color: '#556070', marginBottom: '8px' }}>FILTER INTELLIGENCE</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
          {severities.map(s => (
            <button key={s} onClick={() => onFilterChange({ severity: s })} style={{
              padding: '3px 8px', fontSize: '9px', letterSpacing: '1px', cursor: 'pointer',
              border: `1px solid ${filters.severity === s ? (SEV_COLOR[s] || '#00ff88') : '#2a3441'}`,
              background: filters.severity === s ? (SEV_BG[s] || 'rgba(0,255,136,0.08)') : 'transparent',
              color: filters.severity === s ? (SEV_COLOR[s] || '#00ff88') : '#3a4a5c',
              textTransform: 'uppercase',
            }}>{s}</button>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {regions.map(r => (
            <button key={r} onClick={() => onFilterChange({ region: r })} style={{
              padding: '3px 8px', fontSize: '9px', letterSpacing: '1px', cursor: 'pointer',
              border: `1px solid ${filters.region === r ? '#4488ff' : '#1e2530'}`,
              background: filters.region === r ? 'rgba(68,136,255,0.08)' : 'transparent',
              color: filters.region === r ? '#4488ff' : '#3a4a5c',
              textTransform: 'uppercase',
            }}>{r}</button>
          ))}
        </div>
      </div>

      {/* Count bar */}
      <div style={{ padding: '6px 12px', fontSize: '9px', letterSpacing: '1px', color: '#556070', borderBottom: '1px solid #1e2530', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
        <span>{loading ? 'FETCHING INTEL...' : `${events.length} EVENTS LOGGED`}</span>
        {loading && <span style={{ color: '#00ff88' }}>●</span>}
      </div>

      {/* Events */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {events.length === 0 && !loading && (
          <div style={{ padding: '20px', fontSize: '10px', color: '#556070', textAlign: 'center' }}>
            NO EVENTS FOUND
          </div>
        )}
        {events.map(event => {
          const color = SEV_COLOR[event.severity] || '#00ff88'
          const selected = selectedEvent?.id === event.id
          return (
            <div
              key={event.id}
              onClick={() => onSelectEvent(event)}
              style={{
                padding: '10px 12px',
                borderBottom: '1px solid #1e2530',
                borderLeft: `2px solid ${selected ? color : 'transparent'}`,
                background: selected ? SEV_BG[event.severity] : 'transparent',
                cursor: 'pointer',
              }}
            >
              {/* Top row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: color, display: 'inline-block', boxShadow: `0 0 4px ${color}`, flexShrink: 0 }}/>
                  <span style={{ fontSize: '9px', color, letterSpacing: '1px', textTransform: 'uppercase' }}>{event.severity}</span>
                  <span style={{ fontSize: '9px', color: '#3a4a5c', letterSpacing: '1px' }}>// {event.region}</span>
                </div>
                <span style={{ fontSize: '9px', color: '#556070' }}>{getTimeAgo(event.publishedAt)}</span>
              </div>

              {/* Title */}
              <div style={{ fontSize: '11px', color: '#c8d8e8', lineHeight: '1.4', marginBottom: '5px', fontFamily: "'Share Tech Mono', monospace" }}>
                {event.title}
              </div>

              {/* Bottom row */}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {(event.tags || []).slice(0, 2).map(tag => (
                    <span key={tag} style={{ fontSize: '8px', letterSpacing: '1px', color: '#3a4a5c', border: '1px solid #1e2530', padding: '1px 4px', textTransform: 'uppercase' }}>#{tag}</span>
                  ))}
                </div>
                <span style={{ fontSize: '9px', color: '#556070' }}>{event.source}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
