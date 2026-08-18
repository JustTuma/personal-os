'use client'

import { useState, useMemo } from 'react'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { SubscriptionCard } from '@/components/subscriptions/SubscriptionCard'
import { SubscriptionForm } from '@/components/subscriptions/SubscriptionForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { formatCurrency } from '@/lib/utils/currency'
import { RefreshCw, Plus, Calendar, AlertCircle } from 'lucide-react'
import type { SubscriptionWithRelations } from '@/types'
import type { SubscriptionFormValues } from '@/lib/validations/subscription'

export default function SubscriptionsPage() {
  const {
    subscriptions,
    isLoading,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    toggleActive,
    registerPayment,
  } = useSubscriptions()

  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<SubscriptionWithRelations | null>(null)
  const [deleting, setDeleting] = useState<SubscriptionWithRelations | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'paused'>('all')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Calculations for KPI cards
  const stats = useMemo(() => {
    let monthlyARS = 0
    let monthlyUSD = 0
    let activeCount = 0

    subscriptions.forEach(sub => {
      if (!sub.is_active) return
      activeCount++

      let monthly = sub.amount
      if (sub.frequency === 'annual') monthly = sub.amount / 12
      if (sub.frequency === 'weekly') monthly = sub.amount * 4.33
      if (sub.frequency === 'custom' && sub.custom_days) monthly = (sub.amount / sub.custom_days) * 30

      if (sub.currency === 'ARS') monthlyARS += monthly
      if (sub.currency === 'USD') monthlyUSD += monthly
    })

    const nextActive = subscriptions
      .filter(s => s.is_active)
      .sort((a, b) => new Date(a.next_payment_date).getTime() - new Date(b.next_payment_date).getTime())[0]

    return {
      monthlyARS,
      monthlyUSD,
      activeCount,
      totalCount: subscriptions.length,
      nextPayment: nextActive ? `${nextActive.name} (${nextActive.next_payment_date})` : 'Ninguno próximo',
    }
  }, [subscriptions])

  // Filtered subscriptions
  const filteredSubscriptions = useMemo(() => {
    if (filter === 'active') return subscriptions.filter(s => s.is_active)
    if (filter === 'paused') return subscriptions.filter(s => !s.is_active)
    return subscriptions
  }, [subscriptions, filter])

  async function handleCreate(values: SubscriptionFormValues) {
    setIsSubmitting(true)
    try {
      await createSubscription(values)
      setShowCreate(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdate(values: SubscriptionFormValues) {
    if (!editing) return
    setIsSubmitting(true)
    try {
      await updateSubscription(editing.id, values)
      setEditing(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    setIsDeleting(true)
    try {
      await deleteSubscription(deleting.id)
      setDeleting(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#f2f2f8', margin: 0, letterSpacing: '-0.02em' }}>
            Suscripciones
          </h1>
          <p style={{ fontSize: '13.5px', color: '#a0a0b0', margin: '4px 0 0' }}>
            Control de pagos fijos y servicios recurrentes
          </p>
        </div>
        <Button leftIcon={<Plus size={15} color="white" />} onClick={() => setShowCreate(true)}>
          Nueva suscripción
        </Button>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
      }}>
        <div style={{ backgroundColor: '#111117', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '20px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#646473', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
            Recurrente mensual (ARS)
          </p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#f2f2f8', margin: 0, letterSpacing: '-0.02em' }}>
            {formatCurrency(stats.monthlyARS, 'ARS')}
          </p>
          <p style={{ fontSize: '12px', color: '#646473', margin: '4px 0 0' }}>
            Costo mensual estimado
          </p>
        </div>

        {stats.monthlyUSD > 0 && (
          <div style={{ backgroundColor: '#111117', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '20px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#646473', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
              Recurrente mensual (USD)
            </p>
            <p style={{ fontSize: '24px', fontWeight: 600, color: '#f2f2f8', margin: 0, letterSpacing: '-0.02em' }}>
              {formatCurrency(stats.monthlyUSD, 'USD')}
            </p>
            <p style={{ fontSize: '12px', color: '#646473', margin: '4px 0 0' }}>
              Costo mensual estimado
            </p>
          </div>
        )}

        <div style={{ backgroundColor: '#111117', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '20px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#646473', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
            Próximo vencimiento
          </p>
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#a5b4fc', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {stats.nextPayment}
          </p>
          <p style={{ fontSize: '12px', color: '#646473', margin: '4px 0 0' }}>
            Cobro más cercano
          </p>
        </div>

        <div style={{ backgroundColor: '#111117', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '20px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#646473', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
            Estado de servicios
          </p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#f2f2f8', margin: 0, letterSpacing: '-0.02em' }}>
            {stats.activeCount} <span style={{ fontSize: '14px', fontWeight: 400, color: '#646473' }}>/ {stats.totalCount} activas</span>
          </p>
          <p style={{ fontSize: '12px', color: '#646473', margin: '4px 0 0' }}>
            {stats.totalCount - stats.activeCount} pausadas
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      {subscriptions.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '8px' }}>
          {(['all', 'active', 'paused'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: filter === tab ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: filter === tab ? '#818cf8' : '#a0a0b0',
                fontSize: '13px',
                fontWeight: filter === tab ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 120ms',
              }}
            >
              {tab === 'all' && `Todas (${subscriptions.length})`}
              {tab === 'active' && `Activas (${subscriptions.filter(s => s.is_active).length})`}
              {tab === 'paused' && `Pausadas (${subscriptions.filter(s => !s.is_active).length})`}
            </button>
          ))}
        </div>
      )}

      {/* Subscriptions Grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredSubscriptions.length === 0 ? (
        <div style={{
          backgroundColor: '#111117',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '48px 24px',
          textAlign: 'center',
        }}>
          <EmptyState
            icon={RefreshCw}
            title={filter === 'all' ? 'No tenés suscripciones registradas' : 'No hay suscripciones en este filtro'}
            description={filter === 'all' ? 'Agregá tus servicios mensuales o anuales para saber exactamente cuánto gastás.' : ''}
            actionLabel={filter === 'all' ? 'Agregar suscripción' : undefined}
            onAction={filter === 'all' ? () => setShowCreate(true) : undefined}
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {filteredSubscriptions.map(sub => (
            <SubscriptionCard
              key={sub.id}
              subscription={sub}
              onEdit={setEditing}
              onDelete={setDeleting}
              onToggleActive={toggleActive}
              onRegisterPayment={registerPayment}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nueva suscripción">
        <SubscriptionForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} isLoading={isSubmitting} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Editar suscripción">
        {editing && (
          <SubscriptionForm
            defaultValues={editing}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
            isLoading={isSubmitting}
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Eliminar suscripción"
        description={`¿Querés eliminar "${deleting?.name}"? Los pagos ya registrados en tu historial de transacciones se mantendrán intactos.`}
      />
    </div>
  )
}
