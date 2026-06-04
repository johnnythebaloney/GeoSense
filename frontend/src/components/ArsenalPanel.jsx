// src/components/ArsenalPanel.jsx
// Global weapons stockpile browser — nuclear warheads, jets, missiles, naval

import { useState, useMemo, memo } from 'react'
import { NUCLEAR_STOCKPILES, MILITARY_AIRCRAFT, MISSILES, NAVAL_ASSETS } from '../data/arsenalData.js'

const THREAT_COLOR = { critical: '#ff3b3b', high: '#ff7722', medium: '#ffcc00', low: '#00ff88' }
const STATUS_COLOR = { ACTIVE: '#00ff88', TESTING: '#ffcc00', REFIT: '#ff7722', RETIRED: '#556070' }
const TABS = ['NUCLEAR', 'AIRCRAFT', 'MISSILES', 'NAVAL']

// Memoize total warheads calculation
const TOTAL_WARHEADS = NUCLEAR_STOCKPILES.reduce((a, b) => a + b.total, 0)

export default function ArsenalPanel() {
  const [open, setOpen]       = useState(false)
  const [tab, setTab]         = useState('NUCLEAR')
  const [expanded, setExpanded] = useState(null)

  return (
    <>
      {/* Trigger button — fixed bottom right of map */}
      <button onClick={() => setOpen(true)} style={{
        position: 'absolute', bottom: '48px', left: '12px', zIndex: 900,
        background: 'rgba(10,12,15,0.92)', border: '1px solid #ff3b3b',
        color: '#ff3b3b', cursor: 'pointer',
        padding: '7px 12px', fontSize: '9px', letterSpacing: '2px',
        fontFamily: "'Share Tech Mono', monospace",
        display: 'flex', alignItems: 'center', gap: '6px',
      }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff3b3b', display: 'inline-block' }}/>
        ARSENAL DATABASE
      </button>

      {/* Full panel overlay */}
      {open && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 950,
          background: 'rgba(5,6,8,0.96)',
          display: 'flex', flexDirection: 'column',
          backdropFilter: 'blur(2px)',
          animation: 'fadeIn 0.2s ease',
        }}>

          {/* Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #2a3441', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '20px', fontWeight: 700, color: '#ff3b3b', letterSpacing: '4px' }}>ARSENAL DATABASE</div>
              <div style={{ fontSize: '9px', letterSpacing: '2px', color: '#556070', marginTop: '2px' }}>
                KNOWN GLOBAL WEAPONS STOCKPILES // DECLASSIFIED SOURCES
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', color: '#ff3b3b', fontFamily: "'Oswald', sans-serif" }}>{TOTAL_WARHEADS.toLocaleString()}</div>
                <div style={{ fontSize: '8px', color: '#556070', letterSpacing: '1px' }}>NUCLEAR WARHEADS</div>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: '1px solid #2a3441', color: '#556070', cursor: 'pointer', padding: '4px 10px', fontSize: '10px', fontFamily: "'Share Tech Mono', monospace" }}>✕ CLOSE</button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #1e2530', flexShrink: 0 }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '10px 20px', fontSize: '10px', letterSpacing: '2px',
                cursor: 'pointer', background: 'none',
                border: 'none', borderBottom: `2px solid ${tab === t ? '#ff3b3b' : 'transparent'}`,
                color: tab === t ? '#ff3b3b' : '#3a4a5c',
                fontFamily: "'Share Tech Mono', monospace",
                transition: 'all 0.15s',
              }}>{t}</button>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>

            {/* ── NUCLEAR TAB ── */}
            {tab === 'NUCLEAR' && (
              <div>
                <div style={{ fontSize: '9px', letterSpacing: '2px', color: '#556070', marginBottom: '16px' }}>
                  SOURCE: FEDERATION OF AMERICAN SCIENTISTS (FAS) — 2025 ESTIMATES
                </div>
                {NUCLEAR_STOCKPILES.map(c => {
                  const pct = (c.total / NUCLEAR_STOCKPILES[0].total) * 100
                  return (
                    <div key={c.country} style={{ marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px' }}>{c.flag}</span>
                          <span style={{ fontSize: '12px', color: '#c8d8e8', fontFamily: "'Oswald', sans-serif", letterSpacing: '1px' }}>{c.country}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '10px' }}>
                          <span style={{ color: c.color }}>{c.total.toLocaleString()} total</span>
                          <span style={{ color: '#ff7722' }}>{c.deployed} deployed</span>
                        </div>
                      </div>
                      {/* Total bar */}
                      <div style={{ height: '8px', background: '#0f1318', borderRadius: '1px', marginBottom: '2px' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: c.color, opacity: 0.7, transition: 'width 0.5s', borderRadius: '1px' }}/>
                      </div>
                      {/* Deployed bar */}
                      <div style={{ height: '3px', background: '#0f1318', borderRadius: '1px' }}>
                        <div style={{ width: `${(c.deployed / c.total) * pct}%`, height: '100%', background: '#ff7722', opacity: 0.9, transition: 'width 0.5s', borderRadius: '1px' }}/>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#3a4a5c', marginTop: '2px' }}>
                        <span style={{ color: c.color, opacity: 0.7 }}>■ total stockpile</span>
                        <span style={{ color: '#ff7722' }}>■ deployed/operational</span>
                      </div>
                    </div>
                  )
                })}
                <div style={{ marginTop: '20px', padding: '10px', background: 'rgba(255,59,59,0.05)', border: '1px solid #ff3b3b22', fontSize: '9px', color: '#556070', lineHeight: 1.7 }}>
                  ⚠ Total global arsenal: ~{TOTAL_WARHEADS.toLocaleString()} warheads. A fraction of this is sufficient for a nuclear winter. 
                  Data from FAS, SIPRI & Arms Control Association — actual numbers classified.
                </div>
              </div>
            )}

            {/* ── AIRCRAFT TAB ── */}
            {tab === 'AIRCRAFT' && (
              <div>
                {MILITARY_AIRCRAFT.map(cat => (
                  <div key={cat.category} style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '9px', letterSpacing: '2px', color: '#556070', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid #1e2530' }}>
                      {cat.category.toUpperCase()}
                    </div>
                    {cat.items.map(item => (
                      <AssetRow key={item.name} item={item} expanded={expanded === item.name} onToggle={() => setExpanded(expanded === item.name ? null : item.name)} fields={[
                        { label: 'COUNTRY', value: item.country },
                        { label: 'ROLE',    value: item.role },
                        { label: 'SPEED',   value: item.speed },
                        { label: 'RANGE',   value: item.range },
                      ]}/>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* ── MISSILES TAB ── */}
            {tab === 'MISSILES' && (
              <div>
                {MISSILES.map(cat => (
                  <div key={cat.category} style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '9px', letterSpacing: '2px', color: '#556070', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid #1e2530' }}>
                      {cat.category.toUpperCase()}
                    </div>
                    {cat.items.map(item => (
                      <AssetRow key={item.name} item={item} expanded={expanded === item.name} onToggle={() => setExpanded(expanded === item.name ? null : item.name)} fields={[
                        { label: 'COUNTRY', value: item.country },
                        { label: 'TYPE',    value: item.type },
                        { label: 'RANGE',   value: item.range },
                        { label: 'PAYLOAD', value: item.payload },
                        ...(item.note ? [{ label: 'NOTE', value: item.note }] : []),
                      ]}/>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* ── NAVAL TAB ── */}
            {tab === 'NAVAL' && (
              <div>
                <div style={{ fontSize: '9px', letterSpacing: '2px', color: '#556070', marginBottom: '16px' }}>MAJOR NAVAL ASSETS // CARRIERS & STRATEGIC SUBMARINES</div>
                {NAVAL_ASSETS.map(item => (
                  <AssetRow key={item.name} item={item} expanded={expanded === item.name} onToggle={() => setExpanded(expanded === item.name ? null : item.name)} fields={[
                    { label: 'COUNTRY',      value: item.country },
                    { label: 'TYPE',         value: item.type },
                    { label: 'DISPLACEMENT', value: item.displacement },
                    ...(item.aircraft ? [{ label: 'AIRCRAFT', value: `${item.aircraft} max` }] : []),
                    ...(item.note ? [{ label: 'NOTE', value: item.note }] : []),
                  ]}/>
                ))}
              </div>
            )}

          </div>

          {/* Footer */}
          <div style={{ padding: '8px 20px', borderTop: '1px solid #1e2530', fontSize: '8px', color: '#2a3441', letterSpacing: '1px', flexShrink: 0 }}>
            SOURCES: SIPRI YEARBOOK 2025 // IISS MILITARY BALANCE // FAS NUCLEAR NOTEBOOK // OPEN SOURCE INTELLIGENCE
          </div>
        </div>
      )}
    </>
  )
}

function AssetRow({ item, expanded, onToggle, fields }) {
  const tColor = THREAT_COLOR[item.threat] || '#8a9bb0'
  const sColor = STATUS_COLOR[item.status] || '#556070'

  return (
    <div style={{ marginBottom: '4px', border: '1px solid #1e2530', cursor: 'pointer' }} onClick={onToggle}>
      {/* Row header */}
      <div style={{
        padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: expanded ? 'rgba(255,59,59,0.04)' : 'transparent',
        borderLeft: `2px solid ${expanded ? tColor : 'transparent'}`,
        transition: 'all 0.15s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: tColor, display: 'inline-block', boxShadow: `0 0 4px ${tColor}`, flexShrink: 0 }}/>
          <span style={{ fontSize: '12px', color: '#c8d8e8', fontFamily: "'Oswald', sans-serif", letterSpacing: '1px' }}>{item.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '8px', color: sColor, letterSpacing: '1px', border: `1px solid ${sColor}44`, padding: '1px 5px' }}>{item.status}</span>
          <span style={{ fontSize: '8px', color: tColor, letterSpacing: '1px', textTransform: 'uppercase' }}>{item.threat}</span>
          <span style={{ fontSize: '9px', color: '#3a4a5c' }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ padding: '10px 12px 12px', background: '#080b0f', borderTop: '1px solid #1e2530' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
            {fields.map(f => (
              <div key={f.label}>
                <div style={{ fontSize: '8px', letterSpacing: '1px', color: '#3a4a5c', marginBottom: '2px' }}>{f.label}</div>
                <div style={{ fontSize: '11px', color: '#c8d8e8' }}>{f.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
