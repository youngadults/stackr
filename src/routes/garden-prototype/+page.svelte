<script lang="ts">
	// Garden prototype — Ghibli-inspired watercolor style
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
	<title>Garden — Ghibli Style</title>
</svelte:head>

<div class="scene">
	<div class="scene-content">
		<h1 class="title">Garden</h1>
		<p class="subtitle">Studio Ghibli-inspired plants</p>

		<!-- Stage Reference -->
		<div class="stages-grid">
			{#each STAGES as stage}
				<div class="stage-card">
					<div class="plant-stage {stage.key}">
						{#if stage.key === 'seed'}
							<div class="ghibli-soil">
								<div class="soil-highlight"></div>
							</div>
							<div class="seed-grain"></div>
						{:else if stage.key === 'sprout'}
							<div class="sprout-stem-ghibli"></div>
							<div class="sprout-leaf-pair">
								<div class="ghibli-leaf leaf-l"></div>
								<div class="ghibli-leaf leaf-r"></div>
							</div>
							<div class="ghibli-soil">
								<div class="soil-highlight"></div>
							</div>
						{:else if stage.key === 'growing'}
							<div class="grow-stem-ghibli"></div>
							<div class="grow-leaf-pair-top">
								<div class="ghibli-leaf-md leaf-l"></div>
								<div class="ghibli-bud-ghibli"></div>
								<div class="ghibli-leaf-md leaf-r"></div>
							</div>
							<div class="ghibli-leaf-sm leaf-low"></div>
							<div class="ghibli-soil">
								<div class="soil-highlight"></div>
							</div>
						{:else if stage.key === 'blooming'}
							<div class="bloom-stem-ghibli"></div>
							<div class="bloom-leaf-l ghibli-leaf-lg"></div>
							<div class="bloom-leaf-r ghibli-leaf-lg"></div>
							<div class="ghibli-flower">
								<div class="petal-gh p1"></div>
								<div class="petal-gh p2"></div>
								<div class="petal-gh p3"></div>
								<div class="petal-gh p4"></div>
								<div class="petal-gh p5"></div>
								<div class="petal-gh p6"></div>
								<div class="flower-glow"></div>
								<div class="pistil-gh"></div>
							</div>
							<div class="ghibli-soil">
								<div class="soil-highlight"></div>
							</div>
						{:else if stage.key === 'mature'}
							<div class="tree-trunk-ghibli"></div>
							<div class="tree-canopy-ghibli">
								<div class="canopy-blob cb1"></div>
								<div class="canopy-blob cb2"></div>
								<div class="canopy-blob cb3"></div>
								<div class="canopy-blob cb4"></div>
								<div class="canopy-blob cb5"></div>
								<div class="canopy-highlight"></div>
							</div>
							<div class="ghibli-soil soil-wide">
								<div class="soil-highlight"></div>
							</div>
						{:else if stage.key === 'wilting'}
							<div class="wilt-stem-ghibli"></div>
							<div class="wilt-head-ghibli">
								<div class="wilt-leaf-gh"></div>
								<div class="wilt-bud-gh"></div>
							</div>
							<div class="ghibli-soil soil-dry">
								<div class="soil-highlight soil-highlight-dry"></div>
							</div>
						{/if}
					</div>
					<div class="stage-label">{stage.label}</div>
					<div class="stage-desc">{stage.desc}</div>
				</div>
			{/each}
		</div>

		<!-- Full Garden Mockup -->
		<h2 class="section-title">Your Garden</h2>
		<div class="garden-bed-ghibli">
			<div class="garden-grass"></div>
			<div class="garden-plots">
				<div class="garden-plot">
					<div class="plant-stage blooming">
						<div class="bloom-stem-ghibli"></div>
						<div class="bloom-leaf-l ghibli-leaf-lg"></div>
						<div class="bloom-leaf-r ghibli-leaf-lg"></div>
						<div class="ghibli-flower">
							<div class="petal-gh p1"></div>
							<div class="petal-gh p2"></div>
							<div class="petal-gh p3"></div>
							<div class="petal-gh p4"></div>
							<div class="petal-gh p5"></div>
							<div class="petal-gh p6"></div>
							<div class="flower-glow"></div>
							<div class="pistil-gh"></div>
						</div>
						<div class="ghibli-soil"><div class="soil-highlight"></div></div>
					</div>
					<span class="plot-name">Morning Routine</span>
					<span class="plot-streak">🔥 7 days</span>
				</div>
				<div class="garden-plot">
					<div class="plant-stage growing">
						<div class="grow-stem-ghibli"></div>
						<div class="grow-leaf-pair-top">
							<div class="ghibli-leaf-md leaf-l"></div>
							<div class="ghibli-bud-ghibli"></div>
							<div class="ghibli-leaf-md leaf-r"></div>
						</div>
						<div class="ghibli-leaf-sm leaf-low"></div>
						<div class="ghibli-soil"><div class="soil-highlight"></div></div>
					</div>
					<span class="plot-name">Wind Down</span>
					<span class="plot-streak">🔥 3 days</span>
				</div>
				<div class="garden-plot">
					<div class="plant-stage seed">
						<div class="ghibli-soil"><div class="soil-highlight"></div></div>
						<div class="seed-grain"></div>
					</div>
					<span class="plot-name">Focus</span>
					<span class="plot-streak plot-new">New</span>
				</div>
			</div>
			<div class="garden-plots">
				<div class="garden-plot">
					<div class="plant-stage mature">
						<div class="tree-trunk-ghibli"></div>
						<div class="tree-canopy-ghibli">
							<div class="canopy-blob cb1"></div>
							<div class="canopy-blob cb2"></div>
							<div class="canopy-blob cb3"></div>
							<div class="canopy-blob cb4"></div>
							<div class="canopy-blob cb5"></div>
							<div class="canopy-highlight"></div>
						</div>
						<div class="ghibli-soil soil-wide"><div class="soil-highlight"></div></div>
					</div>
					<span class="plot-name">Fitness</span>
					<span class="plot-streak">🔥 21 days</span>
				</div>
				<div class="garden-plot wilt-plot">
					<div class="plant-stage wilting">
						<div class="wilt-stem-ghibli"></div>
						<div class="wilt-head-ghibli">
							<div class="wilt-leaf-gh"></div>
							<div class="wilt-bud-gh"></div>
						</div>
						<div class="ghibli-soil soil-dry"><div class="soil-highlight soil-highlight-dry"></div></div>
					</div>
					<span class="plot-name plot-name-wilt">Reading</span>
					<span class="plot-streak plot-streak-wilt">⚠ At risk</span>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* === Ghibli Color Palette === */
	:root {
		--gh-soil: #6b4423;
		--gh-soil-light: #8b6341;
		--gh-soil-highlight: #a87d52;
		--gh-stem: #4a9e5c;
		--gh-leaf: #5cb870;
		--gh-leaf-light: #8dd89a;
		--gh-leaf-dark: #2d7a3e;
		--gh-petal: #f4a0c0;
		--gh-petal-light: #f8c8d8;
		--gh-petal-dark: #d4608a;
		--gh-pistil: #ffd966;
		--gh-pistil-light: #ffec99;
		--gh-trunk: #7a4a2a;
		--gh-trunk-light: #9a6a42;
		--gh-canopy: #3da052;
		--gh-canopy-light: #6dcc7e;
		--gh-canopy-dark: #1e6e32;
		--gh-wilt-leaf: #a89840;
		--gh-wilt-stem: #8a7a3a;
		--gh-wilt-bud: #8b6914;
		--gh-dry-soil: #8a7355;
		--gh-bg: #0d1a0d;
		--gh-bed: #142814;
	}

	/* === Scene === */
	.scene {
		min-height: 100vh;
		background: linear-gradient(180deg, #0a1a2e 0%, #0d2818 30%, var(--gh-bg) 100%);
		padding: 2rem 1rem;
	}
	.scene-content {
		max-width: 28rem;
		margin: 0 auto;
	}
	.title {
		font-size: 1.5rem;
		font-weight: 700;
		color: #e8e4d8;
		margin-bottom: 0.25rem;
	}
	.subtitle {
		font-size: 0.75rem;
		color: #7a8a6a;
		margin-bottom: 2rem;
	}
	.section-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: #e8e4d8;
		margin-bottom: 1rem;
	}

	/* === Stages Grid === */
	.stages-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		margin-bottom: 2.5rem;
	}
	.stage-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.375rem;
	}
	.stage-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: #e8e4d8;
	}
	.stage-desc {
		font-size: 0.625rem;
		color: #7a8a6a;
	}

	/* === Plant Stage Container === */
	.plant-stage {
		position: relative;
		width: 90px;
		height: 110px;
	}

	/* === Ghibli Soil (Raised Mound) === */
	.ghibli-soil {
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 50px;
		height: 18px;
	}
	.soil-wide {
		width: 60px;
	}
	.soil-dry {
		--gh-soil: var(--gh-dry-soil);
		--gh-soil-light: #9a8a6a;
		--gh-soil-highlight: #b09a7a;
	}
	.ghibli-soil::before {
		content: '';
		position: absolute;
		bottom: 0;
		left: 2px;
		right: 2px;
		height: 12px;
		background: linear-gradient(180deg, var(--gh-soil-light), var(--gh-soil));
		border-radius: 0 0 45% 45%;
		box-shadow: 0 3px 8px rgba(0,0,0,0.4);
	}
	.soil-highlight {
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 80%;
		height: 10px;
		background: linear-gradient(180deg, var(--gh-soil-highlight), var(--gh-soil-light));
		border-radius: 50%;
		box-shadow: 0 -1px 4px rgba(168,125,82,0.3);
	}
	.soil-highlight-dry {
		background: linear-gradient(180deg, #b09a7a, #9a8a6a);
	}

	/* === Seed === */
	.seed-grain {
		position: absolute;
		bottom: 14px;
		left: 50%;
		transform: translateX(-50%);
		width: 12px;
		height: 10px;
		background: radial-gradient(ellipse at 35% 30%, #d4a843, #8B6914);
		border-radius: 50%;
		box-shadow: 0 1px 3px rgba(0,0,0,0.3), inset 0 -2px 4px rgba(0,0,0,0.15);
	}

	/* === Sprout === */
	.sprout-stem-ghibli {
		position: absolute;
		bottom: 16px;
		left: 50%;
		transform: translateX(-50%);
		width: 3px;
		height: 26px;
		background: linear-gradient(90deg, var(--gh-leaf-dark), var(--gh-stem), var(--gh-leaf-dark));
		border-radius: 2px;
	}
	.sprout-leaf-pair {
		position: absolute;
		bottom: 38px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
	}
	.ghibli-leaf {
		width: 14px;
		height: 10px;
		border-radius: 0 70% 0 70%;
		background: radial-gradient(ellipse at 30% 40%, var(--gh-leaf-light), var(--gh-leaf), var(--gh-leaf-dark));
		box-shadow: 0 1px 3px rgba(0,0,0,0.15);
	}
	.leaf-l {
		border-radius: 70% 0 70% 0;
		transform: rotate(-18deg);
	}
	.leaf-r {
		border-radius: 0 70% 0 70%;
		transform: rotate(18deg);
	}

	/* === Growing === */
	.grow-stem-ghibli {
		position: absolute;
		bottom: 16px;
		left: 50%;
		transform: translateX(-50%);
		width: 4px;
		height: 42px;
		background: linear-gradient(90deg, var(--gh-leaf-dark), var(--gh-stem), var(--gh-leaf-dark));
		border-radius: 2px;
	}
	.grow-leaf-pair-top {
		position: absolute;
		bottom: 54px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
	}
	.ghibli-leaf-md {
		width: 16px;
		height: 12px;
		background: radial-gradient(ellipse at 30% 40%, var(--gh-leaf-light), var(--gh-leaf), var(--gh-leaf-dark));
		box-shadow: 0 1px 3px rgba(0,0,0,0.15);
	}
	.ghibli-bud-ghibli {
		width: 10px;
		height: 10px;
		background: radial-gradient(circle at 40% 35%, var(--gh-petal-light), var(--gh-petal), var(--gh-petal-dark));
		border-radius: 50%;
		box-shadow: 0 1px 4px rgba(244,160,192,0.3);
		margin: 0 1px;
	}
	.ghibli-leaf-sm {
		width: 12px;
		height: 8px;
		background: radial-gradient(ellipse at 30% 40%, var(--gh-leaf-light), var(--gh-leaf), var(--gh-leaf-dark));
		box-shadow: 0 1px 2px rgba(0,0,0,0.1);
	}
	.leaf-low {
		position: absolute;
		bottom: 36px;
		left: 22px;
		border-radius: 70% 0 70% 0;
		transform: rotate(-40deg);
	}

	/* === Blooming === */
	.bloom-stem-ghibli {
		position: absolute;
		bottom: 16px;
		left: 50%;
		transform: translateX(-50%);
		width: 4px;
		height: 40px;
		background: linear-gradient(90deg, var(--gh-leaf-dark), var(--gh-stem), var(--gh-leaf-dark));
		border-radius: 2px;
	}
	.bloom-leaf-l {
		position: absolute;
		bottom: 32px;
		left: 18px;
		transform: rotate(-40deg);
	}
	.bloom-leaf-r {
		position: absolute;
		bottom: 32px;
		right: 18px;
		border-radius: 0 70% 0 70%;
		transform: rotate(40deg);
	}
	.ghibli-leaf-lg {
		width: 18px;
		height: 12px;
		border-radius: 70% 0 70% 0;
		background: radial-gradient(ellipse at 30% 40%, var(--gh-leaf-light), var(--gh-leaf), var(--gh-leaf-dark));
		box-shadow: 0 1px 3px rgba(0,0,0,0.15);
	}
	.ghibli-flower {
		position: absolute;
		bottom: 52px;
		left: 50%;
		transform: translateX(-50%);
		width: 34px;
		height: 34px;
	}
	.petal-gh {
		position: absolute;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: radial-gradient(circle at 35% 30%, var(--gh-petal-light), var(--gh-petal));
		box-shadow: 0 1px 3px rgba(0,0,0,0.12);
	}
	.p1 { top: 0; left: 10px; }
	.p2 { top: 8px; right: 0; background: radial-gradient(circle at 60% 30%, var(--gh-petal-light), var(--gh-petal)); }
	.p3 { bottom: 2px; left: 4px; background: radial-gradient(circle at 35% 60%, var(--gh-petal), var(--gh-petal-dark)); }
	.p4 { top: 8px; left: 0; background: radial-gradient(circle at 40% 50%, var(--gh-petal-light), var(--gh-petal)); }
	.p5 { top: 2px; left: 18px; background: radial-gradient(circle at 50% 40%, var(--gh-petal), var(--gh-petal-dark)); }
	.p6 { bottom: 2px; right: 6px; background: radial-gradient(circle at 55% 55%, var(--gh-petal), var(--gh-petal-dark)); }
	.flower-glow {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 26px;
		height: 26px;
		background: radial-gradient(circle, rgba(244,160,192,0.3) 0%, transparent 70%);
		border-radius: 50%;
		z-index: 1;
	}
	.pistil-gh {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 12px;
		height: 12px;
		background: radial-gradient(circle at 40% 35%, var(--gh-pistil-light), var(--gh-pistil), #e6a800);
		border-radius: 50%;
		box-shadow: 0 0 6px rgba(255,217,102,0.4);
		z-index: 2;
	}

	/* === Mature (Tree) === */
	.tree-trunk-ghibli {
		position: absolute;
		bottom: 16px;
		left: 50%;
		transform: translateX(-50%);
		width: 10px;
		height: 30px;
		background: linear-gradient(90deg, var(--gh-trunk), var(--gh-trunk-light), var(--gh-trunk));
		border-radius: 3px 3px 5px 5px;
		box-shadow: 2px 0 4px rgba(0,0,0,0.2);
	}
	.tree-canopy-ghibli {
		position: absolute;
		bottom: 42px;
		left: 50%;
		transform: translateX(-50%);
		width: 64px;
		height: 52px;
	}
	.canopy-blob {
		position: absolute;
		border-radius: 50%;
	}
	.cb1 {
		width: 36px; height: 32px;
		top: 0; left: 14px;
		background: radial-gradient(ellipse at 40% 35%, var(--gh-canopy-light), var(--gh-canopy));
		box-shadow: 0 4px 8px rgba(0,0,0,0.2);
		z-index: 3;
	}
	.cb2 {
		width: 30px; height: 28px;
		top: 10px; left: 0;
		background: radial-gradient(ellipse at 50% 40%, var(--gh-canopy), var(--gh-canopy-dark));
		box-shadow: -2px 2px 4px rgba(0,0,0,0.15);
		z-index: 2;
	}
	.cb3 {
		width: 30px; height: 26px;
		top: 8px; right: 0; left: 34px;
		background: radial-gradient(ellipse at 35% 40%, var(--gh-canopy-light), var(--gh-canopy));
		box-shadow: 2px 2px 4px rgba(0,0,0,0.15);
		z-index: 2;
	}
	.cb4 {
		width: 24px; height: 22px;
		top: 20px; left: 6px;
		background: radial-gradient(ellipse at 45% 35%, var(--gh-canopy), var(--gh-canopy-dark));
		z-index: 1;
	}
	.cb5 {
		width: 26px; height: 24px;
		top: 18px; left: 28px;
		background: radial-gradient(ellipse at 40% 40%, var(--gh-canopy), var(--gh-canopy-dark));
		z-index: 1;
	}
	.canopy-highlight {
		position: absolute;
		top: 6px;
		left: 18px;
		width: 20px;
		height: 14px;
		background: radial-gradient(ellipse at 50% 50%, rgba(141,216,154,0.4), transparent);
		border-radius: 50%;
		z-index: 4;
	}

	/* === Wilting === */
	.wilt-stem-ghibli {
		position: absolute;
		bottom: 16px;
		left: 50%;
		transform: translateX(-50%) rotate(16deg);
		transform-origin: bottom center;
		width: 3px;
		height: 36px;
		background: linear-gradient(90deg, #6b5a2e, var(--gh-wilt-stem), #6b5a2e);
		border-radius: 2px;
	}
	.wilt-head-ghibli {
		position: absolute;
		bottom: 48px;
		left: 56%;
		transform: rotate(20deg);
		display: flex;
		align-items: center;
	}
	.wilt-leaf-gh {
		width: 13px;
		height: 9px;
		background: radial-gradient(ellipse at 30% 40%, #c4b44a, var(--gh-wilt-leaf));
		border-radius: 70% 0 70% 0;
		transform: rotate(-12deg);
		box-shadow: 0 1px 2px rgba(0,0,0,0.1);
	}
	.wilt-bud-gh {
		width: 8px;
		height: 8px;
		background: radial-gradient(circle at 40% 35%, #b08a2a, var(--gh-wilt-bud));
		border-radius: 50%;
		margin-left: 2px;
		box-shadow: 0 1px 2px rgba(0,0,0,0.15);
	}

	/* === Garden Bed === */
	.garden-bed-ghibli {
		background:
			radial-gradient(ellipse at 50% 110%, rgba(74,50,20,0.6) 0%, transparent 60%),
			linear-gradient(180deg, #142814 0%, #0d1a0d 100%);
		border: 1px solid #2a4a2a;
		border-radius: 20px;
		padding: 28px 16px 24px;
		position: relative;
		overflow: hidden;
		box-shadow: inset 0 -24px 36px rgba(45,31,14,0.25), 0 6px 16px rgba(0,0,0,0.3);
	}
	.garden-grass {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 40%;
		background: linear-gradient(to top, rgba(30,80,40,0.15), transparent);
		pointer-events: none;
	}
	.garden-plots {
		display: flex;
		justify-content: space-around;
		gap: 8px;
		margin-bottom: 20px;
		position: relative;
		z-index: 1;
	}
	.garden-plots:last-child {
		margin-bottom: 0;
	}
	.garden-plot {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		flex: 1;
		cursor: pointer;
		transition: transform 0.2s;
	}
	.garden-plot:active {
		transform: scale(0.95);
	}
	.plot-name {
		font-size: 0.75rem;
		font-weight: 600;
		color: #e8e4d8;
		text-align: center;
	}
	.plot-streak {
		font-size: 0.625rem;
		color: #7a9a6a;
		text-align: center;
	}
	.plot-new {
		color: #5a7a4a;
	}
	.plot-name-wilt {
		color: #d4a040;
	}
	.plot-streak-wilt {
		color: #d4a040;
	}
	.wilt-plot .plant-stage {
		opacity: 0.85;
	}
</style>