import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import { Search } from '../components/Icons'
import { brl, hhmm, dataBR, statusEfetivo, inicialDe } from '../utils'

const ABAS = [['agendado', 'Agendados'], ['finalizado', 'Finalizados'], ['cancelado', 'Cancelados']]

export default function Agenda() {
  const nav = useNavigate()
  const [reservas, setReservas] = useState([])
  const [aba, setAba] = useState('agendado')
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)

  async function carregar() {
    const { data: u } = await supabase.auth.getUser()
    if (!u.user) return nav('/login')
    const { data } = await supabase.from('reservas').select('*, quadras(nome, foto_url, modalidades)').eq('usuario_id', u.user.id).order('data', { ascending: false }).order('horario_inicio', { ascending: false })
    setReservas(data || []); setCarregando(false)
  }
  useEffect(() => { carregar() }, [])

  async function cancelar(r) {
    if (!confirm('Cancelar esta reserva?')) return
    await supabase.from('reservas').update({ status: 'cancelado' }).eq('id', r.id)
    carregar()
  }

  const lista = reservas.filter((r) => statusEfetivo(r) === aba &&
    `${r.quadras?.nome} ${r.codigo} ${r.data}`.toLowerCase().includes(busca.toLowerCase()))

  return (
    <div className="tela">
      <Header titulo="Horários" voltar={false}>
        <div className="abas">{ABAS.map(([k, l]) => <button key={k} className={aba === k ? 'ativo' : ''} onClick={() => setAba(k)}>{l}</button>)}</div>
      </Header>
      <main className="conteudo">
        <label className="busca escura"><Search /><input placeholder="Busque um horário específico" value={busca} onChange={(e) => setBusca(e.target.value)} /></label>
        {carregando && <p className="muted">Carregando...</p>}
        {!carregando && lista.length === 0 && <p className="muted">Nenhuma reserva aqui.</p>}
        {lista.map((r) => (
          <div className="card-reserva" key={r.id}>
            <div className="card-reserva-topo"><span>{aba === 'cancelado' ? 'Cancelado' : 'Agendado'} em {dataBR(r.criado_em.slice(0, 10))}</span><span className="codigo">{r.codigo}</span></div>
            <Link to={`/reserva/${r.id}`} className="card-reserva-corpo">
              {r.quadras?.foto_url ? <img className="avatar" src={r.quadras.foto_url} alt="" /> : <div className="avatar">{inicialDe(r.quadras?.nome)}</div>}
              <div><strong>{r.quadras?.nome}</strong>
                <div className="mini">📅 {dataBR(r.data)}</div>
                <div className="mini verde">🕒 {hhmm(r.horario_inicio)}h - {hhmm(r.horario_fim)}h</div>
                <div className="mini">{brl(r.valor_total)}</div></div>
              <span className="seta">›</span>
            </Link>
            {aba === 'agendado' && <button className="btn-cancelar" onClick={() => cancelar(r)}>Cancelar reserva</button>}
          </div>
        ))}
      </main>
      <BottomNav />
    </div>
  )
}
