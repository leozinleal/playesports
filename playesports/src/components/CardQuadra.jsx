import { Link } from 'react-router-dom'

function CardQuadra({ quadra }) {
  return (
    <Link to={`/quadra/${quadra.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
        <h3>{quadra.nome}</h3>
        <p>{quadra.cidade} — R$ {quadra.preco_hora}/hora</p>
        <p>⭐ {quadra.avaliacao}</p>
      </div>
    </Link>
  )
}

export default CardQuadra