import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import PainelMarca from '../components/PainelMarca'
import './login.css'

const ico = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }
const IconMail = () => <svg {...ico}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
const IconLock = () => <svg {...ico}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
const IconEye = ({ off }) => (
  <svg {...ico}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />{off && <path d="M4 4l16 16" />}</svg>
)

export default function Login() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const areaDono = params.get('area') === 'dono' // /login?area=dono = entrada do parceiro
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [verSenha, setVerSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function entrar(e) {
    e.preventDefault(); setErro(''); setCarregando(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) { setCarregando(false); return setErro('E-mail ou senha incorretos.') }

    // descobre se a conta é de cliente ou de dono de quadra
    const { data: perfil } = await supabase.from('usuarios').select('tipo').eq('id', data.user.id).single()
    setCarregando(false)
    const ehDono = perfil?.tipo === 'dono'

    if (areaDono && !ehDono) {
      await supabase.auth.signOut()
      return setErro('Esta conta não é de parceiro. Entre pelo login de cliente ou cadastre sua quadra.')
    }
    nav(ehDono ? '/dono' : '/')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {areaDono ? (
          <PainelMarca
            titulo="PlayEsports Parceiros"
            slogan="Gerencie suas quadras e receba reservas online."
            itens={['Cadastre suas quadras e horários', 'Receba reservas pelo aplicativo', 'Acompanhe tudo em um só lugar']}
          />
        ) : (
          <PainelMarca
            titulo="PlayEsports"
            slogan="Reserve sua quadra de futebol de forma rápida e simples."
            itens={['Encontre arenas na sua cidade', 'Veja os horários livres em tempo real', 'Reserve e acompanhe na sua agenda']}
          />
        )}

        <form className="auth-form" onSubmit={entrar}>
          <h2>{areaDono ? 'Área do parceiro' : 'Entrar'}</h2>
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

          {areaDono ? (
            <>
              <p className="auth-rodape">Ainda não é parceiro? <Link to="/dono/cadastro">Cadastre sua quadra</Link></p>
              <Link to="/login" className="auth-voltar">← Sou cliente: voltar ao login normal</Link>
            </>
          ) : (
            <>
              <p className="auth-rodape">Novo por aqui? <Link to="/cadastro">Crie uma conta</Link></p>
              <div className="auth-parceiro">
                <strong>É dono de quadra?</strong>
                <span>Já tem cadastro de parceiro? <Link to="/login?area=dono">Clique aqui</Link></span>
                <span>Quer ser nosso parceiro? <Link to="/dono/cadastro">Clique aqui</Link></span>
              </div>
              <Link to="/" className="auth-voltar">← Voltar para o início</Link>
            </>
          )}
        </form>
      </div>
    </div>
  )
}