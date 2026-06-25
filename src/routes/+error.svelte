<script lang="ts">
	import { page } from '$app/state';

	let status = $derived(page.status);
	let message = $derived(page.error?.message ?? 'Something went wrong');
</script>

<div class="min-h-screen flex items-center justify-center px-4 bg-slate-950">
	<div class="text-center">
		<div class="text-6xl mb-4">😵</div>
		<h1 class="text-2xl font-bold text-white mb-2">{status}</h1>
		<p class="text-slate-400 mb-6">{message}</p>
		<a href="/" class="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition-colors">
			Go Home
		</a>
	</div>
</div>