import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

function App() {
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
        <div key={quadra.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
          <h3>{quadra.nome}</h3>
          <p>{quadra.cidade} — R$ {quadra.preco_hora}/hora</p>
          <p>⭐ {quadra.avaliacao}</p>
        </div>
      ))}
    </div>
  )
}

export default App