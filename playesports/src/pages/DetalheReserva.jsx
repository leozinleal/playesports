import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import { Pin } from '../components/Icons'
import { brl, hhmm, dataBR, inicialDe, statusEfetivo } from '../utils'

export default function DetalheReserva() {
  const { id } = useParams()
  const [r, setR] = useState(null)
  useEffect(() => { supabase.from('reservas').select('*, quadras(*)').eq('id', id).single().then(({ data }) => setR(data)) }, [id])
  if (!r) return <div className="tela"><Header titulo="Agendamento" /></div>
  const st = statusEfetivo(r)
  const rotulo = { agendado: 'Reserva confirmada!', finalizado: 'Reserva finalizada', cancelado: 'Reserva cancelada' }[st]
  return (
    <div className="tela">
      <Header titulo={`Agendamento ${r.codigo}`} />
      <main className="conteudo claro">
        <div className="card-branco">
          <h3>Detalhes do agendamento:</h3>
          <div className="linha-arena">
            <div className="avatar">{inicialDe(r.quadras.nome)}</div>
            <div><strong>{r.quadras.nome}</strong><div className="mini"><Pin /> {r.quadras.endereco}</div></div>
          </div>
          <div className={'faixa ' + st}>{rotulo} · {dataBR(r.data)} às {hhmm(r.horario_inicio)}h</div>
          <dl className="resumo">
            <dt>Horário</dt><dd>{hhmm(r.horario_inicio)}h - {hhmm(r.horario_fim)}h</dd>
            <dt>Valor da hora:</dt><dd>{brl(r.quadras.preco_hora)}</dd>
            <dt>Colete:</dt><dd>{r.colete ? brl(10) : '—'}</dd>
            <dt><strong>Total:</strong></dt><dd><strong>{brl(r.valor_total)}</strong></dd>
          </dl>
          <Link to={`/quadra/${r.quadra_id}/reservar`} className="btn btn-verde pequeno">Reservar novamente</Link>
          <Link to="/agenda" className="centro link-verde">Ver minhas reservas</Link>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
