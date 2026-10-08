// Deterministic docs-render generator for docs/screenshots/ (PR #2, 2026-10-08).
// Produces the four committed hero renders:
//   after-*  — stage 1 (Floor Days, xp 0, DAY, hour 12): the size-comparison pair
//   stage4-* — stage 4 (Proper Pad, xp 900, NIGHT, hour 21): furniture + carpet pair
// Usage: serve the node build on :4199 first (`ADAPTER=node npm run build && PORT=4199 node build`),
// then `node scripts/screenshot-docs.mjs`. dsf 1, fullPage — matches the committed
// renders' conventions.
import { chromium } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:4199';
const browser = await chromium.launch();

const SHOTS = [
	{ file: 'docs/screenshots/lofi-room-after-mobile-390x844.png', width: 390, height: 844, xp: 0, hour: 12 },
	{ file: 'docs/screenshots/lofi-room-after-desktop-1280x900.png', width: 1280, height: 900, xp: 0, hour: 12 },
	{ file: 'docs/screenshots/lofi-room-stage4-390x844.png', width: 390, height: 844, xp: 900, hour: 21 },
	{ file: 'docs/screenshots/lofi-room-stage4-1280x900.png', width: 1280, height: 900, xp: 900, hour: 21 }
];

for (const shot of SHOTS) {
	const context = await browser.newContext({
		viewport: { width: shot.width, height: shot.height },
		deviceScaleFactor: 1
	});
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
				// awake histories 1-5 days old keep the room out of sleepy mood
				completed_at: daysAgoStr(n),
				created_at: iso
			}))
		);
		const profile = {
			id: uid,
			xp,
			level: Math.floor(xp / 50),
			streak_days: 3,
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
	}, shot.xp);

	// deterministic mood: fix Date at the spec'd local hour
	await page.clock.setFixedTime(new Date(2026, 9, 8, shot.hour, 30, 0));
	await page.goto(`${BASE}/achievements`, { waitUntil: 'networkidle' });
	await page.waitForSelector('[data-test="lofi-room-hero"]', { timeout: 15000 });

	const label = await page.locator('[data-test="stage-label"]').textContent();
	console.log(`${shot.file}: ${label?.trim()}`);
	await page.screenshot({ path: shot.file, fullPage: true });
	await context.close();
}

await browser.close();
console.log('done');