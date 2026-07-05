<script lang="ts">
	// Garden prototype — Isometric Stardew v5
	// Plants tilted to match 30° garden bed perspective
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
	<title>Garden — Isometric Pixel</title>
</svelte:head>

<div class="scene">
	<div class="sky-layer"></div>
	<div class="clouds">
		<div class="cloud cloud-1"></div>
		<div class="cloud cloud-2"></div>
		<div class="cloud cloud-3"></div>
	</div>

	<div class="content">
		<h1 class="title">Garden</h1>
		<p class="subtitle">Stardew Valley-inspired pixel plants</p>

		<!-- Shared SVG defs -->
		<svg style="position:absolute;width:0;height:0;">
			<defs>
				<linearGradient id="soilTop" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="#9a7340"/>
					<stop offset="100%" stop-color="#6b4423"/>
				</linearGradient>
				<linearGradient id="soilFront" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="#6b4423"/>
					<stop offset="100%" stop-color="#3d2810"/>
				</linearGradient>
				<linearGradient id="soilSide" x1="0" y1="0" x2="1" y2="0">
					<stop offset="0%" stop-color="#5a3818"/>
					<stop offset="100%" stop-color="#4a2810"/>
				</linearGradient>
				<linearGradient id="drySoilTop" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="#a89070"/>
					<stop offset="100%" stop-color="#8a7355"/>
				</linearGradient>
				<linearGradient id="drySoilFront" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="#8a7355"/>
					<stop offset="100%" stop-color="#5a4a32"/>
				</linearGradient>
				<linearGradient id="stemG" x1="0" y1="0" x2="1" y2="0">
					<stop offset="0%" stop-color="#2d8a3e"/>
					<stop offset="40%" stop-color="#5cb870"/>
					<stop offset="100%" stop-color="#2d8a3e"/>
				</linearGradient>
				<linearGradient id="trunkG" x1="0" y1="0" x2="1" y2="0">
					<stop offset="0%" stop-color="#5a3010"/>
					<stop offset="40%" stop-color="#9a6a42"/>
					<stop offset="100%" stop-color="#5a3010"/>
				</linearGradient>
				<radialGradient id="petalG">
					<stop offset="0%" stop-color="#f8c8d8"/>
					<stop offset="80%" stop-color="#e8609a"/>
					<stop offset="100%" stop-color="#c84080"/>
				</radialGradient>
				<radialGradient id="pistilG">
					<stop offset="0%" stop-color="#ffec99"/>
					<stop offset="100%" stop-color="#d4960a"/>
				</radialGradient>
				<radialGradient id="flowerGlow">
					<stop offset="0%" stop-color="rgba(244,160,192,0.35)"/>
					<stop offset="100%" stop-color="transparent"/>
				</radialGradient>
			</defs>
		</svg>

		<!-- Stage Reference -->
		<div class="stages-grid">
			{#each STAGES as stage}
				<div class="stage-card">
					<div class="stage-plant" class:stage-plant-lg={stage.key === 'mature'}>
						{#if stage.key === 'seed'}
							<!-- Seed: isometric square pot + tiny seed -->
							<svg viewBox="0 0 32 28" class="plant-svg">
								<!-- Pot: isometric box -->
								<polygon points="2,14 10,8 22,8 30,14 22,20 10,20" fill="url(#soilTop)"/>
								<polygon points="2,14 10,20 22,20 30,14 22,18 10,18" fill="url(#soilFront)"/>
								<polygon points="10,20 2,14 2,14 10,18" fill="url(#soilSide)"/>
								<!-- Seed -->
								<rect x="12" y="10" width="8" height="4" rx="0" fill="#c9a54e"/>
								<rect x="13" y="11" width="4" height="2" rx="0" fill="#e0c36a" opacity="0.6"/>
							</svg>
						{:else if stage.key === 'sprout'}
							<svg viewBox="0 0 32 42" class="plant-svg">
								<!-- Pot -->
								<polygon points="2,28 10,22 22,22 30,28 22,34 10,34" fill="url(#soilTop)"/>
								<polygon points="2,28 10,34 22,34 30,28 22,32 10,32" fill="url(#soilFront)"/>
								<polygon points="10,34 2,28 2,28 10,32" fill="url(#soilSide)"/>
								<!-- Stem (short, foreshortened) -->
								<rect x="14" y="12" width="4" height="12" rx="0" fill="url(#stemG)"/>
								<!-- Leaves (spread wider horizontally) -->
								<polygon points="16,14 16,10 8,6 6,4 14,12" fill="#5cb870"/>
								<polygon points="16,14 16,10 8,6 6,4 12,12" fill="#8dd89a" opacity="0.4"/>
								<polygon points="16,14 16,10 24,6 26,4 18,12" fill="#4a9e5c"/>
								<polygon points="16,14 16,10 24,6 26,4 20,12" fill="#6dcc7e" opacity="0.4"/>
							</svg>
						{:else if stage.key === 'growing'}
							<svg viewBox="0 0 36 48" class="plant-svg">
								<!-- Pot -->
								<polygon points="4,32 12,26 24,26 32,32 24,38 12,38" fill="url(#soilTop)"/>
								<polygon points="4,32 12,38 24,38 32,32 24,36 12,36" fill="url(#soilFront)"/>
								<polygon points="12,38 4,32 4,32 12,36" fill="url(#soilSide)"/>
								<!-- Stem -->
								<rect x="16" y="12" width="4" height="16" rx="0" fill="url(#stemG)"/>
								<!-- Side leaf -->
								<polygon points="16,22 16,18 8,14 6,12 14,18" fill="#5cb870"/>
								<polygon points="16,22 16,18 8,14 6,12 12,18" fill="#8dd89a" opacity="0.4"/>
								<!-- Top leaves -->
								<polygon points="18,14 18,8 10,4 8,2 16,10" fill="#5cb870"/>
								<polygon points="18,14 18,8 10,4 8,2 14,10" fill="#8dd89a" opacity="0.4"/>
								<polygon points="18,14 18,8 26,4 28,2 20,10" fill="#4a9e5c"/>
								<polygon points="18,14 18,8 26,4 28,2 22,10" fill="#6dcc7e" opacity="0.4"/>
								<!-- Bud -->
								<rect x="15" y="8" width="6" height="5" rx="0" fill="#f4a0c0"/>
								<rect x="16" y="9" width="3" height="3" rx="0" fill="#f8c8d8" opacity="0.5"/>
							</svg>
						{:else if stage.key === 'blooming'}
							<svg viewBox="0 0 40 54" class="plant-svg">
								<!-- Pot -->
								<polygon points="4,38 12,32 28,32 36,38 28,44 12,44" fill="url(#soilTop)"/>
								<polygon points="4,38 12,44 28,44 36,38 28,42 12,42" fill="url(#soilFront)"/>
								<polygon points="12,44 4,38 4,38 12,42" fill="url(#soilSide)"/>
								<!-- Stem -->
								<rect x="18" y="16" width="4" height="18" rx="0" fill="url(#stemG)"/>
								<!-- Leaves -->
								<polygon points="18,26 18,22 10,18 8,16 16,22" fill="#5cb870"/>
								<polygon points="18,26 18,22 10,18 8,16 14,22" fill="#8dd89a" opacity="0.4"/>
								<polygon points="22,26 22,22 30,18 32,16 24,22" fill="#4a9e5c"/>
								<polygon points="22,26 22,22 30,18 32,16 26,22" fill="#6dcc7e" opacity="0.4"/>
								<!-- Flower petals (pixel blocks, spread wide) -->
								<rect x="14" y="4" width="12" height="5" rx="0" fill="url(#petalG)"/>
								<rect x="6" y="8" width="10" height="5" rx="0" fill="url(#petalG)"/>
								<rect x="24" y="8" width="10" height="5" rx="0" fill="url(#petalG)"/>
								<rect x="8" y="13" width="8" height="5" rx="0" fill="url(#petalG)"/>
								<rect x="24" y="13" width="8" height="5" rx="0" fill="url(#petalG)"/>
								<rect x="14" y="14" width="12" height="4" rx="0" fill="url(#petalG)"/>
								<!-- Glow -->
								<circle cx="20" cy="10" r="10" fill="url(#flowerGlow)"/>
								<!-- Pistil -->
								<rect x="15" y="7" width="10" height="7" rx="0" fill="url(#pistilG)"/>
								<rect x="16" y="8" width="5" height="3" rx="0" fill="#ffec99" opacity="0.6"/>
							</svg>
						{:else if stage.key === 'mature'}
							<svg viewBox="0 0 48 68" class="plant-svg-lg">
								<!-- Pot (wider for tree) -->
								<polygon points="4,52 12,46 36,46 44,52 36,58 12,58" fill="url(#soilTop)"/>
								<polygon points="4,52 12,58 36,58 44,52 36,56 12,56" fill="url(#soilFront)"/>
								<polygon points="12,58 4,52 4,52 12,56" fill="url(#soilSide)"/>
								<!-- Trunk (thicker, taller) -->
								<rect x="20" y="22" width="8" height="26" rx="0" fill="url(#trunkG)"/>
								<rect x="23" y="22" width="4" height="26" rx="0" fill="#b07a52" opacity="0.3"/>
								<!-- Canopy (wide, spread flat for isometric) -->
								<rect x="2" y="12" width="16" height="10" rx="0" fill="#1e6e32"/>
								<rect x="30" y="12" width="16" height="10" rx="0" fill="#1e6e32"/>
								<rect x="8" y="4" width="32" height="12" rx="0" fill="#2d8a3e"/>
								<rect x="14" y="0" width="20" height="8" rx="0" fill="#3da052"/>
								<rect x="18" y="-2" width="12" height="6" rx="0" fill="#4aba62"/>
								<!-- Highlights -->
								<rect x="12" y="6" width="8" height="4" rx="0" fill="#6dcc7e" opacity="0.35"/>
								<rect x="28" y="8" width="6" height="3" rx="0" fill="#8dd89a" opacity="0.25"/>
								<rect x="22" y="2" width="6" height="3" rx="0" fill="#8dd89a" opacity="0.3"/>
							</svg>
						{:else if stage.key === 'wilting'}
							<svg viewBox="0 0 32 40" class="plant-svg">
								<!-- Pot (dry) -->
								<polygon points="2,28 10,22 22,22 30,28 22,34 10,34" fill="url(#drySoilTop)"/>
								<polygon points="2,28 10,34 22,34 30,28 22,32 10,32" fill="url(#drySoilFront)"/>
								<polygon points="10,34 2,28 2,28 10,32" fill="#5a4a32"/>
								<!-- Drooping stem -->
								<polygon points="16,28 16,26 20,20 22,18 20,22 18,28" fill="#8a7a3a"/>
								<polygon points="16,28 16,26 20,20 22,18 19,22 17,28" fill="#a89040" opacity="0.4"/>
								<!-- Wilting leaves -->
								<polygon points="20,18 22,18 28,14 26,12 20,16" fill="#a89840"/>
								<polygon points="20,18 22,18 28,14 26,12 21,16" fill="#b8a850" opacity="0.4"/>
								<!-- Bud -->
								<rect x="18" y="14" width="6" height="4" rx="0" fill="#8b6914"/>
								<rect x="19" y="15" width="3" height="2" rx="0" fill="#a88030" opacity="0.4"/>
							</svg>
						{/if}
					</div>
					<div class="stage-label">{stage.label}</div>
					<div class="stage-desc">{stage.desc}</div>
				</div>
			{/each}
		</div>

		<!-- Full Garden Mockup -->
		<h2 class="section-title">Your Garden</h2>
		<div class="garden-bed">
			<div class="wood-frame">
				<div class="wood-top"></div>
				<div class="wood-body">
					<div class="grass-tuft" style="left:6%;top:8%">
						<svg viewBox="0 0 10 12" width="10" height="12"><polygon points="2,12 3,4 4,12" fill="#3a6e2a"/><polygon points="4,12 5,2 6,12" fill="#4a8e3a"/><polygon points="6,12 7,5 8,12" fill="#3a6e2a"/></svg>
					</div>
					<div class="grass-tuft" style="right:8%;top:6%">
						<svg viewBox="0 0 10 12" width="10" height="12"><polygon points="2,12 3,3 4,12" fill="#4a8e3a"/><polygon points="5,12 6,1 7,12" fill="#5aae4a"/></svg>
					</div>
					<div class="grass-tuft" style="left:4%;bottom:10%">
						<svg viewBox="0 0 10 12" width="10" height="12"><polygon points="3,12 4,5 5,12" fill="#3a6e2a"/><polygon points="5,12 6,3 7,12" fill="#4a8e3a"/></svg>
					</div>
					<div class="grass-tuft" style="right:6%;bottom:8%">
						<svg viewBox="0 0 10 12" width="10" height="12"><polygon points="2,12 3,4 4,12" fill="#5aae4a"/><polygon points="4,12 5,2 6,12" fill="#4a8e3a"/><polygon points="7,12 8,6 9,12" fill="#3a6e2a"/></svg>
					</div>

					<div class="garden-row">
						<!-- Morning Routine - Blooming -->
						<div class="garden-spot">
							<svg viewBox="0 0 40 54" class="plant-svg">
								<polygon points="4,38 12,32 28,32 36,38 28,44 12,44" fill="url(#soilTop)"/>
								<polygon points="4,38 12,44 28,44 36,38 28,42 12,42" fill="url(#soilFront)"/>
								<polygon points="12,44 4,38 4,38 12,42" fill="url(#soilSide)"/>
								<rect x="18" y="16" width="4" height="18" rx="0" fill="url(#stemG)"/>
								<polygon points="18,26 18,22 10,18 8,16 16,22" fill="#5cb870"/>
								<polygon points="18,26 18,22 10,18 8,16 14,22" fill="#8dd89a" opacity="0.4"/>
								<polygon points="22,26 22,22 30,18 32,16 24,22" fill="#4a9e5c"/>
								<polygon points="22,26 22,22 30,18 32,16 26,22" fill="#6dcc7e" opacity="0.4"/>
								<rect x="14" y="4" width="12" height="5" rx="0" fill="url(#petalG)"/>
								<rect x="6" y="8" width="10" height="5" rx="0" fill="url(#petalG)"/>
								<rect x="24" y="8" width="10" height="5" rx="0" fill="url(#petalG)"/>
								<rect x="8" y="13" width="8" height="5" rx="0" fill="url(#petalG)"/>
								<rect x="24" y="13" width="8" height="5" rx="0" fill="url(#petalG)"/>
								<rect x="14" y="14" width="12" height="4" rx="0" fill="url(#petalG)"/>
								<circle cx="20" cy="10" r="10" fill="url(#flowerGlow)"/>
								<rect x="15" y="7" width="10" height="7" rx="0" fill="url(#pistilG)"/>
								<rect x="16" y="8" width="5" height="3" rx="0" fill="#ffec99" opacity="0.6"/>
							</svg>
							<span class="spot-name">Morning Routine</span>
							<span class="spot-streak">🔥 7 days</span>
						</div>
						<!-- Wind Down - Growing -->
						<div class="garden-spot">
							<svg viewBox="0 0 36 48" class="plant-svg">
								<polygon points="4,32 12,26 24,26 32,32 24,38 12,38" fill="url(#soilTop)"/>
								<polygon points="4,32 12,38 24,38 32,32 24,36 12,36" fill="url(#soilFront)"/>
								<polygon points="12,38 4,32 4,32 12,36" fill="url(#soilSide)"/>
								<rect x="16" y="12" width="4" height="16" rx="0" fill="url(#stemG)"/>
								<polygon points="16,22 16,18 8,14 6,12 14,18" fill="#5cb870"/>
								<polygon points="16,22 16,18 8,14 6,12 12,18" fill="#8dd89a" opacity="0.4"/>
								<polygon points="18,14 18,8 10,4 8,2 16,10" fill="#5cb870"/>
								<polygon points="18,14 18,8 10,4 8,2 14,10" fill="#8dd89a" opacity="0.4"/>
								<polygon points="18,14 18,8 26,4 28,2 20,10" fill="#4a9e5c"/>
								<polygon points="18,14 18,8 26,4 28,2 22,10" fill="#6dcc7e" opacity="0.4"/>
								<rect x="15" y="8" width="6" height="5" rx="0" fill="#f4a0c0"/>
								<rect x="16" y="9" width="3" height="3" rx="0" fill="#f8c8d8" opacity="0.5"/>
							</svg>
							<span class="spot-name">Wind Down</span>
							<span class="spot-streak">🔥 3 days</span>
						</div>
						<!-- Focus - Seed -->
						<div class="garden-spot">
							<svg viewBox="0 0 32 28" class="plant-svg">
								<polygon points="2,14 10,8 22,8 30,14 22,20 10,20" fill="url(#soilTop)"/>
								<polygon points="2,14 10,20 22,20 30,14 22,18 10,18" fill="url(#soilFront)"/>
								<polygon points="10,20 2,14 2,14 10,18" fill="url(#soilSide)"/>
								<rect x="12" y="10" width="8" height="4" rx="0" fill="#c9a54e"/>
								<rect x="13" y="11" width="4" height="2" rx="0" fill="#e0c36a" opacity="0.6"/>
							</svg>
							<span class="spot-name">Focus</span>
							<span class="spot-streak new">New</span>
						</div>
					</div>
					<div class="garden-row">
						<!-- Fitness - Mature -->
						<div class="garden-spot">
							<svg viewBox="0 0 48 68" class="plant-svg-lg">
								<polygon points="4,52 12,46 36,46 44,52 36,58 12,58" fill="url(#soilTop)"/>
								<polygon points="4,52 12,58 36,58 44,52 36,56 12,56" fill="url(#soilFront)"/>
								<polygon points="12,58 4,52 4,52 12,56" fill="url(#soilSide)"/>
								<rect x="20" y="22" width="8" height="26" rx="0" fill="url(#trunkG)"/>
								<rect x="23" y="22" width="4" height="26" rx="0" fill="#b07a52" opacity="0.3"/>
								<rect x="2" y="12" width="16" height="10" rx="0" fill="#1e6e32"/>
								<rect x="30" y="12" width="16" height="10" rx="0" fill="#1e6e32"/>
								<rect x="8" y="4" width="32" height="12" rx="0" fill="#2d8a3e"/>
								<rect x="14" y="0" width="20" height="8" rx="0" fill="#3da052"/>
								<rect x="18" y="-2" width="12" height="6" rx="0" fill="#4aba62"/>
								<rect x="12" y="6" width="8" height="4" rx="0" fill="#6dcc7e" opacity="0.35"/>
								<rect x="28" y="8" width="6" height="3" rx="0" fill="#8dd89a" opacity="0.25"/>
								<rect x="22" y="2" width="6" height="3" rx="0" fill="#8dd89a" opacity="0.3"/>
							</svg>
							<span class="spot-name">Fitness</span>
							<span class="spot-streak">🔥 21 days</span>
						</div>
						<!-- Reading - Wilting -->
						<div class="garden-spot wilt">
							<svg viewBox="0 0 32 40" class="plant-svg">
								<polygon points="2,28 10,22 22,22 30,28 22,34 10,34" fill="url(#drySoilTop)"/>
								<polygon points="2,28 10,34 22,34 30,28 22,32 10,32" fill="url(#drySoilFront)"/>
								<polygon points="10,34 2,28 2,28 10,32" fill="#5a4a32"/>
								<polygon points="16,28 16,26 20,20 22,18 20,22 18,28" fill="#8a7a3a"/>
								<polygon points="16,28 16,26 20,20 22,18 19,22 17,28" fill="#a89040" opacity="0.4"/>
								<polygon points="20,18 22,18 28,14 26,12 20,16" fill="#a89840"/>
								<polygon points="20,18 22,18 28,14 26,12 21,16" fill="#b8a850" opacity="0.4"/>
								<rect x="18" y="14" width="6" height="4" rx="0" fill="#8b6914"/>
								<rect x="19" y="15" width="3" height="2" rx="0" fill="#a88030" opacity="0.4"/>
							</svg>
							<span class="spot-name wilt-name">Reading</span>
							<span class="spot-streak wilt-streak">⚠ At risk</span>
						</div>
					</div>
				</div>
				<div class="wood-bottom"></div>
			</div>
		</div>
		<p class="footnote">✨ Blooming & Mature plants shimmer gently</p>
	</div>
</div>

<style>
	/* Warm sunset — no magenta */
	.scene {
		min-height: 100vh;
		background: linear-gradient(180deg, #1a1a30 0%, #3a2850 8%, #8a3020 22%, #c85030 35%, #e08828 50%, #f0a840 62%, #c89830 72%, #2a5a30 82%, #1a3a18 100%);
		padding: 1.5rem 1rem;
		position: relative;
		overflow: hidden;
	}
	.sky-layer {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 55%;
		background: radial-gradient(ellipse at 50% 80%, rgba(255,170,60,0.2) 0%, transparent 70%);
		pointer-events: none;
	}
	.cloud {
		position: absolute;
		background: rgba(255,200,160,0.12);
		border-radius: 50%;
		pointer-events: none;
	}
	.cloud-1 { width: 120px; height: 30px; top: 8%; left: 10%; border-radius: 30px; }
	.cloud-2 { width: 80px; height: 20px; top: 12%; right: 15%; border-radius: 20px; }
	.cloud-3 { width: 60px; height: 16px; top: 18%; left: 40%; border-radius: 16px; }

	.content {
		max-width: 28rem;
		margin: 0 auto;
		position: relative;
		z-index: 1;
	}
	.title {
		font-size: 1.5rem;
		font-weight: 700;
		color: #fde8c8;
		text-shadow: 0 2px 4px rgba(0,0,0,0.3);
		margin-bottom: 0.25rem;
	}
	.subtitle {
		font-size: 0.75rem;
		color: #d4a878;
		margin-bottom: 2rem;
	}
	.section-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: #fde8c8;
		text-shadow: 0 1px 3px rgba(0,0,0,0.3);
		margin-bottom: 1rem;
	}
	.footnote {
		font-size: 0.7rem;
		color: #a8c898;
		text-align: center;
		margin-top: 1rem;
	}

	/* Stages grid */
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
		gap: 0.25rem;
	}
	.stage-plant {
		height: 90px;
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}
	.stage-plant-lg {
		height: 110px;
	}
	.plant-svg {
		width: 48px;
		height: auto;
		max-height: 85px;
		filter: drop-shadow(0 3px 4px rgba(0,0,0,0.4));
		image-rendering: pixelated;
	}
	.plant-svg-lg {
		width: 64px;
		height: auto;
		max-height: 105px;
		filter: drop-shadow(0 3px 6px rgba(0,0,0,0.45));
		image-rendering: pixelated;
	}
	.stage-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: #fde8c8;
	}
	.stage-desc {
		font-size: 0.625rem;
		color: #d4a878;
	}

	/* Garden bed with wooden frame */
	.garden-bed {
		margin-bottom: 1rem;
	}
	.wood-frame {
		border-radius: 12px;
		overflow: hidden;
	}
	.wood-top {
		height: 10px;
		background: linear-gradient(180deg, #8a6030, #6a4420);
		border-radius: 12px 12px 0 0;
		box-shadow: inset 0 2px 4px rgba(255,200,120,0.2);
	}
	.wood-bottom {
		height: 10px;
		background: linear-gradient(180deg, #5a3818, #4a2810);
		border-radius: 0 0 12px 12px;
		box-shadow: 0 3px 8px rgba(0,0,0,0.4);
	}
	.wood-body {
		background:
			radial-gradient(ellipse at 50% 90%, rgba(60,40,15,0.5) 0%, transparent 60%),
			linear-gradient(180deg, #1a3a18 0%, #142814 40%, #1a2a10 100%);
		padding: 20px 12px;
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 16px;
		border-left: 6px solid #5a3818;
		border-right: 6px solid #5a3818;
		box-shadow: inset 0 0 20px rgba(0,0,0,0.3);
	}

	.grass-tuft {
		position: absolute;
		opacity: 0.7;
		z-index: 1;
		pointer-events: none;
	}

	.garden-row {
		display: flex;
		justify-content: space-around;
		align-items: flex-end;
		gap: 8px;
		position: relative;
		z-index: 2;
	}
	.garden-spot {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		flex: 1;
		cursor: pointer;
		transition: transform 0.2s;
	}
	.garden-spot:active {
		transform: scale(0.95);
	}
	.spot-name {
		font-size: 0.75rem;
		font-weight: 600;
		color: #fde8c8;
		text-shadow: 0 1px 2px rgba(0,0,0,0.4);
		text-align: center;
	}
	.spot-streak {
		font-size: 0.625rem;
		color: #a8c898;
		text-align: center;
	}
	.spot-streak.new {
		color: #7a9a6a;
	}
	.wilt-name {
		color: #e8a848;
	}
	.wilt-streak {
		color: #e8a848 !important;
	}
	.wilt .plant-svg {
		opacity: 0.85;
		filter: drop-shadow(0 3px 4px rgba(0,0,0,0.4)) saturate(0.7);
	}
</style>