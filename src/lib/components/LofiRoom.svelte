<script lang="ts">
	// Lofi room hero — one cozy pixel-art room built from 16px CC0 tiles.
	// Stage-gated reveals; mood (night/day + sleepy) is pure CSS.
	import { ROOM_ITEMS, ROOM_GRID, TILE_URLS, LAMP_SPOT, WINDOW_SPOT } from '$lib/room/layout';
	import { STAGE_NAMES, type RoomMood, type RoomPeriod } from '$lib/room/room-stage';

	interface Props {
		stage: number;
		mood: RoomMood;
	}

	let { stage, mood }: Props = $props();

	const { cols, rows } = ROOM_GRID;

	// Explicit lookup tables — never dynamic class interpolation
	const GLOW_CLASS: Record<RoomPeriod, { awake: string; dim: string }> = {
		day: { awake: 'lofi-glow-day', dim: 'lofi-glow-dim' },
		night: { awake: 'lofi-glow-night', dim: 'lofi-glow-dim' }
	};
	const TINT_CLASS: Record<RoomPeriod, string> = {
		day: 'lofi-tint-day',
		night: 'lofi-tint-night'
	};

	let visibleItems = $derived(
		ROOM_ITEMS.filter((item) => stage >= item.stage && (item.until === undefined || stage < item.until))
	);

	let hasStringLights = $derived(stage >= 6);
	let isNight = $derived(mood.period === 'night');

	// percent-of-scene geometry helpers (tile units -> fractions of the hero)
	let pctX = (x: number) => `${((x / cols) * 100).toFixed(4)}%`;
	let pctY = (y: number) => `${((y / rows) * 100).toFixed(4)}%`;
	let pctW = (w: number) => `${((w / cols) * 100).toFixed(4)}%`;

	// lamp glow center
	let lampLeft = `${((LAMP_SPOT.x / cols) * 100).toFixed(4)}%`;
	let lampTop = `${((LAMP_SPOT.y / rows) * 100).toFixed(4)}%`;

	// rain falls inside the window glass, slightly inset from the frame
	let rainX = WINDOW_SPOT.x + 0.15;
	let rainY = WINDOW_SPOT.y + 0.15;
	let rainW = WINDOW_SPOT.w - 0.3;
	let rainH = WINDOW_SPOT.h - 0.275;
</script>

<section
	class="lofi-room relative mx-auto my-6 w-[min(96vw,40rem,52vh)] overflow-hidden rounded-2xl border border-violet-900/50 shadow-xl"
	role="img"
	aria-label={`Reward room at stage ${stage} of ${STAGE_NAMES.length}: ${STAGE_NAMES[stage - 1]}`}
	data-test="lofi-room-hero"
	style="--wall-tile: url({TILE_URLS.wall}); --wall-base-tile: url({TILE_URLS.wallBase}); --floor-tile: url({TILE_URLS.floor});"
>
	<div
		class="lofi-scene relative w-full"
		style="aspect-ratio: 4 / 5;"
	>
		<!-- background layers: wall body (1 tile) + baseboard (half tile) + floor -->
		<div class="lofi-wall" aria-hidden="true"></div>
		<div class="lofi-wall-base" aria-hidden="true"></div>
		<div class="lofi-floor" aria-hidden="true"></div>

		<!-- stage-gated furniture (array order = painter order) -->
		{#each visibleItems as item (item.id)}
			<img
				src={item.src}
				alt={item.alt}
				class="lofi-item"
				data-test={`lofi-item-${item.id}`}
				style:left={pctX(item.x)}
				style:top={pctY(item.y)}
				style:width={pctW(item.w)}
				draggable="false"
			/>
		{/each}

		<!-- string-light strand, revealed with the media shelf -->
		{#if hasStringLights}
			<div class="lofi-string" aria-hidden="true"></div>
			<div class="lofi-string lofi-string-blur" aria-hidden="true"></div>
		{/if}

		<!-- warm lamp glow (dimmed when sleepy) -->
		<div
			class="lofi-glow {GLOW_CLASS[mood.period][mood.sleepy ? 'dim' : 'awake']}"
			style="--lamp-x: {lampLeft}; --lamp-y: {lampTop};"
			aria-hidden="true"
		></div>

		<!-- rain streaks, clipped to the window glass at night -->
		{#if isNight}
			<div
				class="lofi-rain lofi-rain-a"
				style:left={pctX(rainX)}
				style:top={pctY(rainY)}
				style:width={pctW(rainW)}
				style:height={pctY(rainH)}
				aria-hidden="true"
			></div>
			<div
				class="lofi-rain lofi-rain-b"
				style:left={pctX(rainX)}
				style:top={pctY(rainY)}
				style:width={pctW(rainW)}
				style:height={pctY(rainH)}
				aria-hidden="true"
			></div>
		{/if}

		<!-- film grain (night only) -->
		{#if isNight}
			<div class="lofi-grain" aria-hidden="true"></div>
		{/if}

		<!-- dusk palette tint + extra sleepy dim (progress never regresses) -->
		<div class="lofi-tint {TINT_CLASS[mood.period]}" aria-hidden="true"></div>
		{#if mood.sleepy}
			<div class="lofi-sleepy" aria-hidden="true"></div>
		{/if}
	</div>
</section>

<style>
	.lofi-scene {
		image-rendering: pixelated;
		background: #b4a78c;
	}
	.lofi-wall,
	.lofi-wall-base,
	.lofi-floor {
		position: absolute;
		left: 0;
		width: 100%;
		image-rendering: pixelated;
		pointer-events: none;
	}
	/* wall body: rows 0-1 (each tile = 8% of scene height on the 12.5-row grid) */
	.lofi-wall {
		top: 0;
		height: 8%;
		background-image: var(--wall-tile);
		background-size: 10% 100%;
	}
	/* baseboard: half tile below the wall body */
	.lofi-wall-base {
		top: 8%;
		height: 4%;
		background-image: var(--wall-base-tile);
		background-size: 10% 100%;
	}
	/* floor: rows 1.5-12.5 */
	.lofi-floor {
		top: 12%;
		height: 88%;
		background-image: var(--floor-tile);
		background-size: 10% 9.0909%;
	}
	.lofi-item {
		position: absolute;
		height: auto;
		image-rendering: pixelated;
		pointer-events: none;
		user-select: none;
	}
	.lofi-glow {
		position: absolute;
		inset: 0;
		pointer-events: none;
		mix-blend-mode: screen;
		background: radial-gradient(
			circle at var(--lamp-x, 92.5%) var(--lamp-y, 12.8%),
			rgba(255, 176, 86, 0.55) 0%,
			rgba(255, 156, 64, 0.22) 18%,
			rgba(255, 140, 60, 0.08) 34%,
			transparent 58%
		);
	}
	.lofi-glow-night {
		opacity: 0.9;
	}
	.lofi-glow-day {
		opacity: 0.28;
	}
	.lofi-glow-dim {
		opacity: 0.4;
	}
	.lofi-rain {
		position: absolute;
		pointer-events: none;
		overflow: hidden;
	}
	.lofi-rain-a {
		background-image: linear-gradient(
			180deg,
			transparent 0%,
			transparent 42%,
			rgba(196, 212, 238, 0.55) 42%,
			rgba(196, 212, 238, 0.55) 58%,
			transparent 58%
		);
		background-size: 6px 18px;
		animation: lofi-rain-fall-a 0.66s steps(2, end) infinite;
	}
	.lofi-rain-b {
		background-image: linear-gradient(
			180deg,
			transparent 0%,
			transparent 20%,
			rgba(196, 212, 238, 0.32) 20%,
			rgba(196, 212, 238, 0.32) 40%,
			transparent 40%
		);
		background-size: 9px 26px;
		animation: lofi-rain-fall-b 1.06s steps(3, end) infinite;
	}
	@keyframes lofi-rain-fall-a {
		from {
			background-position: 0 0;
		}
		to {
			background-position: 0 18px;
		}
	}
	@keyframes lofi-rain-fall-b {
		from {
			background-position: 0 0;
		}
		to {
			background-position: 0 26px;
		}
	}
	.lofi-grain {
		position: absolute;
		inset: 0;
		pointer-events: none;
		mix-blend-mode: overlay;
		opacity: 0.09;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E");
	}
	.lofi-string {
		position: absolute;
		left: 3%;
		right: 3%;
		top: 4.5%;
		height: 0.4rem;
		pointer-events: none;
		background-image: radial-gradient(circle, rgba(255, 206, 122, 0.95) 0 1px, rgba(255, 206, 122, 0) 1.6px);
		background-size: 1.1rem 0.4rem;
		background-repeat: repeat-x;
	}
	.lofi-string-blur {
		filter: blur(2.5px);
		opacity: 0.85;
	}
	.lofi-tint {
		position: absolute;
		inset: 0;
		pointer-events: none;
		mix-blend-mode: multiply;
	}
	.lofi-tint-night {
		background: linear-gradient(
			180deg,
			rgba(58, 36, 88, 0.5) 0%,
			rgba(66, 40, 96, 0.38) 34%,
			rgba(52, 30, 76, 0.3) 60%,
			rgba(30, 18, 50, 0.4) 100%
		);
	}
	.lofi-tint-day {
		mix-blend-mode: soft-light;
		background: linear-gradient(180deg, rgba(255, 216, 150, 0.5) 0%, rgba(255, 200, 130, 0.22) 60%);
	}
	.lofi-sleepy {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background:
			radial-gradient(ellipse at 50% 46%, rgba(44, 26, 72, 0.18) 0%, rgba(24, 14, 44, 0.55) 100%);
	}
</style>