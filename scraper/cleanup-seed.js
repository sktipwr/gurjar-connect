// Removes generated seed members, keeps only real scraped LinkedIn data
const fs = require('fs');
const path = require('path');

const JSON_FILE = path.join(__dirname, '..', 'data', 'members.json');
const CSV_FILE  = path.join(__dirname, '..', 'data', 'members.csv');

const all = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));

const real   = all.filter(m => !m.id?.startsWith('seed-'));
const seed   = all.filter(m =>  m.id?.startsWith('seed-'));
const photos = real.filter(m => m.photo).length;

console.log(`Total before cleanup : ${all.length}`);
console.log(`Seed members removed : ${seed.length}`);
console.log(`Real members kept    : ${real.length}`);
console.log(`With profile photo   : ${photos}`);

// Assign stable IDs to real members
const final = real.map((m, i) => ({ id: `m${i + 1}`, ...m }));

fs.writeFileSync(JSON_FILE, JSON.stringify(final, null, 2));

// Rebuild CSV
const header = 'id,name,headline,location,profileUrl,photo,scrapedAt';
const rows = final.map(m =>
  [m.id, m.name, m.headline, m.location, m.profileUrl, m.photo || '', m.scrapedAt]
    .map(v => `"${(v || '').replace(/"/g, '""')}"`)
    .join(',')
);
fs.writeFileSync(CSV_FILE, [header, ...rows].join('\n'));

console.log(`\n✓ Saved ${final.length} real members → members.json + members.csv`);
