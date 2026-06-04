// src/services/gdeltService.js
// ─────────────────────────────────────────────
// GDELT is a free, public dataset that monitors
// news media worldwide. No API key required.
// We query their public API for conflict events.
// ─────────────────────────────────────────────

const axios = require('axios');
const crypto = require('crypto');

// GDELT's free query API endpoint
// Docs: https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/
const GDELT_API = 'https://api.gdeltproject.org/api/v2/doc/doc';

// Rate limiting and retry configuration
const MAX_RETRIES = 3;
const INITIAL_DELAY = 2000; // Start with 2 second delay
const MAX_DELAY = 30000; // Cap at 30 seconds
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 3000; // Minimum 3 seconds between requests

/**
 * sleep(ms)
 * Utility to pause execution
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * getExponentialBackoffDelay(attemptNumber)
 * Calculates delay with exponential backoff: 2^attempt seconds + jitter
 */
function getExponentialBackoffDelay(attemptNumber) {
  const baseDelay = INITIAL_DELAY * Math.pow(2, attemptNumber - 1);
  const jitter = Math.random() * 1000; // Add 0-1 second random jitter
  return Math.min(baseDelay + jitter, MAX_DELAY);
}

/**
 * throttleRequest()
 * Ensures minimum interval between GDELT requests to respect rate limits
 */
async function throttleRequest() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const delayNeeded = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`[GDELT] Throttling: waiting ${Math.round(delayNeeded)}ms before next request`);
    await sleep(delayNeeded);
  }
  
  lastRequestTime = Date.now();
}

/**
 * fetchGdeltEventsWithRetry()
 * Queries GDELT with retry logic and exponential backoff for rate limits
 * @returns {Promise<Array>} — Array of normalized event objects
 */
async function fetchGdeltEvents() {
  let lastError = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Throttle to respect rate limits
      await throttleRequest();
      
      console.log(`[GDELT] Attempt ${attempt}/${MAX_RETRIES}: Fetching events...`);
      
      const response = await axios.get(GDELT_API, {
        params: {
          query: 'conflict OR war OR protest OR unrest',
          mode: 'artlist',      // Returns a list of articles
          maxrecords: 25,
          format: 'json',
          timespan: '1d',       // Last 24 hours only
          sort: 'DateDesc',     // Newest first
        },
        timeout: 15000, // Increased timeout slightly
      });

      const articles = response.data?.articles || [];
      console.log(`[GDELT] Success: Fetched ${articles.length} articles`);
      return articles.map(normalizeGdeltArticle);

    } catch (err) {
      lastError = err;
      const status = err.response?.status;
      
      // Handle specific error cases
      if (status === 429) {
        // Rate limited — extract retry-after if available
        const retryAfter = parseInt(err.response?.headers?.['retry-after'] || '0') * 1000;
        const delay = retryAfter || getExponentialBackoffDelay(attempt);
        
        console.warn(`[GDELT] Rate limited (429) on attempt ${attempt}/${MAX_RETRIES}`);
        console.warn(`[GDELT] Waiting ${Math.round(delay)}ms before retry...`);
        
        if (attempt < MAX_RETRIES) {
          await sleep(delay);
          continue;
        }
      } else if (status >= 500) {
        // Server error — retry with backoff
        const delay = getExponentialBackoffDelay(attempt);
        console.warn(`[GDELT] Server error (${status}) on attempt ${attempt}/${MAX_RETRIES}`);
        console.warn(`[GDELT] Waiting ${Math.round(delay)}ms before retry...`);
        
        if (attempt < MAX_RETRIES) {
          await sleep(delay);
          continue;
        }
      } else if (status === 408 || err.code === 'ECONNABORTED') {
        // Timeout — retry with backoff
        const delay = getExponentialBackoffDelay(attempt);
        console.warn(`[GDELT] Timeout on attempt ${attempt}/${MAX_RETRIES}`);
        console.warn(`[GDELT] Waiting ${Math.round(delay)}ms before retry...`);
        
        if (attempt < MAX_RETRIES) {
          await sleep(delay);
          continue;
        }
      } else {
        // Other error — don't retry
        console.error(`[GDELT] Non-retriable error: ${status || err.code} - ${err.message}`);
        break;
      }
    }
  }
  
  // All retries exhausted
  console.error('[GDELT] Fetch failed after all retries:', lastError?.message);
  return []; // GDELT is optional — return empty array on failure
}

/**
 * normalizeGdeltArticle(article)
 * Converts a GDELT article into our standard event shape.
 * GDELT provides different fields than NewsAPI, so we map them here.
 */
function normalizeGdeltArticle(article) {
  const text = `${article.title || ''} ${article.seendate || ''}`.toLowerCase();
  const hash = crypto.createHash('sha256').update(article.url || '').digest('hex').slice(0, 16);

  return {
    id: `gdelt-${hash}`,
    title: article.title || 'Untitled',
    description: article.title || 'No description available.',  // GDELT rarely has full descriptions
    url: article.url || '#',
    source: article.domain || 'GDELT Source',
    sourceDomain: article.domain || 'unknown',
    isPreferredSource: false,
    publishedAt: parseGdeltDate(article.seendate),
    country: guessCountry(text),
    region: guessRegion(text),
    severity: guessSeverity(text),
    tags: extractTags(text),
    coordinates: null,
    imageUrl: null,
    dataSource: 'gdelt', // Tag so the frontend can show where this came from
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * parseGdeltDate(seendate)
 * 
 */
function parseGdeltDate(seendate) {
  if (!seendate) return new Date().toISOString();
  try {
    // "20240115T120000Z" → "2024-01-15T12:00:00Z"
    const formatted = seendate.replace(
      /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/,
      '$1-$2-$3T$4:$5:$6Z'
    );
    return new Date(formatted).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

// Reuse the same country/region/severity logic as newsApiService
const COUNTRY_MAP = {
  ukraine: 'Ukraine', russia: 'Russia', israel: 'Israel', gaza: 'Palestine',
  sudan: 'Sudan', myanmar: 'Myanmar', syria: 'Syria', iraq: 'Iraq',
  iran: 'Iran', yemen: 'Yemen', ethiopia: 'Ethiopia', somalia: 'Somalia',
  mali: 'Mali', nigeria: 'Nigeria', haiti: 'Haiti', taiwan: 'Taiwan',
  pakistan: 'Pakistan', afghanistan: 'Afghanistan', china: 'China',
};

function guessCountry(text) {
  for (const [keyword, country] of Object.entries(COUNTRY_MAP)) {
    if (text.includes(keyword)) return country;
  }
  return 'Unknown';
}

function guessRegion(text) {
  if (/ukraine|russia|belarus/.test(text)) return 'Europe';
  if (/israel|gaza|iran|iraq|syria|yemen/.test(text)) return 'Middle East';
  if (/sudan|ethiopia|somalia|mali|nigeria/.test(text)) return 'Africa';
  if (/china|taiwan|myanmar|pakistan|afghanistan/.test(text)) return 'Asia';
  if (/haiti|venezuela|colombia|mexico/.test(text)) return 'Americas';
  return 'Global';
}

function guessSeverity(text) {
  const critical = ['war', 'airstrike', 'massacre', 'genocide', 'nuclear', 'invasion'];
  const high = ['killed', 'bombing', 'explosion', 'troops', 'missile', 'attack', 'dead'];
  const medium = ['protest', 'unrest', 'riot', 'coup', 'arrest', 'clash'];
  if (critical.some(kw => text.includes(kw))) return 'critical';
  if (high.some(kw => text.includes(kw))) return 'high';
  if (medium.some(kw => text.includes(kw))) return 'medium';
  return 'low';
}

function extractTags(text) {
  const keywords = ['conflict', 'war', 'protest', 'unrest', 'riot', 'coup',
    'airstrike', 'explosion', 'military', 'ceasefire', 'sanctions', 'invasion'];
  return keywords.filter(kw => text.includes(kw));
}

module.exports = { fetchGdeltEvents };
