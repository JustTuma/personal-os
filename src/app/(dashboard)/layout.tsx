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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0b0b0f' }}>
      {/* Desktop sidebar */}
      <div className="hidden md:block" style={{ width: '240px', flexShrink: 0 }}>
        <Sidebar />
      </div>

      {/* Main content */}
      <main style={{
        flex: 1,
        minHeight: '100vh',
        backgroundColor: '#0b0b0f',
        padding: '28px 32px 64px',
        overflowY: 'auto',
      }}>
        <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
          {children}
        </div>
      </main>

      {/* Mobile nav */}
      <MobileNav />
    </div>
  )
}
