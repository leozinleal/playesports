import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import CardQuadra from '../components/CardQuadra'

function TelaInicial() {
  const [quadras, setQuadras] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregarQuadras() {
      const { data, error } = await supabase
        .from('quadras')
        .select('*')

      if (error) {
        console.error('Erro ao buscar quadras:', error)
      } else {
        setQuadras(data)
      }

      setCarregando(false)
    }

    carregarQuadras()
  }, [])

  if (carregando) {
    return <p>Carregando quadras...</p>
  }

  return (
    <div>
      <h1>PlaySports</h1>
      <h2>Arenas disponíveis:</h2>
      {quadras.map((quadra) => (
        <CardQuadra key={quadra.id} quadra={quadra} />
      ))}
    </div>
  )
}

export default TelaInicial