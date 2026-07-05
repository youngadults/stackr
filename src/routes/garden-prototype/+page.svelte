<script lang="ts">
	// Garden prototype — Stardew Valley pixel art style v3
	// More 3D depth, sunset sky, pixel-stepped shapes
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
	<title>Garden — Pixel Stardew</title>
</svelte:head>

<div class="scene">
	<!-- Sunset sky layers -->
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
					<div class="stage-plant">
						{#if stage.key === 'seed'}
							<svg viewBox="0 0 32 40" class="plant-svg">
								<polygon points="4,28 8,22 24,22 28,28 24,34 8,34" fill="url(#soilFront)"/>
								<polygon points="4,28 8,22 24,22 28,28 24,28 8,28" fill="url(#soilTop)"/>
								<polygon points="4,28 8,28 8,34 4,28" fill="#4a3018" opacity="0.5"/>
								<rect x="12" y="24" width="8" height="6" rx="1" fill="#c9a54e"/>
								<rect x="13" y="25" width="4" height="2" rx="0.5" fill="#e0c36a" opacity="0.6"/>
							</svg>
						{:else if stage.key === 'sprout'}
							<svg viewBox="0 0 32 48" class="plant-svg">
								<polygon points="4,36 8,30 24,30 28,36 24,42 8,42" fill="url(#soilFront)"/>
								<polygon points="4,36 8,30 24,30 28,36 24,36 8,36" fill="url(#soilTop)"/>
								<polygon points="4,36 8,36 8,42 4,36" fill="#4a3018" opacity="0.5"/>
								<rect x="14" y="18" width="4" height="16" rx="0" fill="url(#stemG)"/>
								<polygon points="16,20 16,14 8,10 6,8 14,16" fill="#5cb870"/>
								<polygon points="16,20 16,14 8,10 6,8 12,16" fill="#8dd89a" opacity="0.4"/>
								<polygon points="16,20 16,14 24,10 26,8 18,16" fill="#4a9e5c"/>
								<polygon points="16,20 16,14 24,10 26,8 20,16" fill="#6dcc7e" opacity="0.4"/>
							</svg>
						{:else if stage.key === 'growing'}
							<svg viewBox="0 0 32 52" class="plant-svg">
								<polygon points="4,40 8,34 24,34 28,40 24,46 8,46" fill="url(#soilFront)"/>
								<polygon points="4,40 8,34 24,34 28,40 24,40 8,40" fill="url(#soilTop)"/>
								<polygon points="4,40 8,40 8,46 4,40" fill="#4a3018" opacity="0.5"/>
								<rect x="14" y="16" width="4" height="24" rx="0" fill="url(#stemG)"/>
								<polygon points="14,28 14,24 8,20 6,18 12,24" fill="#5cb870"/>
								<polygon points="14,28 14,24 8,20 6,18 10,24" fill="#8dd89a" opacity="0.4"/>
								<polygon points="16,18 16,12 8,8 6,6 14,14" fill="#5cb870"/>
								<polygon points="16,18 16,12 8,8 6,6 12,14" fill="#8dd89a" opacity="0.4"/>
								<polygon points="16,18 16,12 24,8 26,6 18,14" fill="#4a9e5c"/>
								<polygon points="16,18 16,12 24,8 26,6 20,14" fill="#6dcc7e" opacity="0.4"/>
								<rect x="13" y="12" width="6" height="6" rx="0" fill="#f4a0c0"/>
								<rect x="14" y="13" width="3" height="3" rx="0" fill="#f8c8d8" opacity="0.5"/>
							</svg>
						{:else if stage.key === 'blooming'}
							<svg viewBox="0 0 40 56" class="plant-svg">
								<polygon points="4,44 8,38 32,38 36,44 32,50 8,50" fill="url(#soilFront)"/>
								<polygon points="4,44 8,38 32,38 36,44 32,44 8,44" fill="url(#soilTop)"/>
								<polygon points="4,44 8,44 8,50 4,44" fill="#4a3018" opacity="0.5"/>
								<rect x="18" y="20" width="4" height="24" rx="0" fill="url(#stemG)"/>
								<polygon points="18,32 18,28 10,24 8,22 14,28" fill="#5cb870"/>
								<polygon points="18,32 18,28 10,24 8,22 12,28" fill="#8dd89a" opacity="0.4"/>
								<polygon points="22,32 22,28 30,24 32,22 26,28" fill="#4a9e5c"/>
								<polygon points="22,32 22,28 30,24 32,22 28,28" fill="#6dcc7e" opacity="0.4"/>
								<!-- Flower petals (pixel blocks) -->
								<rect x="16" y="8" width="8" height="6" rx="0" fill="url(#petalG)"/>
								<rect x="8" y="12" width="8" height="6" rx="0" fill="url(#petalG)"/>
								<rect x="24" y="12" width="8" height="6" rx="0" fill="url(#petalG)"/>
								<rect x="10" y="18" width="7" height="6" rx="0" fill="url(#petalG)"/>
								<rect x="23" y="18" width="7" height="6" rx="0" fill="url(#petalG)"/>
								<rect x="16" y="20" width="8" height="5" rx="0" fill="url(#petalG)"/>
								<!-- Glow -->
								<circle cx="20" cy="16" r="10" fill="url(#flowerGlow)"/>
								<!-- Pistil (center) -->
								<rect x="16" y="13" width="8" height="8" rx="0" fill="url(#pistilG)"/>
								<rect x="17" y="14" width="4" height="3" rx="0" fill="#ffec99" opacity="0.6"/>
							</svg>
						{:else if stage.key === 'mature'}
							<svg viewBox="0 0 48 60" class="plant-svg-lg">
								<polygon points="4,48 8,42 40,42 44,48 40,54 8,54" fill="url(#soilFront)"/>
								<polygon points="4,48 8,42 40,42 44,48 40,48 8,48" fill="url(#soilTop)"/>
								<polygon points="4,48 8,48 8,54 4,48" fill="#4a3018" opacity="0.5"/>
								<rect x="20" y="28" width="8" height="20" rx="0" fill="url(#trunkG)"/>
								<rect x="22" y="28" width="4" height="20" rx="0" fill="#b07a52" opacity="0.3"/>
								<!-- Canopy (pixel blocks) -->
								<rect x="4" y="20" width="14" height="12" rx="0" fill="#1e6e32"/>
								<rect x="30" y="20" width="14" height="12" rx="0" fill="#1e6e32"/>
								<rect x="10" y="10" width="28" height="14" rx="0" fill="#2d8a3e"/>
								<rect x="16" y="4" width="16" height="10" rx="0" fill="#3da052"/>
								<rect x="20" y="2" width="8" height="6" rx="0" fill="#4aba62"/>
								<!-- Highlights -->
								<rect x="14" y="12" width="6" height="4" rx="0" fill="#6dcc7e" opacity="0.35"/>
								<rect x="26" y="14" width="5" height="3" rx="0" fill="#8dd89a" opacity="0.25"/>
								<rect x="22" y="4" width="4" height="3" rx="0" fill="#8dd89a" opacity="0.3"/>
							</svg>
						{:else if stage.key === 'wilting'}
							<svg viewBox="0 0 32 48" class="plant-svg">
								<polygon points="4,36 8,30 24,30 28,36 24,42 8,42" fill="url(#drySoilFront)"/>
								<polygon points="4,36 8,30 24,30 28,36 24,36 8,36" fill="url(#drySoilTop)"/>
								<polygon points="4,36 8,36 8,42 4,36" fill="#5a4a32" opacity="0.5"/>
								<!-- Drooping stem (polygon) -->
								<polygon points="16,36 16,34 20,26 22,24 20,28 18,36" fill="#8a7a3a"/>
								<polygon points="16,36 16,34 20,26 22,24 19,28 17,36" fill="#a89040" opacity="0.4"/>
								<!-- Wilting leaves -->
								<polygon points="20,24 22,24 28,20 26,18 20,22" fill="#a89840"/>
								<polygon points="20,24 22,24 28,20 26,18 21,22" fill="#b8a850" opacity="0.4"/>
								<!-- Bud -->
								<rect x="18" y="20" width="6" height="5" rx="0" fill="#8b6914"/>
								<rect x="19" y="21" width="3" height="2" rx="0" fill="#a88030" opacity="0.4"/>
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
					<!-- Grass tufts -->
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
						<div class="garden-spot">
							<svg viewBox="0 0 40 56" class="plant-svg">
								<polygon points="4,44 8,38 32,38 36,44 32,50 8,50" fill="url(#soilFront)"/>
								<polygon points="4,44 8,38 32,38 36,44 32,44 8,44" fill="url(#soilTop)"/>
								<polygon points="4,44 8,44 8,50 4,44" fill="#4a3018" opacity="0.5"/>
								<rect x="18" y="20" width="4" height="24" rx="0" fill="url(#stemG)"/>
								<polygon points="18,32 18,28 10,24 8,22 14,28" fill="#5cb870"/>
								<polygon points="18,32 18,28 10,24 8,22 12,28" fill="#8dd89a" opacity="0.4"/>
								<polygon points="22,32 22,28 30,24 32,22 26,28" fill="#4a9e5c"/>
								<polygon points="22,32 22,28 30,24 32,22 28,28" fill="#6dcc7e" opacity="0.4"/>
								<rect x="16" y="8" width="8" height="6" rx="0" fill="url(#petalG)"/>
								<rect x="8" y="12" width="8" height="6" rx="0" fill="url(#petalG)"/>
								<rect x="24" y="12" width="8" height="6" rx="0" fill="url(#petalG)"/>
								<rect x="10" y="18" width="7" height="6" rx="0" fill="url(#petalG)"/>
								<rect x="23" y="18" width="7" height="6" rx="0" fill="url(#petalG)"/>
								<rect x="16" y="20" width="8" height="5" rx="0" fill="url(#petalG)"/>
								<circle cx="20" cy="16" r="10" fill="url(#flowerGlow)"/>
								<rect x="16" y="13" width="8" height="8" rx="0" fill="url(#pistilG)"/>
								<rect x="17" y="14" width="4" height="3" rx="0" fill="#ffec99" opacity="0.6"/>
							</svg>
							<span class="spot-name">Morning Routine</span>
							<span class="spot-streak">🔥 7 days</span>
						</div>
						<div class="garden-spot">
							<svg viewBox="0 0 32 52" class="plant-svg">
								<polygon points="4,40 8,34 24,34 28,40 24,46 8,46" fill="url(#soilFront)"/>
								<polygon points="4,40 8,34 24,34 28,40 24,40 8,40" fill="url(#soilTop)"/>
								<polygon points="4,40 8,40 8,46 4,40" fill="#4a3018" opacity="0.5"/>
								<rect x="14" y="16" width="4" height="24" rx="0" fill="url(#stemG)"/>
								<polygon points="14,28 14,24 8,20 6,18 12,24" fill="#5cb870"/>
								<polygon points="14,28 14,24 8,20 6,18 10,24" fill="#8dd89a" opacity="0.4"/>
								<polygon points="16,18 16,12 8,8 6,6 14,14" fill="#5cb870"/>
								<polygon points="16,18 16,12 8,8 6,6 12,14" fill="#8dd89a" opacity="0.4"/>
								<polygon points="16,18 16,12 24,8 26,6 18,14" fill="#4a9e5c"/>
								<polygon points="16,18 16,12 24,8 26,6 20,14" fill="#6dcc7e" opacity="0.4"/>
								<rect x="13" y="12" width="6" height="6" rx="0" fill="#f4a0c0"/>
								<rect x="14" y="13" width="3" height="3" rx="0" fill="#f8c8d8" opacity="0.5"/>
							</svg>
							<span class="spot-name">Wind Down</span>
							<span class="spot-streak">🔥 3 days</span>
						</div>
						<div class="garden-spot">
							<svg viewBox="0 0 32 40" class="plant-svg">
								<polygon points="4,28 8,22 24,22 28,28 24,34 8,34" fill="url(#soilFront)"/>
								<polygon points="4,28 8,22 24,22 28,28 24,28 8,28" fill="url(#soilTop)"/>
								<polygon points="4,28 8,28 8,34 4,28" fill="#4a3018" opacity="0.5"/>
								<rect x="12" y="24" width="8" height="6" rx="0" fill="#c9a54e"/>
								<rect x="13" y="25" width="4" height="2" rx="0" fill="#e0c36a" opacity="0.6"/>
							</svg>
							<span class="spot-name">Focus</span>
							<span class="spot-streak new">New</span>
						</div>
					</div>
					<div class="garden-row">
						<div class="garden-spot">
							<svg viewBox="0 0 48 60" class="plant-svg-lg">
								<polygon points="4,48 8,42 40,42 44,48 40,54 8,54" fill="url(#soilFront)"/>
								<polygon points="4,48 8,42 40,42 44,48 40,48 8,48" fill="url(#soilTop)"/>
								<polygon points="4,48 8,48 8,54 4,48" fill="#4a3018" opacity="0.5"/>
								<rect x="20" y="28" width="8" height="20" rx="0" fill="url(#trunkG)"/>
								<rect x="22" y="28" width="4" height="20" rx="0" fill="#b07a52" opacity="0.3"/>
								<rect x="4" y="20" width="14" height="12" rx="0" fill="#1e6e32"/>
								<rect x="30" y="20" width="14" height="12" rx="0" fill="#1e6e32"/>
								<rect x="10" y="10" width="28" height="14" rx="0" fill="#2d8a3e"/>
								<rect x="16" y="4" width="16" height="10" rx="0" fill="#3da052"/>
								<rect x="20" y="2" width="8" height="6" rx="0" fill="#4aba62"/>
								<rect x="14" y="12" width="6" height="4" rx="0" fill="#6dcc7e" opacity="0.35"/>
								<rect x="26" y="14" width="5" height="3" rx="0" fill="#8dd89a" opacity="0.25"/>
								<rect x="22" y="4" width="4" height="3" rx="0" fill="#8dd89a" opacity="0.3"/>
							</svg>
							<span class="spot-name">Fitness</span>
							<span class="spot-streak">🔥 21 days</span>
						</div>
						<div class="garden-spot wilt">
							<svg viewBox="0 0 32 48" class="plant-svg">
								<polygon points="4,36 8,30 24,30 28,36 24,42 8,42" fill="url(#drySoilFront)"/>
								<polygon points="4,36 8,30 24,30 28,36 24,36 8,36" fill="url(#drySoilTop)"/>
								<polygon points="4,36 8,36 8,42 4,36" fill="#5a4a32" opacity="0.5"/>
								<polygon points="16,36 16,34 20,26 22,24 20,28 18,36" fill="#8a7a3a"/>
								<polygon points="16,36 16,34 20,26 22,24 19,28 17,36" fill="#a89040" opacity="0.4"/>
								<polygon points="20,24 22,24 28,20 26,18 20,22" fill="#a89840"/>
								<polygon points="20,24 22,24 28,20 26,18 21,22" fill="#b8a850" opacity="0.4"/>
								<rect x="18" y="20" width="6" height="5" rx="0" fill="#8b6914"/>
								<rect x="19" y="21" width="3" height="2" rx="0" fill="#a88030" opacity="0.4"/>
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
	/* Sunset sky */
	.scene {
		min-height: 100vh;
		background: linear-gradient(180deg, #1a1040 0%, #4a2060 10%, #c85040 30%, #e88040 50%, #f0a850 65%, #2a5a30 80%, #1a3a18 100%);
		padding: 1.5rem 1rem;
		position: relative;
		overflow: hidden;
	}
	.sky-layer {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 50%;
		background: radial-gradient(ellipse at 50% 80%, rgba(255,160,80,0.25) 0%, transparent 70%);
		pointer-events: none;
	}
	.cloud {
		position: absolute;
		background: rgba(255,200,160,0.15);
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
		color: #c8a888;
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
		height: 100px;
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}
	.plant-svg {
		width: 48px;
		height: auto;
		max-height: 90px;
		filter: drop-shadow(0 3px 4px rgba(0,0,0,0.4));
		image-rendering: pixelated;
	}
	.plant-svg-lg {
		width: 56px;
		height: auto;
		max-height: 100px;
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
		color: #c8a888;
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

	/* Grass */
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