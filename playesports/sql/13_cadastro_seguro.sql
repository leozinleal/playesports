-- Cadastro seguro: CPF válido e único, telefone único, perfil criado pelo banco.

-- 1) CPF fica em tabela separada: só o próprio usuário enxerga
create table if not exists documentos (
  usuario_id uuid primary key references usuarios(id) on delete cascade,
  cpf text not null unique check (cpf ~ '^[0-9]{11}$')
);
alter table documentos enable row level security;
drop policy if exists documentos_ver_proprio on documentos;
create policy documentos_ver_proprio on documentos for select using (auth.uid() = usuario_id);

-- 2) Telefone único (compara só os números)
create unique index if not exists usuarios_telefone_unico
  on usuarios ((regexp_replace(telefone, '\D', '', 'g')))
  where telefone is not null and telefone <> '';

-- 3) Validação do CPF no banco (dígitos verificadores)
create or replace function cpf_valido(c text) returns boolean language plpgsql immutable as $$
declare d int[]; s int; i int; r int;
begin
  if c is null or c !~ '^[0-9]{11}$' or c ~ '^(\d)\1{10}$' then return false; end if;
  for i in 1..11 loop d[i] := substr(c, i, 1)::int; end loop;
  s := 0; for i in 1..9 loop s := s + d[i] * (11 - i); end loop;
  r := (s * 10) % 11; if r = 10 then r := 0; end if;
  if r <> d[10] then return false; end if;
  s := 0; for i in 1..10 loop s := s + d[i] * (12 - i); end loop;
  r := (s * 10) % 11; if r = 10 then r := 0; end if;
  return r = d[11];
end $$;

-- 4) Pergunta rápida do site antes de cadastrar: 'ok', 'cpf' ou 'telefone'
create or replace function cadastro_disponivel(p_cpf text, p_tel text) returns text
language sql stable security definer set search_path = public as $$
  select case
    when exists (select 1 from documentos where cpf = regexp_replace(coalesce(p_cpf, ''), '\D', '', 'g')) then 'cpf'
    when regexp_replace(coalesce(p_tel, ''), '\D', '', 'g') <> ''
      and exists (select 1 from usuarios where regexp_replace(coalesce(telefone, ''), '\D', '', 'g') = regexp_replace(p_tel, '\D', '', 'g')) then 'telefone'
    else 'ok' end
$$;
grant execute on function cadastro_disponivel(text, text) to anon, authenticated;

-- 5) O PERFIL agora nasce no banco, assim que a conta é criada
create or replace function novo_usuario() returns trigger language plpgsql security definer set search_path = public as $$
declare
  m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_cpf text := regexp_replace(coalesce(m->>'cpf', ''), '\D', '', 'g');
  v_tel text := regexp_replace(coalesce(m->>'telefone', ''), '\D', '', 'g');
  v_nome text := trim(coalesce(m->>'nome', ''));
  v_tipo text := case when m->>'tipo' = 'dono' then 'dono' else 'cliente' end;
begin
  if coalesce(m->>'cpf', '') = '' then return new; end if;   -- contas criadas pelo painel do Supabase
  if v_nome = '' then raise exception 'Nome obrigatório'; end if;
  if not cpf_valido(v_cpf) then raise exception 'CPF inválido'; end if;
  if length(v_tel) not between 10 and 11 then raise exception 'Telefone inválido'; end if;
  insert into usuarios (id, nome, email, telefone, tipo) values (new.id, v_nome, new.email, v_tel, v_tipo);
  insert into documentos (usuario_id, cpf) values (new.id, v_cpf);
  return new;
end $$;
drop trigger if exists trg_novo_usuario on auth.users;
create trigger trg_novo_usuario after insert on auth.users for each row execute function novo_usuario();

-- 6) O navegador não cria mais perfil sozinho (evita burlar o CPF)
drop policy if exists "Usuário cria seu próprio perfil" on usuarios;