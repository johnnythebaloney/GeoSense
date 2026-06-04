// src/services/countryService.js
const axios = require('axios')

const cache = { data: null, timestamp: null, TTL: 24 * 60 * 60 * 1000 }

async function fetchAllCountries() {
  if (cache.data && (Date.now() - cache.timestamp) < cache.TTL) return cache.data

  try {
    console.log('[Countries] Fetching from REST Countries...')
    // Only request up to 10 fields due to API limit
    const res = await axios.get('https://restcountries.com/v3.1/all', {
      params: { fields: 'name,cca2,cca3,capital,region,population,area,flags,currencies,languages' },
      timeout: 15000,
    })

    const countries = res.data.map(c => ({
      name:        c.name?.common || '',
      official:    c.name?.official || '',
      nativeName:  Object.values(c.name?.nativeName || {}).map(n => n.common).join(', '),
      cca2:        c.cca2 || '',
      cca3:        c.cca3 || '',
      capital:     c.capital?.[0] || 'N/A',
      region:      c.region || '',
      subregion:   c.subregion || '',
      continent:   c.continents?.[0] || c.region || '',
      population:  c.population || 0,
      area:        c.area || 0,
      coordinates: c.latlng ? { lat: c.latlng[0], lng: c.latlng[1] } : null,
      flag:        c.flags?.svg || c.flags?.png || null,
      flagEmoji:   getFlagEmoji(c.cca2),
      currencies:  Object.values(c.currencies || {}).map(cur => `${cur.name} (${cur.symbol || ''})`),
      languages:   Object.values(c.languages || {}),
      borders:     c.borders || [],
      googleMaps:  c.maps?.googleMaps || null,
      threatLevel: 'low',
      advisory:    null,
      conflicts:   [],
      conflictCount: 0,
    }))

    cache.data = countries
    cache.timestamp = Date.now()
    console.log(`[Countries] Loaded ${countries.length} countries`)
    return countries
  } catch (err) {
    console.error('[Countries] Failed:', err.message)
    return cache.data || []
  }
}

async function getCountry(nameOrCode) {
  const all = await fetchAllCountries()
  const q   = nameOrCode?.toLowerCase().trim()
  console.log('[getCountry] Searching for:', nameOrCode)
  // Try exact matches first
  let found = all.find(c =>
    c.name?.toLowerCase()     === q ||
    c.official?.toLowerCase() === q ||
    c.cca2?.toLowerCase()     === q ||
    c.cca3?.toLowerCase()     === q
  )
  if (found) return found
  // Try partial and fuzzy matches
  found = all.find(c =>
    c.name?.toLowerCase().includes(q) ||
    q.includes(c.name?.toLowerCase()) ||
    c.official?.toLowerCase().includes(q) ||
    q.includes(c.official?.toLowerCase()) ||
    (c.nativeName && c.nativeName.toLowerCase().includes(q))
  )
  if (found) return found
  // Try removing common suffixes (like ' of ...')
  for (const c of all) {
    if (c.name && q && c.name.toLowerCase().replace(/ of .*/, '') === q.replace(/ of .*/, '')) return c
  }
  return null
}

function getFlagEmoji(cca2) {
  if (!cca2 || cca2.length !== 2) return '🌐'
  return cca2.toUpperCase().split('').map(
    char => String.fromCodePoint(127397 + char.charCodeAt(0))
  ).join('')
}

module.exports = { fetchAllCountries, getCountry }
