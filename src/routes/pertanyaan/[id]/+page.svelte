<script>
	import { enhance } from '$app/forms';
	import VoteButtons from '$lib/components/VoteButtons.svelte';

	export let data;
	export let form;

	$: q = data.question;
	$: isOwner = data.user?.id === q.author_id;
	let showReport = false;
	let reportTarget = null;
</script>

<svelte:head><title>{q.title} — Wargi Tani</title></svelte:head>

<article class="card">
	<div class="flex gap-4">
		<div class="shrink-0">
			<VoteButtons
				score={q.vote_score}
				userVote={data.userVotes['q_' + q.id] ?? 0}
				disabled={!data.user}
				onVote={(value) => {
					const el = document.getElementById('vote-question-form');
					el.value.value = value;
					el.requestSubmit();
				}}
			/>
			<form
				id="vote-question-form"
				method="POST"
				action="?/vote"
				use:enhance
				class="hidden"
			>
				<input type="hidden" name="question_id" value={q.id} />
				<input type="hidden" name="value" />
			</form>

			{#if data.user}
				<form method="POST" action="?/toggleBookmark" use:enhance class="mt-2">
					<button
						class="text-lg {data.isBookmarked ? 'text-primary-600' : 'text-earth-300'}"
						title="Simpan pertanyaan"
						type="submit"
					>
						★
					</button>
				</form>
			{/if}
		</div>

		<div class="min-w-0 flex-1">
			<h1 class="text-xl font-bold text-earth-900">{q.title}</h1>
			<div class="flex flex-wrap gap-2 mt-1 text-xs">
				{#if q.categories?.name}
					<span class="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">{q.categories.name}</span>
				{/if}
				{#each q.question_tags ?? [] as qt}
					<span class="bg-earth-100 text-earth-600 px-2 py-0.5 rounded-full">#{qt.tags.name}</span>
				{/each}
				{#if q.status === 'closed'}
					<span class="bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Selesai</span>
				{/if}
			</div>

			<p class="text-earth-800 mt-3 whitespace-pre-line">{q.body}</p>

			{#if q.images?.length > 0}
				<div class="flex flex-wrap gap-2 mt-3">
					{#each q.images as img}
						<img src={img.url} alt="Foto tanaman" class="w-32 h-32 object-cover rounded-lg border" />
					{/each}
				</div>
			{/if}

			<div class="flex items-center justify-between mt-4 text-xs text-earth-500">
				<span>
					Ditanya oleh <span class="font-medium text-earth-700">{q.profiles?.username}</span>
					({q.profiles?.reputation ?? 0} reputasi) · {q.view_count} dilihat
				</span>
				<div class="flex gap-3">
					<button class="hover:text-primary-700" on:click={() => { showReport = true; reportTarget = { question_id: q.id }; }}>
						Laporkan
					</button>
					{#if isOwner}
						<form method="POST" action="?/deleteQuestion" use:enhance
							on:submit={(e) => { if (!confirm('Hapus pertanyaan ini?')) e.preventDefault(); }}>
							<button class="hover:text-red-600" type="submit">Hapus</button>
						</form>
					{/if}
				</div>
			</div>
		</div>
	</div>
</article>

{#if form?.error}
	<p class="text-red-600 text-sm mt-3">{form.error}</p>
{/if}

<!-- Komentar pada pertanyaan -->
<div class="ml-4 mt-2 space-y-2">
	{#each data.comments.filter((c) => c.question_id === q.id) as c}
		<p class="text-sm text-earth-600 border-l-2 border-primary-100 pl-2">
			<span class="font-medium text-earth-700">{c.profiles?.username}:</span> {c.body}
		</p>
	{/each}
	{#if data.user}
		<form method="POST" action="?/comment" use:enhance class="flex gap-2 mt-1">
			<input type="hidden" name="question_id" value={q.id} />
			<input class="input !py-1 text-sm" name="body" placeholder="Tambah komentar..." required />
			<button class="btn-secondary !py-1 !px-3 text-sm" type="submit">Kirim</button>
		</form>
	{/if}
</div>

<h2 class="text-lg font-bold text-primary-800 mt-8 mb-3">{data.answers.length} Jawaban</h2>

<div class="space-y-4">
	{#each data.answers as a (a.id)}
		<div class="card flex gap-4 {a.is_accepted ? 'border-primary-400 bg-primary-50/50' : ''}">
			<div class="shrink-0">
				<VoteButtons
					score={a.vote_score}
					userVote={data.userVotes['a_' + a.id] ?? 0}
					disabled={!data.user}
					onVote={(value) => {
						const el = document.getElementById('vote-answer-' + a.id);
						el.value.value = value;
						el.requestSubmit();
					}}
				/>
				<form id={'vote-answer-' + a.id} method="POST" action="?/vote" use:enhance class="hidden">
					<input type="hidden" name="answer_id" value={a.id} />
					<input type="hidden" name="value" />
				</form>

				{#if a.is_accepted}
					<div class="text-primary-600 text-xl text-center mt-1" title="Jawaban terpilih">✔</div>
				{:else if isOwner}
					<form method="POST" action="?/acceptAnswer" use:enhance class="mt-1">
						<input type="hidden" name="answer_id" value={a.id} />
						<button class="text-xs text-earth-400 hover:text-primary-600" type="submit">Pilih</button>
					</form>
				{/if}
			</div>

			<div class="min-w-0 flex-1">
				<p class="text-earth-800 whitespace-pre-line">{a.body}</p>
				<div class="flex items-center justify-between mt-3 text-xs text-earth-500">
					<span>
						Dijawab oleh <span class="font-medium text-earth-700">{a.profiles?.username}</span>
						({a.profiles?.reputation ?? 0} reputasi)
					</span>
					<button class="hover:text-primary-700" on:click={() => { showReport = true; reportTarget = { answer_id: a.id }; }}>
						Laporkan
					</button>
				</div>

				<div class="ml-2 mt-2 space-y-1">
					{#each data.comments.filter((c) => c.answer_id === a.id) as c}
						<p class="text-sm text-earth-600 border-l-2 border-primary-100 pl-2">
							<span class="font-medium text-earth-700">{c.profiles?.username}:</span> {c.body}
						</p>
					{/each}
					{#if data.user}
						<form method="POST" action="?/comment" use:enhance class="flex gap-2 mt-1">
							<input type="hidden" name="answer_id" value={a.id} />
							<input class="input !py-1 text-sm" name="body" placeholder="Tambah komentar..." required />
							<button class="btn-secondary !py-1 !px-3 text-sm" type="submit">Kirim</button>
						</form>
					{/if}
				</div>
			</div>
		</div>
	{/each}
</div>

{#if data.user}
	<h3 class="font-semibold text-earth-800 mt-6 mb-2">Tulis Jawaban Anda</h3>
	<form method="POST" action="?/answer" use:enhance class="card space-y-3">
		<textarea class="input min-h-[100px]" name="body" required minlength="10" placeholder="Bagikan solusi atau pengalaman Anda..."></textarea>
		<button class="btn-primary" type="submit">Kirim Jawaban</button>
	</form>
{:else}
	<p class="text-earth-600 text-sm mt-6">
		<a href="/login" class="text-primary-700 font-medium">Masuk</a> untuk menjawab pertanyaan ini.
	</p>
{/if}

{#if showReport}
	<div class="fixed inset-0 bg-black/30 flex items-center justify-center z-20 p-4">
		<div class="card max-w-sm w-full">
			<h3 class="font-semibold mb-2">Laporkan Konten</h3>
			<form method="POST" action="?/report" use:enhance={() => {
				return async ({ update }) => { showReport = false; await update(); };
			}}>
				{#if reportTarget?.question_id}
					<input type="hidden" name="question_id" value={reportTarget.question_id} />
				{/if}
				{#if reportTarget?.answer_id}
					<input type="hidden" name="answer_id" value={reportTarget.answer_id} />
				{/if}
				<textarea class="input" name="reason" required placeholder="Alasan pelaporan..."></textarea>
				<div class="flex gap-2 mt-3">
					<button class="btn-primary flex-1" type="submit">Kirim Laporan</button>
					<button class="btn-secondary flex-1" type="button" on:click={() => (showReport = false)}>Batal</button>
				</div>
			</form>
		</div>
	</div>
{/if}
