import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function DetalheArena() {
  const { id } = useParams()
  const [quadra, setQuadra] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregarQuadra() {
      const { data, error } = await supabase
        .from('quadras')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Erro ao buscar quadra:', error)
      } else {
        setQuadra(data)
      }

      setCarregando(false)
    }

    carregarQuadra()
  }, [id])

  if (carregando) return <p>Carregando...</p>
  if (!quadra) return <p>Quadra não encontrada.</p>

  return (
    <div style={{ maxWidth: '500px', margin: '20px auto' }}>
      <h1>{quadra.nome}</h1>
      <p>⭐ {quadra.avaliacao}</p>
      <p>{quadra.endereco}</p>
      <p>{quadra.horario_abertura} - {quadra.horario_fechamento}</p>
      <p>{quadra.telefone}</p>
      <p>{quadra.modalidades?.join(', ')}</p>

      <h3>Descrição</h3>
      <p>{quadra.descricao}</p>

      <div style={{ border: '1px solid #ccc', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong>R$ {quadra.preco_hora},00</strong>
          <p style={{ margin: 0 }}>por hora</p>
        </div>
        <Link to={`/quadra/${quadra.id}/reservar`}>
          <button style={{ padding: '10px 20px' }}>Alugar</button>
        </Link>
      </div>
    </div>
  )
}

export default DetalheArena