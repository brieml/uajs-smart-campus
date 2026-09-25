import { NavLink } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

import {
  FiHome,
  FiFileText,
  FiCalendar,
  FiBookOpen,
  FiBell,
  FiUser,
  FiUsers,
  FiShield,
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

const ENLACE_ADMIN = {
  to: '/usuarios',
  label: 'Usuarios',
  icon: FiUsers,
}

/**
 * Barra lateral de navegación principal.
 * El enlace "Usuarios" solo aparece
 * para el rol ADMINISTRADOR.
 */
export default function Sidebar({ open, onClose }) {
  const { esAdmin } = useApp()

  const enlaces = esAdmin
    ? [...ENLACES, ENLACE_ADMIN]
    : ENLACES

  return (
    <>
      {open && (
        <div
          className="sidebar__scrim"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${open ? 'sidebar--open' : ''}`}
      >

        {/* =====================
            ENCABEZADO
        ===================== */}

        <div className="sidebar__header">

          <div className="sidebar__brand">

            <div className="sidebar__brand-mark">
              SC
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


        {/* =====================
            NAVEGACIÓN
        ===================== */}

        <nav
          className="sidebar__nav"
          aria-label="Navegación principal"
        >

          <p className="sidebar__section-title">
            NAVEGACIÓN
          </p>


          <ul className="sidebar__list">

            {enlaces.map((enlace) => {

              const Icon = enlace.icon

              const esEnlaceAdmin =
                enlace.to === '/usuarios'

              return (
                <li
                  className="sidebar__item"
                  key={enlace.to}
                >

                  {/* Etiqueta administrativa */}

                  {esEnlaceAdmin && (
                    <div className="sidebar__admin-divider">

                      <span>
                        ADMINISTRACIÓN
                      </span>

                    </div>
                  )}


                  <NavLink
                    to={enlace.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `
                      sidebar__link
                      ${isActive ? 'sidebar__link--active' : ''}
                      ${esEnlaceAdmin ? 'sidebar__link--admin' : ''}
                      `
                    }
                  >

                    <span
                      className="sidebar__icon"
                      aria-hidden="true"
                    >
                      <Icon />
                    </span>


                    <span className="sidebar__label">
                      {enlace.label}
                    </span>


                    {/* Indicador */}

                    <span className="sidebar__active-indicator" />

                  </NavLink>

                </li>
              )
            })}

          </ul>

        </nav>


        {/* =====================
            ROL ADMIN
        ===================== */}

        {esAdmin && (

          <div className="sidebar__role">

            <div className="sidebar__role-icon">
              <FiShield />
            </div>

            <div>

              <p className="sidebar__role-title">
                Administrador
              </p>

              <p className="sidebar__role-text">
                Panel de gestión
              </p>

            </div>

          </div>

        )}


        {/* =====================
            FOOTER
        ===================== */}

        <div className="sidebar__footer">

          <div className="sidebar__footer-logo">
            UAJS
          </div>

          <div>

            <p className="sidebar__footer-text">
              Corporación Universitaria
            </p>

            <p
              className="
              sidebar__footer-text
              sidebar__footer-text--strong
              "
            >
              Antonio José de Sucre
            </p>

          </div>

        </div>

      </aside>
    </>
  )
}