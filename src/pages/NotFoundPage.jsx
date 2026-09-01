import { Link } from 'react-router-dom'

/**
 * Página 404 para rutas que no existen dentro de la aplicación.
 */
export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <p className="not-found-page__code">404</p>
      <h1 className="not-found-page__title">Esta página no existe</h1>
      <p className="not-found-page__description">
        Verifica la dirección o vuelve al panel principal de UAJS Smart Campus.
      </p>
      <Link to="/home" className="not-found-page__link">Volver al inicio</Link>
    </div>
  )
}
