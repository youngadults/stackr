<script lang="ts">
	import { getAppState, toggleCompletion, createStack, createHabit } from '$lib/stores/app.svelte';
	import { today, formatDate, randomColor, randomIcon, colorClasses, completedBg } from '$lib/utils/helpers';
	import { calculateStreak, xpProgressInLevel } from '$lib/utils/gamification';
	import { calculateCompletionXP } from '$lib/stores/profile';
	import NewStackModal from '$lib/components/NewStackModal.svelte';
	import DateNav from '$lib/components/DateNav.svelte';
	import { showToast } from '$lib/stores/toast';

	const appState = getAppState();

	let selectedDate = $state(today());
	let showNewStack = $state(false);
	let newStackName = $state('');
	let newStackTrigger = $state('');
	let newStackColor = $state(randomColor());
	let newStackIcon = $state(randomIcon());
	let newHabitStackId = $state<string | null>(null);
	let newHabitName = $state('');

	const dateObj = $derived(new Date(selectedDate + 'T12:00:00'));
	const dayName = $derived(dateObj.toLocaleDateString('en-US', { weekday: 'long' }));
	const monthName = $derived(dateObj.toLocaleDateString('en-US', { month: 'long' }));
	const dateNum = $derived(dateObj.getDate());

	function getStackChecklist() {
		return appState.stacks.map(stack => {
			const stackHabits = appState.habits.filter(h => h.stack_id === stack.id);
			const completedCount = stackHabits.filter(h =>
				appState.completions.some(c => c.habit_id === h.id && c.completed_at === selectedDate)
			).length;
			return {
				...stack,
				habits: stackHabits,
				completedCount,
				totalCount: stackHabits.length,
				allComplete: stackHabits.length > 0 && completedCount === stackHabits.length
			};
		});
	}

	async function handleToggle(habitId: string) {
		// Haptic feedback
		if (navigator.vibrate) navigator.vibrate(10);

		const wasCompleted = appState.completions.some(c => c.habit_id === habitId && c.completed_at === selectedDate);
		const oldProfile = appState.profile;

		await toggleCompletion(habitId, selectedDate);

		const nowCompleted = appState.completions.some(c => c.habit_id === habitId && c.completed_at === selectedDate);

		if (nowCompleted && !wasCompleted && oldProfile) {
			// Completed
			const xpGain = calculateCompletionXP(appState.completions, appState.stacks, appState.habits, oldProfile.streak_days + 1);
			showToast('xp', `+${xpGain.total} XP`, undefined, '✨');

			// Check for level up
			if (appState.profile && appState.profile.level > oldProfile.level) {
				setTimeout(() => {
					showToast('levelup', `Level ${appState.profile!.level}!`, undefined, '🎉');
				}, 800);
			}

			// Check for full stack
			const checklist = getStackChecklist();
			const justCompletedStack = checklist.find(s => s.allComplete && s.completedCount === s.totalCount);
			if (justCompletedStack) {
				setTimeout(() => {
					showToast('success', 'Stack complete!', `+25 bonus XP`, '✅');
				}, 400);
			}
		} else if (!nowCompleted && wasCompleted) {
			showToast('info', 'Unmarked', undefined, '↩️');
		}
	}

	async function handleCreateStack() {
		if (!newStackName.trim() || !newStackTrigger.trim()) return;
		await createStack(newStackName.trim(), newStackTrigger.trim(), newStackColor, newStackIcon);
		resetNewStack();
		showToast('success', 'Stack created!', undefined, '🏗️');
	}

	function resetNewStack() {
		newStackName = '';
		newStackTrigger = '';
		newStackColor = randomColor();
		newStackIcon = randomIcon();
		showNewStack = false;
	}

	async function handleCreateHabit() {
		if (!newHabitName.trim() || !newHabitStackId) return;
		await createHabit(newHabitStackId, newHabitName.trim());
		newHabitName = '';
		newHabitStackId = null;
		showToast('success', 'Habit added!', undefined, '✅');
	}

	function getHabitStreak(habitId: string): number {
		const dates = appState.completions
			.filter(c => c.habit_id === habitId)
			.map(c => c.completed_at);
		return calculateStreak(dates);
	}

	function isHabitCompletedOnDate(habitId: string): boolean {
		return appState.completions.some(c => c.habit_id === habitId && c.completed_at === selectedDate);
	}

	let checklist = $derived(getStackChecklist());
	let progress = $derived(appState.profile ? xpProgressInLevel(appState.profile.xp) : null);

	// Streak nudge: habits with streaks >= 3 that haven't been completed today (only on today's view)
	let streakAtRisk = $derived(
		selectedDate === today()
			? appState.habits
				.filter(h => !isHabitCompletedOnDate(h.id) && getHabitStreak(h.id) >= 3)
				.map(h => ({ name: h.name, streak: getHabitStreak(h.id) }))
			: []
	);

	// Check if date is in the past (no adding habits on past days)
	let isPastDate = $derived(selectedDate < today());
</script>

<div class="animate-fade-in">
	<!-- Date Navigation -->
	<DateNav bind:selectedDate={selectedDate} />

	<!-- Header with date -->
	<div class="flex items-center justify-between mb-4">
		<div>
			<p class="text-slate-400 text-sm">{dayName}</p>
			<h1 class="text-2xl font-bold text-white">{monthName} {dateNum}</h1>
		</div>
		{#if appState.profile}
			<div class="flex items-center gap-3">
				<div class="text-right">
					<div class="text-sm font-medium text-indigo-400">Level {appState.profile.level}</div>
					<div class="text-xs text-slate-500">{appState.profile.xp} XP</div>
				</div>
				<div class="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-lg">
					{appState.profile.streak_days > 0 ? '🔥' : '⭐'}
				</div>
			</div>
		{/if}
	</div>

	<!-- XP Progress -->
	{#if appState.profile && appState.profile.level > 0 && progress}
		<div class="mb-6">
			<div class="flex justify-between text-xs text-slate-400 mb-1">
				<span>Level {appState.profile.level}</span>
				<span>Level {appState.profile.level + 1}</span>
			</div>
			<div class="h-2 bg-slate-800 rounded-full overflow-hidden">
				<div
					class="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
					style="width: {progress.percent}%"
				></div>
			</div>
			<div class="text-xs text-slate-500 mt-1 text-center">{progress.current} / {progress.needed} XP</div>
		</div>
	{/if}

	<!-- Streak Nudge (only today) -->
	{#if streakAtRisk.length > 0}
		{#if streakAtRisk.length === 1}
			<div class="mb-4 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3">
				<span class="text-2xl">⚠️</span>
				<div>
					<p class="text-sm font-medium text-amber-400">Streak at risk!</p>
					<p class="text-xs text-slate-400">{streakAtRisk[0].name} — {streakAtRisk[0].streak}-day streak</p>
				</div>
			</div>
		{:else}
			<div class="mb-4 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3">
				<span class="text-2xl">⚠️</span>
				<div>
					<p class="text-sm font-medium text-amber-400">{streakAtRisk.length} streaks at risk</p>
					<p class="text-xs text-slate-400">Complete them today to keep your streaks alive</p>
				</div>
			</div>
		{/if}
	{/if}

	<!-- Stacks Checklist -->
	{#if checklist.length === 0}
		<div class="text-center py-16">
			<div class="text-6xl mb-4">🏗️</div>
			<h2 class="text-xl font-semibold text-white mb-2">No stacks yet</h2>
			<p class="text-slate-400 mb-6">Create your first habit stack to get started</p>
			{#if !isPastDate}
				<button
					onclick={() => showNewStack = true}
					class="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium text-white"
				>
					Create Your First Stack
				</button>
			{/if}
		</div>
	{:else}
		<div class="space-y-4">
			{#each checklist as stack (stack.id)}
				<div class="rounded-xl border {colorClasses(stack.color)} overflow-hidden">
					<a href="/stacks/{stack.id}" class="block px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
						<div class="flex items-center gap-2">
							<span class="text-xl">{stack.icon}</span>
							<div>
								<h3 class="font-semibold text-white text-sm">{stack.name}</h3>
								<p class="text-xs text-slate-400">{stack.trigger}</p>
							</div>
						</div>
						<div class="flex items-center gap-2">
							{#if stack.allComplete}
								<span class="text-xs {completedBg(stack.color)} text-white px-2 py-0.5 rounded-full">Done!</span>
							{:else}
								<span class="text-xs text-slate-400">{stack.completedCount}/{stack.totalCount}</span>
							{/if}
							<svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
							</svg>
						</div>
					</a>

					<!-- Habits checklist -->
					{#if stack.habits.length > 0}
						<div class="px-2 pb-2 space-y-0.5">
							{#each stack.habits as habit (habit.id)}
								{@const completed = isHabitCompletedOnDate(habit.id)}
								{@const streak = getHabitStreak(habit.id)}
								<button
									onclick={() => handleToggle(habit.id)}
									class="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all {completed
										? 'bg-slate-800/50'
										: 'bg-slate-900/50 hover:bg-slate-800/50'}"
								>
									<div class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all {completed
										? completedBg(stack.color) + ' border-transparent'
										: 'border-slate-600'}">
										{#if completed}
											<svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
												<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
											</svg>
										{/if}
									</div>
									<span class="flex-1 text-left text-sm {completed ? 'text-slate-500 line-through' : 'text-white'}">
										{habit.name}
									</span>
									{#if streak > 1}
										<span class="text-xs text-orange-400">🔥 {streak}</span>
									{/if}
								</button>
							{/each}
						</div>
					{/if}

					<!-- Add habit inline (only for today) -->
					{#if !isPastDate && newHabitStackId === stack.id}
						<div class="px-4 pb-3">
							<div class="flex gap-2">
								<input
									type="text"
									bind:value={newHabitName}
									placeholder="New habit..."
									class="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
									onkeydown={(e) => e.key === 'Enter' && handleCreateHabit()}
								/>
								<button onclick={handleCreateHabit} class="px-3 py-2 bg-indigo-600 rounded-lg text-sm text-white">Add</button>
								<button onclick={() => { newHabitStackId = null; newHabitName = ''; }} class="px-3 py-2 bg-slate-700 rounded-lg text-sm text-white">✕</button>
							</div>
						</div>
					{:else if !isPastDate}
						<button
							onclick={() => newHabitStackId = stack.id}
							class="w-full px-4 py-2.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800/30 transition-colors border-t border-slate-700/30"
						>
							+ Add habit
						</button>
					{/if}
				</div>
			{/each}
		</div>

		{#if !isPastDate}
			<button
				onclick={() => showNewStack = true}
				class="w-full mt-4 py-3 border border-dashed border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-indigo-500 transition-colors"
			>
				+ New Stack
			</button>
		{/if}
	{/if}
</div>

<NewStackModal
	bind:show={showNewStack}
	bind:name={newStackName}
	bind:trigger={newStackTrigger}
	bind:color={newStackColor}
	bind:icon={newStackIcon}
	onclose={resetNewStack}
	oncreate={handleCreateStack}
/>