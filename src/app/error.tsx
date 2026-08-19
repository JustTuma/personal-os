'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

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
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          boxShadow: '0 0 30px rgba(239, 68, 68, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
        }}>
          <AlertTriangle size={32} color="#f87171" />
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#eeeeff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Ocurrió un error inesperado
        </h1>

        <p style={{ fontSize: '14px', color: '#7070a0', margin: '0 0 28px', lineHeight: 1.5 }}>
          Hubo un problema al procesar la solicitud. Podés intentar recargar la vista.
        </p>

        <Button onClick={reset} leftIcon={<RefreshCw size={15} color="white" />}>
          Reintentar
        </Button>
      </div>
    </div>
  )
}
