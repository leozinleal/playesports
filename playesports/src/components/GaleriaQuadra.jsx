import { useEffect, useRef, useState } from 'react'
import './galeria.css'

// Disposição do mosaico (computador) conforme o número de fotos
const MOSAICO = {
  1: ['minmax(0,1fr)', 1],
  2: ['minmax(0,1fr) minmax(0,1fr)', 1],
  3: ['minmax(0,2fr) minmax(0,1fr)', 2],
  4: ['minmax(0,2fr) minmax(0,1fr)', 3],
  5: ['minmax(0,2fr) minmax(0,1fr) minmax(0,1fr)', 2],
}

function Visualizador({ fotos, nome, inicio, onFechar }) {
  const [i, setI] = useState(inicio)
  const n = fotos.length
  const ir = (d) => setI((x) => (x + d + n) % n)

  useEffect(() => {
    const tecla = (e) => {
      if (e.key === 'Escape') onFechar()
      if (e.key === 'ArrowRight') ir(1)
      if (e.key === 'ArrowLeft') ir(-1)
    }
    document.addEventListener('keydown', tecla)
    const antes = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', tecla); document.body.style.overflow = antes }
  }, [])

  return (
    <div className="vis" onClick={onFechar} role="dialog" aria-label={`Fotos de ${nome}`}>
      <button className="vis-x" onClick={onFechar} aria-label="Fechar">✕</button>
      <img src={fotos[i]} alt={`${nome} - foto ${i + 1}`} onClick={(e) => e.stopPropagation()} />
      {n > 1 && (
        <>
          <button className="vis-seta esq" onClick={(e) => { e.stopPropagation(); ir(-1) }} aria-label="Foto anterior">‹</button>
          <button className="vis-seta dir" onClick={(e) => { e.stopPropagation(); ir(1) }} aria-label="Próxima foto">›</button>
          <span className="vis-cont">{i + 1} / {n}</span>
        </>
      )}
    </div>
  )
}

// largo = true no computador (mosaico); false no celular (carrossel de deslizar)
export default function GaleriaQuadra({ fotos, nome, largo }) {
  const [aberta, setAberta] = useState(null)
  const [atual, setAtual] = useState(0)
  const faixa = useRef(null)
  const n = fotos.length
  const [colunas, linhas] = MOSAICO[n] || MOSAICO[5]

  function aoRolar() {
    const el = faixa.current
    if (el) setAtual(Math.round(el.scrollLeft / el.clientWidth))
  }

  return (
    <>
      {largo ? (
        <div className="gal-mosaico" style={{ gridTemplateColumns: colunas, gridTemplateRows: `repeat(${linhas}, 1fr)` }}>
          {fotos.slice(0, 5).map((url, i) => (
            <img key={url} src={url} alt={`${nome} - foto ${i + 1}`} onClick={() => setAberta(i)}
              style={i === 0 && linhas > 1 ? { gridRow: `1 / span ${linhas}` } : undefined} />
          ))}
          {n > 1 && <button className="gal-ver" onClick={() => setAberta(0)}>▦ Ver as {n} fotos</button>}
        </div>
      ) : (
        <div className="gal-mobile">
          <div className="gal-faixa" ref={faixa} onScroll={aoRolar}>
            {fotos.map((url, i) => <img key={url} src={url} alt={`${nome} - foto ${i + 1}`} onClick={() => setAberta(i)} />)}
          </div>
          {n > 1 && <span className="gal-cont">{atual + 1} / {n}</span>}
        </div>
      )}
      {aberta !== null && <Visualizador fotos={fotos} nome={nome} inicio={aberta} onFechar={() => setAberta(null)} />}
    </>
  )
}