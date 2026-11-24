import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import PainelMarca from '../components/PainelMarca'
import './login.css'

const ico = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }
const IconUser = () => <svg {...ico}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>
const IconMail = () => <svg {...ico}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
const IconPhone = () => <svg {...ico}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg>
const IconLock = () => <svg {...ico}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>

export default function Cadastro() {
  const nav = useNavigate()
  const [f, setF] = useState({ nome: '', email: '', telefone: '', senha: '' })
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  async function cadastrar(e) {
    e.preventDefault(); setErro(''); setCarregando(true)
    const { data, error } = await supabase.auth.signUp({ email: f.email, password: f.senha })
    if (error) {
      setCarregando(false)
      return setErro(/already|registered/i.test(error.message)
        ? 'Este e-mail já tem cadastro. Use "Entrar".'
        : 'Não foi possível criar a conta: ' + error.message)
    }
    const { error: e2 } = await supabase.from('usuarios').insert({ id: data.user.id, nome: f.nome, email: f.email, telefone: f.telefone || null })
    setCarregando(false)
    if (e2) return setErro('Conta criada, mas falhou ao salvar o perfil: ' + e2.message)
    nav('/')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <PainelMarca
          titulo="Crie sua conta"
          slogan="Encontre quadras perto de você e reserve em poucos toques."
          itens={['Quadras de Capão da Canoa e região', 'Reserva rápida, direto pelo celular', 'Confirmação por WhatsApp']}
        />
        <form className="auth-form" onSubmit={cadastrar}>
          <h2>Criar conta</h2>
          <label className="auth-campo"><IconUser /><input placeholder="Nome completo" value={f.nome} onChange={set('nome')} required /></label>
          <label className="auth-campo"><IconMail /><input type="email" placeholder="E-mail" value={f.email} onChange={set('email')} autoComplete="email" required /></label>
          <label className="auth-campo"><IconPhone /><input placeholder="Telefone (WhatsApp)" value={f.telefone} onChange={set('telefone')} /></label>
          <label className="auth-campo"><IconLock /><input type="password" placeholder="Senha (mín. 6 caracteres)" minLength={6} value={f.senha} onChange={set('senha')} autoComplete="new-password" required /></label>
          {erro && <p className="auth-erro" role="alert">{erro}</p>}
          <button className="auth-botao" disabled={carregando}>{carregando ? 'Cadastrando...' : 'Cadastrar'}</button>
          <p className="auth-rodape">Já tem conta? <Link to="/login">Entrar</Link></p>
          <Link to="/" className="auth-voltar">← Voltar ao início</Link>
        </form>
      </div>
    </div>
  )
}