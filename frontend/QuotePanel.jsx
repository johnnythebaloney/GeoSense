// src/components/QuotePanel.jsx
// Fetches live quotes from one public API + local fallback.
// API Ninjas support has been removed for now so the browser bundle
// does not expose any live API key during this push.
// Falls back to hardcoded quotes if the public API fails.

import { useState, useEffect, useRef } from 'react'
import { QUOTES } from '../data/quotes.js'

const CAT_COLOR = {
  warning: '#ff3b3b', power: '#ff7722', military: '#ff7722',
  war: '#ff3b3b', truth: '#00ff88', courage: '#00ff88',
  freedom: '#4488ff', peace: '#4488ff', diplomacy: '#4488ff',
  change: '#ffcc00', history: '#8a9bb0', humanity: '#8a9bb0',
  sovereignty: '#ffcc00', media: '#cc88ff',
  politics: '#ff7722', philosophy: '#00ff88', leadership: '#4488ff',
}

// ─── API fetchers ────────────────────────────────────────────────────────────

// API Ninjas integration removed until after push to avoid exposing the live API key.
// The component now uses the public type.fit API plus local fallback only.

async function fetchFromTypeFit() {
  const res = await fetch('https://type.fit/api/quotes')
  if (!res.ok) throw new Error('type.fit failed')
  const data = await res.json()
  const keywords = [
    'Churchill', 'Einstein', 'Lincoln', 'Roosevelt', 'Orwell',
    'Mandela', 'Gandhi', 'Jefferson', 'Plato', 'Aristotle',
    'Voltaire', 'Machiavelli', 'Sun Tzu', 'Napoleon', 'Marx',
    'Washington', 'Kennedy', 'Reagan', 'Thatcher', 'Kissinger',
  ]
  const filtered = data.filter(q =>
    q.author && keywords.some(k => q.author.includes(k)) && q.text?.length > 30
  )
  const shuffled = filtered.sort(() => Math.random() - 0.5).slice(0, 15)
  return shuffled.map(q => ({
    text: q.text,
    author: q.author.replace(', type.fit', '').trim(),
    role: 'Historical Figure',
    category: 'history',
  }))
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function QuotePanel() {
  const [quotes, setQuotes] = useState(QUOTES)
  const [idx, setIdx]       = useState(0)
  const [fade, setFade]     = useState(true)
  const [source, setSource] = useState('local')
  const poolRef             = useRef(QUOTES)

  useEffect(() => {
    async function loadQuotes() {
      try {
        const typefit = await fetchFromTypeFit()
        if (typefit.length > 0) {
          poolRef.current = typefit
          setQuotes(typefit)
          setSource('typefit')
          return
        }
      } catch {
        // ignore and fall back to local quotes
      }
      setSource('local')
    }
    loadQuotes()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setIdx(prev => {
          const pool = poolRef.current
          let next
          do { next = Math.floor(Math.random() * pool.length) } while (next === prev && pool.length > 1)
          return next
        })
        setFade(true)
      }, 400)
    }, 9000)
    return () => clearInterval(timer)
  }, [])

  const nextQuote = () => {
    setFade(false)
    setTimeout(() => {
      setIdx(prev => {
        const pool = poolRef.current
        let next
        do { next = Math.floor(Math.random() * pool.length) } while (next === prev && pool.length > 1)
        return next
      })
      setFade(true)
    }, 200)
  }

  const quote = quotes[idx] || QUOTES[0]
  const color = CAT_COLOR[quote.category] || 'var(--accent)'
  const sourceLabel = { typefit: 'TYPE.FIT // LIVE', local: 'LOCAL ARCHIVE' }[source]

  return (
    <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', background: 'var(--deep)', minHeight: '130px' }}>
      <div style={{ fontSize: '9px', letterSpacing: '2px', color: 'var(--muted)', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
        <span>INTEL ARCHIVE // QUOTE</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ color }}>{quote.category ? `#${quote.category.toUpperCase()}` : ''}</span>
          <span style={{ fontSize: '8px', color: source === 'local' ? 'var(--dim)' : 'var(--accent2)', letterSpacing: '1px' }}>● {sourceLabel}</span>
        </div>
      </div>

      <div style={{ opacity: fade ? 1 : 0, transition: 'opacity 0.4s ease' }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', lineHeight: 0.8, color, opacity: 0.25, marginBottom: '4px', userSelect: 'none' }}>"</div>

        <blockquote style={{ fontFamily: 'var(--font-serif)', fontSize: '12px', fontStyle: 'italic', color: 'var(--primary)', lineHeight: '1.6', margin: '0 0 10px 0', paddingLeft: '10px', borderLeft: `2px solid ${color}` }}>
          {quote.text}
        </blockquote>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '10px', color, fontFamily: 'var(--font-display)', letterSpacing: '1px' }}>— {quote.author}</div>
            <div style={{ fontSize: '9px', color: 'var(--muted)', marginTop: '2px' }}>{quote.role}</div>
          </div>
          <button onClick={nextQuote} style={{ background: 'none', border: '1px solid var(--border2)', color: 'var(--muted)', cursor: 'pointer', padding: '3px 8px', fontSize: '9px', fontFamily: 'var(--font-mono)', letterSpacing: '1px', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.target.style.borderColor = color; e.target.style.color = color }}
            onMouseLeave={e => { e.target.style.borderColor = 'var(--border2)'; e.target.style.color = 'var(--muted)' }}
          >NEXT →</button>
        </div>
      </div>
    </div>
  )
}
