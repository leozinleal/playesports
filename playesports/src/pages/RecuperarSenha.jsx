import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import PainelMarca from '../components/PainelMarca'
import './login.css'

const ico = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }
const IconMail = () => <svg {...ico}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>

export default function RecuperarSenha() {
  const [email, setEmail] = useState('')
  const [erro, setErro] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [carregando, setCarregando] = useState(false)

  async function enviar(e) {
    e.preventDefault(); setErro(''); setCarregando(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + '/redefinir-senha',
    })
    setCarregando(false)
    if (error && /rate limit|too many|seconds/i.test(error.message)) {
      return setErro('Muitas tentativas. Aguarde alguns minutos e tente de novo.')
    }
    // mesma resposta exista ou não o cadastro (não revela quem tem conta)
    setEnviado(true)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <PainelMarca
          titulo="Recuperar senha"
          slogan="Esqueceu a senha? Sem problema, a gente te ajuda a criar uma nova."
          itens={['Informe o e-mail da sua conta', 'Abra o link que enviaremos', 'Escolha uma senha nova']}
        />
        {enviado ? (
          <div className="auth-form">
            <h2>Verifique seu e-mail</h2>
            <p>Se existir uma conta com <strong>{email}</strong>, enviamos um link para criar uma senha nova.</p>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Não chegou? Olhe a pasta de spam ou lixo eletrônico.</p>
            <Link to="/login" className="auth-botao" style={{ textAlign: 'center', textDecoration: 'none', display: 'grid', placeItems: 'center' }}>Voltar ao login</Link>
          </div>
        ) : (
          <form className="auth-form" onSubmit={enviar}>
            <h2>Esqueci minha senha</h2>
            <p style={{ fontSize: 14, color: 'var(--muted)' }}>Digite o e-mail do seu cadastro e enviaremos um link para você criar uma nova senha.</p>
            <label className="auth-campo"><IconMail /><input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></label>
            {erro && <p className="auth-erro" role="alert">{erro}</p>}
            <button className="auth-botao" disabled={carregando}>{carregando ? 'Enviando...' : 'Enviar link'}</button>
            <Link to="/login" className="auth-voltar">← Voltar ao login</Link>
          </form>
        )}
      </div>
    </div>
  )
}