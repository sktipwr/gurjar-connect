#!/usr/bin/env node
/**
 * Imports web/public/members.json → Supabase public.members table
 * Run: node scripts/import-members.js
 */

const { createClient } = require('../web/node_modules/@supabase/supabase-js');
const path = require('path');

const SUPABASE_URL  = 'https://zkvdnsrtadmpxlcbltss.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprdmRuc3J0YWRtcHhsY2JsdHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMTk4MTYsImV4cCI6MjA5NTU5NTgxNn0.E3h9BqZSytau-mBKLhaWzpcgVNQMMBf-spjeOHMfzMY';

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
    verified:    false,
    claimed_by:  null,
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
