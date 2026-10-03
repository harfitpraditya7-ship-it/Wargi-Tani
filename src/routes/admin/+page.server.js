export async function load({ locals: { supabase } }) {
	const { count: userCount } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
	const { count: questionCount } = await supabase.from('questions').select('id', { count: 'exact', head: true });
	const { count: answerCount } = await supabase.from('answers').select('id', { count: 'exact', head: true });
	const { count: pendingReports } = await supabase
		.from('reports')
		.select('id', { count: 'exact', head: true })
		.eq('status', 'pending');

	const { data: recentUsers } = await supabase
		.from('profiles')
		.select('id, username, role, reputation, created_at')
		.order('created_at', { ascending: false })
		.limit(10);

	return {
		stats: {
			userCount: userCount ?? 0,
			questionCount: questionCount ?? 0,
			answerCount: answerCount ?? 0,
			pendingReports: pendingReports ?? 0
		},
		recentUsers: recentUsers ?? []
	};
}

export const actions = {
	setRole: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const userId = formData.get('user_id')?.toString();
		const role = formData.get('role')?.toString();
		await supabase.from('profiles').update({ role }).eq('id', userId);
		return { success: true };
	}
};
