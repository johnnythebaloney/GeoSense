// src/hooks/useEvents.js
import { useState, useEffect } from 'react'

export function useEvents(filters = {}) {
  const [events, setEvents]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (filters.severity && filters.severity !== 'all') params.append('severity', filters.severity)
        if (filters.region   && filters.region   !== 'all') params.append('region',   filters.region)

        const url = `http://localhost:3001/api/events${params.toString() ? '?' + params.toString() : ''}`
        const res  = await fetch(url)
        const data = await res.json()

        if (!cancelled) {
          const evts = data.events || []
          console.log('[useEvents] Setting', evts.length, 'events')
          setEvents(evts)
        }
      } catch (err) {
        console.error('[useEvents] Error:', err)
        if (!cancelled) {
          setError(err.message)
          setEvents(FALLBACK_EVENTS)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [filters.severity, filters.region])

  return { events, loading, error }
}

const FALLBACK_EVENTS = [
  { id: 'f1', title: 'Clashes reported near border amid ongoing tensions', description: 'Military units have exchanged fire near the disputed border.', source: 'Reuters', sourceDomain: 'reuters.com', publishedAt: new Date().toISOString(), country: 'Ukraine', region: 'Europe', severity: 'critical', tags: ['conflict','military'], coordinates: { lat: 49.8, lng: 24.0 }, url: '#' },
  { id: 'f2', title: 'Mass protests erupt in capital over election results', description: 'Tens of thousands took to the streets demanding a recount.', source: 'BBC News', sourceDomain: 'bbc.com', publishedAt: new Date(Date.now()-3600000).toISOString(), country: 'Haiti', region: 'Americas', severity: 'high', tags: ['protest','unrest'], coordinates: { lat: 18.5, lng: -72.3 }, url: '#' },
  { id: 'f3', title: 'Airstrike targets rebel positions in northern region', description: 'Government forces conducted airstrikes overnight.', source: 'Al Jazeera', sourceDomain: 'aljazeera.com', publishedAt: new Date(Date.now()-7200000).toISOString(), country: 'Sudan', region: 'Africa', severity: 'critical', tags: ['airstrike','conflict'], coordinates: { lat: 15.5, lng: 32.5 }, url: '#' },
]
