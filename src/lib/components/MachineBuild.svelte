<script lang="ts">
	// Machine theme — vintage radio that assembles part-by-part: each full
	// stack day fits the next part (case → speaker grill → tuning dial →
	// knobs → antenna → glow). Deterministic details per stack seed.
	import {
		hashSeed,
		SOIL_TOP,
		SOIL_FRONT,
		SOIL_SIDE,
		SOIL_GRADIENTS,
		PLANT_VIEWBOX
	} from '$lib/utils/plant-renderer';
	import { MACHINE_PARTS } from '$lib/utils/plant-growth';

	interface Props {
		stepsBuilt: number; // 0-6 completed parts
		progress: number; // 0-1 toward the next part
		seed: string;
		class?: string;
	}

	let { stepsBuilt, progress, seed, class: cls = '' }: Props = $props();

	const MAX_PARTS = MACHINE_PARTS.length;
	const idp = $derived(`mc-${hashSeed(seed).toString(36)}`);
	const built = $derived(Math.max(0, Math.min(MAX_PARTS, Math.round(stepsBuilt))));
	// Ghost of the NEXT part — fills in as progress accumulates
	const ghost = $derived(built >= MAX_PARTS ? 0 : 0.1 + 0.3 * Math.max(0, Math.min(1, progress)));

	// Explicit seeded lookup maps — static values, no dynamic class interpolation
	const CASE_WOODS: Record<number, { face: string; edge: string }> = {
		0: { face: '#8a5a28', edge: '#4a2c10' },
		1: { face: '#7a4a20', edge: '#442810' },
		2: { face: '#9a6a32', edge: '#54300f' }
	};
	const variant = $derived(hashSeed(seed));
	const wood = $derived(CASE_WOODS[variant % 3]);
	const grillSlots = $derived(3 + (variant % 3)); // 3-5 vertical slots
	const needleAngle = $derived(-55 + (variant % 110)); // dial needle rest angle

	const slotX = $derived.by(() => {
		const slots: number[] = [];
		for (let i = 0; i < grillSlots; i++) {
			slots.push(12 + i * (12 / Math.max(1, grillSlots - 1)));
		}
		return slots;
	});
</script>

<svg viewBox={PLANT_VIEWBOX} class={cls} role="img" data-test="machine-build" aria-label="Machine: {built} of {MAX_PARTS} parts assembled">
	<defs>
		<linearGradient id="{idp}-top" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0%" stop-color={SOIL_GRADIENTS.soilTop.from} />
			<stop offset="100%" stop-color={SOIL_GRADIENTS.soilTop.to} />
		</linearGradient>
		<linearGradient id="{idp}-front" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0%" stop-color={SOIL_GRADIENTS.soilFront.from} />
			<stop offset="100%" stop-color={SOIL_GRADIENTS.soilFront.to} />
		</linearGradient>
		<radialGradient id="{idp}-glow" cx="0.5" cy="0.5" r="0.5">
			<stop offset="0%" stop-color="#ffca6a" stop-opacity="0.9" />
			<stop offset="60%" stop-color="#ff9e3e" stop-opacity="0.35" />
			<stop offset="100%" stop-color="#ff9e3e" stop-opacity="0" />
		</radialGradient>
	</defs>

	<!-- soil diamond pad -->
	<polygon points={SOIL_TOP} fill="url(#{idp}-top)" />
	<polygon points={SOIL_FRONT} fill="url(#{idp}-front)" />
	<polygon points={SOIL_SIDE} fill={SOIL_GRADIENTS.soilSide.from} />

	<!-- glow (part 6) -->
	<ellipse
		cx="32" cy="64" rx="29" ry="23"
		fill="url(#{idp}-glow)"
		opacity={built >= 6 ? 0.75 : built >= 5 ? ghost * 0.6 : 0}
	/>

	<!-- antenna (part 5) -->
	<g opacity={built >= 5 ? 1 : built === 4 ? ghost : 0}>
		<line x1="44" y1="52" x2="54" y2="30" stroke="#9a9484" stroke-width="2" stroke-linecap="square" />
		<circle cx="54" cy="30" r="2" fill="#c9c2ae" />
	</g>

	<!-- broadcast rays (with glow) -->
	{#if built >= 6}
		<g fill="#ffca6a" opacity="0.85">
			<rect x="25" y="45" width="2" height="5" />
			<rect x="31" y="43" width="2" height="7" />
			<rect x="37" y="45" width="2" height="5" />
		</g>
	{/if}

	<!-- case (part 1) -->
	<g opacity={built >= 1 ? 1 : built === 0 ? ghost : 0}>
		<rect x="10" y="76" width="6" height="3" fill={wood.edge} />
		<rect x="48" y="76" width="6" height="3" fill={wood.edge} />
		<rect x="6" y="52" width="52" height="24" rx="3" fill={wood.face} stroke={wood.edge} stroke-width="1.4" />
		<rect x="8" y="54" width="48" height="2" fill="#b07a42" opacity="0.55" />
	</g>

	<!-- speaker grill (part 2) -->
	<g opacity={built >= 2 ? 1 : built === 1 ? ghost : 0}>
		<rect x="10" y="58" width="18" height="15" rx="2" fill="#3a2810" />
		{#each slotX as sx, i (i)}
			<rect x={sx} y="60" width="2" height="11" fill="#c9a86a" opacity="0.75" />
		{/each}
	</g>

	<!-- tuning dial (part 3) -->
	<g opacity={built >= 3 ? 1 : built === 2 ? ghost : 0}>
		<circle cx="39" cy="65" r="6.5" fill="#f0e0c0" stroke="#4a2c10" stroke-width="1.4" />
		<line
			x1="39"
			y1="65"
			x2={39 + 4.8 * Math.sin((needleAngle * Math.PI) / 180)}
			y2={65 - 4.8 * Math.cos((needleAngle * Math.PI) / 180)}
			stroke="#d84040"
			stroke-width="1.6"
			stroke-linecap="square"
		/>
		<rect x="38" y="62" width="2" height="2" fill="#4a2c10" />
	</g>

	<!-- knobs (part 4) -->
	<g opacity={built >= 4 ? 1 : built === 3 ? ghost : 0}>
		<circle cx="51" cy="59" r="2.6" fill="#d8c8a8" stroke="#4a2c10" stroke-width="1" />
		<line x1="51" y1="59" x2="51" y2="57" stroke="#4a2c10" stroke-width="1" />
		<circle cx="51" cy="66" r="2.6" fill="#d8c8a8" stroke="#4a2c10" stroke-width="1" />
		<line x1="51" y1="66" x2="53" y2="68" stroke="#4a2c10" stroke-width="1" />
	</g>

	<!-- on-light indicator -->
	{#if built >= 6}
		<circle cx="46" cy="54.5" r="1.3" fill="#ffd966" />
		<circle cx="46" cy="54.5" r="0.6" fill="#fff3cc" />
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