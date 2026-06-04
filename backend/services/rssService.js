// src/services/rssService.js
// Fetches from multiple free RSS feeds — no API keys needed.
// Covers Reuters, BBC, Al Jazeera, AP, DW, France24, UN News,
// Relief Web, Crisis Group, Foreign Policy and more.

const RSSParser = require('rss-parser')
const parser = new RSSParser({ timeout: 8000, headers: { 'User-Agent': 'GeoPulse/1.0' } })

const RSS_FEEDS = [
  // Wire services
  { url: 'https://feeds.reuters.com/reuters/worldNews',                        source: 'Reuters',        domain: 'reuters.com' },
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml',                        source: 'BBC News',       domain: 'bbc.com' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml',                          source: 'Al Jazeera',     domain: 'aljazeera.com' },
  { url: 'https://rsshub.app/apnews/topics/apf-intlnews',                      source: 'AP News',        domain: 'apnews.com' },

  // International broadcasters
  { url: 'https://rss.dw.com/xml/rss-en-world',                                source: 'DW',             domain: 'dw.com' },
  { url: 'https://www.france24.com/en/rss',                                    source: 'France 24',      domain: 'france24.com' },
  { url: 'https://www.rfi.fr/en/rss',                                          source: 'RFI',            domain: 'rfi.fr' },
  { url: 'https://feeds.skynews.com/feeds/rss/world.xml',                      source: 'Sky News',       domain: 'news.sky.com' },

  // Crisis & humanitarian
  { url: 'https://reliefweb.int/headlines/rss.xml',                            source: 'ReliefWeb',      domain: 'reliefweb.int' },
  { url: 'https://news.un.org/feed/subscribe/en/news/topic/peace-and-security/feed/rss.xml', source: 'UN News', domain: 'news.un.org' },

  // Regional
  { url: 'https://www.middleeasteye.net/rss',                                  source: 'Middle East Eye', domain: 'middleeasteye.net' },
  { url: 'https://theconversation.com/africa/articles.atom',                   source: 'The Conversation Africa', domain: 'theconversation.com' },

  // Analysis
  { url: 'https://foreignpolicy.com/feed/',                                    source: 'Foreign Policy', domain: 'foreignpolicy.com' },
  { url: 'https://www.crisisgroup.org/rss.xml',                                source: 'Crisis Group',   domain: 'crisisgroup.org' },
]

// Conflict-related keywords — articles not matching any of these are skipped
const CONFLICT_KEYWORDS = [
  'war', 'conflict', 'attack', 'strike', 'airstrike', 'bomb', 'explosion',
  'protest', 'riot', 'unrest', 'coup', 'military', 'troops', 'killed',
  'dead', 'casualties', 'rebel', 'militia', 'ceasefire', 'sanctions',
  'crisis', 'invasion', 'occupation', 'siege', 'humanitarian', 'refugee',
  'displaced', 'massacre', 'genocide', 'missile', 'drone', 'offensive',
  'tension', 'clashes', 'violence', 'hostage', 'territory', 'border',
]

/**
 * fetchRssEvents()
 * Fetches all RSS feeds in parallel, filters for conflict relevance,
 * and returns normalized events.
 */
async function fetchRssEvents() {
  const results = await Promise.allSettled(
    RSS_FEEDS.map(feed => fetchSingleFeed(feed))
  )

  const allItems = []
  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      allItems.push(...result.value)
      console.log(`[RSS] ${RSS_FEEDS[i].source}: ${result.value.length} items`)
    } else {
      console.warn(`[RSS] ${RSS_FEEDS[i].source} failed: ${result.reason?.message}`)
    }
  })

  return allItems
}

async function fetchSingleFeed({ url, source, domain }) {
  try {
    const feed  = await parser.parseURL(url)
    const items = (feed.items || []).slice(0, 15) // Max 15 per feed

    return items
      .filter(item => isConflictRelevant(item))
      .map(item => normalizeRssItem(item, source, domain))
  } catch {
    return []
  }
}

function isConflictRelevant(item) {
  const text = `${item.title || ''} ${item.contentSnippet || item.summary || ''}`.toLowerCase()
  return CONFLICT_KEYWORDS.some(kw => text.includes(kw))
}

function normalizeRssItem(item, source, domain) {
  const text = `${item.title || ''} ${item.contentSnippet || ''}`.toLowerCase()
  const url  = item.link || item.guid || '#'

  return {
    id:              `rss-${Buffer.from(url).toString('base64').slice(0, 32)}`,
    title:           item.title || 'Untitled',
    description:     item.contentSnippet || item.summary || item.content || 'No description.',
    url,
    source,
    sourceDomain:    domain,
    isPreferredSource: ['reuters.com','bbc.com','aljazeera.com','apnews.com','dw.com'].includes(domain),
    publishedAt:     item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    country:         guessCountry(text),
    region:          guessRegion(text),
    severity:        guessSeverity(text),
    tags:            extractTags(text),
    coordinates:     null,
    imageUrl:        item.enclosure?.url || null,
    dataSource:      'rss',
  }
}

// ── Shared helpers ───────────────────────────────────────────────────────────

const COUNTRY_MAP = {
  ukraine: 'Ukraine',       russia: 'Russia',         israel: 'Israel',
  gaza: 'Palestine',        palestine: 'Palestine',   sudan: 'Sudan',
  myanmar: 'Myanmar',       syria: 'Syria',           iraq: 'Iraq',
  iran: 'Iran',             yemen: 'Yemen',           ethiopia: 'Ethiopia',
  somalia: 'Somalia',       mali: 'Mali',             nigeria: 'Nigeria',
  haiti: 'Haiti',           taiwan: 'Taiwan',         pakistan: 'Pakistan',
  afghanistan: 'Afghanistan', china: 'China',         libya: 'Libya',
  venezuela: 'Venezuela',   colombia: 'Colombia',     congo: 'Congo',
  lebanon: 'Lebanon',       'saudi arabia': 'Saudi Arabia', turkey: 'Turkey',
  mexico: 'Mexico',         india: 'India',           'north korea': 'North Korea',
  'south korea': 'South Korea', bangladesh: 'Bangladesh', egypt: 'Egypt',
  tunisia: 'Tunisia',       algeria: 'Algeria',       morocco: 'Morocco',
  mozambique: 'Mozambique', kenya: 'Kenya',           senegal: 'Senegal',
  'burkina faso': 'Burkina Faso', niger: 'Niger',     chad: 'Chad',
  cambodia: 'Cambodia',     laos: 'Laos',             thailand: 'Thailand',
  indonesia: 'Indonesia',   philippines: 'Philippines', vietnam: 'Vietnam',
  azerbaijan: 'Azerbaijan', armenia: 'Armenia',       georgia: 'Georgia',
  belarus: 'Belarus',       moldova: 'Moldova',       kosovo: 'Kosovo',
  serbia: 'Serbia',         bosnia: 'Bosnia',
}

function guessCountry(text) {
  for (const [kw, country] of Object.entries(COUNTRY_MAP)) {
    if (text.includes(kw)) return country
  }
  return 'Unknown'
}

function guessRegion(text) {
  if (/ukraine|russia|belarus|moldova|kosovo|serbia|bosnia/.test(text)) return 'Europe'
  if (/israel|gaza|palestine|iran|iraq|syria|yemen|lebanon|saudi/.test(text)) return 'Middle East'
  if (/sudan|ethiopia|somalia|mali|nigeria|congo|kenya|libya|mozambique|niger|chad|burkina/.test(text)) return 'Africa'
  if (/china|taiwan|myanmar|pakistan|afghanistan|india|korea|cambodia|philippines|indonesia/.test(text)) return 'Asia'
  if (/haiti|venezuela|colombia|mexico|brazil|nicaragua|cuba/.test(text)) return 'Americas'
  return 'Global'
}

function guessSeverity(text) {
  const critical = ['war', 'airstrike', 'massacre', 'genocide', 'nuclear', 'invasion', 'siege', 'offensive']
  const high     = ['killed', 'dead', 'casualties', 'bombing', 'explosion', 'troops', 'missile', 'attack', 'hostage', 'drone strike']
  const medium   = ['protest', 'unrest', 'riot', 'coup', 'arrest', 'clash', 'tension', 'displaced', 'refugee', 'sanctions']
  if (critical.some(kw => text.includes(kw))) return 'critical'
  if (high.some(kw => text.includes(kw)))     return 'high'
  if (medium.some(kw => text.includes(kw)))   return 'medium'
  return 'low'
}

function extractTags(text) {
  return CONFLICT_KEYWORDS.filter(kw => text.includes(kw)).slice(0, 4)
}

module.exports = { fetchRssEvents }
