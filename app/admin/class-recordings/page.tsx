'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminClassRecordingsPage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const userType = localStorage.getItem('user_type')

    if (!token || (userType !== 'admin' && userType !== 'superuser')) {
      router.replace('/login')
      return
    }

    // Keep old route working while using the unified resource manager UI.
    router.replace('/admin/resource-sharing')
  }, [router])

  return null
}
