import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Header from '../components/Header'
import FotosQuadra from '../components/FotosQuadra'
import { caminhoNoBucket } from '../imagem'
import { brl } from '../utils'
import './dono.css'
import './nova-quadra.css'

const MODALIDADES = ['Society', 'Futsal', 'Campo', 'Beach Soccer']

// Serve para CADASTRAR (/dono/quadra/nova) e para EDITAR (/dono/quadra/:id/editar)
export default function DonoQuadraNova() {
  const nav = useNavigate()
  const { id } = useParams()              // só existe na tela de edição
  const editando = Boolean(id)
  const [userId, setUserId] = useState(null)
  const [f, setF] = useState({
    nome: '', cidade: 'Capão da Canoa', endereco: '', telefone: '',
    preco_hora: '', horario_abertura: '08:00', horario_fechamento: '23:00',
    descricao: '', modalidades: [],
  })
  const [fotos, setFotos] = useState([])        // links das fotos (a primeira é a capa)
  const [removidas, setRemovidas] = useState([]) // fotos tiradas; só apagadas do armazenamento ao salvar
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [largo, setLargo] = useState(() => window.innerWidth >= 760)
  const raiz = useRef(null)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  useEffect(() => {
    async function iniciar() {
      const { data } = await supabase.auth.getUser()
      if (!data.user) return nav('/login?area=dono')
      setUserId(data.user.id)
      if (!editando) return
      const { data: q } = await supabase.from('quadras').select('*').eq('id', id).single()
      if (!q || q.dono_id !== data.user.id) return nav('/dono')   // só edita quadra própria
      setF({
        nome: q.nome, cidade: q.cidade, endereco: q.endereco, telefone: q.telefone || '',
        preco_hora: String(q.preco_hora), horario_abertura: q.horario_abertura.slice(0, 5),
        horario_fechamento: q.horario_fechamento.slice(0, 5), descricao: q.descricao || '',
        modalidades: q.modalidades || [],
      })
      setFotos(q.fotos?.length ? q.fotos : q.foto_url ? [q.foto_url] : [])
    }
    iniciar()
  }, [])

  useEffect(() => {
    const el = raiz.current
    if (!el) return
    const obs = new ResizeObserver(([e]) => setLargo(e.contentRect.width >= 700))
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  function alternar(m) {
    setF({ ...f, modalidades: f.modalidades.includes(m) ? f.modalidades.filter((x) => x !== m) : [...f.modalidades, m] })
  }

  async function salvar(e) {
    e.preventDefault(); setErro('')
    if (f.horario_fechamento <= f.horario_abertura) return setErro('O fechamento precisa ser depois da abertura.')
    setSalvando(true)
    const dados = {
      nome: f.nome, cidade: f.cidade, endereco: f.endereco,
      telefone: f.telefone || null,
      preco_hora: Number(String(f.preco_hora).replace(',', '.')),
      horario_abertura: f.horario_abertura, horario_fechamento: f.horario_fechamento,
      descricao: f.descricao || null, fotos, foto_url: fotos[0] || null,
      modalidades: f.modalidades,
    }
    const { error } = editando
      ? await supabase.from('quadras').update(dados).eq('id', id)
      : await supabase.from('quadras').insert({ ...dados, dono_id: userId })
    setSalvando(false)
    if (error) return setErro('Não foi possível salvar: ' + error.message)
    // apaga do armazenamento as fotos que o dono removeu (só as que estão na nossa pasta)
    const caminhos = removidas.map(caminhoNoBucket).filter((c) => c && c.startsWith(userId + '/'))
    if (caminhos.length) await supabase.storage.from('quadras').remove(caminhos)
    nav('/dono')
  }

  const preco = Number(String(f.preco_hora).replace(',', '.')) || 0
  const capa = fotos[0]

  const previa = (
    <div className="nq-prev">
      <div className="nq-prev-tit">Como o cliente vai ver</div>
      <div className="nq-card">
        <div className="nq-capa" style={capa ? { backgroundImage: `url(${capa})` } : undefined}>
          {!capa && <span>Sem foto de capa</span>}
        </div>
        <div className="nq-corpo">
          <strong>{f.nome || 'Nome da quadra'}</strong>
          <small>{[f.endereco, f.cidade].filter(Boolean).join(' · ') || 'Endereço'}</small>
          <div className="nq-tags">
            {f.modalidades.length ? f.modalidades.map((m) => <span key={m}>{m}</span>) : <span className="vazio">Modalidades</span>}
          </div>
          <div className="nq-rod">
            <div><small>{f.horario_abertura} às {f.horario_fechamento}</small><b>{preco ? brl(preco) : 'R$ --'}<i>/hora</i></b></div>
            <span className="nq-alugar">Alugar</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="tela">
      <Header titulo={editando ? 'Editar quadra' : 'Nova quadra'} />
      <main className="conteudo com-barra">
        <div ref={raiz}>
          <form id="form-quadra" onSubmit={salvar}>
            <div className={largo ? 'nq-cols largo' : 'nq-cols'}>
              <div className="nq-form">
                {!largo && previa}

                <section className="nq-sec">
                  <h3><span>1</span>Dados da quadra</h3>
                  <label>Nome da quadra<input value={f.nome} onChange={set('nome')} required /></label>
                  <div className="nq-duas">
                    <label>Cidade<input value={f.cidade} onChange={set('cidade')} required /></label>
                    <label>Telefone / WhatsApp<input inputMode="tel" value={f.telefone} onChange={set('telefone')} /></label>
                  </div>
                  <label>Endereço<input value={f.endereco} onChange={set('endereco')} required /></label>
                  <div className="nq-grupo">
                    <span>Modalidades</span>
                    <div className="dono-chips">
                      {MODALIDADES.map((m) => (
                        <button type="button" key={m} className={f.modalidades.includes(m) ? 'chip on' : 'chip'} onClick={() => alternar(m)}>{m}</button>
                      ))}
                    </div>
                  </div>
                  <label>Descrição<textarea rows={3} value={f.descricao} onChange={set('descricao')} /></label>
                </section>

                <section className="nq-sec">
                  <h3><span>2</span>Preço e horário</h3>
                  <label>Preço por hora
                    <div className="nq-preco"><b>R$</b><input inputMode="decimal" value={f.preco_hora} onChange={set('preco_hora')} placeholder="120" required /><em>/hora</em></div>
                  </label>
                  <div className="nq-duas">
                    <label>Abre às<input type="time" value={f.horario_abertura} onChange={set('horario_abertura')} required /></label>
                    <label>Fecha às<input type="time" value={f.horario_fechamento} onChange={set('horario_fechamento')} required /></label>
                  </div>
                </section>

                <section className="nq-sec">
                  <h3><span>3</span>Fotos <small>(até 5, a primeira é a capa)</small></h3>
                  {userId && <FotosQuadra fotos={fotos} onChange={setFotos} onRemover={(u) => setRemovidas((r) => [...r, u])} userId={userId} />}
                </section>

                {erro && <p className="auth-erro" role="alert">{erro}</p>}
              </div>
              {largo && <aside className="nq-lado">{previa}</aside>}
            </div>
          </form>
        </div>
      </main>
      <div className="nq-barra">
        <button type="button" className="nq-cancelar" onClick={() => nav('/dono')}>Cancelar</button>
        <button type="submit" form="form-quadra" className="nq-salvar" disabled={salvando}>
          {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Salvar quadra'}
        </button>
      </div>
    </div>
  )
}