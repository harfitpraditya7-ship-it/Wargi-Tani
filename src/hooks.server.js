import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { ...options, path: '/' });
				});
			}
		}
	});

	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		if (!session) return { session: null, user: null };

		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();
		if (error) return { session: null, user: null };

		return { session, user };
	};

	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;

	// Proteksi rute yang butuh login
	const protectedPrefixes = ['/pertanyaan/baru', '/notifikasi', '/pengaturan'];
	const needsAuth = protectedPrefixes.some((p) => event.url.pathname.startsWith(p));
	if (needsAuth && !session) {
		const redirectTo = encodeURIComponent(event.url.pathname + event.url.search);
		return new Response(null, {
			status: 303,
			headers: { location: `/login?redirectTo=${redirectTo}` }
		});
	}

	// Proteksi rute admin
	if (event.url.pathname.startsWith('/admin')) {
		if (!session) {
			return new Response(null, { status: 303, headers: { location: '/login' } });
		}
		const { data: profile } = await event.locals.supabase
			.from('profiles')
			.select('role')
			.eq('id', user.id)
			.single();
		if (profile?.role !== 'admin') {
			return new Response(null, { status: 303, headers: { location: '/' } });
		}
	}

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
}
