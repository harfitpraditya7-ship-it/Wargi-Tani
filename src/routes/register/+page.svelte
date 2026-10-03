<script>
	export let form;
</script>

<svelte:head><title>Daftar — Wargi Tani</title></svelte:head>

<div class="max-w-sm mx-auto card mt-8">
	<h1 class="text-xl font-bold text-primary-800 mb-4">Buat Akun</h1>

	{#if form?.error}
		<p class="text-red-600 text-sm mb-3">{form.error}</p>
	{/if}
	{#if form?.success}
		<p class="text-primary-700 text-sm mb-3">
			Pendaftaran berhasil! Silakan cek email untuk verifikasi, lalu masuk.
		</p>
	{/if}

	<form method="POST" class="space-y-3">
		<div>
			<label class="text-sm text-earth-700" for="username">Nama pengguna</label>
			<input class="input" id="username" name="username" required minlength="3" />
		</div>
		<div>
			<label class="text-sm text-earth-700" for="full_name">Nama lengkap</label>
			<input class="input" id="full_name" name="full_name" required />
		</div>
		<div>
			<label class="text-sm text-earth-700" for="role">Saya adalah</label>
			<select class="input" id="role" name="role">
				<option value="user">Masyarakat umum</option>
				<option value="user">Mahasiswa</option>
				<option value="penyuluh">Penyuluh pertanian</option>
			</select>
		</div>
		<div>
			<label class="text-sm text-earth-700" for="email">Email</label>
			<input class="input" id="email" name="email" type="email" required />
		</div>
		<div>
			<label class="text-sm text-earth-700" for="password">Kata sandi</label>
			<input class="input" id="password" name="password" type="password" minlength="6" required />
		</div>
		<button class="btn-primary w-full" type="submit">Daftar</button>
	</form>

	<p class="text-sm text-earth-600 mt-4">
		Sudah punya akun? <a href="/login" class="text-primary-700 font-medium">Masuk di sini</a>
	</p>
</div>
