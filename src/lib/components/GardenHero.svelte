<script lang="ts">
	// Rewards garden hero — cozy isometric plot: one living thing per stack.
	// plant theme → L-system plants; machine theme → radio assembling part-by-part.
	import type { Stack, Habit, Completion } from '$lib/types';
	import GardenPlant from './GardenPlant.svelte';
	import MachineBuild from './MachineBuild.svelte';
	import { computePlantProgress, machineBuildState } from '$lib/utils/plant-growth';
	import { colorBg } from '$lib/utils/helpers';
	import type { GardenTheme } from '$lib/services/db';

	interface Props {
		theme: GardenTheme;
		stacks: Stack[];
		habits: Habit[];
		completions: Completion[];
		onSetTheme: (theme: GardenTheme) => void;
	}

	let { theme, stacks, habits, completions, onSetTheme }: Props = $props();

	// Explicit theme class lookup — never dynamic class interpolation
	const THEME_CLASSES: Record<GardenTheme, string> = {
		plant: 'garden-scene-plant',
		machine: 'garden-scene-machine'
	};
	const BAR_FILL: Record<GardenTheme, string> = {
		plant: 'bg-gradient-to-r from-emerald-500 to-lime-400',
		machine: 'bg-gradient-to-r from-amber-500 to-orange-400'
	};

	interface Plot {
		id: string;
		name: string;
		colorTag: string;
		stage: number;
		progress: number;
		wilting: boolean;
		seed: string;
		nextLabel: string;
		streak: number;
		stepsBuilt: number; // machine theme: parts assembled (0-6)
	}

	let plots = $derived.by(() =>
		stacks.map(stack => {
			if (theme === 'machine') {
				const m = machineBuildState(stack.id, habits, completions);
				return {
					id: stack.id,
					name: stack.name,
					colorTag: colorBg(stack.color),
					stage: 0,
					progress: m.progress,
					wilting: false,
					seed: stack.id,
					nextLabel: m.nextLabel,
					streak: 0,
					stepsBuilt: m.stepsBuilt
				} satisfies Plot;
			}
			const g = computePlantProgress(stack.id, habits, completions);
			return {
				id: stack.id,
				name: stack.name,
				colorTag: colorBg(stack.color),
				stage: g.stage,
				progress: g.progress,
				wilting: g.wilting,
				seed: stack.id,
				nextLabel: g.nextLabel,
				streak: g.streak,
				stepsBuilt: 0
			} satisfies Plot;
		})
	);
</script>

<section class="relative overflow-hidden rounded-2xl border border-amber-900/40 shadow-lg mb-8 {THEME_CLASSES[theme]}">
	<!-- warm sunset sky -->
	<div class="garden-sky" aria-hidden="true"></div>
	<div class="cloud cloud-1" aria-hidden="true"></div>
	<div class="cloud cloud-2" aria-hidden="true"></div>

	<!-- header row: garden title + theme picker -->
	<div class="relative z-10 flex items-center justify-between px-4 pt-4">
		<h2 class="garden-title">Your Garden</h2>
		<div class="flex items-center rounded-full bg-black/30 border border-white/10 p-0.5" role="tablist" aria-label="Garden theme">
			<button
				onclick={() => onSetTheme('plant')}
				role="tab"
				aria-selected={theme === 'plant'}
				data-test="theme-plant"
				class="px-2.5 py-1 rounded-full text-xs font-medium transition-colors {theme === 'plant'
					? 'bg-emerald-600/80 text-white'
					: 'text-emerald-200/70 hover:text-white'}"
			>🌱 Plants</button>
			<button
				onclick={() => onSetTheme('machine')}
				role="tab"
				aria-selected={theme === 'machine'}
				data-test="theme-machine"
				class="px-2.5 py-1 rounded-full text-xs font-medium transition-colors {theme === 'machine'
					? 'bg-amber-600/80 text-white'
					: 'text-amber-200/70 hover:text-white'}"
			>📻 Radio</button>
		</div>
	</div>

	<!-- wooden garden bed -->
	<div class="relative z-10 mx-3 mt-3 mb-4">
		<div class="bed-frame-top"></div>
		<div class="bed-body">
			{#if plots.length === 0}
				<div class="text-center py-10 px-4">
					<div class="text-4xl mb-2">🌱</div>
					<p class="text-sm text-amber-100/80 font-medium">Your garden is waiting</p>
					<p class="text-xs text-amber-200/60 mt-1">Complete your first stack to plant something</p>
				</div>
			{:else}
				<div class="flex flex-wrap justify-around gap-x-2 gap-y-4 px-1">
					{#each plots as plot (plot.id)}
						<div class="plot" data-test="garden-plot">
							<div class="plot-visual">
								{#if theme === 'machine'}
									<MachineBuild stepsBuilt={plot.stepsBuilt} progress={plot.progress} seed={plot.seed} />
								{:else}
									<GardenPlant stage={plot.stage} progress={plot.progress} wilting={plot.wilting} seed={plot.seed} />
								{/if}
							</div>
							<span class="plot-name">{plot.name}</span>
							{#if theme === 'plant' && plot.streak > 0}
								<span class="plot-streak">🔥 {plot.streak}d</span>
							{/if}
							<!-- progress toward next stage -->
							<div class="plot-bar">
								<div class="h-full rounded-full {BAR_FILL[theme]} transition-all duration-500" style="width: {Math.round(plot.progress * 100)}%"></div>
							</div>
							<span class="plot-label" data-test="plot-label">{plot.nextLabel}</span>
						</div>
					{/each}
				</div>
			{/if}
		</div>
		<div class="bed-frame-bottom"></div>
	</div>

	<p class="relative z-10 garden-footnote -mt-1">
		{theme === 'plant' ? '✨ Plants grow with your streaks — complete today to keep them watered' : '📼 Every full day fits the next part — six days builds the radio'}
	</p>
</section>

<style>
	.garden-scene-plant {
		background: linear-gradient(180deg, #1a1a30 0%, #3a2850 10%, #8a3020 30%, #c85030 44%, #e08828 58%, #f0a840 70%, #c89830 80%, #2a5a30 92%, #1a3a18 100%);
	}
	.garden-scene-machine {
		background: linear-gradient(180deg, #141420 0%, #26203a 12%, #402a18 32%, #6a3a18 48%, #9a5a20 62%, #b07828 74%, #6a4a1c 86%, #302414 100%);
	}
	.garden-sky {
		position: absolute;
		top: 0; left: 0; right: 0;
		height: 55%;
		background: radial-gradient(ellipse at 50% 85%, rgba(255, 170, 60, 0.22) 0%, transparent 70%);
		pointer-events: none;
	}
	.cloud {
		position: absolute;
		background: rgba(255, 200, 160, 0.12);
		border-radius: 30px;
		pointer-events: none;
	}
	.cloud-1 { width: 110px; height: 26px; top: 12%; left: 8%; }
	.cloud-2 { width: 70px; height: 18px; top: 20%; right: 12%; }
	.garden-title {
		font-size: 1rem;
		font-weight: 700;
		color: #fde8c8;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}
	.garden-footnote {
		font-size: 0.65rem;
		color: #a8c898;
		text-align: center;
		padding-bottom: 0.6rem;
	}
	.bed-frame-top {
		height: 8px;
		background: linear-gradient(180deg, #8a6030, #6a4420);
		border-radius: 10px 10px 0 0;
		box-shadow: inset 0 2px 4px rgba(255, 200, 120, 0.2);
	}
	.bed-frame-bottom {
		height: 8px;
		background: linear-gradient(180deg, #5a3818, #4a2810);
		border-radius: 0 0 10px 10px;
		box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4);
	}
	.bed-body {
		background:
			radial-gradient(ellipse at 50% 90%, rgba(60, 40, 15, 0.5) 0%, transparent 60%),
			linear-gradient(180deg, #1a3a18 0%, #142814 40%, #1a2a10 100%);
		padding: 14px 10px 18px;
		border-left: 5px solid #5a3818;
		border-right: 5px solid #5a3818;
		box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.3);
	}
	.plot {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		width: 5.5rem;
	}
	.plot-visual {
		height: 96px;
		width: 64px;
	}
	.plot-name {
		font-size: 0.68rem;
		font-weight: 600;
		color: #fde8c8;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
		text-align: center;
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.plot-streak { font-size: 0.6rem; color: #ffc88a; }
	.plot-bar {
		width: 100%;
		height: 5px;
		background: rgba(0, 0, 0, 0.35);
		border-radius: 999px;
		overflow: hidden;
		margin-top: 2px;
	}
	.plot-label {
		font-size: 0.56rem;
		color: #d4c8a8;
		text-align: center;
		line-height: 1.25;
	}
</style>