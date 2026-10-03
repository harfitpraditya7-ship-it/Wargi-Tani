export async function load({ locals: { supabase, session, user } }) {
	if (!session) {
		return { session: null, user: null, profile: null, unreadCount: 0 };
	}

	const { data: profile } = await supabase
		.from('profiles')
		.select('username, role, avatar_url, reputation')
		.eq('id', user.id)
		.single();

	const { count: unreadCount } = await supabase
		.from('notifications')
		.select('id', { count: 'exact', head: true })
		.eq('user_id', user.id)
		.eq('is_read', false);

	return { session, user, profile, unreadCount: unreadCount ?? 0 };
}
