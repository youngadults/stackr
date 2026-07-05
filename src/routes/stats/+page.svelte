<script lang="ts">
	import { getAppState } from '$lib/stores/app.svelte';
	import { calculateStreak, xpProgressInLevel } from '$lib/utils/gamification';
	import { today, daysAgo } from '$lib/utils/helpers';

	const appState = getAppState();

	const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	// Last 7 days data
	const last7Days = $derived.by(() => {
		const days = [];
		for (let i = 6; i >= 0; i--) {
			const dateStr = daysAgo(i);
			const dateObj = new Date(dateStr + 'T12:00:00');
			const dayName = DAY_NAMES[dateObj.getDay()];
			const count = appState.completions.filter(c => c.completed_at === dateStr).length;
			days.push({ date: dateStr, dayName, count, isToday: dateStr === today() });
		}
		return days;
	});

	const maxCount = $derived(Math.max(...last7Days.map(d => d.count), 1));

	// Streak per habit
	const streaks = $derived.by(() => {
		return appState.habits.map(h => {
			const dates = appState.completions
				.filter(c => c.habit_id === h.id)
				.map(c => c.completed_at);
			return { name: h.name, streak: calculateStreak(dates), habitId: h.id };
		}).sort((a, b) => b.streak - a.streak);
	});

	const progress = $derived(appState.profile ? xpProgressInLevel(appState.profile.xp) : null);
</script>

<div class="animate-fade-in">
	<h1 class="text-2xl font-bold text-white mb-6">Stats</h1>

	{#if appState.profile}
		<!-- Profile Summary -->
		<div class="grid grid-cols-2 gap-3 mb-6">
			<div class="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
				<div class="text-2xl font-bold text-indigo-400">Lv.{appState.profile.level}</div>
				<div class="text-xs text-slate-400 mt-1">Level</div>
			</div>
			<div class="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
				<div class="text-2xl font-bold text-amber-400">{appState.profile.xp}</div>
				<div class="text-xs text-slate-400 mt-1">Total XP</div>
			</div>
			<div class="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
				<div class="text-2xl font-bold text-orange-400">{appState.profile.streak_days}</div>
				<div class="text-xs text-slate-400 mt-1">Current Streak</div>
			</div>
			<div class="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
				<div class="text-2xl font-bold text-emerald-400">{appState.profile.total_completions}</div>
				<div class="text-xs text-slate-400 mt-1">Total Logged</div>
			</div>
		</div>

		<!-- XP Progress -->
		{#if progress}
			<div class="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6">
				<div class="flex justify-between text-sm mb-2">
					<span class="text-slate-400">Level {appState.profile.level}</span>
					<span class="text-indigo-400">{appState.profile.xp} XP</span>
				</div>
				<div class="h-3 bg-slate-800 rounded-full overflow-hidden">
					<div
						class="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
						style="width: {progress.percent}%"
					></div>
				</div>
				<div class="text-xs text-slate-500 mt-1 text-center">
					{progress.current} / {progress.needed} XP to Level {appState.profile.level + 1}
				</div>
			</div>
		{/if}
	{/if}

	<!-- Last 7 Days Bar Chart -->
	<div class="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6">
		<h2 class="text-sm font-semibold text-white mb-4">Last 7 Days</h2>
		<div class="flex items-end justify-between gap-3" style="height: 140px;">
			{#each last7Days as day}
				<div class="flex-1 flex flex-col items-center gap-1 h-full">
					<div class="flex-1 w-full relative">
						<div class="absolute inset-0 bg-slate-800 rounded-t"></div>
						<div
							class="absolute bottom-0 left-0 right-0 rounded-t transition-all duration-300 {day.isToday ? 'bg-indigo-400' : 'bg-indigo-600'}"
							style="height: {day.count > 0 ? Math.max(8, (day.count / maxCount) * 100) : 0}%"
						></div>
						{#if day.count > 0}
							<div class="absolute top-0 left-0 right-0 text-center">
								<span class="text-[10px] font-medium text-white">{day.count}</span>
							</div>
						{/if}
					</div>
					<span class="text-xs {day.isToday ? 'text-indigo-400 font-semibold' : 'text-slate-400'}">{day.dayName}</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Habit Streaks -->
	{#if streaks.length > 0}
		<div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
			<h2 class="text-sm font-semibold text-white mb-3">Habit Streaks</h2>
			<div class="space-y-2">
				{#each streaks as item (item.habitId)}
					<div class="flex items-center justify-between py-1.5">
						<span class="text-sm text-slate-300">{item.name}</span>
						<div class="flex items-center gap-1.5">
							{#if item.streak > 0}
								<span class="text-orange-400">🔥</span>
							{/if}
							<span class="text-sm font-medium {item.streak > 0 ? 'text-white' : 'text-slate-500'}">
								{item.streak} day{item.streak !== 1 ? 's' : ''}
							</span>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>