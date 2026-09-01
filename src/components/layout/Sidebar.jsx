import { NavLink } from 'react-router-dom'

const ENLACES = [
  { to: '/home', label: 'Inicio', icon: '🏠', fin: true },
  { to: '/solicitudes', label: 'Solicitudes', icon: '📄' },
  { to: '/reservas', label: 'Reservas', icon: '🗓️' },
  { to: '/eventos', label: 'Eventos', icon: '🎓' },
  { to: '/notificaciones', label: 'Notificaciones', icon: '🔔' },
  { to: '/perfil', label: 'Perfil', icon: '👤' },
]

/**
 * Barra lateral de navegación principal del panel.
 */
export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && <div className="sidebar__scrim" onClick={onClose} aria-hidden="true" />}
      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
        <div className="sidebar__brand">
          <span className="sidebar__brand-mark">SC</span>
          <div>
            <p className="sidebar__brand-title">Smart Campus</p>
            <p className="sidebar__brand-subtitle">UAJS</p>
          </div>
        </div>

        <nav className="sidebar__nav" aria-label="Navegación principal">
          <ul className="sidebar__list">
            {ENLACES.map((enlace) => (
              <li className="sidebar__item" key={enlace.to}>
                <NavLink
                  to={enlace.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                  }
                >
                  <span className="sidebar__icon" aria-hidden="true">{enlace.icon}</span>
                  <span>{enlace.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar__footer">
          <p className="sidebar__footer-text">Corporación Universitaria</p>
          <p className="sidebar__footer-text sidebar__footer-text--strong">Antonio José de Sucre</p>
        </div>
      </aside>
    </>
  )
}
