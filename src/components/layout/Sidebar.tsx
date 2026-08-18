'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Wallet, Building2, RefreshCw, Target,
  CheckSquare, FolderOpen, FileText, BarChart3, Settings,
  LogOut, Zap
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const navItems = [
  { href: '/',              label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/finances',      label: 'Finanzas',       icon: Wallet },
  { href: '/accounts',      label: 'Cuentas',        icon: Building2 },
  { href: '/subscriptions', label: 'Suscripciones',  icon: RefreshCw },
  { href: '/goals',         label: 'Objetivos',      icon: Target },
  { href: '/tasks',         label: 'Tareas',         icon: CheckSquare },
  { href: '/projects',      label: 'Proyectos',      icon: FolderOpen },
  { href: '/notes',         label: 'Notas',          icon: FileText },
  { href: '/reports',       label: 'Reportes',       icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    toast.success('Sesión cerrada')
  }

  return (
    <aside style={{
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      width: '240px',
      backgroundColor: '#111117',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 40,
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '0 20px',
        height: '60px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        flexShrink: 0,
      }}>
        <div style={{
          width: '30px',
          height: '30px',
          borderRadius: '8px',
          backgroundColor: '#6366f1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Zap size={16} color="white" />
        </div>
        <span style={{
          fontWeight: 600,
          fontSize: '15px',
          color: '#f2f2f8',
          letterSpacing: '-0.01em',
        }}>
          Personal OS
        </span>
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1,
        padding: '16px 10px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
      }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#818cf8' : '#a0a0b0',
                backgroundColor: isActive ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                textDecoration: 'none',
                transition: 'background 120ms, color 120ms',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                  e.currentTarget.style.color = '#f2f2f8'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#a0a0b0'
                }
              }}
            >
              <Icon size={17} color={isActive ? '#818cf8' : '#707082'} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div style={{
        padding: '12px 10px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
        flexShrink: 0,
      }}>
        <Link
          href="/settings"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '9px 12px',
            borderRadius: '8px',
            fontSize: '13.5px',
            fontWeight: pathname === '/settings' ? 600 : 400,
            color: pathname === '/settings' ? '#818cf8' : '#a0a0b0',
            backgroundColor: pathname === '/settings' ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
            textDecoration: 'none',
          }}
        >
          <Settings size={17} color={pathname === '/settings' ? '#818cf8' : '#707082'} />
          <span>Configuración</span>
        </Link>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '9px 12px',
            borderRadius: '8px',
            fontSize: '13.5px',
            color: '#707082',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            transition: 'background 120ms, color 120ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'
            e.currentTarget.style.color = '#f87171'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = '#707082'
          }}
        >
          <LogOut size={17} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}
