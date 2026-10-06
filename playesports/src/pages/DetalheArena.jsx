import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import { Pin, Clock, Phone } from '../components/Icons'
import { brl, hhmm, inicialDe } from '../utils'

export default function DetalheArena() {
  const { id } = useParams()
  const [q, setQ] = useState(null)
  const [erro, setErro] = useState('')
  useEffect(() => {
    supabase.from('quadras').select('*').eq('id', id).single().then(({ data, error }) => error ? setErro('Arena não encontrada.') : setQ(data))
  }, [id])

  return (
    <div className="tela">
      <Header titulo="Detalhes" />
      {erro && <p className="erro conteudo">{erro}</p>}
      {q && (
        <main className="conteudo com-barra">
          {q.foto_url ? <img className="foto" src={q.foto_url} alt={q.nome} /> : <div className="foto foto-vazia">{inicialDe(q.nome)}</div>}
          <div className="titulo-linha"><h2>{q.nome}</h2><span className="nota">★ {Number(q.avaliacao).toFixed(1)}</span></div>
          <ul className="infos">
            <li><Pin /> {q.endereco}</li>
            <li><Clock /> {hhmm(q.horario_abertura)} - {hhmm(q.horario_fechamento)}</li>
            {q.telefone && <li><Phone /> {q.telefone}</li>}
            {q.modalidades?.length > 0 && <li>⚽ {q.modalidades.join(' · ')}</li>}
          </ul>
          <h3>Descrição</h3>
          <p className="muted">{q.descricao || 'Sem descrição.'}</p>
          <div className="barra-preco"><div><strong>{brl(q.preco_hora)}</strong><small>por hora</small></div><Link to={`/quadra/${q.id}/reservar`} className="btn-alugar">Alugar</Link></div>
        </main>
      )}
      <BottomNav />
    </div>
  )
}
