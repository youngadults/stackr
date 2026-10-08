<script lang="ts">
	import { getAppState, checkAndUnlockAchievements } from '$lib/stores/app.svelte';
	import LofiRoom from '$lib/components/LofiRoom.svelte';
	import {
		stageFromXp,
		stageProgress,
		deriveRoomMood,
		STAGE_NAMES,
		MAX_STAGE
	} from '$lib/room/room-stage';
	import { onMount } from 'svelte';
	import { today } from '$lib/utils/helpers';

	const appState = getAppState();

	// Local hour drives the night/day mood; refreshed once a minute
	let hour = $state(new Date().getHours());

	onMount(() => {
		checkAndUnlockAchievements().catch((e: unknown) =>
			console.warn('Failed to check achievements', e)
		);
		const timer = setInterval(() => {
			hour = new Date().getHours();
		}, 60_000);
		return () => clearInterval(timer);
	});

	let xp = $derived(appState.profile?.xp ?? 0);
	let streak = $derived(appState.profile?.streak_days ?? 0);

	let stage = $derived(stageFromXp(xp));
	let bar = $derived(stageProgress(xp));
	let lastCompletionDate = $derived(
		appState.completions.length > 0
			? (appState.completions.map((c) => c.completed_at).sort().at(-1) ?? null)
			: null
	);
	let mood = $derived(deriveRoomMood(hour, lastCompletionDate, today()));
</script>

<div class="animate-fade-in">
	<!-- Header -->
	<div class="flex items-center justify-between mb-2">
		<h1 class="text-2xl font-bold text-white">Achievements</h1>
	</div>

	<!-- Lofi room hero -->
	<LofiRoom {stage} {mood} />

	<!-- Stage label -->
	<p
		class="text-center text-xs font-semibold tracking-wide text-violet-300/90 mt-3"
		data-test="stage-label"
	>
		Stage {stage} of {MAX_STAGE} · {STAGE_NAMES[stage - 1]}
	</p>

	<!-- Progress toward the next room reveal -->
	<div class="mt-2 h-2 w-full rounded-full bg-violet-950/70 overflow-hidden" data-test="stage-progress">
		<div
			class="h-full rounded-full bg-gradient-to-r from-amber-400 to-violet-500 transition-all duration-500"
			style="width: {bar.percent}%"
		></div>
	</div>

	<!-- One-line stats -->
	<p class="text-center text-sm text-slate-300 mt-4" data-test="room-stats">
		⭐ {xp} total XP · 🔥 {streak}-day streak
	</p>
</div>