import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * useApi — loads data from a service function and exposes loading/error/data + refetch.
 * The refetch function can be called manually (for example after a mutation).
 * Respects component unmount: no state updates after the component is gone.
 *
 * @param {() => Promise<any>} fetcher
 * @param {Array} deps - dependency array; re-fetch runs when these change
 * @param {boolean} [skip=false] - if true, the initial fetch is skipped and data stays null
 */
export function useApi(fetcher, deps = [], skip = false) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(!skip)

  const mountedRef = useRef(true)
  const fetcherRef = useRef(fetcher)

  // `loading` démarré à `!skip` gère le skip sans état supplémentaire.
  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetcherRef.current()
      if (mountedRef.current) {
        setData(result)
        setLoading(false)
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err)
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    if (skip) return
    mountedRef.current = true
    let ignore = false

    const run = async () => {
      try {
        const result = await fetcherRef.current()
        if (!ignore && mountedRef.current) {
          setData(result)
          setLoading(false)
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err)
          setLoading(false)
        }
      }
    }

    run()

    return () => {
      mountedRef.current = false
      ignore = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, error, loading, refetch }
}

export default useApi
