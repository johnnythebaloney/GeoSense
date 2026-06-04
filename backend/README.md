# GeoPulse — Backend (Phase 1)

A Node.js + Express API server that aggregates geopolitical conflict events from multiple news sources.

## Project Structure

```
backend/
├── src/
│   ├── index.js                  # Entry point — starts Express server
│   ├── routes/
│   │   ├── events.js             # GET /api/events  (main endpoint)
│   │   └── sources.js            # GET /api/sources (filter metadata)
│   └── services/
│       ├── newsApiService.js     # Fetches from NewsAPI + normalizes
│       └── gdeltService.js       # Fetches from GDELT + normalizes
├── .env.example                  # Copy to .env and add your keys
└── package.json
```

## Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Create your .env file

```bash
cp .env.example .env
```

Then open `.env` and add your NewsAPI key.  
Get a **free** key at: https://newsapi.org/register

### 3. Start the server

```bash
# Development (auto-restarts on file changes)
npm run dev

# Production
npm start
```

The server runs on **http://localhost:3001**

---

## API Endpoints

### Health check
```
GET /health
→ { status: "ok", timestamp: "..." }
```

### Get conflict events
```
GET /api/events
→ { events: [...], meta: { total, cached, fetchedAt, ... } }
```

**Optional query params:**
| Param      | Example             | Description                  |
|------------|---------------------|------------------------------|
| `region`   | `?region=Africa`    | Filter by world region       |
| `severity` | `?severity=critical`| Filter by severity level     |
| `source`   | `?source=reuters`   | Filter by source domain      |
| `country`  | `?country=Ukraine`  | Filter by country name       |
| `limit`    | `?limit=20`         | Max results (default 50)     |
| `refresh`  | `?refresh=1`        | Bypass cache, force fresh    |

### Get single event
```
GET /api/events/:id
→ { event: { ... } }
```

### Get filter options
```
GET /api/sources
→ { sources: [...], regions: [...], severityLevels: [...] }
```

---

## Standard Event Shape

Every event returned by the API has this structure:

```json
{
  "id": "abc123",
  "title": "Clashes reported near border...",
  "description": "Short summary of the event.",
  "url": "https://reuters.com/...",
  "source": "Reuters",
  "sourceDomain": "reuters.com",
  "isPreferredSource": true,
  "publishedAt": "2024-01-15T10:30:00Z",
  "country": "Ukraine",
  "region": "Europe",
  "severity": "critical",
  "tags": ["conflict", "military"],
  "coordinates": null,
  "imageUrl": null
}
```

> `coordinates` is `null` in Phase 1. Phase 3 adds the geocoder that fills this in.

---

## How It Works (Learning Notes)

### Data flow
```
Client (React) → GET /api/events
  → events.js route handler
    → fetchNewsApiEvents()   runs in parallel with...
    → fetchGdeltEvents()     ...using Promise.allSettled()
  → deduplicateEvents()     removes duplicate URLs
  → sort by publishedAt     newest first
  → apply filters           region, severity, source, country
  → return JSON             { events, meta }
```

### Key concepts used
- **`Promise.allSettled()`** — runs multiple async calls at once; won't crash if one fails
- **In-memory cache** — avoids hammering external APIs; 5-minute TTL
- **Normalizer pattern** — each data source has its own `normalize*()` function that produces the same output shape; the route doesn't care where data came from
- **Query params** — `req.query` gives you URL params as an object
- **Error middleware** — `next(err)` passes errors to the global handler in `index.js`

---

## What's Coming Next

| Phase | What we build |
|-------|---------------|
| **Phase 2** | React frontend shell — layout, components, connect to this API |
| **Phase 3** | Interactive map with Leaflet.js, geocoding coordinates |
| **Phase 4** | News feed sidebar, source filtering, severity indicators |
| **Phase 5** | Full severity scoring engine with weighted keyword analysis |
