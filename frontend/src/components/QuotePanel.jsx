// src/components/QuotePanel.jsx
import { useState, useEffect } from 'react'
import { QUOTES } from '../data/quotes.js'

const CAT_COLOR = {
  warning:    '#ff3b3b',
  power:      '#ff7722',
  military:   '#ff7722',
  war:        '#ff3b3b',
  truth:      '#00ff88',
  courage:    '#00ff88',
  freedom:    '#4488ff',
  peace:      '#4488ff',
  diplomacy:  '#4488ff',
  change:     '#ffcc00',
  history:    '#8a9bb0',
  humanity:   '#8a9bb0',
  sovereignty:'#ffcc00',
  media:      '#cc88ff',
}

export default function QuotePanel() {
  const [idx, setIdx]   = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setIdx(i => (i + 1) % QUOTES.length)
        setFade(true)
      }, 400)
    }, 8000)
    return () => clearInterval(timer)
  }, [])

  const quote = QUOTES[idx]
  const color = CAT_COLOR[quote.category] || 'var(--accent)'

  return (
    <div style={{
      padding: '16px',
      borderTop: '1px solid var(--border)',
      background: 'var(--deep)',
      minHeight: '120px',
    }}>
      <div style={{
        fontSize: '9px', letterSpacing: '2px', color: 'var(--muted)',
        marginBottom: '10px', display: 'flex', justifyContent: 'space-between',
      }}>
        <span>INTELLIGENCE ARCHIVE // QUOTE</span>
        <span style={{ color }}>#{quote.category.toUpperCase()}</span>
      </div>

      <div style={{
        opacity: fade ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}>
        {/* Opening quote mark */}
        <div style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '40px', lineHeight: 0.8,
          color: color, opacity: 0.3,
          marginBottom: '4px',
        }}>"</div>

        <blockquote style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '13px',
          fontStyle: 'italic',
          color: 'var(--primary)',
          lineHeight: '1.6',
          margin: '0 0 10px 0',
          paddingLeft: '8px',
          borderLeft: `2px solid ${color}`,
        }}>
          {quote.text}
        </blockquote>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '10px', color, fontFamily: 'var(--font-display)', letterSpacing: '1px' }}>
              — {quote.author}
            </div>
            <div style={{ fontSize: '9px', color: 'var(--muted)', marginTop: '2px' }}>
              {quote.role}
            </div>
          </div>

          {/* Dot indicators */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {QUOTES.slice(0, 8).map((_, i) => (
              <button key={i} onClick={() => { setFade(false); setTimeout(() => { setIdx(i); setFade(true) }, 200) }} style={{
                width: '4px', height: '4px', borderRadius: '50%',
                background: i === idx % 8 ? color : 'var(--border2)',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'background 0.3s',
              }}/>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
