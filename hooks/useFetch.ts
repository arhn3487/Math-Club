import { useState, useEffect } from 'react'

interface UseFetchOptions {
  limit?: number
  offset?: number
  filters?: Record<string, unknown>
}

export function useFetch<T>(
  endpoint: string,
  options?: UseFetchOptions
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      let url = endpoint

      if (options?.limit || options?.offset) {
        url += `?limit=${options?.limit || 10}`
        if (options?.offset) {
          url += `&offset=${options.offset}`
        }
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error(`Failed to fetch from ${endpoint}`)

      const result = await response.json()
      setData(Array.isArray(result) ? result : [result])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [endpoint])

  return { data, loading, error, refetch: fetchData }
}

export function useFetchById<T>(endpoint: string, id: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${endpoint}?id=${id}`)
        if (!response.ok) throw new Error('Failed to fetch')
        const result = await response.json()
        setData(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [endpoint, id])

  return { data, loading, error }
}
