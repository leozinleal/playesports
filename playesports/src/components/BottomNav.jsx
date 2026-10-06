import { NavLink } from 'react-router-dom'
import { Home, Cal, Bell, Heart, User } from './Icons'
export default function BottomNav() {
  const item = (to, Icon, end) => (
    <NavLink to={to} end={end} className={({ isActive }) => 'nav-item' + (isActive ? ' ativo' : '')}><Icon /></NavLink>
  )
  return <nav className="bottom-nav">{item('/', Home, true)}{item('/agenda', Cal)}<span className="nav-item soon" title="Em breve"><Bell /></span><span className="nav-item soon" title="Em breve"><Heart /></span>{item('/perfil', User)}</nav>
}
