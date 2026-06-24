-- Cancionero parroquial — esquema + RLS.
-- La seguridad vive en las RLS policies (no en el secreto de las claves).

-- ───────────────────────── perfiles + rol ─────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- Crea el perfil automáticamente al registrarse un usuario.
create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'name', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Helper reutilizable en las policies.
create function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ───────────────────────── canciones ─────────────────────────
create table public.songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  themes text[] not null default '{}',
  chordpro text not null,
  original_key text,
  pdf_path text,
  status text not null default 'pending' check (status in ('published', 'pending')),
  parent_id uuid references public.songs (id) on delete cascade, -- null = oficial; set = alternativa
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);
create index songs_status_idx on public.songs (status);
create index songs_parent_idx on public.songs (parent_id);

-- ───────────────────────── valoraciones ─────────────────────────
create table public.ratings (
  user_id uuid not null references auth.users (id) on delete cascade,
  song_id uuid not null references public.songs (id) on delete cascade,
  stars int not null check (stars between 1 and 5),
  created_at timestamptz not null default now(),
  primary key (user_id, song_id)
);

-- ───────────────────────── correcciones ─────────────────────────
create table public.corrections (
  id uuid primary key default gen_random_uuid(),
  song_id uuid not null references public.songs (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now()
);

-- ═════════════════════════ RLS ═════════════════════════
alter table public.profiles enable row level security;
alter table public.songs enable row level security;
alter table public.ratings enable row level security;
alter table public.corrections enable row level security;

-- profiles: cada uno ve/edita el suyo (no puede auto-promocionarse a admin).
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own_keep_role" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

-- songs: lectura pública de publicadas; el autor ve las suyas; admin ve todo.
create policy "songs_select_published_or_own_or_admin" on public.songs
  for select using (status = 'published' or created_by = auth.uid() or public.is_admin());
-- admin: control total del catálogo oficial.
create policy "songs_admin_insert" on public.songs
  for insert with check (public.is_admin());
create policy "songs_admin_update" on public.songs
  for update using (public.is_admin());
create policy "songs_admin_delete" on public.songs
  for delete using (public.is_admin());
-- usuario: solo puede subir ALTERNATIVAS, siempre pending y a su nombre.
create policy "songs_user_alternative_insert" on public.songs
  for insert with check (created_by = auth.uid() and status = 'pending' and parent_id is not null);

-- ratings: lectura pública (para medias); cada uno gestiona el suyo.
create policy "ratings_select_all" on public.ratings for select using (true);
create policy "ratings_insert_own" on public.ratings for insert with check (user_id = auth.uid());
create policy "ratings_update_own" on public.ratings for update using (user_id = auth.uid());
create policy "ratings_delete_own" on public.ratings for delete using (user_id = auth.uid());

-- corrections: el autor ve las suyas, admin ve todas; admin las resuelve.
create policy "corrections_select_own_or_admin" on public.corrections
  for select using (user_id = auth.uid() or public.is_admin());
create policy "corrections_insert_own" on public.corrections
  for insert with check (user_id = auth.uid());
create policy "corrections_admin_update" on public.corrections
  for update using (public.is_admin());

-- ═════════════════════════ Storage (PDFs) ═════════════════════════
insert into storage.buckets (id, name, public)
values ('songs-pdfs', 'songs-pdfs', true)
on conflict (id) do nothing;

create policy "pdfs_public_read" on storage.objects
  for select using (bucket_id = 'songs-pdfs');
create policy "pdfs_admin_insert" on storage.objects
  for insert with check (bucket_id = 'songs-pdfs' and public.is_admin());
create policy "pdfs_admin_update" on storage.objects
  for update using (bucket_id = 'songs-pdfs' and public.is_admin());
create policy "pdfs_admin_delete" on storage.objects
  for delete using (bucket_id = 'songs-pdfs' and public.is_admin());
