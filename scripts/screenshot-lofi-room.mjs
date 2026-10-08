// E2E visual verification for the lofi room rewards hero (/achievements).
// Usage:
//   ADAPTER=node npm run build   (then serve)  ->  PORT=4199 node build
//   BASE_URL=http://localhost:4199 node scripts/screenshot-lofi-room.mjs
//
// Seeds a clean IndexedDB with a profile at four XP stage levels and
// screenshots the hero per stage into test-results/. Night vs day moods are
// driven deterministically with Playwright's clock.setFixedTime; sleepy mood
// is exercised by seeding completions 5 days in the past.

import { chromium } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:4199';
const OUT_DIR = process.env.OUT_DIR ?? 'test-results';

const STAGES = [
	// [screenshot name, XP, fixed local hour, idleDaysSinceCompletion]
	{ name: 'stage1', xp: 0, hour: 21, idleDays: 0 },
	{ name: 'stage2', xp: 200, hour: 21, idleDays: 0 },
	{ name: 'stage4', xp: 900, hour: 21, idleDays: 0 },
	{ name: 'stage6', xp: 2400, hour: 21, idleDays: 0 },
	{ name: 'stage6-day', xp: 2400, hour: 12, idleDays: 0 },
	{ name: 'stage6-sleepy', xp: 2400, hour: 12, idleDays: 5 }
];

/** Count of room placements expected per stage (matches src/lib/room/layout.ts):
 *  s1: window+window-left+floorbed+crate+lamp; s2: +desk+chair; s3: +sprout+poster;
 *  s4: floor bed retires (-1), +bed+nightstand+composed rug = 11;
 *  s6: +composed bookshelf+pet+media shelf+speaker = 15. */
const EXPECTED_ITEMS = { 1: 5, 2: 7, 4: 11, 6: 15 };

const browser = await chromium.launch();

/** Fresh-context screenshot run for one spec; returns error message on failure. */
async function runSpec(spec) {
	const context = await browser.newContext({
		viewport: { width: 390, height: 844 },
		deviceScaleFactor: 2
	});
	try {
		const page = await context.newPage();

	// First load boots the app: creates the local user id + DB stores
	await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
	await page.waitForFunction(
		() => localStorage.getItem('stackr_local_user_id') !== null,
		null,
		{ timeout: 15000 }
	);

	await page.evaluate(async (xp) => {
		const uid = localStorage.getItem('stackr_local_user_id');
		if (!uid) throw new Error('local user id missing');

		const db = await new Promise((resolve, reject) => {
			const req = indexedDB.open('stackr');
			req.onsuccess = () => resolve(req.result);
			req.onerror = () => reject(req.error);
		});

		// local YYYY-MM-DD helper
		const daysAgoStr = (n) => {
			const d = new Date();
			d.setDate(d.getDate() - n);
			return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
		};

		const iso = '2026-01-01T00:00:00.000Z';
		const stacks = [
			{ id: 'st_morning', user_id: uid, name: 'Morning Routine', trigger: 'After coffee', color: 'amber', icon: '☕', sort_order: 0, created_at: iso, updated_at: iso },
			{ id: 'st_reading', user_id: uid, name: 'Reading', trigger: 'After dinner', color: 'violet', icon: '📚', sort_order: 1, created_at: iso, updated_at: iso }
		];
		const habits = [
			{ id: 'h_m1', stack_id: 'st_morning', user_id: uid, name: 'Stretch', sort_order: 0, created_at: iso, updated_at: iso },
			{ id: 'h_m2', stack_id: 'st_morning', user_id: uid, name: 'Journal', sort_order: 1, created_at: iso, updated_at: iso },
			{ id: 'h_r1', stack_id: 'st_reading', user_id: uid, name: 'Read 20 pages', sort_order: 0, created_at: iso, updated_at: iso }
		];
		const completions = [1, 2, 3, 4, 5].flatMap((n) =>
			habits.map((h, i) => ({
				id: `c_${h.id}_${n}`,
				habit_id: h.id,
				user_id: uid,
				// sleepy spec: shift the whole history 5 days back (unique
				// habit_id+date pairs preserved); awake spec: keep it recent
				completed_at: daysAgoStr(xp.sleepyIdleDays > 0 ? xp.sleepyIdleDays + n : n),
				created_at: iso
			}))
		);
		const profile = {
			id: uid,
			xp: xp.amount,
			level: Math.floor(xp.amount / 50),
			streak_days: xp.sleepyIdleDays > 0 ? 0 : 3,
			longest_streak: 5,
			total_completions: completions.length,
			theme: 'default',
			created_at: iso,
			updated_at: iso
		};

		await new Promise((resolve, reject) => {
			const tx = db.transaction(['profile', 'stacks', 'habits', 'completions'], 'readwrite');
			tx.objectStore('profile').put(profile);
			for (const s of stacks) tx.objectStore('stacks').put(s);
			for (const h of habits) tx.objectStore('habits').put(h);
			for (const c of completions) tx.objectStore('completions').put(c);
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
		db.close();
	}, { amount: spec.xp, sleepyIdleDays: spec.idleDays });

	// Fix Date() (and only Date — timers keep running) so the mood is deterministic
	const clockDate = new Date(2026, 9, 8, spec.hour, 30, 0); // local 2026-10-08 HH:30
	await page.clock.setFixedTime(clockDate);

	await page.goto(`${BASE}/achievements`, { waitUntil: 'networkidle' });
	await page.waitForSelector('[data-test="lofi-room-hero"]', { timeout: 15000 });

	const stage = Number(spec.name.replace('stage', '').replace(/-.*/, ''));
	const label = await page.locator('[data-test="stage-label"]').textContent();
	const itemCount = await page.locator('[data-test^="lofi-item-"]').count();
	const heroBox = await page.locator('[data-test="lofi-room-hero"]').boundingBox();

	if (!label || !label.includes(`Stage ${stage}`)) {
		throw new Error(`${spec.name}: unexpected stage label "${label}"`);
	}
	if (itemCount !== EXPECTED_ITEMS[stage]) {
		throw new Error(`${spec.name}: expected ${EXPECTED_ITEMS[stage]} items, saw ${itemCount}`);
	}

	const shot = `${OUT_DIR}/lofi-room-${spec.name}.png`;
	await page.screenshot({ path: shot, fullPage: true });

	// objective sanity: hero present and large; screenshot non-empty
	if (!heroBox || heroBox.width < 300 || heroBox.height < 200) {
		throw new Error(`${spec.name}: hero too small or missing (${JSON.stringify(heroBox)})`);
	}
	const fs = await import('node:fs');
	const bytes = fs.statSync(shot).size;
	if (bytes < 20_000) throw new Error(`${spec.name}: screenshot suspiciously small (${bytes}B)`);

	const hourSeen = await page.evaluate(() => new Date().getHours());
	if (hourSeen !== spec.hour) throw new Error(`${spec.name}: clock pin failed (${hourSeen})`);

	console.log(`${spec.name}: ok — ${itemCount} items, label "${label.trim()}", ${bytes}B -> ${shot}`);
		return null;
	} finally {
		await context.close();
	}
}

let failures = 0;
for (const spec of STAGES) {
	let lastError = null;
	for (let attempt = 1; attempt <= 3; attempt++) {
		if (attempt > 1) await new Promise((r) => setTimeout(r, 2000));
		try {
			lastError = await runSpec(spec);
			if (lastError === null) break; // success
		} catch (e) {
			lastError = e;
			console.log(`${spec.name}: attempt ${attempt} failed: ${String(e)}`);
		}
	}
	if (lastError) {
		failures++;
		console.log(`${spec.name}: FAILED after retries`);
	}
}

await browser.close();
if (failures > 0) throw new Error(`${failures} stage spec(s) failed`);
console.log('LOFI ROOM E2E VISUAL OK');