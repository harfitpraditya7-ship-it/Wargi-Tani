export async function load({ locals: { supabase, user } }) {
	const { data: notifications } = await supabase
		.from('notifications')
		.select('id, type, message, link, is_read, created_at')
		.eq('user_id', user.id)
		.order('created_at', { ascending: false })
		.limit(50);

	return { notifications: notifications ?? [] };
}

export const actions = {
	markRead: async ({ request, locals: { supabase, user } }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		await supabase.from('notifications').update({ is_read: true }).eq('id', id).eq('user_id', user.id);
		return { success: true };
	},
	markAllRead: async ({ locals: { supabase, user } }) => {
		await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
		return { success: true };
	}
};
