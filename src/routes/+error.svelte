<script>
	import { page } from '$app/stores';
</script>

<div class="text-center py-20">
	<p class="text-5xl mb-4">🌱</p>
	<h1 class="text-2xl font-bold text-primary-800 mb-2">
		{$page.status === 404 ? 'Halaman tidak ditemukan' : 'Terjadi kesalahan'}
	</h1>
	<p class="text-earth-600 mb-6">
		{$page.error?.message ?? 'Silakan coba lagi atau kembali ke beranda.'}
	</p>
	<a href="/" class="btn-primary">Kembali ke Beranda</a>
</div>
