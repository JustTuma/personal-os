'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Zap, Mail, Lock, User } from 'lucide-react'
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
      background: 'rgb(11 11 15)',
      padding: '16px',
    }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '36px', height: '36px',
            borderRadius: '10px',
            background: 'rgb(99 102 241)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={18} color="white" />
          </div>
          <span style={{ fontWeight: 600, fontSize: '18px', color: 'rgb(242 242 248)' }}>
            Personal OS
          </span>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgb(17 17 23)',
          border: '1px solid rgb(255 255 255 / 0.07)',
          borderRadius: '20px',
          padding: '28px',
        }}>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'rgb(242 242 248)', margin: 0 }}>
            Crear cuenta
          </h1>
          <p style={{ fontSize: '14px', color: 'rgb(160 160 176)', marginTop: '4px', marginBottom: '24px' }}>
            Configurá tu espacio personal
          </p>

          <form onSubmit={handleSubmit(onSubmit as never)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Nombre completo"
              type="text"
              placeholder="Juan García"
              autoComplete="name"
              leftElement={<User size={15} />}
              error={errors.full_name?.message}
              {...register('full_name')}
            />
            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
              leftElement={<Mail size={15} />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              leftElement={<Lock size={15} />}
              error={errors.password?.message}
              {...register('password')}
            />
            <Input
              label="Confirmar contraseña"
              type="password"
              placeholder="Repetí tu contraseña"
              autoComplete="new-password"
              leftElement={<Lock size={15} />}
              error={errors.confirm_password?.message}
              {...register('confirm_password')}
            />

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '10px',
                background: 'rgb(99 102 241)',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                marginTop: '4px',
              }}
            >
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '14px', color: 'rgb(100 100 115)', marginTop: '16px' }}>
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" style={{ color: 'rgb(129 140 248)', textDecoration: 'none' }}>
            Ingresá
          </Link>
        </p>
      </div>
    </div>
  )
}
