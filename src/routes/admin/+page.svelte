<script>
	import { enhance } from '$app/forms';
	export let data;
</script>

<svelte:head><title>Dashboard Admin — Wargi Tani</title></svelte:head>

<h1 class="text-xl font-bold text-primary-800 mb-4">Dashboard Admin</h1>

<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
	<div class="card text-center">
		<p class="text-2xl font-bold text-primary-700">{data.stats.userCount}</p>
		<p class="text-xs text-earth-500">Pengguna</p>
	</div>
	<div class="card text-center">
		<p class="text-2xl font-bold text-primary-700">{data.stats.questionCount}</p>
		<p class="text-xs text-earth-500">Pertanyaan</p>
	</div>
	<div class="card text-center">
		<p class="text-2xl font-bold text-primary-700">{data.stats.answerCount}</p>
		<p class="text-xs text-earth-500">Jawaban</p>
	</div>
	<a href="/admin/laporan" class="card text-center hover:border-primary-300">
		<p class="text-2xl font-bold text-red-600">{data.stats.pendingReports}</p>
		<p class="text-xs text-earth-500">Laporan Pending</p>
	</a>
</div>

<h2 class="font-semibold text-earth-800 mb-2">Pengguna Terbaru</h2>
<div class="card overflow-x-auto">
	<table class="w-full text-sm">
		<thead>
			<tr class="text-left text-earth-500 border-b">
				<th class="py-2">Username</th>
				<th>Peran</th>
				<th>Reputasi</th>
				<th>Aksi</th>
			</tr>
		</thead>
		<tbody>
			{#each data.recentUsers as u (u.id)}
				<tr class="border-b last:border-0">
					<td class="py-2">{u.username}</td>
					<td>{u.role}</td>
					<td>{u.reputation}</td>
					<td>
						<form method="POST" action="?/setRole" use:enhance class="flex gap-2">
							<input type="hidden" name="user_id" value={u.id} />
							<select name="role" class="input !py-1 !px-2 text-xs">
								<option value="user" selected={u.role === 'user'}>user</option>
								<option value="penyuluh" selected={u.role === 'penyuluh'}>penyuluh</option>
								<option value="admin" selected={u.role === 'admin'}>admin</option>
							</select>
							<button class="text-xs text-primary-700 hover:underline" type="submit">Simpan</button>
						</form>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
