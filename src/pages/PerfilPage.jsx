import { useApp } from '../context/AppContext'
import { useFetch } from '../hooks/useFetch'
import { getResumenDashboard } from '../services/api'
import Card from '../components/common/Card'
import Avatar from '../components/common/Avatar'
import LoadingSpinner from '../components/common/LoadingSpinner'

/**
 * Vista de perfil: información básica del usuario que interactúa con
 * la plataforma y un resumen de su actividad reciente.
 */
export default function PerfilPage() {
  const { usuario, cargandoUsuario } = useApp()
  const { data: resumen, loading: cargandoResumen } = useFetch(getResumenDashboard, [])

  if (cargandoUsuario) return <LoadingSpinner label="Cargando tu perfil…" />

  return (
    <div className="perfil-page">
      <h1>Perfil</h1>

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
              <div><dt>Solicitudes pendientes</dt><dd>{resumen.solicitudesPendientes}</dd></div>
              <div><dt>Reservas realizadas</dt><dd>{resumen.reservasRealizadas}</dd></div>
              <div><dt>Notificaciones sin leer</dt><dd>{resumen.notificacionesNoLeidas}</dd></div>
            </dl>
          )}
        </Card>
      </div>
    </div>
  )
}
