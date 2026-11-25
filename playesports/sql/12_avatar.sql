-- Foto de perfil dos usuários (bucket público "avatares", cada um só mexe na própria pasta)

alter table usuarios add column if not exists avatar_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatares', 'avatares', true, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 3145728,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists avatares_ver on storage.objects;
create policy avatares_ver on storage.objects for select
  using (bucket_id = 'avatares');

drop policy if exists avatares_enviar on storage.objects;
create policy avatares_enviar on storage.objects for insert to authenticated
  with check (bucket_id = 'avatares' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists avatares_apagar on storage.objects;
create policy avatares_apagar on storage.objects for delete to authenticated
  using (bucket_id = 'avatares' and (storage.foldername(name))[1] = auth.uid()::text);