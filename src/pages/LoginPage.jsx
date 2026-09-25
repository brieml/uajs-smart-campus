import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Check, ArrowRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { esModoMock, solicitarRecuperacion } from '../services/api'
import BACKGROUND_IMAGE from '../assets/campus.png'
import LOGO_SRC from '../assets/logo-uajs.png'

// Servicios del módulo 8 del proyecto integrador, usados como
// elemento visual de la marca (no interactivos en el login).
const SERVICES = [
  { id: 'solicitudes', label: 'Solicitudes', angle: -90 },
  { id: 'reservas', label: 'Reservas', angle: -30 },
  { id: 'recursos', label: 'Recursos', angle: 30 },
  { id: 'eventos', label: 'Eventos', angle: 90 },
  { id: 'notificaciones', label: 'Notificaciones', angle: 150 },
  { id: 'pqrs', label: 'PQRS', angle: 210 },
]

// Cuentas de prueba para modo mock (src/data/usuarios.json) y modo real API (seeders MySQL).
const CUENTAS_DEMO_MOCK = [
  { rol: 'Estudiante', nombre: 'Valentina Herrera', cedula: '1102345678', email: 'valentina.herrera@uajs.edu.co', clave: '1234' },
  { rol: 'Docente', nombre: 'Carlos Pérez', cedula: '7788990011', email: 'carlos.perez@uajs.edu.co', clave: '1234' },
  { rol: 'Administrativo', nombre: 'Marcela Gómez', cedula: '4455667788', email: 'marcela.gomez@uajs.edu.co', clave: '1234' },
  { rol: 'Administrador', nombre: 'Root Sistemas', cedula: '1000000000', email: 'sistemas@uajs.edu.co', clave: 'admin1234' },
]

const CUENTAS_DEMO_REAL = [
  { rol: 'Super Administrador', nombre: 'Darwin Montes', email: 'admin@uajs.edu.co', clave: 'Campus2026!*', detalle: 'Acceso total al sistema' },
  { rol: 'Administrativo / Personal', nombre: 'Roberto Ospina', email: 'roberto.ospina@uajs.edu.co', clave: 'Campus2026!*', detalle: 'Gestión institucional' },
  { rol: 'Docente', nombre: 'Carlos Mendoza', email: 'carlos.mendoza@uajs.edu.co', clave: 'Campus2026!*', detalle: 'Ing. y Tecnologías' },
  { rol: 'Docente', nombre: 'Martha Rincón', email: 'martha.rincon@uajs.edu.co', clave: 'Campus2026!*', detalle: 'Ciencias de la Salud' },
  { rol: 'Estudiante', nombre: 'Santiago Morales', email: 'santiago.morales@uajs.edu.co', clave: 'Campus2026!*', detalle: 'Ingeniería de Software' },
  { rol: 'Estudiante', nombre: 'Valentina Gómez', email: 'valentina.gomez@uajs.edu.co', clave: 'Campus2026!*', detalle: 'Medicina General' },
]

const CUENTAS_DEMO = esModoMock ? CUENTAS_DEMO_MOCK : CUENTAS_DEMO_REAL

function NetworkGraphic() {
  const cx = 150
  const cy = 150
  const r = 96
  const points = SERVICES.map((s) => {
    const rad = (s.angle * Math.PI) / 180
    return { ...s, x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  })

  return (
    <svg
      className="network"
      viewBox="0 0 300 300"
      role="img"
      aria-label="Servicios de solicitudes, reservas, recursos, eventos, notificaciones y PQRS conectados a la plataforma"
    >
      {points.map((p) => (
        <line key={`line-${p.id}`} x1={cx} y1={cy} x2={p.x} y2={p.y} className="network__line" />
      ))}
      <circle cx={cx} cy={cy} r="30" className="network__hub" />
      <text x={cx} y={cy + 4} textAnchor="middle" className="network__hub-label">
        Campus
      </text>
      {points.map((p, i) => (
        <g key={p.id}>
          <circle
            cx={p.x}
            cy={p.y}
            r="7"
            className="network__dot"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
          <text
            x={p.x}
            y={p.y + (p.y > cy ? 18 : -12)}
            textAnchor="middle"
            className="network__label"
          >
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  )
}

function TextField({ id, label, icon: Icon, ...props }) {
  return (
    <label className="login-field" htmlFor={id}>
      <span className="login-field__label">{label}</span>
      <span className="login-field__control">
        <Icon size={18} className="login-field__icon" aria-hidden="true" />
        <input id={id} className="login-field__input" {...props} />
      </span>
    </label>
  )
}

function PasswordField({ id, label, value, onChange }) {
  const [visible, setVisible] = useState(false)
  return (
    <label className="login-field" htmlFor={id}>
      <span className="login-field__label">{label}</span>
      <span className="login-field__control">
        <Lock size={18} className="login-field__icon" aria-hidden="true" />
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className="login-field__input"
          placeholder="********"
          autoComplete="current-password"
          value={value}
          onChange={onChange}
          required
        />
        <button
          type="button"
          className="login-field__toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </span>
    </label>
  )
}

/**
 * Vista de acceso institucional.
 * - Modo mock (VITE_USE_MOCK_API=true): acepta cédula o correo de src/data/usuarios.json.
 * - Modo real (auth-service vía gateway): exige correo institucional + contraseña,
 *   guarda accessToken/refreshToken y el perfil de GET /auth/me.
 */
export default function LoginPage() {
  const navigate = useNavigate()
  const { iniciarSesion } = useApp()

  const [identificador, setIdentificador] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    setSubmitting(true)
    try {
      await iniciarSesion(identificador, password, remember)
      navigate('/home')
    } catch (err) {
      setError(err.message || 'No fue posible iniciar sesión. Intenta nuevamente.')
    } finally {
      setSubmitting(false)
    }
  }

  function usarCuentaDemo(cuenta) {
    // En mock vale cédula o correo; en real solo correo. Autocompletar correo cubre ambos.
    setIdentificador(esModoMock ? cuenta.cedula : cuenta.email)
    setPassword(cuenta.clave)
    setError('')
    setInfo('')
  }

  async function manejarOlvido(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    if (!identificador.includes('@')) {
      setError('Escribe tu correo institucional arriba para enviarte el enlace de recuperación.')
      return
    }
    if (esModoMock) {
      setInfo('La recuperación por correo solo está disponible con el backend real (auth-service).')
      return
    }
    try {
      await solicitarRecuperacion(identificador)
      setInfo('Si el correo existe, se ha enviado un enlace de restablecimiento.')
    } catch (err) {
      setError(err.message || 'No fue posible solicitar la recuperación.')
    }
  }

  return (
    <div className="uajs-login">
      <div className="uajs-login__hero" style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}>
        <div className="hero__body">
          <p className="eyebrow">Plataforma institucional</p>
          <h1 className="headline">
            Tu campus,
            <br />
            conectado en un solo lugar.
          </h1>
          <p className="subtext">
            Inicia sesión con tu cuenta institucional y accede al panel de tu perfil: estudiante,
            docente, administrativo o administrador del sistema.
          </p>
        </div>

        <NetworkGraphic />

        <p className="hero__footnote">UAJS Smart Campus — Prototipo académico · Sistemas Distribuidos</p>
      </div>

      <div className="uajs-login__panel">
        <form className="login-card" onSubmit={handleSubmit} noValidate>
          <div className="login-card__logo">
            <img src={LOGO_SRC} alt="UNIAJS - Corporación Universitaria Antonio José de Sucre" />
          </div>
          <p className="login-card__eyebrow">Bienvenido de nuevo</p>
          <h2 className="login-card__title">Inicia sesión</h2>
          <p className="login-card__subtitle">Ingresa tus credenciales institucionales para continuar.</p>

          <div className="login-card__fields">
            <TextField
              id="identificador"
              label={esModoMock ? 'Correo institucional o cédula' : 'Correo institucional'}
              type="text"
              icon={Mail}
              placeholder={esModoMock ? 'usuario@uajs.edu.co o 1102345678' : 'usuario@uajs.edu.co'}
              autoComplete="username"
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value)}
              required
            />
            <PasswordField
              id="password"
              label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="login-card__error" role="alert">
              {error}
            </p>
          )}

          {info && (
            <p className="login-card__info" role="status">
              {info}
            </p>
          )}

          <div className="login-card__row">
            <label className="login-checkbox">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span className="login-checkbox__box">
                <Check size={12} strokeWidth={3} />
              </span>
              Recordarme
            </label>
            <a className="login-link" href="#!" onClick={manejarOlvido}>
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button type="submit" className="login-submit-btn" disabled={submitting}>
            {submitting ? 'Verificando…' : 'Iniciar sesión'}
            {!submitting && <ArrowRight size={18} />}
          </button>

          <div className="login-card__demo">
            <p className="login-card__demo-title">
              Cuentas de prueba {esModoMock ? 'mock' : 'seeder'} (clic para autocompletar)
            </p>
            <ul className="login-card__demo-list">
              {CUENTAS_DEMO.map((cuenta) => (
                <li key={cuenta.email}>
                  <button type="button" className="login-card__demo-btn" onClick={() => usarCuentaDemo(cuenta)}>
                    <span className="login-card__demo-meta">
                      <strong>{cuenta.rol}{cuenta.nombre ? ` · ${cuenta.nombre}` : ''}</strong>
                      <small>{cuenta.detalle ? `${cuenta.detalle} · ` : ''}{esModoMock ? `C.C. ${cuenta.cedula}` : cuenta.email}</small>
                    </span>
                    <span className="login-card__demo-cred">
                      {cuenta.clave}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <p className="login-card__footnote">
            ¿No tienes acceso?{' '}
            <span>Contacta a la oficina de sistemas de tu dependencia.</span>
          </p>
        </form>
      </div>
    </div>
  )
}
