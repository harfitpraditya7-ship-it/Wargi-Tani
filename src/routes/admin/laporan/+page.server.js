export async function load({ locals: { supabase } }) {
	const { data: reports } = await supabase
		.from('reports')
		.select(
			'id, reason, status, created_at, reporter:profiles!reports_reporter_id_fkey(username), question:questions(id, title), answer:answers(id, body)'
		)
		.order('created_at', { ascending: false });

	return { reports: reports ?? [] };
}

export const actions = {
	resolve: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const status = formData.get('status')?.toString();
		await supabase.from('reports').update({ status }).eq('id', id);
		return { success: true };
	},
	deleteQuestion: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const question_id = formData.get('question_id')?.toString();
		await supabase.from('questions').delete().eq('id', question_id);
		return { success: true };
	},
	deleteAnswer: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const answer_id = formData.get('answer_id')?.toString();
		await supabase.from('answers').delete().eq('id', answer_id);
		return { success: true };
	}
};
