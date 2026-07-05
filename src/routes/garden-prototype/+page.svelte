<script lang="ts">
	// Garden plant stages prototype — 3D-ish version
	import { getAppState } from '$lib/stores/app.svelte';

	const appState = getAppState();

	const STAGES = [
		{ key: 'seed', label: 'Seed', desc: 'New stack' },
		{ key: 'sprout', label: 'Sprout', desc: '1-2 days' },
		{ key: 'growing', label: 'Growing', desc: '3+ day streak' },
		{ key: 'blooming', label: 'Blooming', desc: 'All done today' },
		{ key: 'mature', label: 'Mature', desc: '14+ day streak' },
		{ key: 'wilting', label: 'Wilting', desc: 'Streak at risk' },
	];
</script>

<svelte:head>
	<title>Garden Prototype — 3D</title>
</svelte:head>

<div class="min-h-screen bg-slate-950 p-4 pt-8 max-w-lg mx-auto">
	<h1 class="text-2xl font-bold text-white mb-1">Garden Visualization</h1>
	<p class="text-slate-400 text-sm mb-8">3D-ish CSS plants. Each stack = one plant.</p>

	<!-- Stage Reference -->
	<h2 class="text-lg font-semibold text-white mb-4">Plant Stages</h2>
	<div class="grid grid-cols-3 gap-4 mb-10">
		{#each STAGES as stage}
			<div class="flex flex-col items-center gap-2">
				<div class="plant-slot">
					{#if stage.key === 'seed'}
						<div class="plant seed-plant">
							<div class="seed-body"></div>
							<div class="soil-bed">
								<div class="soil-top"></div>
								<div class="soil-front"></div>
							</div>
						</div>
					{:else if stage.key === 'sprout'}
						<div class="plant sprout-plant">
							<div class="sprout-leaves">
								<div class="s-leaf s-leaf-l"></div>
								<div class="s-leaf s-leaf-r"></div>
							</div>
							<div class="sprout-stem"></div>
							<div class="soil-bed">
								<div class="soil-top"></div>
								<div class="soil-front"></div>
							</div>
						</div>
					{:else if stage.key === 'growing'}
						<div class="plant growing-plant">
							<div class="grow-top">
								<div class="g-leaf g-leaf-l"></div>
								<div class="g-bud"></div>
								<div class="g-leaf g-leaf-r"></div>
							</div>
							<div class="grow-stem"></div>
							<div class="g-leaf g-leaf-low"></div>
							<div class="soil-bed">
								<div class="soil-top"></div>
								<div class="soil-front"></div>
							</div>
						</div>
					{:else if stage.key === 'blooming'}
						<div class="plant bloom-plant">
							<div class="flower">
								<div class="petal p1"></div>
								<div class="petal p2"></div>
								<div class="petal p3"></div>
								<div class="petal p4"></div>
								<div class="petal p5"></div>
								<div class="petal-inner"></div>
								<div class="pistil"></div>
							</div>
							<div class="bloom-stem"></div>
							<div class="b-leaf b-leaf-l"></div>
							<div class="b-leaf b-leaf-r"></div>
							<div class="soil-bed">
								<div class="soil-top"></div>
								<div class="soil-front"></div>
							</div>
						</div>
					{:else if stage.key === 'mature'}
						<div class="plant mature-plant">
							<div class="canopy">
								<div class="canopy-layer c-shadow"></div>
								<div class="canopy-layer c-back"></div>
								<div class="canopy-layer c-mid"></div>
								<div class="canopy-layer c-front"></div>
							</div>
							<div class="trunk">
								<div class="trunk-body"></div>
								<div class="trunk-shadow"></div>
							</div>
							<div class="soil-bed soil-bed-wide">
								<div class="soil-top"></div>
								<div class="soil-front"></div>
							</div>
						</div>
					{:else if stage.key === 'wilting'}
						<div class="plant wilt-plant">
							<div class="wilt-head">
								<div class="w-leaf w-leaf-l"></div>
								<div class="w-bud"></div>
							</div>
							<div class="wilt-stem"></div>
							<div class="soil-bed soil-bed-dry">
								<div class="soil-top"></div>
								<div class="soil-front"></div>
							</div>
						</div>
					{/if}
				</div>
				<div class="text-center">
					<div class="text-xs font-semibold text-white">{stage.label}</div>
					<div class="text-[10px] text-slate-500">{stage.desc}</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Full Garden Mockup -->
	<h2 class="text-lg font-semibold text-white mb-4">Garden View</h2>
	<div class="garden-bed">
		<div class="garden-ground"></div>
		<div class="garden-row">
			<div class="garden-spot">
				<div class="plant bloom-plant">
					<div class="flower">
						<div class="petal p1"></div>
						<div class="petal p2"></div>
						<div class="petal p3"></div>
						<div class="petal p4"></div>
						<div class="petal p5"></div>
						<div class="petal-inner"></div>
						<div class="pistil"></div>
					</div>
					<div class="bloom-stem"></div>
					<div class="b-leaf b-leaf-l"></div>
					<div class="b-leaf b-leaf-r"></div>
					<div class="soil-bed">
						<div class="soil-top"></div>
						<div class="soil-front"></div>
					</div>
				</div>
				<div class="spot-label">
					<span class="spot-name">Morning Routine</span>
					<span class="spot-streak">🔥 7 days</span>
				</div>
			</div>
			<div class="garden-spot">
				<div class="plant growing-plant">
					<div class="grow-top">
						<div class="g-leaf g-leaf-l"></div>
						<div class="g-bud"></div>
						<div class="g-leaf g-leaf-r"></div>
					</div>
					<div class="grow-stem"></div>
					<div class="g-leaf g-leaf-low"></div>
					<div class="soil-bed">
						<div class="soil-top"></div>
						<div class="soil-front"></div>
					</div>
				</div>
				<div class="spot-label">
					<span class="spot-name">Wind Down</span>
					<span class="spot-streak">🔥 3 days</span>
				</div>
			</div>
			<div class="garden-spot">
				<div class="plant seed-plant">
					<div class="seed-body"></div>
					<div class="soil-bed">
						<div class="soil-top"></div>
						<div class="soil-front"></div>
					</div>
				</div>
				<div class="spot-label">
					<span class="spot-name">Focus</span>
					<span class="spot-streak text-slate-500">New</span>
				</div>
			</div>
		</div>
		<div class="garden-row">
			<div class="garden-spot">
				<div class="plant mature-plant">
					<div class="canopy">
						<div class="canopy-layer c-shadow"></div>
						<div class="canopy-layer c-back"></div>
						<div class="canopy-layer c-mid"></div>
						<div class="canopy-layer c-front"></div>
					</div>
					<div class="trunk">
						<div class="trunk-body"></div>
						<div class="trunk-shadow"></div>
					</div>
					<div class="soil-bed soil-bed-wide">
						<div class="soil-top"></div>
						<div class="soil-front"></div>
					</div>
				</div>
				<div class="spot-label">
					<span class="spot-name">Fitness</span>
					<span class="spot-streak">🔥 21 days</span>
				</div>
			</div>
			<div class="garden-spot wilt-spot">
				<div class="plant wilt-plant">
					<div class="wilt-head">
						<div class="w-leaf w-leaf-l"></div>
						<div class="w-bud"></div>
					</div>
					<div class="wilt-stem"></div>
					<div class="soil-bed soil-bed-dry">
						<div class="soil-top"></div>
						<div class="soil-front"></div>
					</div>
				</div>
				<div class="spot-label">
					<span class="spot-name text-amber-400">Reading</span>
					<span class="spot-streak text-amber-400">⚠ At risk</span>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* ===== SHARED: 3D Soil Bed ===== */
	.soil-bed {
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 48px;
		height: 18px;
	}
	.soil-bed-wide {
		width: 56px;
	}
	.soil-top {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 10px;
		background: linear-gradient(180deg, #6b4423 0%, #5c3d1e 100%);
		border-radius: 50%;
		box-shadow: 0 -2px 4px rgba(107, 68, 35, 0.3);
	}
	.soil-front {
		position: absolute;
		bottom: 0;
		left: 3px;
		width: calc(100% - 6px);
		height: 12px;
		background: linear-gradient(180deg, #5c3d1e 0%, #3d2810 100%);
		border-radius: 0 0 40% 40%;
		box-shadow: 0 3px 6px rgba(0,0,0,0.4);
	}
	.soil-bed-dry .soil-top {
		background: linear-gradient(180deg, #8B7355 0%, #6b5a3e 100%);
	}
	.soil-bed-dry .soil-front {
		background: linear-gradient(180deg, #6b5a3e 0%, #4a3d28 100%);
	}

	/* ===== PLANT CONTAINER ===== */
	.plant-slot {
		width: 90px;
		height: 110px;
		position: relative;
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}
	.plant {
		position: relative;
		width: 90px;
		height: 100%;
	}

	/* ===== SEED ===== */
	.seed-plant .seed-body {
		position: absolute;
		bottom: 12px;
		left: 50%;
		transform: translateX(-50%);
		width: 12px;
		height: 10px;
		background: radial-gradient(ellipse at 40% 35%, #c9a54e, #8B6914);
		border-radius: 50%;
		box-shadow: 0 2px 4px rgba(0,0,0,0.3), inset 0 -2px 3px rgba(0,0,0,0.2);
	}

	/* ===== SPROUT ===== */
	.sprout-plant .sprout-stem {
		position: absolute;
		bottom: 16px;
		left: 50%;
		transform: translateX(-50%);
		width: 3px;
		height: 28px;
		background: linear-gradient(90deg, #2d8a3e, #4ade80, #2d8a3e);
		border-radius: 2px;
		box-shadow: 1px 0 2px rgba(0,0,0,0.15);
	}
	.sprout-plant .sprout-leaves {
		position: absolute;
		bottom: 40px;
		left: 50%;
		transform: translateX(-50%);
	}
	.s-leaf {
		display: inline-block;
		width: 14px;
		height: 10px;
		border-radius: 0 75% 0 75%;
	}
	.s-leaf-l {
		background: linear-gradient(135deg, #4ade80 40%, #22c55e 100%);
		box-shadow: -1px 1px 3px rgba(0,0,0,0.15);
		transform: rotate(-20deg);
		border-radius: 75% 0 75% 0;
	}
	.s-leaf-r {
		background: linear-gradient(225deg, #4ade80 40%, #22c55e 100%);
		box-shadow: 1px 1px 3px rgba(0,0,0,0.15);
		transform: rotate(20deg);
	}

	/* ===== GROWING ===== */
	.growing-plant .grow-stem {
		position: absolute;
		bottom: 16px;
		left: 50%;
		transform: translateX(-50%);
		width: 4px;
		height: 45px;
		background: linear-gradient(90deg, #22883a, #4ade80, #22883a);
		border-radius: 2px;
		box-shadow: 1px 0 3px rgba(0,0,0,0.15);
	}
	.growing-plant .grow-top {
		position: absolute;
		bottom: 56px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
	}
	.g-leaf {
		display: block;
		width: 16px;
		height: 11px;
	}
	.g-leaf-l {
		background: linear-gradient(135deg, #4ade80 30%, #22c55e 100%);
		border-radius: 0 70% 0 70%;
		transform: rotate(-25deg);
		box-shadow: -1px 2px 4px rgba(0,0,0,0.15);
	}
	.g-leaf-r {
		background: linear-gradient(225deg, #4ade80 30%, #22c55e 100%);
		border-radius: 70% 0 70% 0;
		transform: rotate(25deg);
		box-shadow: 1px 2px 4px rgba(0,0,0,0.15);
	}
	.g-bud {
		width: 10px;
		height: 10px;
		background: radial-gradient(circle at 40% 35%, #f9a8d4, #ec4899);
		border-radius: 50%;
		box-shadow: 0 2px 4px rgba(236, 72, 153, 0.3);
		margin: 0 2px;
	}
	.g-leaf-low {
		position: absolute;
		bottom: 36px;
		left: 22px;
		width: 13px;
		height: 9px;
		background: linear-gradient(135deg, #4ade80 30%, #22c55e 100%);
		border-radius: 0 70% 0 70%;
		transform: rotate(-40deg);
		box-shadow: -1px 1px 3px rgba(0,0,0,0.12);
	}

	/* ===== BLOOMING ===== */
	.bloom-plant .bloom-stem {
		position: absolute;
		bottom: 16px;
		left: 50%;
		transform: translateX(-50%);
		width: 4px;
		height: 44px;
		background: linear-gradient(90deg, #1a7a32, #4ade80, #1a7a32);
		border-radius: 2px;
		box-shadow: 1px 0 3px rgba(0,0,0,0.15);
	}
	.bloom-plant .flower {
		position: absolute;
		bottom: 56px;
		left: 50%;
		transform: translateX(-50%);
		width: 32px;
		height: 32px;
	}
	.petal {
		position: absolute;
		width: 13px;
		height: 13px;
		border-radius: 50%;
		background: linear-gradient(135deg, #f9a8d4 20%, #ec4899 100%);
		box-shadow: 0 2px 4px rgba(236, 72, 153, 0.25);
	}
	.p1 { top: 0; left: 9px; }
	.p2 { top: 10px; right: 0; }
	.p3 { bottom: 0; left: 9px; }
	.p4 { top: 10px; left: 0; }
	.p5 { top: 4px; left: 4px; width: 22px; height: 22px; background: linear-gradient(135deg, #f472b6, #db2777); opacity: 0.6; }
	.pistil {
		position: absolute;
		top: 9px;
		left: 9px;
		width: 14px;
		height: 14px;
		background: radial-gradient(circle at 40% 35%, #fde68a, #f59e0b);
		border-radius: 50%;
		box-shadow: 0 1px 3px rgba(0,0,0,0.2);
		z-index: 2;
	}
	.b-leaf {
		position: absolute;
		width: 16px;
		height: 10px;
	}
	.b-leaf-l {
		bottom: 34px;
		left: 20px;
		background: linear-gradient(135deg, #4ade80 30%, #16a34a 100%);
		border-radius: 0 70% 0 70%;
		transform: rotate(-40deg);
		box-shadow: -1px 2px 4px rgba(0,0,0,0.15);
	}
	.b-leaf-r {
		bottom: 34px;
		right: 20px;
		background: linear-gradient(225deg, #4ade80 30%, #16a34a 100%);
		border-radius: 70% 0 70% 0;
		transform: rotate(40deg);
		box-shadow: 1px 2px 4px rgba(0,0,0,0.15);
	}

	/* ===== MATURE (Tree) ===== */
	.mature-plant .trunk {
		position: absolute;
		bottom: 16px;
		left: 50%;
		transform: translateX(-50%);
		width: 10px;
		height: 32px;
	}
	.trunk-body {
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, #6b3a1f, #92400e, #6b3a1f);
		border-radius: 2px 2px 4px 4px;
	}
	.trunk-shadow {
		position: absolute;
		right: -4px;
		top: 0;
		width: 4px;
		height: 100%;
		background: linear-gradient(90deg, rgba(0,0,0,0.2), transparent);
		border-radius: 0 2px 2px 0;
	}
	.mature-plant .canopy {
		position: absolute;
		bottom: 44px;
		left: 50%;
		transform: translateX(-50%);
		width: 56px;
		height: 48px;
	}
	.canopy-layer {
		position: absolute;
		border-radius: 50%;
	}
	.c-shadow {
		width: 34px;
		height: 32px;
		top: 4px;
		left: 11px;
		background: #14532d;
		z-index: 0;
	}
	.c-back {
		width: 30px;
		height: 28px;
		top: 2px;
		left: 2px;
		background: linear-gradient(135deg, #15803d 30%, #166534 100%);
		z-index: 1;
		box-shadow: -2px 2px 4px rgba(0,0,0,0.2);
	}
	.c-mid {
		width: 34px;
		height: 30px;
		top: 0;
		left: 11px;
		background: linear-gradient(135deg, #22c55e 20%, #16a34a 100%);
		z-index: 2;
		box-shadow: 0 2px 4px rgba(0,0,0,0.15);
	}
	.c-front {
		width: 28px;
		height: 24px;
		top: 6px;
		left: 26px;
		background: linear-gradient(135deg, #4ade80 20%, #22c55e 100%);
		z-index: 3;
		box-shadow: 2px 1px 3px rgba(0,0,0,0.1);
	}

	/* ===== WILTING ===== */
	.wilt-plant .wilt-stem {
		position: absolute;
		bottom: 16px;
		left: 50%;
		transform: translateX(-50%) rotate(18deg);
		transform-origin: bottom center;
		width: 3px;
		height: 38px;
		background: linear-gradient(90deg, #8B7355, #a3a03a, #8B7355);
		border-radius: 2px;
	}
	.wilt-plant .wilt-head {
		position: absolute;
		bottom: 50px;
		left: 56%;
		transform: rotate(22deg);
		display: flex;
		align-items: center;
	}
	.w-leaf {
		width: 12px;
		height: 8px;
		background: linear-gradient(135deg, #a3a03a, #8B7355);
		border-radius: 0 60% 0 60%;
		box-shadow: -1px 1px 2px rgba(0,0,0,0.1);
	}
	.w-leaf-l {
		transform: rotate(-15deg);
	}
	.w-bud {
		width: 8px;
		height: 8px;
		background: radial-gradient(circle at 40% 35%, #92702a, #6b5a3e);
		border-radius: 50%;
		margin-left: 2px;
		box-shadow: 0 1px 2px rgba(0,0,0,0.2);
	}

	/* ===== GARDEN BED ===== */
	.garden-bed {
		background:
			radial-gradient(ellipse at 50% 100%, #2d1f0e 0%, transparent 60%),
			linear-gradient(180deg, #1a2e1a 0%, #0f1f0f 100%);
		border: 1px solid #2d4a2d;
		border-radius: 16px;
		padding: 24px 16px 20px;
		position: relative;
		overflow: hidden;
		box-shadow: inset 0 -20px 30px rgba(45,31,14,0.3), 0 4px 12px rgba(0,0,0,0.3);
	}
	.garden-ground {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 30%;
		background: linear-gradient(to top, rgba(45,31,14,0.4), transparent);
		pointer-events: none;
	}
	.garden-row {
		display: flex;
		justify-content: space-around;
		gap: 8px;
		margin-bottom: 20px;
		position: relative;
		z-index: 1;
	}
	.garden-row:last-child {
		margin-bottom: 0;
	}
	.garden-spot {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		flex: 1;
		cursor: pointer;
		transition: transform 0.2s;
	}
	.garden-spot:active {
		transform: scale(0.95);
	}
	.spot-label {
		text-align: center;
	}
	.spot-name {
		display: block;
		font-size: 12px;
		font-weight: 600;
		color: #e2e8f0;
	}
	.spot-streak {
		display: block;
		font-size: 10px;
		color: #94a3b8;
	}
	.wilt-spot .spot-name {
		color: #f59e0b;
	}
	.wilt-spot .spot-streak {
		color: #f59e0b;
	}
</style>