/**
 * Pie de página institucional, presente en todo el panel de la
 * plataforma.
 */
export default function Footer() {
  const anioActual = new Date().getFullYear()

  return (
    <footer className="footer">
      <p className="footer__text">
        © {anioActual} Corporación Universitaria Antonio José de Sucre — UAJS Smart Campus
      </p>
      <p className="footer__text footer__text--muted">
        Prototipo académico. No sustituye los sistemas institucionales oficiales.
      </p>
    </footer>
  )
}
