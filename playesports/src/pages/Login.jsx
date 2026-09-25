import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)
  const navegar = useNavigate()

  async function handleSubmit(evento) {
    evento.preventDefault()
    setEnviando(true)
    setErro(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    if (error) {
      setErro('E-mail ou senha incorretos.')
      setEnviando(false)
    } else {
      navegar('/')
    }
  }

  return (
    <div style={{ maxWidth: '320px', margin: '40px auto' }}>
      <h1>Jogue na melhor! PlaySports</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
          />
        </div>

        {erro && <p style={{ color: 'red' }}>{erro}</p>}

        <button type="submit" disabled={enviando} style={{ width: '100%', padding: '10px' }}>
          {enviando ? 'Entrando...' : 'Login with email'}
        </button>
      </form>
    </div>
  )
}

export default Login