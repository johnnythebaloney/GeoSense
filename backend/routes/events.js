// src/routes/events.js
// ─────────────────────────────────────────────
// GET /api/events
//
// The main endpoint the React frontend will call.
// Aggregates data from multiple sources, deduplicates,
// sorts, and returns a clean unified list of events.
// ─────────────────────────────────────────────

const express = require('express');
const { fetchNewsApiEvents } = require('../services/newsApiService');
const { fetchGdeltEvents } = require('../services/gdeltService');
const { fetchRssEvents } = require('../services/rssService');
const { geocodeEvents } = require('../services/geocoder');
const SOURCE_BIAS = require('../data/sourceBias');

const router = express.Router();

// Simple in-memory cache so we don't hammer external APIs on every request.
// A real production app would use Redis — this is fine for learning.
const cache = {
  data: null,
  timestamp: null,
  TTL_MS: 5 * 60 * 1000, // Cache for 5 minutes
};

function enrichWithBias(events) {
  return events.map(event => {
    const domain = event.sourceDomain || 'unknown';
    const biasData =
      SOURCE_BIAS[domain] ||
      Object.entries(SOURCE_BIAS).find(([key]) => domain.includes(key))?.[1] ||
      { bias: 0, label: 'Unknown', reliability: 50, factual: 'UNKNOWN', owner: 'Unknown', funding: 'unknown' };
    return { ...event, biasData };
  });
}

/**
 * GET /api/events
 *
 * Query params (all optional):
 *   ?region=   — filter by region  e.g. "Middle East"
 *   ?severity= — filter by severity e.g. "critical"
 *   ?source=   — filter by source domain e.g. "reuters.com"
 *   ?country=  — filter by country e.g. "Ukraine"
 *   ?limit=    — max number of results (default 50)
 *   ?refresh=1 — bypass cache and force a fresh fetch
 *
 * Response shape:
 *   { events: [...], meta: { total, sources, cached, fetchedAt } }
 */
router.get('/', async (req, res, next) => {
  try {
    const { region, severity, source, country, limit = 100, refresh } = req.query;

    // ── 1. Fetch events (from cache or live) ─────────────────────────────
    const isCacheValid = cache.data && (Date.now() - cache.timestamp) < cache.TTL_MS;
    const forceRefresh = refresh === '1';

    let allEvents;

    if (isCacheValid && !forceRefresh) {
      // Serve from cache
      allEvents = cache.data;
      console.log(`[Events] Serving ${allEvents.length} cached events`);
    } else {
      // Fetch from all sources in parallel — Promise.allSettled won't crash
      // even if one source fails (e.g. GDELT is down)
      console.log('[Events] Fetching fresh data from all sources...');
      const [newsApiResult, gdeltResult, rssResult] = await Promise.allSettled([
        fetchNewsApiEvents(),
        fetchGdeltEvents(),
        fetchRssEvents(),
      ]);

      // Extract values from settled promises (rejected ones return empty arrays)
      const newsApiEvents = newsApiResult.status === 'fulfilled' ? newsApiResult.value : [];
      const gdeltEvents = gdeltResult.status === 'fulfilled' ? gdeltResult.value : [];
      const rssEvents = rssResult.status === 'fulfilled' ? rssResult.value : [];

      console.log(`[Events] NewsAPI: ${newsApiEvents.length}, GDELT: ${gdeltEvents.length}, RSS: ${rssEvents.length}`);

      // Merge and deduplicate
      allEvents = deduplicateEvents([...newsApiEvents, ...rssEvents, ...gdeltEvents]);

      // Enrich with coordinates when possible
      allEvents = await geocodeEvents(allEvents);

      // Attach source bias metadata
      allEvents = enrichWithBias(allEvents);

      // Sort by date — newest first
      allEvents.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

      // Update cache
      cache.data = allEvents;
      cache.timestamp = Date.now();
    }

    // ── 2. Apply filters ─────────────────────────────────────────────────
    let filtered = allEvents;

    if (region)   filtered = filtered.filter(e => e.region?.toLowerCase() === region.toLowerCase());
    if (severity) filtered = filtered.filter(e => e.severity === severity.toLowerCase());
    if (source)   filtered = filtered.filter(e => e.sourceDomain?.includes(source.toLowerCase()));
    if (country)  filtered = filtered.filter(e => e.country?.toLowerCase().includes(country.toLowerCase()));

    // ── 3. Apply limit ───────────────────────────────────────────────────
    const limitNum = Math.min(parseInt(limit, 10) || 100, 200); // Hard cap at 200
    const paginated = filtered.slice(0, limitNum);

    // ── 4. Build response metadata ───────────────────────────────────────
    // Compute metadata only for filtered results (not all events)
    const sourceCounts = {};
    filtered.forEach(e => {
      sourceCounts[e.source] = (sourceCounts[e.source] || 0) + 1;
    });

    const biasBreakdown = { left: 0, centerLeft: 0, center: 0, centerRight: 0, right: 0, unknown: 0 };
    filtered.forEach(e => {
      const bias = e.biasData?.bias;
      if (typeof bias !== 'number') {
        biasBreakdown.unknown += 1;
      } else if (bias <= -1) {
        biasBreakdown.left += 1;
      } else if (bias < 0) {
        biasBreakdown.centerLeft += 1;
      } else if (bias === 0) {
        biasBreakdown.center += 1;
      } else if (bias <= 1) {
        biasBreakdown.centerRight += 1;
      } else {
        biasBreakdown.right += 1;
      }
    });

    res.json({
      events: paginated,
      meta: {
        total: filtered.length,          // Total matching the filters
        returned: paginated.length,      // How many we actually sent
        cached: isCacheValid && !forceRefresh,
        fetchedAt: new Date(cache.timestamp || Date.now()).toISOString(),
        withCoords: paginated.filter(e => Number.isFinite(Number(e.coordinates?.lat)) && Number.isFinite(Number(e.coordinates?.lng))).length,
        filters: { region, severity, source, country },
        biasBreakdown,
        sourceCounts,                    // Useful for building the filter UI
      },
    });

  } catch (err) {
    next(err); // Pass to global error handler in index.js
  }
});

/**
 * GET /api/events/:id
 * Returns a single event by ID.
 * Useful for a detail panel in the frontend.
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!cache.data) {
    return res.status(503).json({ error: 'Cache not yet populated — call /api/events first' });
  }

  const event = cache.data.find(e => e.id === id);
  if (!event) {
    return res.status(404).json({ error: `Event ${id} not found` });
  }

  res.json({ event });
});

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * deduplicateEvents(events)
 * Removes duplicate articles based on URL similarity.
 * NewsAPI and GDELT sometimes surface the same story from the same URL.
 */
function deduplicateEvents(events) {
  const seen = new Set();
  return events.filter(event => {
    // Normalize the URL by removing query params — same article, different tracking params
    const normalizedUrl = event.url?.split('?')[0]?.toLowerCase();
    if (seen.has(normalizedUrl)) return false;
    seen.add(normalizedUrl);
    return true;
  });
}

module.exports = router;
