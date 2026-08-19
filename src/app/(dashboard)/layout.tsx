import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'transparent' }}>
      {/* Desktop sidebar */}
      <div className="hidden md:block" style={{ width: '240px', flexShrink: 0 }}>
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="dashboard-main-container flex-1 min-h-screen overflow-y-auto">
        <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
          {children}
        </div>
      </main>

      {/* Mobile nav */}
      <MobileNav />
    </div>
  )
}
