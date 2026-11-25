import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import PainelMarca from './PainelMarca'
import '../pages/login.css'

// Tela mostrada depois do cadastro, enquanto o e-mail não foi confirmado
export default function ConfirmeEmail({ email, tipo }) {
  const [msg, setMsg] = useState('')
  const [espera, setEspera] = useState(60)

  useEffect(() => {
    if (espera <= 0) return
    const t = setTimeout(() => setEspera((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [espera])

  async function reenviar() {
    setMsg(''); setEspera(60)
    const { error } = await supabase.auth.resend({
      type: 'signup', email,
      options: { emailRedirectTo: window.location.origin + (tipo === 'dono' ? '/dono' : '/') },
    })
    setMsg(error ? 'Não foi possível reenviar agora. Tente de novo em alguns minutos.' : 'E-mail reenviado!')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <PainelMarca
          titulo="Quase lá!"
          slogan="Só falta confirmar o seu e-mail para ativar a conta."
          itens={['Abra o e-mail que enviamos', 'Clique no link de confirmação', 'Pronto, é só entrar']}
        />
        <div className="auth-form">
          <h2>Confirme seu e-mail</h2>
          <p>Enviamos um link para <strong>{email}</strong>. Clique nele para ativar sua conta.</p>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Não chegou? Olhe a pasta de spam ou lixo eletrônico.</p>
          {msg && <p role="status" style={{ color: 'var(--verde)', fontWeight: 600 }}>{msg}</p>}
          <button type="button" className="auth-botao" onClick={reenviar} disabled={espera > 0}>
            {espera > 0 ? `Reenviar e-mail (${espera}s)` : 'Reenviar e-mail'}
          </button>
          <Link to={tipo === 'dono' ? '/login?area=dono' : '/login'} className="auth-voltar">Já confirmei, ir para o login</Link>
        </div>
      </div>
    </div>
  )
}