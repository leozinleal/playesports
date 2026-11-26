import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Header from '../components/Header'
import { brl, hhmm, dataBR, inicialDe, statusEfetivo, fimDaReserva, gerarSlots } from '../utils'
import './dono-painel.css'

const p2 = (n) => String(n).padStart(2, '0')
const iso = (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`
const SEMANA = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
const dePartes = (s) => { const [a, m, d] = s.split('-').map(Number); return new Date(a, m - 1, d) }

export default function DonoPainel() {
  const nav = useNavigate()
  const [perfil, setPerfil] = useState(null)
  const [quadras, setQuadras] = useState([])
  const [reservas, setReservas] = useState([])
  const [erro, setErro] = useState('')
  const [respondendo, setRespondendo] = useState('')
  const [largo, setLargo] = useState(() => window.innerWidth >= 760)
  const raiz = useRef(null)

  async function carregarReservas(ids) {
    if (!ids.length) return setReservas([])
    const { data } = await supabase.from('reservas')
      .select('*, quadras(nome), usuarios(nome, telefone)')
      .in('quadra_id', ids)
      .order('data', { ascending: true }).order('horario_inicio', { ascending: true })
    setReservas(data || [])
  }

  useEffect(() => {
    async function carregar() {
      const { data: u } = await supabase.auth.getUser()
      if (!u.user) return nav('/login?area=dono')
      const { data: p } = await supabase.from('usuarios').select('*').eq('id', u.user.id).single()
      if (p?.tipo !== 'dono') return nav('/')          // só parceiros entram aqui
      setPerfil(p)
      const { data: q } = await supabase.from('quadras').select('*').eq('dono_id', u.user.id)
      setQuadras(q || [])
      await carregarReservas((q || []).map((x) => x.id))
    }
    carregar()
  }, [])
  useEffect(() => {
    const el = raiz.current
    if (!el) return
    const obs = new ResizeObserver(([e]) => setLargo(e.contentRect.width >= 700))
    obs.observe(el)
    return () => obs.disconnect()
  }, [perfil])

  async function alternarAtiva(q) {
    const { error } = await supabase.from('quadras').update({ ativa: !q.ativa }).eq('id', q.id)
    if (!error) setQuadras(quadras.map((x) => (x.id === q.id ? { ...x, ativa: !q.ativa } : x)))
  }

  // aceitar = 'agendado' | recusar = 'cancelado' (o horário volta a ficar livre)
  async function responder(r, novoStatus) {
    setErro(''); setRespondendo(r.id)
    const { error } = await supabase.from('reservas').update({ status: novoStatus }).eq('id', r.id)
    setRespondendo('')
    if (error) return setErro('Não foi possível responder: ' + error.message)
    carregarReservas(quadras.map((x) => x.id))
  }

  async function sair() { await supabase.auth.signOut(); nav('/login') }

  // ---- números do painel ----
  const agora = new Date()
  const hojeIso = iso(agora)
  const comSt = reservas.map((r) => ({ ...r, st: statusEfetivo(r) }))
  const pendentes = comSt.filter((r) => r.st === 'pendente')
  const confirmadas = comSt.filter((r) => r.st === 'agendado' || r.st === 'finalizado')
  const hoje = confirmadas.filter((r) => r.data === hojeIso)
  const proximos = comSt.filter((r) => r.st === 'agendado' && fimDaReserva(r) > agora).slice(0, 3)

  const mesAtual = hojeIso.slice(0, 7)
  const anterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1)
  const mesAnterior = `${anterior.getFullYear()}-${p2(anterior.getMonth() + 1)}`
  const soma = (mes) => confirmadas.filter((r) => r.data.slice(0, 7) === mes).reduce((s, r) => s + Number(r.valor_total), 0)
  const fat = soma(mesAtual), fatAnt = soma(mesAnterior)
  const variacao = fatAnt > 0 ? Math.round(((fat - fatAnt) / fatAnt) * 100) : null

  const dsem = (agora.getDay() + 6) % 7
  const seg = new Date(agora); seg.setDate(agora.getDate() - dsem)
  const dom = new Date(seg); dom.setDate(seg.getDate() + 6)
  const ocupadas = confirmadas.filter((r) => r.data >= iso(seg) && r.data <= iso(dom)).length
  const disponiveis = quadras.filter((q) => q.ativa).reduce((s, q) => s + gerarSlots(q.horario_abertura, q.horario_fechamento).length * 7, 0)
  const ocupacao = disponiveis ? Math.round((ocupadas / disponiveis) * 100) : 0

  const dataTexto = agora.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  const rotuloDia = (d) => (d === hojeIso ? 'HOJE' : SEMANA[dePartes(d).getDay()])
  const horasHoje = hoje.map((r) => hhmm(r.horario_inicio)).join(' e ')

  return (
    <div className="tela">
      <Header titulo="Painel do parceiro" voltar={false} />
      <main className="conteudo">
        {perfil && (
          <div ref={raiz}>
            <div className={largo ? 'dp-cols largo' : 'dp-cols'}>
              <div className="dp-topo">
                <div>
                  <h2>Olá, {perfil.nome.split(' ')[0]}!</h2>
                  <p>{dataTexto.charAt(0).toUpperCase() + dataTexto.slice(1)}</p>
                </div>
                <Link to="/dono/quadra/nova" className="dp-nova">+ Nova quadra</Link>
              </div>

              <div className="dp-kp">
                <div className={pendentes.length ? 'dp-k al' : 'dp-k'}><small>Pendentes</small><b>{pendentes.length}</b><span>{pendentes.length ? 'aguardando você' : 'nada a responder'}</span></div>
                <div className="dp-k"><small>Jogos hoje</small><b>{hoje.length}</b><span>{horasHoje || 'nenhum jogo'}</span></div>
                <div className="dp-k"><small>Faturamento do mês</small><b>{brl(fat).replace(',00', '')}</b><span>{variacao === null ? 'reservas confirmadas' : `${variacao >= 0 ? '+' : ''}${variacao}% vs. mês anterior`}</span></div>
                <div className="dp-k"><small>Ocupação da semana</small><b>{ocupacao}%</b><span>{ocupadas} de {disponiveis} horários</span></div>
              </div>

              {erro && <p className="erro">{erro}</p>}

              <div className="dp-g2">
                <section className="dp-card">
                  <h3>Pedidos para responder <Link to="/dono/reservas">Ver todos</Link></h3>
                  {pendentes.length === 0 && <p className="dp-vazio">Nenhum pedido aguardando resposta.</p>}
                  {pendentes.slice(0, 5).map((r) => (
                    <div className="dp-pd" key={r.id}>
                      <b>{r.usuarios?.nome || 'Cliente'}</b>
                      <small>📅 {dataBR(r.data).slice(0, 5)} · 🕒 {hhmm(r.horario_inicio)} - {hhmm(r.horario_fim)} · {brl(r.valor_total)}{r.colete ? ' · com colete' : ''}</small>
                      <small>{r.quadras?.nome}{r.usuarios?.telefone ? ` · ${r.usuarios.telefone}` : ''}</small>
                      <div className="dp-ab">
                        <button className="ok" disabled={respondendo === r.id} onClick={() => responder(r, 'agendado')}>Aceitar</button>
                        <button className="no" disabled={respondendo === r.id} onClick={() => responder(r, 'cancelado')}>Recusar</button>
                      </div>
                    </div>
                  ))}
                </section>

                <section className="dp-card">
                  <h3>Próximos jogos <Link to="/dono/reservas?aba=agendado">Ver todos</Link></h3>
                  {proximos.length === 0 && <p className="dp-vazio">Nenhum jogo confirmado por enquanto.</p>}
                  {proximos.map((r) => (
                    <div className="dp-pj" key={r.id}>
                      <div className="dp-hr"><small>{rotuloDia(r.data)}</small>{hhmm(r.horario_inicio)}</div>
                      <div><b>{r.usuarios?.nome || 'Cliente'}</b><small>{r.quadras?.nome}{r.colete ? ' · com colete' : ''}</small></div>
                      <span className="dp-tag">Confirmado</span>
                    </div>
                  ))}
                </section>
              </div>

              <section className="dp-card dp-quadras">
                <h3>Minhas quadras</h3>
                {quadras.length === 0 && <p className="dp-vazio">Você ainda não tem quadras cadastradas. Use o botão “+ Nova quadra” para cadastrar a primeira.</p>}
                {quadras.map((q) => {
                  const foto = q.fotos?.[0] || q.foto_url
                  return (
                    <div key={q.id} className={q.ativa ? 'dp-q' : 'dp-q off'}>
                      <div className="dp-qf">{foto ? <img src={foto} alt={q.nome} /> : inicialDe(q.nome)}</div>
                      <div><b>{q.nome}</b><small>★ {Number(q.avaliacao || 0).toFixed(1)} · {q.cidade} · {hhmm(q.horario_abertura)} - {hhmm(q.horario_fechamento)}{!q.ativa ? ' · Desativada' : ''}</small></div>
                      <div className="dp-qa">
                        <Link to={`/dono/quadra/${q.id}/editar`}>Editar</Link>
                        <button onClick={() => alternarAtiva(q)}>{q.ativa ? 'Desativar' : 'Reativar'}</button>
                      </div>
                    </div>
                  )
                })}
              </section>

              <button className="btn btn-verde pequeno dp-sair" onClick={sair}>Sair</button>
                            <p className="dp-ajuda">Precisa de ajuda? <Link to="/suporte">Fale com o suporte</Link></p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}