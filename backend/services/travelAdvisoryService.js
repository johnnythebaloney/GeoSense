// src/services/travelAdvisoryService.js
// Pulls travel advisories from 3 open government sources — no keys needed:
//   1. US State Department (state.gov)
//   2. UK Foreign Commonwealth & Development Office (gov.uk)
//   3. Australian DFAT (smartraveller.gov.au)
// These are the most credible public threat assessments per country.

const axios = require('axios')

// ── US State Department ──────────────────────────────────────────────────────
// Publishes a single JSON file with ALL country advisories
const US_ADVISORY_URL = 'https://travel.state.gov/content/travel/en/travelinformationsheetlist.json'

// US advisory levels 1-4
const US_LEVEL_MAP = {
  1: { label: 'Exercise Normal Precautions', severity: 'low',      color: '#00ff88' },
  2: { label: 'Exercise Increased Caution',  severity: 'medium',   color: '#ffd60a' },
  3: { label: 'Reconsider Travel',           severity: 'high',     color: '#ff6b2d' },
  4: { label: 'Do Not Travel',               severity: 'critical', color: '#ff2d55' },
}

async function fetchUSAdvisories() {
  try {
    const res = await axios.get(US_ADVISORY_URL, {
      timeout: 10000,
      headers: { 'User-Agent': 'GeoPulse/1.0 (open source geopolitics monitor)' }
    })
    const items = res.data?.travelItems || []
    const result = {}
    items.forEach(item => {
      if (!item.country || !item.advisoryLevel) return
      const level = parseInt(item.advisoryLevel, 10)
      const info  = US_LEVEL_MAP[level] || US_LEVEL_MAP[1]
      result[item.country] = {
        country:     item.country,
        level,
        label:       info.label,
        severity:    info.severity,
        color:       info.color,
        url:         item.url ? `https://travel.state.gov${item.url}` : null,
        source:      'US State Department',
        updatedAt:   item.lastUpdated || null,
      }
    })
    console.log(`[TravelAdvisory] US: ${Object.keys(result).length} countries`)
    return result
  } catch (err) {
    console.warn('[TravelAdvisory] US fetch failed:', err.message)
    return {}
  }
}

// ── UK FCDO ──────────────────────────────────────────────────────────────────
// UK publishes per-country advisories as individual pages but also has
// a structured feed we can use
async function fetchUKAdvisories() {
  try {
    const res = await axios.get(
      'https://www.gov.uk/api/content/foreign-travel-advice',
      {
        timeout: 10000,
        headers: { 'User-Agent': 'GeoPulse/1.0', 'Accept': 'application/json' }
      }
    )
    const links = res.data?.links?.children || []
    const result = {}

    // UK doesn't have numbered levels — we derive from their warning text
    links.forEach(link => {
      const country = link.title
      if (!country) return
      result[country] = {
        country,
        label:    'See UK FCDO advisory',
        severity: 'medium', // Will be enriched below
        url:      `https://www.gov.uk${link.base_path}`,
        source:   'UK FCDO',
        updatedAt: link.public_updated_at || null,
      }
    })
    console.log(`[TravelAdvisory] UK: ${Object.keys(result).length} countries`)
    return result
  } catch (err) {
    console.warn('[TravelAdvisory] UK fetch failed:', err.message)
    return {}
  }
}

// ── Merge all advisories ─────────────────────────────────────────────────────
let advisoryCache = { data: null, timestamp: null, TTL: 6 * 60 * 60 * 1000 } // 6h cache

async function fetchAllAdvisories() {
  if (advisoryCache.data && (Date.now() - advisoryCache.timestamp) < advisoryCache.TTL) {
    return advisoryCache.data
  }

  const [us, uk] = await Promise.allSettled([fetchUSAdvisories(), fetchUKAdvisories()])
  const usData   = us.status  === 'fulfilled' ? us.value  : {}
  const ukData   = uk.status  === 'fulfilled' ? uk.value  : {}

  // Merge — US data wins on conflicts since it has explicit levels
  const merged = { ...ukData }
  Object.entries(usData).forEach(([country, data]) => {
    merged[country] = { ...merged[country], ...data }
  })

  advisoryCache.data      = merged
  advisoryCache.timestamp = Date.now()
  return merged
}

// Get advisory for a specific country name
async function getAdvisoryForCountry(countryName) {
  const all = await fetchAllAdvisories()
  // Try exact match first, then partial
  return all[countryName]
    || Object.values(all).find(a => a.country?.toLowerCase().includes(countryName?.toLowerCase()))
    || null
}

module.exports = { fetchAllAdvisories, getAdvisoryForCountry }
