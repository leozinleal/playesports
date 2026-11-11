import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Header from '../components/Header'
import { brl, hhmm, dataBR, statusEfetivo } from '../utils'
import './dono.css'

const ABAS = [['pendente', 'Pendentes'], ['agendado', 'Agendadas'], ['finalizado', 'Finalizadas'], ['cancelado', 'Canceladas']]

export default function DonoReservas() {
  const nav = useNavigate()
  const [lista, setLista] = useState([])
  const [aba, setAba] = useState('pendente')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  async function carregar() {
    const { data: u } = await supabase.auth.getUser()
    if (!u.user) return nav('/login?area=dono')
    // o banco (RLS) só devolve reservas das quadras deste dono
    const { data } = await supabase
      .from('reservas')
      .select('*, quadras(nome), usuarios(nome, telefone)')
      .order('data', { ascending: true })
      .order('horario_inicio', { ascending: true })
    setLista(data || [])
    setCarregando(false)
  }
  useEffect(() => { carregar() }, [])

  // aceitar = 'agendado' (confirmada) | recusar = 'cancelado' (horário volta a ficar livre)
  async function responder(r, novoStatus) {
    setErro('')
    const { error } = await supabase.from('reservas').update({ status: novoStatus }).eq('id', r.id)
    if (error) return setErro('Não foi possível responder: ' + error.message)
    carregar()
  }

  const filtradas = lista.filter((r) => statusEfetivo(r) === aba)
  const total = filtradas.filter((r) => aba !== 'cancelado').reduce((s, r) => s + Number(r.valor_total), 0)

  return (
    <div className="tela">
      <Header titulo="Reservas recebidas" />
      <main className="conteudo">
        <div className="dono-abas">
          {ABAS.map(([k, l]) => <button key={k} className={aba === k ? 'ativo' : ''} onClick={() => setAba(k)}>{l}</button>)}
        </div>
        {erro && <p className="auth-erro" role="alert">{erro}</p>}
        {carregando && <p className="muted">Carregando...</p>}
        {!carregando && filtradas.length === 0 && <p className="muted">Nenhuma reserva aqui.</p>}
        {filtradas.length > 0 && aba !== 'cancelado' && (
          <p className="muted">{filtradas.length} reserva(s) · total {brl(total)}</p>
        )}
        {filtradas.map((r) => (
          <div className="dono-reserva" key={r.id}>
            <div className="dono-reserva-topo"><strong>{r.quadras?.nome}</strong><span className="codigo">{r.codigo}</span></div>
            <div className="mini">📅 {dataBR(r.data)} · 🕒 {hhmm(r.horario_inicio)}h - {hhmm(r.horario_fim)}h</div>
            <div className="mini">👤 {r.usuarios?.nome || 'Cliente'}{r.usuarios?.telefone ? ` · ${r.usuarios.telefone}` : ''}</div>
            <div className="mini">{brl(r.valor_total)}{r.colete ? ' · com colete' : ''}</div>
            {aba === 'pendente' && (
              <div className="dono-resposta">
                <button className="aceitar" onClick={() => responder(r, 'agendado')}>Aceitar</button>
                <button className="recusar" onClick={() => responder(r, 'cancelado')}>Recusar</button>
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  )
}