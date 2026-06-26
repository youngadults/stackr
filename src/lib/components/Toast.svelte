<script lang="ts">
	type ToastType = 'success' | 'xp' | 'streak' | 'levelup' | 'achievement' | 'info' | 'error';

	interface ToastItem {
		id: number;
		type: ToastType;
		message: string;
		detail?: string;
		icon?: string;
	}

	let toasts = $state<ToastItem[]>([]);
	let nextId = 0;

	export function show(type: ToastType, message: string, detail?: string, icon?: string) {
		const id = nextId++;
		toasts.push({ id, type, message, detail, icon });
		setTimeout(() => {
			toasts = toasts.filter(t => t.id !== id);
		}, 2500);
	}

	const TYPE_STYLES: Record<ToastType, string> = {
		success: 'bg-emerald-600/90 border-emerald-500/50',
		xp: 'bg-indigo-600/90 border-indigo-500/50',
		streak: 'bg-orange-600/90 border-orange-500/50',
		levelup: 'bg-amber-600/90 border-amber-500/50',
		achievement: 'bg-yellow-600/90 border-yellow-500/50',
		info: 'bg-slate-700/90 border-slate-600/50',
		error: 'bg-red-600/90 border-red-500/50',
	};
</script>

<div class="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
	{#each toasts as toast (toast.id)}
		<div
			class="px-4 py-2.5 rounded-xl border backdrop-blur-sm text-white text-sm font-medium shadow-lg animate-slide-down flex items-center gap-2 {TYPE_STYLES[toast.type]}"
		>
			{#if toast.icon}
				<span class="text-lg">{toast.icon}</span>
			{/if}
			<div class="flex flex-col">
				<span>{toast.message}</span>
				{#if toast.detail}
					<span class="text-xs opacity-80">{toast.detail}</span>
				{/if}
			</div>
		</div>
	{/each}
</div>

<style>
	@keyframes slideDown {
		from {
			transform: translateY(-20px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
	.animate-slide-down {
		animation: slideDown 0.25s ease-out;
	}
</style>