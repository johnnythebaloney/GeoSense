// src/components/GeoMap.jsx
// Features:
//   - Pulsing severity markers
//   - Marker clustering (Leaflet.markercluster)
//   - Heatmap layer (Leaflet.heat)
//   - Toggle between cluster / heatmap / raw views

import { useEffect, useRef, useState } from 'react'

const SEV_COLOR  = { critical: '#ff3b3b', high: '#ff7722', medium: '#ffcc00', low: '#00ff88' }
const SEV_RADIUS = { critical: 18, high: 14, medium: 11, low: 8 }

const CDN = {
  cluster:    'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js',
  clusterCss: 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css',
  clusterDef: 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css',
  heat:       'https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js',
}

function loadScript(src) {
  return new Promise(resolve => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
    const s = document.createElement('script')
    s.src = src; s.onload = resolve
    document.head.appendChild(s)
  })
}
function loadCss(href) {
  if (document.querySelector(`link[href="${href}"]`)) return
  const l = document.createElement('link')
  l.rel = 'stylesheet'; l.href = href
  document.head.appendChild(l)
}

export default function GeoMap({ events, onSelectEvent }) {
  const mapRef      = useRef(null)
  const instanceRef = useRef(null)
  const layersRef   = useRef({ markers: null, cluster: null, heat: null })
  const [mode, setMode]       = useState('cluster') // 'cluster' | 'heat' | 'raw'
  const [pluginsReady, setPluginsReady] = useState(false)

  // Load plugins once
  useEffect(() => {
    loadCss(CDN.clusterCss)
    loadCss(CDN.clusterDef)
    Promise.all([loadScript(CDN.cluster), loadScript(CDN.heat)])
      .then(() => setPluginsReady(true))
  }, [])

  // Init map once
  useEffect(() => {
    if (instanceRef.current || !window.L) return
    const map = window.L.map(mapRef.current, {
      center: [20, 10], zoom: 2,
      zoomControl: true, attributionControl: false,
    })
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map)
    instanceRef.current = map

    // Click anywhere on map (not a marker) to get country
    map.on('click', async (e) => {
      console.log('MAP CLICKED', e.latlng) // ADD THIS LINE
      if (!onSelectEvent) return
      try {
        const { lat, lng } = e.latlng
        console.log('Fetching country for', lat, lng) // ADD THIS LINE
        const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
        const data = await res.json()
        const country = data?.address?.country
        console.log('Got country:', country) // ADD THIS LINE
        if (country) onSelectEvent(country)
      } catch (err) {
        console.log('Error:', err) // ADD THIS LINE
      }
    })
  }, [])

  // Rebuild layers when events or mode changes
  useEffect(() => {
    const L   = window.L
    const map = instanceRef.current
    if (!L || !map || !pluginsReady) return

    // Clear all existing layers
    Object.values(layersRef.current).forEach(l => { if (l) map.removeLayer(l) })
    layersRef.current = { markers: null, cluster: null, heat: null }

    const located = events.filter(e => e.coordinates?.lat && e.coordinates?.lng)
    if (!located.length) return

    if (mode === 'heat') {
      // ── Heatmap ───────────────────────────────────────────────────────
      const sevWeight = { critical: 1.0, high: 0.7, medium: 0.4, low: 0.2 }
      const points = located.map(e => [
        e.coordinates.lat,
        e.coordinates.lng,
        sevWeight[e.severity] || 0.3,
      ])
      const heat = L.heatLayer(points, {
        radius: 35, blur: 25, maxZoom: 6,
        gradient: { 0.2: '#00ff88', 0.4: '#ffcc00', 0.7: '#ff7722', 1.0: '#ff3b3b' },
      }).addTo(map)
      layersRef.current.heat = heat

    } else if (mode === 'cluster') {
      // ── Clustered markers ─────────────────────────────────────────────
      const clusterGroup = L.markerClusterGroup({
        maxClusterRadius: 50,
        iconCreateFunction: cluster => {
          const count = cluster.getChildCount()
          // Color cluster by worst severity inside
          const children = cluster.getAllChildMarkers()
          const hasCrit = children.some(m => m.options.severity === 'critical')
          const hasHigh = children.some(m => m.options.severity === 'high')
          const color   = hasCrit ? '#ff3b3b' : hasHigh ? '#ff7722' : '#ffcc00'
          return L.divIcon({
            html: `<div style="
              width:36px;height:36px;border-radius:50%;
              background:${color}22;border:1.5px solid ${color};
              display:flex;align-items:center;justify-content:center;
              color:${color};font-size:11px;font-family:'Share Tech Mono',monospace;
              box-shadow:0 0 12px ${color}44;
            ">${count}</div>`,
            className: '', iconSize: [36, 36], iconAnchor: [18, 18],
          })
        },
      })
      located.forEach(event => addMarker(L, clusterGroup, event, onSelectEvent))
      map.addLayer(clusterGroup)
      layersRef.current.cluster = clusterGroup

    } else {
      // ── Raw markers ───────────────────────────────────────────────────
      const group = L.layerGroup().addTo(map)
      located.forEach(event => addMarker(L, group, event, onSelectEvent))
      layersRef.current.markers = group
    }
  }, [events, mode, pluginsReady])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Mode toggle */}
      <div style={{
        position: 'absolute', top: '12px', left: '12px', zIndex: 900,
        display: 'flex', flexDirection: 'column', gap: '4px',
      }}>
        <div style={{ background: 'rgba(10,12,15,0.9)', border: '1px solid #2a3441', padding: '6px 10px', marginBottom: '4px' }}>
          <div style={{ fontSize: '9px', letterSpacing: '2px', color: '#556070' }}>THEATER MAP</div>
          <div style={{ fontSize: '9px', color: '#00ff88', marginTop: '2px' }}>
            {events.filter(e => e.coordinates?.lat).length} PLOTTED
          </div>
        </div>
        {[
          { id: 'cluster', label: '⬡ CLUSTER' },
          { id: 'heat',    label: '◉ HEATMAP' },
          { id: 'raw',     label: '● RAW'     },
        ].map(m => (
          <button key={m.id} onClick={() => setMode(m.id)} style={{
            padding: '5px 10px', fontSize: '9px', letterSpacing: '1px',
            cursor: 'pointer', border: '1px solid',
            borderColor: mode === m.id ? '#00ff88' : '#2a3441',
            background: mode === m.id ? 'rgba(0,255,136,0.1)' : 'rgba(10,12,15,0.9)',
            color: mode === m.id ? '#00ff88' : '#556070',
            fontFamily: "'Share Tech Mono', monospace",
            textAlign: 'left',
          }}>{m.label}</button>
        ))}
      </div>

      {/* Severity legend */}
      <div style={{
        position: 'absolute', bottom: '24px', right: '12px', zIndex: 900,
        background: 'rgba(10,12,15,0.9)', border: '1px solid #2a3441', padding: '10px 12px',
      }}>
        {Object.entries(SEV_COLOR).map(([sev, color]) => (
          <div key={sev} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, display: 'inline-block', boxShadow: `0 0 4px ${color}` }}/>
            <span style={{ fontSize: '9px', letterSpacing: '1px', color: '#556070', textTransform: 'uppercase' }}>{sev}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function addMarker(L, layer, event, onSelectEvent) {
  const color  = SEV_COLOR[event.severity] || '#00ff88'
  const radius = SEV_RADIUS[event.severity] || 8
  const icon = L.divIcon({
    className: '',
    html: `<div style="position:relative;width:${radius*2}px;height:${radius*2}px;">
      <div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:0.15;"></div>
      <div style="position:absolute;inset:4px;border-radius:50%;background:${color};opacity:0.85;box-shadow:0 0 8px ${color};"></div>
    </div>`,
    iconSize: [radius * 2, radius * 2],
    iconAnchor: [radius, radius],
  })
  const timeAgo = getTimeAgo(event.publishedAt)
  const marker = L.marker([event.coordinates.lat, event.coordinates.lng], { icon, severity: event.severity })
    .bindPopup(`
      <div style="font-family:'Share Tech Mono',monospace;min-width:220px;">
        <div style="font-size:9px;letter-spacing:2px;color:${color};margin-bottom:6px;">[${event.severity?.toUpperCase()}] ${event.region}</div>
        <div style="font-size:12px;color:#e8f0f8;line-height:1.4;margin-bottom:8px;">${event.title}</div>
        <div style="font-size:10px;color:#556070;border-top:1px solid #1e2530;padding-top:6px;display:flex;justify-content:space-between;">
          <span>${event.source}</span><span>${timeAgo}</span>
        </div>
        ${event.url && event.url !== '#' ? `<a href="${event.url}" target="_blank" style="display:block;margin-top:8px;font-size:9px;color:${color};text-decoration:none;">→ READ SOURCE</a>` : ''}
      </div>`)
    .on('click', () => onSelectEvent && onSelectEvent(event))
  layer.addLayer(marker)
}

function getTimeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 23) return `${Math.floor(h/24)}d ago`
  if (h > 0) return `${h}h ago`
  return `${m}m ago`
}
