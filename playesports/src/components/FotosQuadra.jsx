import { useRef, useState } from 'react'
import { supabase } from '../supabaseClient'
import { reduzirImagem } from '../imagem'
import './fotos.css'

const MAX = 5

// Envio de até 5 fotos. A primeira é a capa. Recebe a lista de links e devolve a lista nova.
export default function FotosQuadra({ fotos, onChange, onRemover, userId }) {
  const entrada = useRef(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  async function escolher(e) {
    const arquivos = Array.from(e.target.files || []).slice(0, MAX - fotos.length)
    e.target.value = ''                       // permite escolher a mesma foto de novo
    if (!arquivos.length) return
    setErro(''); setEnviando(true)
    let lista = [...fotos]
    for (const arq of arquivos) {
      try {
        const blob = await reduzirImagem(arq)
        const caminho = `${userId}/${crypto.randomUUID()}.jpg`
        const { error } = await supabase.storage.from('quadras').upload(caminho, blob, { contentType: 'image/jpeg', cacheControl: '31536000' })
        if (error) throw error
        lista = [...lista, supabase.storage.from('quadras').getPublicUrl(caminho).data.publicUrl]
        onChange(lista)
      } catch (err) {
        setErro('Não foi possível enviar uma das fotos. Use JPG, PNG ou WebP de até 5 MB.')
      }
    }
    setEnviando(false)
  }

  function remover(i) {
    onRemover?.(fotos[i])
    onChange(fotos.filter((_, k) => k !== i))
  }

  function tornarCapa(i) {
    onChange([fotos[i], ...fotos.filter((_, k) => k !== i)])
  }

  return (
    <fieldset className="fq">
      <legend>Fotos da quadra ({fotos.length}/{MAX})</legend>
      <div className="fq-grade">
        {fotos.map((url, i) => (
          <div className="fq-item" key={url}>
            <img src={url} alt={`Foto ${i + 1}`} />
            {i === 0 && <span className="fq-capa">Capa</span>}
            <button type="button" className="fq-x" onClick={() => remover(i)} aria-label="Remover foto">✕</button>
            {i > 0 && <button type="button" className="fq-tornar" onClick={() => tornarCapa(i)}>Tornar capa</button>}
          </div>
        ))}
        {fotos.length < MAX && (
          <button type="button" className="fq-add" disabled={enviando} onClick={() => entrada.current.click()}>
            {enviando ? 'Enviando...' : <><span>＋</span>Adicionar</>}
          </button>
        )}
      </div>
      <input ref={entrada} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={escolher} />
      <small className="fq-dica">A primeira foto é a capa. Até 5 fotos, de até 5 MB cada.</small>
      {erro && <p className="auth-erro" role="alert">{erro}</p>}
    </fieldset>
  )
}