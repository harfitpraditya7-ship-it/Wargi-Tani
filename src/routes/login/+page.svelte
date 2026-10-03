<script>
	export let form;
	export let data;
</script>

<svelte:head><title>Masuk — Wargi Tani</title></svelte:head>

<div class="max-w-sm mx-auto card mt-8">
	<h1 class="text-xl font-bold text-primary-800 mb-4">Masuk</h1>

	{#if form?.error}
		<p class="text-red-600 text-sm mb-3">{form.error}</p>
	{/if}

	<form method="POST" class="space-y-3">
		<input type="hidden" name="redirectTo" value={data.redirectTo ?? '/'} />
		<div>
			<label class="text-sm text-earth-700" for="email">Email</label>
			<input class="input" id="email" name="email" type="email" required />
		</div>
		<div>
			<label class="text-sm text-earth-700" for="password">Kata sandi</label>
			<input class="input" id="password" name="password" type="password" required />
		</div>
		<button class="btn-primary w-full" type="submit">Masuk</button>
	</form>

	<p class="text-sm text-earth-600 mt-4">
		Belum punya akun? <a href="/register" class="text-primary-700 font-medium">Daftar di sini</a>
	</p>
</div>
