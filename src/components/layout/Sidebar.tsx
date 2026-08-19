'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { TutorialModal } from '@/components/shared/TutorialModal'
import {
  LayoutDashboard, Wallet, Building2, RefreshCw, Target,
  CheckSquare, FolderOpen, FileText, BarChart3, Settings,
  LogOut, HelpCircle, Sparkles
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const navItems = [
  { href: '/',              label: 'Dashboard',      icon: LayoutDashboard, color: '#7c3aed' },
  { href: '/finances',      label: 'Finanzas',       icon: Wallet,          color: '#10b981' },
  { href: '/accounts',      label: 'Cuentas',        icon: Building2,       color: '#0ea5e9' },
  { href: '/subscriptions', label: 'Suscripciones',  icon: RefreshCw,       color: '#f59e0b' },
  { href: '/goals',         label: 'Objetivos',      icon: Target,          color: '#a78bfa' },
  { href: '/tasks',         label: 'Tareas',         icon: CheckSquare,     color: '#34d399' },
  { href: '/projects',      label: 'Proyectos',      icon: FolderOpen,      color: '#fb923c' },
  { href: '/notes',         label: 'Notas',          icon: FileText,        color: '#f472b6' },
  { href: '/reports',       label: 'Reportes',       icon: BarChart3,       color: '#60a5fa' },
]

function NavItem({
  href, label, icon: Icon, color, isActive
}: {
  href: string; label: string; icon: React.ElementType; color: string; isActive: boolean
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '9px 11px',
        borderRadius: '10px',
        fontSize: '13.5px',
        fontWeight: isActive ? 600 : 400,
        color: isActive ? '#eeeeff' : '#7070a0',
        backgroundColor: isActive ? 'rgba(124, 58, 237, 0.14)' : 'transparent',
        textDecoration: 'none',
        transition: 'all 160ms cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        border: isActive ? '1px solid rgba(124, 58, 237, 0.25)' : '1px solid transparent',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
          e.currentTarget.style.color = '#c8c8e8'
          e.currentTarget.style.transform = 'translateX(2px)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent'
          e.currentTarget.style.color = '#7070a0'
          e.currentTarget.style.transform = 'translateX(0)'
        }
      }}
    >
      {/* Icon container */}
      <div style={{
        width: '28px',
        height: '28px',
        borderRadius: '7px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        backgroundColor: isActive ? `${color}22` : 'transparent',
        transition: 'background 160ms',
      }}>
        <Icon size={16} color={isActive ? color : '#55556a'} strokeWidth={isActive ? 2.2 : 1.8} />
      </div>
      <span style={{ letterSpacing: '-0.01em' }}>{label}</span>

      {/* Active left indicator */}
      {isActive && (
        <div style={{
          position: 'absolute',
          left: '-10px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '3px',
          height: '20px',
          borderRadius: '0 2px 2px 0',
          background: 'linear-gradient(180deg, #7c3aed, #6366f1)',
          boxShadow: '0 0 8px rgba(124, 58, 237, 0.6)',
        }} />
      )}
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [showTutorial, setShowTutorial] = useState(false)

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
      background: 'linear-gradient(180deg, #0d0d1a 0%, #09090f 100%)',
      borderRight: '1px solid rgba(255, 255, 255, 0.07)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 40,
      backdropFilter: 'blur(20px)',
    }}>

      {/* Ambient gradient top */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '200px',
        background: 'radial-gradient(ellipse 120% 60% at 50% -10%, rgba(124,58,237,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '0 16px',
        height: '60px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        flexShrink: 0,
        position: 'relative',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '9px',
          background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 0 16px rgba(124,58,237,0.4)',
        }}>
          <Sparkles size={16} color="white" />
        </div>
        <div>
          <span style={{
            fontWeight: 700,
            fontSize: '14.5px',
            color: '#eeeeff',
            letterSpacing: '-0.02em',
            display: 'block',
            lineHeight: 1.2,
          }}>
            Personal OS
          </span>
          <span style={{ fontSize: '10px', color: '#55556a', letterSpacing: '0.04em', fontWeight: 500 }}>
            Tu sistema personal
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1,
        padding: '14px 10px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        position: 'relative',
      }}>
        {navItems.map(({ href, label, icon, color }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <NavItem
              key={href}
              href={href}
              label={label}
              icon={icon}
              color={color}
              isActive={isActive}
            />
          )
        })}
      </nav>

      {/* Bottom section */}
      <div style={{
        padding: '10px 10px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        flexShrink: 0,
      }}>
        <button
          onClick={() => setShowTutorial(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '9px 11px',
            borderRadius: '10px',
            fontSize: '13px',
            color: '#7070a0',
            backgroundColor: 'transparent',
            border: '1px solid transparent',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            transition: 'all 160ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
            e.currentTarget.style.color = '#c8c8e8'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = '#7070a0'
          }}
        >
          <div style={{
            width: '28px', height: '28px', borderRadius: '7px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <HelpCircle size={16} color="#55556a" />
          </div>
          <span>Guía de uso</span>
        </button>

        <Link
          href="/settings"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '9px 11px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: pathname === '/settings' ? 600 : 400,
            color: pathname === '/settings' ? '#eeeeff' : '#7070a0',
            backgroundColor: pathname === '/settings' ? 'rgba(124, 58, 237, 0.14)' : 'transparent',
            textDecoration: 'none',
            border: pathname === '/settings' ? '1px solid rgba(124, 58, 237, 0.25)' : '1px solid transparent',
            transition: 'all 160ms',
          }}
          onMouseEnter={(e) => {
            if (pathname !== '/settings') {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
              e.currentTarget.style.color = '#c8c8e8'
            }
          }}
          onMouseLeave={(e) => {
            if (pathname !== '/settings') {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#7070a0'
            }
          }}
        >
          <div style={{
            width: '28px', height: '28px', borderRadius: '7px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: pathname === '/settings' ? 'rgba(124,58,237,0.2)' : 'transparent',
          }}>
            <Settings size={16} color={pathname === '/settings' ? '#a78bfa' : '#55556a'} />
          </div>
          <span>Configuración</span>
        </Link>

        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '9px 11px',
            borderRadius: '10px',
            fontSize: '13px',
            color: '#55556a',
            backgroundColor: 'transparent',
            border: '1px solid transparent',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            transition: 'all 160ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'
            e.currentTarget.style.color = '#f87171'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = '#55556a'
          }}
        >
          <div style={{
            width: '28px', height: '28px', borderRadius: '7px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <LogOut size={16} color="#55556a" />
          </div>
          <span>Cerrar sesión</span>
        </button>
      </div>

      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </aside>
  )
}
