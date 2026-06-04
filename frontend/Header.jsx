// src/components/Header.jsx
import { useState, useEffect } from 'react'
import { TICKER_ITEMS, WARNINGS } from '../data/quotes.js'

const SEV_COLOR = { critical: '#ff3b3b', high: '#ff7722', medium: '#ffcc00', low: '#00ff88' }

export default function Header({ stats }) {
  const [time, setTime] = useState(new Date())
  const [glitch, setGlitch] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    // Random glitch effect every 8-15s
    const g = setInterval(() => {
      setGlitch(true)
      setTimeout(() => setGlitch(false), 400)
    }, 8000 + Math.random() * 7000)
    return () => { clearInterval(t); clearInterval(g) }
  }, [])

  const pad = n => String(n).padStart(2, '0')
  const timeStr = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`
  const dateStr = time.toISOString().split('T')[0]

  return (
    <header style={{
      background: 'var(--deep)',
      borderBottom: '1px solid var(--border2)',
      position: 'sticky', top: 0, zIndex: 1000,
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px',
        borderBottom: '1px solid var(--border)',
      }}>
        {/* Logo */}
        <div style={{ position: 'relative' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            fontWeight: 700,
            letterSpacing: '6px',
            color: 'var(--accent)',
            textTransform: 'uppercase',
            position: 'relative',
          }}>
            {glitch && (
              <span style={{
                position: 'absolute', inset: 0,
                color: 'var(--red)',
                animation: 'glitch 0.4s steps(1) forwards',
                fontFamily: 'var(--font-display)',
                fontSize: '28px', fontWeight: 700, letterSpacing: '6px',
              }}>GEOPULSE</span>
            )}
            GEOPULSE
          </h1>
          <div style={{ fontSize: '9px', letterSpacing: '3px', color: 'var(--muted)', marginTop: '2px' }}>
            GLOBAL UNREST MONITOR // CLASSIFIED
          </div>
        </div>

        {/* Center stats */}
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          {[
            { label: 'ACTIVE ZONES', value: stats?.critical || '—', color: 'var(--red)' },
            { label: 'HIGH ALERT',   value: stats?.high || '—',     color: 'var(--orange)' },
            { label: 'MONITORED',    value: stats?.total || '—',    color: 'var(--accent)' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: 700, color: s.color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '9px', letterSpacing: '2px', color: 'var(--muted)', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Clock + status */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '22px', color: 'var(--accent)', fontFamily: 'var(--font-mono)', letterSpacing: '2px' }}>
            {timeStr}
            <span style={{ animation: 'blink 1s infinite', marginLeft: '4px', color: 'var(--accent)' }}>█</span>
          </div>
          <div style={{ fontSize: '9px', color: 'var(--muted)', letterSpacing: '2px', marginTop: '2px' }}>{dateStr} UTC</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: 'pulse-green 2s infinite' }}/>
            <span style={{ fontSize: '9px', color: 'var(--accent2)', letterSpacing: '1px' }}>LIVE FEED ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Warnings bar */}
      <div style={{
        display: 'flex', gap: '0', overflowX: 'auto',
        borderBottom: '1px solid var(--border)',
        padding: '6px 20px', gap: '16px',
      }}>
        {WARNINGS.map(w => (
          <div key={w.code} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            <span style={{
              width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0,
              background: w.level === 'danger' ? 'var(--red)' : w.level === 'warning' ? 'var(--yellow)' : 'var(--blue)',
              animation: w.level === 'danger' ? 'pulse-dot 1.5s infinite' : 'none',
            }}/>
            <span style={{ fontSize: '9px', color: 'var(--muted)', letterSpacing: '1px' }}>
              <span style={{ color: w.level === 'danger' ? 'var(--red)' : w.level === 'warning' ? 'var(--yellow)' : 'var(--blue)' }}>[{w.code}]</span>
              {' '}{w.label}
            </span>
          </div>
        ))}
      </div>

      {/* Ticker */}
      <div style={{
        overflow: 'hidden', background: 'var(--black)',
        borderBottom: '1px solid var(--border)',
        padding: '5px 0', display: 'flex', alignItems: 'center',
      }}>
        <div style={{
          flexShrink: 0, padding: '0 16px',
          fontSize: '9px', letterSpacing: '2px',
          color: 'var(--black)', background: 'var(--red)',
          fontWeight: 700, alignSelf: 'stretch',
          display: 'flex', alignItems: 'center',
        }}>INTEL</div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div style={{
            display: 'inline-block',
            animation: 'ticker 40s linear infinite',
            whiteSpace: 'nowrap',
            fontSize: '10px', color: 'var(--body)', letterSpacing: '1px',
            paddingLeft: '100%',
          }}>
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} style={{ marginRight: '80px' }}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
