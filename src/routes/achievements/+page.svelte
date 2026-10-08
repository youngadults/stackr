<script lang="ts">
	import { getAppState, checkAndUnlockAchievements } from '$lib/stores/app.svelte';
	import { BADGES } from '$lib/utils/badges';
	import * as db from '$lib/services/db';
	import type { GardenTheme } from '$lib/services/db';
	import GardenHero from '$lib/components/GardenHero.svelte';
	import { onMount } from 'svelte';

	const appState = getAppState();

	// Garden theme — persisted locally in the IndexedDB settings store
	let theme = $state<GardenTheme>('plant');

	onMount(() => {
		checkAndUnlockAchievements();
		db.getSetting<GardenTheme>('gardenTheme')
			.then(saved => {
				if (saved === 'plant' || saved === 'machine') theme = saved;
			})
			.catch((e: unknown) => console.warn('Failed to load garden theme', e));
	});

	async function setTheme(next: GardenTheme) {
		theme = next;
		try {
			await db.saveSetting('gardenTheme', next);
		} catch (e) {
			console.warn('Failed to save garden theme', e);
		}
	}

	// Dynamic badges (streak, completion, level, stack count)
	let dynamicChecks = $derived(
		(() => {
			const checks: Record<string, boolean> = {};
			for (const a of appState.achievements) {
				checks[a.badge_key] = true;
			}
			const p = appState.profile;
			if (p) {
				if (p.longest_streak >= 3) checks['streak_3'] = true;
				if (p.longest_streak >= 7) checks['streak_7'] = true;
				if (p.longest_streak >= 14) checks['streak_14'] = true;
				if (p.longest_streak >= 30) checks['streak_30'] = true;
				if (p.longest_streak >= 100) checks['streak_100'] = true;
				if (p.total_completions >= 1) checks['first_habit'] = true;
				if (p.total_completions >= 10) checks['complete_10'] = true;
				if (p.total_completions >= 50) checks['complete_50'] = true;
				if (p.total_completions >= 100) checks['complete_100'] = true;
				if (p.total_completions >= 500) checks['complete_500'] = true;
				if (p.total_completions >= 1000) checks['complete_1000'] = true;
				if (p.level >= 5) checks['level_5'] = true;
				if (p.level >= 10) checks['level_10'] = true;
				if (p.level >= 25) checks['level_25'] = true;
				if (p.level >= 50) checks['level_50'] = true;
			}
			if (appState.stacks.length >= 1) checks['first_stack'] = true;
			if (appState.stacks.length >= 5) checks['stack_5'] = true;
			return checks;
		})()
	);

	let categories = $derived([
		{ name: 'Streaks', badges: BADGES.filter(b => b.category === 'streak') },
		{ name: 'Completions', badges: BADGES.filter(b => b.category === 'completion') },
		{ name: 'Stacks', badges: BADGES.filter(b => b.category === 'stack') },
		{ name: 'Levels', badges: BADGES.filter(b => b.category === 'level') },
		{ name: 'Special', badges: BADGES.filter(b => b.category === 'special') }
	]);

	let unlockedCount = $derived(BADGES.filter(b => dynamicChecks[b.key]).length);
	let totalCount = $derived(BADGES.length);
</script>

<div class="animate-fade-in">
	<!-- Header layout preserved: title left, garden link right -->
	<div class="flex items-center justify-between mb-2">
		<h1 class="text-2xl font-bold text-white">Achievements</h1>
		<a href="/garden-prototype" class="text-slate-500 hover:text-emerald-400 transition-colors p-1" title="View Garden">
			<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1 0 2-.15 3-.4M12 2c1.5 2 3 5.5 3 10s-1.5 8-3 10M12 2C10.5 4 9 7.5 9 12s1.5 8 3 10M22 12H2M15 7.5c1.5-.5 3-.5 4.5 0M15 16.5c1.5.5 3 .5 4.5 0" />
			</svg>
		</a>
	</div>
	<p class="text-sm text-slate-400 mb-2">{unlockedCount} / {totalCount} unlocked</p>

	<!-- Progress bar -->
	<div class="h-2 bg-slate-800 rounded-full overflow-hidden mb-6">
		<div
			class="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
			style="width: {totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0}%"
		></div>
	</div>

	<!-- Garden hero: one plant (or machine) per stack -->
	<GardenHero
		theme={theme}
		stacks={appState.stacks}
		habits={appState.habits}
		completions={appState.completions}
		onSetTheme={setTheme}
	/>

	<!-- Badges — compact section below the garden -->
	<div class="space-y-5" data-test="badges-section">
		{#each categories as category (category.name)}
			{#if category.badges.length > 0}
				<div>
					<h2 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{category.name}</h2>
					<div class="grid grid-cols-2 gap-2">
						{#each category.badges as badge (badge.key)}
							{@const isUnlocked = dynamicChecks[badge.key] === true}
							<div class="rounded-lg border {isUnlocked ? 'border-amber-500/30 bg-amber-500/5' : 'border-slate-800 bg-slate-900'} p-2 transition-all">
								<div class="flex items-center gap-2">
									<span class="text-lg {isUnlocked ? '' : 'grayscale opacity-30'} shrink-0">{badge.icon}</span>
									<div class="min-w-0">
										<h3 class="text-xs font-medium {isUnlocked ? 'text-white' : 'text-slate-500'} truncate">{badge.name}</h3>
										<p class="text-[10px] leading-tight {isUnlocked ? 'text-slate-400' : 'text-slate-600'} mt-0.5 line-clamp-2">{badge.description}</p>
									</div>
								</div>
								{#if isUnlocked}
									<div class="mt-1 flex items-center gap-1 text-[10px] text-amber-400">
										<svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
										</svg>
										Unlocked
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}
		{/each}
	</div>
</div>