<script lang="ts">
	// Garden prototype — True Isometric v9
	// Plants grow from the CENTER of the diamond top face, not the top vertex
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
			</defs>
		</svg>

		<!-- Stage Reference -->
		<div class="stages-grid">
			{#each STAGES as stage}
				<div class="stage-card">
					<div class="stage-plant" class:stage-plant-lg={stage.key === 'mature'}>
						{#if stage.key === 'seed'}
							<!-- Seed: diamond center at (32,24), seed grain on center of top face -->
							<svg viewBox="0 0 64 48" class="plant-svg">
								<!-- Diamond: top=(32,12), right=(52,24), bottom=(32,36), left=(12,24) -->
								<!-- Center of top face = (32,24) -->
								<polygon points="32,12 52,24 32,36 12,24" fill="url(#soilTop)"/>
								<polygon points="32,36 52,24 52,30 32,42" fill="url(#soilFront)"/>
								<polygon points="32,36 12,24 12,30 32,42" fill="url(#soilSide)"/>
								<!-- Seed grain centered at (32,22) — on top face -->
								<rect x="28" y="20" width="8" height="4" rx="0" fill="#c9a54e"/>
								<rect x="29" y="21" width="4" height="2" rx="0" fill="#e0c36a" opacity="0.6"/>
							</svg>
						{:else if stage.key === 'sprout'}
							<!-- Sprout: stem base at center of diamond top face -->
							<svg viewBox="0 0 64 80" class="plant-svg">
								<!-- Diamond: top=(32,48), right=(52,60), bottom=(32,72), left=(12,60) -->
								<!-- Center of top face = (32,60) -->
								<polygon points="32,48 52,60 32,72 12,60" fill="url(#soilTop)"/>
								<polygon points="32,72 52,60 52,66 32,78" fill="url(#soilFront)"/>
								<polygon points="32,72 12,60 12,66 32,78" fill="url(#soilSide)"/>
								<!-- Stem from center of top face upward -->
								<rect x="30" y="28" width="4" height="32" rx="0" fill="url(#stemG)"/>
								<!-- Left leaf -->
								<polygon points="32,32 18,24 14,22 30,34" fill="#5cb870"/>
								<polygon points="32,32 18,24 14,22 24,32" fill="#8dd89a" opacity="0.4"/>
								<!-- Right leaf -->
								<polygon points="32,32 46,24 50,22 34,34" fill="#4a9e5c"/>
								<polygon points="32,32 46,24 50,22 40,32" fill="#6dcc7e" opacity="0.4"/>
							</svg>
						{:else if stage.key === 'growing'}
							<!-- Growing: stem base at center of diamond -->
							<svg viewBox="0 0 64 88" class="plant-svg">
								<!-- Diamond: top=(32,56), right=(52,68), bottom=(32,80), left=(12,68) -->
								<!-- Center = (32,68) -->
								<polygon points="32,56 52,68 32,80 12,68" fill="url(#soilTop)"/>
								<polygon points="32,80 52,68 52,74 32,86" fill="url(#soilFront)"/>
								<polygon points="32,80 12,68 12,74 32,86" fill="url(#soilSide)"/>
								<!-- Stem from center -->
								<rect x="30" y="28" width="4" height="40" rx="0" fill="url(#stemG)"/>
								<!-- Side leaf -->
								<polygon points="30,48 18,42 14,40 28,50" fill="#5cb870"/>
								<polygon points="30,48 18,42 14,40 22,48" fill="#8dd89a" opacity="0.4"/>
								<!-- Top left leaf -->
								<polygon points="32,34 18,24 14,22 30,36" fill="#5cb870"/>
								<polygon points="32,34 18,24 14,22 24,34" fill="#8dd89a" opacity="0.4"/>
								<!-- Top right leaf -->
								<polygon points="32,34 46,24 50,22 34,36" fill="#4a9e5c"/>
								<polygon points="32,34 46,24 50,22 40,34" fill="#6dcc7e" opacity="0.4"/>
								<!-- Bud -->
								<rect x="28" y="26" width="8" height="8" rx="0" fill="#f4a0c0"/>
								<rect x="30" y="28" width="4" height="4" rx="0" fill="#f8c8d8" opacity="0.5"/>
							</svg>
						{:else if stage.key === 'blooming'}
							<!-- Blooming: flower centered above diamond -->
							<svg viewBox="0 0 64 96" class="plant-svg">
								<!-- Diamond: top=(32,64), right=(52,76), bottom=(32,88), left=(12,76) -->
								<!-- Center = (32,76) -->
								<polygon points="32,64 52,76 32,88 12,76" fill="url(#soilTop)"/>
								<polygon points="32,88 52,76 52,82 32,94" fill="url(#soilFront)"/>
								<polygon points="32,88 12,76 12,82 32,94" fill="url(#soilSide)"/>
								<!-- Stem from center -->
								<rect x="30" y="36" width="4" height="40" rx="0" fill="url(#stemG)"/>
								<!-- Side leaves -->
								<polygon points="30,56 16,50 12,48 28,58" fill="#5cb870"/>
								<polygon points="30,56 16,50 12,48 20,56" fill="#8dd89a" opacity="0.4"/>
								<polygon points="34,56 48,50 52,48 36,58" fill="#4a9e5c"/>
								<polygon points="34,56 48,50 52,48 44,56" fill="#6dcc7e" opacity="0.4"/>
								<!-- Flower petals centered at X=32 -->
								<rect x="26" y="16" width="12" height="6" rx="0" fill="#f4a0c0"/>
								<rect x="14" y="20" width="14" height="6" rx="0" fill="#f4a0c0"/>
								<rect x="36" y="20" width="14" height="6" rx="0" fill="#e8609a"/>
								<rect x="16" y="25" width="10" height="6" rx="0" fill="#e8609a"/>
								<rect x="38" y="25" width="10" height="6" rx="0" fill="#d84890"/>
								<rect x="26" y="28" width="12" height="6" rx="0" fill="#f4a0c0"/>
								<!-- Pistil -->
								<rect x="26" y="18" width="12" height="10" rx="0" fill="#ffd966"/>
								<rect x="28" y="20" width="6" height="4" rx="0" fill="#ffec99" opacity="0.6"/>
							</svg>
						{:else if stage.key === 'mature'}
							<!-- Mature: tree centered above diamond -->
							<svg viewBox="0 0 64 112" class="plant-svg-lg">
								<!-- Diamond: top=(32,80), right=(52,92), bottom=(32,104), left=(12,92) -->
								<!-- Center = (32,92) -->
								<polygon points="32,80 52,92 32,104 12,92" fill="url(#soilTop)"/>
								<polygon points="32,104 52,92 52,98 32,110" fill="url(#soilFront)"/>
								<polygon points="32,104 12,92 12,98 32,110" fill="url(#soilSide)"/>
								<!-- Trunk from center -->
								<rect x="28" y="32" width="8" height="52" rx="0" fill="url(#trunkG)"/>
								<rect x="32" y="32" width="4" height="52" rx="0" fill="#b07a52" opacity="0.3"/>
								<!-- Canopy centered at (32, ~24) -->
								<ellipse cx="32" cy="30" rx="28" ry="12" fill="#14532d"/>
								<ellipse cx="22" cy="26" rx="14" ry="7" fill="#1e6e32"/>
								<ellipse cx="42" cy="26" rx="12" ry="6" fill="#1e6e32"/>
								<ellipse cx="32" cy="22" rx="20" ry="9" fill="#2d8a3e"/>
								<ellipse cx="26" cy="18" rx="12" ry="6" fill="#3da052"/>
								<ellipse cx="40" cy="20" rx="10" ry="5" fill="#3da052"/>
								<ellipse cx="32" cy="14" rx="8" ry="4" fill="#4aba62"/>
								<!-- Highlights -->
								<ellipse cx="24" cy="22" rx="6" ry="3" fill="#6dcc7e" opacity="0.35"/>
								<ellipse cx="38" cy="23" rx="5" ry="2.5" fill="#8dd89a" opacity="0.25"/>
							</svg>
						{:else if stage.key === 'wilting'}
							<!-- Wilting: stem droops from center of diamond -->
							<svg viewBox="0 0 64 80" class="plant-svg">
								<!-- Diamond: top=(32,48), right=(52,60), bottom=(32,72), left=(12,60) -->
								<!-- Center = (32,60) -->
								<polygon points="32,48 52,60 32,72 12,60" fill="url(#drySoilTop)"/>
								<polygon points="32,72 52,60 52,66 32,78" fill="url(#drySoilFront)"/>
								<polygon points="32,72 12,60 12,66 32,78" fill="#5a4a32"/>
								<!-- Stem starts at center (32,60) and droops right -->
								<polygon points="32,62 32,60 42,46 44,44 42,50 34,62" fill="#8a7a3a"/>
								<polygon points="32,62 32,60 42,46 44,44 40,50 33,62" fill="#a89040" opacity="0.4"/>
								<!-- Wilting leaf -->
								<polygon points="42,44 44,44 52,36 50,34 42,42" fill="#a89840"/>
								<polygon points="42,44 44,44 52,36 50,34 43,42" fill="#b8a850" opacity="0.4"/>
								<!-- Bud -->
								<rect x="40" y="40" width="6" height="5" rx="0" fill="#8b6914"/>
								<rect x="41" y="41" width="3" height="3" rx="0" fill="#a88030" opacity="0.4"/>
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
							<svg viewBox="0 0 64 96" class="plant-svg">
								<polygon points="32,64 52,76 32,88 12,76" fill="url(#soilTop)"/>
								<polygon points="32,88 52,76 52,82 32,94" fill="url(#soilFront)"/>
								<polygon points="32,88 12,76 12,82 32,94" fill="url(#soilSide)"/>
								<rect x="30" y="36" width="4" height="40" rx="0" fill="url(#stemG)"/>
								<polygon points="30,56 16,50 12,48 28,58" fill="#5cb870"/>
								<polygon points="30,56 16,50 12,48 20,56" fill="#8dd89a" opacity="0.4"/>
								<polygon points="34,56 48,50 52,48 36,58" fill="#4a9e5c"/>
								<polygon points="34,56 48,50 52,48 44,56" fill="#6dcc7e" opacity="0.4"/>
								<rect x="26" y="16" width="12" height="6" rx="0" fill="#f4a0c0"/>
								<rect x="14" y="20" width="14" height="6" rx="0" fill="#f4a0c0"/>
								<rect x="36" y="20" width="14" height="6" rx="0" fill="#e8609a"/>
								<rect x="16" y="25" width="10" height="6" rx="0" fill="#e8609a"/>
								<rect x="38" y="25" width="10" height="6" rx="0" fill="#d84890"/>
								<rect x="26" y="28" width="12" height="6" rx="0" fill="#f4a0c0"/>
								<rect x="26" y="18" width="12" height="10" rx="0" fill="#ffd966"/>
								<rect x="28" y="20" width="6" height="4" rx="0" fill="#ffec99" opacity="0.6"/>
							</svg>
							<span class="spot-name">Morning Routine</span>
							<span class="spot-streak">🔥 7 days</span>
						</div>
						<!-- Wind Down - Growing -->
						<div class="garden-spot">
							<svg viewBox="0 0 64 88" class="plant-svg">
								<polygon points="32,56 52,68 32,80 12,68" fill="url(#soilTop)"/>
								<polygon points="32,80 52,68 52,74 32,86" fill="url(#soilFront)"/>
								<polygon points="32,80 12,68 12,74 32,86" fill="url(#soilSide)"/>
								<rect x="30" y="28" width="4" height="40" rx="0" fill="url(#stemG)"/>
								<polygon points="30,48 18,42 14,40 28,50" fill="#5cb870"/>
								<polygon points="30,48 18,42 14,40 22,48" fill="#8dd89a" opacity="0.4"/>
								<polygon points="32,34 18,24 14,22 30,36" fill="#5cb870"/>
								<polygon points="32,34 18,24 14,22 24,34" fill="#8dd89a" opacity="0.4"/>
								<polygon points="32,34 46,24 50,22 34,36" fill="#4a9e5c"/>
								<polygon points="32,34 46,24 50,22 40,34" fill="#6dcc7e" opacity="0.4"/>
								<rect x="28" y="26" width="8" height="8" rx="0" fill="#f4a0c0"/>
								<rect x="30" y="28" width="4" height="4" rx="0" fill="#f8c8d8" opacity="0.5"/>
							</svg>
							<span class="spot-name">Wind Down</span>
							<span class="spot-streak">🔥 3 days</span>
						</div>
						<!-- Focus - Seed -->
						<div class="garden-spot">
							<svg viewBox="0 0 64 48" class="plant-svg">
								<polygon points="32,12 52,24 32,36 12,24" fill="url(#soilTop)"/>
								<polygon points="32,36 52,24 52,30 32,42" fill="url(#soilFront)"/>
								<polygon points="32,36 12,24 12,30 32,42" fill="url(#soilSide)"/>
								<rect x="28" y="20" width="8" height="4" rx="0" fill="#c9a54e"/>
								<rect x="29" y="21" width="4" height="2" rx="0" fill="#e0c36a" opacity="0.6"/>
							</svg>
							<span class="spot-name">Focus</span>
							<span class="spot-streak new">New</span>
						</div>
					</div>
					<div class="garden-row">
						<!-- Fitness - Mature -->
						<div class="garden-spot">
							<svg viewBox="0 0 64 112" class="plant-svg-lg">
								<polygon points="32,80 52,92 32,104 12,92" fill="url(#soilTop)"/>
								<polygon points="32,104 52,92 52,98 32,110" fill="url(#soilFront)"/>
								<polygon points="32,104 12,92 12,98 32,110" fill="url(#soilSide)"/>
								<rect x="28" y="32" width="8" height="52" rx="0" fill="url(#trunkG)"/>
								<rect x="32" y="32" width="4" height="52" rx="0" fill="#b07a52" opacity="0.3"/>
								<ellipse cx="32" cy="30" rx="28" ry="12" fill="#14532d"/>
								<ellipse cx="22" cy="26" rx="14" ry="7" fill="#1e6e32"/>
								<ellipse cx="42" cy="26" rx="12" ry="6" fill="#1e6e32"/>
								<ellipse cx="32" cy="22" rx="20" ry="9" fill="#2d8a3e"/>
								<ellipse cx="26" cy="18" rx="12" ry="6" fill="#3da052"/>
								<ellipse cx="40" cy="20" rx="10" ry="5" fill="#3da052"/>
								<ellipse cx="32" cy="14" rx="8" ry="4" fill="#4aba62"/>
								<ellipse cx="24" cy="22" rx="6" ry="3" fill="#6dcc7e" opacity="0.35"/>
								<ellipse cx="38" cy="23" rx="5" ry="2.5" fill="#8dd89a" opacity="0.25"/>
							</svg>
							<span class="spot-name">Fitness</span>
							<span class="spot-streak">🔥 21 days</span>
						</div>
						<!-- Reading - Wilting -->
						<div class="garden-spot wilt">
							<svg viewBox="0 0 64 80" class="plant-svg">
								<polygon points="32,48 52,60 32,72 12,60" fill="url(#drySoilTop)"/>
								<polygon points="32,72 52,60 52,66 32,78" fill="url(#drySoilFront)"/>
								<polygon points="32,72 12,60 12,66 32,78" fill="#5a4a32"/>
								<polygon points="32,62 32,60 42,46 44,44 42,50 34,62" fill="#8a7a3a"/>
								<polygon points="32,62 32,60 42,46 44,44 40,50 33,62" fill="#a89040" opacity="0.4"/>
								<polygon points="42,44 44,44 52,36 50,34 42,42" fill="#a89840"/>
								<polygon points="42,44 44,44 52,36 50,34 43,42" fill="#b8a850" opacity="0.4"/>
								<rect x="40" y="40" width="6" height="5" rx="0" fill="#8b6914"/>
								<rect x="41" y="41" width="3" height="3" rx="0" fill="#a88030" opacity="0.4"/>
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
	.scene {
		min-height: 100vh;
		background: linear-gradient(180deg, #1a1a30 0%, #3a2850 8%, #8a3020 22%, #c85030 35%, #e08828 50%, #f0a840 62%, #c89830 72%, #2a5a30 82%, #1a3a18 100%);
		padding: 1.5rem 1rem;
		position: relative;
		overflow: hidden;
	}
	.sky-layer {
		position: absolute;
		top: 0; left: 0; right: 0;
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

	.content { max-width: 28rem; margin: 0 auto; position: relative; z-index: 1; }
	.title { font-size: 1.5rem; font-weight: 700; color: #fde8c8; text-shadow: 0 2px 4px rgba(0,0,0,0.3); margin-bottom: 0.25rem; }
	.subtitle { font-size: 0.75rem; color: #d4a878; margin-bottom: 2rem; }
	.section-title { font-size: 1.125rem; font-weight: 600; color: #fde8c8; text-shadow: 0 1px 3px rgba(0,0,0,0.3); margin-bottom: 1rem; }
	.footnote { font-size: 0.7rem; color: #a8c898; text-align: center; margin-top: 1rem; }

	.stages-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.75rem;
		margin-bottom: 2.5rem;
	}
	.stage-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}
	.stage-plant {
		height: 120px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.stage-plant-lg {
		height: 160px;
	}
	.plant-svg {
		height: 100%;
		width: auto;
		max-width: 80px;
		filter: drop-shadow(0 3px 4px rgba(0,0,0,0.4));
		image-rendering: pixelated;
	}
	.plant-svg-lg {
		height: 100%;
		width: auto;
		max-width: 100px;
		filter: drop-shadow(0 3px 6px rgba(0,0,0,0.45));
		image-rendering: pixelated;
	}
	.stage-label { font-size: 0.75rem; font-weight: 600; color: #fde8c8; }
	.stage-desc { font-size: 0.625rem; color: #d4a878; }

	.garden-bed { margin-bottom: 1rem; }
	.wood-frame { border-radius: 12px; overflow: hidden; }
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
	.grass-tuft { position: absolute; opacity: 0.7; z-index: 1; pointer-events: none; }

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
	.garden-spot:active { transform: scale(0.95); }
	.spot-name { font-size: 0.75rem; font-weight: 600; color: #fde8c8; text-shadow: 0 1px 2px rgba(0,0,0,0.4); text-align: center; }
	.spot-streak { font-size: 0.625rem; color: #a8c898; text-align: center; }
	.spot-streak.new { color: #7a9a6a; }
	.wilt-name { color: #e8a848; }
	.wilt-streak { color: #e8a848 !important; }
	.wilt .plant-svg { opacity: 0.85; filter: drop-shadow(0 3px 4px rgba(0,0,0,0.4)) saturate(0.7); }
</style>