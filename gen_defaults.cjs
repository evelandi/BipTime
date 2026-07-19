// Generates TypeScript DEFAULT data for store files from extracted localStorage JSON
const fs = require('fs');

const racesData = JSON.parse(fs.readFileSync('/tmp/extracted_races_full.json', 'utf8'));
const eventsData = JSON.parse(fs.readFileSync('/tmp/extracted_events_full.json', 'utf8'));

// Pick the race with the most results (deduplication)
const race = racesData.reduce((best, r) => (r.results || []).length > (best.results || []).length ? r : best, racesData[0]);

// Serialize results without coverImage
const resultsLines = race.results.map(r => {
  const fields = [];
  fields.push(`    id: ${JSON.stringify(r.id)}`);
  fields.push(`    nombreCompleto: ${JSON.stringify(r.nombreCompleto)}`);
  fields.push(`    dorsal: ${r.dorsal}`);
  fields.push(`    distancia: ${JSON.stringify(r.distancia)}`);
  fields.push(`    genero: ${JSON.stringify(r.genero)}`);
  if (r.pais) fields.push(`    pais: ${JSON.stringify(r.pais)}`);
  fields.push(`    categoria: ${JSON.stringify(r.categoria)}`);
  fields.push(`    status: ${JSON.stringify(r.status)}`);
  if (r.gunTime) fields.push(`    gunTime: ${JSON.stringify(r.gunTime)}`);
  else fields.push(`    gunTime: ""`);
  if (r.netTime) fields.push(`    netTime: ${JSON.stringify(r.netTime)}`);
  else fields.push(`    netTime: ""`);
  if (r.posicionCategoria != null) fields.push(`    posicionCategoria: ${r.posicionCategoria}`);
  if (r.posicionGenero != null) fields.push(`    posicionGenero: ${r.posicionGenero}`);
  if (r.posicionGeneral != null) fields.push(`    posicionGeneral: ${r.posicionGeneral}`);
  return `  {\n${fields.join(',\n')},\n  }`;
}).join(',\n');

const racesTs = `const DEFAULT_RACE_RESULTS: RaceResult[] = [\n${resultsLines},\n];\n\nconst DEFAULT_RACES: RaceEvent[] = [\n  {\n    id: ${JSON.stringify(race.id)},\n    name: ${JSON.stringify(race.name)},\n    date: ${JSON.stringify(race.date)},\n    location: ${JSON.stringify(race.location)},\n    coverImage: '/images/results-running.jpg',\n    results: DEFAULT_RACE_RESULTS,\n  },\n];`;

fs.writeFileSync('/tmp/races_default_ts.txt', racesTs);
console.log('Generated DEFAULT_RACES TS (' + resultsLines.length + ' chars, ' + race.results.length + ' results)');

// Events
const event = eventsData[0];
const scheduleLines = (event.schedule || []).map(s => {
  return `    { time: ${JSON.stringify(s.time)}, title: ${JSON.stringify(s.title)}, desc: ${JSON.stringify(s.desc || '')} }`;
}).join(',\n');

const eventsTs = `const DEFAULT_EVENTS: HomeEvent[] = [\n  {\n    id: ${JSON.stringify(event.id)},\n    name: ${JSON.stringify(event.name)},\n    date: ${JSON.stringify(event.date)},\n    location: ${JSON.stringify(event.location)},\n    hours: ${JSON.stringify(event.hours || '')},\n    modalities: ${JSON.stringify(event.modalities || '')},\n    coverImage: '/images/results-running.jpg',\n    schedule: [\n${scheduleLines},\n    ],\n  },\n];`;

fs.writeFileSync('/tmp/events_default_ts.txt', eventsTs);
console.log('Generated DEFAULT_EVENTS TS (' + (event.schedule||[]).length + ' schedule items)');
console.log('\nEvent:', event.name, event.date);
