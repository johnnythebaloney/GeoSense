import { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export function useEvents(filters = {}) {
  const [events, setEvents] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  // Memoize filter object to prevent unnecessary refetches
  const memoizedFilters = useMemo(() => ({
    region: filters.region || 'all',
    severity: filters.severity || 'all',
    source: filters.source,
    country: filters.country,
  }), [filters.region, filters.severity, filters.source, filters.country]);

  // Memoized filter string for stable dependency tracking
  const filterKey = useMemo(
    () => JSON.stringify(memoizedFilters),
    [memoizedFilters]
  );

  useEffect(() => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const fetchEvents = async () => {
      setLoading(true);
      try {
        const axiosParams = {};
        
        if (memoizedFilters.region !== 'all') axiosParams.region = memoizedFilters.region;
        if (memoizedFilters.severity !== 'all') axiosParams.severity = memoizedFilters.severity;
        if (memoizedFilters.source) axiosParams.source = memoizedFilters.source;
        if (memoizedFilters.country) axiosParams.country = memoizedFilters.country;

        const response = await axios.get(`${API_BASE_URL}/events`, { 
          params: axiosParams,
          timeout: 10000,
          signal,
        });
        
        setEvents(response.data.events || []);
        setMeta(response.data.meta || null);
        setError(null);
      } catch (err) {
        if (err.name !== 'CanceledError') {
          console.error('Failed to fetch events:', err.message);
          setEvents(getMockEvents());
          setMeta(null);
          setError('Backend unavailable — showing mock data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [filterKey]);

  return { events, meta, loading, error };
}

/**
 * getFallbackEvents()
 * Returned when the backend is offline or unreachable.
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
      title: 'Airstrike targets rebel-held positions',
      description: 'Government forces conducted airstrikes overnight, displacing civilians.',
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
  ];
}
