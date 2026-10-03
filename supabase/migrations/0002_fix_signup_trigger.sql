-- ============================================================
-- FIX: "Database error saving new user" saat register
-- Jalankan file ini di Supabase Dashboard > SQL Editor
-- (Aman dijalankan di project yang sudah pernah menjalankan 0001_init.sql —
--  cukup menimpa ulang fungsi trigger yang bermasalah)
-- ============================================================

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
