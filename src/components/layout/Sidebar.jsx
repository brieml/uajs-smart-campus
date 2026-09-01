import { NavLink } from 'react-router-dom'
import {
  FiHome,
  FiFileText,
  FiCalendar,
  FiBookOpen,
  FiBell,
  FiUser,
  FiX,
} from 'react-icons/fi'

const ENLACES = [
  { to: '/home', label: 'Inicio', icon: FiHome },
  { to: '/solicitudes', label: 'Solicitudes', icon: FiFileText },
  { to: '/reservas', label: 'Reservas', icon: FiCalendar },
  { to: '/eventos', label: 'Eventos', icon: FiBookOpen },
  { to: '/notificaciones', label: 'Notificaciones', icon: FiBell },
  { to: '/perfil', label: 'Perfil', icon: FiUser },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="sidebar__scrim"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
        {/* ENCABEZADO */}
        <div className="sidebar__header">
          <div className="sidebar__brand">
            <div className="sidebar__brand-mark">
              <span>SC</span>
            </div>

            <div className="sidebar__brand-info">
              <p className="sidebar__brand-title">
                Smart Campus
              </p>

              <p className="sidebar__brand-subtitle">
                UAJS
              </p>
            </div>
          </div>

          <button
            className="sidebar__close"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <FiX />
          </button>
        </div>

        {/* DIVISOR */}
        <div className="sidebar__divider" />

        {/* NAVEGACIÓN */}
        <nav
          className="sidebar__nav"
          aria-label="Navegación principal"
        >
          <p className="sidebar__section-title">
            MENÚ PRINCIPAL
          </p>

          <ul className="sidebar__list">
            {ENLACES.map((enlace) => {
              const Icon = enlace.icon

              return (
                <li
                  className="sidebar__item"
                  key={enlace.to}
                >
                  <NavLink
                    to={enlace.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `sidebar__link ${
                        isActive
                          ? 'sidebar__link--active'
                          : ''
                      }`
                    }
                  >
                    <span className="sidebar__icon">
                      <Icon />
                    </span>

                    <span className="sidebar__label">
                      {enlace.label}
                    </span>

                    <span className="sidebar__active-indicator" />
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* FOOTER */}
        <div className="sidebar__footer">
          <div className="sidebar__footer-logo">
            UAJS
          </div>

          <div>
            <p className="sidebar__footer-text">
              Corporación Universitaria
            </p>

            <p className="sidebar__footer-text sidebar__footer-text--strong">
              Antonio José de Sucre
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}