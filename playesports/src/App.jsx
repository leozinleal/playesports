import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import TelaInicial from './pages/TelaInicial'
import DetalheArena from './pages/DetalheArena'
import Reserva from './pages/Reserva'
import Agenda from './pages/Agenda'
import DetalheReserva from './pages/DetalheReserva'
import Perfil from './pages/Perfil'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TelaInicial />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/quadra/:id" element={<DetalheArena />} />
        <Route path="/quadra/:id/reservar" element={<Reserva />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/reserva/:id" element={<DetalheReserva />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="*" element={<p style={{padding:20}}>Página não encontrada</p>} />
      </Routes>
    </BrowserRouter>
  )
}
