import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import { inicialDe } from '../utils'

export default function Perfil() {
  const nav = useNavigate()
  const [u, setU] = useState(null)
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return nav('/login')
      const { data: p } = await supabase.from('usuarios').select('*').eq('id', data.user.id).single()
      setU(p || { nome: data.user.email, email: data.user.email })
    })
  }, [])
  async function sair() { await supabase.auth.signOut(); nav('/login') }
  return (
    <div className="tela">
      <Header titulo="Perfil" voltar={false} />
      <main className="conteudo">
        {u && <div className="card-branco centro">
          <div className="avatar grande">{inicialDe(u.nome)}</div>
          <h2>{u.nome}</h2><p className="muted">{u.email}</p>{u.telefone && <p className="muted">{u.telefone}</p>}
          <button className="btn btn-verde" onClick={sair}>Sair</button>
        </div>}
      </main>
      <BottomNav />
    </div>
  )
}
