<script>
	import { enhance } from '$app/forms';
	export let data;
</script>

<svelte:head><title>Notifikasi — Wargi Tani</title></svelte:head>

<div class="flex items-center justify-between mb-4">
	<h1 class="text-xl font-bold text-primary-800">Notifikasi</h1>
	<form method="POST" action="?/markAllRead" use:enhance>
		<button class="text-sm text-primary-700 hover:underline" type="submit">Tandai semua dibaca</button>
	</form>
</div>

{#if data.notifications.length === 0}
	<p class="text-earth-500 text-sm">Belum ada notifikasi.</p>
{:else}
	<div class="space-y-2">
		{#each data.notifications as n (n.id)}
			<div class="card flex items-start justify-between gap-3 {n.is_read ? '' : 'border-primary-300 bg-primary-50/40'}">
				<a href={n.link ?? '#'} class="text-sm text-earth-800 flex-1">
					{n.message}
					<div class="text-xs text-earth-400 mt-1">{new Date(n.created_at).toLocaleString('id-ID')}</div>
				</a>
				{#if !n.is_read}
					<form method="POST" action="?/markRead" use:enhance>
						<input type="hidden" name="id" value={n.id} />
						<button class="text-xs text-primary-600 hover:underline" type="submit">Tandai dibaca</button>
					</form>
				{/if}
			</div>
		{/each}
	</div>
{/if}
