'use client'

import { useMemo, useState } from 'react'
import { useAccounts } from '@/hooks/useAccounts'
import { useTransactions, useTransfers } from '@/hooks/useTransactions'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { useFinancialGoals } from '@/hooks/useFinancialGoals'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDateRelative, getCurrentMonthRange, getPreviousMonthRange, getLastNMonths } from '@/lib/utils/date'
import { IncomeExpenseChart } from '@/components/charts/IncomeExpenseChart'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { TransactionForm } from '@/components/finances/TransactionForm'
import { TransferForm } from '@/components/finances/TransferForm'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  TrendingUp, TrendingDown, ArrowRight, Plus,
  Receipt, ArrowUpRight, ArrowDownRight, Wallet,
  Target, RefreshCw, Sparkles
} from 'lucide-react'
import type { TransactionFormValues, TransferFormValues } from '@/lib/validations/transaction'
import type { Currency } from '@/types'

// ── Greeting ─────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

function getMonthLabel() {
  return new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
}

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({
  label,
  value,
  currency = 'ARS',
  change,
  isLoading,
  variant = 'default',
  icon: Icon,
}: {
  label: string
  value: number
  currency?: Currency
  change?: number
  isLoading?: boolean
  variant?: 'default' | 'positive' | 'negative' | 'accent'
  icon?: React.ElementType
}) {
  const cardClass =
    variant === 'positive' ? 'stat-card stat-card-positive animate-slide-up' :
    variant === 'negative' ? 'stat-card stat-card-negative animate-slide-up' :
    variant === 'accent'   ? 'stat-card stat-card-accent animate-slide-up' :
    'stat-card animate-slide-up'

  const valueClass =
    variant === 'positive' ? 'gradient-text-green' :
    variant === 'negative' ? 'gradient-text-red' :
    variant === 'accent'   ? 'gradient-text' : ''

  const iconColor =
    variant === 'positive' ? '#10b981' :
    variant === 'negative' ? '#ef4444' :
    variant === 'accent'   ? '#7c3aed' : '#7070a0'

  const iconBg =
    variant === 'positive' ? 'rgba(16,185,129,0.12)' :
    variant === 'negative' ? 'rgba(239,68,68,0.12)' :
    variant === 'accent'   ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.05)'

  return (
    <div className={cardClass}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
        <p style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#55556a',
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
        }}>
          {label}
        </p>
        {Icon && (
          <div style={{
            width: '30px', height: '30px', borderRadius: '8px',
            backgroundColor: iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={15} color={iconColor} />
          </div>
        )}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ) : (
        <>
          <p className={valueClass} style={{
            fontSize: '26px',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            margin: 0,
            color: !valueClass ? '#eeeeff' : undefined,
          }}>
            {formatCurrency(value, currency)}
          </p>
          {change !== undefined && change !== 0 && (
            <div className={`tag ${change >= 0 ? 'tag-positive' : 'tag-negative'}`} style={{ marginTop: '10px', width: 'fit-content' }}>
              {change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              <span>{Math.abs(change).toFixed(0)}% vs mes anterior</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Section Card ───────────────────────────────────────────────
function SectionCard({ title, children, action }: {
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="section-card animate-fade-in">
      <div className="section-card-header">
        <h2 style={{ fontSize: '13.5px', fontWeight: 600, color: '#eeeeff', margin: 0 }}>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────
export default function DashboardPage() {
  const [modal, setModal] = useState<'income' | 'expense' | 'transfer' | null>(null)

  const { accounts, isLoading: accountsLoading } = useAccounts()
  const monthRange = getCurrentMonthRange()
  const prevRange = getPreviousMonthRange()
  const last6Months = getLastNMonths(6)

  const { transactions: currentTx, isLoading: txLoading, createTransaction } = useTransactions({
    from: monthRange.from,
    to: monthRange.to,
  })
  const { transfers: currentTr, createTransfer } = useTransfers({
    from: monthRange.from,
    to: monthRange.to,
  })
  const { transactions: prevTx } = useTransactions({
    from: prevRange.from,
    to: prevRange.to,
  })
  const { transactions: allTx } = useTransactions({ limit: 200 })
  const { subscriptions } = useSubscriptions()
  const { goals } = useFinancialGoals()

  const activeGoals = useMemo(() => {
    return goals
      .filter(g => g.status === 'active' && g.current_amount < g.target_amount)
      .slice(0, 3)
  }, [goals])

  const activeSubscriptions = useMemo(() => {
    return subscriptions
      .filter(s => s.is_active)
      .sort((a, b) => new Date(a.next_payment_date).getTime() - new Date(b.next_payment_date).getTime())
      .slice(0, 4)
  }, [subscriptions])

  // Financial summary by currency
  const summary = useMemo(() => {
    const currencies: Currency[] = ['ARS', 'USD']
    const results = currencies.map(currency => {
      const txThisCurrency = currentTx.filter(t => t.currency === currency)
      const prevTxCurrency = prevTx.filter(t => t.currency === currency)
      const income  = txThisCurrency.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const expenses = txThisCurrency.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      const prevIncome  = prevTxCurrency.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const prevExpenses = prevTxCurrency.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

      const accountBalance = accounts
        .filter(a => a.currency === currency)
        .reduce((s, a) => s + a.current_balance, 0)

      return {
        currency,
        income,
        expenses,
        balance: income - expenses,
        accountBalance,
        incomeChange: prevIncome > 0 ? ((income - prevIncome) / prevIncome) * 100 : 0,
        expenseChange: prevExpenses > 0 ? ((expenses - prevExpenses) / prevExpenses) * 100 : 0,
        hasData: income > 0 || expenses > 0 || accountBalance !== 0,
      }
    })

    const filtered = results.filter(s => s.hasData)
    if (filtered.length === 0) {
      return [{
        currency: 'ARS' as Currency,
        income: 0,
        expenses: 0,
        balance: 0,
        accountBalance: 0,
        incomeChange: 0,
        expenseChange: 0,
        hasData: true,
      }]
    }
    return filtered
  }, [currentTx, prevTx, accounts])

  // Chart data
  const chartData = useMemo(() => {
    return last6Months.map(({ from, to, label }) => {
      const monthTx = allTx.filter(t => t.currency === 'ARS' && t.date >= from && t.date <= to)
      return {
        month: label,
        income:   monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expenses: monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      }
    })
  }, [allTx, last6Months])

  // Recent activity
  const recentActivity = useMemo(() => {
    const items = [
      ...currentTx.slice(0, 6).map(t => ({
        id: t.id,
        type: t.type as 'income' | 'expense',
        title: t.description,
        subtitle: t.account?.name ?? null,
        amount: t.amount,
        currency: t.currency,
        date: t.date,
      })),
      ...currentTr.slice(0, 3).map(t => ({
        id: t.id,
        type: 'transfer' as const,
        title: t.description ?? 'Transferencia',
        subtitle: `${t.from_account?.name} → ${t.to_account?.name}`,
        amount: t.amount,
        currency: t.currency,
        date: t.date,
      })),
    ]
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6)
  }, [currentTx, currentTr])

  const isLoading = accountsLoading || txLoading

  async function handleCreateTransaction(values: TransactionFormValues) {
    await createTransaction(values)
    setModal(null)
  }
  async function handleCreateTransfer(values: TransferFormValues) {
    await createTransfer(values)
    setModal(null)
  }

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
          {/* Greeting pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '999px',
            backgroundColor: 'rgba(124,58,237,0.12)',
            border: '1px solid rgba(124,58,237,0.22)',
            marginBottom: '10px',
          }}>
            <Sparkles size={11} color="#a78bfa" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#a78bfa', letterSpacing: '0.04em' }}>
              {getGreeting()}
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
            Dashboard
          </h1>
          <p style={{ fontSize: '13.5px', color: '#7070a0', margin: '6px 0 0', textTransform: 'capitalize' }}>
            Resumen de {getMonthLabel()}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ArrowRight size={14} color="#818cf8" />}
            onClick={() => setModal('transfer')}
          >
            Transferir
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<TrendingDown size={14} color="#f87171" />}
            onClick={() => setModal('expense')}
          >
            Gasto
          </Button>
          <Button
            size="sm"
            leftIcon={<Plus size={14} color="white" />}
            onClick={() => setModal('income')}
          >
            Ingreso
          </Button>
        </div>
      </div>

      {/* ── KPI Stat Cards ── */}
      {summary.map(s => (
        <div key={s.currency} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {summary.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ height: '1px', flex: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#55556a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {s.currency}
              </span>
              <div style={{ height: '1px', flex: 1, background: 'var(--border)' }} />
            </div>
          )}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full stagger">
            <StatCard
              label="Dinero disponible"
              value={s.accountBalance}
              currency={s.currency}
              isLoading={isLoading}
              icon={Wallet}
              variant="accent"
            />
            <StatCard
              label="Ingresos del mes"
              value={s.income}
              currency={s.currency}
              change={s.incomeChange}
              variant="positive"
              isLoading={isLoading}
              icon={TrendingUp}
            />
            <StatCard
              label="Gastos del mes"
              value={s.expenses}
              currency={s.currency}
              change={s.expenseChange}
              variant="negative"
              isLoading={isLoading}
              icon={TrendingDown}
            />
            <StatCard
              label="Balance neto"
              value={s.balance}
              currency={s.currency}
              variant={s.balance >= 0 ? 'default' : 'negative'}
              isLoading={isLoading}
              icon={ArrowUpRight}
            />
          </div>
        </div>
      ))}

      {/* ── Chart + Recent Activity ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 w-full">
        {/* Chart */}
        <div style={{ minWidth: 0 }}>
          <SectionCard title="Ingresos vs Gastos (ARS) — Últimos 6 meses">
            <div className="p-2 sm:p-5">
              <IncomeExpenseChart data={chartData} currency="ARS" />
            </div>
          </SectionCard>
        </div>

        {/* Recent Activity */}
        <div style={{ minWidth: 0 }}>
          <SectionCard
            title="Actividad reciente"
            action={
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/finances'}>
                Ver todo
              </Button>
            }
          >
            {recentActivity.length === 0 ? (
              <div style={{
                padding: '48px 20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '14px',
                  backgroundColor: 'rgba(124,58,237,0.1)',
                  border: '1px solid rgba(124,58,237,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '4px',
                }}>
                  <Receipt size={22} color="#7c3aed" />
                </div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#eeeeff', margin: 0 }}>Sin movimientos</p>
                <p style={{ fontSize: '13px', color: '#55556a', margin: 0 }}>Los registros de este mes aparecerán acá</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {recentActivity.map((item, idx) => (
                  <div
                    key={item.id}
                    className="activity-item"
                    style={{
                      borderBottom: idx !== recentActivity.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    }}
                  >
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      backgroundColor:
                        item.type === 'income'   ? 'rgba(16, 185, 129, 0.12)' :
                        item.type === 'expense'  ? 'rgba(239, 68, 68, 0.12)'  : 'rgba(124, 58, 237, 0.12)',
                    }}>
                      {item.type === 'income'   && <TrendingUp size={16} color="#34d399" />}
                      {item.type === 'expense'  && <TrendingDown size={16} color="#f87171" />}
                      {item.type === 'transfer' && <ArrowRight size={16} color="#a78bfa" />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: '13.5px', fontWeight: 500, color: '#eeeeff', margin: 0,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {item.title}
                      </p>
                      <p style={{ fontSize: '12px', color: '#55556a', margin: '2px 0 0' }}>
                        {formatDateRelative(item.date)}
                      </p>
                    </div>
                    {item.amount && item.currency && (
                      <span style={{
                        fontSize: '13.5px',
                        fontWeight: 700,
                        flexShrink: 0,
                        color:
                          item.type === 'income'   ? '#34d399' :
                          item.type === 'expense'  ? '#f87171' : '#a78bfa',
                      }}>
                        {item.type === 'income'  && '+'}
                        {item.type === 'expense' && '-'}
                        {formatCurrency(item.amount, item.currency)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      {/* ── Upcoming Subscriptions ── */}
      {activeSubscriptions.length > 0 && (
        <SectionCard
          title="Próximos cobros de suscripciones"
          action={
            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/subscriptions'}>
              Ver suscripciones
            </Button>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
            {activeSubscriptions.map(sub => (
              <div
                key={sub.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '13px 16px',
                  backgroundColor: 'rgba(245,158,11,0.06)',
                  borderRadius: '12px',
                  border: '1px solid rgba(245,158,11,0.15)',
                  transition: 'border-color 150ms',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(245,158,11,0.15)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    backgroundColor: 'rgba(245,158,11,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <RefreshCw size={15} color="#f59e0b" />
                  </div>
                  <div>
                    <p style={{ fontSize: '13.5px', fontWeight: 600, color: '#eeeeff', margin: 0 }}>
                      {sub.name}
                    </p>
                    <p style={{ fontSize: '11.5px', color: '#7070a0', margin: '2px 0 0' }}>
                      Vence: {sub.next_payment_date}
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#fbbf24', flexShrink: 0 }}>
                  {formatCurrency(sub.amount, sub.currency)}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* ── Active Financial Goals ── */}
      {activeGoals.length > 0 && (
        <SectionCard
          title="Metas de ahorro en curso"
          action={
            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/goals'}>
              Ver objetivos
            </Button>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
            {activeGoals.map(g => {
              const progress = Math.min(100, Math.round((g.current_amount / g.target_amount) * 100))
              const goalColor = g.color || '#7c3aed'
              return (
                <div
                  key={g.id}
                  style={{
                    padding: '16px',
                    backgroundColor: `${goalColor}0d`,
                    borderRadius: '14px',
                    border: `1px solid ${goalColor}25`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    transition: 'border-color 160ms, box-shadow 160ms',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = `${goalColor}50`
                    e.currentTarget.style.boxShadow = `0 0 16px ${goalColor}18`
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = `${goalColor}25`
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '7px',
                        backgroundColor: `${goalColor}22`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Target size={14} color={goalColor} />
                      </div>
                      <p style={{ fontSize: '13.5px', fontWeight: 600, color: '#eeeeff', margin: 0 }}>
                        {g.name}
                      </p>
                    </div>
                    <span style={{
                      fontSize: '12px', fontWeight: 700,
                      color: goalColor,
                      background: `${goalColor}18`,
                      padding: '2px 8px', borderRadius: '999px',
                    }}>
                      {progress}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${progress}%`,
                        background: `linear-gradient(90deg, ${goalColor}cc, ${goalColor})`,
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#7070a0' }}>
                    <span style={{ fontWeight: 500 }}>{formatCurrency(g.current_amount, g.currency)}</span>
                    <span>Meta: {formatCurrency(g.target_amount, g.currency)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </SectionCard>
      )}

      {/* ── Modals ── */}
      <Modal
        isOpen={modal === 'income' || modal === 'expense'}
        onClose={() => setModal(null)}
        title={modal === 'income' ? 'Registrar ingreso' : 'Registrar gasto'}
      >
        <TransactionForm
          defaultType={modal === 'income' ? 'income' : 'expense'}
          onSubmit={handleCreateTransaction}
          onCancel={() => setModal(null)}
        />
      </Modal>

      <Modal isOpen={modal === 'transfer'} onClose={() => setModal(null)} title="Transferencia entre cuentas">
        <TransferForm onSubmit={handleCreateTransfer} onCancel={() => setModal(null)} />
      </Modal>
    </div>
  )
}
