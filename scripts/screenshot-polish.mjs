// E2E visual verification for the app-feel polish pass (/, /stacks, /stats).
// Usage:
//   ADAPTER=node npm run build && PORT=4199 node build &
//   node scripts/screenshot-polish.mjs
// Seeds a clean IndexedDB (same data as screenshot-rewards.mjs), screenshots
// the three polished pages, verifies the {#key} page transition wrapper is
// applied by catching a mid-flight frame when navigating via the bottom nav.

import { chromium } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:4199';

const browser = await chromium.launch();
const context = await browser.newContext({
	viewport: { width: 390, height: 844 },
	deviceScaleFactor: 2
});
const page = await context.newPage();

// 1. First load boots the app: creates the local user id + DB (v4) stores
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.waitForFunction(() => localStorage.getItem('stackr_local_user_id') !== null, null, { timeout: 15000 });

// 2. Seed data (same dataset as scripts/screenshot-rewards.mjs)
const seedResult = await page.evaluate(async () => {
	const uid = localStorage.getItem('stackr_local_user_id');
	if (!uid) throw new Error('local user id missing');
	const now = new Date();
	const T = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
	const daysAgoStr = n => {
		const d = new Date();
		d.setDate(d.getDate() - n);
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	};

	const db = await new Promise((resolve, reject) => {
		const req = indexedDB.open('stackr');
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});

	const stacks = [
		{ id: 'st_morning', name: 'Morning Routine', trigger: 'After coffee', color: 'amber', icon: '☕' },
		{ id: 'st_winddown', name: 'Wind Down', trigger: 'After dinner', color: 'violet', icon: '🌙' },
		{ id: 'st_reading', name: 'Reading', trigger: 'After lunch', color: 'sky', icon: '📚' },
		{ id: 'st_fitness', name: 'Fitness', trigger: 'After work', color: 'green', icon: '💪' },
		{ id: 'st_focus', name: 'Focus', trigger: 'After breakfast', color: 'rose', icon: '🎯' }
	];
	const habits = [
		{ id: 'h_m1', stack_id: 'st_morning', name: 'Stretch' },
		{ id: 'h_m2', stack_id: 'st_morning', name: 'Journal' },
		{ id: 'h_w1', stack_id: 'st_winddown', name: 'Skincare' },
		{ id: 'h_w2', stack_id: 'st_winddown', name: 'Tidy up' },
		{ id: 'h_r1', stack_id: 'st_reading', name: 'Read 20 pages' },
		{ id: 'h_r2', stack_id: 'st_reading', name: 'Notes' },
		{ id: 'h_f1', stack_id: 'st_fitness', name: 'Pushups' },
		{ id: 'h_f2', stack_id: 'st_fitness', name: 'Walk' }
	];
	const iso = '2026-01-01T00:00:00.000Z';
	const completions = [];
	const push = (id, s) => completions.push({ id: `c_${id}_${s}`, habit_id: id, user_id: uid, completed_at: s, created_at: iso });
	const range = (ids, from, to) => {
		for (let i = from; i >= to; i--) for (const id of ids) push(id, daysAgoStr(i));
	};
	range(['h_m1', 'h_m2'], 20, 0); // mature: 21-day streak, complete today
	range(['h_w1', 'h_w2'], 4, 0); // blooming: 5-day streak, complete today
	range(['h_r1', 'h_r2'], 5, 1); // wilting: 5-day streak, none today
	range(['h_f1'], 2, 1); // sprout: 2-day streak (h1 only, not today)

	const out = {
		profile: [{ id: uid, xp: 500, level: 2, streak_days: 21, longest_streak: 21, total_completions: 80, theme: 'default', created_at: iso, updated_at: iso }],
		stacks: stacks.map((s, i) => ({ ...s, user_id: uid, sort_order: i, created_at: iso, updated_at: iso })),
		habits: habits.map((h, i) => ({ ...h, user_id: uid, sort_order: i, created_at: iso, updated_at: iso })),
		completions
	};

	await new Promise((resolve, reject) => {
		const tx = db.transaction(['profile', 'stacks', 'habits', 'completions'], 'readwrite');
		for (const p of out.profile) tx.objectStore('profile').put(p);
		for (const s of out.stacks) tx.objectStore('stacks').put(s);
		for (const h of out.habits) tx.objectStore('habits').put(h);
		for (const c of out.completions) tx.objectStore('completions').put(c);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
	db.close();
	return { completions: out.completions.length, stacks: out.stacks.length, today: T };
});
console.log(`seeded: ${seedResult.stacks} stacks, ${seedResult.completions} completions (today ${seedResult.today})`);

// 3. Today page (settled) — card radius, DateNav header rhythm
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
await page.screenshot({ path: '/tmp/polish-today.png', fullPage: true });
console.log('today: screenshot /tmp/polish-today.png');

// 4. Stacks page (settled)
await page.goto(`${BASE}/stacks`, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
await page.screenshot({ path: '/tmp/polish-stacks.png', fullPage: true });
console.log('stacks: screenshot /tmp/polish-stacks.png');

// 5. Transition check: click Stats in the bottom nav, catch the in:fly mid-flight
await page.click('a[aria-label="Stats"]');
// {#key page.url.pathname} wrapper must exist immediately after the swap
const wrapper = await page.evaluate(() => {
	const el = document.querySelector('main > div');
	return { exists: el !== null, classes: el?.className ?? null, transform: el?.style.transform ?? null };
});
if (!wrapper.exists) throw new Error('key wrapper around children() missing — transition not applied');
console.log('transition wrapper present:', JSON.stringify(wrapper));
await page.screenshot({ path: '/tmp/polish-stats-midflight.png', animations: 'allow' });
await page.waitForTimeout(500);
await page.screenshot({ path: '/tmp/polish-stats.png', fullPage: true });
console.log('stats: screenshots /tmp/polish-stats-midflight.png + /tmp/polish-stats.png');

// 6. Layout checks: main clearance under the fixed nav, no horizontal scroll
const layout = await page.evaluate(() => {
	const main = document.querySelector('main');
	const nav = document.querySelector('nav');
	return {
		mainPb24: main.classList.contains('pb-24'),
		navFixed: getComputedStyle(nav).position === 'fixed',
		horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth
	};
});
if (!layout.mainPb24) throw new Error('main missing pb-24 clearance');
if (!layout.navFixed) throw new Error('bottom nav not fixed');
if (layout.horizontalOverflow) throw new Error('horizontal overflow found');
console.log('layout checks:', JSON.stringify(layout));

console.log('ALL POLISH SHOTS OK');
await browser.close();