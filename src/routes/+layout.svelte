<script lang="ts">
	import '../app.css';
	import { getAppState, initializeState } from '$lib/stores/app.svelte';
	import '$lib/services/pwa';
	import { onMount, tick } from 'svelte';
	import { page } from '$app/state';
	import { fly } from 'svelte/transition';
	import { quartOut } from 'svelte/easing';
	import Toast from '$lib/components/Toast.svelte';
	import { setToastInstance } from '$lib/stores/toast';

	let toastRef: any;

	const appState = getAppState();

	let ready = $state(false);

	let { children } = $props();

	onMount(async () => {
		try {
			await initializeState();
		} catch (e) {
			console.error('Initialization failed:', e);
		}
		ready = true;

		// Register toast globally after render
		await tick();
		if (toastRef) setToastInstance(toastRef);
	});

	const NAV_ITEMS = [
		{ href: '/', label: 'Today', icon: 'checklist' },
		{ href: '/stacks', label: 'Stacks', icon: 'stacks' },
		{ href: '/stats', label: 'Stats', icon: 'stats' },
		{ href: '/achievements', label: 'Awards', icon: 'awards' },
	];

	let currentPath = $derived(page.url.pathname);
</script>

<svelte:head>
	<title>Stackr</title>
</svelte:head>

<Toast bind:this={toastRef} />

{#if !ready}
	<div class="flex items-center justify-center min-h-screen">
		<div class="text-center">
			<div class="text-5xl mb-4 animate-pulse-slow">🏗️</div>
			<div class="text-xl font-bold text-indigo-400">Stackr</div>
			<div class="text-sm text-slate-500 mt-2">Loading...</div>
		</div>
	</div>
{:else}
	<div class="min-h-screen flex flex-col bg-slate-950">
		<main class="flex-1 px-4 pb-24 pt-6 max-w-lg mx-auto w-full">
			{#key page.url.pathname}
				<div in:fly={{ y: 8, duration: 180, easing: quartOut }}>
					{@render children()}
				</div>
			{/key}
		</main>

		<nav class="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-800 z-40">
			<div class="max-w-lg mx-auto flex items-center justify-around px-4 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
				{#each NAV_ITEMS as item}
					<a
						href={item.href}
						class="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors {currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href))
							? 'text-indigo-400'
							: 'text-slate-500 hover:text-slate-300'}"
						aria-label={item.label}
					>
						{#if item.icon === 'checklist'}
							<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
							</svg>
						{:else if item.icon === 'stacks'}
							<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
							</svg>
						{:else if item.icon === 'stats'}
							<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
							</svg>
						{:else if item.icon === 'awards'}
							<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v2m1-2h2m2-4v2m0-2h2M3 21l6-6m0 0l3 3m6-12v4m0 0h4" />
							</svg>
						{/if}
						<span class="text-xs">{item.label}</span>
					</a>
				{/each}
			</div>
		</nav>
	</div>
{/if}