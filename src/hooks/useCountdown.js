import { useEffect, useRef, useState } from 'react'

/**
 * Custom hook: useCountdown
 *
 * Cuenta regresiva en segundos, usada en la vista de acceso (landing)
 * para redireccionar automáticamente a la página principal si el
 * usuario no realiza ninguna acción en 5 segundos, tal como lo pide la
 * actividad integrativa. Puede pausarse (por ejemplo, si el usuario
 * interactúa con la página) y expone cuánto tiempo falta para poder
 * mostrar un indicador visual.
 *
 * @param {number} totalSeconds duración total de la cuenta regresiva
 * @param {Function} onComplete callback ejecutado al llegar a 0
 */
export function useCountdown(totalSeconds, onComplete) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)
  const [isPaused, setIsPaused] = useState(false)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (isPaused) return undefined

    if (secondsLeft <= 0) {
      onCompleteRef.current?.()
      return undefined
    }

    const timerId = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timerId)
  }, [secondsLeft, isPaused])

  const pause = () => setIsPaused(true)
  const reset = () => setSecondsLeft(totalSeconds)

  return { secondsLeft, isPaused, pause, reset, progress: 1 - secondsLeft / totalSeconds }
}
