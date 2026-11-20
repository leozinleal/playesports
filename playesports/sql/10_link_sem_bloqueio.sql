-- O link de resposta usa funções seguras do banco; o gatilho não deve bloqueá-las quando o navegador está logado.

create or replace function proteger_reserva() returns trigger language plpgsql as $$
declare preco numeric; esta_ativa boolean; eh_dono boolean;
begin
  -- SQL Editor, n8n (service_role) e as funções do link (rodam como dono da função) ficam livres
  if auth.uid() is null or current_user not in ('authenticated', 'anon') then return new; end if;

  if tg_op = 'INSERT' then
    select preco_hora, ativa into preco, esta_ativa from quadras where id = new.quadra_id;
    if preco is null then raise exception 'Quadra não encontrada'; end if;
    if not esta_ativa then raise exception 'Esta quadra não está recebendo reservas'; end if;
    new.valor_total := preco + case when new.colete then 10 else 0 end;
    new.status := 'pendente'; new.avaliacao := null; return new;
  end if;

  if new.quadra_id is distinct from old.quadra_id
     or new.usuario_id is distinct from old.usuario_id
     or new.codigo is distinct from old.codigo
     or new.data is distinct from old.data
     or new.horario_inicio is distinct from old.horario_inicio
     or new.horario_fim is distinct from old.horario_fim
     or new.colete is distinct from old.colete
     or new.valor_total is distinct from old.valor_total then
    raise exception 'Reserva não pode ser alterada';
  end if;

  if new.status is not distinct from old.status then return new; end if;

  if old.usuario_id = auth.uid() then
    if new.status <> 'cancelado' or old.status not in ('pendente', 'agendado') then
      raise exception 'Só é permitido cancelar a reserva';
    end if;
  else
    select exists (select 1 from quadras where id = old.quadra_id and dono_id = auth.uid()) into eh_dono;
    if not eh_dono or old.status <> 'pendente' or new.status not in ('agendado', 'cancelado') then
      raise exception 'Só é permitido aceitar ou recusar reservas pendentes';
    end if;
  end if;

  return new;
end $$;