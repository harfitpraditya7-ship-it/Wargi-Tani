export async function load({ locals: { supabase }, url }) {
	const q = url.searchParams.get('q')?.trim();
	const categorySlug = url.searchParams.get('kategori');
	const page = Number(url.searchParams.get('page') ?? '1');
	const perPage = 15;

	const { data: categories } = await supabase
		.from('categories')
		.select('id, name, slug')
		.order('name');

	let query = supabase
		.from('questions')
		.select(
			'id, title, body, status, vote_score, view_count, created_at, profiles!author_id(username), categories(name, slug), answers!question_id(count)',
			{ count: 'exact' }
		)
		.order('created_at', { ascending: false })
		.range((page - 1) * perPage, page * perPage - 1);

	if (q) {
		query = query.textSearch('search_vector', q, { type: 'websearch', config: 'indonesian' });
	}
	if (categorySlug) {
		const cat = categories?.find((c) => c.slug === categorySlug);
		if (cat) query = query.eq('category_id', cat.id);
	}

	const { data: questions, count, error: listError } = await query;
	if (listError) console.error('Gagal memuat daftar pertanyaan:', listError);

	const mapped = (questions ?? []).map((row) => ({
		...row,
		answers_count: row.answers?.[0]?.count ?? 0
	}));

	return {
		questions: mapped,
		categories: categories ?? [],
		total: count ?? 0,
		page,
		perPage,
		q: q ?? '',
		categorySlug: categorySlug ?? ''
	};
}
