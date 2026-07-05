<script lang="ts">
	// Garden prototype — Stardew Valley pixel-art style, inline SVG
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
	<title>Garden — Stardew Style</title>
</svelte:head>

<div class="scene">
	<div class="content">
		<h1 class="title">Garden</h1>
		<p class="subtitle">Stardew Valley-inspired pixel plants</p>

		<!-- Stage Reference -->
		<div class="stages-grid">
			{#each STAGES as stage}
				<div class="stage-card">
					<div class="stage-plant">
						{#if stage.key === 'seed'}
							<svg viewBox="0 0 32 40" class="plant-svg">
								<!-- Soil mound (isometric) -->
								<ellipse cx="16" cy="34" rx="14" ry="4" fill="#5c3d1e"/>
								<rect x="2" y="30" width="28" height="4" fill="#5c3d1e"/>
								<ellipse cx="16" cy="30" rx="14" ry="5" fill="#7a5230"/>
								<ellipse cx="16" cy="30" rx="14" ry="5" fill="url(#soilSheen)"/>
								<!-- Seed -->
								<ellipse cx="16" cy="28" rx="4" ry="3" fill="#c9a54e"/>
								<ellipse cx="15" cy="27" rx="2" ry="1.5" fill="#e0c36a" opacity="0.6"/>
							</svg>
						{:else if stage.key === 'sprout'}
							<svg viewBox="0 0 32 48" class="plant-svg">
								<defs>
									<linearGradient id="stemG" x1="0" y1="0" x2="1" y2="0">
										<stop offset="0%" stop-color="#2d8a3e"/>
										<stop offset="50%" stop-color="#5cb870"/>
										<stop offset="100%" stop-color="#2d8a3e"/>
									</linearGradient>
								</defs>
								<!-- Soil -->
								<ellipse cx="16" cy="42" rx="14" ry="4" fill="#5c3d1e"/>
								<rect x="2" y="38" width="28" height="4" fill="#5c3d1e"/>
								<ellipse cx="16" cy="38" rx="14" ry="5" fill="#7a5230"/>
								<ellipse cx="16" cy="38" rx="14" ry="5" fill="url(#soilSheen)"/>
								<!-- Stem -->
								<rect x="14.5" y="22" width="3" height="16" rx="1" fill="url(#stemG)"/>
								<!-- Leaves -->
								<path d="M15.5,24 Q10,22 8,18 Q12,20 15.5,22Z" fill="#5cb870"/>
								<path d="M15.5,24 Q10,22 8,18 Q10,20 13,22Z" fill="#8dd89a" opacity="0.6"/>
								<path d="M16.5,24 Q22,22 24,18 Q20,20 16.5,22Z" fill="#4a9e5c"/>
								<path d="M16.5,24 Q22,22 24,18 Q22,20 19,22Z" fill="#6dcc7e" opacity="0.5"/>
							</svg>
						{:else if stage.key === 'growing'}
							<svg viewBox="0 0 32 52" class="plant-svg">
								<defs>
									<linearGradient id="stemG2" x1="0" y1="0" x2="1" y2="0">
										<stop offset="0%" stop-color="#2d8a3e"/>
										<stop offset="50%" stop-color="#5cb870"/>
										<stop offset="100%" stop-color="#2d8a3e"/>
									</linearGradient>
								</defs>
								<!-- Soil -->
								<ellipse cx="16" cy="46" rx="14" ry="4" fill="#5c3d1e"/>
								<rect x="2" y="42" width="28" height="4" fill="#5c3d1e"/>
								<ellipse cx="16" cy="42" rx="14" ry="5" fill="#7a5230"/>
								<ellipse cx="16" cy="42" rx="14" ry="5" fill="url(#soilSheen)"/>
								<!-- Stem -->
								<rect x="14" y="18" width="4" height="24" rx="1.5" fill="url(#stemG2)"/>
								<!-- Side leaf -->
								<path d="M14,32 Q8,30 6,26 Q10,28 14,30Z" fill="#5cb870"/>
								<path d="M14,32 Q8,30 6,26 Q9,28 12,30Z" fill="#8dd89a" opacity="0.5"/>
								<!-- Top leaves -->
								<path d="M15,20 Q8,18 6,13 Q10,16 15,18Z" fill="#5cb870"/>
								<path d="M15,20 Q8,18 6,13 Q9,16 12,18Z" fill="#8dd89a" opacity="0.5"/>
								<path d="M17,20 Q24,18 26,13 Q22,16 17,18Z" fill="#4a9e5c"/>
								<path d="M17,20 Q24,18 26,13 Q23,16 20,18Z" fill="#6dcc7e" opacity="0.5"/>
								<!-- Bud -->
								<circle cx="16" cy="16" r="3.5" fill="#f4a0c0"/>
								<circle cx="15" cy="15" r="1.5" fill="#f8c8d8" opacity="0.5"/>
							</svg>
						{:else if stage.key === 'blooming'}
							<svg viewBox="0 0 40 56" class="plant-svg">
								<defs>
									<linearGradient id="stemG3" x1="0" y1="0" x2="1" y2="0">
										<stop offset="0%" stop-color="#2d8a3e"/>
										<stop offset="50%" stop-color="#5cb870"/>
										<stop offset="100%" stop-color="#2d8a3e"/>
									</linearGradient>
									<radialGradient id="petalG">
										<stop offset="0%" stop-color="#f8c8d8"/>
										<stop offset="100%" stop-color="#e8609a"/>
									</radialGradient>
									<radialGradient id="pistilG">
										<stop offset="0%" stop-color="#ffec99"/>
										<stop offset="100%" stop-color="#e6a800"/>
									</radialGradient>
								</defs>
								<!-- Soil -->
								<ellipse cx="20" cy="50" rx="16" ry="4" fill="#5c3d1e"/>
								<rect x="4" y="46" width="32" height="4" fill="#5c3d1e"/>
								<ellipse cx="20" cy="46" rx="16" ry="5" fill="#7a5230"/>
								<ellipse cx="20" cy="46" rx="16" ry="5" fill="url(#soilSheen)"/>
								<!-- Stem -->
								<rect x="18" y="22" width="4" height="24" rx="1.5" fill="url(#stemG3)"/>
								<!-- Leaves -->
								<path d="M18,34 Q10,32 7,27 Q12,30 18,32Z" fill="#5cb870"/>
								<path d="M18,34 Q10,32 7,27 Q11,30 15,32Z" fill="#8dd89a" opacity="0.5"/>
								<path d="M22,34 Q30,32 33,27 Q28,30 22,32Z" fill="#4a9e5c"/>
								<path d="M22,34 Q30,32 33,27 Q29,30 25,32Z" fill="#6dcc7e" opacity="0.5"/>
								<!-- Petals -->
								<ellipse cx="20" cy="12" rx="5" ry="4" fill="url(#petalG)"/>
								<ellipse cx="12" cy="16" rx="5" ry="3.5" fill="url(#petalG)" transform="rotate(-30 12 16)"/>
								<ellipse cx="28" cy="16" rx="5" ry="3.5" fill="url(#petalG)" transform="rotate(30 28 16)"/>
								<ellipse cx="13" cy="22" rx="4.5" ry="3.5" fill="url(#petalG)" transform="rotate(-70 13 22)"/>
								<ellipse cx="27" cy="22" rx="4.5" ry="3.5" fill="url(#petalG)" transform="rotate(70 27 22)"/>
								<ellipse cx="20" cy="24" rx="4.5" ry="3" fill="url(#petalG)"/>
								<!-- Glow -->
								<circle cx="20" cy="18" r="10" fill="url(#flowerGlow)"/>
								<!-- Pistil -->
								<circle cx="20" cy="18" r="5" fill="url(#pistilG)"/>
								<circle cx="19" cy="17" r="2" fill="#ffec99" opacity="0.6"/>
							</svg>
						{:else if stage.key === 'mature'}
							<svg viewBox="0 0 48 60" class="plant-svg">
								<!-- Soil -->
								<ellipse cx="24" cy="54" rx="18" ry="4" fill="#5c3d1e"/>
								<rect x="6" y="50" width="36" height="4" fill="#5c3d1e"/>
								<ellipse cx="24" cy="50" rx="18" ry="5" fill="#7a5230"/>
								<ellipse cx="24" cy="50" rx="18" ry="5" fill="url(#soilSheen)"/>
								<!-- Trunk -->
								<rect x="20" y="30" width="8" height="20" rx="2" fill="#7a4a2a"/>
								<rect x="24" y="30" width="4" height="20" rx="1" fill="#9a6a42" opacity="0.5"/>
								<!-- Canopy blobs -->
								<circle cx="24" cy="18" r="12" fill="#2d8a3e"/>
								<circle cx="14" cy="22" r="9" fill="#1e6e32"/>
								<circle cx="34" cy="22" r="9" fill="#1e6e32"/>
								<circle cx="20" cy="14" r="8" fill="#3da052"/>
								<circle cx="30" cy="16" r="7" fill="#3da052"/>
								<circle cx="24" cy="10" r="6" fill="#4aba62"/>
								<!-- Highlight patches -->
								<ellipse cx="20" cy="14" rx="5" ry="4" fill="#6dcc7e" opacity="0.4"/>
								<ellipse cx="30" cy="16" rx="4" ry="3" fill="#8dd89a" opacity="0.3"/>
								<circle cx="24" cy="12" r="3" fill="#8dd89a" opacity="0.3"/>
							</svg>
						{:else if stage.key === 'wilting'}
							<svg viewBox="0 0 32 48" class="plant-svg">
								<!-- Dry soil -->
								<ellipse cx="16" cy="42" rx="14" ry="4" fill="#5a4a32"/>
								<rect x="2" y="38" width="28" height="4" fill="#5a4a32"/>
								<ellipse cx="16" cy="38" rx="14" ry="5" fill="#8a7355"/>
								<ellipse cx="16" cy="38" rx="14" ry="5" fill="#a89070" opacity="0.3"/>
								<!-- Drooping stem -->
								<path d="M16,38 Q17,28 20,24" stroke="#8a7a3a" stroke-width="3" fill="none" stroke-linecap="round"/>
								<!-- Wilting leaves -->
								<path d="M20,24 Q24,22 26,19 Q22,21 20,23Z" fill="#a89840"/>
								<path d="M20,24 Q24,22 26,19 Q23,21 21,23Z" fill="#b8a850" opacity="0.5"/>
								<!-- Bud -->
								<circle cx="21" cy="22" r="3" fill="#8b6914"/>
								<circle cx="20" cy="21" r="1.5" fill="#a88030" opacity="0.4"/>
							</svg>
						{/if}
					</div>
					<div class="stage-label">{stage.label}</div>
					<div class="stage-desc">{stage.desc}</div>
				</div>
			{/each}
		</div>

		<!-- Shared SVG defs -->
		<svg style="position:absolute;width:0;height:0;">
			<defs>
				<radialGradient id="soilSheen">
					<stop offset="50%" stop-color="transparent"/>
					<stop offset="100%" stop-color="rgba(168,125,82,0.15)"/>
				</radialGradient>
				<radialGradient id="flowerGlow">
					<stop offset="0%" stop-color="rgba(244,160,192,0.3)"/>
					<stop offset="100%" stop-color="transparent"/>
				</radialGradient>
			</defs>
		</svg>

		<!-- Full Garden Mockup -->
		<h2 class="section-title">Your Garden</h2>
		<div class="garden-bed">
			<!-- Wooden border -->
			<div class="bed-border">
				<div class="bed-corner bed-tl"></div>
				<div class="bed-top"></div>
				<div class="bed-corner bed-tr"></div>
				<div class="bed-side bed-left"></div>
				<div class="bed-inner">
					<!-- Grass tufts along edges -->
					<div class="grass-tuft" style="left:8%;top:5%"><svg viewBox="0 0 12 14" width="12" height="14"><path d="M3,14 L4,6 L5,14" fill="#3a6e2a"/><path d="M5,14 L6,4 L7,14" fill="#4a8e3a"/><path d="M7,14 L8,7 L9,14" fill="#3a6e2a"/></svg></div>
					<div class="grass-tuft" style="right:10%;top:8%"><svg viewBox="0 0 12 14" width="12" height="14"><path d="M3,14 L4,5 L5,14" fill="#4a8e3a"/><path d="M5,14 L6,3 L7,14" fill="#5aae4a"/><path d="M7,14 L8,6 L9,14" fill="#4a8e3a"/></svg></div>
					<div class="grass-tuft" style="left:5%;bottom:12%"><svg viewBox="0 0 12 14" width="12" height="14"><path d="M3,14 L4,7 L5,14" fill="#3a6e2a"/><path d="M5,14 L6,5 L7,14" fill="#4a8e3a"/></svg></div>
					<div class="grass-tuft" style="right:8%;bottom:15%"><svg viewBox="0 0 12 14" width="12" height="14"><path d="M3,14 L4,6 L5,14" fill="#5aae4a"/><path d="M5,14 L6,4 L7,14" fill="#4a8e3a"/><path d="M7,14 L8,7 L9,14" fill="#3a6e2a"/></svg></div>

					<div class="garden-row">
						<!-- Morning Routine - Blooming -->
						<div class="garden-spot">
							<svg viewBox="0 0 40 56" class="plant-svg">
								<ellipse cx="20" cy="50" rx="16" ry="4" fill="#5c3d1e"/>
								<rect x="4" y="46" width="32" height="4" fill="#5c3d1e"/>
								<ellipse cx="20" cy="46" rx="16" ry="5" fill="#7a5230"/>
								<ellipse cx="20" cy="46" rx="16" ry="5" fill="url(#soilSheen)"/>
								<rect x="18" y="22" width="4" height="24" rx="1.5" fill="url(#stemG3)"/>
								<path d="M18,34 Q10,32 7,27 Q12,30 18,32Z" fill="#5cb870"/>
								<path d="M18,34 Q10,32 7,27 Q11,30 15,32Z" fill="#8dd89a" opacity="0.5"/>
								<path d="M22,34 Q30,32 33,27 Q28,30 22,32Z" fill="#4a9e5c"/>
								<path d="M22,34 Q30,32 33,27 Q29,30 25,32Z" fill="#6dcc7e" opacity="0.5"/>
								<ellipse cx="20" cy="12" rx="5" ry="4" fill="url(#petalG)"/>
								<ellipse cx="12" cy="16" rx="5" ry="3.5" fill="url(#petalG)" transform="rotate(-30 12 16)"/>
								<ellipse cx="28" cy="16" rx="5" ry="3.5" fill="url(#petalG)" transform="rotate(30 28 16)"/>
								<ellipse cx="13" cy="22" rx="4.5" ry="3.5" fill="url(#petalG)" transform="rotate(-70 13 22)"/>
								<ellipse cx="27" cy="22" rx="4.5" ry="3.5" fill="url(#petalG)" transform="rotate(70 27 22)"/>
								<ellipse cx="20" cy="24" rx="4.5" ry="3" fill="url(#petalG)"/>
								<circle cx="20" cy="18" r="10" fill="url(#flowerGlow)"/>
								<circle cx="20" cy="18" r="5" fill="url(#pistilG)"/>
								<circle cx="19" cy="17" r="2" fill="#ffec99" opacity="0.6"/>
							</svg>
							<span class="spot-name">Morning Routine</span>
							<span class="spot-streak">🔥 7 days</span>
						</div>
						<!-- Wind Down - Growing -->
						<div class="garden-spot">
							<svg viewBox="0 0 32 52" class="plant-svg">
								<ellipse cx="16" cy="46" rx="14" ry="4" fill="#5c3d1e"/>
								<rect x="2" y="42" width="28" height="4" fill="#5c3d1e"/>
								<ellipse cx="16" cy="42" rx="14" ry="5" fill="#7a5230"/>
								<ellipse cx="16" cy="42" rx="14" ry="5" fill="url(#soilSheen)"/>
								<rect x="14" y="18" width="4" height="24" rx="1.5" fill="url(#stemG2)"/>
								<path d="M14,32 Q8,30 6,26 Q10,28 14,30Z" fill="#5cb870"/>
								<path d="M14,32 Q8,30 6,26 Q9,28 12,30Z" fill="#8dd89a" opacity="0.5"/>
								<path d="M15,20 Q8,18 6,13 Q10,16 15,18Z" fill="#5cb870"/>
								<path d="M15,20 Q8,18 6,13 Q9,16 12,18Z" fill="#8dd89a" opacity="0.5"/>
								<path d="M17,20 Q24,18 26,13 Q22,16 17,18Z" fill="#4a9e5c"/>
								<path d="M17,20 Q24,18 26,13 Q23,16 20,18Z" fill="#6dcc7e" opacity="0.5"/>
								<circle cx="16" cy="16" r="3.5" fill="#f4a0c0"/>
								<circle cx="15" cy="15" r="1.5" fill="#f8c8d8" opacity="0.5"/>
							</svg>
							<span class="spot-name">Wind Down</span>
							<span class="spot-streak">🔥 3 days</span>
						</div>
						<!-- Focus - Seed -->
						<div class="garden-spot">
							<svg viewBox="0 0 32 40" class="plant-svg">
								<ellipse cx="16" cy="34" rx="14" ry="4" fill="#5c3d1e"/>
								<rect x="2" y="30" width="28" height="4" fill="#5c3d1e"/>
								<ellipse cx="16" cy="30" rx="14" ry="5" fill="#7a5230"/>
								<ellipse cx="16" cy="30" rx="14" ry="5" fill="url(#soilSheen)"/>
								<ellipse cx="16" cy="28" rx="4" ry="3" fill="#c9a54e"/>
								<ellipse cx="15" cy="27" rx="2" ry="1.5" fill="#e0c36a" opacity="0.6"/>
							</svg>
							<span class="spot-name">Focus</span>
							<span class="spot-streak new">New</span>
						</div>
					</div>
					<div class="garden-row">
						<!-- Fitness - Mature -->
						<div class="garden-spot">
							<svg viewBox="0 0 48 60" class="plant-svg-lg">
								<ellipse cx="24" cy="54" rx="18" ry="4" fill="#5c3d1e"/>
								<rect x="6" y="50" width="36" height="4" fill="#5c3d1e"/>
								<ellipse cx="24" cy="50" rx="18" ry="5" fill="#7a5230"/>
								<ellipse cx="24" cy="50" rx="18" ry="5" fill="url(#soilSheen)"/>
								<rect x="20" y="30" width="8" height="20" rx="2" fill="#7a4a2a"/>
								<rect x="24" y="30" width="4" height="20" rx="1" fill="#9a6a42" opacity="0.5"/>
								<circle cx="24" cy="18" r="12" fill="#2d8a3e"/>
								<circle cx="14" cy="22" r="9" fill="#1e6e32"/>
								<circle cx="34" cy="22" r="9" fill="#1e6e32"/>
								<circle cx="20" cy="14" r="8" fill="#3da052"/>
								<circle cx="30" cy="16" r="7" fill="#3da052"/>
								<circle cx="24" cy="10" r="6" fill="#4aba62"/>
								<ellipse cx="20" cy="14" rx="5" ry="4" fill="#6dcc7e" opacity="0.4"/>
								<ellipse cx="30" cy="16" rx="4" ry="3" fill="#8dd89a" opacity="0.3"/>
								<circle cx="24" cy="12" r="3" fill="#8dd89a" opacity="0.3"/>
							</svg>
							<span class="spot-name">Fitness</span>
							<span class="spot-streak">🔥 21 days</span>
						</div>
						<!-- Reading - Wilting -->
						<div class="garden-spot wilt">
							<svg viewBox="0 0 32 48" class="plant-svg">
								<ellipse cx="16" cy="42" rx="14" ry="4" fill="#5a4a32"/>
								<rect x="2" y="38" width="28" height="4" fill="#5a4a32"/>
								<ellipse cx="16" cy="38" rx="14" ry="5" fill="#8a7355"/>
								<ellipse cx="16" cy="38" rx="14" ry="5" fill="#a89070" opacity="0.3"/>
								<path d="M16,38 Q17,28 20,24" stroke="#8a7a3a" stroke-width="3" fill="none" stroke-linecap="round"/>
								<path d="M20,24 Q24,22 26,19 Q22,21 20,23Z" fill="#a89840"/>
								<path d="M20,24 Q24,22 26,19 Q23,21 21,23Z" fill="#b8a850" opacity="0.5"/>
								<circle cx="21" cy="22" r="3" fill="#8b6914"/>
								<circle cx="20" cy="21" r="1.5" fill="#a88030" opacity="0.4"/>
							</svg>
							<span class="spot-name wilt-name">Reading</span>
							<span class="spot-streak wilt-streak">⚠ At risk</span>
						</div>
					</div>
				</div>
				<div class="bed-side bed-right"></div>
				<div class="bed-corner bed-bl"></div>
				<div class="bed-bottom"></div>
				<div class="bed-corner bed-br"></div>
			</div>
		</div>

		<!-- Sparkle key -->
		<p class="footnote">✨ Blooming & Mature plants shimmer gently</p>
	</div>
</div>

<style>
	.scene {
		min-height: 100vh;
		background: linear-gradient(180deg, #1a2a4a 0%, #2a3a5a 15%, #1a3a2a 40%, #0d1f0d 100%);
		padding: 1.5rem 1rem;
	}
	.content {
		max-width: 28rem;
		margin: 0 auto;
	}
	.title {
		font-size: 1.5rem;
		font-weight: 700;
		color: #e8dcc8;
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
		color: #e8dcc8;
		margin-bottom: 1rem;
	}
	.footnote {
		font-size: 0.7rem;
		color: #5a7a5a;
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
		filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
	}
	.plant-svg-lg {
		width: 56px;
		height: auto;
		max-height: 100px;
		filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35));
	}
	.stage-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: #e8dcc8;
	}
	.stage-desc {
		font-size: 0.625rem;
		color: #7a8a6a;
	}

	/* Garden bed */
	.garden-bed {
		padding: 0;
	}
	.bed-border {
		display: grid;
		grid-template-columns: 12px 1fr 12px;
		grid-template-rows: 12px 1fr 12px;
		border-radius: 16px;
		overflow: hidden;
		background: #3a2810;
	}
	.bed-corner {
		background: #5a4020;
	}
	.bed-tl { border-radius: 16px 0 0 0; }
	.bed-tr { border-radius: 0 16px 0 0; }
	.bed-bl { border-radius: 0 0 0 16px; }
	.bed-br { border-radius: 0 0 16px 0; }
	.bed-top {
		background: linear-gradient(180deg, #6a5030, #5a4020);
	}
	.bed-bottom {
		background: linear-gradient(180deg, #5a4020, #4a3018);
	}
	.bed-left {
		background: linear-gradient(90deg, #5a4020, #4a3018);
	}
	.bed-right {
		background: linear-gradient(90deg, #4a3018, #5a4020);
	}
	.bed-inner {
		background:
			radial-gradient(ellipse at 50% 90%, rgba(74,50,20,0.5) 0%, transparent 60%),
			linear-gradient(180deg, #1a3a1a 0%, #142814 40%, #1a2a10 100%);
		padding: 20px 12px;
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	/* Grass tufts */
	.grass-tuft {
		position: absolute;
		opacity: 0.6;
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
		color: #e8dcc8;
		text-align: center;
	}
	.spot-streak {
		font-size: 0.625rem;
		color: #7a9a6a;
		text-align: center;
	}
	.spot-streak.new {
		color: #5a7a4a;
	}
	.wilt-name {
		color: #d4a040;
	}
	.wilt-streak {
		color: #d4a040 !important;
	}

	/* Wilting dimmer */
	.wilt .plant-svg {
		opacity: 0.85;
		filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)) saturate(0.7);
	}
</style>