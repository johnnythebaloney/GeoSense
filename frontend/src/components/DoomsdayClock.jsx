// src/components/DoomsdayClock.jsx
// Official current time: 85 seconds to midnight (January 27, 2026)
// Source: Bulletin of the Atomic Scientists

import { useState, useEffect } from 'react'

const HISTORY = [
  { year: 1947, seconds: 420, label: '7 min' },
  { year: 1953, seconds: 120, label: '2 min' },
  { year: 1960, seconds: 420, label: '7 min' },
  { year: 1963, seconds: 720, label: '12 min' },
  { year: 1968, seconds: 420, label: '7 min' },
  { year: 1972, seconds: 720, label: '12 min' },
  { year: 1974, seconds: 540, label: '9 min' },
  { year: 1980, seconds: 420, label: '7 min' },
  { year: 1981, seconds: 264, label: '4 min' },
  { year: 1984, seconds: 180, label: '3 min' },
  { year: 1988, seconds: 360, label: '6 min' },
  { year: 1990, seconds: 600, label: '10 min' },
  { year: 1991, seconds: 1020, label: '17 min' },
  { year: 1995, seconds: 900, label: '15 min' },
  { year: 1998, seconds: 540, label: '9 min' },
  { year: 2002, seconds: 420, label: '7 min' },
  { year: 2007, seconds: 300, label: '5 min' },
  { year: 2010, seconds: 360, label: '6 min' },
  { year: 2012, seconds: 300, label: '5 min' },
  { year: 2015, seconds: 180, label: '3 min' },
  { year: 2017, seconds: 150, label: '2m 30s' },
  { year: 2018, seconds: 120, label: '2 min' },
  { year: 2020, seconds: 100, label: '100s' },
  { year: 2021, seconds: 100, label: '100s' },
  { year: 2022, seconds: 100, label: '100s' },
  { year: 2023, seconds: 90,  label: '90s' },
  { year: 2024, seconds: 90,  label: '90s' },
  { year: 2025, seconds: 89,  label: '89s' },
  { year: 2026, seconds: 85,  label: '85s' },
]

const CURRENT = HISTORY[HISTORY.length - 1]
const TOTAL_SECONDS = 1020 // 17 min = farthest ever (1991)

// Clock face drawing helpers
function ClockFace({ seconds }) {
  const size    = 120
  const cx      = size / 2
  const cy      = size / 2
  const radius  = 50
  const danger  = seconds <= 90

  // Midnight = 12 o'clock = -90deg offset
  // seconds remaining maps to angle: 0s = midnight (top), more seconds = further back
  const maxDisplaySeconds = 120 // show max 2 minutes on face
  const clampedSeconds    = Math.min(seconds, maxDisplaySeconds)
  const fraction          = clampedSeconds / maxDisplaySeconds // 0=midnight, 1=far back
  const angleDeg          = -90 - fraction * 120 // go back up to 120deg (≈4 hour positions)
  const angleRad          = (angleDeg * Math.PI) / 180

  const handLength = radius * 0.75
  const handX      = cx + Math.cos(angleRad) * handLength
  const handY      = cy + Math.sin(angleRad) * handLength

  // Minute markers
  const markers = Array.from({ length: 60 }, (_, i) => {
    const a   = ((i / 60) * 360 - 90) * (Math.PI / 180)
    const r1  = radius - (i % 5 === 0 ? 8 : 4)
    const r2  = radius
    return {
      x1: cx + Math.cos(a) * r1, y1: cy + Math.sin(a) * r1,
      x2: cx + Math.cos(a) * r2, y2: cy + Math.sin(a) * r2,
      major: i % 5 === 0,
    }
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Glow ring */}
      <circle cx={cx} cy={cy} r={radius + 4} fill="none" stroke={danger ? '#ff3b3b' : '#ffcc00'} strokeWidth="0.5" opacity="0.3"/>

      {/* Clock face */}
      <circle cx={cx} cy={cy} r={radius} fill="#050608" stroke={danger ? '#ff3b3b' : '#2a3441'} strokeWidth="1"/>

      {/* Tick marks */}
      {markers.map((m, i) => (
        <line key={i} x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2}
          stroke={m.major ? (danger ? '#ff3b3b88' : '#2a3441') : '#1e2530'}
          strokeWidth={m.major ? 1 : 0.5}
        />
      ))}

      {/* Danger zone arc (last 2 minutes = red) */}
      <path
        d={describeArc(cx, cy, radius - 6, -90, -90 - 40)}
        fill="none" stroke="#ff3b3b" strokeWidth="4" opacity="0.15"
      />

      {/* Hand */}
      <line
        x1={cx} y1={cy} x2={handX} y2={handY}
        stroke={danger ? '#ff3b3b' : '#ffcc00'}
        strokeWidth="1.5" strokeLinecap="round"
      />

      {/* Hand glow */}
      <line
        x1={cx} y1={cy} x2={handX} y2={handY}
        stroke={danger ? '#ff3b3b' : '#ffcc00'}
        strokeWidth="3" strokeLinecap="round" opacity="0.15"
      />

      {/* Center dot */}
      <circle cx={cx} cy={cy} r="3" fill={danger ? '#ff3b3b' : '#ffcc00'}/>

      {/* 12 marker */}
      <line x1={cx} y1={cy - radius + 1} x2={cx} y2={cy - radius + 10}
        stroke={danger ? '#ff3b3b' : '#ffcc00'} strokeWidth="2"/>
    </svg>
  )
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end   = polarToCartesian(cx, cy, r, startAngle)
  const large = endAngle - startAngle <= -180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

export default function DoomsdayClock() {
  const [expanded, setExpanded] = useState(false)
  const [pulse, setPulse]       = useState(false)

  // Pulse the clock every few seconds for dramatic effect
  useEffect(() => {
    const t = setInterval(() => {
      setPulse(true)
      setTimeout(() => setPulse(false), 600)
    }, 4000)
    return () => clearInterval(t)
  }, [])

  const danger = CURRENT.seconds <= 90

  return (
    <div style={{ borderTop: '1px solid #1e2530', background: '#050608', flexShrink: 0 }}>

      {/* Collapsed header — always visible */}
      <button onClick={() => setExpanded(e => !e)} style={{
        width: '100%', padding: '8px 12px', background: 'none',
        border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Mini clock indicator */}
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: '#ff3b3b',
            boxShadow: pulse ? '0 0 10px #ff3b3b' : '0 0 4px #ff3b3b44',
            transition: 'box-shadow 0.3s',
            flexShrink: 0,
          }}/>
          <span style={{ fontSize: '9px', letterSpacing: '2px', color: '#556070' }}>DOOMSDAY CLOCK</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '11px', color: '#ff3b3b', letterSpacing: '1px',
            fontFamily: "'Share Tech Mono', monospace",
          }}>
            {CURRENT.seconds}s TO MIDNIGHT
          </span>
          <span style={{ fontSize: '9px', color: '#3a4a5c' }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div style={{ padding: '0 12px 16px' }}>

          {/* Clock + current reading */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{
              filter: pulse ? 'drop-shadow(0 0 8px #ff3b3b)' : 'drop-shadow(0 0 4px #ff3b3b44)',
              transition: 'filter 0.3s', flexShrink: 0,
            }}>
              <ClockFace seconds={CURRENT.seconds} />
            </div>
            <div>
              <div style={{ fontSize: '28px', color: '#ff3b3b', fontFamily: "'Oswald', sans-serif", fontWeight: 700, lineHeight: 1 }}>
                {CURRENT.seconds}s
              </div>
              <div style={{ fontSize: '10px', color: '#ff3b3b', letterSpacing: '1px', marginBottom: '6px' }}>
                TO MIDNIGHT
              </div>
              <div style={{ fontSize: '9px', color: '#556070', lineHeight: 1.5 }}>
                Set: Jan 27, 2026<br/>
                Closest ever in history<br/>
                ↑ 4s from 2025 (89s)
              </div>
            </div>
          </div>

          {/* Reason */}
          <div style={{ padding: '8px 10px', background: 'rgba(255,59,59,0.05)', border: '1px solid #ff3b3b22', marginBottom: '12px' }}>
            <div style={{ fontSize: '8px', letterSpacing: '2px', color: '#556070', marginBottom: '4px' }}>BULLETIN STATEMENT 2026</div>
            <div style={{ fontSize: '10px', color: '#8a9bb0', lineHeight: 1.6, fontStyle: 'italic' }}>
              "Catastrophic risks are on the rise, cooperation is on the decline, and we are running out of time."
            </div>
            <div style={{ fontSize: '9px', color: '#3a4a5c', marginTop: '4px' }}>
              — Alexandra Bell, CEO, Bulletin of Atomic Scientists
            </div>
          </div>

          {/* Threat factors */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '8px', letterSpacing: '2px', color: '#556070', marginBottom: '6px' }}>CONTRIBUTING THREATS</div>
            {[
              { label: 'Nuclear weapons', level: 95, color: '#ff3b3b' },
              { label: 'Climate change',  level: 80, color: '#ff7722' },
              { label: 'AI / disinfo',    level: 75, color: '#ffcc00' },
              { label: 'Biosecurity',     level: 65, color: '#ffcc00' },
            ].map(t => (
              <div key={t.label} style={{ marginBottom: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#3a4a5c', marginBottom: '2px' }}>
                  <span>{t.label}</span><span style={{ color: t.color }}>{t.level}%</span>
                </div>
                <div style={{ height: '2px', background: '#1e2530', borderRadius: '1px' }}>
                  <div style={{ width: `${t.level}%`, height: '100%', background: t.color, borderRadius: '1px' }}/>
                </div>
              </div>
            ))}
          </div>

          {/* Historical mini chart */}
          <div>
            <div style={{ fontSize: '8px', letterSpacing: '2px', color: '#556070', marginBottom: '6px' }}>HISTORICAL TIMELINE</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '40px' }}>
              {HISTORY.slice(-15).map((h, i) => {
                const maxS  = 1020
                const pct   = (h.seconds / maxS) * 100
                const isNow = h.year === CURRENT.year
                return (
                  <div key={h.year} title={`${h.year}: ${h.label}`} style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'flex-end', height: '100%',
                    cursor: 'help',
                  }}>
                    <div style={{
                      width: '100%', height: `${Math.max(6, pct * 0.4)}px`,
                      background: isNow ? '#ff3b3b' : h.seconds <= 90 ? '#ff7722' : '#2a3441',
                      boxShadow: isNow ? '0 0 6px #ff3b3b' : 'none',
                    }}/>
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7px', color: '#2a3441', marginTop: '3px' }}>
              <span>{HISTORY[HISTORY.length - 15].year}</span>
              <span style={{ color: '#ff3b3b' }}>2026</span>
            </div>
          </div>

          <a href="https://thebulletin.org/doomsday-clock/" target="_blank" rel="noopener noreferrer" style={{
            display: 'block', marginTop: '10px', fontSize: '8px',
            color: '#3a4a5c', letterSpacing: '1px', textDecoration: 'none',
            textAlign: 'right',
          }}>→ BULLETIN OF ATOMIC SCIENTISTS</a>
        </div>
      )}
    </div>
  )
}
