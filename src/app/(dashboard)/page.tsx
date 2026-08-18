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
  Receipt, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import type { TransactionFormValues, TransferFormValues } from '@/lib/validations/transaction'
import type { Currency } from '@/types'

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({
  label,
  value,
  currency = 'ARS',
  change,
  isLoading,
  variant = 'default',
}: {
  label: string
  value: number
  currency?: Currency
  change?: number
  isLoading?: boolean
  variant?: 'default' | 'positive' | 'negative'
}) {
  const valueColor = variant === 'positive' ? '#4ade80' : variant === 'negative' ? '#f87171' : '#f2f2f8'

  return (
    <div style={{
      backgroundColor: '#111117',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '14px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}>
      <p style={{
        fontSize: '11px',
        fontWeight: 600,
        color: '#646473',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: '10px',
      }}>
        {label}
      </p>
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ) : (
        <>
          <p style={{
            fontSize: '24px',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: valueColor,
            margin: 0,
          }}>
            {formatCurrency(value, currency)}
          </p>
          {change !== undefined && change !== 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '6px',
              fontSize: '12px',
              color: change >= 0 ? '#4ade80' : '#f87171',
            }}>
              {change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
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
    <div style={{
      backgroundColor: '#111117',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '14px',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        <h2 style={{ fontSize: '13.5px', fontWeight: 600, color: '#f2f2f8', margin: 0 }}>
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
      // Default ARS placeholder stats
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

  // Chart data — last 6 months (ARS primary)
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
            Dashboard
          </h1>
          <p style={{ fontSize: '13.5px', color: '#a0a0b0', margin: '4px 0 0' }}>
            Resumen general del mes
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ArrowRight size={15} color="#818cf8" />}
            onClick={() => setModal('transfer')}
          >
            Transferir
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<TrendingDown size={15} color="#f87171" />}
            onClick={() => setModal('expense')}
          >
            Gasto
          </Button>
          <Button
            size="sm"
            leftIcon={<Plus size={15} color="white" />}
            onClick={() => setModal('income')}
          >
            Ingreso
          </Button>
        </div>
      </div>

      {/* Financial summary — KPI stat cards */}
      {summary.map(s => (
        <div key={s.currency} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {summary.length > 1 && (
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#646473', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
              Moneda: {s.currency}
            </p>
          )}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
          }}>
            <StatCard
              label="Dinero disponible"
              value={s.accountBalance}
              currency={s.currency}
              isLoading={isLoading}
            />
            <StatCard
              label="Ingresos del mes"
              value={s.income}
              currency={s.currency}
              change={s.incomeChange}
              variant="positive"
              isLoading={isLoading}
            />
            <StatCard
              label="Gastos del mes"
              value={s.expenses}
              currency={s.currency}
              change={s.expenseChange}
              variant="negative"
              isLoading={isLoading}
            />
            <StatCard
              label="Balance neto"
              value={s.balance}
              currency={s.currency}
              variant={s.balance >= 0 ? 'default' : 'negative'}
              isLoading={isLoading}
            />
          </div>
        </div>
      ))}

      {/* Chart + Recent Activity */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px',
      }}>
        {/* Chart */}
        <div style={{ minWidth: 0 }}>
          <SectionCard title="Ingresos vs Gastos (ARS) — Últimos 6 meses">
            <div style={{ padding: '20px' }}>
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
                gap: '8px',
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '4px',
                }}>
                  <Receipt size={20} color="#646473" />
                </div>
                <p style={{ fontSize: '13.5px', fontWeight: 500, color: '#f2f2f8', margin: 0 }}>Sin movimientos</p>
                <p style={{ fontSize: '12.5px', color: '#646473', margin: 0 }}>Los registros de este mes aparecerán acá</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {recentActivity.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 20px',
                      borderBottom: idx !== recentActivity.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                      transition: 'background 120ms',
                    }}
                  >
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      backgroundColor:
                        item.type === 'income' ? 'rgba(34, 197, 94, 0.12)' :
                        item.type === 'expense' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(99, 102, 241, 0.12)',
                    }}>
                      {item.type === 'income' && <TrendingUp size={15} color="#4ade80" />}
                      {item.type === 'expense' && <TrendingDown size={15} color="#f87171" />}
                      {item.type === 'transfer' && <ArrowRight size={15} color="#818cf8" />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13.5px', fontWeight: 500, color: '#f2f2f8', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.title}
                      </p>
                      <p style={{ fontSize: '12px', color: '#646473', margin: '2px 0 0' }}>
                        {formatDateRelative(item.date)}
                      </p>
                    </div>
                    {item.amount && item.currency && (
                      <span style={{
                        fontSize: '13.5px',
                        fontWeight: 600,
                        flexShrink: 0,
                        color:
                          item.type === 'income' ? '#4ade80' :
                          item.type === 'expense' ? '#f87171' : '#818cf8',
                      }}>
                        {item.type === 'income' && '+'}
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

      {/* Upcoming Subscriptions if any */}
      {activeSubscriptions.length > 0 && (
        <SectionCard
          title="Próximos cobros de suscripciones"
          action={
            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/subscriptions'}>
              Ver suscripciones
            </Button>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', padding: '16px 20px' }}>
            {activeSubscriptions.map(sub => (
              <div
                key={sub.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: '#181820',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div>
                  <p style={{ fontSize: '13.5px', fontWeight: 600, color: '#f2f2f8', margin: 0 }}>
                    {sub.name}
                  </p>
                  <p style={{ fontSize: '12px', color: '#a0a0b0', margin: '2px 0 0' }}>
                    Vence: {sub.next_payment_date}
                  </p>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#f2f2f8' }}>
                  {formatCurrency(sub.amount, sub.currency)}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Active Financial Goals if any */}
      {activeGoals.length > 0 && (
        <SectionCard
          title="Metas de ahorro en curso"
          action={
            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/goals'}>
              Ver objetivos
            </Button>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', padding: '16px 20px' }}>
            {activeGoals.map(g => {
              const progress = Math.min(100, Math.round((g.current_amount / g.target_amount) * 100))
              return (
                <div
                  key={g.id}
                  style={{
                    padding: '14px 16px',
                    backgroundColor: '#181820',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: '13.5px', fontWeight: 600, color: '#f2f2f8', margin: 0 }}>
                      {g.name}
                    </p>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: g.color || '#818cf8' }}>
                      {progress}%
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, height: '100%', backgroundColor: g.color || '#6366f1', borderRadius: '999px' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#646473' }}>
                    <span>{formatCurrency(g.current_amount, g.currency)}</span>
                    <span>Meta: {formatCurrency(g.target_amount, g.currency)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </SectionCard>
      )}

      {/* Modals */}
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
