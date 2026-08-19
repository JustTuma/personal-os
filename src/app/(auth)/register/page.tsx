'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Zap, Mail, Lock, User, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'

const registerSchema = z.object({
  full_name: z.string().min(2, 'Ingresá tu nombre completo'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirm_password: z.string(),
}).refine(data => data.password === data.confirm_password, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm_password'],
})
type RegisterValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema) as never,
  })

  async function onSubmit(values: RegisterValues) {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: { data: { full_name: values.full_name } },
      })
      if (error) {
        toast.error(error.message)
        return
      }
      toast.success('¡Cuenta creada! Ingresando...')
      router.push('/')
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

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
      {/* Ambient background glow orb */}
      <div style={{
        position: 'absolute',
        top: '25%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, rgba(99,102,241,0.06) 50%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(40px)',
        pointerEvents: 'none',
      }} />

      <div className="animate-fade-in" style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 1 }}>

        {/* Logo & Brand */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '28px',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
            boxShadow: '0 0 24px rgba(124,58,237,0.4), inset 0 1px 1px rgba(255,255,255,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Zap size={24} color="white" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{
              fontWeight: 800,
              fontSize: '22px',
              color: '#eeeeff',
              letterSpacing: '-0.03em',
            }}>
              Personal <span className="gradient-text">OS</span>
            </span>
            <p style={{ fontSize: '13px', color: '#7070a0', margin: '4px 0 0' }}>
              Comenzá a potenciar tu día a día
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="glass-card" style={{
          padding: '32px 28px',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1)',
        }}>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#eeeeff', margin: 0, letterSpacing: '-0.02em' }}>
            Crear cuenta
          </h1>
          <p style={{ fontSize: '13px', color: '#7070a0', marginTop: '4px', marginBottom: '24px' }}>
            Configurá tu espacio personal en segundos
          </p>

          <form onSubmit={handleSubmit(onSubmit as never)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Nombre completo"
              type="text"
              placeholder="Juan García"
              autoComplete="name"
              leftElement={<User size={15} color="#7070a0" />}
              error={errors.full_name?.message}
              {...register('full_name')}
            />
            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
              leftElement={<Mail size={15} color="#7070a0" />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              leftElement={<Lock size={15} color="#7070a0" />}
              error={errors.password?.message}
              {...register('password')}
            />
            <Input
              label="Confirmar contraseña"
              type="password"
              placeholder="Repetí tu contraseña"
              autoComplete="new-password"
              leftElement={<Lock size={15} color="#7070a0" />}
              error={errors.confirm_password?.message}
              {...register('confirm_password')}
            />

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
                boxShadow: '0 0 16px rgba(124,58,237,0.35)',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 180ms ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: isLoading ? 0.7 : 1,
                marginTop: '6px',
              }}
              onMouseEnter={e => {
                if (!isLoading) {
                  e.currentTarget.style.boxShadow = '0 0 24px rgba(124,58,237,0.55)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }
              }}
              onMouseLeave={e => {
                if (!isLoading) {
                  e.currentTarget.style.boxShadow = '0 0 16px rgba(124,58,237,0.35)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }
              }}
            >
              {isLoading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                  Creando cuenta...
                </>
              ) : (
                <>
                  Crear cuenta
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '13.5px', color: '#7070a0', marginTop: '20px' }}>
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'none' }}>
            Ingresá acá
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
