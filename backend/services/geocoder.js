// src/services/geocoder.js
const axios = require('axios')

const cache = new Map()

const COUNTRY_COORDS = {
  'Ukraine':       { lat: 49.8, lng: 24.0 },
  'Russia':        { lat: 55.7, lng: 37.6 },
  'Israel':        { lat: 31.7, lng: 35.2 },
  'Palestine':     { lat: 31.9, lng: 35.2 },
  'Sudan':         { lat: 15.5, lng: 32.5 },
  'Myanmar':       { lat: 16.8, lng: 96.1 },
  'Syria':         { lat: 33.5, lng: 36.3 },
  'Iraq':          { lat: 33.3, lng: 44.4 },
  'Iran':          { lat: 35.6, lng: 51.4 },
  'Yemen':         { lat: 15.3, lng: 44.2 },
  'Ethiopia':      { lat: 9.0,  lng: 38.7 },
  'Somalia':       { lat: 2.0,  lng: 45.3 },
  'Mali':          { lat: 12.6, lng: -8.0 },
  'Nigeria':       { lat: 9.0,  lng: 8.6  },
  'Haiti':         { lat: 18.5, lng: -72.3 },
  'Taiwan':        { lat: 23.6, lng: 120.9 },
  'Pakistan':      { lat: 30.3, lng: 69.3 },
  'Afghanistan':   { lat: 33.9, lng: 67.7 },
  'China':         { lat: 35.8, lng: 104.1 },
  'United States': { lat: 38.9, lng: -77.0 },
  'France':        { lat: 48.8, lng: 2.3   },
  'Germany':       { lat: 52.5, lng: 13.4  },
  'Libya':         { lat: 26.3, lng: 17.2  },
  'Venezuela':     { lat: 6.4,  lng: -66.5 },
  'Colombia':      { lat: 4.7,  lng: -74.0 },
  'Congo':         { lat: -4.3, lng: 15.3  },
  'Mexico':        { lat: 23.6, lng: -102.5 },
  'Gaza':          { lat: 31.4, lng: 34.3  },
  'Lebanon':       { lat: 33.8, lng: 35.5  },
  'Saudi Arabia':  { lat: 24.6, lng: 46.7  },
  'Turkey':        { lat: 39.9, lng: 32.8  },
  'India':         { lat: 20.5, lng: 78.9  },
  'North Korea':   { lat: 40.3, lng: 127.5 },
  'South Korea':   { lat: 37.5, lng: 126.9 },
}

async function geocodeEvent(event) {
  if (event.coordinates?.lat && event.coordinates?.lng) return event

  const location = event.country || event.region
  if (!location || location === 'Unknown' || location === 'Global') return event

  if (cache.has(location)) return { ...event, coordinates: cache.get(location) }

  if (COUNTRY_COORDS[location]) {
    const coords = COUNTRY_COORDS[location]
    cache.set(location, coords)
    return { ...event, coordinates: coords }
  }

  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q: location, format: 'json', limit: 1 },
      headers: { 'User-Agent': 'GeoPulse/1.0' },
      timeout: 5000,
    })
    if (response.data?.[0]) {
      const coords = { lat: parseFloat(response.data[0].lat), lng: parseFloat(response.data[0].lon) }
      cache.set(location, coords)
      return { ...event, coordinates: coords }
    }
  } catch {}

  return event
}

async function geocodeEvents(events) {
  const results = []
  for (const event of events) {
    const alreadyCached = event.coordinates?.lat || COUNTRY_COORDS[event.country] || cache.has(event.country)
    const geocoded = await geocodeEvent(event)
    results.push(geocoded)
    if (!alreadyCached && event.country && event.country !== 'Unknown') {
      await new Promise(r => setTimeout(r, 1100))
    }
  }
  return results
}

module.exports = { geocodeEvents, geocodeEvent }
