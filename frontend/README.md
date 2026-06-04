# GeoPulse — Frontend (Phase 2)

React + Vite frontend with a whistleblower/intelligence terminal aesthetic.

## Setup

```bash
cd geopulse-frontend
npm install
npm run dev
```

Opens at **http://localhost:3000**

> Make sure the backend is also running on port 3001 or you'll see fallback mock data.

## Running both together

Open **two terminals**:

Terminal 1 — Backend:
```bash
cd geopulse-backend
npm run dev
```

Terminal 2 — Frontend:
```bash
cd geopulse-frontend
npm run dev
```

Then open http://localhost:3000

## Project structure

```
src/
├── App.jsx                  # Root layout, state management
├── main.jsx                 # React entry point
├── index.css                # Global styles + scanline/grain effects
├── components/
│   ├── Header.jsx           # Top bar: clock, stats, warnings, ticker
│   ├── GeoMap.jsx           # Leaflet map with severity markers
│   ├── EventFeed.jsx        # Left sidebar: event list + filters
│   ├── EventDetail.jsx      # Modal overlay when event is clicked
│   └── QuotePanel.jsx       # Rotating geopolitical quotes
├── hooks/
│   └── useEvents.js         # Data fetching hook with fallback
└── data/
    └── quotes.js            # Quotes, warnings, ticker items
```

## Features

- Dark terminal / whistleblower aesthetic with scanlines and grain
- Live clock with UTC timestamp
- Animated news ticker
- Status warnings bar (SIGINT, ESCALATION, BLACKOUT etc.)
- Interactive Leaflet map — pulsing markers by severity
- Event feed with filter by region + severity
- Click any event → detail modal with full info
- Rotating geopolitical quotes from famous figures
- Works even if backend is offline (shows fallback data)
