import { AdminNavigation } from '@/components/layout/AdminNavigation'

export default function SuperuserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="page-shell">
      <AdminNavigation />
      <main>{children}</main>
    </div>
  )
}