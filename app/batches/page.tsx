'use client'

import { useEffect, useState } from 'react'
import { Card, Button, Loading, Error } from '@/components/ui/BaseComponents'
import { Batch, Course } from '@/types'
import Link from 'next/link'

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBatches()
  }, [])

  const fetchBatches = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/batches')
      if (!response.ok) throw new Error('Failed to fetch batches')
      const data = await response.json()
      setBatches(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">Batches</h1>
          <p className="page-subtitle">Explore our learning batches</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          {loading && <Loading message="Loading batches..." />}
          {error && <Error message={error} onRetry={fetchBatches} />}

          {!loading && !error && batches.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No batches found</p>
              <Link href="/">
                <Button>Back to Home</Button>
              </Link>
            </div>
          )}

          {!loading && !error && batches.length > 0 && (
            <div className="card-grid">
              {batches.map((batch) => (
                <Link key={batch.id} href={`/batches/${batch.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold">{batch.name || 'Batch'}</h3>
                      <p className="text-gray-600 text-sm">
                        Created: {new Date(batch.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button fullWidth>View Details</Button>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
