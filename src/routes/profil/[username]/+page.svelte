<script>
	export let data;
	$: p = data.profile;

	const roleLabel = { user: 'Anggota', penyuluh: 'Penyuluh Pertanian', admin: 'Admin' };
</script>

<svelte:head><title>{p.username} — Wargi Tani</title></svelte:head>

<div class="card mb-6">
	<h1 class="text-xl font-bold text-primary-800">{p.full_name || p.username}</h1>
	<p class="text-earth-500 text-sm">@{p.username} · {roleLabel[p.role] ?? p.role}</p>
	{#if p.bio}<p class="text-earth-700 mt-2">{p.bio}</p>{/if}
	<div class="flex gap-4 mt-3 text-sm">
		<span><strong class="text-primary-700">{p.reputation}</strong> reputasi</span>
		<span class="text-earth-400">Bergabung {new Date(p.created_at).toLocaleDateString('id-ID')}</span>
	</div>
</div>

<h2 class="font-semibold text-earth-800 mb-2">Pertanyaan ({data.questions.length})</h2>
<div class="space-y-2">
	{#each data.questions as q (q.id)}
		<a href={`/pertanyaan/${q.id}`} class="card block hover:border-primary-300">
			<p class="font-medium text-earth-900">{q.title}</p>
			<p class="text-xs text-earth-500 mt-1">{q.vote_score} suara · {q.answers_count} jawaban</p>
		</a>
	{/each}
</div>
