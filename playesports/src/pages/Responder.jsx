import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { brl, hhmm, dataBR } from '../utils'
import './dono.css'

const MENSAGENS = {
  ok_agendado: ['✅', 'Reserva confirmada!', 'O cliente já pode ver a confirmação no app.'],
  ok_cancelado: ['❌', 'Reserva recusada', 'O horário voltou a ficar livre para outros clientes.'],
  ja_respondida: ['ℹ️', 'Esta reserva já foi respondida', 'Não é preciso fazer mais nada.'],
  expirada: ['⌛', 'O horário desta reserva já passou', 'Não é mais possível responder.'],
  invalida: ['⚠️', 'Link inválido', 'Confira se o link foi copiado por inteiro.'],
}

export default function Responder() {
  const { token } = useParams()
  const [reserva, setReserva] = useState(null)
  const [resultado, setResultado] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    async function carregar() {
      const { data, error } = await supabase.rpc('ver_reserva_por_token', { p_token: token })
      if (error || !data || data.length === 0) setResultado('invalida')
      else {
        const r = data[0]
        setReserva(r)
        if (r.status !== 'pendente') setResultado('ja_respondida')
        else if (r.expirada) setResultado('expirada')
      }
      setCarregando(false)
    }
    carregar()
  }, [token])

  async function responder(acao) {
    setErro('')
    setEnviando(true)
    const { data, error } = await supabase.rpc('responder_reserva', { p_token: token, p_acao: acao })
    setEnviando(false)
    if (error) return setErro('Não foi possível responder. Tente de novo.')
    setResultado(data)
  }

  if (carregando) return <p style={{ padding: 20 }}>Carregando...</p>

  const msg = MENSAGENS[resultado]

  return (
    <main className="resp-tela">
      <div className="resp-cartao">
        <p className="resp-marca">PlayEsports</p>

        {reserva && (
          <div className="resp-dados">
            <h1>Reserva {reserva.codigo}</h1>
            <p><strong>{reserva.quadra}</strong></p>
            <p>📅 {dataBR(reserva.data)} · {hhmm(reserva.horario_inicio)} às {hhmm(reserva.horario_fim)}</p>
            <p>👤 {reserva.cliente}</p>
            <p>💰 {brl(reserva.valor_total)}{reserva.colete ? ' (com colete)' : ''}</p>
          </div>
        )}

        {msg ? (
          <div className="resp-resultado">
            <span>{msg[0]}</span>
            <strong>{msg[1]}</strong>
            <p>{msg[2]}</p>
            {resultado === 'ja_respondida' && reserva && (
              <p>Situação atual: <strong>{reserva.status === 'agendado' ? 'confirmada' : reserva.status === 'cancelado' ? 'cancelada' : reserva.status}</strong></p>
            )}
          </div>
        ) : (
          <>
            <p className="resp-pergunta">Você aceita esta reserva?</p>
            <div className="resp-botoes">
              <button className="aceitar" disabled={enviando} onClick={() => responder('agendado')}>✅ Aceitar</button>
              <button className="recusar" disabled={enviando} onClick={() => responder('cancelado')}>❌ Recusar</button>
            </div>
            {erro && <p className="resp-erro">{erro}</p>}
          </>
        )}
      </div>
    </main>
  )
}