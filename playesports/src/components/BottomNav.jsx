import { NavLink } from 'react-router-dom'
import { Home, Cal, Heart, User } from './Icons'

const Headset = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="2.5" y="14" width="4" height="6" rx="1.5" /><rect x="17.5" y="14" width="4" height="6" rx="1.5" /><path d="M20 20c0 1.5-2 2-5 2" /></svg>
)

export default function BottomNav() {
  const item = (to, Icon, end) => (
    <NavLink to={to} end={end} className={({ isActive }) => 'nav-item' + (isActive ? ' ativo' : '')}><Icon /></NavLink>
  )
  return <nav className="bottom-nav">{item('/', Home, true)}{item('/agenda', Cal)}{item('/suporte', Headset)}<span className="nav-item soon" title="Em breve"><Heart /></span>{item('/perfil', User)}</nav>
}