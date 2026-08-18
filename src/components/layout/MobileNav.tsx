'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Wallet, Target, CheckSquare, Menu, X,
  FolderOpen, FileText, Building2, RefreshCw, BarChart3, Settings,
  HelpCircle, LogOut, ChevronRight
} from 'lucide-react'
import { TutorialModal } from '@/components/shared/TutorialModal'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const primaryNav = [
  { href: '/',         label: 'Inicio',    icon: LayoutDashboard },
  { href: '/finances', label: 'Finanzas',  icon: Wallet },
  { href: '/goals',    label: 'Objetivos', icon: Target },
  { href: '/tasks',    label: 'Tareas',    icon: CheckSquare },
]

const moreNav = [
  { href: '/projects',      label: 'Proyectos',      icon: FolderOpen,  desc: 'Avance de metas y proyectos' },
  { href: '/notes',         label: 'Notas e Ideas',  icon: FileText,    desc: 'Bloc de notas y apuntes' },
  { href: '/accounts',      label: 'Cuentas',        icon: Building2,   desc: 'Bancos, billeteras y saldos' },
  { href: '/subscriptions', label: 'Suscripciones',  icon: RefreshCw,   desc: 'Control de pagos fijos' },
  { href: '/reports',       label: 'Reportes',       icon: BarChart3,   desc: 'Estadísticas y análisis' },
  { href: '/settings',      label: 'Configuración',  icon: Settings,   desc: 'Categorías, perfil y backup' },
]

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)

  const isMoreActive = moreNav.some(item => pathname.startsWith(item.href))

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setDrawerOpen(false)
    router.push('/login')
    toast.success('Sesión cerrada')
  }

  return (
    <>
      {/* Bottom Bar for Mobile */}
      <nav
        className="md:hidden"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          backgroundColor: 'rgba(17, 17, 23, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: 'max(8px, env(safe-area-inset-bottom, 12px))',
          paddingTop: '6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 6px' }}>
          {primaryNav.map(({ href, label, icon: Icon }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)

            return (
              <Link
                key={href}
                href={href}
                onClick={() => setDrawerOpen(false)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 10px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  minWidth: '56px',
                  color: isActive ? '#818cf8' : '#707082',
                  transition: 'color 120ms',
                }}
              >
                <Icon size={20} color={isActive ? '#818cf8' : '#707082'} />
                <span style={{ fontSize: '11px', fontWeight: isActive ? 600 : 500 }}>{label}</span>
              </Link>
            )
          })}

          {/* "Más" Drawer Trigger Button */}
          <button
            type="button"
            onClick={() => setDrawerOpen(!drawerOpen)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 10px',
              borderRadius: '10px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              minWidth: '56px',
              color: isMoreActive || drawerOpen ? '#818cf8' : '#707082',
            }}
          >
            {drawerOpen ? <X size={20} color="#818cf8" /> : <Menu size={20} color={isMoreActive ? '#818cf8' : '#707082'} />}
            <span style={{ fontSize: '11px', fontWeight: isMoreActive || drawerOpen ? 600 : 500 }}>
              {drawerOpen ? 'Cerrar' : 'Más'}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Backdrop */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          className="md:hidden"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 45,
            animation: 'fadeIn 0.15s ease-out',
          }}
        />
      )}

      {/* Mobile Drawer Panel */}
      {drawerOpen && (
        <div
          className="md:hidden"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: '80vh',
            overflowY: 'auto',
            backgroundColor: '#111117',
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            padding: '16px 20px calc(80px + env(safe-area-inset-bottom, 16px))',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            animation: 'slideIn 0.18s ease-out',
            boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.8)',
          }}
        >
          {/* Drawer Handle */}
          <div style={{
            width: '36px',
            height: '4px',
            borderRadius: '999px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            margin: '0 auto 6px',
          }} />

          {/* Drawer Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src="/icon-192.png"
                alt="Personal OS"
                style={{ width: '26px', height: '26px', borderRadius: '6px', objectFit: 'cover' }}
              />
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#f2f2f8' }}>
                Todos los módulos
              </span>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              style={{
                padding: '6px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                color: '#a0a0b0',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Modules List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {moreNav.map(({ href, label, icon: Icon, desc }) => {
              const isActive = pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setDrawerOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    backgroundColor: isActive ? 'rgba(99, 102, 241, 0.12)' : '#181820',
                    border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                    textDecoration: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      backgroundColor: isActive ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Icon size={18} color={isActive ? '#818cf8' : '#a0a0b0'} />
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: isActive ? '#818cf8' : '#f2f2f8', margin: 0 }}>
                        {label}
                      </p>
                      <p style={{ fontSize: '12px', color: '#646473', margin: '2px 0 0' }}>
                        {desc}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} color="#646473" />
                </Link>
              )
            })}
          </div>

          {/* Action buttons (Guía de uso & Logout) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <button
              onClick={() => {
                setDrawerOpen(false)
                setShowTutorial(true)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '10px',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                color: '#818cf8',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
              }}
            >
              <HelpCircle size={17} />
              <span>Ver Guía de uso y tutorial</span>
            </button>

            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '10px',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                fontSize: '13.5px',
                fontWeight: 500,
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
              }}
            >
              <LogOut size={17} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}

      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </>
  )
}
