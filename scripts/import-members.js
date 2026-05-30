#!/usr/bin/env node
/**
 * Imports web/public/members.json → Supabase public.members table
 * Run: node scripts/import-members.js
 */

const { createClient } = require('../web/node_modules/@supabase/supabase-js');
const path = require('path');

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL      || process.env.SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.error('✗ Missing Supabase env vars.');
  console.error('  Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, e.g.:');
  console.error('  export $(grep -v "^#" web/.env.local | xargs) && node scripts/import-members.js');
  process.exit(1);
}

// Use service role if available (bypasses RLS), otherwise anon
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const KEY = SERVICE_KEY || SUPABASE_ANON;

if (!SERVICE_KEY) {
  console.log('ℹ  No SUPABASE_SERVICE_ROLE_KEY found — using anon key (insert policy allows this)');
}

const supabase = createClient(SUPABASE_URL, KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const MEMBERS_FILE = path.join(__dirname, '..', 'web', 'public', 'members.json');
const raw = require(MEMBERS_FILE);

// Derive a stable short ID from the LinkedIn URL slug
function idFromUrl(url) {
  return (url || '')
    .replace('https://www.linkedin.com/in/', '')
    .replace(/\/$/, '')
    .slice(0, 80);  // max 80 chars
}

// Map JSON fields → DB column names
function mapMember(m) {
  const profileUrl = (m.profileUrl || '').split('?')[0].replace(/\/$/, '');
  return {
    id:          m.id || idFromUrl(profileUrl),
    name:        (m.name || '').trim(),
    headline:    (m.headline && m.headline !== '--') ? m.headline.trim() : '',
    location:    (m.location || '').trim(),
    profile_url: profileUrl,
    photo:       m.photo || '',
    scraped_at:  m.scrapedAt || new Date().toISOString(),
    // verified / claimed_by are intentionally OMITTED. Including them would
    // overwrite (reset) members who have already claimed and verified their
    // profile on every re-import. New rows fall back to the column defaults
    // (verified=false, claimed_by=null).
  };
}

async function importMembers() {
  const members = raw
    .map(mapMember)
    .filter(m => m.profile_url.includes('linkedin.com/in/'));

  console.log(`Importing ${members.length} members in batches of 100…`);

  const BATCH = 100;
  let inserted = 0;
  let failed   = 0;

  for (let i = 0; i < members.length; i += BATCH) {
    const batch = members.slice(i, i + BATCH);
    const { error } = await supabase
      .from('members')
      .upsert(batch, { onConflict: 'profile_url', ignoreDuplicates: false });

    if (error) {
      console.error(`  ✗ Batch ${i}–${i + BATCH - 1}: ${error.message}`);
      failed += batch.length;
    } else {
      inserted += batch.length;
      process.stdout.write(`  ✓ ${inserted}/${members.length}\r`);
    }
  }

  console.log(`\nDone. Inserted/updated: ${inserted}  Failed: ${failed}`);
}

importMembers().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
