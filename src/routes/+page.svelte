<script>
	import QuestionCard from '$lib/components/QuestionCard.svelte';

	export let data;

	$: totalPages = Math.max(1, Math.ceil(data.total / data.perPage));
</script>

<svelte:head>
	<title>Wargi Tani — Forum Tanya Jawab Pertanian</title>
</svelte:head>

<section class="mb-6">
	<h1 class="text-2xl font-bold text-primary-800 mb-1">Pertanyaan Terbaru</h1>
	<p class="text-earth-600 text-sm">
		Diskusi seputar masalah tanaman dari petani, mahasiswa, penyuluh, dan masyarakat umum.
	</p>
</section>

<form action="/" class="flex flex-wrap gap-2 mb-4 sm:hidden">
	<input class="input" type="search" name="q" placeholder="Cari pertanyaan..." value={data.q} />
</form>

<div class="flex flex-wrap gap-2 mb-6">
	<a
		href="/"
		class="text-xs px-3 py-1 rounded-full border {data.categorySlug === ''
			? 'bg-primary-600 text-white border-primary-600'
			: 'border-primary-200 text-primary-700'}"
	>
		Semua
	</a>
	{#each data.categories as c}
		<a
			href={`/?kategori=${c.slug}`}
			class="text-xs px-3 py-1 rounded-full border {data.categorySlug === c.slug
				? 'bg-primary-600 text-white border-primary-600'
				: 'border-primary-200 text-primary-700'}"
		>
			{c.name}
		</a>
	{/each}
</div>

{#if data.questions.length === 0}
	<div class="card text-center py-10 text-earth-500">
		{#if data.q}
			Tidak ada pertanyaan yang cocok dengan pencarian "{data.q}".
		{:else}
			Belum ada pertanyaan. Jadilah yang pertama bertanya!
		{/if}
	</div>
{:else}
	<div class="space-y-3">
		{#each data.questions as question (question.id)}
			<QuestionCard {question} />
		{/each}
	</div>

	{#if totalPages > 1}
		<div class="flex justify-center gap-2 mt-6 text-sm">
			{#each Array(totalPages) as _, i}
				<a
					href={`/?page=${i + 1}${data.categorySlug ? `&kategori=${data.categorySlug}` : ''}${data.q ? `&q=${data.q}` : ''}`}
					class="w-8 h-8 flex items-center justify-center rounded-lg border {data.page === i + 1
						? 'bg-primary-600 text-white border-primary-600'
						: 'border-earth-200 text-earth-600'}"
				>
					{i + 1}
				</a>
			{/each}
		</div>
	{/if}
{/if}
