import { BrowserRouter, Routes, Route } from 'react-router-dom'
import TelaInicial from './pages/TelaInicial'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import DetalheArena from './pages/DetalheArena'
import Reserva from './pages/Reserva'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TelaInicial />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/quadra/:id" element={<DetalheArena />} />
        <Route path="/quadra/:id/reservar" element={<Reserva />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App