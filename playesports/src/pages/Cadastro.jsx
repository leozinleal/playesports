import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Header from '../components/Header'

export default function Cadastro() {
  const nav = useNavigate()
  const [f, setF] = useState({ nome: '', email: '', telefone: '', senha: '' })
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  async function cadastrar(e) {
    e.preventDefault(); setErro(''); setCarregando(true)
    const { data, error } = await supabase.auth.signUp({ email: f.email, password: f.senha })
    if (error) { setCarregando(false); return setErro('Não foi possível criar a conta: ' + error.message) }
    const { error: e2 } = await supabase.from('usuarios').insert({ id: data.user.id, nome: f.nome, email: f.email, telefone: f.telefone || null })
    setCarregando(false)
    if (e2) return setErro('Conta criada, mas falhou ao salvar o perfil: ' + e2.message)
    nav('/')
  }
  return (
    <div className="tela">
      <Header titulo="Criar conta" />
      <form className="conteudo form" onSubmit={cadastrar}>
        <input className="campo" placeholder="Nome completo" value={f.nome} onChange={set('nome')} required />
        <input className="campo" type="email" placeholder="E-mail" value={f.email} onChange={set('email')} required />
        <input className="campo" placeholder="Telefone (WhatsApp)" value={f.telefone} onChange={set('telefone')} />
        <input className="campo" type="password" placeholder="Senha (mín. 6 caracteres)" minLength={6} value={f.senha} onChange={set('senha')} required />
        {erro && <p className="erro">{erro}</p>}
        <button className="btn btn-verde" disabled={carregando}>{carregando ? 'Criando...' : 'Cadastrar'}</button>
        <p className="centro">Já tem conta? <Link to="/login">Entrar</Link></p>
      </form>
    </div>
  )
}
