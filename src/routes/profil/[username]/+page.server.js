import { error } from '@sveltejs/kit';

export async function load({ params, locals: { supabase } }) {
	const { data: profile } = await supabase
		.from('profiles')
		.select('id, username, full_name, role, bio, reputation, created_at')
		.eq('username', params.username)
		.single();

	if (!profile) throw error(404, 'Pengguna tidak ditemukan');

	const { data: questions } = await supabase
		.from('questions')
		.select('id, title, status, vote_score, created_at, answers!question_id(count)')
		.eq('author_id', profile.id)
		.order('created_at', { ascending: false })
		.limit(20);

	return {
		profile,
		questions: (questions ?? []).map((q) => ({ ...q, answers_count: q.answers?.[0]?.count ?? 0 }))
	};
}
