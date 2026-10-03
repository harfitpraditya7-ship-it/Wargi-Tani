<script>
	import '../app.css';
	import { navigating } from '$app/stores';
	export let data;
</script>

{#if $navigating}
	<div class="fixed top-0 left-0 right-0 h-0.5 bg-primary-500 z-50 animate-pulse"></div>
{/if}

<div class="min-h-screen flex flex-col">
	<header class="border-b border-primary-100 bg-white sticky top-0 z-10">
		<nav class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
			<a href="/" class="font-bold text-primary-700 text-lg shrink-0">🌾 Wargi Tani</a>

			<form action="/" class="hidden sm:flex flex-1 max-w-sm">
				<input
					class="input !py-1.5 text-sm"
					type="search"
					name="q"
					placeholder="Cari pertanyaan..."
				/>
			</form>

			<div class="flex items-center gap-2 text-sm">
				{#if data.user}
					<a href="/pertanyaan/baru" class="btn-primary !py-1.5 !px-3">Tanya</a>
					<a href="/notifikasi" class="relative text-earth-600 hover:text-primary-700 px-1" aria-label="Notifikasi">
						🔔
						{#if data.unreadCount > 0}
							<span class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
								{data.unreadCount}
							</span>
						{/if}
					</a>
					<a href={`/profil/${data.profile?.username ?? ''}`} class="text-earth-700 hover:text-primary-700">
						{data.profile?.username ?? data.user.email}
					</a>
					{#if data.profile?.role === 'admin'}
						<a href="/admin" class="text-earth-500 hover:text-primary-700">Admin</a>
					{/if}
					<form method="POST" action="/logout">
						<button class="btn-secondary !py-1.5 !px-3" type="submit">Keluar</button>
					</form>
				{:else}
					<a href="/login" class="btn-secondary !py-1.5 !px-3">Masuk</a>
					<a href="/register" class="btn-primary !py-1.5 !px-3">Daftar</a>
				{/if}
			</div>
		</nav>
	</header>

	<main class="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
		<slot />
	</main>

	<footer class="border-t border-primary-100 py-4 text-center text-xs text-earth-500">
		Wargi Tani — Forum tanya jawab pertanian
	</footer>
</div>
