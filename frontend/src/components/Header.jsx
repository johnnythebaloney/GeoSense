// src/components/Header.jsx — v2 clean
import { useState, useEffect } from 'react'
import { TICKER_ITEMS } from '../data/quotes.js'

const SEV_COLOR = { critical: '#ff2d55', high: '#ff6b2d', medium: '#ffd60a', low: '#00ff88' }

export default function Header({ stats, onOpenArsenal }) {
  const [time, setTime]   = useState(new Date())
  const [glitch, setGlitch] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    const g = setInterval(() => {
      setGlitch(true)
      setTimeout(() => setGlitch(false), 500)
    }, 10000 + Math.random() * 8000)
    return () => { clearInterval(t); clearInterval(g) }
  }, [])

  const pad = n => String(n).padStart(2, '0')
  const timeStr = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`

  return (
    <header style={{
      background: 'var(--bg1)',
      borderBottom: '1px solid var(--line)',
      flexShrink: 0,
      position: 'relative',
      zIndex: 100,
    }}>
      {/* Main header row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr auto',
        alignItems: 'center',
        padding: '0 24px',
        height: '60px',
        borderBottom: '1px solid var(--line)',
      }}>

        {/* Logo */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '32px',
              letterSpacing: '4px',
              color: 'var(--accent)',
              lineHeight: 1,
              display: 'block',
            }}>GEOPULSE</span>
            {glitch && (
              <span style={{
                position: 'absolute', inset: 0,
                fontFamily: 'var(--font-display)',
                fontSize: '32px', letterSpacing: '4px', lineHeight: 1,
                animation: 'glitch 0.5s steps(1) forwards',
              }}>GEOPULSE</span>
            )}
          </div>
          <span style={{ fontSize: '8px', letterSpacing: '3px', color: 'var(--muted)', alignSelf: 'center' }}>
            GLOBAL UNREST MONITOR
          </span>
        </div>

        {/* Center — stat pills */}
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
          {[
            { label: 'CRITICAL', value: stats?.critical || 0, color: 'var(--red)' },
            { label: 'HIGH',     value: stats?.high     || 0, color: 'var(--orange)' },
            { label: 'TOTAL',    value: stats?.total    || 0, color: 'var(--accent)' },
            { label: 'MAPPED',   value: stats?.mapped   || 0, color: 'var(--green)' },
          ].map(s => (
            <div key={s.label} style={{
              padding: '4px 14px',
              border: `1px solid ${s.color}33`,
              background: `${s.color}08`,
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span style={{ fontSize: '16px', fontFamily: 'var(--font-display)', color: s.color, letterSpacing: '1px', lineHeight: 1 }}>{s.value}</span>
              <span style={{ fontSize: '8px', letterSpacing: '2px', color: 'var(--muted)' }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Right — clock + live indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '26px', letterSpacing: '3px',
              color: 'var(--primary)', lineHeight: 1,
            }}>
              {timeStr}
              <span style={{ animation: 'blink 1s infinite', color: 'var(--accent)', fontSize: '20px' }}>_</span>
            </div>
            <div style={{ fontSize: '8px', color: 'var(--muted)', letterSpacing: '2px', marginTop: '2px' }}>
              {time.toISOString().split('T')[0]} UTC
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: 'var(--green)',
              animation: 'pulse-cyan 2s infinite',
            }}/>
            <span style={{ fontSize: '7px', letterSpacing: '1px', color: 'var(--green)' }}>LIVE</span>
          </div>
        </div>
      </div>

      {/* Ticker — slimmer, more refined */}
      <div style={{
        display: 'flex', alignItems: 'center',
        height: '26px', overflow: 'hidden',
        background: 'var(--bg0)',
      }}>
        <div style={{
          flexShrink: 0, padding: '0 14px', height: '100%',
          background: 'var(--red)', display: 'flex', alignItems: 'center',
          fontSize: '8px', letterSpacing: '3px', fontWeight: 500,
          color: 'white',
        }}>INTEL</div>
        <div style={{ overflow: 'hidden', flex: 1, height: '100%', display: 'flex', alignItems: 'center' }}>
          <div style={{
            display: 'inline-block', whiteSpace: 'nowrap',
            animation: 'ticker 60s linear infinite',
            fontSize: '9px', color: 'var(--dim)', letterSpacing: '1px',
            paddingLeft: '100%',
          }}>
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} style={{ marginRight: '80px' }}>{item}</span>
            ))}
          </div>
        </div>
        {/* Right side — doomsday + arsenal quick access */}
        <div style={{ flexShrink: 0, display: 'flex', borderLeft: '1px solid var(--line)', height: '100%' }}>
          <div style={{ padding: '0 14px', display: 'flex', alignItems: 'center', gap: '6px', borderRight: '1px solid var(--line)' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--red)', animation: 'pulse-red 2s infinite', display: 'inline-block' }}/>
            <span style={{ fontSize: '8px', color: 'var(--red)', letterSpacing: '1px' }}>85s TO MIDNIGHT</span>
          </div>
        </div>
      </div>
    </header>
  )
}
