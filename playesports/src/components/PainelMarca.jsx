import logo from '../assets/logo.png'

// Decoração do painel verde: campo de futebol visto de cima (listras, linhas e bola)
function Decoracao() {
  const linha = { fill: 'none', stroke: '#fff', strokeOpacity: 0.24, strokeWidth: 1.6 }
  return (
    <svg className="auth-deco" viewBox="0 0 400 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="vinheta" cx="50%" cy="50%" r="75%">
          <stop offset="55%" stopColor="#0f3a24" stopOpacity="0" />
          <stop offset="100%" stopColor="#0f3a24" stopOpacity=".45" />
        </radialGradient>
      </defs>
      {[0, 2, 4, 6, 8].map((i) => <rect key={i} x="0" y={i * 46 + 0} width="400" height="46" fill="#fff" opacity=".07" />)}
      <g {...linha}>
        <line x1="0" y1="230" x2="400" y2="230" />
        <circle cx="200" cy="230" r="68" />
        <rect x="95" y="-10" width="210" height="100" />
        <rect x="145" y="-10" width="110" height="42" />
        <path d="M160 90 A52 52 0 0 0 240 90" />
        <rect x="95" y="370" width="210" height="100" />
        <rect x="145" y="428" width="110" height="42" />
        <path d="M160 370 A52 52 0 0 1 240 370" />
      </g>
      <circle cx="200" cy="230" r="3.5" fill="#fff" opacity=".5" />
      <rect width="400" height="460" fill="url(#vinheta)" />
      <g className="auth-bola" transform="translate(338 392)">
        <ellipse cx="2" cy="22" rx="17" ry="4" fill="#000" opacity=".18" />
        <circle r="19" fill="#fff" />
        <path d="M0 -8l8 6-3 9h-10l-3-9z" fill="#1e1e1e" />
        <path d="M0-8v-10M8-2l10-3M5 7l6 8M-5 7l-6 8M-8-2l-10-3" stroke="#1e1e1e" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  )
}

// Painel verde das telas de entrada (login, cadastro de parceiro)
export default function PainelMarca({ titulo, slogan, itens }) {
  return (
    <section className="auth-lado">
      <Decoracao />
      <div className="auth-lado-conteudo">
        <div className="auth-logo"><img src={logo} alt="Logo PlayEsports" /></div>
        <h1>{titulo}</h1>
        <p className="auth-slogan">{slogan}</p>
        <ul className="auth-lista">
          {itens.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </div>
    </section>
  )
}