export const brl = (n) => Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export const hhmm = (t) => (t || '').slice(0, 5)
export const dataBR = (d) => d.split('-').reverse().join('/')
export const inicialDe = (nome = '') => nome.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase()
export function fimDaReserva(r) { return new Date(`${r.data}T${r.horario_fim}`) }
// estado exibido na Agenda: agendado vencido vira finalizado
export function statusEfetivo(r) {
  if (r.status === 'cancelado') return 'cancelado'
  if (r.status === 'finalizado' || fimDaReserva(r) < new Date()) return 'finalizado'
  return 'agendado'
}
export function gerarCodigo() {
  const L = 'ABCDEFGHJKLMNPQRSTUVWXYZ', N = '23456789'
  const p = (s, n) => Array.from({ length: n }, () => s[Math.floor(Math.random() * s.length)]).join('')
  return `${p(L, 4)}-${p(L, 2)}${p(N, 2)}`
}
// gera horários cheios entre abertura e fechamento (ex.: 13:30 -> 14:30 ... )
export function gerarSlots(abre, fecha) {
  const [ah, am] = abre.split(':').map(Number), [fh, fm] = fecha.split(':').map(Number)
  const out = []
  for (let m = ah * 60 + am; m + 60 <= fh * 60 + fm; m += 60) out.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`)
  return out
}
export function somaHora(h, mais = 60) {
  const [a, b] = h.split(':').map(Number); const m = a * 60 + b + mais
  return `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}
