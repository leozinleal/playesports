import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

function Cadastro() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)
  const navegar = useNavigate()

  async function handleSubmit(evento) {
    evento.preventDefault()
    setEnviando(true)
    setErro(null)

    // 1. Cria o usuário no sistema de autenticação do Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
    })

    if (error) {
      setErro('Não foi possível criar a conta: ' + error.message)
      setEnviando(false)
      return
    }

    // 2. Cria a linha correspondente na nossa tabela "usuarios"
    const { error: erroPerfil } = await supabase.from('usuarios').insert({
      id: data.user.id,
      nome,
      email,
    })

    if (erroPerfil) {
      setErro('Conta criada, mas houve um erro ao salvar o perfil: ' + erroPerfil.message)
      setEnviando(false)
      return
    }

    navegar('/login')
  }

  return (
    <div style={{ maxWidth: '320px', margin: '40px auto' }}>
      <h1>Criar conta — PlaySports</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
          />
        </div>
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
            placeholder="Senha (mínimo 6 caracteres)"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            minLength={6}
            style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
          />
        </div>

        {erro && <p style={{ color: 'red' }}>{erro}</p>}

        <button type="submit" disabled={enviando} style={{ width: '100%', padding: '10px' }}>
          {enviando ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>
    </div>
  )
}

export default Cadastro