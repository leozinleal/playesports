import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Ball, Mail } from '../components/Icons'

export default function Login() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [abrir, setAbrir] = useState(false)
  const [carregando, setCarregando] = useState(false)

  async function entrar(e) {
    e.preventDefault(); setErro(''); setCarregando(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    setCarregando(false)
    if (error) return setErro('E-mail ou senha incorretos.')
    nav('/')
  }
  return (
    <div className="tela login">
      <div className="login-topo"><Ball size={150} /><h2>Jogue na melhor!<br />PlaySports</h2></div>
      {!abrir ? (
        <div className="login-botoes">
          <button className="btn btn-verde" onClick={() => setAbrir(true)}><Mail /> Login with email</button>
          <button className="btn btn-azul" disabled title="Em breve">Login with Facebook</button>
          <button className="btn btn-borda" disabled title="Em breve">Login with Google</button>
          <p className="centro">Ainda não tem conta? <Link to="/cadastro">Cadastre-se</Link></p>
        </div>
      ) : (
        <form className="login-botoes" onSubmit={entrar}>
          <input className="campo" type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="campo" type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
          {erro && <p className="erro">{erro}</p>}
          <button className="btn btn-verde" disabled={carregando}>{carregando ? 'Entrando...' : 'Entrar'}</button>
          <p className="centro"><Link to="/cadastro">Criar conta</Link> · <a href="#" onClick={(e) => { e.preventDefault(); setAbrir(false) }}>Voltar</a></p>
        </form>
      )}
    </div>
  )
}
