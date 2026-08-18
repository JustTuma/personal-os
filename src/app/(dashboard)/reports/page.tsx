'use client'

import { useState, useMemo } from 'react'
import { useTransactions } from '@/hooks/useTransactions'
import { useAccounts } from '@/hooks/useAccounts'
import { useCategories } from '@/hooks/useCategories'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { formatCurrency, formatCompact } from '@/lib/utils/currency'
import { getLastNMonths, getCurrentMonthRange } from '@/lib/utils/date'
import { IncomeExpenseChart } from '@/components/charts/IncomeExpenseChart'
import { CategoryPieChart, type CategoryExpenseData } from '@/components/charts/CategoryPieChart'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  TrendingUp, TrendingDown, PiggyBank,
  Wallet, Calendar, BarChart3, Receipt, ArrowUpRight
} from 'lucide-react'
import type { Currency, ChartDataPoint } from '@/types'
import { parseISO, isWithinInterval, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from 'date-fns'

type PeriodOption = 'current_month' | 'last_3_months' | 'last_6_months' | 'year'

const PERIOD_LABELS: Record<PeriodOption, string> = {
  current_month: 'Este mes',
  last_3_months: 'Últimos 3 meses',
  last_6_months: 'Últimos 6 meses',
  year: 'Año actual',
}

export default function ReportsPage() {
  const [currency, setCurrency] = useState<Currency>('ARS')
  const [period, setPeriod] = useState<PeriodOption>('current_month')

  const { transactions, isLoading: txLoading } = useTransactions({ limit: 1000 })
  const { accounts } = useAccounts()
  const { categories } = useCategories()
  const { subscriptions } = useSubscriptions()

  // Date range calculation
  const dateInterval = useMemo(() => {
    const now = new Date()
    switch (period) {
      case 'current_month':
        return { start: startOfMonth(now), end: endOfMonth(now) }
      case 'last_3_months':
        return { start: startOfMonth(subMonths(now, 2)), end: endOfMonth(now) }
      case 'last_6_months':
        return { start: startOfMonth(subMonths(now, 5)), end: endOfMonth(now) }
      case 'year':
        return { start: startOfYear(now), end: endOfYear(now) }
    }
  }, [period])

  // Filtered transactions for the selected period and currency
  const periodTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (t.currency !== currency) return false
      try {
        const txDate = parseISO(t.date)
        return isWithinInterval(txDate, dateInterval)
      } catch {
        return false
      }
    })
  }, [transactions, currency, dateInterval])

  // Financial KPIs for the period
  const stats = useMemo(() => {
    const totalIncome = periodTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const totalExpenses = periodTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const netSavings = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0

    // Average daily expense in the period
    const diffDays = Math.max(1, Math.round((dateInterval.end.getTime() - dateInterval.start.getTime()) / (1000 * 60 * 60 * 24)))
    const avgDailyExpense = Math.round(totalExpenses / diffDays)

    return {
      totalIncome,
      totalExpenses,
      netSavings,
      savingsRate,
      avgDailyExpense,
      txCount: periodTransactions.length,
    }
  }, [periodTransactions, dateInterval])

  // Chart data for monthly trend
  const chartData = useMemo<ChartDataPoint[]>(() => {
    const numMonths = period === 'last_6_months' ? 6 : period === 'last_3_months' ? 3 : period === 'year' ? 12 : 6
    const months = getLastNMonths(numMonths)

    return months.map(({ label, from, to }) => {
      const fromDate = parseISO(from)
      const toDate = parseISO(to)

      const monthTx = transactions.filter(t => {
        if (t.currency !== currency) return false
        try {
          const d = parseISO(t.date)
          return isWithinInterval(d, { start: fromDate, end: toDate })
        } catch {
          return false
        }
      })

      const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
      const expenses = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

      return {
        month: label,
        income,
        expenses,
        net: income - expenses,
      }
    })
  }, [transactions, currency, period])

  // Category breakdown for expenses
  const categoryBreakdown = useMemo<CategoryExpenseData[]>(() => {
    const expenseTx = periodTransactions.filter(t => t.type === 'expense')
    const totalExp = expenseTx.reduce((sum, t) => sum + Number(t.amount), 0)

    if (totalExp === 0) return []

    const map = new Map<string, { name: string; amount: number; color: string; count: number }>()

    expenseTx.forEach(t => {
      const catId = t.category_id || 'sin_categoria'
      const catObj = categories.find(c => c.id === t.category_id)
      const name = catObj ? catObj.name : 'Sin categoría'
      const color = catObj ? catObj.color : '#646473'

      const existing = map.get(catId) || { name, amount: 0, color, count: 0 }
      existing.amount += Number(t.amount)
      existing.count += 1
      map.set(catId, existing)
    })

    return Array.from(map.values())
      .map(item => ({
        ...item,
        percentage: Math.round((item.amount / totalExp) * 100),
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [periodTransactions, categories])

  // Account breakdown for expenses
  const accountBreakdown = useMemo(() => {
    const expenseTx = periodTransactions.filter(t => t.type === 'expense')
    const totalExp = expenseTx.reduce((sum, t) => sum + Number(t.amount), 0)
    if (totalExp === 0) return []

    const map = new Map<string, { name: string; amount: number; color: string; count: number }>()

    expenseTx.forEach(t => {
      const acc = accounts.find(a => a.id === t.account_id)
      const name = acc ? acc.name : 'Cuenta eliminada'
      const color = acc ? acc.color : '#6366f1'

      const existing = map.get(t.account_id) || { name, amount: 0, color, count: 0 }
      existing.amount += Number(t.amount)
      existing.count += 1
      map.set(t.account_id, existing)
    })

    return Array.from(map.values())
      .map(item => ({
        ...item,
        percentage: Math.round((item.amount / totalExp) * 100),
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [periodTransactions, accounts])

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
            Reportes y Estadísticas
          </h1>
          <p style={{ fontSize: '13.5px', color: '#a0a0b0', margin: '4px 0 0' }}>
            Análisis financiero de ingresos, gastos y hábitos de ahorro
          </p>
        </div>

        {/* Currency Switch */}
        <div style={{
          display: 'flex',
          backgroundColor: '#111117',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          padding: '3px',
        }}>
          {(['ARS', 'USD'] as Currency[]).map(curr => (
            <button
              key={curr}
              onClick={() => setCurrency(curr)}
              style={{
                padding: '6px 14px',
                borderRadius: '7px',
                border: 'none',
                backgroundColor: currency === curr ? '#6366f1' : 'transparent',
                color: currency === curr ? '#ffffff' : '#a0a0b0',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 120ms',
              }}
            >
              {curr}
            </button>
          ))}
        </div>
      </div>

      {/* Period Selector Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '8px' }}>
        {(['current_month', 'last_3_months', 'last_6_months', 'year'] as PeriodOption[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: period === p ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: period === p ? '#818cf8' : '#a0a0b0',
              fontSize: '13px',
              fontWeight: period === p ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 120ms',
            }}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
      }}>
        {/* Income */}
        <div style={{ backgroundColor: '#111117', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#646473', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
              Ingresos Totales
            </p>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={14} color="#4ade80" />
            </div>
          </div>
          <p style={{ fontSize: '22px', fontWeight: 600, color: '#4ade80', margin: 0, letterSpacing: '-0.02em' }}>
            {formatCurrency(stats.totalIncome, currency)}
          </p>
        </div>

        {/* Expenses */}
        <div style={{ backgroundColor: '#111117', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#646473', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
              Gastos Totales
            </p>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown size={14} color="#f87171" />
            </div>
          </div>
          <p style={{ fontSize: '22px', fontWeight: 600, color: '#f87171', margin: 0, letterSpacing: '-0.02em' }}>
            {formatCurrency(stats.totalExpenses, currency)}
          </p>
        </div>

        {/* Net Savings */}
        <div style={{ backgroundColor: '#111117', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#646473', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
              Balance Neto
            </p>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(99, 102, 241, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PiggyBank size={14} color="#818cf8" />
            </div>
          </div>
          <p style={{
            fontSize: '22px',
            fontWeight: 600,
            color: stats.netSavings >= 0 ? '#f2f2f8' : '#f87171',
            margin: 0,
            letterSpacing: '-0.02em',
          }}>
            {formatCurrency(stats.netSavings, currency)}
          </p>
        </div>

        {/* Savings Rate */}
        <div style={{ backgroundColor: '#111117', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#646473', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
              Tasa de Ahorro
            </p>
            <span style={{ fontSize: '11.5px', color: '#a0a0b0' }}>
              {stats.txCount} movs
            </span>
          </div>
          <p style={{
            fontSize: '22px',
            fontWeight: 600,
            color: stats.savingsRate >= 20 ? '#4ade80' : stats.savingsRate > 0 ? '#818cf8' : '#646473',
            margin: 0,
            letterSpacing: '-0.02em',
          }}>
            {stats.savingsRate}%
          </p>
        </div>
      </div>

      {/* Main Trend Chart */}
      <div style={{
        backgroundColor: '#111117',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        padding: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f2f2f8', margin: 0 }}>
              Evolución de Ingresos vs Gastos
            </h2>
            <p style={{ fontSize: '12.5px', color: '#646473', margin: '2px 0 0' }}>
              Comparativa temporal en {currency}
            </p>
          </div>
        </div>
        <IncomeExpenseChart data={chartData} currency={currency} />
      </div>

      {/* Bottom Grid: Category Breakdown + Account Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Category Breakdown */}
        <div style={{
          backgroundColor: '#111117',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f2f2f8', margin: 0 }}>
              Gastos por Categoría
            </h2>
            <p style={{ fontSize: '12.5px', color: '#646473', margin: '2px 0 0' }}>
              Distribución de egresos en el período
            </p>
          </div>

          <CategoryPieChart data={categoryBreakdown} currency={currency} />

          {/* Categories List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
            {categoryBreakdown.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#646473', textAlign: 'center', padding: '16px 0' }}>
                No hay gastos registrados en este período.
              </p>
            ) : (
              categoryBreakdown.map((cat, idx) => (
                <div
                  key={cat.name + idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: '#181820',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: cat.color }} />
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#f2f2f8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cat.name}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#f2f2f8' }}>
                      {formatCurrency(cat.amount, currency)}
                    </span>
                    <span style={{ fontSize: '12px', color: '#818cf8', fontWeight: 600, width: '36px', textAlign: 'right' }}>
                      {cat.percentage}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Account / Payment Method Breakdown */}
        <div style={{
          backgroundColor: '#111117',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f2f2f8', margin: 0 }}>
              Gastos por Cuenta
            </h2>
            <p style={{ fontSize: '12.5px', color: '#646473', margin: '2px 0 0' }}>
              Medios de pago utilizados en {currency}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            {accountBreakdown.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#646473', textAlign: 'center', padding: '16px 0' }}>
                No hay movimientos de egreso en este período.
              </p>
            ) : (
              accountBreakdown.map((acc, idx) => (
                <div
                  key={acc.name + idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    padding: '12px 14px',
                    backgroundColor: '#181820',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: acc.color }} />
                      <span style={{ fontSize: '13.5px', fontWeight: 500, color: '#f2f2f8' }}>
                        {acc.name}
                      </span>
                    </div>
                    <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#f2f2f8' }}>
                      {formatCurrency(acc.amount, currency)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${acc.percentage}%`, height: '100%', backgroundColor: acc.color, borderRadius: '999px' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#646473' }}>
                    <span>{acc.count} gasto{acc.count !== 1 ? 's' : ''}</span>
                    <span>{acc.percentage}% del total</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
