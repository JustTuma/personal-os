'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Wallet, Target, CheckSquare, BarChart3
} from 'lucide-react'

const navItems = [
  { href: '/',         label: 'Inicio',    icon: LayoutDashboard },
  { href: '/finances', label: 'Finanzas',  icon: Wallet },
  { href: '/goals',    label: 'Objetivos', icon: Target },
  { href: '/tasks',    label: 'Tareas',    icon: CheckSquare },
  { href: '/reports',  label: 'Reportes',  icon: BarChart3 },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        backgroundColor: '#111117',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '8px 4px' }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                minWidth: '52px',
                color: isActive ? '#818cf8' : '#646473',
              }}
            >
              <Icon size={18} color={isActive ? '#818cf8' : '#646473'} />
              <span style={{ fontSize: '10.5px', fontWeight: 500 }}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
