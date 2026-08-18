'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import {
  LayoutDashboard, Wallet, Building2, RefreshCw, Target,
  CheckSquare, FolderOpen, FileText, BarChart3, Settings,
  ArrowRight, ArrowLeft, Check, Sparkles, HelpCircle
} from 'lucide-react'

interface TutorialStep {
  title: string
  subtitle: string
  icon: React.ComponentType<{ size?: number; color?: string }>
  iconBg: string
  iconColor: string
  content: string[]
  proTip?: string
}

const STEPS: TutorialStep[] = [
  {
    title: 'Bienvenido a Personal OS',
    subtitle: 'Tu centro de control financiero y de productividad',
    icon: Sparkles,
    iconBg: 'rgba(99, 102, 241, 0.15)',
    iconColor: '#818cf8',
    content: [
      'Personal OS centraliza todas tus finanzas, proyectos, tareas y notas en una sola plataforma privada y ultrarrápida.',
      'Funciona con separación estricta entre ARS y USD para que nunca se mezclen cotizaciones ni monedas.',
      'Podés instalarla en tu iPhone o Android como una app nativa desde Safari o Chrome.',
    ],
    proTip: 'Podés reabrir esta guía en cualquier momento desde el botón "?" en la barra lateral.',
  },
  {
    title: '1. Cuentas y Billeteras',
    subtitle: 'El punto de partida de tu dinero',
    icon: Building2,
    iconBg: 'rgba(59, 130, 246, 0.15)',
    iconColor: '#60a5fa',
    content: [
      'Creá primero tus cuentas reales (ej: Mercado Pago, Banco Santander, Efectivo, Caja de Ahorro USD).',
      'El saldo se recalcula en tiempo real automáticamente con cada ingreso, gasto o transferencia que registres.',
    ],
    proTip: 'Definí un saldo inicial al crear cada cuenta para que refleje exactamente tu dinero actual.',
  },
  {
    title: '2. Finanzas (Ingresos, Gastos y Transferencias)',
    subtitle: 'Registrá tus movimientos diarios',
    icon: Wallet,
    iconBg: 'rgba(34, 197, 94, 0.15)',
    iconColor: '#4ade80',
    content: [
      'Ingreso: Suma saldo a una cuenta y computa en tus métricas positivas del mes.',
      'Gasto: Descuenta saldo de la cuenta elegida y clasifica según la categoría asignada.',
      'Transferencia: Mueve dinero entre dos cuentas de la misma moneda SIN alterar tus ingresos ni gastos globales (principio contable estricto).',
    ],
    proTip: 'Usá los botones rápidos "+ Ingreso" y "- Gasto" en la parte superior derecha del Dashboard.',
  },
  {
    title: '3. Suscripciones y Recurrentes',
    subtitle: 'Controlá tus gastos fijos mensuales',
    icon: RefreshCw,
    iconBg: 'rgba(168, 85, 247, 0.15)',
    iconColor: '#c084fc',
    content: [
      'Anotá tus servicios mensuales o anuales (Netflix, Spotify, ChatGPT, Gimnasio, Alquiler).',
      'La app te avisa cuántos días faltan para el próximo vencimiento y calcula tu costo fijo total en ARS y USD.',
      'Al hacer clic en "Pagar", se crea el gasto automáticamente en tu cuenta y la fecha se pospone al siguiente período.',
    ],
    proTip: 'Si suspendés un servicio temporalmente, podés pausarlo para que no sume al gasto mensual estimado.',
  },
  {
    title: '4. Objetivos Financieros',
    subtitle: 'Alcanzá tus metas de ahorro paso a paso',
    icon: Target,
    iconBg: 'rgba(236, 72, 153, 0.15)',
    iconColor: '#f472b6',
    content: [
      'Creá metas con monto objetivo, moneda y fecha límite (ej: "Viaje", "MacBook", "Fondo de emergencia").',
      'Hacé clic en "+ Aporte" para sumar dinero. Podés optar por descontarlo automáticamente de una cuenta bancaria o registrar un ahorro externo.',
      'La app te muestra el porcentaje completado, cuánto dinero te falta y los días restantes.',
    ],
    proTip: 'Al llegar al 100%, la meta se marcará automáticamente como completada.',
  },
  {
    title: '5. Tareas y Proyectos',
    subtitle: 'Organización y foco diario',
    icon: CheckSquare,
    iconBg: 'rgba(245, 158, 11, 0.15)',
    iconColor: '#fbbf24',
    content: [
      'Tareas: Anotá pendientes rápidamente escribiendo y presionando Enter. Asigná prioridades (Urgente, Alta, Media, Baja) y fechas de entrega.',
      'Proyectos: Agrupá tareas bajo un mismo objetivo. La barra de avance del proyecto se completa automáticamente a medida que vas tildando sus tareas.',
    ],
    proTip: 'Podés filtrar tareas por proyecto o por estado para concentrarte en lo que urge.',
  },
  {
    title: '6. Notas e Ideas',
    subtitle: 'Tu bloc de notas personal y rápido',
    icon: FileText,
    iconBg: 'rgba(6, 182, 212, 0.15)',
    iconColor: '#22d3ee',
    content: [
      'Guardá ideas, borradores, contraseñas o apuntes rápidos.',
      'Fijá las notas más importantes al inicio con el botón de la chincheta (Pin).',
      'Buscador en vivo que filtra instantáneamente por título o contenido mientras escribís.',
    ],
  },
  {
    title: '7. Reportes y Configuración',
    subtitle: 'Analizá tu progreso y respaldá tu información',
    icon: BarChart3,
    iconBg: 'rgba(99, 102, 241, 0.15)',
    iconColor: '#818cf8',
    content: [
      'Reportes: Descubrí en qué categorías gastás más (gráfico Donut), cuál es tu tasa de ahorro del mes y qué medios de pago utilizás.',
      'Configuración: Creá categorías personalizadas con colores propios, cambiá tu contraseña y descargá backups completos en JSON o CSV.',
    ],
    proTip: 'Descargá un backup en CSV para analizar tus movimientos en Excel si lo necesitás.',
  },
]

export function TutorialModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)

  const step = STEPS[currentStep]
  const Icon = step.icon
  const isLast = currentStep === STEPS.length - 1

  function handleNext() {
    if (isLast) {
      onClose()
    } else {
      setCurrentStep(s => s + 1)
    }
  }

  function handlePrev() {
    setCurrentStep(s => Math.max(0, s - 1))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '4px 0' }}>
        
        {/* Header Icon + Title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: step.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon size={24} color={step.iconColor} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#f2f2f8', margin: 0, letterSpacing: '-0.01em' }}>
              {step.title}
            </h2>
            <p style={{ fontSize: '13px', color: '#a0a0b0', margin: '3px 0 0' }}>
              {step.subtitle}
            </p>
          </div>
        </div>

        {/* Content list */}
        <div style={{
          backgroundColor: '#181820',
          borderRadius: '12px',
          padding: '16px 18px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          {step.content.map((point, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: step.iconColor,
                marginTop: '7px',
                flexShrink: 0,
              }} />
              <p style={{ fontSize: '13.5px', color: '#f2f2f8', margin: 0, lineHeight: 1.55 }}>
                {point}
              </p>
            </div>
          ))}

          {step.proTip && (
            <div style={{
              marginTop: '4px',
              paddingTop: '10px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Tip pro:
              </span>
              <span style={{ fontSize: '12.5px', color: '#a0a0b0' }}>
                {step.proTip}
              </span>
            </div>
          )}
        </div>

        {/* Progress indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          {STEPS.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              style={{
                width: currentStep === index ? '20px' : '6px',
                height: '6px',
                borderRadius: '999px',
                backgroundColor: currentStep === index ? '#6366f1' : 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 200ms ease',
                padding: 0,
              }}
            />
          ))}
        </div>

        {/* Footer actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px' }}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            disabled={currentStep === 0}
            leftIcon={<ArrowLeft size={14} />}
          >
            Anterior
          </Button>

          <span style={{ fontSize: '12px', color: '#646473', fontWeight: 500 }}>
            {currentStep + 1} de {STEPS.length}
          </span>

          <Button
            type="button"
            size="sm"
            onClick={handleNext}
            rightIcon={isLast ? <Check size={14} /> : <ArrowRight size={14} />}
          >
            {isLast ? '¡Empezar a usar!' : 'Siguiente'}
          </Button>
        </div>

      </div>
    </Modal>
  )
}
