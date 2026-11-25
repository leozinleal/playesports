import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Header from '../components/Header'
import IconeColetes from '../components/IconeColetes'
import { brl, gerarSlots, gerarCodigo, somaHora } from '../utils'
import './reserva.css'

const COLETE = 10
const SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const p2 = (n) => String(n).padStart(2, '0')
// data local (não UTC): evita virar "amanhã" depois das 21h
const iso = (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`
const hoje = () => iso(new Date())
const dePartes = (s) => { const [a, m, d] = s.split('-').map(Number); return new Date(a, m - 1, d) }
const rotulo = (s) => (s === hoje() ? 'Hoje' : SEMANA[dePartes(s).getDay()]) + ', ' + s.slice(8, 10) + '/' + s.slice(5, 7)
const proximosDias = (n) => Array.from({ length: n }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return iso(d) })

export default function Reserva() {
  const { id } = useParams()
  const nav = useNavigate()
  const [q, setQ] = useState(null)
  const [data, setData] = useState(hoje())
  const [ocupados, setOcupados] = useState([])
  const [slot, setSlot] = useState('')
  const [colete, setColete] = useState(false)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [largo, setLargo] = useState(() => window.innerWidth >= 760)
  const raiz = useRef(null)
  const dataRef = useRef(null)

  useEffect(() => { supabase.from('quadras').select('*').eq('id', id).single().then(({ data }) => setQ(data)) }, [id])
  useEffect(() => {
    let vivo = true
    setSlot('')
    supabase.rpc('horarios_ocupados', { p_quadra: id, p_data: data }).then(({ data: d }) => {
      if (vivo) setOcupados((d || []).map((r) => r.horario_inicio.slice(0, 5)))
    })
    return () => { vivo = false }
  }, [id, data])
  useEffect(() => {
    const el = raiz.current
    if (!el) return
    const obs = new ResizeObserver(([e]) => setLargo(e.contentRect.width >= 700))
    obs.observe(el)
    return () => obs.disconnect()
  }, [q])

  if (!q) return <div className="tela"><Header titulo="Reservar" /></div>
  const slots = gerarSlots(q.horario_abertura, q.horario_fechamento)
  const agora = new Date()
  const passou = (s) => data === hoje() && new Date(`${data}T${s}`) < agora
  const total = Number(q.preco_hora) + (colete ? COLETE : 0)
  const dias = proximosDias(14)
  const lista = dias.includes(data) ? dias : [data, ...dias]   // data escolhida em "Outra" aparece na fila
  const resumo = slot ? `${rotulo(data)} · ${slot} - ${somaHora(slot)}` : 'selecione um horário'

    function abrirCalendario() {
    const el = dataRef.current
    if (!el) return
    try { el.showPicker() } catch { el.focus(); el.click() }
  }
  
  async function confirmar() {
    setErro('')
    const { data: u } = await supabase.auth.getUser()
    if (!u.user) return nav('/login')
    if (!slot) return setErro('Escolha um horário.')
    setSalvando(true)
    const { data: nova, error } = await supabase.from('reservas').insert({
      codigo: gerarCodigo(), quadra_id: q.id, usuario_id: u.user.id, data,
      horario_inicio: slot, horario_fim: somaHora(slot), colete, valor_total: total,
    }).select().single()
    setSalvando(false)
    if (error) return setErro(error.code === '23505' ? 'Esse horário acabou de ser reservado. Escolha outro.' : 'Erro ao reservar: ' + error.message)
    nav(`/reserva/${nova.id}`)
  }

  return (
    <div className="tela">
      <Header titulo={q.nome} />
      <main className={largo ? 'conteudo' : 'conteudo com-barra'}>
        <div ref={raiz}>
          <div className={largo ? 'rs-cols largo' : 'rs-cols'}>
            <div>
              <div className="rs-passo"><i>1</i><b>Data</b></div>
              <div className="rs-dias">
                {lista.map((d) => (
                  <button key={d} className={'rs-dia' + (d === data ? ' on' : '')} onClick={() => setData(d)}>
                    <small>{d === hoje() ? 'Hoje' : SEMANA[dePartes(d).getDay()]}</small><b>{d.slice(8, 10)}</b>
                  </button>
                ))}
                <div className="rs-outra-box">
                  <button type="button" className="rs-outra" onClick={abrirCalendario}>📅 Outra</button>
                  <input ref={dataRef} className="rs-data-oculta" type="date" min={hoje()} value={data} tabIndex={-1} aria-hidden="true"
                    onChange={(e) => e.target.value && setData(e.target.value)} />
                </div>
              </div>

              <div className="rs-passo"><i>2</i><b>Horário</b></div>
              <div className="rs-slots">
                {slots.map((s) => {
                  const off = ocupados.includes(s) || passou(s)
                  return <button key={s} disabled={off} className={'rs-slot' + (slot === s ? ' on' : '')} onClick={() => setSlot(s)}>{s}</button>
                })}
              </div>
              <div className="rs-leg"><span><i />Livre</span><span><i className="x" />Ocupado</span><span><i className="on" />Selecionado</span></div>

              <div className="rs-passo"><i>3</i><b>Extras</b></div>
              <button type="button" role="switch" aria-checked={colete} className={'rs-colete' + (colete ? ' on' : '')} onClick={() => setColete(!colete)}>
                <span className="rs-ic"><IconeColetes tamanho={40} /></span>
                <span className="rs-tx"><b>Alugar coletes</b><span>Coletes para o seu time</span><span className="rs-pm">+ {brl(COLETE)}</span></span>
                <span className="rs-preco-col">+ {brl(COLETE)}</span>
                <span className="rs-tg" />
              </button>
              {erro && <p className="erro">{erro}</p>}
            </div>

            {largo && (
              <aside className="rs-card">
                <h4>Seu pedido</h4>
                <div className="rs-lin"><span>Arena</span><b>{q.nome}</b></div>
                <div className="rs-lin"><span>Data</span><b>{rotulo(data)}</b></div>
                <div className="rs-lin"><span>Horário</span><b>{slot ? `${slot} - ${somaHora(slot)}` : '—'}</b></div>
                <div className="rs-lin"><span>Quadra (1h)</span><b>{brl(q.preco_hora)}</b></div>
                {colete && <div className="rs-lin"><span>Coletes</span><b>{brl(COLETE)}</b></div>}
                <div className="rs-tot"><span>Total</span><b>{brl(total)}</b></div>
                <button className="rs-go" onClick={confirmar} disabled={salvando}>{salvando ? 'Enviando...' : 'Solicitar reserva'}</button>
                <p>O dono confirma e você recebe o aviso no WhatsApp</p>
              </aside>
            )}
          </div>
        </div>

        {!largo && (
          <div className="barra-preco"><div><strong>{brl(total)}</strong><small>{resumo}</small></div>
            <button className="btn-alugar" onClick={confirmar} disabled={salvando}>{salvando ? '...' : 'Solicitar'}</button></div>
        )}
      </main>
    </div>
  )
}