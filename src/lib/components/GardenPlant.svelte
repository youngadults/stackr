<script lang="ts">
	// Cozy garden plant — deterministic L-system per stack seed, rendered as
	// warm-palette SVG over the isometric soil diamond (garden visual language).
	import {
		buildPlantArt,
		plantIdPrefix,
		PLANT_VIEWBOX,
		SOIL_TOP,
		SOIL_FRONT,
		SOIL_SIDE,
		SOIL_GRADIENTS
	} from '$lib/utils/plant-renderer';

	interface Props {
		stage: number; // 0-4: seed, sprout, growing, blooming, mature
		progress: number; // 0-1 within stage
		wilting?: boolean;
		seed: string; // stack id — same seed, same plant, forever
		class?: string;
	}

	let { stage, progress, wilting = false, seed, class: cls = '' }: Props = $props();

	const idp = $derived(plantIdPrefix(seed));
	const art = $derived(buildPlantArt(seed, stage, progress, wilting));

	// Explicit fill lookup — safe static values, no dynamic class interpolation
	const soilFills = $derived(
		wilting
			? { top: `url(#${idp}-dry-top)`, front: `url(#${idp}-dry-front)`, side: SOIL_GRADIENTS.drySoilFront.to }
			: { top: `url(#${idp}-top)`, front: `url(#${idp}-front)`, side: SOIL_GRADIENTS.soilSide.from }
	);
	const mood = $derived(wilting ? 'filter: saturate(0.5) brightness(0.92);' : '');
</script>

<svg viewBox={PLANT_VIEWBOX} class={cls} role="img" data-test="garden-plant">
	<defs>
			<linearGradient id="{idp}-top" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color={SOIL_GRADIENTS.soilTop.from} />
				<stop offset="100%" stop-color={SOIL_GRADIENTS.soilTop.to} />
			</linearGradient>
			<linearGradient id="{idp}-front" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color={SOIL_GRADIENTS.soilFront.from} />
				<stop offset="100%" stop-color={SOIL_GRADIENTS.soilFront.to} />
			</linearGradient>
			<linearGradient id="{idp}-dry-top" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color={SOIL_GRADIENTS.drySoilTop.from} />
				<stop offset="100%" stop-color={SOIL_GRADIENTS.drySoilTop.to} />
			</linearGradient>
			<linearGradient id="{idp}-dry-front" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color={SOIL_GRADIENTS.drySoilFront.from} />
				<stop offset="100%" stop-color={SOIL_GRADIENTS.drySoilFront.to} />
			</linearGradient>
		</defs>

	<!-- soil diamond -->
	<polygon points={SOIL_TOP} fill={soilFills.top} />
	<polygon points={SOIL_FRONT} fill={soilFills.front} />
	<polygon points={SOIL_SIDE} fill={soilFills.side} />

	{#if stage === 0}
		<!-- seed grain -->
		<rect x="28" y="76" width="8" height="4" fill="#c9a54e" />
		<rect x="29" y="77" width="4" height="2" fill="#e0c36a" opacity="0.6" />
	{:else if art.hasFoliage}
		<g style={mood} class="plant-body">
			{#each art.lines as line (line.pts)}
				<polyline
					points={line.pts}
					fill="none"
					stroke={line.color}
					stroke-width={line.width}
					stroke-linecap="square"
					stroke-linejoin="round"
				/>
			{/each}
			{#each art.leaves as leaf, i (i)}
				<rect
					x={leaf.x - leaf.size / 2}
					y={leaf.y - leaf.size / 2}
					width={leaf.size}
					height={leaf.size}
					fill={leaf.color}
					transform="rotate({leaf.rot} {leaf.x} {leaf.y})"
					opacity="0.9"
				/>
			{/each}
			{#each art.blooms as bloom, i (i)}
				<g>
					<rect x={bloom.x - 3} y={bloom.y - 3} width="6" height="6" fill={bloom.petals} />
					<rect x={bloom.x - 4} y={bloom.y - 1} width="2" height="2" fill={bloom.color} />
					<rect x={bloom.x + 2} y={bloom.y - 1} width="2" height="2" fill={bloom.color} />
					<rect x={bloom.x - 1} y={bloom.y - 4} width="2" height="2" fill={bloom.color} />
					<rect x={bloom.x - 1.5} y={bloom.y - 1.5} width="3" height="3" fill={bloom.knot} />
				</g>
			{/each}
		</g>
	{/if}
</svg>

<style>
	svg {
		image-rendering: pixelated;
		filter: drop-shadow(0 3px 4px rgba(0, 0, 0, 0.4));
		height: 100%;
		width: 100%;
		display: block;
	}
</style>