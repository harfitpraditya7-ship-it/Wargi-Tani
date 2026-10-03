<script>
	import { enhance } from '$app/forms';
	export let data;
</script>

<svelte:head><title>Laporan — Admin Wargi Tani</title></svelte:head>

<h1 class="text-xl font-bold text-primary-800 mb-4">Laporan Konten</h1>

{#if data.reports.length === 0}
	<p class="text-earth-500 text-sm">Belum ada laporan.</p>
{:else}
	<div class="space-y-3">
		{#each data.reports as r (r.id)}
			<div class="card">
				<div class="flex justify-between items-start">
					<div>
						<p class="text-sm text-earth-800">
							<strong>{r.reporter?.username}</strong> melaporkan:
							{#if r.question}
								pertanyaan "<a href={`/pertanyaan/${r.question.id}`} class="text-primary-700 underline">{r.question.title}</a>"
							{:else if r.answer}
								sebuah jawaban
							{/if}
						</p>
						<p class="text-earth-600 text-sm mt-1">Alasan: {r.reason}</p>
						<p class="text-xs text-earth-400 mt-1">
							{new Date(r.created_at).toLocaleString('id-ID')} · status: {r.status}
						</p>
					</div>
					<span
						class="text-xs px-2 py-0.5 rounded-full {r.status === 'pending'
							? 'bg-amber-100 text-amber-700'
							: r.status === 'resolved'
								? 'bg-primary-100 text-primary-700'
								: 'bg-earth-100 text-earth-500'}"
					>
						{r.status}
					</span>
				</div>

				{#if r.status === 'pending'}
					<div class="flex flex-wrap gap-2 mt-3">
						<form method="POST" action="?/resolve" use:enhance>
							<input type="hidden" name="id" value={r.id} />
							<input type="hidden" name="status" value="resolved" />
							<button class="btn-secondary !py-1 !px-3 text-xs" type="submit">Tandai Selesai</button>
						</form>
						<form method="POST" action="?/resolve" use:enhance>
							<input type="hidden" name="id" value={r.id} />
							<input type="hidden" name="status" value="dismissed" />
							<button class="btn-secondary !py-1 !px-3 text-xs" type="submit">Abaikan</button>
						</form>
						{#if r.question}
							<form method="POST" action="?/deleteQuestion" use:enhance
								on:submit={(e) => { if (!confirm('Hapus pertanyaan ini?')) e.preventDefault(); }}>
								<input type="hidden" name="question_id" value={r.question.id} />
								<button class="text-xs text-red-600 hover:underline" type="submit">Hapus Pertanyaan</button>
							</form>
						{/if}
						{#if r.answer}
							<form method="POST" action="?/deleteAnswer" use:enhance
								on:submit={(e) => { if (!confirm('Hapus jawaban ini?')) e.preventDefault(); }}>
								<input type="hidden" name="answer_id" value={r.answer.id} />
								<button class="text-xs text-red-600 hover:underline" type="submit">Hapus Jawaban</button>
							</form>
						{/if}
					</div>
				{/if}
			</div>
		{/each}
	</div>
{/if}
