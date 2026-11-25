const CORPO = 'M22 6H28Q32 19 36 6H42Q44 18 53 24V56Q53 59 50 59H14Q11 59 11 56V24Q20 18 22 6Z'
const FUROS = [0, 1, 2, 3, 4].flatMap((r) => [0, 1, 2, 3, 4].map((k) => [19 + k * 6.5, 29 + r * 6]))

// Dois coletes de treino (laranja e azul) lado a lado
export default function IconeColetes({ tamanho = 40 }) {
  const colete = (cor, furo, mover) => (
    <g transform={mover}>
      <path d={CORPO} fill={cor} />
      {FUROS.map(([x, y]) => <circle key={x + '-' + y} cx={x} cy={y} r="1" fill={furo} />)}
    </g>
  )
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 64 64" aria-hidden="true">
      {colete('#ff7a1a', '#c94f00', 'translate(-5 4) scale(.85)')}
      {colete('#2f7fd1', '#1c5fa8', 'translate(17 4) scale(.85)')}
    </svg>
  )
}