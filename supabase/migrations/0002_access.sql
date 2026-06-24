-- Modelo de acceso (opción 3): web pública, pero solo las canciones marcadas
-- como 'public' (dominio público o con licencia) se ven sin sesión; el resto
-- ('members', por defecto) solo las ven usuarios registrados de la parroquia.

alter table public.songs
  add column access text not null default 'members'
  check (access in ('public', 'members'));

-- Reemplaza la policy de lectura para aplicar la visibilidad por acceso.
drop policy if exists "songs_select_published_or_own_or_admin" on public.songs;

create policy "songs_select_visibility" on public.songs
  for select using (
    (status = 'published' and (access = 'public' or auth.uid() is not null))
    or created_by = auth.uid()
    or public.is_admin()
  );
