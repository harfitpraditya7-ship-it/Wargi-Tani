import { error, fail, redirect } from '@sveltejs/kit';

export async function load({ params, locals: { supabase, user } }) {
	const { data: question, error: qError } = await supabase
		.from('questions')
		.select(
			'id, title, body, status, vote_score, view_count, accepted_answer_id, created_at, author_id, profiles!author_id(username, reputation), categories(name, slug), question_images(id, storage_path), question_tags(tags(id, name))'
		)
		.eq('id', params.id)
		.single();

	if (qError || !question) {
		console.error('Gagal memuat pertanyaan:', params.id, qError);
		throw error(404, 'Pertanyaan tidak ditemukan' + (qError?.message ? ' — ' + qError.message : ''));
	}

	// increment view count (fire and forget, boleh gagal karena RLS jika perlu diperketat nanti)
	supabase
		.from('questions')
		.update({ view_count: (question.view_count ?? 0) + 1 })
		.eq('id', params.id)
		.then(() => {});

	const { data: answers } = await supabase
		.from('answers')
		.select('id, body, is_accepted, vote_score, created_at, author_id, profiles!author_id(username, reputation)')
		.eq('question_id', params.id)
		.order('is_accepted', { ascending: false })
		.order('vote_score', { ascending: false });

	const { data: comments } = await supabase
		.from('comments')
		.select('id, body, created_at, author_id, question_id, answer_id, profiles!author_id(username)')
		.or(`question_id.eq.${params.id},answer_id.in.(${(answers ?? []).map((a) => a.id).join(',') || '00000000-0000-0000-0000-000000000000'})`);

	let userVotes = {};
	let isBookmarked = false;
	if (user) {
		const { data: votes } = await supabase
			.from('votes')
			.select('question_id, answer_id, value')
			.eq('voter_id', user.id);
		(votes ?? []).forEach((v) => {
			if (v.question_id) userVotes['q_' + v.question_id] = v.value;
			if (v.answer_id) userVotes['a_' + v.answer_id] = v.value;
		});

		const { data: bookmark } = await supabase
			.from('bookmarks')
			.select('user_id')
			.eq('user_id', user.id)
			.eq('question_id', params.id)
			.maybeSingle();
		isBookmarked = !!bookmark;
	}

	const imageUrls = (question.question_images ?? []).map((img) => {
		const { data } = supabase.storage.from('question-images').getPublicUrl(img.storage_path);
		return { id: img.id, url: data.publicUrl };
	});

	return {
		question: { ...question, images: imageUrls },
		answers: answers ?? [],
		comments: comments ?? [],
		userVotes,
		isBookmarked
	};
}

export const actions = {
	answer: async ({ request, params, locals: { supabase, user } }) => {
		if (!user) return fail(401, { error: 'Silakan masuk untuk menjawab.' });
		const formData = await request.formData();
		const body = formData.get('body')?.toString().trim();
		if (!body || body.length < 10) {
			return fail(400, { error: 'Jawaban minimal 10 karakter.' });
		}
		const { error: aError } = await supabase
			.from('answers')
			.insert({ question_id: params.id, author_id: user.id, body });
		if (aError) return fail(400, { error: aError.message });
		return { success: true };
	},

	comment: async ({ request, locals: { supabase, user } }) => {
		if (!user) return fail(401, { error: 'Silakan masuk untuk berkomentar.' });
		const formData = await request.formData();
		const body = formData.get('body')?.toString().trim();
		const question_id = formData.get('question_id')?.toString() || null;
		const answer_id = formData.get('answer_id')?.toString() || null;
		if (!body) return fail(400, { error: 'Komentar tidak boleh kosong.' });
		const { error: cError } = await supabase
			.from('comments')
			.insert({ author_id: user.id, body, question_id, answer_id });
		if (cError) return fail(400, { error: cError.message });
		return { success: true };
	},

	vote: async ({ request, locals: { supabase, user } }) => {
		if (!user) return fail(401, { error: 'Silakan masuk untuk memberi suara.' });
		const formData = await request.formData();
		const question_id = formData.get('question_id')?.toString() || null;
		const answer_id = formData.get('answer_id')?.toString() || null;
		const value = Number(formData.get('value'));

		if (value === 0) {
			await supabase
				.from('votes')
				.delete()
				.eq('voter_id', user.id)
				.match(question_id ? { question_id } : { answer_id });
		} else {
			await supabase
				.from('votes')
				.upsert(
					{ voter_id: user.id, question_id, answer_id, value },
					{ onConflict: question_id ? 'voter_id,question_id' : 'voter_id,answer_id' }
				);
		}
		return { success: true };
	},

	acceptAnswer: async ({ request, params, locals: { supabase, user } }) => {
		const formData = await request.formData();
		const answer_id = formData.get('answer_id')?.toString();

		const { data: question } = await supabase
			.from('questions')
			.select('author_id')
			.eq('id', params.id)
			.single();
		if (!user || question?.author_id !== user.id) {
			return fail(403, { error: 'Hanya penanya yang bisa menandai jawaban terpilih.' });
		}

		await supabase.from('answers').update({ is_accepted: false }).eq('question_id', params.id);
		await supabase.from('answers').update({ is_accepted: true }).eq('id', answer_id);
		await supabase.from('questions').update({ accepted_answer_id: answer_id, status: 'closed' }).eq('id', params.id);

		return { success: true };
	},

	toggleBookmark: async ({ params, locals: { supabase, user } }) => {
		if (!user) return fail(401, { error: 'Silakan masuk untuk menyimpan pertanyaan.' });
		const { data: existing } = await supabase
			.from('bookmarks')
			.select('user_id')
			.eq('user_id', user.id)
			.eq('question_id', params.id)
			.maybeSingle();

		if (existing) {
			await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('question_id', params.id);
		} else {
			await supabase.from('bookmarks').insert({ user_id: user.id, question_id: params.id });
		}
		return { success: true };
	},

	report: async ({ request, locals: { supabase, user } }) => {
		if (!user) return fail(401, { error: 'Silakan masuk untuk melaporkan konten.' });
		const formData = await request.formData();
		const reason = formData.get('reason')?.toString().trim();
		const question_id = formData.get('question_id')?.toString() || null;
		const answer_id = formData.get('answer_id')?.toString() || null;
		if (!reason) return fail(400, { error: 'Alasan laporan wajib diisi.' });
		await supabase.from('reports').insert({ reporter_id: user.id, reason, question_id, answer_id });
		return { success: true, reported: true };
	},

	deleteQuestion: async ({ params, locals: { supabase, user } }) => {
		const { data: question } = await supabase
			.from('questions')
			.select('author_id')
			.eq('id', params.id)
			.single();
		if (!user || question?.author_id !== user.id) return fail(403, { error: 'Tidak diizinkan.' });
		await supabase.from('questions').delete().eq('id', params.id);
		throw redirect(303, '/');
	}
};
