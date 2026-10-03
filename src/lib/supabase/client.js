import { createBrowserClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

/**
 * Supabase client untuk digunakan di sisi browser (komponen Svelte, aksi form client-side, dsb).
 * Untuk load function di server, gunakan hooks.server.js / locals.supabase.
 */
export function createSupabaseBrowserClient() {
	return createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
}
