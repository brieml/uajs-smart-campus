import { useNavigate } from 'react-router-dom'
import { useCountdown } from '../hooks/useCountdown'
import { servicios } from '../services/mockData'
import { useApp } from '../context/AppContext'

const PERFILES = [
  { rol: 'Estudiante', detalle: 'Solicitudes, reservas y notificaciones en un solo lugar.' },
  { rol: 'Docente', detalle: 'Gestión de recursos, reservas y publicación académica.' },
  { rol: 'Administrativo', detalle: 'Atención de solicitudes, reservas y reportes.' },
  { rol: 'Administrador', detalle: 'Usuarios, roles y supervisión de la plataforma.' },
]

/**
 * Vista de acceso (landing institucional). Presenta la plataforma y,
 * si el usuario no interactúa en 5 segundos, redirige automáticamente
 * — al panel principal si ya inició sesión, o al login en caso
 * contrario — requisito explícito de la actividad integrativa.
 */
export default function LandingPage() {
  const navigate = useNavigate()
  const { estaAutenticado } = useApp()
  const destino = estaAutenticado ? '/home' : '/login'
  const { secondsLeft, pause, progress } = useCountdown(5, () => navigate(destino))

  function entrarAhora() {
    pause()
    navigate(destino)
  }

  return (
    <div className="landing" onMouseMove={pause} onTouchStart={pause}>
      <div className="landing__backdrop" aria-hidden="true">
        <svg viewBox="0 0 600 600" className="landing__mesh">
          <g stroke="rgba(232,169,58,0.35)" strokeWidth="1">
            <line x1="40" y1="80" x2="260" y2="200" />
            <line x1="260" y1="200" x2="480" y2="90" />
            <line x1="260" y1="200" x2="180" y2="420" />
            <line x1="260" y1="200" x2="420" y2="380" />
            <line x1="180" y1="420" x2="420" y2="380" />
            <line x1="420" y1="380" x2="560" y2="470" />
            <line x1="180" y1="420" x2="60" y2="520" />
          </g>
          <g fill="#e8a93a">
            <circle cx="40" cy="80" r="5" />
            <circle cx="260" cy="200" r="7" />
            <circle cx="480" cy="90" r="5" />
            <circle cx="180" cy="420" r="6" />
            <circle cx="420" cy="380" r="6" />
            <circle cx="560" cy="470" r="4" />
            <circle cx="60" cy="520" r="4" />
          </g>
        </svg>
      </div>

      <div className="landing__content u-container">
        <p className="landing__eyebrow">Corporación Universitaria Antonio José de Sucre</p>
        <h1 className="landing__title">UAJS Smart Campus</h1>
        <p className="landing__subtitle">
          Una plataforma distribuida que articula, en una sola experiencia, los servicios
          universitarios de solicitudes, reservas, recursos, eventos y notificaciones.
        </p>

        <div className="landing__services">
          {servicios.slice(0, 6).map((servicio) => (
            <span key={servicio.id} className="landing__service-chip">
              <span aria-hidden="true">{servicio.icono}</span> {servicio.nombre}
            </span>
          ))}
        </div>

        <div className="landing__profiles">
          {PERFILES.map((perfil) => (
            <div className="landing__profile" key={perfil.rol}>
              <p className="landing__profile-role">{perfil.rol}</p>
              <p className="landing__profile-detail">{perfil.detalle}</p>
            </div>
          ))}
        </div>

        <div className="landing__cta">
          <button type="button" className="landing__enter-btn" onClick={entrarAhora}>
            Entrar a la plataforma
          </button>

          <div className="landing__countdown" role="status">
            <svg viewBox="0 0 36 36" className="landing__countdown-ring">
              <circle cx="18" cy="18" r="16" className="landing__countdown-track" />
              <circle
                cx="18" cy="18" r="16"
                className="landing__countdown-progress"
                style={{ strokeDashoffset: `${100 - progress * 100}` }}
              />
            </svg>
            <span className="landing__countdown-text">
              Redirigiendo en {secondsLeft}s
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
