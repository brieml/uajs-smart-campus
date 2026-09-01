import { useCallback, useEffect, useState } from 'react'

/**
 * Custom hook: useFetch
 *
 * Encapsula el ciclo de vida típico de una llamada a la API (loading /
 * data / error) para no repetir useState + useEffect en cada página que
 * consulta el servicio REST simulado en `services/api.js`.
 *
 * @param {Function} fetchFn función asíncrona que retorna una promesa
 * @param {Array} deps dependencias que disparan una nueva consulta
 */
export function useFetch(fetchFn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadToken, setReloadToken] = useState(0)

  const refetch = useCallback(() => setReloadToken((t) => t + 1), [])

  useEffect(() => {
    let activo = true
    setLoading(true)
    setError(null)

    fetchFn()
      .then((resultado) => {
        if (activo) setData(resultado)
      })
      .catch((err) => {
        if (activo) setError(err)
      })
      .finally(() => {
        if (activo) setLoading(false)
      })

    return () => {
      activo = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadToken])

  return { data, loading, error, refetch }
}
