-- ============================================================
-- Wargi Tani — Skema Database Supabase
-- Jalankan di Supabase Dashboard > SQL Editor
-- ============================================================

-- ---------- EXTENSIONS ----------
create extension if not exists "uuid-ossp";

-- ---------- PROFILES ----------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text,
  role text not null default 'user' check (role in ('user','penyuluh','admin')),
  avatar_url text,
  bio text,
  reputation int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- CATEGORIES ----------
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  slug text unique not null,
  description text,
  created_at timestamptz not null default now()
);

insert into categories (name, slug, description) values
  ('Hama & Penyakit', 'hama-penyakit', 'Masalah hama, jamur, dan penyakit tanaman'),
  ('Pupuk & Nutrisi', 'pupuk-nutrisi', 'Pemupukan dan kebutuhan hara tanaman'),
  ('Tanah & Media Tanam', 'tanah-media-tanam', 'Kualitas tanah, pH, dan media tanam'),
  ('Budidaya', 'budidaya', 'Teknik budidaya dan perawatan tanaman'),
  ('Cuaca & Iklim', 'cuaca-iklim', 'Pengaruh cuaca dan iklim terhadap tanaman'),
  ('Pasca Panen', 'pasca-panen', 'Penanganan hasil panen'),
  ('Lainnya', 'lainnya', 'Topik pertanian lainnya')
on conflict (slug) do nothing;

-- ---------- TAGS ----------
create table if not exists tags (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  created_at timestamptz not null default now()
);

-- ---------- QUESTIONS ----------
create table if not exists questions (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null references profiles(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  title text not null,
  body text not null,
  status text not null default 'open' check (status in ('open','closed')),
  accepted_answer_id uuid,
  view_count int not null default 0,
  vote_score int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_questions_category on questions(category_id);
create index if not exists idx_questions_author on questions(author_id);
create index if not exists idx_questions_created on questions(created_at desc);

-- pencarian teks sederhana
alter table questions add column if not exists search_vector tsvector
  generated always as (to_tsvector('indonesian', coalesce(title,'') || ' ' || coalesce(body,''))) stored;
create index if not exists idx_questions_search on questions using gin(search_vector);

-- ---------- QUESTION IMAGES ----------
create table if not exists question_images (
  id uuid primary key default uuid_generate_v4(),
  question_id uuid not null references questions(id) on delete cascade,
  storage_path text not null,
  created_at timestamptz not null default now()
);

-- ---------- ANSWERS ----------
create table if not exists answers (
  id uuid primary key default uuid_generate_v4(),
  question_id uuid not null references questions(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  is_accepted boolean not null default false,
  vote_score int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_answers_question on answers(question_id);

alter table questions
  add constraint fk_accepted_answer foreign key (accepted_answer_id) references answers(id) on delete set null;

-- ---------- COMMENTS ----------
create table if not exists comments (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null references profiles(id) on delete cascade,
  question_id uuid references questions(id) on delete cascade,
  answer_id uuid references answers(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint comment_target_check check (
    (question_id is not null and answer_id is null) or
    (question_id is null and answer_id is not null)
  )
);

-- ---------- QUESTION_TAGS ----------
create table if not exists question_tags (
  question_id uuid not null references questions(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (question_id, tag_id)
);

-- ---------- VOTES ----------
create table if not exists votes (
  id uuid primary key default uuid_generate_v4(),
  voter_id uuid not null references profiles(id) on delete cascade,
  question_id uuid references questions(id) on delete cascade,
  answer_id uuid references answers(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  constraint vote_target_check check (
    (question_id is not null and answer_id is null) or
    (question_id is null and answer_id is not null)
  ),
  unique (voter_id, question_id),
  unique (voter_id, answer_id)
);

-- ---------- BOOKMARKS ----------
create table if not exists bookmarks (
  user_id uuid not null references profiles(id) on delete cascade,
  question_id uuid not null references questions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

-- ---------- NOTIFICATIONS ----------
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('new_answer','new_comment','answer_accepted','vote','report_resolved')),
  message text not null,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user on notifications(user_id, is_read);

-- ---------- REPORTS (moderasi) ----------
create table if not exists reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid not null references profiles(id) on delete cascade,
  question_id uuid references questions(id) on delete cascade,
  answer_id uuid references answers(id) on delete cascade,
  comment_id uuid references comments(id) on delete cascade,
  reason text not null,
  status text not null default 'pending' check (status in ('pending','resolved','dismissed')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile saat user baru mendaftar
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, username, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 4)),
    new.raw_user_meta_data->>'full_name',
    case when new.raw_user_meta_data->>'role' = 'penyuluh' then 'penyuluh' else 'user' end
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Update vote_score setiap kali vote berubah
create or replace function recalc_vote_score()
returns trigger as $$
begin
  if (tg_op = 'DELETE') then
    if old.question_id is not null then
      update questions set vote_score = coalesce((select sum(value) from votes where question_id = old.question_id), 0) where id = old.question_id;
    end if;
    if old.answer_id is not null then
      update answers set vote_score = coalesce((select sum(value) from votes where answer_id = old.answer_id), 0) where id = old.answer_id;
    end if;
    return old;
  else
    if new.question_id is not null then
      update questions set vote_score = coalesce((select sum(value) from votes where question_id = new.question_id), 0) where id = new.question_id;
    end if;
    if new.answer_id is not null then
      update answers set vote_score = coalesce((select sum(value) from votes where answer_id = new.answer_id), 0) where id = new.answer_id;
    end if;
    return new;
  end if;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_vote_change on votes;
create trigger on_vote_change
  after insert or update or delete on votes
  for each row execute function recalc_vote_score();

-- Reputasi sederhana: +10 saat jawaban diterima, +2 per upvote
create or replace function apply_reputation_on_accept()
returns trigger as $$
begin
  if new.is_accepted = true and (old.is_accepted is distinct from true) then
    update profiles set reputation = reputation + 10 where id = new.author_id;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_answer_accepted on answers;
create trigger on_answer_accepted
  after update on answers
  for each row execute function apply_reputation_on_accept();

-- Notifikasi saat ada jawaban baru
create or replace function notify_new_answer()
returns trigger as $$
declare
  q_author uuid;
  q_title text;
begin
  select author_id, title into q_author, q_title from questions where id = new.question_id;
  if q_author is not null and q_author <> new.author_id then
    insert into notifications (user_id, type, message, link)
    values (q_author, 'new_answer', 'Ada jawaban baru untuk pertanyaan: ' || q_title, '/pertanyaan/' || new.question_id);
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_new_answer on answers;
create trigger on_new_answer
  after insert on answers
  for each row execute function notify_new_answer();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table categories enable row level security;
alter table questions enable row level security;
alter table question_images enable row level security;
alter table answers enable row level security;
alter table comments enable row level security;
alter table tags enable row level security;
alter table question_tags enable row level security;
alter table votes enable row level security;
alter table bookmarks enable row level security;
alter table notifications enable row level security;
alter table reports enable row level security;

-- Helper: cek apakah user saat ini admin
create or replace function is_admin()
returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$ language sql security definer stable set search_path = public;

-- PROFILES
create policy "profiles_select_all" on profiles for select using (true);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_admin_update" on profiles for update using (is_admin());

-- CATEGORIES & TAGS (baca publik, tulis admin)
create policy "categories_select_all" on categories for select using (true);
create policy "categories_admin_write" on categories for all using (is_admin()) with check (is_admin());
create policy "tags_select_all" on tags for select using (true);
create policy "tags_insert_auth" on tags for insert with check (auth.uid() is not null);

-- QUESTIONS
create policy "questions_select_all" on questions for select using (true);
create policy "questions_insert_own" on questions for insert with check (auth.uid() = author_id);
create policy "questions_update_own" on questions for update using (auth.uid() = author_id or is_admin());
create policy "questions_delete_own" on questions for delete using (auth.uid() = author_id or is_admin());

-- QUESTION IMAGES
create policy "question_images_select_all" on question_images for select using (true);
create policy "question_images_insert_owner" on question_images for insert with check (
  exists (select 1 from questions where id = question_id and author_id = auth.uid())
);
create policy "question_images_delete_owner" on question_images for delete using (
  exists (select 1 from questions where id = question_id and author_id = auth.uid()) or is_admin()
);

-- ANSWERS
create policy "answers_select_all" on answers for select using (true);
create policy "answers_insert_own" on answers for insert with check (auth.uid() = author_id);
create policy "answers_update_own" on answers for update using (auth.uid() = author_id or is_admin() or
  exists (select 1 from questions where id = question_id and author_id = auth.uid())
);
create policy "answers_delete_own" on answers for delete using (auth.uid() = author_id or is_admin());

-- COMMENTS
create policy "comments_select_all" on comments for select using (true);
create policy "comments_insert_own" on comments for insert with check (auth.uid() = author_id);
create policy "comments_delete_own" on comments for delete using (auth.uid() = author_id or is_admin());

-- QUESTION_TAGS
create policy "question_tags_select_all" on question_tags for select using (true);
create policy "question_tags_insert_owner" on question_tags for insert with check (
  exists (select 1 from questions where id = question_id and author_id = auth.uid())
);
create policy "question_tags_delete_owner" on question_tags for delete using (
  exists (select 1 from questions where id = question_id and author_id = auth.uid()) or is_admin()
);

-- VOTES
create policy "votes_select_all" on votes for select using (true);
create policy "votes_insert_own" on votes for insert with check (auth.uid() = voter_id);
create policy "votes_update_own" on votes for update using (auth.uid() = voter_id);
create policy "votes_delete_own" on votes for delete using (auth.uid() = voter_id);

-- BOOKMARKS
create policy "bookmarks_select_own" on bookmarks for select using (auth.uid() = user_id);
create policy "bookmarks_insert_own" on bookmarks for insert with check (auth.uid() = user_id);
create policy "bookmarks_delete_own" on bookmarks for delete using (auth.uid() = user_id);

-- NOTIFICATIONS
create policy "notifications_select_own" on notifications for select using (auth.uid() = user_id);
create policy "notifications_update_own" on notifications for update using (auth.uid() = user_id);
create policy "notifications_insert_system" on notifications for insert with check (true);

-- REPORTS
create policy "reports_select_own_or_admin" on reports for select using (auth.uid() = reporter_id or is_admin());
create policy "reports_insert_own" on reports for insert with check (auth.uid() = reporter_id);
create policy "reports_update_admin" on reports for update using (is_admin());

-- ============================================================
-- STORAGE: bucket untuk gambar pertanyaan
-- Jalankan bagian ini juga (atau buat bucket manual via dashboard: "question-images", public)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('question-images', 'question-images', true)
on conflict (id) do nothing;

create policy "question_images_public_read" on storage.objects
  for select using (bucket_id = 'question-images');

create policy "question_images_auth_upload" on storage.objects
  for insert with check (bucket_id = 'question-images' and auth.uid() is not null);

create policy "question_images_owner_delete" on storage.objects
  for delete using (bucket_id = 'question-images' and auth.uid() = owner);
