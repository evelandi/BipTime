// Extract and save full localStorage data with correct encoding
const fs = require('fs');
const path = require('path');

const dir = '/Users/ericvelandia/Library/Application Support/Google/Chrome/Default/Local Storage/leveldb';

let data = Buffer.alloc(0);
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.ldb'))) {
  data = Buffer.concat([data, fs.readFileSync(path.join(dir, f))]);
}

function extractJsonArray(data, key) {
  const idx = data.indexOf(key);
  if (idx < 0) return null;
  // Chrome stores values as UTF-16LE with a \x01 prefix byte
  const rawChunk = data.slice(idx + key.length, idx + key.length + 600000);
  // Try UTF-16LE first (Chrome's format), fall back to UTF-8
  let chunk;
  // Skip any null/control bytes before the [
  const startByte = rawChunk.indexOf(0x5b); // '[' in UTF-8
  const startByte16 = rawChunk.indexOf(Buffer.from('[', 'utf16le')); // '[' in UTF-16LE
  if (startByte16 >= 0 && (startByte < 0 || startByte16 < startByte)) {
    // Value is UTF-16LE
    chunk = rawChunk.toString('utf16le');
  } else {
    chunk = rawChunk.toString('utf8');
  }
  const start = chunk.indexOf('[');
  if (start < 0) return null;
  let depth = 0, inStr = false, escaped = false;
  for (let i = start; i < chunk.length; i++) {
    const ch = chunk[i];
    if (escaped) { escaped = false; continue; }
    if (ch === '\\' && inStr) { escaped = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === '[' || ch === '{') depth++;
    else if (ch === ']' || ch === '}') {
      depth--;
      if (depth === 0) return chunk.slice(start, i + 1);
    }
  }
  return null;
}

for (const key of ['biptime.races', 'biptime.homeEvents']) {
  const result = extractJsonArray(data, key);
  if (result) {
    try {
      const parsed = JSON.parse(result);
      console.log(`${key}: ${parsed.length} entries`);
      if (key === 'biptime.races') {
        // show first result entry (without coverImage)
        const race = parsed[0];
        console.log(`  Race: ${race.name}, results: ${race.results ? race.results.length : 0}`);
        // strip coverImage from output (too large)
        const clean = parsed.map(r => ({ ...r, coverImage: r.coverImage ? '[base64 image]' : undefined }));
        fs.writeFileSync('/tmp/extracted_races_clean.json', JSON.stringify(clean, null, 2));
        fs.writeFileSync('/tmp/extracted_races_full.json', result);
        console.log(`  Saved to /tmp/extracted_races_full.json`);
      } else {
        const clean = parsed.map(e => ({ ...e, coverImage: e.coverImage ? '[base64 image]' : undefined }));
        fs.writeFileSync('/tmp/extracted_events_clean.json', JSON.stringify(clean, null, 2));
        fs.writeFileSync('/tmp/extracted_events_full.json', result);
        console.log(`  Saved to /tmp/extracted_events_full.json`);
      }
    } catch(e) {
      console.log(`${key}: JSON parse error - ${e.message}`);
      fs.writeFileSync(`/tmp/error_${key.replace('.','_')}.txt`, result.slice(0, 5000));
    }
  } else {
    console.log(`${key}: NOT FOUND`);
  }
}
