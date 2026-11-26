import { useState } from 'react'
import '../pages/login.css'

const ico = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }
const IconLock = () => <svg {...ico}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
const IconEye = ({ off }) => (
  <svg {...ico}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />{off && <path d="M4 4l16 16" />}</svg>
)

function Campo({ valor, onChange, placeholder }) {
  const [ver, setVer] = useState(false)
  return (
    <label className="auth-campo">
      <IconLock />
      <input type={ver ? 'text' : 'password'} placeholder={placeholder} minLength={6} value={valor} onChange={onChange} autoComplete="new-password" required />
      <button type="button" className="auth-olho" onClick={() => setVer(!ver)} aria-label={ver ? 'Ocultar senha' : 'Mostrar senha'}><IconEye off={ver} /></button>
    </label>
  )
}

// Senha + confirmar senha, cada uma com o olhinho
export default function CamposSenha({ senha, onSenha, confirma, onConfirma }) {
  return (
    <>
      <Campo valor={senha} onChange={onSenha} placeholder="Senha (mín. 6 caracteres)" />
      <Campo valor={confirma} onChange={onConfirma} placeholder="Confirmar senha" />
    </>
  )
}