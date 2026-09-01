import { iniciales } from '../../utils/formatters'

/**
 * Avatar circular con las iniciales del usuario. Evita depender de
 * imágenes externas para el prototipo.
 */
export default function Avatar({ nombre = '', size = 'md' }) {
  return (
    <span className={`avatar avatar--${size}`} aria-hidden="true">
      {iniciales(nombre) || '—'}
    </span>
  )
}
