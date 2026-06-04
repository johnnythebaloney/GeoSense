// src/components/BiasPanel.jsx
// Shows bias rating for a single event's source +
// an aggregate bias distribution bar across all events.

import { useState } from 'react'

const BIAS_CONFIG = {
  'Far Left':     { color: '#4444ff', short: 'FL', pos: 0   },
  'Left':         { color: '#6688ff', short: 'L',  pos: 1   },
  'Center-Left':  { color: '#88aaff', short: 'CL', pos: 2   },
  'Center':       { color: '#00ff88', short: 'C',  pos: 3   },
  'Center-Right': { color: '#ffaa44', short: 'CR', pos: 4   },
  'Right':        { color: '#ff6644', short: 'R',  pos: 5   },
  'Far Right':    { color: '#ff2222', short: 'FR', pos: 6   },
  'Aggregator':   { color: '#8888aa', short: 'AGG',pos: 3   },
  'Unknown':      { color: '#445566', short: '?',  pos: 3   },
}

const FACTUAL_COLOR = { HIGH: '#00ff88', MIXED: '#ffcc00', LOW: '#ff3b3b', UNKNOWN: '#445566' }
const FUNDING_COLOR = {
  commercial: '#ff7722', public: '#4488ff', nonprofit: '#00ff88',
  state: '#ff3b3b', intergovernmental: '#88aaff', academic: '#cc88ff', unknown: '#445566',
}

// ── Per-event bias badge (shown in event cards + detail) ──────────────────────
export function BiasBadge({ biasData, compact = false }) {
  const [tooltip, setTooltip] = useState(false)
  if (!biasData) return null

  const cfg   = BIAS_CONFIG[biasData.label] || BIAS_CONFIG['Unknown']
  const color = cfg.color

  if (compact) {
    return (
      <span
        style={{
          fontSize: '8px', letterSpacing: '1px', padding: '1px 5px',
          border: `1px solid ${color}`, color, cursor: 'help',
          position: 'relative', userSelect: 'none',
        }}
        onMouseEnter={() => setTooltip(true)}
        onMouseLeave={() => setTooltip(false)}
      >
        {biasData.label?.toUpperCase()}
        {tooltip && (
          <div style={{
            position: 'absolute', bottom: '18px', left: 0, zIndex: 999,
            background: '#0f1318', border: `1px solid ${color}`,
            padding: '8px 10px', minWidth: '180px', pointerEvents: 'none',
          }}>
            <div style={{ fontSize: '9px', color, marginBottom: '4px', letterSpacing: '1px' }}>{biasData.label}</div>
            <div style={{ fontSize: '9px', color: '#8a9bb0', marginBottom: '2px' }}>
              Reliability: <span style={{ color: '#c8d8e8' }}>{biasData.reliability}/100</span>
            </div>
            <div style={{ fontSize: '9px', color: '#8a9bb0', marginBottom: '2px' }}>
              Factual: <span style={{ color: FACTUAL_COLOR[biasData.factual] }}>{biasData.factual}</span>
            </div>
            <div style={{ fontSize: '9px', color: '#8a9bb0', marginBottom: '2px' }}>
              Owner: <span style={{ color: '#c8d8e8' }}>{biasData.owner}</span>
            </div>
            <div style={{ fontSize: '9px', color: '#8a9bb0' }}>
              Funding: <span style={{ color: FUNDING_COLOR[biasData.funding] || '#8a9bb0' }}>{biasData.funding}</span>
            </div>
          </div>
        )}
      </span>
    )
  }

  // Full version for event detail panel
  return (
    <div style={{ background: '#0a0c0f', border: `1px solid ${color}22`, padding: '12px' }}>
      <div style={{ fontSize: '9px', letterSpacing: '2px', color: '#556070', marginBottom: '10px' }}>SOURCE BIAS ANALYSIS</div>

      {/* Bias spectrum bar */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#3a4a5c', marginBottom: '4px' }}>
          <span style={{ color: '#6688ff' }}>◄ LEFT</span>
          <span style={{ color: '#00ff88' }}>CENTER</span>
          <span style={{ color: '#ff6644' }}>RIGHT ►</span>
        </div>
        <div style={{ position: 'relative', height: '6px', background: 'linear-gradient(to right, #4444ff, #88aaff, #00ff88, #ffaa44, #ff2222)', borderRadius: '3px' }}>
          {/* Marker dot */}
          <div style={{
            position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)',
            left: `${((biasData.bias + 2) / 4) * 100}%`,
            width: '10px', height: '10px', borderRadius: '50%',
            background: color, border: '2px solid #050608',
            boxShadow: `0 0 6px ${color}`,
          }}/>
        </div>
      </div>

      {/* Metadata grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '8px', letterSpacing: '1px', color: '#556070', marginBottom: '2px' }}>BIAS RATING</div>
          <div style={{ fontSize: '11px', color }}>{biasData.label}</div>
        </div>
        <div>
          <div style={{ fontSize: '8px', letterSpacing: '1px', color: '#556070', marginBottom: '2px' }}>RELIABILITY</div>
          <div style={{ fontSize: '11px', color: '#c8d8e8' }}>
            {biasData.reliability}/100
            <ReliabilityBar value={biasData.reliability} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: '8px', letterSpacing: '1px', color: '#556070', marginBottom: '2px' }}>FACTUAL REPORTING</div>
          <div style={{ fontSize: '11px', color: FACTUAL_COLOR[biasData.factual] }}>{biasData.factual}</div>
        </div>
        <div>
          <div style={{ fontSize: '8px', letterSpacing: '1px', color: '#556070', marginBottom: '2px' }}>FUNDING</div>
          <div style={{ fontSize: '11px', color: FUNDING_COLOR[biasData.funding] || '#8a9bb0', textTransform: 'capitalize' }}>{biasData.funding}</div>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ fontSize: '8px', letterSpacing: '1px', color: '#556070', marginBottom: '2px' }}>OWNERSHIP</div>
          <div style={{ fontSize: '11px', color: '#c8d8e8' }}>{biasData.owner}</div>
        </div>
      </div>
    </div>
  )
}

function ReliabilityBar({ value }) {
  const color = value >= 80 ? '#00ff88' : value >= 60 ? '#ffcc00' : '#ff3b3b'
  return (
    <div style={{ height: '3px', background: '#1e2530', marginTop: '4px', borderRadius: '2px' }}>
      <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: '2px', transition: 'width 0.5s' }}/>
    </div>
  )
}

// ── Aggregate bias distribution panel (shown below filters) ───────────────────
export function BiasDistributionPanel({ meta }) {
  const [expanded, setExpanded] = useState(false)
  if (!meta?.biasBreakdown) return null

  const bd = meta.biasBreakdown
  const total = Object.values(bd).reduce((a, b) => a + b, 0) || 1

  const bars = [
    { label: 'Left',   value: bd.left,        color: '#6688ff' },
    { label: 'C-Left', value: bd.centerLeft,   color: '#88aaff' },
    { label: 'Center', value: bd.center,       color: '#00ff88' },
    { label: 'C-Right',value: bd.centerRight,  color: '#ffaa44' },
    { label: 'Right',  value: bd.right,        color: '#ff6644' },
  ]

  const leftCount   = bd.left + bd.centerLeft
  const rightCount  = bd.right + bd.centerRight
  const dominance   = leftCount > rightCount ? 'LEFT-LEANING' : rightCount > leftCount ? 'RIGHT-LEANING' : 'BALANCED'
  const domColor    = leftCount > rightCount ? '#88aaff' : rightCount > leftCount ? '#ffaa44' : '#00ff88'

  return (
    <div style={{ borderBottom: '1px solid #1e2530', flexShrink: 0 }}>
      <button onClick={() => setExpanded(e => !e)} style={{
        width: '100%', padding: '7px 12px', background: 'none',
        border: 'none', cursor: 'pointer', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: '9px', letterSpacing: '2px', color: '#556070' }}>SOURCE BIAS INDEX</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '9px', color: domColor, letterSpacing: '1px' }}>{dominance}</span>
          <span style={{ fontSize: '9px', color: '#3a4a5c' }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div style={{ padding: '8px 12px 12px' }}>
          {/* Distribution bars */}
          <div style={{ display: 'flex', gap: '3px', height: '32px', alignItems: 'flex-end', marginBottom: '4px' }}>
            {bars.map(bar => (
              <div key={bar.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <div style={{ fontSize: '8px', color: bar.color }}>{bar.value}</div>
                <div style={{
                  width: '100%',
                  height: `${Math.max(4, (bar.value / total) * 28)}px`,
                  background: bar.color, opacity: 0.8,
                  transition: 'height 0.4s',
                }}/>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '3px' }}>
            {bars.map(bar => (
              <div key={bar.label} style={{ flex: 1, fontSize: '7px', color: '#3a4a5c', textAlign: 'center', letterSpacing: '0.5px' }}>
                {bar.label}
              </div>
            ))}
          </div>

          {/* Warning if heavily skewed */}
          {(leftCount > rightCount * 2 || rightCount > leftCount * 2) && (
            <div style={{ marginTop: '8px', padding: '5px 8px', background: 'rgba(255,204,0,0.06)', border: '1px solid #ffcc0044', fontSize: '9px', color: '#ffcc00', letterSpacing: '1px' }}>
              ⚠ COVERAGE SKEW DETECTED — consider adding opposing sources
            </div>
          )}

          <div style={{ marginTop: '8px', fontSize: '8px', color: '#3a4a5c', letterSpacing: '1px' }}>
            Based on AllSides, Ad Fontes Media & MBFC ratings
          </div>
        </div>
      )}
    </div>
  )
}
