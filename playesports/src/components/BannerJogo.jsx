import './banner.css'

// Campo visto de cima com um time trocando passes (animação em CSS, sem imagens)
const AMARELO = [[150, 45], [205, 98], [275, 40], [296, 92]]
const AZUL = [[178, 80], [236, 62], [268, 104], [300, 68]]

function Jogador({ x, y, cor, i }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="bj-corre" style={{ animationDelay: `${-i * 0.7}s`, animationDuration: `${2.4 + (i % 3) * 0.5}s` }}>
        <ellipse cx="1.5" cy="8" rx="9" ry="3" fill="#000" opacity=".22" />
        <circle r="8.5" fill={cor} stroke="#fff" strokeOpacity=".9" strokeWidth="1.6" />
        <circle r="3" fill="#fff" opacity=".35" />
      </g>
    </g>
  )
}

export default function BannerJogo() {
  return (
    <svg className="bj" viewBox="0 0 600 130" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="bj-grama" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1f5c3c" />
          <stop offset="1" stopColor="#3f8e60" />
        </linearGradient>
      </defs>
      <rect width="600" height="130" fill="url(#bj-grama)" />
      {[0, 2, 4, 6, 8, 10, 12].map((i) => <rect key={i} x={i * 50} y="0" width="50" height="130" fill="#fff" opacity=".06" />)}
      <g fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="1.6">
        <line x1="225" y1="-5" x2="225" y2="135" />
        <circle cx="225" cy="65" r="36" />
        <rect x="-5" y="25" width="70" height="80" />
        <rect x="535" y="25" width="70" height="80" />
      </g>
      <circle cx="225" cy="65" r="2.6" fill="#fff" opacity=".5" />

      {AZUL.map(([x, y], i) => <Jogador key={'b' + i} x={x} y={y} cor="#4369e4" i={i + 4} />)}
      {AMARELO.map(([x, y], i) => <Jogador key={'a' + i} x={x} y={y} cor="#f2bd1f" i={i} />)}

      <g className="bj-bola">
        <ellipse cx="1" cy="5" rx="5.5" ry="2" fill="#000" opacity=".3" />
        <circle r="5.5" fill="#fff" stroke="#1e1e1e" strokeWidth="1" />
        <path d="M0-2.4l2.3 1.7-.9 2.7h-2.8l-.9-2.7z" fill="#1e1e1e" />
      </g>
    </svg>
  )
}