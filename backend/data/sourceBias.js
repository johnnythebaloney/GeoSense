// src/data/sourceBias.js
// Media bias ratings based on AllSides, Ad Fontes Media, and Media Bias Fact Check.
// Scale: -2 (far left) to +2 (far right), 0 = center
// Reliability: 0-100

module.exports = {
  'reuters.com':         { bias: 0,    label: 'Center',       reliability: 92, factual: 'HIGH',   owner: 'Thomson Reuters', funding: 'commercial' },
  'apnews.com':          { bias: 0,    label: 'Center',       reliability: 94, factual: 'HIGH',   owner: 'AP (nonprofit)',  funding: 'nonprofit' },
  'bbc.com':             { bias: -0.5, label: 'Center-Left',  reliability: 88, factual: 'HIGH',   owner: 'BBC (UK govt)',   funding: 'public' },
  'bbc.co.uk':           { bias: -0.5, label: 'Center-Left',  reliability: 88, factual: 'HIGH',   owner: 'BBC (UK govt)',   funding: 'public' },
  'aljazeera.com':       { bias: -0.5, label: 'Center-Left',  reliability: 76, factual: 'MIXED',  owner: 'Qatar govt',      funding: 'state' },
  'dw.com':              { bias: -0.5, label: 'Center-Left',  reliability: 85, factual: 'HIGH',   owner: 'German govt',     funding: 'public' },
  'france24.com':        { bias: -0.5, label: 'Center-Left',  reliability: 82, factual: 'HIGH',   owner: 'French govt',     funding: 'public' },
  'rfi.fr':              { bias: -0.5, label: 'Center-Left',  reliability: 80, factual: 'HIGH',   owner: 'French govt',     funding: 'public' },
  'news.sky.com':        { bias: 0.5,  label: 'Center-Right', reliability: 78, factual: 'MIXED',  owner: 'News Corp',       funding: 'commercial' },
  'theguardian.com':     { bias: -1,   label: 'Left',         reliability: 82, factual: 'HIGH',   owner: 'Scott Trust',     funding: 'nonprofit' },
  'nytimes.com':         { bias: -1,   label: 'Left',         reliability: 84, factual: 'HIGH',   owner: 'NYT Co.',         funding: 'commercial' },
  'washingtonpost.com':  { bias: -1,   label: 'Left',         reliability: 82, factual: 'HIGH',   owner: 'Jeff Bezos',      funding: 'commercial' },
  'foxnews.com':         { bias: 1.5,  label: 'Right',        reliability: 58, factual: 'MIXED',  owner: 'News Corp',       funding: 'commercial' },
  'wsj.com':             { bias: 0.5,  label: 'Center-Right', reliability: 85, factual: 'HIGH',   owner: 'News Corp',       funding: 'commercial' },
  'economist.com':       { bias: 0,    label: 'Center',       reliability: 90, factual: 'HIGH',   owner: 'Economist Group', funding: 'commercial' },
  'ft.com':              { bias: 0,    label: 'Center',       reliability: 88, factual: 'HIGH',   owner: 'Nikkei',          funding: 'commercial' },
  'independent.co.uk':   { bias: -0.5, label: 'Center-Left',  reliability: 76, factual: 'MIXED',  owner: 'Evgeny Lebedev',  funding: 'commercial' },
  'reliefweb.int':       { bias: 0,    label: 'Center',       reliability: 88, factual: 'HIGH',   owner: 'OCHA/UN',         funding: 'intergovernmental' },
  'news.un.org':         { bias: -0.5, label: 'Center-Left',  reliability: 80, factual: 'HIGH',   owner: 'United Nations',  funding: 'intergovernmental' },
  'crisisgroup.org':     { bias: -0.5, label: 'Center-Left',  reliability: 88, factual: 'HIGH',   owner: 'ICG (nonprofit)', funding: 'nonprofit' },
  'foreignpolicy.com':   { bias: -0.5, label: 'Center-Left',  reliability: 84, factual: 'HIGH',   owner: 'Graham Holdings', funding: 'commercial' },
  'middleeasteye.net':   { bias: -1,   label: 'Left',         reliability: 68, factual: 'MIXED',  owner: 'Private (Qatar links)', funding: 'commercial' },
  'theconversation.com': { bias: -0.5, label: 'Center-Left',  reliability: 82, factual: 'HIGH',   owner: 'Academic network','funding': 'nonprofit' },
  'gdeltproject.org':    { bias: 0,    label: 'Aggregator',   reliability: 75, factual: 'MIXED',  owner: 'Kalev Leetaru',   funding: 'academic' },
  'acleddata.com':       { bias: 0,    label: 'Center',       reliability: 90, factual: 'HIGH',   owner: 'ACLED (nonprofit)', funding: 'nonprofit' },
}
