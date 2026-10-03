<script>
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { createSupabaseBrowserClient } from '$lib/supabase/client';

	export let data;
	export let form;

	const supabase = createSupabaseBrowserClient();

	let preview = [];
	let uploading = false;
	let uploadError = '';

	function onImagesChange(e) {
		const files = Array.from(e.target.files ?? []).slice(0, 4);
		preview = files.map((f) => URL.createObjectURL(f));
	}

	async function handleSubmit({ formData, cancel }) {
		uploadError = '';
		const files = formData.getAll('images').filter((f) => f instanceof File && f.size > 0);
		formData.delete('images');

		if (files.length > 4) {
			uploadError = 'Maksimal 4 foto.';
			cancel();
			return;
		}

		const userId = $page.data.user?.id;
		if (files.length > 0 && userId) {
			uploading = true;
			const paths = [];
			for (const file of files.slice(0, 4)) {
				if (file.size > 8 * 1024 * 1024) {
					uploadError = `File "${file.name}" terlalu besar (maks 8MB per foto).`;
					continue;
				}
				const ext = file.name.split('.').pop();
				const path = `${userId}/${crypto.randomUUID()}.${ext}`;
				const { error } = await supabase.storage
					.from('question-images')
					.upload(path, file, { contentType: file.type });
				if (!error) {
					paths.push(path);
				} else {
					uploadError = 'Gagal upload salah satu foto: ' + error.message;
				}
			}
			formData.append('image_paths', JSON.stringify(paths));
			uploading = false;
		}

		return async ({ update }) => {
			await update();
		};
	}
</script>

<svelte:head><title>Ajukan Pertanyaan — Wargi Tani</title></svelte:head>

<div class="max-w-2xl mx-auto">
	<h1 class="text-xl font-bold text-primary-800 mb-4">Ajukan Pertanyaan</h1>

	{#if form?.error}
		<p class="text-red-600 text-sm mb-3">{form.error}</p>
	{/if}
	{#if uploadError}
		<p class="text-red-600 text-sm mb-3">{uploadError}</p>
	{/if}

	<form method="POST" use:enhance={handleSubmit} class="card space-y-4">
		<div>
			<label class="text-sm text-earth-700" for="title">Judul pertanyaan</label>
			<input
				class="input"
				id="title"
				name="title"
				required
				minlength="10"
				placeholder="Contoh: Daun cabai menguning dan keriting, penyebabnya apa?"
				value={form?.title ?? ''}
			/>
		</div>

		<div>
			<label class="text-sm text-earth-700" for="category_id">Kategori</label>
			<select class="input" id="category_id" name="category_id">
				<option value="">Pilih kategori</option>
				{#each data.categories as c}
					<option value={c.id}>{c.name}</option>
				{/each}
			</select>
		</div>

		<div>
			<label class="text-sm text-earth-700" for="body">Detail pertanyaan</label>
			<textarea
				class="input min-h-[140px]"
				id="body"
				name="body"
				required
				minlength="20"
				placeholder="Jelaskan kondisi tanaman, sejak kapan gejala muncul, dan apa yang sudah dicoba..."
				>{form?.body ?? ''}</textarea
			>
		</div>

		<div>
			<label class="text-sm text-earth-700" for="images">Foto tanaman (maks 4, maks 8MB/foto)</label>
			<input
				class="input"
				id="images"
				name="images"
				type="file"
				accept="image/*"
				multiple
				on:change={onImagesChange}
			/>
			{#if preview.length > 0}
				<div class="flex gap-2 mt-2">
					{#each preview as src}
						<img {src} alt="pratinjau" class="w-20 h-20 object-cover rounded-lg border" />
					{/each}
				</div>
			{/if}
		</div>

		<div>
			<label class="text-sm text-earth-700" for="tags">Tag (pisahkan dengan koma)</label>
			<input class="input" id="tags" name="tags" placeholder="cabai, hama, daun-kuning" />
		</div>

		<button class="btn-primary w-full" type="submit" disabled={uploading}>
			{uploading ? 'Mengunggah foto...' : 'Kirim Pertanyaan'}
		</button>
	</form>
</div>
