-- Link de resposta: cada reserva ganha um código secreto; o dono abre /responder/<código> e aceita ou recusa.

-- 1) Tabela de códigos: ninguém do site (cliente/anon) consegue ler. Só o n8n (secret key) e as funções abaixo.
create table if not exists reserva_tokens (
  reserva_id uuid primary key references reservas(id) on delete cascade,
  token uuid not null unique default gen_random_uuid()
);
alter table reserva_tokens enable row level security;
revoke all on reserva_tokens from anon, authenticated;

-- 2) Toda reserva nova ganha seu código automaticamente
create or replace function criar_token_reserva() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into reserva_tokens (reserva_id) values (new.id) on conflict do nothing;
  return new;
end $$;

drop trigger if exists reserva_token_ins on reservas;
create trigger reserva_token_ins after insert on reservas
  for each row execute function criar_token_reserva();

-- reservas que já existem também ganham código
insert into reserva_tokens (reserva_id) select id from reservas on conflict do nothing;

-- 3) Página do dono: ver os dados da reserva pelo código (sem telefone do cliente)
create or replace function ver_reserva_por_token(p_token uuid)
returns table (codigo text, quadra text, data date, horario_inicio time, horario_fim time,
               cliente text, valor_total numeric, colete boolean, status text, expirada boolean)
language sql security definer set search_path = public as $$
  select r.codigo, q.nome, r.data, r.horario_inicio, r.horario_fim, u.nome, r.valor_total, r.colete, r.status,
         ((r.data + r.horario_fim) at time zone 'America/Sao_Paulo') < now()
  from reserva_tokens t
  join reservas r on r.id = t.reserva_id
  join quadras q on q.id = r.quadra_id
  join usuarios u on u.id = r.usuario_id
  where t.token = p_token;
$$;

-- 4) Botões Aceitar/Recusar: responde pelo código. Só vale para reserva pendente e que ainda não passou.
create or replace function responder_reserva(p_token uuid, p_acao text) returns text
language plpgsql security definer set search_path = public as $$
declare r reservas%rowtype;
begin
  if p_acao not in ('agendado', 'cancelado') then return 'invalida'; end if;

  select rs.* into r from reserva_tokens t join reservas rs on rs.id = t.reserva_id
  where t.token = p_token for update of rs;
  if not found then return 'invalida'; end if;

  if r.status <> 'pendente' then return 'ja_respondida'; end if;
  if ((r.data + r.horario_fim) at time zone 'America/Sao_Paulo') < now() then return 'expirada'; end if;

  update reservas set status = p_acao where id = r.id;
  return 'ok_' || p_acao;
end $$;

-- As funções são públicas, mas só funcionam com o código secreto certo
revoke all on function ver_reserva_por_token(uuid), responder_reserva(uuid, text) from public;
grant execute on function ver_reserva_por_token(uuid), responder_reserva(uuid, text) to anon, authenticated;