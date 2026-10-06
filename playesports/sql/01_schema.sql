-- PlayEsports - Schema completo (PostgreSQL / Supabase)
-- Autor: Leonardo Leal da Silva | ULBRA Torres | TCC Projeto Tecnológico
-- Rode no SQL Editor do Supabase. Para projeto já criado, use apenas 02_ajustes.sql.

create table if not exists usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  email text not null,
  telefone text,
  criado_em timestamptz default now()
);

create table if not exists quadras (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cidade text not null,
  endereco text not null,
  telefone text,
  modalidades text[] default '{}',
  preco_hora numeric(10,2) not null,
  horario_abertura time not null,
  horario_fechamento time not null,
  avaliacao numeric(2,1) default 0,
  descricao text,
  foto_url text,
  criado_em timestamptz default now()
);

create table if not exists reservas (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,
  quadra_id uuid not null references quadras(id) on delete cascade,
  usuario_id uuid not null references usuarios(id) on delete cascade,
  data date not null,
  horario_inicio time not null,
  horario_fim time not null,
  colete boolean default false,
  valor_total numeric(10,2) not null,
  status text not null default 'agendado' check (status in ('agendado','finalizado','cancelado')),
  avaliacao int check (avaliacao between 1 and 5),
  criado_em timestamptz default now()
);

-- Regra de negócio: um horário ativo por quadra/data (cancelada libera o horário)
create unique index if not exists horario_unico_ativo
  on reservas (quadra_id, data, horario_inicio) where status <> 'cancelado';

-- Segurança (RLS)
alter table usuarios enable row level security;
alter table quadras  enable row level security;
alter table reservas enable row level security;

create policy "quadras_leitura_publica" on quadras for select using (true);
create policy "usuarios_select_proprio" on usuarios for select using (auth.uid() = id);
create policy "usuarios_insert_proprio" on usuarios for insert with check (auth.uid() = id);
create policy "usuarios_update_proprio" on usuarios for update using (auth.uid() = id);
create policy "reservas_select_proprias" on reservas for select using (auth.uid() = usuario_id);
create policy "reservas_insert_proprias" on reservas for insert with check (auth.uid() = usuario_id);
create policy "reservas_update_proprias" on reservas for update using (auth.uid() = usuario_id);

-- Horários ocupados (visível a todos, sem expor dados de outros usuários)
create or replace function horarios_ocupados(p_quadra uuid, p_data date)
returns table (horario_inicio time)
language sql security definer set search_path = public as $$
  select r.horario_inicio from reservas r
  where r.quadra_id = p_quadra and r.data = p_data and r.status <> 'cancelado'
$$;
grant execute on function horarios_ocupados(uuid, date) to anon, authenticated;
