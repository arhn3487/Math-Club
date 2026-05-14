'use client'

import { useParams } from 'next/navigation'
import { useFetchById } from '@/hooks/useFetch'
import { AlumniMember } from '@/types'
import { Loading, Error, Button, Card, Badge } from '@/components/ui/BaseComponents'
import Link from 'next/link'

export default function AlumniDetailPage() {
  const params = useParams()
  const alumniId = params?.id as string
  const { data: alumni, loading, error } = useFetchById<AlumniMember>(
    '/api/alumni',
    alumniId
  )

  return (
    <div className="w-full">
      {loading && <Loading message="Loading alumni details..." />}
      {error && <Error message={error} />}

      {alumni && (
        <>
          <section className="page-header">
            <div className="container">
              <h1 className="page-title">{alumni.full_name}</h1>
              <p className="page-subtitle">
                {alumni.position_in_club || 'Club Member'}
              </p>
            </div>
          </section>

          <section className="py-12">
            <div className="container">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="md:col-span-1 flex justify-center">
                  {alumni.image_url ? (
                    <img
                      src={alumni.image_url}
                      alt={alumni.full_name}
                      className="w-48 h-48 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-48 h-48 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-4xl text-gray-600">👤</span>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Card className="mb-6">
                    <h2 className="text-2xl font-bold mb-4">Information</h2>
                    <div className="space-y-4">
                      {alumni.position_in_club && (
                        <div>
                          <p className="text-gray-600 text-sm">Club Position</p>
                          <p className="text-lg font-semibold">
                            {alumni.position_in_club}
                          </p>
                        </div>
                      )}
                      {alumni.designation && (
                        <div>
                          <p className="text-gray-600 text-sm">Current Designation</p>
                          <p className="text-lg font-semibold">
                            {alumni.designation}
                          </p>
                        </div>
                      )}
                      {alumni.company_name && (
                        <div>
                          <p className="text-gray-600 text-sm">Company</p>
                          <p className="text-lg font-semibold">
                            {alumni.company_name}
                          </p>
                        </div>
                      )}
                      {alumni.cf_handle && (
                        <div>
                          <p className="text-gray-600 text-sm">Codeforces Handle</p>
                          <p className="text-lg font-mono">
                            <a
                              href={`https://codeforces.com/profile/${alumni.cf_handle}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {alumni.cf_handle}
                            </a>
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>

                  <div className="flex gap-4 flex-wrap">
                    {alumni.linkedin_url && (
                      <a
                        href={alumni.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button>LinkedIn Profile</Button>
                      </a>
                    )}
                    <Link href="/alumni">
                      <Button variant="secondary">Back to Alumni</Button>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <Card>
                  <p className="text-gray-600 text-sm mb-2">Alumni ID</p>
                  <p className="text-lg font-mono truncate">{alumni.id}</p>
                </Card>
                <Card>
                  <p className="text-gray-600 text-sm mb-2">Joined</p>
                  <p className="text-lg">
                    {alumni.created_at
                      ? new Date(alumni.created_at).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </Card>
                <Card>
                  <p className="text-gray-600 text-sm mb-2">Club Year</p>
                  <p className="text-lg">
                    {alumni.club_position_year ? `Year ${alumni.club_position_year}` : 'N/A'}
                  </p>
                </Card>
                <Card>
                  <p className="text-gray-600 text-sm mb-2">Status</p>
                  <p className="text-lg font-bold text-blue-600">
                    {alumni.highlight ? '⭐ Featured' : 'Active'}
                  </p>
                </Card>
              </div>

              <div className="flex gap-4">
                <Link href="/alumni">
                  <Button>Back to Alumni</Button>
                </Link>
                <Link href="/">
                  <Button variant="secondary">Home</Button>
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
