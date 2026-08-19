'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Wallet, Target, CheckSquare, Grid3X3,
  FolderOpen, FileText, Building2, RefreshCw, BarChart3, Settings,
  HelpCircle, LogOut, ChevronRight, Sparkles, X
} from 'lucide-react'
import { TutorialModal } from '@/components/shared/TutorialModal'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const primaryNav = [
  { href: '/',         label: 'Inicio',    icon: LayoutDashboard, color: '#7c3aed' },
  { href: '/finances', label: 'Finanzas',  icon: Wallet,          color: '#10b981' },
  { href: '/goals',    label: 'Objetivos', icon: Target,          color: '#a78bfa' },
  { href: '/tasks',    label: 'Tareas',    icon: CheckSquare,     color: '#34d399' },
]

const moreNav = [
  { href: '/projects',      label: 'Proyectos',      icon: FolderOpen,  color: '#fb923c', desc: 'Avance de metas y proyectos' },
  { href: '/notes',         label: 'Notas e Ideas',  icon: FileText,    color: '#f472b6', desc: 'Bloc de notas y apuntes' },
  { href: '/accounts',      label: 'Cuentas',        icon: Building2,   color: '#0ea5e9', desc: 'Bancos, billeteras y saldos' },
  { href: '/subscriptions', label: 'Suscripciones',  icon: RefreshCw,   color: '#f59e0b', desc: 'Control de pagos fijos' },
  { href: '/reports',       label: 'Reportes',       icon: BarChart3,   color: '#60a5fa', desc: 'Estadísticas y análisis' },
  { href: '/settings',      label: 'Configuración',  icon: Settings,    color: '#818cf8', desc: 'Categorías, perfil y backup' },
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
      {/* Bottom Bar */}
      <nav
        className="md:hidden"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          backgroundColor: 'rgba(10, 10, 18, 0.92)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '6px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 6px)',
        }}
      >
        {/* Top glow line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '20%',
          right: '20%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.5), rgba(99,102,241,0.5), transparent)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 4px' }}>
          {primaryNav.map(({ href, label, icon: Icon, color }) => {
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
                  gap: '2px',
                  padding: '6px 10px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  minWidth: '56px',
                  color: isActive ? '#eeeeff' : '#55556a',
                  transition: 'all 180ms cubic-bezier(0.4,0,0.2,1)',
                  position: 'relative',
                }}
              >
                {/* Active indicator dot */}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    top: 3,
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: color,
                    boxShadow: `0 0 6px ${color}`,
                  }} />
                )}

                {/* Icon wrapper with glow */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '9px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isActive ? `${color}22` : 'transparent',
                  transition: 'all 180ms',
                }}>
                  <Icon size={20} color={isActive ? color : '#55556a'} strokeWidth={isActive ? 2.2 : 1.8} />
                </div>
                <span style={{
                  fontSize: '10px',
                  fontWeight: isActive ? 600 : 500,
                  letterSpacing: '0.01em',
                }}>
                  {label}
                </span>
              </Link>
            )
          })}

          {/* "Más" Button */}
          <button
            type="button"
            onClick={() => setDrawerOpen(!drawerOpen)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              padding: '6px 10px',
              borderRadius: '10px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              minWidth: '56px',
              color: isMoreActive || drawerOpen ? '#eeeeff' : '#55556a',
              transition: 'all 180ms',
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: drawerOpen ? 'rgba(124,58,237,0.2)' : 'transparent',
              transition: 'all 180ms',
            }}>
              {drawerOpen
                ? <X size={20} color="#a78bfa" />
                : <Grid3X3 size={20} color={isMoreActive ? '#a78bfa' : '#55556a'} strokeWidth={1.8} />
              }
            </div>
            <span style={{ fontSize: '10px', fontWeight: isMoreActive || drawerOpen ? 600 : 500 }}>
              {drawerOpen ? 'Cerrar' : 'Más'}
            </span>
          </button>
        </div>
      </nav>

      {/* Backdrop */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          className="md:hidden"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 45,
            animation: 'fadeIn 0.18s ease-out',
          }}
        />
      )}

      {/* Drawer Panel */}
      {drawerOpen && (
        <div
          className="md:hidden"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: '82vh',
            overflowY: 'auto',
            background: 'linear-gradient(180deg, #0f0f1e 0%, #0a0a14 100%)',
            borderTop: '1px solid rgba(124, 58, 237, 0.2)',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            padding: '16px 20px calc(86px + env(safe-area-inset-bottom, 16px))',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            animation: 'slideIn 0.22s cubic-bezier(0.4,0,0.2,1)',
            boxShadow: '0 -20px 60px rgba(0, 0, 0, 0.8), 0 -1px 0 rgba(124,58,237,0.2)',
          }}
        >
          {/* Gradient top glow */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '120px',
            background: 'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
          }} />

          {/* Handle */}
          <div style={{
            width: '40px',
            height: '4px',
            borderRadius: '999px',
            background: 'linear-gradient(90deg, #7c3aed, #6366f1)',
            margin: '0 auto 4px',
            boxShadow: '0 0 8px rgba(124,58,237,0.5)',
          }} />

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 12px rgba(124,58,237,0.5)',
              }}>
                <Sparkles size={15} color="white" />
              </div>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#eeeeff', letterSpacing: '-0.01em' }}>
                Todos los módulos
              </span>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              style={{
                padding: '6px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.08)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#9898b8',
                cursor: 'pointer',
                display: 'flex',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Module list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {moreNav.map(({ href, label, icon: Icon, color, desc }) => {
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
                    padding: '13px 14px',
                    borderRadius: '14px',
                    backgroundColor: isActive ? `${color}14` : 'rgba(255,255,255,0.03)',
                    border: isActive ? `1px solid ${color}40` : '1px solid rgba(255, 255, 255, 0.06)',
                    textDecoration: 'none',
                    transition: 'all 160ms',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      backgroundColor: isActive ? `${color}22` : 'rgba(255, 255, 255, 0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: isActive ? `0 0 12px ${color}44` : 'none',
                    }}>
                      <Icon size={19} color={isActive ? color : '#55556a'} strokeWidth={isActive ? 2.2 : 1.8} />
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: isActive ? '#eeeeff' : '#c8c8e8', margin: 0 }}>
                        {label}
                      </p>
                      <p style={{ fontSize: '12px', color: '#55556a', margin: '2px 0 0' }}>
                        {desc}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} color="#55556a" />
                </Link>
              )
            })}
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '8px',
            paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <button
              onClick={() => { setDrawerOpen(false); setShowTutorial(true) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '13px 14px', borderRadius: '12px',
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                border: '1px solid rgba(124, 58, 237, 0.2)',
                color: '#a78bfa', fontSize: '13.5px', fontWeight: 600,
                cursor: 'pointer', width: '100%', textAlign: 'left',
              }}
            >
              <HelpCircle size={17} />
              <span>Ver Guía de uso y tutorial</span>
            </button>

            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '13px 14px', borderRadius: '12px',
                backgroundColor: 'rgba(239, 68, 68, 0.07)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                color: '#f87171', fontSize: '13.5px', fontWeight: 500,
                cursor: 'pointer', width: '100%', textAlign: 'left',
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
