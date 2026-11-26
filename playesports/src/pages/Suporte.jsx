import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import { SUPORTE_WHATSAPP, SUPORTE_EMAIL, SUPORTE_HORARIO, SUPORTE_MENSAGEM } from '../config'
import './suporte.css'

const d = SUPORTE_WHATSAPP.replace(/^55/, '')
const numeroBonito = `(${d.slice(0, 2)}) ${d.slice(2, -4)}-${d.slice(-4)}`
const linkZap = `https://wa.me/${SUPORTE_WHATSAPP}?text=${encodeURIComponent(SUPORTE_MENSAGEM)}`

const DUVIDAS = [
  ['O que significa "Pendente"?', 'Seu pedido foi enviado ao dono da quadra. Ele tem até 30 minutos para responder. Se não responder nesse prazo, o pedido é cancelado automaticamente e o horário volta a ficar livre.'],
  ['Não recebi o e-mail de confirmação.', 'Olhe a pasta de spam ou lixo eletrônico. Na tela de confirmação você pode tocar em "Reenviar e-mail". Se continuar sem chegar, fale com a gente pelo WhatsApp.'],
  ['Como falo com a quadra?', 'Abra a sua reserva em "Agenda". Na tela da reserva, use o botão "Ligar" para ligar para a quadra ou "Ver no mapa" para chegar lá.'],
]

const ico = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
const IconZap = () => <svg {...ico}><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.7-5A8.5 8.5 0 1 1 21 11.5z" /><path d="M9 8.5c.3 2.6 2.4 5 5.5 6l1.3-1.3-2-1-1 .6a4 4 0 0 1-1.8-1.8l.6-1-1-2z" /></svg>
const IconMail = () => <svg {...ico}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
const IconPhone = () => <svg {...ico}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg>
const IconClock = () => <svg {...ico} width="14" height="14"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>

export default function Suporte() {
  const [mostrarNav, setMostrarNav] = useState(false)

  useEffect(() => {
    // a barra de baixo é do cliente: não aparece para visitante nem para parceiro
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const { data: p } = await supabase.from('usuarios').select('tipo').eq('id', data.user.id).single()
      setMostrarNav(p?.tipo !== 'dono')
    })
  }, [])

  return (
    <div className="tela">
      <Header titulo="Suporte" />
      <main className="conteudo">
        <div className="sp-cols">
          <div className="sp-col-contato">
            <section className="sp-hero">
              <h2>Precisa de ajuda?</h2>
              <p>Estamos aqui para ajudar com reservas, cadastro ou qualquer dúvida. Fale com a nossa equipe.</p>
              <a className="sp-zap" href={linkZap} target="_blank" rel="noopener noreferrer"><IconZap /> Falar no WhatsApp</a>
              {SUPORTE_HORARIO && <div className="sp-chips"><span><IconClock /> {SUPORTE_HORARIO}</span></div>}
            </section>

            <section className="sp-lista">
              {SUPORTE_EMAIL && (
                <a className="sp-linha" href={`mailto:${SUPORTE_EMAIL}?subject=${encodeURIComponent('Ajuda com o PlaySports')}`}>
                  <div className="sp-li-ico"><IconMail /></div>
                  <div><b>E-mail</b><small>{SUPORTE_EMAIL}</small></div>
                </a>
              )}
              <a className="sp-linha" href={`tel:+${SUPORTE_WHATSAPP}`}>
                <div className="sp-li-ico"><IconPhone /></div>
                <div><b>Telefone</b><small>{numeroBonito}</small></div>
              </a>
            </section>
          </div>

          <div className="sp-col-faq">
            <h3 className="sp-tit">Dúvidas frequentes</h3>
            <div className="sp-faq">
              {DUVIDAS.map(([p, r]) => (
                <details key={p}><summary>{p}</summary><p>{r}</p></details>
              ))}
            </div>
          </div>
        </div>
      </main>
      {mostrarNav && <BottomNav />}
    </div>
  )
}