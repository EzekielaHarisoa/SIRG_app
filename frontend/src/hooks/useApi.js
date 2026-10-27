import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * useApi — loads data from a service function and exposes loading/error/data + refetch.
 * Respects component unmount: no state updates after the component is gone.
 *
 * @param {() => Promise<any>} fetcher
 * @param {Array} deps - dependency array; refetch runs when these change
 */
export function useApi(fetcher, deps = []) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const mountedRef = useRef(true)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

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
    mountedRef.current = true
    refetch()
    return () => {
      mountedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, error, loading, refetch }
}

export default useApi
