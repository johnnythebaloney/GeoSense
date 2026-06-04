// src/services/newsApiService.js
// ─────────────────────────────────────────────
// Fetches articles from NewsAPI and normalizes
// them into our standard GeoPulse event shape.
// ─────────────────────────────────────────────

const axios = require('axios');
const crypto = require('crypto');

const BASE_URL = 'https://newsapi.org/v2/everything';

// Keywords we search for — NewsAPI will return articles matching ANY of these
const CONFLICT_KEYWORDS = [
  'conflict', 'war', 'protest', 'unrest', 'riot',
  'coup', 'airstrike', 'explosion', 'military', 'ceasefire',
  'sanctions', 'invasion', 'rebel', 'crisis',
].join(' OR ');

// Trusted geopolitical news sources we want to highlight in the UI
const PREFERRED_SOURCES = [
  'reuters.com', 'bbc.co.uk', 'bbc.com', 'aljazeera.com',
  'apnews.com', 'theguardian.com', 'dw.com',
];

/**
 * fetchNewsApiEvents()
 * Calls NewsAPI and returns an array of normalized events.
 *
 * @param {object} options
 * @param {string} options.query    - Override the default conflict keywords
 * @param {number} options.pageSize - How many articles to fetch (max 100 on free plan)
 * @returns {Promise<Array>}        - Array of normalized event objects
 */
async function fetchNewsApiEvents({ query = CONFLICT_KEYWORDS, pageSize = 30 } = {}) {
  const apiKey = (process.env.NEWS_API_KEY || '').trim();

  if (!apiKey || apiKey === 'your_newsapi_key_here') {
    console.warn('[NewsAPI] No API key set — returning mock data');
    return getMockEvents();
  }

  try {
    console.log('[NewsAPI] Fetching with key:', apiKey.slice(0, 8) + '...');
    const response = await axios.get(BASE_URL, {
      params: {
        q: query,
        language: 'en',
        sortBy: 'publishedAt',   // Newest first
        pageSize,
        apiKey,
      },
      timeout: 8000, // 8 second timeout — don't hang the server
    });

    console.log('[NewsAPI] Success! Got', response.data.articles?.length || 0, 'articles');
    // response.data.articles is the array of raw articles from NewsAPI
    return response.data.articles
      .filter(article => article.title && article.url) // Drop incomplete articles
      .map(normalizeArticle);

  } catch (err) {
    // If NewsAPI fails (rate limit, network error), log and fall back to mock data
    console.error('[NewsAPI] Fetch failed:', err.response?.status || err.message);
    if (err.response?.status === 401) {
      console.error('[NewsAPI] Invalid API key! Get one at https://newsapi.org/register');
    }
    return getMockEvents();
  }
}

/**
 * normalizeArticle(article)
 * Converts a raw NewsAPI article into our standard event shape.
 * Every data source (GDELT, ACLED, RSS) will also produce this same shape —
 * that's what lets the frontend treat them all identically.
 *
 * Standard event shape:
 * {
 *   id:          string   — unique identifier
 *   title:       string   — headline
 *   description: string   — short summary
 *   url:         string   — link to full article
 *   source:      string   — e.g. "Reuters", "BBC News"
 *   sourceDomain:string   — e.g. "reuters.com"
 *   publishedAt: string   — ISO date string
 *   country:     string   — best-guess country (we'll improve this in Phase 3)
 *   region:      string   — broad region
 *   severity:    string   — "low" | "medium" | "high" | "critical"
 *   tags:        string[] — matched keywords
 *   coordinates: { lat, lng } | null  — null until geocoded in Phase 3
 * }
 */
function normalizeArticle(article) {
  const domain = extractDomain(article.url);
  const text = `${article.title} ${article.description || ''}`.toLowerCase();
  const tags = CONFLICT_KEYWORDS.split(' OR ').filter(kw => text.includes(kw));
  const hash = crypto.createHash('sha256').update(article.url + (article.source?.name || '')).digest('hex').slice(0, 16);

  return {
    id: hash,
    title: article.title,
    description: article.description || 'No description available.',
    url: article.url,
    source: article.source?.name || 'Unknown',
    sourceDomain: domain,
    isPreferredSource: PREFERRED_SOURCES.some(s => domain.includes(s)),
    publishedAt: article.publishedAt,
    country: guessCountry(text),   // Simple regex-based guess — improved in Phase 3
    region: guessRegion(text),
    severity: guessSeverity(text), // Keyword scoring — full engine in Phase 4
    tags,
    coordinates: null,             // Will be filled by geocoder in Phase 3
    imageUrl: article.urlToImage || null,
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * extractDomain(url)
 * "https://www.reuters.com/world/..." → "reuters.com"
 */
function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'unknown';
  }
}

/**
 * guessCountry(text)
 * Very naive country detection by checking if the text mentions a country name.
 * Phase 3 will replace this with proper NER (Named Entity Recognition) or a geocoding API.
 */
const COUNTRY_MAP = {
  ukraine: 'Ukraine', russia: 'Russia', israel: 'Israel', gaza: 'Palestine',
  sudan: 'Sudan', myanmar: 'Myanmar', syria: 'Syria', iraq: 'Iraq',
  iran: 'Iran', yemen: 'Yemen', ethiopia: 'Ethiopia', somalia: 'Somalia',
  mali: 'Mali', nigeria: 'Nigeria', haiti: 'Haiti', taiwan: 'Taiwan',
  pakistan: 'Pakistan', afghanistan: 'Afghanistan', china: 'China',
  usa: 'United States', france: 'France', germany: 'Germany',
};

function guessCountry(text) {
  for (const [keyword, country] of Object.entries(COUNTRY_MAP)) {
    if (text.includes(keyword)) return country;
  }
  return 'Unknown';
}

/**
 * guessRegion(text)
 * Maps article text to a broad geographic region for filtering.
 */
function guessRegion(text) {
  if (/ukraine|russia|belarus|moldova/.test(text)) return 'Europe';
  if (/israel|gaza|iran|iraq|syria|yemen|saudi/.test(text)) return 'Middle East';
  if (/sudan|ethiopia|somalia|mali|nigeria|congo/.test(text)) return 'Africa';
  if (/china|taiwan|myanmar|pakistan|afghanistan/.test(text)) return 'Asia';
  if (/haiti|venezuela|colombia|mexico/.test(text)) return 'Americas';
  return 'Global';
}

/**
 * guessSeverity(text)
 * Scores the article text against keyword tiers.
 * Phase 4 will replace this with a proper weighted scoring engine.
 *
 * Severity tiers:
 *   critical → war, airstrike, massacre, genocide, nuclear
 *   high     → killed, bombing, explosion, troops, missile
 *   medium   → protest, unrest, riot, coup, arrest
 *   low      → (default)
 */
function guessSeverity(text) {
  const critical = ['war', 'airstrike', 'massacre', 'genocide', 'nuclear', 'invasion'];
  const high = ['killed', 'bombing', 'explosion', 'troops', 'missile', 'attack', 'dead'];
  const medium = ['protest', 'unrest', 'riot', 'coup', 'arrest', 'clash', 'tension'];

  if (critical.some(kw => text.includes(kw))) return 'critical';
  if (high.some(kw => text.includes(kw))) return 'high';
  if (medium.some(kw => text.includes(kw))) return 'medium';
  return 'low';
}

/**
 * getMockEvents()
 * Returned when no API key is configured.
 * Lets you develop and test the frontend without hitting any APIs.
 */
function getMockEvents() {
  return [
    {
      id: 'mock-001',
      title: 'Clashes reported near border region amid ongoing tensions',
      description: 'Military units have exchanged fire near the disputed border for the third consecutive day.',
      url: 'https://example.com/article/001',
      source: 'Reuters (mock)',
      sourceDomain: 'reuters.com',
      isPreferredSource: true,
      publishedAt: new Date().toISOString(),
      country: 'Ukraine',
      region: 'Europe',
      severity: 'critical',
      tags: ['conflict', 'military'],
      coordinates: { lat: 49.8397, lng: 24.0297 },
      imageUrl: null,
    },
    {
      id: 'mock-002',
      title: 'Mass protests erupt in capital over election results',
      description: 'Tens of thousands took to the streets demanding a recount as riot police deployed.',
      url: 'https://example.com/article/002',
      source: 'BBC News (mock)',
      sourceDomain: 'bbc.com',
      isPreferredSource: true,
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      country: 'Haiti',
      region: 'Americas',
      severity: 'high',
      tags: ['protest', 'unrest'],
      coordinates: { lat: 18.5944, lng: -72.3074 },
      imageUrl: null,
    },
    {
      id: 'mock-003',
      title: 'Airstrike targets rebel-held positions in northern region',
      description: 'Government forces conducted airstrikes overnight, displacing thousands of civilians.',
      url: 'https://example.com/article/003',
      source: 'Al Jazeera (mock)',
      sourceDomain: 'aljazeera.com',
      isPreferredSource: true,
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      country: 'Sudan',
      region: 'Africa',
      severity: 'critical',
      tags: ['airstrike', 'conflict', 'military'],
      coordinates: { lat: 15.5007, lng: 32.5599 },
      imageUrl: null,
    },
    {
      id: 'mock-004',
      title: 'Sanctions extended as diplomatic talks stall',
      description: 'World powers agreed to extend the current sanctions package after negotiations collapsed.',
      url: 'https://example.com/article/004',
      source: 'AP News (mock)',
      sourceDomain: 'apnews.com',
      isPreferredSource: true,
      publishedAt: new Date(Date.now() - 10800000).toISOString(),
      country: 'Iran',
      region: 'Middle East',
      severity: 'medium',
      tags: ['sanctions', 'crisis'],
      coordinates: { lat: 35.6892, lng: 51.389 },
      imageUrl: null,
    },
    {
      id: 'mock-005',
      title: 'Armed groups clash over territory in contested zone',
      description: 'Fighting broke out between rival militias, with reports of civilian casualties.',
      url: 'https://example.com/article/005',
      source: 'The Guardian (mock)',
      sourceDomain: 'theguardian.com',
      isPreferredSource: true,
      publishedAt: new Date(Date.now() - 14400000).toISOString(),
      country: 'Myanmar',
      region: 'Asia',
      severity: 'high',
      tags: ['conflict', 'rebel', 'military'],
      coordinates: { lat: 16.8661, lng: 96.1951 },
      imageUrl: null,
    },
  ];
}

module.exports = { fetchNewsApiEvents };
