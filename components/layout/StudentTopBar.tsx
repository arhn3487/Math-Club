'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { StudentNavigation } from '@/components/layout/StudentNavigation'

const studentRoutePrefixes = [
  '/dashboard',
  '/exams',
  '/resource-sharing',
  '/class-recordings',
  '/alumni',
  '/notices',
  '/profile',
  '/achievements',
]

export function StudentTopBar() {
  const pathname = usePathname()
  const [userType, setUserType] = useState<string | null>(null)

  useEffect(() => {
    setUserType(localStorage.getItem('user_type'))
  }, [pathname])

  if (!pathname || userType !== 'student') {
    return null
  }

  const isStudentRoute = studentRoutePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )

  if (!isStudentRoute) {
    return null
  }

  return <StudentNavigation />
}