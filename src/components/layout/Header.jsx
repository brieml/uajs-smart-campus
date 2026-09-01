import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import SearchBar from '../common/SearchBar'
import Avatar from '../common/Avatar'

/**
 * Encabezado superior del panel: menú móvil, buscador global,
 * campana de notificaciones y acceso al perfil del usuario.
 */
export default function Header({ onToggleSidebar, onSearch }) {
  const { usuario, noLeidas } = useApp()
  const navigate = useNavigate()
  const [valorBusqueda, setValorBusqueda] = useState('')

  function manejarBusqueda(valor) {
    setValorBusqueda(valor)
    onSearch?.(valor)
  }

  function salir() {
    navigate('/')
  }

  return (
    <header className="header">
      <button
        type="button"
        className="header__menu-btn"
        onClick={onToggleSidebar}
        aria-label="Abrir menú de navegación"
      >
        ☰
      </button>

   

      <div className="header__search">
        <SearchBar
          value={valorBusqueda}
          onChange={manejarBusqueda}
          placeholder="Buscar servicios, solicitudes, recursos…"
        />
      </div>

      <div className="header__actions">
        <button
          type="button"
          className="header__icon-btn"
          onClick={() => navigate('/notificaciones')}
          aria-label={`Notificaciones${noLeidas > 0 ? `, ${noLeidas} sin leer` : ''}`}
        >
          🔔
          {noLeidas > 0 && <span className="header__badge">{noLeidas}</span>}
        </button>

        <button
          type="button"
          className="header__profile"
          onClick={() => navigate('/perfil')}
        >
          <Avatar nombre={usuario?.nombre} size="sm" />
          <span className="header__profile-name">{usuario?.nombre?.split(' ')[0] ?? '...'}</span>
        </button>
           <button type="button" className="header__profile" onClick={salir}>
        <span className="header__profile-name"> salir </span>
      </button>
      </div>
    </header>
  )
}
