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
import { RefreshCw, Plus, Calendar, Activity } from 'lucide-react'
import type { SubscriptionWithRelations } from '@/types'
import type { SubscriptionFormValues } from '@/lib/validations/subscription'

export default function SubscriptionsPage() {
  const { subscriptions, isLoading, createSubscription, updateSubscription, deleteSubscription, toggleActive, registerPayment } = useSubscriptions()

  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<SubscriptionWithRelations | null>(null)
  const [deleting, setDeleting] = useState<SubscriptionWithRelations | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'paused'>('all')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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

    return { monthlyARS, monthlyUSD, activeCount, totalCount: subscriptions.length,
      nextPayment: nextActive ? `${nextActive.name}` : null,
      nextDate: nextActive?.next_payment_date ?? null,
    }
  }, [subscriptions])

  const filteredSubscriptions = useMemo(() => {
    if (filter === 'active') return subscriptions.filter(s => s.is_active)
    if (filter === 'paused') return subscriptions.filter(s => !s.is_active)
    return subscriptions
  }, [subscriptions, filter])

  async function handleCreate(values: SubscriptionFormValues) {
    setIsSubmitting(true)
    try { await createSubscription(values); setShowCreate(false) }
    finally { setIsSubmitting(false) }
  }

  async function handleUpdate(values: SubscriptionFormValues) {
    if (!editing) return
    setIsSubmitting(true)
    try { await updateSubscription(editing.id, values); setEditing(null) }
    finally { setIsSubmitting(false) }
  }

  async function handleDelete() {
    if (!deleting) return
    setIsDeleting(true)
    try { await deleteSubscription(deleting.id); setDeleting(null) }
    finally { setIsDeleting(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Header */}
      <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 10px', borderRadius: '999px',
            backgroundColor: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)',
            marginBottom: '10px',
          }}>
            <RefreshCw size={11} color="#f59e0b" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#fbbf24', letterSpacing: '0.04em' }}>Recurrentes</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#eeeeff', margin: 0, letterSpacing: '-0.03em' }}>Suscripciones</h1>
          <p style={{ fontSize: '13.5px', color: '#7070a0', margin: '6px 0 0' }}>Control de pagos fijos y servicios recurrentes</p>
        </div>
        <Button leftIcon={<Plus size={15} color="white" />} onClick={() => setShowCreate(true)}>
          Nueva suscripción
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger animate-slide-up">
        <div className="stat-card stat-card-negative">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#55556a', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Mensual ARS</p>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RefreshCw size={14} color="#ef4444" />
            </div>
          </div>
          <p className="gradient-text-red" style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>
            {formatCurrency(stats.monthlyARS, 'ARS')}
          </p>
          <p style={{ fontSize: '11.5px', color: '#55556a', margin: '6px 0 0' }}>Costo mensual estimado</p>
        </div>

        {stats.monthlyUSD > 0 && (
          <div className="stat-card stat-card-negative">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#55556a', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Mensual USD</p>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RefreshCw size={14} color="#ef4444" />
              </div>
            </div>
            <p className="gradient-text-red" style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>
              {formatCurrency(stats.monthlyUSD, 'USD')}
            </p>
            <p style={{ fontSize: '11.5px', color: '#55556a', margin: '6px 0 0' }}>Costo mensual estimado</p>
          </div>
        )}

        <div className="stat-card" style={{ borderColor: 'rgba(245,158,11,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#55556a', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Próximo cobro</p>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={14} color="#f59e0b" />
            </div>
          </div>
          {stats.nextPayment ? (
            <>
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#fbbf24', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {stats.nextPayment}
              </p>
              <p style={{ fontSize: '11.5px', color: '#55556a', margin: '6px 0 0' }}>{stats.nextDate}</p>
            </>
          ) : (
            <p style={{ fontSize: '14px', color: '#55556a', margin: 0 }}>Ninguno próximo</p>
          )}
        </div>

        <div className="stat-card stat-card-accent">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#55556a', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Servicios activos</p>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'rgba(124,58,237,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={14} color="#7c3aed" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <p className="gradient-text" style={{ fontSize: '28px', fontWeight: 800, margin: 0, letterSpacing: '-0.04em' }}>{stats.activeCount}</p>
            <span style={{ fontSize: '13px', color: '#55556a' }}>/ {stats.totalCount}</span>
          </div>
          <p style={{ fontSize: '11.5px', color: '#55556a', margin: '6px 0 0' }}>{stats.totalCount - stats.activeCount} pausadas</p>
        </div>
      </div>

      {/* Filter Tabs */}
      {subscriptions.length > 0 && (
        <div className="filter-tabs animate-fade-in">
          {(['all', 'active', 'paused'] as const).map(tab => (
            <button key={tab} onClick={() => setFilter(tab)} className={`filter-tab ${filter === tab ? 'filter-tab-active' : ''}`}>
              {tab === 'all' && `Todas (${subscriptions.length})`}
              {tab === 'active' && `Activas (${subscriptions.filter(s => s.is_active).length})`}
              {tab === 'paused' && `Pausadas (${subscriptions.filter(s => !s.is_active).length})`}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredSubscriptions.length === 0 ? (
        <div className="glass-card" style={{ padding: '56px 24px', textAlign: 'center' }}>
          <EmptyState
            icon={RefreshCw}
            title={filter === 'all' ? 'No tenés suscripciones registradas' : 'No hay suscripciones en este filtro'}
            description={filter === 'all' ? 'Agregá tus servicios mensuales o anuales para saber exactamente cuánto gastás.' : ''}
            actionLabel={filter === 'all' ? 'Agregar suscripción' : undefined}
            onAction={filter === 'all' ? () => setShowCreate(true) : undefined}
          />
        </div>
      ) : (
        <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {filteredSubscriptions.map((sub, i) => (
            <div key={sub.id} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
              <SubscriptionCard subscription={sub} onEdit={setEditing} onDelete={setDeleting} onToggleActive={toggleActive} onRegisterPayment={registerPayment} />
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nueva suscripción">
        <SubscriptionForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} isLoading={isSubmitting} />
      </Modal>
      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Editar suscripción">
        {editing && <SubscriptionForm defaultValues={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} isLoading={isSubmitting} />}
      </Modal>
      <ConfirmDialog isOpen={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} isLoading={isDeleting} title="Eliminar suscripción" description={`¿Querés eliminar "${deleting?.name}"? Los pagos ya registrados en tu historial de transacciones se mantendrán intactos.`} />
    </div>
  )
}
