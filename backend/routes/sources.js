// src/routes/sources.js
// ─────────────────────────────────────────────
// GET /api/sources
//
// Returns the list of trusted sources and available
// filter options. The React frontend uses this to
// build its filter dropdowns dynamically.
// ─────────────────────────────────────────────

const express = require('express');
const router = express.Router();

/**
 * GET /api/sources
 * Returns static metadata about available sources and filter options.
 */
router.get('/', (_req, res) => {
  res.json({
    sources: TRUSTED_SOURCES,
    regions: REGIONS,
    severityLevels: SEVERITY_LEVELS,
  });
});

// ── Static metadata ───────────────────────────────────────────────────────────

const TRUSTED_SOURCES = [
  { name: 'Reuters',      domain: 'reuters.com',      bias: 'center',       type: 'wire' },
  { name: 'BBC News',     domain: 'bbc.com',          bias: 'center-left',  type: 'broadcaster' },
  { name: 'Al Jazeera',   domain: 'aljazeera.com',    bias: 'center',       type: 'broadcaster' },
  { name: 'AP News',      domain: 'apnews.com',       bias: 'center',       type: 'wire' },
  { name: 'The Guardian', domain: 'theguardian.com',  bias: 'center-left',  type: 'newspaper' },
  { name: 'DW',           domain: 'dw.com',           bias: 'center',       type: 'broadcaster' },
  { name: 'France 24',    domain: 'france24.com',     bias: 'center',       type: 'broadcaster' },
  { name: 'GDELT',        domain: 'gdeltproject.org', bias: 'aggregator',   type: 'database' },
];

const REGIONS = [
  { id: 'Europe',       label: 'Europe',        emoji: '🇪🇺' },
  { id: 'Middle East',  label: 'Middle East',   emoji: '🌙' },
  { id: 'Africa',       label: 'Africa',        emoji: '🌍' },
  { id: 'Asia',         label: 'Asia',          emoji: '🌏' },
  { id: 'Americas',     label: 'Americas',      emoji: '🌎' },
  { id: 'Global',       label: 'Global',        emoji: '🌐' },
];

const SEVERITY_LEVELS = [
  { id: 'critical', label: 'Critical', color: '#dc2626', description: 'War, genocide, nuclear threat' },
  { id: 'high',     label: 'High',     color: '#ea580c', description: 'Bombings, mass casualties' },
  { id: 'medium',   label: 'Medium',   color: '#ca8a04', description: 'Protests, coups, clashes' },
  { id: 'low',      label: 'Low',      color: '#16a34a', description: 'Sanctions, diplomatic tension' },
];

module.exports = router;
