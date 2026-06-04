// src/components/CountryIntel.jsx
// Full country intel card — shown when user clicks a country on the map
// or selects from the country list

import { useState, useEffect } from 'react'

const THREAT_COLOR = {
  critical: '#ff2d55', high: '#ff6b2d',
  medium:   '#ffd60a', low:  '#00ff88',
}
const THREAT_BG = {
  critical: 'rgba(255,45,85,0.07)',   high:   'rgba(255,107,45,0.07)',
  medium:   'rgba(255,214,10,0.07)',  low:    'rgba(0,255,136,0.05)',
}

export default function CountryIntel({ countryName, onClose }) {
  const [country, setCountry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [tab, setTab]         = useState('OVERVIEW')

  useEffect(() => {
    if (!countryName) return
    setLoading(true)
    setError(null)
    fetch(`http://localhost:3001/api/countries/${encodeURIComponent(countryName)}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setCountry(data.country)
        setLoading(false)
      })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [countryName])

  if (!countryName) return null

  const tColor = THREAT_COLOR[country?.threatLevel] || '#8a9bb0'
  const tBg    = THREAT_BG[country?.threatLevel]    || 'transparent'

  // Helper to render a field or fallback
  const renderField = (label, value) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
      <span style={{ color: 'var(--muted)', fontSize: '10px' }}>{label}</span>
      <span style={{ color: 'var(--bright)', fontSize: '10px' }}>{value ?? 'N/A'}</span>
    </div>
  )

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 950,
      background: 'rgba(4,6,10,0.95)',
      backdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.2s ease',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg2)', border: `1px solid ${tColor}44`,
        width: '580px', maxHeight: '85vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: `0 0 60px ${tColor}15`,
        animation: 'fadeUp 0.2s ease',
      }} onClick={e => e.stopPropagation()}>

        {loading && (
          <div style={{ padding: '60px', textAlign: 'center', fontSize: '9px', letterSpacing: '3px', color: 'var(--muted)' }}>
            RETRIEVING INTEL<span style={{ animation: 'blink 1s infinite' }}>_</span>
          </div>
        )}

        {error && (
          <div style={{ padding: '40px', textAlign: 'center', fontSize: '10px', color: 'var(--red)' }}>
            COUNTRY NOT FOUND IN DATABASE
            <div style={{ marginTop: '12px' }}>
              <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--line2)', color: 'var(--muted)', cursor: 'pointer', padding: '4px 12px', fontSize: '9px', fontFamily: 'var(--font-mono)' }}>CLOSE</button>
            </div>
          </div>
        )}

        {!loading && !error && country && (
          <>
            {!loading && !error && country && (
              <>
                {/* Header */}
                <div style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid var(--line)',
                  background: tBg,
                  flexShrink: 0,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      {/* Flag */}
                      {country.flag ? (
                        <img src={country.flag} alt={country.name} style={{ width: '52px', height: '34px', objectFit: 'cover', border: '1px solid var(--line2)' }}/>
                      ) : (
                        <span style={{ fontSize: '36px', lineHeight: 1 }}>{country.flagEmoji}</span>
                      )}
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', letterSpacing: '2px', color: 'var(--bright)', lineHeight: 1 }}>
                          {country.name?.toUpperCase()}
                        </div>
                        <div style={{ fontSize: '9px', color: 'var(--muted)', letterSpacing: '2px', marginTop: '4px' }}>
                          {country.official} · {country.cca2} · {country.continent}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '9px', letterSpacing: '1px', color: tColor, border: `1px solid ${tColor}44`, padding: '3px 8px', textTransform: 'uppercase', marginBottom: '4px' }}>
                          {country.advisory?.label || country.threatLevel?.toUpperCase() || 'UNKNOWN'}
                        </div>
                        {country.advisory?.source && (
                          <div style={{ fontSize: '8px', color: 'var(--muted)' }}>{country.advisory.source}</div>
                        )}
                      </div>
                      <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--line2)', color: 'var(--muted)', cursor: 'pointer', padding: '4px 10px', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>✕</button>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
                  {['OVERVIEW', 'CONFLICTS', 'ADVISORY'].map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                      padding: '8px 16px', background: 'none', border: 'none',
                      borderBottom: `2px solid ${tab === t ? tColor : 'transparent'}`,
                      color: tab === t ? tColor : 'var(--muted)',
                      cursor: 'pointer', fontSize: '9px', letterSpacing: '2px',
                      fontFamily: 'var(--font-mono)', transition: 'all 0.15s',
                    }}>{t}</button>
                  ))}
                </div>

                {/* Tab content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                  {tab === 'OVERVIEW' && country && (
                    <>
                      {renderField('Official Name', country.official)}
                      {renderField('Native Name', country.nativeName)}
                      {renderField('Capital', country.capital)}
                      {renderField('Region', country.region)}
                      {renderField('Continent', country.continent)}
                      {renderField('Population', country.population?.toLocaleString())}
                      {renderField('Area (km²)', country.area?.toLocaleString())}
                      {renderField('Languages', country.languages?.join(', '))}
                      {renderField('Currencies', country.currencies?.join(', '))}
                    </>
                  )}
                  {tab === 'CONFLICTS' && (
                    <div>
                      {country.conflicts && country.conflicts.length > 0 ? (
                        <ul>
                          {country.conflicts.map((conf, i) => <li key={i}>{conf}</li>)}
                        </ul>
                      ) : 'No conflicts reported.'}
                    </div>
                  )}
                  {tab === 'ADVISORY' && (
                    <div>
                      {country.advisory ? (
                        <>
                          {renderField('Label', country.advisory.label)}
                          {renderField('Source', country.advisory.source)}
                        </>
                      ) : 'No advisory information.'}
                    </div>
                  )}
                </div>
              </>
            )}
                      {country.borders?.length > 0 && (
                        <div>
                          <div style={{ fontSize: '22px', fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>
                            {country.borders.length}
                          </div>
                          <div style={{ fontSize: '9px', color: 'var(--muted)' }}>Bordering states</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Borders */}
                  {country.borders?.length > 0 && (
                    <div>
                      <div style={{ fontSize: '8px', letterSpacing: '2px', color: 'var(--muted)', marginBottom: '8px' }}>BORDERING STATES</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {country.borders.map(b => (
                          <span key={b} style={{ padding: '3px 8px', fontSize: '9px', border: '1px solid var(--line2)', color: 'var(--dim)', letterSpacing: '1px' }}>{b}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── CONFLICTS ── */}
              {tab === 'CONFLICTS' && (
                <div>
                  {country.conflicts?.length === 0 ? (
                    <div style={{ padding: '40px 0', textAlign: 'center', fontSize: '10px', color: 'var(--muted)' }}>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>✓</div>
                      NO ACTIVE CONFLICTS ON RECORD
                    </div>
                  ) : (
                    country.conflicts?.map(conflict => (
                      <div key={conflict.id} style={{ padding: '14px', border: '1px solid var(--line)', marginBottom: '8px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--primary)', fontFamily: 'var(--font-sans)', marginBottom: '8px' }}>{conflict.name}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          {conflict.startDate && (
                            <div>
                              <div style={{ fontSize: '8px', color: 'var(--muted)', letterSpacing: '1px', marginBottom: '2px' }}>STARTED</div>
                              <div style={{ fontSize: '10px', color: 'var(--body)' }}>{conflict.startDate}</div>
                            </div>
                          )}
                          {conflict.casualties && (
                            <div>
                              <div style={{ fontSize: '8px', color: 'var(--muted)', letterSpacing: '1px', marginBottom: '2px' }}>EST. CASUALTIES</div>
                              <div style={{ fontSize: '10px', color: 'var(--red)' }}>{conflict.casualties.toLocaleString()}</div>
                            </div>
                          )}
                        </div>
                        {conflict.wikipediaUrl && (
                          <a href={conflict.wikipediaUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '8px', fontSize: '8px', color: 'var(--accent)', letterSpacing: '1px', textDecoration: 'none' }}>
                            → WIKIPEDIA
                          </a>
                        )}
                      </div>
                    ))
                  )}
                  <div style={{ fontSize: '8px', color: 'var(--muted)', marginTop: '8px', letterSpacing: '1px' }}>
                    SOURCE: WIKIDATA / WIKIMEDIA FOUNDATION
                  </div>
                </div>
              )}

              {/* ── ADVISORY ── */}
              {tab === 'ADVISORY' && (
                <div>
                  {country.advisory ? (
                    <div>
                      <div style={{ padding: '16px', background: tBg, border: `1px solid ${tColor}33`, marginBottom: '16px' }}>
                        <div style={{ fontSize: '8px', letterSpacing: '2px', color: 'var(--muted)', marginBottom: '8px' }}>{country.advisory.source?.toUpperCase()}</div>
                        <div style={{ fontSize: '18px', color: tColor, fontFamily: 'var(--font-display)', letterSpacing: '1px', marginBottom: '6px' }}>
                          {country.advisory.label?.toUpperCase()}
                        </div>
                        {country.advisory.updated && (
                          <div style={{ fontSize: '9px', color: 'var(--muted)' }}>Updated: {country.advisory.updated}</div>
                        )}
                        {country.advisory.url && (
                          <a href={country.advisory.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '10px', fontSize: '9px', color: tColor, letterSpacing: '1px', textDecoration: 'none', border: `1px solid ${tColor}44`, padding: '4px 10px' }}>
                            → READ FULL ADVISORY
                          </a>
                        )}
                      </div>
                      <div style={{ fontSize: '9px', color: 'var(--muted)', lineHeight: 1.7, letterSpacing: '0.5px' }}>
                        Travel advisories are issued by government foreign affairs departments based on security assessments, crime levels, terrorism risk, civil unrest, and health factors.
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '40px 0', textAlign: 'center', fontSize: '10px', color: 'var(--muted)' }}>
                      NO TRAVEL ADVISORY DATA AVAILABLE
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '8px 24px', borderTop: '1px solid var(--line)', fontSize: '8px', color: 'var(--muted)', letterSpacing: '1px', flexShrink: 0, display: 'flex', justifyContent: 'space-between' }}>
              <span>SOURCES: REST COUNTRIES · WIKIDATA · US STATE DEPT · UK FCO · AU DFAT</span>
              {country.googleMaps && (
                <a href={country.googleMaps} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', letterSpacing: '1px' }}>→ GOOGLE MAPS</a>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function formatPopulation(n) {
  if (!n) return '—'
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`
  return n.toString()
}
