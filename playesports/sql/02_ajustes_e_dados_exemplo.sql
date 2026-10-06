-- RODAR HOJE no SQL Editor (projeto que já tem as 3 tabelas criadas).
-- Pode rodar mais de uma vez sem erro.

-- 1) Cancelar libera o horário: troca a regra antiga por uma que ignora canceladas
alter table reservas drop constraint if exists horario_unico;
create unique index if not exists horario_unico_ativo
  on reservas (quadra_id, data, horario_inicio) where status <> 'cancelado';

-- 2) Status só aceita valores válidos
alter table reservas drop constraint if exists reservas_status_check;
alter table reservas add constraint reservas_status_check check (status in ('agendado','finalizado','cancelado'));

-- 3) Função que informa horários ocupados (tela de Reserva)
create or replace function horarios_ocupados(p_quadra uuid, p_data date)
returns table (horario_inicio time)
language sql security definer set search_path = public as $$
  select r.horario_inicio from reservas r
  where r.quadra_id = p_quadra and r.data = p_data and r.status <> 'cancelado'
$$;
grant execute on function horarios_ocupados(uuid, date) to anon, authenticated;

-- 4) Modalidades da arena de teste + mais arenas de exemplo (dados fictícios)
update quadras set modalidades = array['Society','Gramado Natural'] where nome = 'Portaluppi Fut';

insert into quadras (nome, cidade, endereco, telefone, modalidades, preco_hora, horario_abertura, horario_fechamento, avaliacao, descricao)
select * from (values
 ('Arena Park','Capão da Canoa','Av. Paraguassú, 1500 - Centro','(51) 99999-0001',array['Society','Futsal'],100.00,'13:30'::time,'23:00'::time,4.5,'Arena com campos society e quadra de futsal, vestiário e estacionamento.'),
 ('Futsal Play','Capão da Canoa','Rua Sepé, 320 - Zona Nova','(51) 99999-0002',array['Futsal','Cobertura'],80.00,'13:30'::time,'23:00'::time,4.2,'Quadras de futsal cobertas, ideais para dias de chuva.')
) as v(nome,cidade,endereco,telefone,modalidades,preco_hora,horario_abertura,horario_fechamento,avaliacao,descricao)
where not exists (select 1 from quadras q where q.nome = v.nome);

update quadras set descricao='Campo de futebol society perfeito para quem quer jogar com estilo e paixão. Gramado cuidado, iluminação de LED e ambiente familiar.' where nome='Portaluppi Fut';
