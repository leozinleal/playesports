import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import CardQuadra from '../components/CardQuadra'
import BottomNav from '../components/BottomNav'
import { Pin } from '../components/Icons'

const FILTROS = ['Society', 'Gramado Natural', 'Futsal', 'Cobertura']

export default function TelaInicial() {
  const [quadras, setQuadras] = useState([])
  const [cidade, setCidade] = useState('')
  const [filtro, setFiltro] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [logado, setLogado] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setLogado(!!data.user))
    supabase.from('quadras').select('*').order('avaliacao', { ascending: false }).then(({ data, error }) => {
      if (error) setErro('Não foi possível carregar as arenas.')
      else setQuadras(data)
      setCarregando(false)
    })
  }, [])

  const lista = quadras.filter((q) =>
    q.cidade.toLowerCase().includes(cidade.toLowerCase()) && (!filtro || (q.modalidades || []).includes(filtro)))

  return (
    <div className="tela">
      <header className="header">
        <div className="header-linha">
          <h1 className="logo">⚽ PlaySports</h1>
          {logado
            ? <Link to="/perfil" className="link-claro">Meu perfil</Link>
            : <Link to="/login" className="link-claro">Entrar</Link>}
        </div>
        <label className="busca"><Pin /><input placeholder="Informe sua cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} /></label>
      </header>
      <main className="conteudo">
        <div className="banner"><span>AGENDE<br />AGORA<br />SEU HORÁRIO</span></div>
        <div className="pills">{FILTROS.map((f) => <button key={f} className={'pill' + (filtro === f ? ' ativo' : '')} onClick={() => setFiltro(filtro === f ? null : f)}>{f}</button>)}</div>
        <h3>Arenas disponíveis:</h3>
        {carregando && <p className="muted">Carregando...</p>}
        {erro && <p className="erro">{erro}</p>}
        {!carregando && !erro && lista.length === 0 && <p className="muted">Nenhuma arena encontrada.</p>}
        {lista.map((q) => <CardQuadra key={q.id} quadra={q} />)}
      </main>
      <BottomNav />
    </div>
  )
}