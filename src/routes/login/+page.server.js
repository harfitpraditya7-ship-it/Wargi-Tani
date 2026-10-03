import { fail, redirect } from '@sveltejs/kit';

export function load({ url, locals: { session } }) {
	if (session) throw redirect(303, '/');
	return { redirectTo: url.searchParams.get('redirectTo') ?? '/' };
}

export const actions = {
	default: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = formData.get('email');
		const password = formData.get('password');
		const redirectTo = formData.get('redirectTo') || '/';

		const { error } = await supabase.auth.signInWithPassword({ email, password });

		if (error) {
			return fail(400, { error: 'Email atau kata sandi salah.' });
		}

		throw redirect(303, redirectTo);
	}
};
