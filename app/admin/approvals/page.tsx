'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ApprovalsPage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const userType = localStorage.getItem('user_type')

    if (!token || (userType !== 'admin' && userType !== 'superuser')) {
      router.push('/login')
      return
    }

    router.replace('/admin/users')
  }, [router])

  return null
}
