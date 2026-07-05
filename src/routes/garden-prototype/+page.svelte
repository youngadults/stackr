<script lang="ts">
	// Garden prototype — True Isometric v6
	// Plants drawn IN the isometric plane, not CSS-transformed
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
	<title>Garden — True Isometric</title>
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
		<p class="subtitle">Stardew Valley-inspired isometric plants</p>

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
			</defs>
		</svg>

		<!-- Stage Reference -->
		<div class="stages-grid">
			{#each STAGES as stage}
				<div class="stage-card">
					<div class="stage-plant" class:stage-plant-lg={stage.key === 'mature'}>
						{#if stage.key === 'seed'}
							<!-- Seed: just an isometric soil patch with a tiny seed -->
							<svg viewBox="0 0 40 24" class="plant-svg">
								<polygon points="20,4 36,12 20,20 4,12" fill="url(#soilTop)"/>
								<polygon points="20,20 36,12 36,16 20,24" fill="url(#soilFront)"/>
								<polygon points="20,20 4,12 4,16 20,24" fill="url(#soilSide)"/>
								<!-- Seed grain -->
								<rect x="17" y="9" width="6" height="3" rx="0" fill="#c9a54e"/>
								<rect x="18" y="10" width="3" height="1" rx="0" fill="#e0c36a" opacity="0.6"/>
							</svg>
						{:else if stage.key === 'sprout'}
							<!-- Sprout: short stem receding into ground, two leaves spreading in iso plane -->
							<svg viewBox="0 0 40 40" class="plant-svg">
								<!-- Soil -->
								<polygon points="20,24 36,32 20,40 4,32" fill="url(#soilTop)"/>
								<polygon points="20,40 36,32 36,36 20,44" fill="url(#soilFront)"/>
								<polygon points="20,40 4,32 4,36 20,44" fill="url(#soilSide)"/>
								<!-- Stem — short, angled into ground -->
								<rect x="19" y="12" width="2" height="14" rx="0" fill="#5cb870"/>
								<!-- Left leaf (iso angle) -->
								<polygon points="20,14 10,10 8,8 18,16" fill="#5cb870"/>
								<polygon points="20,14 10,10 8,8 14,14" fill="#8dd89a" opacity="0.4"/>
								<!-- Right leaf -->
								<polygon points="20,14 30,10 32,8 22,16" fill="#4a9e5c"/>
								<polygon points="20,14 30,10 32,8 26,14" fill="#6dcc7e" opacity="0.4"/>
							</svg>
						{:else if stage.key === 'growing'}
							<!-- Growing: taller stem, side leaf, bud forming -->
							<svg viewBox="0 0 40 46" class="plant-svg">
								<!-- Soil -->
								<polygon points="20,30 36,38 20,46 4,38" fill="url(#soilTop)"/>
								<polygon points="20,46 36,38 36,42 20,50" fill="url(#soilFront)"/>
								<polygon points="20,46 4,38 4,42 20,50" fill="url(#soilSide)"/>
								<!-- Stem -->
								<rect x="19" y="12" width="3" height="20" rx="0" fill="#5cb870"/>
								<!-- Left side leaf -->
								<polygon points="19,22 10,18 8,16 17,24" fill="#5cb870"/>
								<polygon points="19,22 10,18 8,16 14,22" fill="#8dd89a" opacity="0.4"/>
								<!-- Top left leaf -->
								<polygon points="20,14 10,8 8,6 18,16" fill="#5cb870"/>
								<polygon points="20,14 10,8 8,6 16,14" fill="#8dd89a" opacity="0.4"/>
								<!-- Top right leaf -->
								<polygon points="20,14 30,8 32,6 22,16" fill="#4a9e5c"/>
								<polygon points="20,14 30,8 32,6 24,14" fill="#6dcc7e" opacity="0.4"/>
								<!-- Bud -->
								<rect x="17" y="8" width="6" height="5" rx="0" fill="#f4a0c0"/>
								<rect x="18" y="9" width="3" height="3" rx="0" fill="#f8c8d8" opacity="0.5"/>
							</svg>
						{:else if stage.key === 'blooming'}
							<!-- Blooming: full flower viewed from above-ish angle -->
							<svg viewBox="0 0 48 52" class="plant-svg">
								<!-- Soil -->
								<polygon points="24,36 40,44 24,52 8,44" fill="url(#soilTop)"/>
								<polygon points="24,52 40,44 40,48 24,56" fill="url(#soilFront)"/>
								<polygon points="24,52 8,44 8,48 24,56" fill="url(#soilSide)"/>
								<!-- Stem -->
								<rect x="23" y="18" width="3" height="20" rx="0" fill="#5cb870"/>
								<!-- Side leaves (iso angle) -->
								<polygon points="23,30 14,26 12,24 22,32" fill="#5cb870"/>
								<polygon points="23,30 14,26 12,24 20,30" fill="#8dd89a" opacity="0.4"/>
								<polygon points="26,30 34,26 36,24 27,32" fill="#4a9e5c"/>
								<polygon points="26,30 34,26 36,24 29,30" fill="#6dcc7e" opacity="0.4"/>
								<!-- Flower (viewed slightly from above — wider than tall) -->
								<rect x="18" y="6" width="12" height="5" rx="0" fill="#f4a0c0"/>
								<rect x="10" y="9" width="10" height="5" rx="0" fill="#f4a0c0"/>
								<rect x="28" y="9" width="10" height="5" rx="0" fill="#e8609a"/>
								<rect x="12" y="13" width="8" height="5" rx="0" fill="#e8609a"/>
								<rect x="28" y="13" width="8" height="5" rx="0" fill="#d84890"/>
								<rect x="18" y="14" width="12" height="5" rx="0" fill="#f4a0c0"/>
								<!-- Pistil -->
								<rect x="19" y="8" width="10" height="8" rx="0" fill="#ffd966"/>
								<rect x="20" y="9" width="5" height="3" rx="0" fill="#ffec99" opacity="0.6"/>
							</svg>
						{:else if stage.key === 'mature'}
							<!-- Mature: big tree with flat isometric canopy -->
							<svg viewBox="0 0 56 64" class="plant-svg-lg">
								<!-- Soil (wider) -->
								<polygon points="28,48 44,56 28,64 12,56" fill="url(#soilTop)"/>
								<polygon points="28,64 44,56 44,60 28,68" fill="url(#soilFront)"/>
								<polygon points="28,64 12,56 12,60 28,68" fill="url(#soilSide)"/>
								<!-- Trunk (thicker, angled) -->
								<rect x="25" y="22" width="6" height="28" rx="0" fill="#7a4a2a"/>
								<rect x="28" y="22" width="3" height="28" rx="0" fill="#9a6a42" opacity="0.4"/>
								<!-- Canopy: isometric blobs (viewed from above — wide, flat) -->
								<!-- Shadow layer -->
								<ellipse cx="28" cy="20" rx="22" ry="10" fill="#14532d"/>
								<!-- Main canopy -->
								<ellipse cx="20" cy="16" rx="12" ry="6" fill="#1e6e32"/>
								<ellipse cx="36" cy="16" rx="10" ry="5" fill="#1e6e32"/>
								<ellipse cx="28" cy="14" rx="16" ry="7" fill="#2d8a3e"/>
								<ellipse cx="24" cy="10" rx="10" ry="5" fill="#3da052"/>
								<ellipse cx="34" cy="12" rx="8" ry="4" fill="#3da052"/>
								<ellipse cx="28" cy="8" rx="6" ry="3" fill="#4aba62"/>
								<!-- Highlights -->
								<ellipse cx="22" cy="12" rx="5" ry="2.5" fill="#6dcc7e" opacity="0.35"/>
								<ellipse cx="34" cy="13" rx="4" ry="2" fill="#8dd89a" opacity="0.25"/>
							</svg>
						{:else if stage.key === 'wilting'}
							<!-- Wilting: drooping stem, dry soil -->
							<svg viewBox="0 0 40 40" class="plant-svg">
								<!-- Dry soil -->
								<polygon points="20,24 36,32 20,40 4,32" fill="url(#drySoilTop)"/>
								<polygon points="20,40 36,32 36,36 20,44" fill="url(#drySoilFront)"/>
								<polygon points="20,40 4,32 4,36 20,44" fill="#5a4a32"/>
								<!-- Drooping stem (angled right, leaning) -->
								<polygon points="20,26 20,24 26,16 28,14 26,18 22,26" fill="#8a7a3a"/>
								<polygon points="20,26 20,24 26,16 28,14 25,18 21,26" fill="#a89040" opacity="0.4"/>
								<!-- Wilting leaf -->
								<polygon points="26,16 28,14 34,10 32,8 26,14" fill="#a89840"/>
								<polygon points="26,16 28,14 34,10 32,8 27,14" fill="#b8a850" opacity="0.4"/>
								<!-- Bud -->
								<rect x="25" y="12" width="5" height="4" rx="0" fill="#8b6914"/>
								<rect x="26" y="13" width="2" height="2" rx="0" fill="#a88030" opacity="0.4"/>
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
							<svg viewBox="0 0 48 52" class="plant-svg">
								<polygon points="24,36 40,44 24,52 8,44" fill="url(#soilTop)"/>
								<polygon points="24,52 40,44 40,48 24,56" fill="url(#soilFront)"/>
								<polygon points="24,52 8,44 8,48 24,56" fill="url(#soilSide)"/>
								<rect x="23" y="18" width="3" height="20" rx="0" fill="#5cb870"/>
								<polygon points="23,30 14,26 12,24 22,32" fill="#5cb870"/>
								<polygon points="23,30 14,26 12,24 20,30" fill="#8dd89a" opacity="0.4"/>
								<polygon points="26,30 34,26 36,24 27,32" fill="#4a9e5c"/>
								<polygon points="26,30 34,26 36,24 29,30" fill="#6dcc7e" opacity="0.4"/>
								<rect x="18" y="6" width="12" height="5" rx="0" fill="#f4a0c0"/>
								<rect x="10" y="9" width="10" height="5" rx="0" fill="#f4a0c0"/>
								<rect x="28" y="9" width="10" height="5" rx="0" fill="#e8609a"/>
								<rect x="12" y="13" width="8" height="5" rx="0" fill="#e8609a"/>
								<rect x="28" y="13" width="8" height="5" rx="0" fill="#d84890"/>
								<rect x="18" y="14" width="12" height="5" rx="0" fill="#f4a0c0"/>
								<rect x="19" y="8" width="10" height="8" rx="0" fill="#ffd966"/>
								<rect x="20" y="9" width="5" height="3" rx="0" fill="#ffec99" opacity="0.6"/>
							</svg>
							<span class="spot-name">Morning Routine</span>
							<span class="spot-streak">🔥 7 days</span>
						</div>
						<!-- Wind Down - Growing -->
						<div class="garden-spot">
							<svg viewBox="0 0 40 46" class="plant-svg">
								<polygon points="20,30 36,38 20,46 4,38" fill="url(#soilTop)"/>
								<polygon points="20,46 36,38 36,42 20,50" fill="url(#soilFront)"/>
								<polygon points="20,46 4,38 4,42 20,50" fill="url(#soilSide)"/>
								<rect x="19" y="12" width="3" height="20" rx="0" fill="#5cb870"/>
								<polygon points="19,22 10,18 8,16 17,24" fill="#5cb870"/>
								<polygon points="19,22 10,18 8,16 14,22" fill="#8dd89a" opacity="0.4"/>
								<polygon points="20,14 10,8 8,6 18,16" fill="#5cb870"/>
								<polygon points="20,14 10,8 8,6 16,14" fill="#8dd89a" opacity="0.4"/>
								<polygon points="20,14 30,8 32,6 22,16" fill="#4a9e5c"/>
								<polygon points="20,14 30,8 32,6 24,14" fill="#6dcc7e" opacity="0.4"/>
								<rect x="17" y="8" width="6" height="5" rx="0" fill="#f4a0c0"/>
								<rect x="18" y="9" width="3" height="3" rx="0" fill="#f8c8d8" opacity="0.5"/>
							</svg>
							<span class="spot-name">Wind Down</span>
							<span class="spot-streak">🔥 3 days</span>
						</div>
						<!-- Focus - Seed -->
						<div class="garden-spot">
							<svg viewBox="0 0 40 24" class="plant-svg">
								<polygon points="20,4 36,12 20,20 4,12" fill="url(#soilTop)"/>
								<polygon points="20,20 36,12 36,16 20,24" fill="url(#soilFront)"/>
								<polygon points="20,20 4,12 4,16 20,24" fill="url(#soilSide)"/>
								<rect x="17" y="9" width="6" height="3" rx="0" fill="#c9a54e"/>
								<rect x="18" y="10" width="3" height="1" rx="0" fill="#e0c36a" opacity="0.6"/>
							</svg>
							<span class="spot-name">Focus</span>
							<span class="spot-streak new">New</span>
						</div>
					</div>
					<div class="garden-row">
						<!-- Fitness - Mature -->
						<div class="garden-spot">
							<svg viewBox="0 0 56 64" class="plant-svg-lg">
								<polygon points="28,48 44,56 28,64 12,56" fill="url(#soilTop)"/>
								<polygon points="28,64 44,56 44,60 28,68" fill="url(#soilFront)"/>
								<polygon points="28,64 12,56 12,60 28,68" fill="url(#soilSide)"/>
								<rect x="25" y="22" width="6" height="28" rx="0" fill="#7a4a2a"/>
								<rect x="28" y="22" width="3" height="28" rx="0" fill="#9a6a42" opacity="0.4"/>
								<ellipse cx="28" cy="20" rx="22" ry="10" fill="#14532d"/>
								<ellipse cx="20" cy="16" rx="12" ry="6" fill="#1e6e32"/>
								<ellipse cx="36" cy="16" rx="10" ry="5" fill="#1e6e32"/>
								<ellipse cx="28" cy="14" rx="16" ry="7" fill="#2d8a3e"/>
								<ellipse cx="24" cy="10" rx="10" ry="5" fill="#3da052"/>
								<ellipse cx="34" cy="12" rx="8" ry="4" fill="#3da052"/>
								<ellipse cx="28" cy="8" rx="6" ry="3" fill="#4aba62"/>
								<ellipse cx="22" cy="12" rx="5" ry="2.5" fill="#6dcc7e" opacity="0.35"/>
								<ellipse cx="34" cy="13" rx="4" ry="2" fill="#8dd89a" opacity="0.25"/>
							</svg>
							<span class="spot-name">Fitness</span>
							<span class="spot-streak">🔥 21 days</span>
						</div>
						<!-- Reading - Wilting -->
						<div class="garden-spot wilt">
							<svg viewBox="0 0 40 40" class="plant-svg">
								<polygon points="20,24 36,32 20,40 4,32" fill="url(#drySoilTop)"/>
								<polygon points="20,40 36,32 36,36 20,44" fill="url(#drySoilFront)"/>
								<polygon points="20,40 4,32 4,36 20,44" fill="#5a4a32"/>
								<polygon points="20,26 20,24 26,16 28,14 26,18 22,26" fill="#8a7a3a"/>
								<polygon points="20,26 20,24 26,16 28,14 25,18 21,26" fill="#a89040" opacity="0.4"/>
								<polygon points="26,16 28,14 34,10 32,8 26,14" fill="#a89840"/>
								<polygon points="26,16 28,14 34,10 32,8 27,14" fill="#b8a850" opacity="0.4"/>
								<rect x="25" y="12" width="5" height="4" rx="0" fill="#8b6914"/>
								<rect x="26" y="13" width="2" height="2" rx="0" fill="#a88030" opacity="0.4"/>
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
		height: 120px;
	}
	.plant-svg {
		width: 52px;
		height: auto;
		max-height: 85px;
		filter: drop-shadow(0 3px 4px rgba(0,0,0,0.4));
		image-rendering: pixelated;
	}
	.plant-svg-lg {
		width: 72px;
		height: auto;
		max-height: 115px;
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