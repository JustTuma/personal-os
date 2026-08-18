'use client'

import { useState, useMemo } from 'react'
import { useFinancialGoals, type GoalWithContributions } from '@/hooks/useFinancialGoals'
import { GoalCard } from '@/components/goals/GoalCard'
import { GoalForm } from '@/components/goals/GoalForm'
import { GoalContributionModal } from '@/components/goals/GoalContributionModal'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { formatCurrency } from '@/lib/utils/currency'
import { Target, Plus } from 'lucide-react'
import type { GoalFormValues, ContributionFormValues } from '@/lib/validations/goal'

export default function GoalsPage() {
  const {
    goals,
    isLoading,
    createGoal,
    updateGoal,
    deleteGoal,
    addContribution,
  } = useFinancialGoals()

  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<GoalWithContributions | null>(null)
  const [contributing, setContributing] = useState<GoalWithContributions | null>(null)
  const [deleting, setDeleting] = useState<GoalWithContributions | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'paused'>('all')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Calculations for summary stats
  const stats = useMemo(() => {
    let totalSavedARS = 0
    let totalTargetARS = 0
    let totalSavedUSD = 0
    let totalTargetUSD = 0
    let completedCount = 0

    goals.forEach(g => {
      if (g.status === 'completed' || g.current_amount >= g.target_amount) completedCount++
      if (g.currency === 'ARS') {
        totalSavedARS += Number(g.current_amount)
        totalTargetARS += Number(g.target_amount)
      } else if (g.currency === 'USD') {
        totalSavedUSD += Number(g.current_amount)
        totalTargetUSD += Number(g.target_amount)
      }
    })

    return {
      totalSavedARS,
      totalTargetARS,
      totalSavedUSD,
      totalTargetUSD,
      completedCount,
      totalCount: goals.length,
      progressARS: totalTargetARS > 0 ? Math.round((totalSavedARS / totalTargetARS) * 100) : 0,
      progressUSD: totalTargetUSD > 0 ? Math.round((totalSavedUSD / totalTargetUSD) * 100) : 0,
    }
  }, [goals])

  // Filtered goals
  const filteredGoals = useMemo(() => {
    if (filter === 'active') return goals.filter(g => g.status === 'active')
    if (filter === 'completed') return goals.filter(g => g.status === 'completed' || g.current_amount >= g.target_amount)
    if (filter === 'paused') return goals.filter(g => g.status === 'paused')
    return goals
  }, [goals, filter])

  async function handleCreate(values: GoalFormValues) {
    setIsSubmitting(true)
    try {
      await createGoal(values)
      setShowCreate(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdate(values: GoalFormValues) {
    if (!editing) return
    setIsSubmitting(true)
    try {
      await updateGoal(editing.id, values)
      setEditing(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    setIsDeleting(true)
    try {
      await deleteGoal(deleting.id)
      setDeleting(null)
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleAddContribution(goal: GoalWithContributions, values: ContributionFormValues) {
    await addContribution(goal, values)
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
            Objetivos Financieros
          </h1>
          <p style={{ fontSize: '13.5px', color: '#a0a0b0', margin: '4px 0 0' }}>
            Seguimiento de metas de ahorro, compras y fondos
          </p>
        </div>
        <Button leftIcon={<Plus size={15} color="white" />} onClick={() => setShowCreate(true)}>
          Nuevo objetivo
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
            Ahorrado en Objetivos (ARS)
          </p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#4ade80', margin: 0, letterSpacing: '-0.02em' }}>
            {formatCurrency(stats.totalSavedARS, 'ARS')}
          </p>
          <p style={{ fontSize: '12px', color: '#646473', margin: '4px 0 0' }}>
            Meta total: {formatCurrency(stats.totalTargetARS, 'ARS')} ({stats.progressARS}%)
          </p>
        </div>

        {stats.totalTargetUSD > 0 && (
          <div style={{ backgroundColor: '#111117', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '20px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#646473', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
              Ahorrado en Objetivos (USD)
            </p>
            <p style={{ fontSize: '24px', fontWeight: 600, color: '#4ade80', margin: 0, letterSpacing: '-0.02em' }}>
              {formatCurrency(stats.totalSavedUSD, 'USD')}
            </p>
            <p style={{ fontSize: '12px', color: '#646473', margin: '4px 0 0' }}>
              Meta total: {formatCurrency(stats.totalTargetUSD, 'USD')} ({stats.progressUSD}%)
            </p>
          </div>
        )}

        <div style={{ backgroundColor: '#111117', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '20px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#646473', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
            Metas cumplidas
          </p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#f2f2f8', margin: 0, letterSpacing: '-0.02em' }}>
            {stats.completedCount} <span style={{ fontSize: '14px', fontWeight: 400, color: '#646473' }}>/ {stats.totalCount} metas</span>
          </p>
          <p style={{ fontSize: '12px', color: '#646473', margin: '4px 0 0' }}>
            {stats.totalCount - stats.completedCount} activas en curso
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      {goals.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '8px' }}>
          {(['all', 'active', 'completed', 'paused'] as const).map(tab => (
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
              {tab === 'all' && `Todas (${goals.length})`}
              {tab === 'active' && `En progreso (${goals.filter(g => g.status === 'active' && g.current_amount < g.target_amount).length})`}
              {tab === 'completed' && `Completadas (${goals.filter(g => g.status === 'completed' || g.current_amount >= g.target_amount).length})`}
              {tab === 'paused' && `Pausadas (${goals.filter(g => g.status === 'paused').length})`}
            </button>
          ))}
        </div>
      )}

      {/* Goals Grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredGoals.length === 0 ? (
        <div style={{
          backgroundColor: '#111117',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '48px 24px',
          textAlign: 'center',
        }}>
          <EmptyState
            icon={Target}
            title={filter === 'all' ? 'No tenés metas financieras todavía' : 'No hay metas en esta categoría'}
            description={filter === 'all' ? 'Creá tu primer objetivo (ej: Vacaciones, Fondo de emergencia, Comprar laptop) y empezá a sumar aportes.' : ''}
            actionLabel={filter === 'all' ? 'Crear objetivo' : undefined}
            onAction={filter === 'all' ? () => setShowCreate(true) : undefined}
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {filteredGoals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={setEditing}
              onDelete={setDeleting}
              onContribute={setContributing}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nuevo objetivo financiero">
        <GoalForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} isLoading={isSubmitting} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Editar objetivo financiero">
        {editing && (
          <GoalForm
            defaultValues={editing}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
            isLoading={isSubmitting}
          />
        )}
      </Modal>

      {/* Add Contribution Modal */}
      <GoalContributionModal
        goal={contributing}
        onClose={() => setContributing(null)}
        onSubmit={handleAddContribution}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Eliminar objetivo"
        description={`¿Querés eliminar "${deleting?.name}"? Los movimientos de tu cuenta bancaria no serán alterados.`}
      />
    </div>
  )
}
