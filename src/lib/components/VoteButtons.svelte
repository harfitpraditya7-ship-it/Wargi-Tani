<script>
	export let score = 0;
	export let userVote = 0; // -1, 0, 1
	export let disabled = false;
	export let onVote = (value) => {};
</script>

<div class="flex flex-col items-center gap-1">
	<button
		class="w-8 h-8 rounded-full border flex items-center justify-center transition-colors {userVote === 1
			? 'bg-primary-600 text-white border-primary-600'
			: 'border-earth-200 text-earth-500 hover:bg-primary-50'}"
		{disabled}
		on:click={() => onVote(userVote === 1 ? 0 : 1)}
		aria-label="Vote naik"
	>
		▲
	</button>
	<span class="font-semibold text-earth-800">{score}</span>
	<button
		class="w-8 h-8 rounded-full border flex items-center justify-center transition-colors {userVote === -1
			? 'bg-red-500 text-white border-red-500'
			: 'border-earth-200 text-earth-500 hover:bg-red-50'}"
		{disabled}
		on:click={() => onVote(userVote === -1 ? 0 : -1)}
		aria-label="Vote turun"
	>
		▼
	</button>
</div>
