import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useFetch } from '../hooks/useFetch'
import { getResumenDashboard } from '../services/api'
import Card from '../components/common/Card'
import Avatar from '../components/common/Avatar'
import Button from '../components/common/Button'
import LoadingSpinner from '../components/common/LoadingSpinner'

/**
 * Vista de perfil: información básica del usuario que interactúa con
 * la plataforma, un resumen de su actividad reciente y la opción de
 * cerrar sesión.
 */
export default function PerfilPage() {
  const navigate = useNavigate()
  const { usuario, cargandoUsuario, esAdmin, cerrarSesion } = useApp()
  const { data: resumen, loading: cargandoResumen } = useFetch(() => getResumenDashboard(usuario), [usuario])

  async function manejarCierreSesion() {
    await cerrarSesion()
    navigate('/login')
  }

  if (cargandoUsuario) return <LoadingSpinner label="Cargando tu perfil…" />

  return (
    <div className="perfil-page">
      <div className="perfil-page__header">
        <h1>Perfil</h1>
        <Button variant="ghost" onClick={manejarCierreSesion}>Cerrar sesión</Button>
      </div>

      <Card className="card--padded perfil-page__tarjeta">
        <Avatar nombre={usuario?.nombre} size="lg" />
        <div>
          <h2 className="perfil-page__nombre">{usuario?.nombre}</h2>
          <p className="perfil-page__rol">{usuario?.tipoUsuario} · {usuario?.programa}</p>
          <p className="perfil-page__correo">{usuario?.correo}</p>
        </div>
      </Card>

      <div className="perfil-page__grid">
        <Card className="card--padded">
          <h3 className="perfil-page__section-title">Datos académicos</h3>
          <dl className="perfil-page__fields">
            <div><dt>Código</dt><dd>{usuario?.codigo}</dd></div>
            <div><dt>Programa</dt><dd>{usuario?.programa}</dd></div>
            <div><dt>Tipo de usuario</dt><dd>{usuario?.tipoUsuario}</dd></div>
          </dl>
        </Card>

        <Card className="card--padded">
          <h3 className="perfil-page__section-title">Actividad reciente</h3>
          {cargandoResumen ? (
            <LoadingSpinner label="Calculando actividad…" />
          ) : (
            <dl className="perfil-page__fields">
              <div><dt>{esAdmin ? 'Solicitudes pendientes (todas)' : 'Solicitudes pendientes'}</dt><dd>{resumen.solicitudesPendientes}</dd></div>
              <div><dt>{esAdmin ? 'Reservas registradas (todas)' : 'Reservas realizadas'}</dt><dd>{resumen.reservasRealizadas}</dd></div>
              <div><dt>Notificaciones sin leer</dt><dd>{resumen.notificacionesNoLeidas}</dd></div>
            </dl>
          )}
        </Card>
      </div>
    </div>
  )
}
