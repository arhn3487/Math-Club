import type { ReactNode } from 'react'
import { AdminNavigation } from '@/components/layout/AdminNavigation'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-neutral-900">
      <AdminNavigation />
      <main>{children}</main>
    </div>
  )
}