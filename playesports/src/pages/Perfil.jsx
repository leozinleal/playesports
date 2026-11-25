import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import { reduzirImagem, caminhoNoBucket } from '../imagem'
import { inicialDe, statusEfetivo, fimDaReserva } from '../utils'
import './perfil.css'

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export default function Perfil() {
  const nav = useNavigate()
  const [u, setU] = useState(null)
  const [nome, setNome] = useState('')
  const [fone, setFone] = useState('')
  const [msg, setMsg] = useState({ tipo: '', texto: '' })
  const [salvando, setSalvando] = useState(false)
  const [enviandoFoto, setEnviandoFoto] = useState(false)
  const [numeros, setNumeros] = useState({ total: 0, proximo: '—', feitos: 0 })
  const [senhaAberta, setSenhaAberta] = useState(false)
  const [s1, setS1] = useState('')
  const [s2, setS2] = useState('')
  const [msgSenha, setMsgSenha] = useState({ tipo: '', texto: '' })
  const [largo, setLargo] = useState(() => window.innerWidth >= 760)
  const raiz = useRef(null)
  const arquivo = useRef(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return nav('/login')
      const { data: p } = await supabase.from('usuarios').select('*').eq('id', data.user.id).single()
      const perfil = p || { id: data.user.id, nome: data.user.email, email: data.user.email }
      setU(perfil); setNome(perfil.nome || ''); setFone(perfil.telefone || '')
      const { data: rs } = await supabase.from('reservas').select('data, horario_inicio, horario_fim, status').eq('usuario_id', data.user.id)
      const lista = (rs || []).map((r) => ({ ...r, st: statusEfetivo(r) }))
      const futuras = lista.filter((r) => (r.st === 'agendado' || r.st === 'pendente') && fimDaReserva(r) > new Date())
        .sort((a, b) => fimDaReserva(a) - fimDaReserva(b))
      setNumeros({
        total: lista.filter((r) => r.st !== 'cancelado').length,
        proximo: futuras[0] ? futuras[0].data.slice(8, 10) + '/' + futuras[0].data.slice(5, 7) : '—',
        feitos: lista.filter((r) => r.st === 'finalizado').length,
      })
    })
  }, [])
  useEffect(() => {
    const el = raiz.current
    if (!el) return
    const obs = new ResizeObserver(([e]) => setLargo(e.contentRect.width >= 700))
    obs.observe(el)
    return () => obs.disconnect()
  }, [u])

  async function sair() { await supabase.auth.signOut(); nav('/login') }

  async function salvar(e) {
    e.preventDefault(); setMsg({ tipo: '', texto: '' })
    const digitos = fone.replace(/\D/g, '')
    if (nome.trim().length < 2) return setMsg({ tipo: 'erro', texto: 'Digite seu nome.' })
    if (digitos.length < 10 || digitos.length > 13) return setMsg({ tipo: 'erro', texto: 'Digite o telefone com DDD, por exemplo 51998783897.' })
    setSalvando(true)
    const { error } = await supabase.from('usuarios').update({ nome: nome.trim(), telefone: digitos }).eq('id', u.id)
    setSalvando(false)
    if (error) return setMsg({ tipo: 'erro', texto: 'Não foi possível salvar: ' + error.message })
    setU({ ...u, nome: nome.trim(), telefone: digitos }); setFone(digitos)
    setMsg({ tipo: 'ok', texto: 'Dados salvos ✓' })
  }

  async function trocarFoto(e) {
    const arq = e.target.files?.[0]
    e.target.value = ''
    if (!arq) return
    setMsg({ tipo: '', texto: '' }); setEnviandoFoto(true)
    try {
      const blob = await reduzirImagem(arq, 512, 0.85)
      const caminho = `${u.id}/${Date.now()}.jpg`
      const { error } = await supabase.storage.from('avatares').upload(caminho, blob, { contentType: 'image/jpeg', cacheControl: '31536000' })
      if (error) throw error
      const url = supabase.storage.from('avatares').getPublicUrl(caminho).data.publicUrl
      const { error: e2 } = await supabase.from('usuarios').update({ avatar_url: url }).eq('id', u.id)
      if (e2) throw e2
      const antiga = u.avatar_url && caminhoNoBucket(u.avatar_url, 'avatares')
      if (antiga) await supabase.storage.from('avatares').remove([antiga])
      setU({ ...u, avatar_url: url })
    } catch (err) {
      setMsg({ tipo: 'erro', texto: 'Não foi possível enviar a foto. Use JPG, PNG ou WebP de até 3 MB.' })
    }
    setEnviandoFoto(false)
  }

  async function trocarSenha(e) {
    e.preventDefault(); setMsgSenha({ tipo: '', texto: '' })
    if (s1.length < 6) return setMsgSenha({ tipo: 'erro', texto: 'A senha precisa ter pelo menos 6 caracteres.' })
    if (s1 !== s2) return setMsgSenha({ tipo: 'erro', texto: 'As senhas não são iguais.' })
    const { error } = await supabase.auth.updateUser({ password: s1 })
    if (error) return setMsgSenha({ tipo: 'erro', texto: 'Não foi possível alterar: ' + error.message })
    setS1(''); setS2(''); setSenhaAberta(false)
    setMsgSenha({ tipo: 'ok', texto: 'Senha alterada ✓' })
  }

  const desde = u?.criado_em ? `${MESES[new Date(u.criado_em).getMonth()]}/${new Date(u.criado_em).getFullYear()}` : ''
  const papel = u?.tipo === 'dono' ? 'Parceiro' : 'Jogador'

  return (
    <div className="tela">
      <Header titulo="Perfil" voltar={false} />
      <main className="conteudo">
        {u && (
          <div ref={raiz}>
            <div className={largo ? 'pf-cols largo' : 'pf-cols'}>
              <section className="pf-card pf-topo">
                <div className="pf-av">
                  <div className="foto">{u.avatar_url ? <img src={u.avatar_url} alt="Sua foto" /> : inicialDe(u.nome)}</div>
                  <button type="button" className="pf-cam" disabled={enviandoFoto} onClick={() => arquivo.current.click()} aria-label="Trocar foto">{enviandoFoto ? '…' : '📷'}</button>
                  <input ref={arquivo} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={trocarFoto} />
                </div>
                <h2>{u.nome}</h2>
                <p>{papel}{desde && ` · membro desde ${desde}`}</p>
                <div className="pf-st">
                  <div><b>{numeros.total}</b><small>Reservas</small></div>
                  <div><b>{numeros.proximo}</b><small>Próximo jogo</small></div>
                  <div><b>{numeros.feitos}</b><small>Jogos feitos</small></div>
                </div>
                <button type="button" className="pf-bt r pf-sair" onClick={sair}>Sair da conta</button>
              </section>

              <section className="pf-card">
                <h3>Dados pessoais</h3>
                <form className="pf-form" onSubmit={salvar}>
                  <label>Nome<input value={nome} onChange={(e) => setNome(e.target.value)} required /></label>
                  <div className="pf-2">
                    <label>Telefone / WhatsApp<input inputMode="tel" value={fone} onChange={(e) => setFone(e.target.value)} placeholder="51998783897" /></label>
                    <label>E-mail<input value={u.email || ''} disabled /></label>
                  </div>
                  {msg.texto && <p className={msg.tipo === 'ok' ? 'pf-ok' : 'erro'} role="status">{msg.texto}</p>}
                  <button className="pf-bt p" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar alterações'}</button>
                </form>

                <div className="pf-sep" />
                <h3>Segurança</h3>
                {!senhaAberta ? (
                  <>
                    <button type="button" className="pf-bt" onClick={() => { setSenhaAberta(true); setMsgSenha({ tipo: '', texto: '' }) }}>Alterar senha</button>
                    {msgSenha.texto && <p className={msgSenha.tipo === 'ok' ? 'pf-ok' : 'erro'} style={{ marginTop: 10 }}>{msgSenha.texto}</p>}
                  </>
                ) : (
                  <form className="pf-form" onSubmit={trocarSenha}>
                    <label>Nova senha<input type="password" autoComplete="new-password" value={s1} onChange={(e) => setS1(e.target.value)} /></label>
                    <label>Repita a nova senha<input type="password" autoComplete="new-password" value={s2} onChange={(e) => setS2(e.target.value)} /></label>
                    {msgSenha.texto && <p className="erro">{msgSenha.texto}</p>}
                    <button className="pf-bt p">Salvar nova senha</button>
                    <button type="button" className="pf-bt" onClick={() => { setSenhaAberta(false); setS1(''); setS2('') }}>Cancelar</button>
                  </form>
                )}
              </section>
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}