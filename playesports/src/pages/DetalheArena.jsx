import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import GaleriaQuadra from '../components/GaleriaQuadra'
import { Pin, Clock, Phone } from '../components/Icons'
import { brl, hhmm, inicialDe } from '../utils'
import './detalhe.css'

export default function DetalheArena() {
  const { id } = useParams()
  const [q, setQ] = useState(null)
  const [erro, setErro] = useState('')
  const [largo, setLargo] = useState(() => window.innerWidth >= 760)
  const raiz = useRef(null)

  useEffect(() => {
    supabase.from('quadras').select('*').eq('id', id).single().then(({ data, error }) => error || !data.ativa ? setErro('Arena não encontrada.') : setQ(data))
  }, [id])

  // "largo" = a área da tela tem espaço para o mosaico e o cartão de reserva ao lado
  useEffect(() => {
    const el = raiz.current
    if (!el) return
    const obs = new ResizeObserver(([e]) => setLargo(e.contentRect.width >= 700))
    obs.observe(el)
    return () => obs.disconnect()
  }, [q])

  const fotos = q ? (q.fotos?.length ? q.fotos : q.foto_url ? [q.foto_url] : []) : []
  const alugar = q && `/quadra/${q.id}/reservar`

  return (
    <div className="tela">
      <Header titulo="Detalhes" />
      {erro && <p className="erro conteudo">{erro}</p>}
      {q && (
        <main className="conteudo com-barra">
          <div className="det" ref={raiz}>
            {fotos.length > 0
              ? <GaleriaQuadra fotos={fotos} nome={q.nome} largo={largo} />
              : <div className="foto foto-vazia">{inicialDe(q.nome)}</div>}

            <div className={largo ? 'det-cols largo' : 'det-cols'}>
              <div>
                <div className="det-titulo">
                  <h2>{q.nome}</h2>
                  {Number(q.avaliacao) > 0 ? <span className="nota">★ {Number(q.avaliacao).toFixed(1)}</span> : <span className="det-novo">Novo</span>}
                </div>
                <ul className="infos">
                  <li><Pin /> {q.endereco}{q.cidade ? ` · ${q.cidade}` : ''}</li>
                  <li><Clock /> Aberto das {hhmm(q.horario_abertura)} às {hhmm(q.horario_fechamento)}</li>
                  {q.telefone && <li><Phone /> {q.telefone}</li>}
                  {q.modalidades?.length > 0 && <li>⚽ {q.modalidades.join(' · ')}</li>}
                </ul>
                <h3>Descrição</h3>
                <p className="muted">{q.descricao || 'Sem descrição.'}</p>
              </div>

              {largo && (
                <aside className="det-reserva">
                  <div className="det-preco">{brl(q.preco_hora)} <small>/ hora</small></div>
                  <ul>
                    <li><Clock /> Escolha dia e horário na próxima tela</li>
                    <li><Phone /> O dono confirma e você recebe o aviso no WhatsApp</li>
                  </ul>
                  <Link to={alugar} className="det-alugar">Alugar</Link>
                </aside>
              )}
            </div>
          </div>

          {!largo && (
            <div className="barra-preco"><div><strong>{brl(q.preco_hora)}</strong><small>por hora</small></div><Link to={alugar} className="btn-alugar">Alugar</Link></div>
          )}
        </main>
      )}
      <BottomNav />
    </div>
  )
}