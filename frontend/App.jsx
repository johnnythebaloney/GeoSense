// src/App.jsx — v2 clean layout
import { useState, useEffect, useRef } from 'react'
import Header from './components/Header.jsx'
import GeoMap from './components/GeoMap.jsx'
import EventDetail from './components/EventDetail.jsx'
import QuotePanel from './components/QuotePanel.jsx'
import DoomsdayClock from './components/DoomsdayClock.jsx'
import ArsenalPanel from './components/ArsenalPanel.jsx'
import CountryIntel from './components/CountryIntel.jsx'
import { BiasBadge, BiasDistributionPanel } from './components/BiasPanel.jsx'

const SEV_COLOR = { critical: '#ff2d55', high: '#ff6b2d', medium: '#ffd60a', low: '#00ff88' }
const REFRESH_INTERVAL = 5 * 60

function getTimeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 23) return `${Math.floor(h / 24)}d`
  if (h > 0)  return `${h}h`
  return `${m}m`
}

export default function App() {
  const [events, setEvents]           = useState([])
  const [meta, setMeta]               = useState(null)
  const [loading, setLoading]         = useState(true)
  const [severityFilter, setSeverity] = useState('all')
  const [regionFilter, setRegion]     = useState('all')
  const [selectedEvent, setSelected]  = useState(null)
  const [selectedCountry, setCountry] = useState(null)
  const [leafletReady, setLeaflet]    = useState(false)
  const [countdown, setCountdown]     = useState(REFRESH_INTERVAL)
  const [sideTab, setSideTab]         = useState('EVENTS')
  const countdownRef = useRef(null)

  useEffect(() => {
    if (window.L) { setLeaflet(true); return }
    const s = document.createElement('script')
    s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    s.onload = () => setLeaflet(true)
    document.head.appendChild(s)
  }, [])

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
        setLoading(false)
        setCountdown(REFRESH_INTERVAL)
      })
      .catch(() => { setEvents(FALLBACK); setLoading(false) })
  }

  useEffect(() => { fetchEvents(severityFilter, regionFilter) }, [severityFilter, regionFilter])

  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { fetchEvents(severityFilter, regionFilter); return REFRESH_INTERVAL }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(countdownRef.current)
  }, [severityFilter, regionFilter])

  const stats = {
    critical: events.filter(e => e.severity === 'critical').length,
    high:     events.filter(e => e.severity === 'high').length,
    total:    events.length,
    mapped:   events.filter(e => e.coordinates?.lat).length,
  }

  const mins = String(Math.floor(countdown / 60)).padStart(2, '0')
  const secs = String(countdown % 60).padStart(2, '0')

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden',
      background: 'var(--bg0)', color: 'var(--body)', fontFamily: 'var(--font-mono)',
    }}>
      <Header stats={stats} />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── Left sidebar ── */}
        <div style={{
          width: '300px', flexShrink: 0,
          borderRight: '1px solid var(--line)',
          display: 'flex', flexDirection: 'column',
          background: 'var(--bg1)',
        }}>
          {/* Tab switcher */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
            {['EVENTS', 'INTEL', 'CLOCK'].map(t => (
              <button key={t} onClick={() => setSideTab(t)} style={{
                flex: 1, padding: '10px 0', background: 'none', border: 'none',
                borderBottom: `2px solid ${sideTab === t ? 'var(--accent)' : 'transparent'}`,
                color: sideTab === t ? 'var(--accent)' : 'var(--muted)',
                cursor: 'pointer', fontSize: '9px', letterSpacing: '2px',
                fontFamily: 'var(--font-mono)', transition: 'all 0.15s',
              }}>{t}</button>
            ))}
          </div>

          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

            {/* ── EVENTS TAB ── */}
            {sideTab === 'EVENTS' && (
              <>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                    {['all','critical','high','medium','low'].map(s => {
                      const c = SEV_COLOR[s] || 'var(--accent)'
                      const active = severityFilter === s
                      return (
                        <button key={s} onClick={() => setSeverity(s)} style={{
                          flex: 1, padding: '5px 0', fontSize: '8px', letterSpacing: '1px',
                          cursor: 'pointer', textTransform: 'uppercase',
                          border: `1px solid ${active ? c : 'var(--line2)'}`,
                          background: active ? `${c}15` : 'transparent',
                          color: active ? c : 'var(--muted)',
                          fontFamily: 'var(--font-mono)', transition: 'all 0.15s',
                        }}>{s === 'all' ? 'ALL' : s.slice(0,4).toUpperCase()}</button>
                      )
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {['all','Europe','Middle East','Africa','Asia','Americas'].map(r => (
                      <button key={r} onClick={() => setRegion(r)} style={{
                        padding: '3px 8px', fontSize: '8px', letterSpacing: '1px',
                        cursor: 'pointer', textTransform: 'uppercase',
                        border: `1px solid ${regionFilter === r ? 'var(--blue)' : 'var(--line)'}`,
                        background: regionFilter === r ? 'rgba(61,142,255,0.1)' : 'transparent',
                        color: regionFilter === r ? 'var(--blue)' : 'var(--muted)',
                        fontFamily: 'var(--font-mono)', transition: 'all 0.15s',
                      }}>{r === 'all' ? 'ALL' : r}</button>
                    ))}
                  </div>
                </div>

                <div style={{
                  padding: '6px 16px', fontSize: '9px', color: 'var(--muted)',
                  borderBottom: '1px solid var(--line)', flexShrink: 0,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span>{loading ? 'FETCHING...' : `${events.length} EVENTS`}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: countdown < 30 ? 'var(--yellow)' : 'var(--muted)' }}>↻ {mins}:{secs}</span>
                    <button onClick={() => fetchEvents(severityFilter, regionFilter)} style={{
                      background: 'none', border: '1px solid var(--line2)',
                      color: 'var(--muted)', cursor: 'pointer', padding: '1px 6px',
                      fontSize: '8px', fontFamily: 'var(--font-mono)',
                    }}>↺</button>
                  </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {events.map((event, i) => {
                    const color    = SEV_COLOR[event.severity] || 'var(--accent)'
                    const selected = selectedEvent?.id === event.id
                    return (
                      <div key={`${event.id}-${i}`} onClick={() => setSelected(event)} style={{
                        padding: '11px 16px', borderBottom: '1px solid var(--line)',
                        borderLeft: `2px solid ${selected ? color : 'transparent'}`,
                        background: selected ? `${color}08` : 'transparent',
                        cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{
                              width: '5px', height: '5px', borderRadius: '50%',
                              background: color, flexShrink: 0, display: 'inline-block',
                              boxShadow: event.severity === 'critical' ? `0 0 6px ${color}` : 'none',
                            }}/>
                            <span style={{ fontSize: '8px', color, letterSpacing: '1px', textTransform: 'uppercase' }}>{event.severity}</span>
                            <span style={{ fontSize: '8px', color: 'var(--muted)' }}>·</span>
                            <span
                              onClick={e => {
                                e.stopPropagation()
                                if (event.country && event.country !== 'Unknown') setCountry(event.country)
                              }}
                              style={{
                                fontSize: '8px', letterSpacing: '0.5px',
                                color: event.country !== 'Unknown' ? 'var(--accent)' : 'var(--muted)',
                                cursor: event.country !== 'Unknown' ? 'pointer' : 'default',
                                textDecoration: event.country !== 'Unknown' ? 'underline' : 'none',
                                textDecorationStyle: 'dotted',
                              }}
                            >{event.country !== 'Unknown' ? event.country : event.region}</span>
                          </div>
                          <span style={{ fontSize: '8px', color: 'var(--muted)' }}>{getTimeAgo(event.publishedAt)}</span>
                        </div>

                        <div style={{
                          fontSize: '11px', color: 'var(--primary)', lineHeight: '1.45',
                          marginBottom: '6px', fontFamily: 'var(--font-sans)', fontWeight: 400,
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>{event.title}</div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                            {event.coordinates?.lat && <span style={{ fontSize: '8px', color: 'var(--green)', opacity: 0.7 }}>◉</span>}
                            {event.biasData && <BiasBadge biasData={event.biasData} compact={true} />}
                          </div>
                          <span style={{ fontSize: '8px', color: 'var(--dim)' }}>{event.source}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {sideTab === 'INTEL' && (
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <BiasDistributionPanel meta={meta} />
                <QuotePanel />
              </div>
            )}

            {sideTab === 'CLOCK' && (
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <DoomsdayClock alwaysExpanded />
              </div>
            )}
          </div>
        </div>

        {/* ── Map area ── */}
        <div style={{ flex: 1, position: 'relative', background: '#060a10' }}>
          {leafletReady
            ? <><GeoMap events={events} onSelectEvent={setSelected} onSelectCountry={setCountry} /><ArsenalPanel /></>
            : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '9px', letterSpacing: '3px', color: 'var(--muted)' }}>
                  INITIALIZING THEATER MAP<span style={{ animation: 'blink 1s infinite' }}>_</span>
                </div>
              </div>
            )
          }
          {selectedEvent   && <EventDetail  event={selectedEvent}        onClose={() => setSelected(null)} />}
          {selectedCountry && <CountryIntel countryName={selectedCountry} onClose={() => setCountry(null)} />}
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
