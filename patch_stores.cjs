// Patches the store TS files with real DEFAULT data
const fs = require('fs');

// ─── PATCH 1: eventsStore.ts ───────────────────────────────────────────────
const eventsStorePath = '/Users/ericvelandia/Documents/Development/BipTime/src/shared/utils/eventsStore.ts';
const eventsDefault = fs.readFileSync('/tmp/events_default_ts.txt', 'utf8');
let eventsStore = fs.readFileSync(eventsStorePath, 'utf8');

// Replace the whole DEFAULT_EVENTS const block
const eventsStart = eventsStore.indexOf('const DEFAULT_EVENTS: HomeEvent[] = [');
const eventsEnd = eventsStore.indexOf('];', eventsStart) + 2;
if (eventsStart < 0) { console.error('DEFAULT_EVENTS not found'); process.exit(1); }
eventsStore = eventsStore.slice(0, eventsStart) + eventsDefault + eventsStore.slice(eventsEnd);
fs.writeFileSync(eventsStorePath, eventsStore, 'utf8');
console.log('eventsStore.ts patched');

// ─── PATCH 2: raceResultsStore.ts ─────────────────────────────────────────
const racesStorePath = '/Users/ericvelandia/Documents/Development/BipTime/src/shared/utils/raceResultsStore.ts';
const racesDefault = fs.readFileSync('/tmp/races_default_ts.txt', 'utf8');
let racesStore = fs.readFileSync(racesStorePath, 'utf8');

// Find and replace from DEFAULT_RACE_RESULTS (or DEMO_RESULTS_MAIN) through DEFAULT_RACES ];
let racesStart = racesStore.indexOf('const DEMO_RESULTS_MAIN');
if (racesStart < 0) racesStart = racesStore.indexOf('const DEFAULT_RACE_RESULTS');
const marker = 'const DEFAULT_RACES: RaceEvent[] = [';
const racesDefaultStart = racesStore.indexOf(marker);
// Find the closing ]; for DEFAULT_RACES
let depth = 0, racesEnd = -1;
for (let i = racesDefaultStart; i < racesStore.length; i++) {
  if (racesStore[i] === '[' || racesStore[i] === '{') depth++;
  else if (racesStore[i] === ']' || racesStore[i] === '}') {
    depth--;
    if (depth === 0) { racesEnd = i + 1; break; }
  }
}
if (racesStart < 0 || racesEnd < 0) { console.error('DEFAULT_RACES block not found'); process.exit(1); }

racesStore = racesStore.slice(0, racesStart) + racesDefault + '\n' + racesStore.slice(racesEnd);
fs.writeFileSync(racesStorePath, racesStore, 'utf8');
console.log('raceResultsStore.ts patched');
console.log('Done!');
