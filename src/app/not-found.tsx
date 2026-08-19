'use client'

import Link from 'next/link'
import { Home, Compass } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      padding: '24px',
      overflow: 'hidden',
    }}>
      {/* Background ambient glow */}
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '450px',
        height: '450px',
        background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(50px)',
        pointerEvents: 'none',
      }} />

      <div className="animate-fade-in" style={{
        maxWidth: '440px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* Icon */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 0 30px rgba(124, 58, 237, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
        }}>
          <Compass size={32} color="#a78bfa" />
        </div>

        <span className="gradient-text" style={{ fontSize: '72px', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em' }}>
          404
        </span>

        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#eeeeff', margin: '16px 0 8px', letterSpacing: '-0.02em' }}>
          Página no encontrada
        </h1>

        <p style={{ fontSize: '14px', color: '#7070a0', margin: '0 0 28px', lineHeight: 1.5 }}>
          La sección que buscás no existe o fue movida a otra ubicación.
        </p>

        <Link href="/">
          <Button leftIcon={<Home size={15} color="white" />}>
            Volver al inicio
          </Button>
        </Link>
      </div>
    </div>
  )
}
