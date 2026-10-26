import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Generic data-fetching hook.
 *
 * @param {Function} fetcher - () => Promise<data>. Called on mount and whenever
 *   `deps` change. Must return a Promise; rejected values become `error`.
 * @param {Array} deps - Dependency array for re-fetching (like useEffect deps).
 * @returns {{ data, error, loading, refetch }}
 */
export function useApi(fetcher, deps = []) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  // Guard against setting state after unmount / after a newer call.
  const requestId = useRef(0)

  const run = useCallback(() => {
    const id = ++requestId.current
    setLoading(true)
    setError(null)
    fetcher()
      .then((result) => {
        if (id !== requestId.current) return
        setData(result)
        setLoading(false)
      })
      .catch((err) => {
        if (id !== requestId.current) return
        setError(err)
        setLoading(false)
      })
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    run()
    return () => {
      // Invalidate any in-flight call on unmount.
      requestId.current++
    }
  }, [run])

  return { data, error, loading, refetch: run }
}
