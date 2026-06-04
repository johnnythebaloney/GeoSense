// src/services/wikidataService.js
// Queries Wikidata for active armed conflicts with locations, dates, casualties
// Completely open — Wikimedia Foundation, no key needed.

const axios = require('axios')

const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql'

// SPARQL query — fetches ongoing armed conflicts with coordinates
const CONFLICTS_QUERY = `
SELECT DISTINCT ?conflict ?conflictLabel ?country ?countryLabel 
  ?startDate ?casualties ?lat ?lon ?article WHERE {
  ?conflict wdt:P31 wd:Q350604 .
  OPTIONAL { ?conflict wdt:P17 ?country }
  OPTIONAL { ?conflict wdt:P580 ?startDate }
  OPTIONAL { ?conflict wdt:P1120 ?casualties }
  OPTIONAL {
    ?conflict wdt:P625 ?coord .
    BIND(geof:latitude(?coord)  AS ?lat)
    BIND(geof:longitude(?coord) AS ?lon)
  }
  OPTIONAL {
    ?article schema:about ?conflict .
    ?article schema:inLanguage "en" .
    FILTER(STRSTARTS(STR(?article), "https://en.wikipedia.org/"))
  }
  FILTER(?startDate >= "2000-01-01"^^xsd:dateTime || !BOUND(?startDate))
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
}
LIMIT 80
`

const wikidataCache = { data: null, timestamp: null, TTL: 12 * 60 * 60 * 1000 } // 12hr

async function fetchActiveConflicts() {
  const isFresh = wikidataCache.data &&
    (Date.now() - wikidataCache.timestamp) < wikidataCache.TTL
  if (isFresh) return wikidataCache.data

  try {
    const res = await axios.get(SPARQL_ENDPOINT, {
      params: { query: CONFLICTS_QUERY, format: 'json' },
      headers: {
        'Accept': 'application/sparql-results+json',
        'User-Agent': 'GeoPulse/1.0 (geopolitics monitor; contact@geopulse.app)',
      },
      timeout: 15000,
    })

    const bindings = res.data?.results?.bindings || []
    const conflicts = bindings.map(b => ({
      id:         b.conflict?.value?.split('/').pop(),
      name:       b.conflictLabel?.value || 'Unknown Conflict',
      country:    b.countryLabel?.value || 'Unknown',
      startDate:  b.startDate?.value?.split('T')[0] || null,
      casualties: b.casualties?.value ? parseInt(b.casualties.value) : null,
      coordinates: b.lat && b.lon ? {
        lat: parseFloat(b.lat.value),
        lng: parseFloat(b.lon.value),
      } : null,
      wikipediaUrl: b.article?.value || null,
      source: 'Wikidata',
    }))

    // Dedupe by conflict name
    const seen = new Set()
    const deduped = conflicts.filter(c => {
      if (seen.has(c.name)) return false
      seen.add(c.name)
      return true
    })

    wikidataCache.data      = deduped
    wikidataCache.timestamp = Date.now()
    console.log(`[Wikidata] Fetched ${deduped.length} active conflicts`)
    return deduped
  } catch (err) {
    console.error('[Wikidata] Failed:', err.message)
    return wikidataCache.data || []
  }
}

module.exports = { fetchActiveConflicts }
