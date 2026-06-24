-- Listas de canciones para eventos (boda, bautizo…), compartibles por enlace.
-- El enlace muestra el PROGRAMA (orden + tono) a cualquiera; los acordes solo
-- si la canción es 'public' o quien abre está logueado (coherente con el copyright).

create extension if not exists pgcrypto;

create table public.setlists (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_type text,                       -- 'boda' | 'bautizo' | 'comunion' | 'funeral' | 'otro'
  notes text,
  share_token text not null unique default encode(gen_random_bytes(9), 'hex'),
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.setlist_songs (
  setlist_id uuid not null references public.setlists (id) on delete cascade,
  song_id uuid not null references public.songs (id) on delete cascade,
  position int not null default 0,       -- orden dentro de la lista
  semitones int not null default 0,      -- tono marcado (transposición respecto al original)
  primary key (setlist_id, song_id)
);
create index setlist_songs_setlist_idx on public.setlist_songs (setlist_id, position);

alter table public.setlists enable row level security;
alter table public.setlist_songs enable row level security;

-- setlists: lectura permitida (el secreto es el share_token, no enumerable); el
-- dueño gestiona las suyas.
create policy "setlists_select" on public.setlists for select using (true);
create policy "setlists_insert_own" on public.setlists
  for insert with check (created_by = auth.uid());
create policy "setlists_update_own" on public.setlists
  for update using (created_by = auth.uid());
create policy "setlists_delete_own" on public.setlists
  for delete using (created_by = auth.uid());

-- setlist_songs: lectura permitida; escritura solo si el usuario es dueño de la lista.
create policy "setlist_songs_select" on public.setlist_songs for select using (true);
create policy "setlist_songs_write_owner" on public.setlist_songs
  for all using (
    exists (select 1 from public.setlists s where s.id = setlist_id and s.created_by = auth.uid())
  ) with check (
    exists (select 1 from public.setlists s where s.id = setlist_id and s.created_by = auth.uid())
  );

-- Programa compartido por token. SECURITY DEFINER: decide la visibilidad de los
-- acordes según el acceso de cada canción y si hay sesión.
create or replace function public.get_shared_setlist(p_token text)
returns jsonb language sql stable security definer set search_path = public as $$
  select (
    select jsonb_build_object(
      'id', sl.id,
      'title', sl.title,
      'event_type', sl.event_type,
      'notes', sl.notes,
      'songs', coalesce((
        select jsonb_agg(jsonb_build_object(
          'song_id', s.id,
          'title', s.title,
          'author', s.author,
          'original_key', s.original_key,
          'access', s.access,
          'position', ss.position,
          'semitones', ss.semitones,
          -- acordes solo si pública o hay sesión:
          'chordpro', case when s.access = 'public' or auth.uid() is not null then s.chordpro else null end
        ) order by ss.position)
        from public.setlist_songs ss
        join public.songs s on s.id = ss.song_id
        where ss.setlist_id = sl.id
      ), '[]'::jsonb)
    )
    from public.setlists sl
    where sl.share_token = p_token
  );
$$;

grant execute on function public.get_shared_setlist(text) to anon, authenticated;
