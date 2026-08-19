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
import { Target, Plus, CheckCircle2, TrendingUp } from 'lucide-react'
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

  const filterTabs = [
    { key: 'all' as const, label: `Todas`, count: goals.length },
    { key: 'active' as const, label: `En progreso`, count: goals.filter(g => g.status === 'active' && g.current_amount < g.target_amount).length },
    { key: 'completed' as const, label: `Completadas`, count: goals.filter(g => g.status === 'completed' || g.current_amount >= g.target_amount).length },
    { key: 'paused' as const, label: `Pausadas`, count: goals.filter(g => g.status === 'paused').length },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* ── Header ── */}
      <div className="animate-fade-in" style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '999px',
            backgroundColor: 'rgba(167,139,250,0.12)',
            border: '1px solid rgba(167,139,250,0.25)',
            marginBottom: '10px',
          }}>
            <Target size={11} color="#a78bfa" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#a78bfa', letterSpacing: '0.04em' }}>
              Metas financieras
            </span>
          </div>

          <h1 style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#eeeeff',
            margin: 0,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          }}>
            Objetivos
          </h1>
          <p style={{ fontSize: '13.5px', color: '#7070a0', margin: '6px 0 0' }}>
            Seguimiento de metas de ahorro, compras y fondos
          </p>
        </div>

        <Button
          leftIcon={<Plus size={15} color="white" />}
          onClick={() => setShowCreate(true)}
        >
          Nuevo objetivo
        </Button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger animate-slide-up">

        {/* ARS saved */}
        <div className="stat-card stat-card-positive" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#55556a', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Ahorrado (ARS)
            </p>
            <div style={{
              width: '30px', height: '30px', borderRadius: '8px',
              backgroundColor: 'rgba(16,185,129,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <TrendingUp size={15} color="#10b981" />
            </div>
          </div>
          <p className="gradient-text-green" style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>
            {formatCurrency(stats.totalSavedARS, 'ARS')}
          </p>
          <div style={{ marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#7070a0', marginBottom: '6px' }}>
              <span>Progreso total</span>
              <span style={{ fontWeight: 600, color: '#34d399' }}>{stats.progressARS}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill progress-fill-green" style={{ width: `${stats.progressARS}%` }} />
            </div>
            <p style={{ fontSize: '11.5px', color: '#55556a', margin: '6px 0 0' }}>
              Meta: {formatCurrency(stats.totalTargetARS, 'ARS')}
            </p>
          </div>
        </div>

        {/* USD saved (conditional) */}
        {stats.totalTargetUSD > 0 && (
          <div className="stat-card stat-card-accent">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#55556a', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Ahorrado (USD)
              </p>
              <div style={{
                width: '30px', height: '30px', borderRadius: '8px',
                backgroundColor: 'rgba(124,58,237,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <TrendingUp size={15} color="#7c3aed" />
              </div>
            </div>
            <p className="gradient-text" style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>
              {formatCurrency(stats.totalSavedUSD, 'USD')}
            </p>
            <div style={{ marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#7070a0', marginBottom: '6px' }}>
                <span>Progreso total</span>
                <span style={{ fontWeight: 600, color: '#a78bfa' }}>{stats.progressUSD}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${stats.progressUSD}%` }} />
              </div>
              <p style={{ fontSize: '11.5px', color: '#55556a', margin: '6px 0 0' }}>
                Meta: {formatCurrency(stats.totalTargetUSD, 'USD')}
              </p>
            </div>
          </div>
        )}

        {/* Completed count */}
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#55556a', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Metas cumplidas
            </p>
            <div style={{
              width: '30px', height: '30px', borderRadius: '8px',
              backgroundColor: 'rgba(52,211,153,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckCircle2 size={15} color="#34d399" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <p style={{ fontSize: '36px', fontWeight: 800, color: '#eeeeff', margin: 0, letterSpacing: '-0.04em' }}>
              {stats.completedCount}
            </p>
            <span style={{ fontSize: '14px', color: '#55556a', fontWeight: 500 }}>
              / {stats.totalCount}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#7070a0', margin: '8px 0 0' }}>
            {stats.totalCount - stats.completedCount} activas en curso
          </p>
          {stats.totalCount > 0 && (
            <div style={{ marginTop: '10px' }}>
              <div className="progress-track">
                <div
                  className="progress-fill progress-fill-green"
                  style={{ width: `${Math.round((stats.completedCount / stats.totalCount) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      {goals.length > 0 && (
        <div className="filter-tabs animate-fade-in">
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`filter-tab ${filter === tab.key ? 'filter-tab-active' : ''}`}
            >
              {tab.label}
              <span style={{
                marginLeft: '5px',
                fontSize: '11px',
                fontWeight: 600,
                opacity: 0.7,
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ── Goals Grid ── */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="glass-card" style={{ padding: '56px 24px', textAlign: 'center' }}>
          <EmptyState
            icon={Target}
            title={filter === 'all' ? 'No tenés metas financieras todavía' : 'No hay metas en esta categoría'}
            description={filter === 'all' ? 'Creá tu primer objetivo (ej: Vacaciones, Fondo de emergencia, Comprar laptop) y empezá a sumar aportes.' : ''}
            actionLabel={filter === 'all' ? 'Crear objetivo' : undefined}
            onAction={filter === 'all' ? () => setShowCreate(true) : undefined}
          />
        </div>
      ) : (
        <div
          className="stagger"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}
        >
          {filteredGoals.map((goal, i) => (
            <div key={goal.id} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
              <GoalCard
                goal={goal}
                onEdit={setEditing}
                onDelete={setDeleting}
                onContribute={setContributing}
              />
            </div>
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
