import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function gerarCodigo() {
  const letras = Math.random().toString(36).substring(2, 6).toUpperCase()
  const numeros = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${letras}-${numeros}`
}

function Reserva() {
  const { id } = useParams()
  const navegar = useNavigate()

  const [quadra, setQuadra] = useState(null)
  const [data, setData] = useState('')
  const [horario, setHorario] = useState('')
  const [colete, setColete] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    async function carregarQuadra() {
      const { data: quadraData } = await supabase
        .from('quadras')
        .select('*')
        .eq('id', id)
        .single()
      setQuadra(quadraData)
    }
    carregarQuadra()
  }, [id])

  if (!quadra) return <p>Carregando...</p>

  const valorTotal = Number(quadra.preco_hora) + (colete ? 10 : 0)

  async function handleSubmit(evento) {
    evento.preventDefault()
    setEnviando(true)
    setErro(null)

    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      navegar('/login')
      return
    }

    const [horaInicio] = horario.split('-')
    const horaFim = String(Number(horaInicio.split(':')[0]) + 1).padStart(2, '0') + ':00'

    const { error } = await supabase.from('reservas').insert({
      codigo: gerarCodigo(),
      quadra_id: quadra.id,
      usuario_id: userData.user.id,
      data,
      horario_inicio: horario,
      horario_fim: horaFim,
      colete,
      valor_total: valorTotal,
      status: 'agendado',
    })

    if (error) {
      if (error.code === '23505') {
        setErro('Esse horário acabou de ser reservado por outra pessoa. Escolha outro horário.')
      } else {
        setErro('Não foi possível concluir a reserva: ' + error.message)
      }
      setEnviando(false)
      return
    }

    navegar('/agenda')
  }

  return (
    <div style={{ maxWidth: '400px', margin: '20px auto' }}>
      <h1>Reservar — {quadra.nome}</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Data</label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
          />
        </div>

        <div>
          <label>Horário</label>
          <input
            type="time"
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label>
            <input
              type="checkbox"
              checked={colete}
              onChange={(e) => setColete(e.target.checked)}
            />
            {' '}Colete (+R$10,00)
          </label>
        </div>

        <p><strong>Total: R$ {valorTotal.toFixed(2)}</strong></p>

        {erro && <p style={{ color: 'red' }}>{erro}</p>}

        <button type="submit" disabled={enviando} style={{ width: '100%', padding: '10px' }}>
          {enviando ? 'Reservando...' : 'Confirmar Reserva'}
        </button>
      </form>
    </div>
  )
}

export default Reserva