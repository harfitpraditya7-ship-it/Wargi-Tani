<script>
	import QuestionCard from '$lib/components/QuestionCard.svelte';
	export let data;
</script>

<svelte:head><title>Pertanyaan Tersimpan — Wargi Tani</title></svelte:head>

<h1 class="text-xl font-bold text-primary-800 mb-4">Pertanyaan Tersimpan</h1>

{#if data.questions.length === 0}
	<p class="text-earth-500 text-sm">Belum ada pertanyaan yang disimpan.</p>
{:else}
	<div class="space-y-3">
		{#each data.questions as question (question.id)}
			<QuestionCard {question} />
		{/each}
	</div>
{/if}
