import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import logo from '../assets/logo.png'
import './login.css'

const ico = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }
const IconMail = () => <svg {...ico}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
const IconLock = () => <svg {...ico}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
const IconEye = ({ off }) => (
  <svg {...ico}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />{off && <path d="M4 4l16 16" />}</svg>
)

// Decoração do painel verde: campo de futebol visto de cima (listras, linhas e bola)
function Decoracao() {
  const linha = { fill: 'none', stroke: '#fff', strokeOpacity: 0.24, strokeWidth: 1.6 }
  return (
    <svg className="auth-deco" viewBox="0 0 400 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="vinheta" cx="50%" cy="50%" r="75%">
          <stop offset="55%" stopColor="#0f3a24" stopOpacity="0" />
          <stop offset="100%" stopColor="#0f3a24" stopOpacity=".45" />
        </radialGradient>
      </defs>
      {/* listras do gramado */}
      {[0, 2, 4, 6, 8].map((i) => <rect key={i} x="0" y={i * 46 + 0} width="400" height="46" fill="#fff" opacity=".07" />)}
      {/* linhas do campo */}
      <g {...linha}>
        <line x1="0" y1="230" x2="400" y2="230" />
        <circle cx="200" cy="230" r="68" />
        <rect x="95" y="-10" width="210" height="100" />
        <rect x="145" y="-10" width="110" height="42" />
        <path d="M160 90 A52 52 0 0 0 240 90" />
        <rect x="95" y="370" width="210" height="100" />
        <rect x="145" y="428" width="110" height="42" />
        <path d="M160 370 A52 52 0 0 1 240 370" />
      </g>
      <circle cx="200" cy="230" r="3.5" fill="#fff" opacity=".5" />
      <rect width="400" height="460" fill="url(#vinheta)" />
      {/* bola no canto */}
      <g transform="translate(338 392)">
        <ellipse cx="2" cy="22" rx="17" ry="4" fill="#000" opacity=".18" />
        <circle r="19" fill="#fff" />
        <path d="M0 -8l8 6-3 9h-10l-3-9z" fill="#1e1e1e" />
        <path d="M0-8v-10M8-2l10-3M5 7l6 8M-5 7l-6 8M-8-2l-10-3" stroke="#1e1e1e" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  )
}

export default function Login() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [verSenha, setVerSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function entrar(e) {
    e.preventDefault(); setErro(''); setCarregando(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    setCarregando(false)
    if (error) return setErro('E-mail ou senha incorretos.')
    nav('/')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <section className="auth-lado">
          <Decoracao />
          <div className="auth-lado-conteudo">
            <div className="auth-logo"><img src={logo} alt="Logo PlayEsports" /></div>
            <h1>PlayEsports</h1>
            <p className="auth-slogan">Reserve sua quadra de futebol de forma rápida e simples.</p>
            <ul className="auth-lista">
              <li>Encontre arenas na sua cidade</li>
              <li>Veja os horários livres em tempo real</li>
              <li>Reserve e acompanhe na sua agenda</li>
            </ul>
          </div>
        </section>

        <form className="auth-form" onSubmit={entrar}>
          <h2>Entrar</h2>
          <label className="auth-campo">
            <IconMail />
            <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </label>
          <label className="auth-campo">
            <IconLock />
            <input type={verSenha ? 'text' : 'password'} placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" required />
            <button type="button" className="auth-olho" onClick={() => setVerSenha(!verSenha)} aria-label={verSenha ? 'Ocultar senha' : 'Mostrar senha'}><IconEye off={verSenha} /></button>
          </label>
          {erro && <p className="auth-erro" role="alert">{erro}</p>}
          <button className="auth-botao" disabled={carregando}>{carregando ? 'Entrando...' : 'Entrar'}</button>
          <p className="auth-rodape">Novo por aqui? <Link to="/cadastro">Crie uma conta</Link></p>
          <Link to="/" className="auth-voltar">← Voltar para o início</Link>
        </form>
      </div>
    </div>
  )
}