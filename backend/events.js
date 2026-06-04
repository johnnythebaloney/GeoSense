// src/routes/events.js
const express        = require('express')
const { fetchNewsApiEvents } = require('../services/newsApiService')
const { fetchGdeltEvents }   = require('../services/gdeltService')
const { fetchRssEvents }     = require('../services/rssService')
const { geocodeEvents }      = require('../services/geocoder')
const SOURCE_BIAS            = require('../data/sourceBias')

const router = express.Router()
const cache  = { data: null, timestamp: null, TTL_MS: 5 * 60 * 1000 }

// Attach bias/reliability metadata to each event based on its sourceDomain
function enrichWithBias(events) {
  return events.map(event => {
    const domain = event.sourceDomain || 'unknown'
    // Try exact match first, then partial match
    const biasData = SOURCE_BIAS[domain]
      || Object.entries(SOURCE_BIAS).find(([key]) => domain.includes(key))?.[1]
      || { bias: 0, label: 'Unknown', reliability: 50, factual: 'UNKNOWN', owner: 'Unknown', funding: 'unknown' }
    return { ...event, biasData }
  })
}

router.get('/', async (req, res, next) => {
  try {
    const { region, severity, source, country, limit = 100, refresh } = req.query
    const isCacheValid = cache.data && (Date.now() - cache.timestamp) < cache.TTL_MS
    const forceRefresh = refresh === '1'
    let allEvents

    if (isCacheValid && !forceRefresh) {
      allEvents = cache.data
      console.log(`[Events] Serving ${allEvents.length} cached events`)
    } else {
      console.log('[Events] Fetching from all sources...')
      const [newsApiResult, gdeltResult, rssResult] = await Promise.allSettled([
        fetchNewsApiEvents(),
        fetchGdeltEvents(),
        fetchRssEvents(),
      ])
      const newsApiEvents = newsApiResult.status === 'fulfilled' ? newsApiResult.value : []
      const gdeltEvents   = gdeltResult.status   === 'fulfilled' ? gdeltResult.value   : []
      const rssEvents     = rssResult.status      === 'fulfilled' ? rssResult.value      : []

      console.log(`[Events] NewsAPI=${newsApiEvents.length} GDELT=${gdeltEvents.length} RSS=${rssEvents.length}`)

      const merged = deduplicateEvents([...newsApiEvents, ...rssEvents, ...gdeltEvents])
      merged.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))

      const geocoded   = await geocodeEvents(merged)
      allEvents        = enrichWithBias(geocoded)

      console.log(`[Events] Done: ${allEvents.length} events, ${allEvents.filter(e => e.coordinates?.lat).length} geocoded`)
      cache.data      = allEvents
      cache.timestamp = Date.now()
    }

    let filtered = allEvents
    if (region)   filtered = filtered.filter(e => e.region?.toLowerCase()         === region.toLowerCase())
    if (severity) filtered = filtered.filter(e => e.severity                       === severity.toLowerCase())
    if (source)   filtered = filtered.filter(e => e.sourceDomain?.includes(source.toLowerCase()))
    if (country)  filtered = filtered.filter(e => e.country?.toLowerCase().includes(country.toLowerCase()))

    const limitNum  = Math.min(parseInt(limit, 10) || 100, 200)
    const paginated = filtered.slice(0, limitNum)

    // Aggregate bias stats across all current events
    const biasBreakdown = { left: 0, centerLeft: 0, center: 0, centerRight: 0, right: 0, unknown: 0 }
    allEvents.forEach(e => {
      const b = e.biasData?.bias ?? 0
      if      (b <= -1)   biasBreakdown.left++
      else if (b < 0)     biasBreakdown.centerLeft++
      else if (b === 0)   biasBreakdown.center++
      else if (b <= 1)    biasBreakdown.centerRight++
      else                biasBreakdown.right++
    })

    const sourceCounts = {}
    allEvents.forEach(e => { sourceCounts[e.source] = (sourceCounts[e.source] || 0) + 1 })

    res.json({
      events: paginated,
      meta: {
        total: filtered.length, returned: paginated.length,
        cached: isCacheValid && !forceRefresh,
        fetchedAt: new Date(cache.timestamp || Date.now()).toISOString(),
        withCoords: paginated.filter(e => e.coordinates?.lat).length,
        biasBreakdown,
        sourceCounts,
      },
    })
  } catch (err) { next(err) }
})

router.get('/:id', (req, res) => {
  if (!cache.data) return res.status(503).json({ error: 'Cache not populated yet' })
  const event = cache.data.find(e => e.id === req.params.id)
  if (!event) return res.status(404).json({ error: 'Not found' })
  res.json({ event })
})

function deduplicateEvents(events) {
  const seenIds = new Set(), seenUrls = new Set()
  return events.filter(event => {
    const url = event.url?.split('?')[0]?.toLowerCase()
    if (seenIds.has(event.id) || seenUrls.has(url)) return false
    seenIds.add(event.id); seenUrls.add(url)
    return true
  })
}

module.exports = router
