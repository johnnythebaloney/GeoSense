# GeoPulse / GeoSense

A full-stack geopolitical event dashboard with a terminal-inspired frontend and a Node/Express backend that aggregates conflict data from multiple news sources.

## Project Overview

GeoPulse combines:
- a React + Vite frontend with a dark terminal / whistleblower aesthetic
- a Node.js + Express backend API that aggregates news events
- multiple data sources including NewsAPI, GDELT, and live quote APIs
- client-side filtering and an interactive Leaflet map

## Key Features

- Full-stack architecture: frontend UI + backend API
- Aggregates events from multiple sources with normalization
- Event feed with filtering by region, severity, country, and source
- Interactive map with markers and event detail modal
- Rotating geopolitical quotes
- Offline fallback support when external APIs are unavailable
- Secure server-side API key handling for sensitive news sources

## Architecture

```
frontend/    # React + Vite UI
backend/     # Express API server
```

The frontend calls the backend at `http://localhost:3001/api/events` and displays aggregated event data, while the backend fetches and normalizes data from external sources.

## Setup

### Prerequisites

- Node.js 18+ or compatible
- npm

### Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and add your NewsAPI key under `NEWS_API_KEY`.

Start the backend:

```bash
npm run dev
```

The backend runs on `http://localhost:3001`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3000`

### Running both locally

Open two terminals:

Terminal 1:
```bash
cd backend
npm run dev
```

Terminal 2:
```bash
cd frontend
npm run dev
```

Then open `http://localhost:3000`

## Backend API

### Health check

```http
GET /health
```

### Get conflict events

```http
GET /api/events
```

Optional query params:

- `region` — filter by region name, e.g. `?region=Africa`
- `severity` — filter by severity, e.g. `?severity=critical`
- `source` — filter by source domain, e.g. `?source=reuters`
- `country` — filter by country name, e.g. `?country=Ukraine`
- `limit` — max number of events returned
- `refresh` — set to `1` to bypass cache and force fresh external fetches

### Get filter metadata

```http
GET /api/sources
```

Returns available sources, regions, and severity levels for frontend filters.

## Event Shape

Events are normalized into a consistent shape, including:

- `id`
- `title`
- `description`
- `url`
- `source`
- `sourceDomain`
- `publishedAt`
- `country`
- `region`
- `severity`
- `tags`
- `coordinates` (Phase 1 is `null` until geocoding is added)
- `imageUrl`

## Notes

- Keep `.env` private. The repo includes `.env.example` for config but the real `.env` should be ignored.
- The frontend currently uses public quote and mapping APIs and loads event data through the backend.
- If the backend is offline, the frontend falls back to local/mock data.
- No update is being done right now because I am lazy.

## Folder Structure

- `backend/`
  - `index.js` — Express server entry point
  - `routes/` — API route handlers
  - `services/` — external data fetch + normalization logic
  - `.env.example` — example env config
- `frontend/`
  - `src/` — React app
  - `components/` — UI components
  - `hooks/` — data fetching hooks
  - `data/` — static quote data

## Security

- API keys for NewsAPI and similar services should be stored in `backend/.env` and never committed.
- `.gitignore` should include `.env` to prevent accidental pushes.

## Recommended resume bullet

- "Built a full-stack geopolitical dashboard with React/Vite frontend, Express backend, live data aggregation from multiple news APIs, filterable event visualization, and secure API key handling."
