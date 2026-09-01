/**
 * Campo de formulario reutilizable (texto, select o textarea) usado
 * en los modales de registro de solicitudes y reservas.
 */
export default function FormField({
  label,
  type = 'text',
  as = 'input',
  options = [],
  value,
  onChange,
  required = false,
  ...rest
}) {
  const id = `field-${label?.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div className="form-field">
      <label htmlFor={id} className="form-field__label">
        {label} {required && <span className="form-field__required">*</span>}
      </label>

      {as === 'select' ? (
        <select id={id} className="form-field__control" value={value} onChange={onChange} required={required} {...rest}>
          {options.map((opcion) => (
            <option key={opcion} value={opcion}>{opcion}</option>
          ))}
        </select>
      ) : as === 'textarea' ? (
        <textarea id={id} className="form-field__control form-field__control--textarea" value={value} onChange={onChange} required={required} {...rest} />
      ) : (
        <input id={id} type={type} className="form-field__control" value={value} onChange={onChange} required={required} {...rest} />
      )}
    </div>
  )
}
