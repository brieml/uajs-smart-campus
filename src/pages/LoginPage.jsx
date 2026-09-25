import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Lock, Eye, EyeOff, Check, ArrowRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
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

// Cuentas de prueba (ver src/data/usuarios.json) para que cualquiera
// pueda entrar a la plataforma sin depender de un backend real.
const CUENTAS_DEMO = [
  { rol: 'Estudiante', cedula: '1102345678', clave: '1234' },
  { rol: 'Docente', cedula: '7788990011', clave: '1234' },
  { rol: 'Administrativo', cedula: '4455667788', clave: '1234' },
  { rol: 'Administrador', cedula: '1000000000', clave: 'admin1234' },
]

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
 * Vista de acceso institucional. A diferencia del primer boceto, aquí
 * el formulario queda conectado a la autenticación real simulada en
 * services/api.js (contra src/data/usuarios.json): solo se entra a la
 * plataforma con una cédula y contraseña válidas.
 */
export default function LoginPage() {
  const navigate = useNavigate()
  const { iniciarSesion } = useApp()

  const [cedula, setCedula] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await iniciarSesion(cedula, password)
      navigate('/home')
    } catch (err) {
      setError(err.message || 'No fue posible iniciar sesión. Intenta nuevamente.')
    } finally {
      setSubmitting(false)
    }
  }

  function usarCuentaDemo(cuenta) {
    setCedula(cuenta.cedula)
    setPassword(cuenta.clave)
    setError('')
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
              id="cedula"
              label="Número de cédula"
              type="text"
              icon={CreditCard}
              placeholder="1102345678"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="username"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
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

          <div className="login-card__row">
            <label className="login-checkbox">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span className="login-checkbox__box">
                <Check size={12} strokeWidth={3} />
              </span>
              Recordarme
            </label>
            <a className="login-link" href="#!" onClick={(e) => e.preventDefault()}>
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button type="submit" className="login-submit-btn" disabled={submitting}>
            {submitting ? 'Verificando…' : 'Iniciar sesión'}
            {!submitting && <ArrowRight size={18} />}
          </button>

          <div className="login-card__demo">
            <p className="login-card__demo-title">Cuentas de prueba (clic para autocompletar)</p>
            <ul className="login-card__demo-list">
              {CUENTAS_DEMO.map((cuenta) => (
                <li key={cuenta.rol}>
                  <button type="button" onClick={() => usarCuentaDemo(cuenta)}>
                    <strong>{cuenta.rol}</strong>
                    <span>
                      {cuenta.cedula} / {cuenta.clave}
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
