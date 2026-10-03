import { redirect } from '@sveltejs/kit';

export async function load({ locals: { supabase, user, session } }) {
	if (!session) throw redirect(303, '/login?redirectTo=/bookmark');

	const { data: bookmarks } = await supabase
		.from('bookmarks')
		.select(
			'created_at, questions(id, title, body, status, vote_score, created_at, profiles!author_id(username), categories(name), answers!question_id(count))'
		)
		.eq('user_id', user.id)
		.order('created_at', { ascending: false });

	const questions = (bookmarks ?? [])
		.map((b) => b.questions)
		.filter(Boolean)
		.map((q) => ({ ...q, answers_count: q.answers?.[0]?.count ?? 0 }));

	return { questions };
}
