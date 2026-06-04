// src/index.js
// ─────────────────────────────────────────────
// GeoPulse backend entry point
// Boots the Express server and mounts all routes
// ─────────────────────────────────────────────

require('dotenv').config(); // Load .env variables FIRST before anything else

const express = require('express');
const cors = require('cors');
const eventsRouter = require('./routes/events');
const sourcesRouter  = require('./routes/sources')
const countriesRouter = require('./routes/countries');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────────────────────

// CORS: allows our React frontend (on port 3000) to talk to this server
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Vite uses 5173
  methods: ['GET'],
}));

// Parse incoming JSON bodies (useful when we add POST routes later)
app.use(express.json());

// Simple request logger so you can see every call in the terminal
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ── Routes ──────────────────────────────────────────────────────────────────

// Health check — hit http://localhost:3001/health to confirm the server is up
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main endpoints
app.use('/api/events', eventsRouter);   // GET /api/events
app.use('/api/sources',   sourcesRouter);
app.use('/api/countries', countriesRouter); // GET /api/sources

// 404 catch-all for unknown routes
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler — catches anything that calls next(err)
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'Internal server error', detail: err.message });
});

// ── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🌍 GeoPulse backend running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Events API:   http://localhost:${PORT}/api/events\n`);
});
