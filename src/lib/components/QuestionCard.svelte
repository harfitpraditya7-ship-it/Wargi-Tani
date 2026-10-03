<script>
	export let question;
</script>

<a href={`/pertanyaan/${question.id}`} class="card flex gap-4 hover:border-primary-300 transition-colors">
	<div class="flex flex-col items-center justify-center w-16 shrink-0 text-earth-600">
		<span class="text-lg font-bold text-primary-700">{question.vote_score}</span>
		<span class="text-xs">suara</span>
		<span class="text-xs mt-1">{question.answers_count ?? 0} jwb</span>
	</div>
	<div class="min-w-0 flex-1">
		<h3 class="font-semibold text-earth-900 truncate">{question.title}</h3>
		<p class="text-sm text-earth-600 line-clamp-2">{question.body}</p>
		<div class="flex flex-wrap items-center gap-2 mt-2 text-xs">
			{#if question.categories?.name}
				<span class="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
					{question.categories.name}
				</span>
			{/if}
			{#if question.status === 'closed'}
				<span class="bg-earth-100 text-earth-600 px-2 py-0.5 rounded-full">Selesai</span>
			{/if}
			<span class="text-earth-400 ml-auto">oleh {question.profiles?.username ?? 'pengguna'}</span>
		</div>
	</div>
</a>
