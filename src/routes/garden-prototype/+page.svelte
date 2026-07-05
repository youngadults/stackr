<script lang="ts">
	// Garden plant stages prototype — visual test
	import { getAppState, initializeState } from '$lib/stores/app.svelte';

	const appState = getAppState();

	const STAGES = [
		{ key: 'seed', label: 'Seed', emoji: '🌱', desc: 'New stack, no completions' },
		{ key: 'sprout', label: 'Sprout', emoji: '🌿', desc: '1-2 days partial completion' },
		{ key: 'growing', label: 'Growing', emoji: '🪴', desc: '3+ day streak, most habits done' },
		{ key: 'blooming', label: 'Blooming', emoji: '🌸', desc: 'All habits done today, streak thriving' },
		{ key: 'mature', label: 'Mature', emoji: '🌳', desc: '14+ day streak, fully established' },
		{ key: 'wilting', label: 'Wilting', emoji: '🥀', desc: 'Streak at risk — not done today' },
	];
</script>

<svelte:head>
	<title>Garden Prototype</title>
</svelte:head>

<div class="min-h-screen bg-slate-950 p-4 pt-8 max-w-lg mx-auto">
	<h1 class="text-2xl font-bold text-white mb-2">Garden Visualization</h1>
	<p class="text-slate-400 text-sm mb-8">Each stack = one plant. Growth reflects your consistency.</p>

	<!-- Individual Stage Previews -->
	<h2 class="text-lg font-semibold text-white mb-4">Plant Stages</h2>
	<div class="grid grid-cols-3 gap-4 mb-10">
		{#each STAGES as stage}
			<div class="flex flex-col items-center gap-2">
				<div class="plant-container">
					{#if stage.key === 'seed'}
						<!-- Seed: small mound with a seed -->
						<div class="seed-stage">
							<div class="seed-dot"></div>
							<div class="dirt-mound"></div>
						</div>
					{:else if stage.key === 'sprout'}
						<!-- Sprout: tiny stem with 2 small leaves -->
						<div class="sprout-stage">
							<div class="sprout-leaves">
								<div class="leaf leaf-left"></div>
								<div class="leaf leaf-right"></div>
							</div>
							<div class="sprout-stem"></div>
							<div class="dirt-mound"></div>
						</div>
					{:else if stage.key === 'growing'}
						<!-- Growing: taller stem, more leaves -->
						<div class="growing-stage">
							<div class="growing-top">
								<div class="leaf leaf-left-md"></div>
								<div class="bud"></div>
								<div class="leaf leaf-right-md"></div>
							</div>
							<div class="growing-stem"></div>
							<div class="leaf leaf-low-left"></div>
							<div class="dirt-mound"></div>
						</div>
					{:else if stage.key === 'blooming'}
						<!-- Blooming: full flower on top -->
						<div class="blooming-stage">
							<div class="flower-head">
								<div class="petal petal-1"></div>
								<div class="petal petal-2"></div>
								<div class="petal petal-3"></div>
								<div class="petal petal-4"></div>
								<div class="petal petal-5"></div>
								<div class="flower-center"></div>
							</div>
							<div class="blooming-stem"></div>
							<div class="leaf bloom-leaf-l"></div>
							<div class="leaf bloom-leaf-r"></div>
							<div class="dirt-mound"></div>
						</div>
					{:else if stage.key === 'mature'}
						<!-- Mature: tree trunk, full canopy -->
						<div class="mature-stage">
							<div class="canopy">
								<div class="canopy-blob canopy-b1"></div>
								<div class="canopy-blob canopy-b2"></div>
								<div class="canopy-blob canopy-b3"></div>
							</div>
							<div class="trunk"></div>
							<div class="dirt-mound"></div>
						</div>
					{:else if stage.key === 'wilting'}
						<!-- Wilting: drooping stem, faded colors -->
						<div class="wilting-stage">
							<div class="wilt-top">
								<div class="wilt-leaf wilt-leaf-l"></div>
								<div class="wilt-bud"></div>
							</div>
							<div class="wilt-stem"></div>
							<div class="dirt-mound dirt-mound-dry"></div>
						</div>
					{/if}
				</div>
				<div class="text-center">
					<div class="text-2xl">{stage.emoji}</div>
					<div class="text-xs font-medium text-white">{stage.label}</div>
					<div class="text-[10px] text-slate-500">{stage.desc}</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Full Garden View Preview -->
	<h2 class="text-lg font-semibold text-white mb-4">Garden View (Stackr)</h2>
	<div class="garden-bed">
		<div class="garden-row">
			<div class="garden-plant" title="Morning Routine — Blooming">
				<div class="blooming-stage plant-visual">
					<div class="flower-head">
						<div class="petal petal-1"></div>
						<div class="petal petal-2"></div>
						<div class="petal petal-3"></div>
						<div class="petal petal-4"></div>
						<div class="petal petal-5"></div>
						<div class="flower-center"></div>
					</div>
					<div class="blooming-stem"></div>
					<div class="leaf bloom-leaf-l"></div>
					<div class="leaf bloom-leaf-r"></div>
					<div class="dirt-mound"></div>
				</div>
				<span class="plant-label">Morning Routine</span>
				<span class="plant-sublabel">🔥 7 days</span>
			</div>

			<div class="garden-plant" title="Wind Down — Growing">
				<div class="growing-stage plant-visual">
					<div class="growing-top">
						<div class="leaf leaf-left-md"></div>
						<div class="bud"></div>
						<div class="leaf leaf-right-md"></div>
					</div>
					<div class="growing-stem"></div>
					<div class="leaf leaf-low-left"></div>
					<div class="dirt-mound"></div>
				</div>
				<span class="plant-label">Wind Down</span>
				<span class="plant-sublabel">🔥 3 days</span>
			</div>

			<div class="garden-plant" title="Focus — Seed">
				<div class="seed-stage plant-visual">
					<div class="seed-dot"></div>
					<div class="dirt-mound"></div>
				</div>
				<span class="plant-label">Focus</span>
				<span class="plant-sublabel text-slate-500">New</span>
			</div>
		</div>
		<div class="garden-row">
			<div class="garden-plant" title="Fitness — Mature">
				<div class="mature-stage plant-visual">
					<div class="canopy">
						<div class="canopy-blob canopy-b1"></div>
						<div class="canopy-blob canopy-b2"></div>
						<div class="canopy-blob canopy-b3"></div>
					</div>
					<div class="trunk"></div>
					<div class="dirt-mound"></div>
				</div>
				<span class="plant-label">Fitness</span>
				<span class="plant-sublabel">🔥 21 days</span>
			</div>

			<div class="garden-plant wilt" title="Reading — Wilting">
				<div class="wilting-stage plant-visual">
					<div class="wilt-top">
						<div class="wilt-leaf wilt-leaf-l"></div>
						<div class="wilt-bud"></div>
					</div>
					<div class="wilt-stem"></div>
					<div class="dirt-mound dirt-mound-dry"></div>
				</div>
				<span class="plant-label">Reading</span>
				<span class="plant-sublabel text-amber-400">⚠ At risk</span>
			</div>
		</div>
	</div>
</div>

<style>
	/* === Plant Container === */
	.plant-container {
		width: 80px;
		height: 100px;
		position: relative;
	}

	/* === Dirt Mound === */
	.dirt-mound {
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 40px;
		height: 10px;
		background: #5c4033;
		border-radius: 50% 50% 0 0;
	}
	.dirt-mound-dry {
		background: #8B7355;
	}

	/* === Seed Stage === */
	.seed-stage {
		position: relative;
		width: 100%;
		height: 100%;
	}
	.seed-dot {
		position: absolute;
		bottom: 8px;
		left: 50%;
		transform: translateX(-50%);
		width: 10px;
		height: 8px;
		background: #92702a;
		border-radius: 50%;
	}

	/* === Sprout Stage === */
	.sprout-stage {
		position: relative;
		width: 100%;
		height: 100%;
	}
	.sprout-stem {
		position: absolute;
		bottom: 8px;
		left: 50%;
		transform: translateX(-50%);
		width: 2px;
		height: 25px;
		background: #4ade80;
		border-radius: 1px;
	}
	.sprout-leaves {
		position: absolute;
		bottom: 30px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 0;
	}
	.leaf-left {
		width: 10px;
		height: 8px;
		background: #4ade80;
		border-radius: 0 80% 0 80%;
		transform: rotate(-15deg);
	}
	.leaf-right {
		width: 10px;
		height: 8px;
		background: #4ade80;
		border-radius: 80% 0 80% 0;
		transform: rotate(15deg);
	}

	/* === Growing Stage === */
	.growing-stage {
		position: relative;
		width: 100%;
		height: 100%;
	}
	.growing-stem {
		position: absolute;
		bottom: 8px;
		left: 50%;
		transform: translateX(-50%);
		width: 3px;
		height: 40px;
		background: linear-gradient(to top, #22c55e, #4ade80);
		border-radius: 1px;
	}
	.growing-top {
		position: absolute;
		bottom: 44px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: 0;
	}
	.leaf-left-md {
		width: 12px;
		height: 10px;
		background: #4ade80;
		border-radius: 0 70% 0 70%;
		transform: rotate(-20deg);
	}
	.leaf-right-md {
		width: 12px;
		height: 10px;
		background: #4ade80;
		border-radius: 70% 0 70% 0;
		transform: rotate(20deg);
	}
	.bud {
		width: 8px;
		height: 8px;
		background: #f9a8d4;
		border-radius: 50%;
		margin: 0 2px;
	}
	.leaf-low-left {
		position: absolute;
		bottom: 32px;
		left: 22px;
		width: 10px;
		height: 7px;
		background: #4ade80;
		border-radius: 0 70% 0 70%;
		transform: rotate(-30deg);
	}

	/* === Blooming Stage === */
	.blooming-stage {
		position: relative;
		width: 100%;
		height: 100%;
	}
	.blooming-stem {
		position: absolute;
		bottom: 8px;
		left: 50%;
		transform: translateX(-50%);
		width: 3px;
		height: 40px;
		background: linear-gradient(to top, #16a34a, #4ade80);
		border-radius: 1px;
	}
	.flower-head {
		position: absolute;
		bottom: 46px;
		left: 50%;
		transform: translateX(-50%);
		width: 28px;
		height: 28px;
	}
	.petal {
		position: absolute;
		width: 10px;
		height: 10px;
		background: #f472b6;
		border-radius: 50%;
	}
	.petal-1 { top: 0; left: 9px; }
	.petal-2 { top: 9px; right: 0; }
	.petal-3 { bottom: 0; left: 9px; }
	.petal-4 { top: 9px; left: 0; }
	.petal-5 { top: 7px; left: 7px; width: 14px; height: 14px; background: #ec4899; opacity: 0.7; }
	.flower-center {
		position: absolute;
		top: 8px;
		left: 8px;
		width: 12px;
		height: 12px;
		background: #fbbf24;
		border-radius: 50%;
		z-index: 2;
	}
	.bloom-leaf-l {
		position: absolute;
		bottom: 30px;
		left: 20px;
		width: 14px;
		height: 9px;
		background: #4ade80;
		border-radius: 0 70% 0 70%;
		transform: rotate(-35deg);
	}
	.bloom-leaf-r {
		position: absolute;
		bottom: 30px;
		right: 20px;
		width: 14px;
		height: 9px;
		background: #4ade80;
		border-radius: 70% 0 70% 0;
		transform: rotate(35deg);
	}

	/* === Mature Stage (Tree) === */
	.mature-stage {
		position: relative;
		width: 100%;
		height: 100%;
	}
	.trunk {
		position: absolute;
		bottom: 8px;
		left: 50%;
		transform: translateX(-50%);
		width: 8px;
		height: 30px;
		background: linear-gradient(to top, #92400e, #a16207);
		border-radius: 2px;
	}
	.canopy {
		position: absolute;
		bottom: 35px;
		left: 50%;
		transform: translateX(-50%);
		width: 50px;
		height: 45px;
	}
	.canopy-blob {
		position: absolute;
		border-radius: 50%;
		background: #22c55e;
	}
	.canopy-b1 {
		width: 30px; height: 28px; top: 0; left: 10px; background: #22c55e;
	}
	.canopy-b2 {
		width: 26px; height: 24px; top: 12px; left: 0; background: #16a34a;
	}
	.canopy-b3 {
		width: 26px; height: 24px; top: 10px; right: 0; left: 24px; background: #15803d;
	}

	/* === Wilting Stage === */
	.wilting-stage {
		position: relative;
		width: 100%;
		height: 100%;
	}
	.wilt-stem {
		position: absolute;
		bottom: 8px;
		left: 50%;
		transform: translateX(-50%) rotate(15deg);
		transform-origin: bottom center;
		width: 2px;
		height: 35px;
		background: #a3a03a;
		border-radius: 1px;
	}
	.wilt-top {
		position: absolute;
		bottom: 40px;
		left: 55%;
		transform: translateX(-50%) rotate(20deg);
		display: flex;
		align-items: center;
	}
	.wilt-leaf-l {
		width: 10px;
		height: 7px;
		background: #a3a03a;
		border-radius: 0 60% 0 60%;
		transform: rotate(-10deg);
	}
	.wilt-bud {
		width: 6px;
		height: 6px;
		background: #92702a;
		border-radius: 50%;
		margin-left: 2px;
	}

	/* === Garden Bed === */
	.garden-bed {
		background: linear-gradient(180deg, #1a2e1a 0%, #0f1f0f 100%);
		border: 1px solid #2d4a2d;
		border-radius: 16px;
		padding: 20px 16px;
		position: relative;
		overflow: hidden;
	}
	.garden-bed::before {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 40%;
		background: linear-gradient(to top, #2d1f0e, transparent);
		opacity: 0.3;
		border-radius: 0 0 16px 16px;
	}
	.garden-row {
		display: flex;
		justify-content: space-around;
		gap: 12px;
		margin-bottom: 16px;
	}
	.garden-row:last-child {
		margin-bottom: 0;
	}
	.garden-plant {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		cursor: pointer;
		transition: transform 0.2s;
		flex: 1;
	}
	.garden-plant:active {
		transform: scale(0.95);
	}
	.plant-visual {
		transform-origin: bottom center;
	}
	.plant-label {
		font-size: 12px;
		font-weight: 600;
		color: #e2e8f0;
		text-align: center;
	}
	.plant-sublabel {
		font-size: 10px;
		color: #94a3b8;
		text-align: center;
	}
	.garden-plant.wilt .plant-label {
		color: #d97706;
	}
</style>