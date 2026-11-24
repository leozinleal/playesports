-- Até 5 fotos por quadra, guardadas no Supabase Storage (bucket público "quadras")

-- 1) Coluna com a lista de fotos (a primeira é a capa) e limite de 5
alter table quadras add column if not exists fotos text[] not null default '{}';
alter table quadras drop constraint if exists quadras_fotos_max5;
alter table quadras add constraint quadras_fotos_max5 check (cardinality(fotos) <= 5);

-- quadras que já tinham uma foto (link) passam a tê-la na lista
update quadras set fotos = array[foto_url]
where cardinality(fotos) = 0 and foto_url is not null and foto_url <> '';

-- 2) Pasta de armazenamento: qualquer um VÊ; só imagens de até 5 MB
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('quadras', 'quadras', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- 3) Quem pode enviar/apagar: só DONO, e só dentro da própria pasta (pasta = id do usuário)
drop policy if exists quadras_fotos_ver on storage.objects;
create policy quadras_fotos_ver on storage.objects for select
  using (bucket_id = 'quadras');

drop policy if exists quadras_fotos_enviar on storage.objects;
create policy quadras_fotos_enviar on storage.objects for insert to authenticated
  with check (bucket_id = 'quadras'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (select 1 from public.usuarios u where u.id = auth.uid() and u.tipo = 'dono'));

drop policy if exists quadras_fotos_apagar on storage.objects;
create policy quadras_fotos_apagar on storage.objects for delete to authenticated
  using (bucket_id = 'quadras'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (select 1 from public.usuarios u where u.id = auth.uid() and u.tipo = 'dono'));