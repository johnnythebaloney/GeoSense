// src/data/arsenalData.js
// Known military arsenal data — sourced from SIPRI, FAS, IISS Military Balance
// Nuclear warhead counts from Federation of American Scientists (FAS) 2025 estimates

export const NUCLEAR_STOCKPILES = [
  { country: 'Russia',        total: 5580, deployed: 1710, color: '#ff3b3b', flag: '🇷🇺' },
  { country: 'United States', total: 5044, deployed: 1670, color: '#4488ff', flag: '🇺🇸' },
  { country: 'China',         total: 500,  deployed: 24,   color: '#ffcc00', flag: '🇨🇳' },
  { country: 'France',        total: 290,  deployed: 280,  color: '#88aaff', flag: '🇫🇷' },
  { country: 'UK',            total: 225,  deployed: 120,  color: '#aabbcc', flag: '🇬🇧' },
  { country: 'Pakistan',      total: 170,  deployed: 0,    color: '#00cc88', flag: '🇵🇰' },
  { country: 'India',         total: 164,  deployed: 0,    color: '#ff8844', flag: '🇮🇳' },
  { country: 'Israel',        total: 90,   deployed: 0,    color: '#ffdd44', flag: '🇮🇱' },
  { country: 'North Korea',   total: 50,   deployed: 0,    color: '#ff4488', flag: '🇰🇵' },
]

export const MILITARY_AIRCRAFT = [
  {
    category: 'Stealth Fighters',
    items: [
      { name: 'F-22 Raptor',         country: 'USA',        role: 'Air superiority',     speed: 'Mach 2.25', range: '2,960 km',  status: 'ACTIVE',   threat: 'critical' },
      { name: 'F-35 Lightning II',   country: 'USA/NATO',   role: 'Multi-role stealth',  speed: 'Mach 1.6',  range: '2,220 km',  status: 'ACTIVE',   threat: 'critical' },
      { name: 'Su-57 Felon',         country: 'Russia',     role: 'Air superiority',     speed: 'Mach 2.0',  range: '3,500 km',  status: 'ACTIVE',   threat: 'critical' },
      { name: 'J-20 Mighty Dragon',  country: 'China',      role: 'Stealth interceptor', speed: 'Mach 2.0',  range: '2,000 km',  status: 'ACTIVE',   threat: 'critical' },
      { name: 'J-35',                country: 'China',      role: 'Carrier stealth',     speed: 'Mach 1.8',  range: '1,250 km',  status: 'ACTIVE',   threat: 'high' },
    ]
  },
  {
    category: 'Strategic Bombers',
    items: [
      { name: 'B-21 Raider',         country: 'USA',        role: 'Nuclear stealth',     speed: 'Subsonic',  range: '9,000+ km', status: 'ACTIVE',   threat: 'critical' },
      { name: 'B-2 Spirit',          country: 'USA',        role: 'Nuclear stealth',     speed: 'Mach 0.95', range: '11,100 km', status: 'ACTIVE',   threat: 'critical' },
      { name: 'Tu-160 Blackjack',    country: 'Russia',     role: 'Nuclear bomber',      speed: 'Mach 2.05', range: '12,300 km', status: 'ACTIVE',   threat: 'critical' },
      { name: 'H-6K',                country: 'China',      role: 'Nuclear bomber',      speed: 'Mach 0.8',  range: '3,500 km',  status: 'ACTIVE',   threat: 'high' },
    ]
  },
  {
    category: 'Combat Drones',
    items: [
      { name: 'MQ-9 Reaper',         country: 'USA',        role: 'Strike/ISR',          speed: '482 km/h',  range: '1,852 km',  status: 'ACTIVE',   threat: 'high' },
      { name: 'RQ-4 Global Hawk',    country: 'USA',        role: 'Strategic ISR',       speed: '629 km/h',  range: '22,780 km', status: 'ACTIVE',   threat: 'medium' },
      { name: 'Shahed-136',          country: 'Iran',       role: 'Kamikaze drone',      speed: '185 km/h',  range: '2,500 km',  status: 'ACTIVE',   threat: 'high' },
      { name: 'Bayraktar TB2',       country: 'Turkey',     role: 'Strike drone',        speed: '220 km/h',  range: '150 km',    status: 'ACTIVE',   threat: 'high' },
      { name: 'WZ-7 Soaring Dragon', country: 'China',      role: 'Strategic ISR',       speed: '750 km/h',  range: '7,000 km',  status: 'ACTIVE',   threat: 'medium' },
    ]
  },
]

export const MISSILES = [
  {
    category: 'ICBMs (Intercontinental)',
    items: [
      { name: 'RS-28 Sarmat',        country: 'Russia',     type: 'ICBM',         range: '18,000 km', payload: 'Nuclear (MIRV)', status: 'ACTIVE',   threat: 'critical', note: 'Can carry up to 15 warheads' },
      { name: 'LGM-35 Sentinel',     country: 'USA',        type: 'ICBM',         range: '13,000 km', payload: 'Nuclear',        status: 'ACTIVE',   threat: 'critical', note: 'Replacing Minuteman III' },
      { name: 'DF-41',               country: 'China',      type: 'ICBM',         range: '15,000 km', payload: 'Nuclear (MIRV)', status: 'ACTIVE',   threat: 'critical', note: 'Road-mobile, hard to track' },
      { name: 'Agni-V',              country: 'India',      type: 'ICBM',         range: '8,000 km',  payload: 'Nuclear',        status: 'ACTIVE',   threat: 'high',     note: 'MIRV capable' },
      { name: 'Hwasong-18',          country: 'N. Korea',   type: 'ICBM',         range: '15,000 km', payload: 'Nuclear',        status: 'ACTIVE',   threat: 'critical', note: 'Solid-fuel, rapid launch' },
    ]
  },
  {
    category: 'Hypersonic Weapons',
    items: [
      { name: 'Avangard',            country: 'Russia',     type: 'HGV',          range: 'Global',    payload: 'Nuclear',        status: 'ACTIVE',   threat: 'critical', note: 'Mach 27 — no current defense' },
      { name: 'Kinzhal',             country: 'Russia',     type: 'Aeroballistic', range: '2,000 km', payload: 'Conv/Nuclear',   status: 'ACTIVE',   threat: 'critical', note: 'Used in Ukraine' },
      { name: 'DF-17',               country: 'China',      type: 'HGV',          range: '1,800 km',  payload: 'Conv/Nuclear',   status: 'ACTIVE',   threat: 'critical', note: 'First operational HGV' },
      { name: 'AGM-183 ARRW',        country: 'USA',        type: 'HCM',          range: '1,600 km',  payload: 'Conventional',   status: 'ACTIVE',   threat: 'high',     note: 'Air-launched' },
      { name: 'BrahMos-II',          country: 'India/Russia',type: 'HCM',         range: '600 km',    payload: 'Conventional',   status: 'TESTING',  threat: 'high',     note: 'Mach 8 cruise missile' },
    ]
  },
  {
    category: 'Cruise Missiles',
    items: [
      { name: 'Tomahawk',            country: 'USA/UK',     type: 'Cruise',       range: '2,500 km',  payload: 'Conventional',   status: 'ACTIVE',   threat: 'high',     note: 'GPS precision strike' },
      { name: 'Kalibr',             country: 'Russia',     type: 'Cruise',       range: '2,500 km',  payload: 'Conv/Nuclear',   status: 'ACTIVE',   threat: 'high',     note: 'Heavily used in Ukraine' },
      { name: 'Storm Shadow/SCALP', country: 'UK/France',  type: 'Cruise',       range: '560 km',    payload: 'Conventional',   status: 'ACTIVE',   threat: 'high',     note: 'Used in Ukraine' },
      { name: 'Taurus KEPD 350',    country: 'Germany',    type: 'Cruise',       range: '500 km',    payload: 'Conventional',   status: 'ACTIVE',   threat: 'high',     note: 'Contested Ukraine delivery' },
    ]
  },
  {
    category: 'Air Defense Systems',
    items: [
      { name: 'S-500 Prometheus',    country: 'Russia',     type: 'SAM',          range: '600 km',    payload: 'Interceptor',    status: 'ACTIVE',   threat: 'critical', note: 'Can hit satellites' },
      { name: 'S-400 Triumf',        country: 'Russia',     type: 'SAM',          range: '400 km',    payload: 'Interceptor',    status: 'ACTIVE',   threat: 'critical', note: 'NATO allies banned from buying' },
      { name: 'Patriot PAC-3',       country: 'USA/NATO',   type: 'SAM',          range: '160 km',    payload: 'Interceptor',    status: 'ACTIVE',   threat: 'high',     note: 'Deployed to Ukraine' },
      { name: 'Iron Dome',           country: 'Israel',     type: 'SHORAD',       range: '70 km',     payload: 'Interceptor',    status: 'ACTIVE',   threat: 'medium',   note: 'Rocket/drone defense' },
      { name: 'HQ-9',                country: 'China',      type: 'SAM',          range: '200 km',    payload: 'Interceptor',    status: 'ACTIVE',   threat: 'high',     note: 'S-300 equivalent' },
    ]
  },
]

export const NAVAL_ASSETS = [
  { name: 'USS Gerald R. Ford',    country: 'USA',     type: 'Supercarrier',      displacement: '100,000t', aircraft: 75,  status: 'ACTIVE',  threat: 'critical' },
  { name: 'Admiral Kuznetsov',     country: 'Russia',  type: 'Aircraft carrier',  displacement: '55,000t',  aircraft: 40,  status: 'REFIT',   threat: 'high' },
  { name: 'Liaoning (CV-16)',      country: 'China',   type: 'Aircraft carrier',  displacement: '60,900t',  aircraft: 36,  status: 'ACTIVE',  threat: 'high' },
  { name: 'INS Vikrant',           country: 'India',   type: 'Aircraft carrier',  displacement: '45,000t',  aircraft: 30,  status: 'ACTIVE',  threat: 'high' },
  { name: 'Ohio-class SSBN',       country: 'USA',     type: 'Nuclear submarine', displacement: '18,750t',  aircraft: 0,   status: 'ACTIVE',  threat: 'critical', note: '14 boats, each carries 20 Trident II missiles' },
  { name: 'Borei-class SSBN',      country: 'Russia',  type: 'Nuclear submarine', displacement: '24,000t',  aircraft: 0,   status: 'ACTIVE',  threat: 'critical', note: 'Carries 16 Bulava ICBMs' },
  { name: 'Type 094 Jin-class',    country: 'China',   type: 'Nuclear submarine', displacement: '11,000t',  aircraft: 0,   status: 'ACTIVE',  threat: 'critical', note: 'JL-2 SLBM capable' },
]
