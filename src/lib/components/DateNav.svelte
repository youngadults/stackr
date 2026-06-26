<script lang="ts">
	import { today, formatDate, formatDateLong, daysAgo, daysBetween, isToday, isYesterday } from '$lib/utils/helpers';

	let { selectedDate = $bindable(today()) }: { selectedDate?: string } = $props();

	function goBack() {
		const d = new Date(selectedDate + 'T12:00:00');
		d.setDate(d.getDate() - 1);
		selectedDate = d.toISOString().slice(0, 10);
	}

	function goForward() {
		const d = new Date(selectedDate + 'T12:00:00');
		d.setDate(d.getDate() + 1);
		const tomorrow = new Date();
		tomorrow.setHours(23, 59, 59, 999);
		if (d <= tomorrow) {
			selectedDate = d.toISOString().slice(0, 10);
		}
	}

	function goToday() {
		selectedDate = today();
	}

	let label = $derived.by(() => {
		if (isToday(selectedDate)) return 'Today';
		if (isYesterday(selectedDate)) return 'Yesterday';
		return formatDateLong(selectedDate);
	});

	let showToday = $derived(!isToday(selectedDate));
	let canGoForward = $derived(selectedDate < today());
</script>

<div class="flex items-center justify-between mb-4">
	<button
		onclick={goBack}
		class="p-2 -ml-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
		aria-label="Previous day"
	>
		<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
		</svg>
	</button>

	<div class="text-center">
		<h2 class="text-base font-semibold text-white">{label}</h2>
		{#if showToday}
			<button onclick={goToday} class="text-xs text-indigo-400 hover:text-indigo-300">Jump to today</button>
		{/if}
	</div>

	<button
		onclick={goForward}
		class="p-2 -mr-2 rounded-lg hover:bg-slate-800 transition-colors {canGoForward ? 'text-slate-400 hover:text-white' : 'text-slate-700 cursor-not-allowed'}"
		aria-label="Next day"
		disabled={!canGoForward}
	>
		<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
		</svg>
	</button>
</div>