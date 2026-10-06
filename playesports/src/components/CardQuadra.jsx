import { Link } from 'react-router-dom'
import { hhmm, inicialDe } from '../utils'
export default function CardQuadra({ quadra }) {
  return (
    <Link to={`/quadra/${quadra.id}`} className="card-quadra">
      {quadra.foto_url ? <img className="avatar" src={quadra.foto_url} alt="" /> : <div className="avatar">{inicialDe(quadra.nome)}</div>}
      <div>
        <strong>{quadra.nome}</strong>
        <div className="nota">★ {Number(quadra.avaliacao).toFixed(1)} · {quadra.cidade}</div>
        <div className="mini">{hhmm(quadra.horario_abertura)} - {hhmm(quadra.horario_fechamento)}</div>
      </div>
    </Link>
  )
}
