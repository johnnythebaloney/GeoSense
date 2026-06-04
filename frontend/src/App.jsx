// src/App.jsx
import { useState, useEffect, useRef } from 'react'
import Header from './components/Header.jsx'
import GeoMap from './components/GeoMap.jsx'
import EventDetail from './components/EventDetail.jsx'
import QuotePanel from './components/QuotePanel.jsx'
import DoomsdayClock from './components/DoomsdayClock.jsx'
import { BiasBadge, BiasDistributionPanel } from './components/BiasPanel.jsx'

const SEV_COLOR = { critical: '#ff3b3b', high: '#ff7722', medium: '#ffcc00', low: '#00ff88' }
const REFRESH_INTERVAL = 5 * 60 // 5 minutes in seconds

function getTimeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 23) return `${Math.floor(h / 24)}d ago`
  if (h > 0) return `${h}h ago`
  return `${m}m ago`
}

export default function App() {
  const [events, setEvents]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [severityFilter, setSeverity] = useState('all')
  const [regionFilter, setRegion]     = useState('all')
  const [selectedEvent, setSelected]  = useState(null)
  const [leafletReady, setLeaflet]    = useState(false)
  const [countdown, setCountdown]     = useState(REFRESH_INTERVAL)
  const [lastFetched, setLastFetched] = useState(null)
  const [meta, setMeta] = useState(null)
  const countdownRef = useRef(null)

  // Load Leaflet once
  useEffect(() => {
    if (window.L) { setLeaflet(true); return }
    const s = document.createElement('script')
    s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    s.onload = () => setLeaflet(true)
    document.head.appendChild(s)
  }, [])

  // Core fetch function
  const fetchEvents = (sev, reg) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (sev && sev !== 'all') params.append('severity', sev)
    if (reg && reg !== 'all') params.append('region', reg)
    const url = `http://localhost:3001/api/events${params.toString() ? '?' + params : ''}`

    fetch(url)
      .then(r => r.json())
      .then(data => {
        setEvents(data.events || [])
        setMeta(data.meta || null)
        setLastFetched(new Date())
        setLoading(false)
        setCountdown(REFRESH_INTERVAL) // Reset countdown
      })
      .catch(() => {
        setEvents(FALLBACK)
        setLoading(false)
      })
  }

  // Fetch when filters change
  useEffect(() => {
    fetchEvents(severityFilter, regionFilter)
  }, [severityFilter, regionFilter])

  // Auto-refresh countdown timer
  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          fetchEvents(severityFilter, regionFilter)
          return REFRESH_INTERVAL
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(countdownRef.current)
  }, [severityFilter, regionFilter])

  const stats = {
    critical: events.filter(e => e.severity === 'critical').length,
    high:     events.filter(e => e.severity === 'high').length,
    total:    events.length,
  }

  const mins = String(Math.floor(countdown / 60)).padStart(2, '0')
  const secs = String(countdown % 60).padStart(2, '0')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#050608', color: '#8a9bb0', fontFamily: "'Share Tech Mono', monospace" }}>
      <Header stats={stats} />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Left sidebar */}
        <div style={{ width: '320px', flexShrink: 0, borderRight: '1px solid #2a3441', display: 'flex', flexDirection: 'column', background: '#0a0c0f', overflow: 'hidden' }}>

          {/* Filters */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #1e2530', flexShrink: 0 }}>
            <div style={{ fontSize: '9px', letterSpacing: '2px', color: '#556070', marginBottom: '8px' }}>FILTER INTELLIGENCE</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
              {['all','critical','high','medium','low'].map(s => (
                <button key={s} onClick={() => setSeverity(s)} style={{
                  padding: '3px 8px', fontSize: '9px', letterSpacing: '1px', cursor: 'pointer',
                  border: `1px solid ${severityFilter === s ? (SEV_COLOR[s] || '#00ff88') : '#2a3441'}`,
                  background: severityFilter === s ? 'rgba(0,255,136,0.08)' : 'transparent',
                  color: severityFilter === s ? (SEV_COLOR[s] || '#00ff88') : '#3a4a5c',
                  textTransform: 'uppercase',
                }}>{s}</button>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {['all','Europe','Middle East','Africa','Asia','Americas','Global'].map(r => (
                <button key={r} onClick={() => setRegion(r)} style={{
                  padding: '3px 8px', fontSize: '9px', letterSpacing: '1px', cursor: 'pointer',
                  border: `1px solid ${regionFilter === r ? '#4488ff' : '#1e2530'}`,
                  background: regionFilter === r ? 'rgba(68,136,255,0.08)' : 'transparent',
                  color: regionFilter === r ? '#4488ff' : '#3a4a5c',
                  textTransform: 'uppercase',
                }}>{r}</button>
              ))}
            </div>
          </div>

          <BiasDistributionPanel meta={meta} />

          {/* Status bar with auto-refresh countdown */}
          <div style={{ padding: '6px 12px', fontSize: '9px', color: '#556070', borderBottom: '1px solid #1e2530', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{loading ? 'FETCHING INTEL...' : `${events.length} EVENTS`}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: countdown < 30 ? '#ffcc00' : '#3a4a5c' }}>↻ {mins}:{secs}</span>
              <button onClick={() => fetchEvents(severityFilter, regionFilter)} style={{
                background: 'none', border: '1px solid #2a3441', color: '#3a4a5c',
                cursor: 'pointer', padding: '2px 6px', fontSize: '8px',
                fontFamily: "'Share Tech Mono', monospace", letterSpacing: '1px',
              }}>REFRESH</button>
            </div>
          </div>

          {/* Event list */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {events.map((event, i) => {
              const color    = SEV_COLOR[event.severity] || '#00ff88'
              const selected = selectedEvent?.id === event.id
              return (
                <div key={`${event.id}-${i}`} onClick={() => setSelected(event)} style={{
                  padding: '10px 12px', borderBottom: '1px solid #1e2530',
                  borderLeft: `2px solid ${selected ? color : 'transparent'}`,
                  background: selected ? 'rgba(0,255,136,0.04)' : 'transparent',
                  cursor: 'pointer',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }}/>
                      <span style={{ fontSize: '9px', color, letterSpacing: '1px', textTransform: 'uppercase' }}>{event.severity}</span>
                      <span style={{ fontSize: '9px', color: '#3a4a5c' }}>// {event.region}</span>
                    </div>
                    <span style={{ fontSize: '9px', color: '#556070' }}>{getTimeAgo(event.publishedAt)}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#c8d8e8', lineHeight: '1.4', marginBottom: '4px' }}>{event.title}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {event.coordinates?.lat && <span style={{ fontSize: '8px', color: '#00ff88', letterSpacing: '1px' }}>📍</span>}
                      {(event.tags || []).slice(0, 2).map(tag => (
                        <span key={tag} style={{ fontSize: '8px', color: '#3a4a5c', border: '1px solid #1e2530', padding: '1px 4px', textTransform: 'uppercase' }}>#{tag}</span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {event.biasData && <BiasBadge biasData={event.biasData} compact={true} />}
                      <span style={{ fontSize: '9px', color: '#556070' }}>{event.source}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <QuotePanel />
          <DoomsdayClock />
        </div>

        {/* Map */}
        <div style={{ flex: 1, position: 'relative', background: '#0a0f14' }}>
          {leafletReady
            ? <GeoMap events={events} onSelectEvent={setSelected} />
            : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '9px', letterSpacing: '3px', color: '#556070' }}>INITIALIZING MAP...</div>
          }
          {selectedEvent && <EventDetail event={selectedEvent} onClose={() => setSelected(null)} />}

          {/* Last fetched timestamp */}
          {lastFetched && (
            <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(10,12,15,0.8)', border: '1px solid #1e2530', padding: '4px 10px', fontSize: '9px', color: '#3a4a5c', letterSpacing: '1px', zIndex: 800 }}>
              LAST SYNC: {lastFetched.toLocaleTimeString()} // NEXT: {mins}:{secs}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

const FALLBACK = [
  { id: 'f1', title: 'Clashes reported near border amid ongoing tensions', description: 'Military units have exchanged fire.', source: 'Reuters', publishedAt: new Date().toISOString(), country: 'Ukraine', region: 'Europe', severity: 'critical', tags: ['conflict'], coordinates: { lat: 49.8, lng: 24.0 }, url: '#' },
  { id: 'f2', title: 'Mass protests erupt in capital over election results', description: 'Thousands took to the streets.', source: 'BBC News', publishedAt: new Date(Date.now()-3600000).toISOString(), country: 'Haiti', region: 'Americas', severity: 'high', tags: ['protest'], coordinates: { lat: 18.5, lng: -72.3 }, url: '#' },
  { id: 'f3', title: 'Airstrike targets rebel positions in northern region', description: 'Government forces conducted airstrikes.', source: 'Al Jazeera', publishedAt: new Date(Date.now()-7200000).toISOString(), country: 'Sudan', region: 'Africa', severity: 'critical', tags: ['airstrike'], coordinates: { lat: 15.5, lng: 32.5 }, url: '#' },
]
