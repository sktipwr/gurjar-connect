const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const GROUP_ID = '2770108';
// Manage URL supports ?start=N pagination and shows ALL members for managers
const MANAGE_URL = `https://www.linkedin.com/groups/${GROUP_ID}/manage/members/`;
const PUBLIC_URL = `https://www.linkedin.com/groups/${GROUP_ID}/members/`;

const DATA_DIR = path.join(__dirname, '..', 'data');
const JSON_FILE = path.join(DATA_DIR, 'members.json');
const CSV_FILE = path.join(DATA_DIR, 'members.csv');

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
function jitter(min = 800, max = 2500) {
  return sleep(Math.floor(Math.random() * (max - min) + min));
}

function saveProgress(members) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(JSON_FILE, JSON.stringify(members, null, 2));
}

function saveCSV(members) {
  const header = 'name,headline,location,profileUrl,scrapedAt';
  const rows = members.map(m =>
    [m.name, m.headline, m.location, m.profileUrl, m.scrapedAt]
      .map(v => `"${(v || '').replace(/"/g, '""')}"`)
      .join(',')
  );
  fs.writeFileSync(CSV_FILE, [header, ...rows].join('\n'));
}

// Extract members from the MANAGE page (table layout)
async function extractManagePageMembers(page) {
  return page.evaluate(() => {
    const results = [];
    // Manage page rows — try multiple selectors
    const rows = [
      ...document.querySelectorAll('.artdeco-list__item'),
      ...document.querySelectorAll('[data-view-name="group-manage-member-list-item"]'),
      ...document.querySelectorAll('.member-list-item'),
      ...document.querySelectorAll('li.scaffold-finite-scroll__content > div'),
    ];

    const seen = new Set();
    for (const row of rows) {
      const anchor =
        row.querySelector('a[href*="/in/"]') ||
        row.querySelector('a.app-aware-link');
      if (!anchor) continue;

      const profileUrl = (anchor.href || '').split('?')[0];
      if (!profileUrl.includes('/in/') || seen.has(profileUrl)) continue;
      seen.add(profileUrl);

      // Get name — strip connection degree badge ("· 1st", "· 2nd", "· 3rd", "· 3rd+")
      const cleanName = (raw = '') =>
        raw.replace(/·\s*(1st|2nd|3rd\+?|Follow)/gi, '').replace(/\s+/g, ' ').trim();

      const nameSpans = [...row.querySelectorAll('span[aria-hidden="true"]')];
      // Pick the span that looks like a real name (not just a badge)
      const nameSpan = nameSpans.find(s => {
        const t = s.textContent?.trim() || '';
        return t.length > 2 && !/^[·•]/.test(t) && !/^\d/.test(t);
      });
      const name = cleanName(
        nameSpan?.textContent ||
        anchor.querySelector('span:not(.dist-value)')?.textContent ||
        anchor.textContent || ''
      );

      // Profile photo
      const img = row.querySelector('img.presence-entity__image, img.EntityPhoto-circle, img[class*="profile"], img[class*="ghost"]');
      const photo = img?.src && !img.src.includes('ghost') ? img.src : '';

      const subtitles = [...row.querySelectorAll(
        '.artdeco-entity-lockup__subtitle, .entity-result__primary-subtitle, [class*="subtitle"]'
      )];
      const captions = [...row.querySelectorAll(
        '.artdeco-entity-lockup__caption, .entity-result__secondary-subtitle, [class*="caption"]'
      )];

      const headline = subtitles[0]?.textContent?.trim() || '';
      const location = captions[0]?.textContent?.trim() || '';

      // Skip rows that yielded no real name
      if (!name || name.length < 2) continue;
      results.push({ name, headline, location, profileUrl, photo });
    }
    return results;
  });
}

async function login(page) {
  console.log('→ Opening LinkedIn...');
  await page.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded' });
  await jitter(1500, 2500);

  if (page.url().includes('/checkpoint') || page.url().includes('/challenge')) {
    console.log('\n⚠️  LinkedIn wants verification — complete it in the browser window.');
  }

  const usernameField = await page.$('#username');
  if (usernameField) {
    console.log('→ Filling credentials...');
    await page.fill('#username', process.env.LINKEDIN_EMAIL);
    await jitter(500, 1000);
    await page.fill('#password', process.env.LINKEDIN_PASSWORD);
    await jitter(500, 1000);
    await page.click('[type="submit"]');
    await jitter(2000, 3000);
  }

  if (!page.url().includes('/feed') && !page.url().includes('/home')) {
    console.log('\n' + '='.repeat(60));
    console.log('👉  BROWSER IS OPEN — PLEASE LOG IN TO LINKEDIN NOW');
    console.log('    Waiting up to 10 minutes...');
    console.log('='.repeat(60) + '\n');
    const deadline = Date.now() + 10 * 60 * 1000;
    while (Date.now() < deadline) {
      await sleep(4000);
      const url = page.url();
      if (url.includes('/feed') || url.includes('/home') || url.includes('/mynetwork')) break;
      process.stdout.write('.');
    }
    console.log('');
  }

  if (!page.url().includes('/feed') && !page.url().includes('/home') && !page.url().includes('/mynetwork')) {
    throw new Error('Login timed out — run again when ready to log in.');
  }
  console.log('✓ Logged in');
}

// ─── Strategy A: Manage page with URL pagination ────────────────────────────
async function scrapeViaManagePage(page, members, seen) {
  console.log('\n── Strategy: Manage page (URL pagination) ──');
  const PAGE_SIZE = 10; // LinkedIn manage page default
  let start = 0;
  let emptyPages = 0;

  while (emptyPages < 3) {
    const url = `${MANAGE_URL}?start=${start}`;
    console.log(`  → Fetching start=${start} ...`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await jitter(2500, 4000);

    // Also try scrolling to trigger lazy loads
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await jitter(1000, 2000);

    const batch = await extractManagePageMembers(page);
    let newCount = 0;

    for (const m of batch) {
      if (!seen.has(m.profileUrl)) {
        members.push({ ...m, scrapedAt: new Date().toISOString() });
        seen.add(m.profileUrl);
        newCount++;
      }
    }

    if (newCount > 0) {
      console.log(`  +${newCount} new  |  Total: ${members.length}`);
      saveProgress(members);
      emptyPages = 0;
    } else {
      emptyPages++;
      console.log(`  (empty page — ${emptyPages}/3)`);
    }

    start += PAGE_SIZE;
    await jitter(1500, 2500);
  }

  return members.length;
}

// ─── Strategy B: Public members page with infinite scroll ───────────────────
async function scrapeViaPublicPage(page, members, seen) {
  console.log('\n── Strategy: Public members page (infinite scroll) ──');
  await page.goto(PUBLIC_URL, { waitUntil: 'domcontentloaded' });
  await jitter(2000, 3000);

  let stallStreak = 0;
  let scrollAttempts = 0;

  while (stallStreak < 8) {
    if (!page.url().includes('/groups/')) {
      console.log('  ↩ Navigated away — returning...');
      await page.goto(PUBLIC_URL, { waitUntil: 'domcontentloaded' });
      await jitter(2000, 3000);
    }

    let newThisPass = 0;
    try {
      const batch = await extractManagePageMembers(page);
      for (const m of batch) {
        if (!seen.has(m.profileUrl)) {
          members.push({ ...m, scrapedAt: new Date().toISOString() });
          seen.add(m.profileUrl);
          newThisPass++;
        }
      }
    } catch {
      console.log('  ⚠ Context lost — retrying...');
      await jitter(2000, 3000);
      continue;
    }

    if (newThisPass > 0) {
      console.log(`  +${newThisPass} new  |  Total: ${members.length}`);
      saveProgress(members);
      stallStreak = 0;
    } else {
      stallStreak++;
    }

    try { await page.evaluate(() => window.scrollBy({ top: 1200, behavior: 'smooth' })); }
    catch { /* ignore */ }
    scrollAttempts++;
    await jitter(600, 1000);

    // Click "Show more" if present
    const showMoreSel = 'button.scaffold-finite-scroll__load-button, button[aria-label*="more results"]';
    try {
      const btn = await page.$(showMoreSel);
      if (btn) {
        console.log('  → Show more...');
        await page.click(showMoreSel, { timeout: 5000 });
        await jitter(1000, 1800);
        stallStreak = 0;
      }
    } catch { /* ignore */ }

    if (scrollAttempts > 500) break;
  }

  return members.length;
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function scrapeMembers() {
  if (!process.env.LINKEDIN_EMAIL || !process.env.LINKEDIN_PASSWORD) {
    console.error('Missing credentials. Fill in scraper/.env');
    process.exit(1);
  }

  let members = [];
  if (fs.existsSync(JSON_FILE)) {
    members = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
    console.log(`Resuming — ${members.length} members already saved.`);
  }
  const seen = new Set(members.map(m => m.profileUrl));

  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  try {
    await login(page);
    await jitter(2000, 3500);

    // Try manage page first (shows all members for managers)
    const beforeManage = members.length;
    await scrapeViaManagePage(page, members, seen);
    const manageYield = members.length - beforeManage;
    console.log(`\nManage page yielded: ${manageYield} members`);

    // If manage page got very few, also sweep the public page
    if (manageYield < 100) {
      console.log('Manage page yield low — also sweeping public members page...');
      await scrapeViaPublicPage(page, members, seen);
    }

    console.log(`\n✓ Done. Total members scraped: ${members.length}`);
    saveProgress(members);
    saveCSV(members);
    console.log(`  JSON → ${JSON_FILE}`);
    console.log(`  CSV  → ${CSV_FILE}`);

  } catch (err) {
    console.error('\nError:', err.message);
    saveProgress(members);
    console.log(`Progress saved — ${members.length} members.`);
  } finally {
    await browser.close();
  }
}

scrapeMembers();
