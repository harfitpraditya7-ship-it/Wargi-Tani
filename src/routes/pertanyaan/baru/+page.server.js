import { fail, redirect } from '@sveltejs/kit';

export async function load({ locals: { supabase } }) {
	const { data: categories } = await supabase.from('categories').select('id, name').order('name');
	return { categories: categories ?? [] };
}

export const actions = {
	default: async ({ request, locals: { supabase, user } }) => {
		const formData = await request.formData();
		const title = formData.get('title')?.toString().trim();
		const body = formData.get('body')?.toString().trim();
		const category_id = formData.get('category_id')?.toString() || null;
		const tagsRaw = formData.get('tags')?.toString() ?? '';

		// Foto sudah diupload langsung dari browser ke Supabase Storage (lihat +page.svelte),
		// di sini kita hanya menerima daftar path yang sudah berhasil diupload.
		let imagePaths = [];
		const imagePathsRaw = formData.get('image_paths')?.toString();
		if (imagePathsRaw) {
			try {
				imagePaths = JSON.parse(imagePathsRaw);
			} catch {
				imagePaths = [];
			}
		}

		if (!title || title.length < 10) {
			return fail(400, { error: 'Judul minimal 10 karakter.', title, body });
		}
		if (!body || body.length < 20) {
			return fail(400, { error: 'Isi pertanyaan minimal 20 karakter.', title, body });
		}

		const { data: question, error: qError } = await supabase
			.from('questions')
			.insert({ title, body, category_id, author_id: user.id })
			.select('id')
			.single();

		if (qError || !question) {
			return fail(400, { error: 'Gagal menyimpan pertanyaan: ' + qError?.message, title, body });
		}

		// Kaitkan foto (path sudah ada di storage) ke pertanyaan ini
		for (const path of imagePaths.slice(0, 4)) {
			await supabase.from('question_images').insert({ question_id: question.id, storage_path: path });
		}

		// Tags (pisahkan koma, buat jika belum ada)
		const tagNames = tagsRaw
			.split(',')
			.map((t) => t.trim().toLowerCase())
			.filter(Boolean)
			.slice(0, 5);

		for (const name of tagNames) {
			let { data: tag } = await supabase.from('tags').select('id').eq('name', name).maybeSingle();
			if (!tag) {
				const { data: newTag } = await supabase.from('tags').insert({ name }).select('id').single();
				tag = newTag;
			}
			if (tag) {
				await supabase.from('question_tags').insert({ question_id: question.id, tag_id: tag.id });
			}
		}

		throw redirect(303, `/pertanyaan/${question.id}`);
	}
};
