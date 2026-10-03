import { fail, redirect } from '@sveltejs/kit';

export function load({ locals: { session } }) {
	if (session) throw redirect(303, '/');
}

export const actions = {
	default: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = formData.get('email');
		const password = formData.get('password');
		const username = formData.get('username');
		const full_name = formData.get('full_name');
		const role = formData.get('role') || 'user';

		if (!username || username.length < 3) {
			return fail(400, { error: 'Nama pengguna minimal 3 karakter.' });
		}

		const { error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: { username, full_name, role }
			}
		});

		if (error) {
			return fail(400, { error: error.message });
		}

		return { success: true };
	}
};
