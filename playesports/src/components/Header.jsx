import { useNavigate } from 'react-router-dom'
import { Back } from './Icons'
export default function Header({ titulo, voltar = true, children }) {
  const nav = useNavigate()
  return (
    <header className="header">
      <div className="header-linha">
        {voltar ? <button className="btn-icone" onClick={() => nav(-1)} aria-label="Voltar"><Back /></button> : <span style={{ width: 32 }} />}
        <h1>{titulo}</h1><span style={{ width: 32 }} />
      </div>
      {children}
    </header>
  )
}
