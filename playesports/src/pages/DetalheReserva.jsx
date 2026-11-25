import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import { Pin } from '../components/Icons'
import { brl, hhmm, dataBR, inicialDe, statusEfetivo } from '../utils'
import './detalhe-reserva.css'

const COLETE = 10
const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const diaSemana = (d) => { const [a, m, x] = d.split('-').map(Number); return DIAS[new Date(a, m - 1, x).getDay()] }

const VISUAL = {
  pendente: { icone: '⏳', titulo: 'Aguardando confirmação do dono' },
  agendado: { icone: '✅', titulo: 'Reserva confirmada!' },
  finalizado: { icone: '🏁', titulo: 'Reserva finalizada' },
  cancelado: { icone: '❌', titulo: 'Reserva cancelada' },
}

// situação de cada etapa: ok = feita, cur = atual, bad = deu errado, off = ainda não chegou
function etapas(st, r) {
  const enviada = r.criado_em
    ? 'Enviada em ' + new Date(r.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' às ' + new Date(r.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : ''
  const jogo = `${diaSemana(r.data)}, ${dataBR(r.data).slice(0, 5)} às ${hhmm(r.horario_inicio)}`
  const base = [
    { t: 'Reserva solicitada', d: enviada, s: 'ok' },
    { t: 'Confirmação do dono', d: '', s: 'off' },
    { t: 'Dia do jogo', d: jogo, s: 'off' },
  ]
  if (st === 'pendente') { base[1].s = 'cur'; base[1].d = 'Aguardando · você recebe o aviso no WhatsApp' }
  if (st === 'agendado') { base[1].s = 'ok'; base[1].d = 'Confirmada pelo dono'; base[2].s = 'cur' }
  if (st === 'finalizado') { base[1].s = 'ok'; base[1].d = 'Confirmada pelo dono'; base[2].s = 'ok' }
  if (st === 'cancelado') { base[1].s = 'bad'; base[1].d = 'Recusada ou sem resposta do dono'; base[2].d = '' }
  return base
}

export default function DetalheReserva() {
  const { id } = useParams()
  const [r, setR] = useState(null)
  const [largo, setLargo] = useState(() => window.innerWidth >= 760)
  const raiz = useRef(null)

  useEffect(() => { supabase.from('reservas').select('*, quadras(*)').eq('id', id).single().then(({ data }) => setR(data)) }, [id])
  useEffect(() => {
    const el = raiz.current
    if (!el) return
    const obs = new ResizeObserver(([e]) => setLargo(e.contentRect.width >= 700))
    obs.observe(el)
    return () => obs.disconnect()
  }, [r])

  if (!r) return <div className="tela"><Header titulo="Agendamento" /></div>
  const q = r.quadras
  const st = statusEfetivo(r)
  const v = VISUAL[st]
  const foto = q.fotos?.[0] || q.foto_url
  const fone = (q.telefone || '').replace(/\D/g, '')
  const mapa = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent([q.endereco, q.cidade].filter(Boolean).join(', '))
  const quadraValor = Number(r.valor_total) - (r.colete ? COLETE : 0)

  return (
    <div className="tela">
      <Header titulo={`Agendamento ${r.codigo}`} />
      <main className="conteudo claro">
        <div ref={raiz}>
          <div className={largo ? 'dr-cols largo' : 'dr-cols'}>
            <div className="dr-col">
              <section className="dr-card">
                <div className="dr-stat">
                  <div className={'dr-ico ' + st}>{v.icone}</div>
                  <div><h2>{v.titulo}</h2><p>{diaSemana(r.data)}, {dataBR(r.data)} · {hhmm(r.horario_inicio)}h - {hhmm(r.horario_fim)}h</p></div>
                </div>
                <div className="dr-tl">
                  {etapas(st, r).map((e, i) => (
                    <div key={i} className={'dr-pt ' + e.s}>
                      <div className="dr-dot">{e.s === 'ok' ? '✓' : e.s === 'bad' ? '✕' : i + 1}</div>
                      <div><b>{e.t}</b>{e.d && <small>{e.d}</small>}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="dr-card">
                <span className="dr-cod">{r.codigo}</span>
                <h4>Valores</h4>
                <div className="dr-lin"><span>Quadra (1h)</span><b>{brl(quadraValor)}</b></div>
                <div className="dr-lin"><span>Coletes</span><b>{r.colete ? brl(COLETE) : '—'}</b></div>
                <div className="dr-tot"><span>Total</span><b>{brl(r.valor_total)}</b></div>
              </section>
            </div>

            <div className="dr-col">
              <section className="dr-card dr-arena">
                <div className="dr-foto">{foto ? <img src={foto} alt={q.nome} /> : inicialDe(q.nome)}</div>
                <b>{q.nome}</b>
                <small><Pin /> {q.endereco}</small>
                <div className="dr-btns">
                  <a className="dr-bt p" href={mapa} target="_blank" rel="noreferrer">Ver no mapa</a>
                  {fone && <a className="dr-bt" href={`tel:+${fone.startsWith('55') ? fone : '55' + fone}`}>Ligar</a>}
                </div>
              </section>
              <div className="dr-acoes">
                <Link to={`/quadra/${r.quadra_id}/reservar`} className="dr-bt p">Reservar novamente</Link>
                <Link to="/agenda" className="dr-bt">Ver minhas reservas</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}