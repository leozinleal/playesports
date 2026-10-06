import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Header from '../components/Header'
import { brl, gerarSlots, gerarCodigo, somaHora } from '../utils'

const COLETE = 10
const hoje = () => new Date().toISOString().slice(0, 10)

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

  useEffect(() => { supabase.from('quadras').select('*').eq('id', id).single().then(({ data }) => setQ(data)) }, [id])
  useEffect(() => {
    setSlot('')
    supabase.rpc('horarios_ocupados', { p_quadra: id, p_data: data }).then(({ data: d }) => setOcupados((d || []).map((r) => r.horario_inicio.slice(0, 5))))
  }, [id, data])

  if (!q) return <div className="tela"><Header titulo="Reservar" /></div>
  const slots = gerarSlots(q.horario_abertura, q.horario_fechamento)
  const agora = new Date()
  const passou = (s) => data === hoje() && new Date(`${data}T${s}`) < agora
  const total = Number(q.preco_hora) + (colete ? COLETE : 0)

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
      <main className="conteudo com-barra">
        <h3>Escolha a data</h3>
        <input className="campo" type="date" min={hoje()} value={data} onChange={(e) => setData(e.target.value)} />
        <h3>Horários (1 hora)</h3>
        <div className="slots">
          {slots.map((s) => {
            const off = ocupados.includes(s) || passou(s)
            return <button key={s} disabled={off} className={'slot' + (slot === s ? ' ativo' : '')} onClick={() => setSlot(s)}>{s}</button>
          })}
        </div>
        <p className="muted pequeno">Horários cinza já estão ocupados.</p>
        <label className="check"><input type="checkbox" checked={colete} onChange={(e) => setColete(e.target.checked)} /> Alugar coletes (+ {brl(COLETE)})</label>
        {erro && <p className="erro">{erro}</p>}
        <div className="barra-preco"><div><strong>{brl(total)}</strong><small>{slot ? `${slot} - ${somaHora(slot)}` : 'selecione um horário'}</small></div>
          <button className="btn-alugar" onClick={confirmar} disabled={salvando}>{salvando ? '...' : 'Confirmar'}</button></div>
      </main>
    </div>
  )
}
