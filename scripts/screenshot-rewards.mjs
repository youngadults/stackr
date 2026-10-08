// E2E visual verification for the Rewards garden (/achievements).
// Usage:
//   ADAPTER=node npm run build   (then serve)   →  PORT=4199 node build
//   node scripts/screenshot-rewards.mjs
// Seeds a clean IndexedDB with five stacks covering every stage, screenshots
// the plant theme, switches to the machine theme via the UI toggle, verifies
// the theme persists across reload (IndexedDB settings store), screenshots it.

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

// 2. Seed data covering every plant stage (local dates computed in-browser)
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
	void T;

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

// 3. Plant theme screenshot
await page.goto(`${BASE}/achievements`, { waitUntil: 'networkidle' });
await page.waitForSelector('[data-test="garden-plant"]', { timeout: 15000 });
const plantStats = await page.evaluate(() => ({
	plots: document.querySelectorAll('[data-test="garden-plot"]').length,
	plants: document.querySelectorAll('[data-test="garden-plant"]').length,
	labels: document.querySelectorAll('[data-test="plot-label"]').length,
	labelsText: [...document.querySelectorAll('[data-test="plot-label"]')].map(e => e.textContent.trim())
}));
console.log('plant theme:', JSON.stringify(plantStats));
await page.screenshot({ path: '/tmp/rewards-garden-plant.png', fullPage: true });

// 4. Switch to machine theme via the UI toggle
await page.click('[data-test="theme-machine"]');
await page.waitForSelector('[data-test="machine-build"]', { timeout: 15000 });
const machineStats = await page.evaluate(() => ({
	machines: document.querySelectorAll('[data-test="machine-build"]').length,
	plants: document.querySelectorAll('[data-test="garden-plant"]').length
}));
console.log('machine theme (after toggle):', JSON.stringify(machineStats));
if (machineStats.plants !== 0 || machineStats.machines === 0) throw new Error('machine switch failed');

// 5. Persistence: reload → machine theme must still be active (IndexedDB settings)
await page.reload({ waitUntil: 'networkidle' });
await page.waitForSelector('[data-test="machine-build"]', { timeout: 15000 });
console.log('persistence: machine theme survived reload');
await page.screenshot({ path: '/tmp/rewards-garden-machine.png', fullPage: true });

// 6. Switch back for the default state
await page.click('[data-test="theme-plant"]');
await page.waitForSelector('[data-test="garden-plant"]', { timeout: 15000 });

await browser.close();
const ok = plantStats.plots === 5 && plantStats.plants === 5 && plantStats.labels === 5;
console.log(ok ? 'E2E VISUAL OK — 5 plots, 5 plants, 5 progress labels' : 'E2E FAILED: unexpected counts');
process.exit(ok ? 0 : 1);