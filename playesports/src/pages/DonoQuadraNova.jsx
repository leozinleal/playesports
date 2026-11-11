import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Header from '../components/Header'
import './dono.css'

const MODALIDADES = ['Society', 'Futsal', 'Campo', 'Beach Soccer']

export default function DonoQuadraNova() {
  const nav = useNavigate()
  const [userId, setUserId] = useState(null)
  const [f, setF] = useState({
    nome: '', cidade: 'Capão da Canoa', endereco: '', telefone: '',
    preco_hora: '', horario_abertura: '08:00', horario_fechamento: '23:00',
    descricao: '', foto_url: '', modalidades: [],
  })
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) nav('/login?area=dono')
      else setUserId(data.user.id)
    })
  }, [])

  function alternar(m) {
    setF({ ...f, modalidades: f.modalidades.includes(m) ? f.modalidades.filter((x) => x !== m) : [...f.modalidades, m] })
  }

  async function salvar(e) {
    e.preventDefault(); setErro('')
    if (f.horario_fechamento <= f.horario_abertura) return setErro('O fechamento precisa ser depois da abertura.')
    setSalvando(true)
    const { error } = await supabase.from('quadras').insert({
      nome: f.nome, cidade: f.cidade, endereco: f.endereco,
      telefone: f.telefone || null,
      preco_hora: Number(String(f.preco_hora).replace(',', '.')),
      horario_abertura: f.horario_abertura, horario_fechamento: f.horario_fechamento,
      descricao: f.descricao || null, foto_url: f.foto_url || null,
      modalidades: f.modalidades, dono_id: userId,
    })
    setSalvando(false)
    if (error) return setErro('Não foi possível salvar: ' + error.message)
    nav('/dono')
  }

  return (
    <div className="tela">
      <Header titulo="Nova quadra" />
      <main className="conteudo">
        <form className="dono-form" onSubmit={salvar}>
          <label>Nome da quadra<input value={f.nome} onChange={set('nome')} required /></label>
          <label>Cidade<input value={f.cidade} onChange={set('cidade')} required /></label>
          <label>Endereço<input value={f.endereco} onChange={set('endereco')} required /></label>
          <label>Telefone / WhatsApp<input value={f.telefone} onChange={set('telefone')} /></label>
          <label>Preço por hora (R$)<input inputMode="decimal" value={f.preco_hora} onChange={set('preco_hora')} placeholder="120" required /></label>
          <div className="dono-linha">
            <label>Abre às<input type="time" value={f.horario_abertura} onChange={set('horario_abertura')} required /></label>
            <label>Fecha às<input type="time" value={f.horario_fechamento} onChange={set('horario_fechamento')} required /></label>
          </div>
          <fieldset>
            <legend>Modalidades</legend>
            <div className="dono-chips">
              {MODALIDADES.map((m) => (
                <button type="button" key={m} className={f.modalidades.includes(m) ? 'chip on' : 'chip'} onClick={() => alternar(m)}>{m}</button>
              ))}
            </div>
          </fieldset>
          <label>Descrição<textarea rows={3} value={f.descricao} onChange={set('descricao')} /></label>
          <label>Link da foto (opcional)<input value={f.foto_url} onChange={set('foto_url')} placeholder="https://..." /></label>
          {erro && <p className="auth-erro" role="alert">{erro}</p>}
          <button className="auth-botao" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar quadra'}</button>
        </form>
      </main>
    </div>
  )
}