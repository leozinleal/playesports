import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import PainelMarca from '../components/PainelMarca'
import CamposSenha from '../components/CamposSenha'
import './login.css'

const botaoLink = { textAlign: 'center', textDecoration: 'none', display: 'grid', placeItems: 'center' }

// Abre pelo link do e-mail de recuperação: o Supabase já entrega uma sessão temporária
export default function RedefinirSenha() {
  const [pronto, setPronto] = useState(null)   // null = verificando, true = link ok, false = link inválido
  const [senha, setSenha] = useState('')
  const [confirma, setConfirma] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [feito, setFeito] = useState(false)

  useEffect(() => {
    let vivo = true
    const { data: sub } = supabase.auth.onAuthStateChange((evento) => {
      if (evento === 'PASSWORD_RECOVERY' && vivo) setPronto(true)
    })
    supabase.auth.getSession().then(({ data }) => { if (vivo && data.session) setPronto(true) })
    const t = setTimeout(() => { if (vivo) setPronto((p) => (p === null ? false : p)) }, 3000)
    return () => { vivo = false; clearTimeout(t); sub.subscription.unsubscribe() }
  }, [])

  async function salvar(e) {
    e.preventDefault(); setErro('')
    if (senha !== confirma) return setErro('As senhas não conferem.')
    setCarregando(true)
    const { error } = await supabase.auth.updateUser({ password: senha })
    setCarregando(false)
    if (error) {
      return setErro(/different|same/i.test(error.message)
        ? 'A nova senha precisa ser diferente da atual.'
        : 'Não foi possível salvar a senha: ' + error.message)
    }
    await supabase.auth.signOut()
    setFeito(true)
  }

  const marca = (
    <PainelMarca
      titulo="Nova senha"
      slogan="Escolha uma senha nova para voltar a usar a sua conta."
      itens={['Mínimo de 6 caracteres', 'Use uma senha que só você saiba', 'Depois é só entrar de novo']}
    />
  )

  // formulário: o próprio <form> é o .auth-form (igual às outras telas)
  if (pronto && !feito) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          {marca}
          <form className="auth-form" onSubmit={salvar}>
            <h2>Criar nova senha</h2>
            <CamposSenha senha={senha} onSenha={(e) => setSenha(e.target.value)} confirma={confirma} onConfirma={(e) => setConfirma(e.target.value)} rotulo="Nova senha (mín. 6 caracteres)" rotuloConfirma="Confirmar nova senha" />
            {erro && <p className="auth-erro" role="alert">{erro}</p>}
            <button className="auth-botao" disabled={carregando}>{carregando ? 'Salvando...' : 'Salvar nova senha'}</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {marca}
        <div className="auth-form">
          {feito ? (
            <>
              <h2>Senha alterada!</h2>
              <p>Pronto, sua senha foi atualizada. Entre com a senha nova.</p>
              <Link to="/login" className="auth-botao" style={botaoLink}>Ir para o login</Link>
            </>
          ) : pronto === null ? (
            <p>Verificando o link...</p>
          ) : (
            <>
              <h2>Link inválido ou expirado</h2>
              <p>Esse link não funciona mais. Peça um novo link de recuperação.</p>
              <Link to="/recuperar-senha" className="auth-botao" style={botaoLink}>Pedir novo link</Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}