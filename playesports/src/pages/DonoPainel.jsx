import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Header from '../components/Header'
import CardQuadra from '../components/CardQuadra'
import './dono.css'

export default function DonoPainel() {
  const nav = useNavigate()
  const [perfil, setPerfil] = useState(null)
  const [quadras, setQuadras] = useState([])

  useEffect(() => {
    async function carregar() {
      const { data: u } = await supabase.auth.getUser()
      if (!u.user) return nav('/login?area=dono')
      const { data: p } = await supabase.from('usuarios').select('*').eq('id', u.user.id).single()
      if (p?.tipo !== 'dono') return nav('/')          // só parceiros entram aqui
      setPerfil(p)
      const { data: q } = await supabase.from('quadras').select('*').eq('dono_id', u.user.id)
      setQuadras(q || [])
    }
    carregar()
  }, [])

  async function sair() { await supabase.auth.signOut(); nav('/login') }

  return (
    <div className="tela">
      <Header titulo="Painel do parceiro" voltar={false} />
      <main className="conteudo">
        {perfil && (
          <div className="card-branco">
            <h2>Olá, {perfil.nome.split(' ')[0]}!</h2>
            <p className="muted">Bem-vindo à área do parceiro do PlayEsports.</p>
          </div>
        )}
        <Link to="/dono/quadra/nova" className="dono-novo">+ Cadastrar nova quadra</Link>
        <Link to="/dono/reservas" className="dono-ver">Ver reservas recebidas</Link>
        <h3>Minhas quadras</h3>
        {perfil && quadras.length === 0 && (
          <p className="muted">Você ainda não tem quadras cadastradas. Use o botão acima para cadastrar a primeira.</p>
        )}
        {quadras.map((q) => <CardQuadra key={q.id} quadra={q} />)}
        {perfil && <button className="btn btn-verde pequeno" onClick={sair}>Sair</button>}
      </main>
    </div>
  )
}