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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 10px', borderRadius: '999px',
            backgroundColor: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.25)',
            marginBottom: '10px',
          }}>
            <BarChart3 size={11} color="#60a5fa" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#60a5fa', letterSpacing: '0.04em' }}>Análisis</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#eeeeff', margin: 0, letterSpacing: '-0.03em' }}>
            Reportes
          </h1>
          <p style={{ fontSize: '13.5px', color: '#7070a0', margin: '6px 0 0' }}>
            Análisis financiero de ingresos, gastos y hábitos de ahorro
          </p>
        </div>

        {/* Currency Switch */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-card)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--border-medium)',
          borderRadius: '999px',
          padding: '3px',
        }}>
          {(['ARS', 'USD'] as Currency[]).map(curr => (
            <button
              key={curr}
              onClick={() => setCurrency(curr)}
              style={{
                padding: '6px 16px',
                borderRadius: '999px',
                border: 'none',
                background: currency === curr ? 'linear-gradient(135deg, #7c3aed, #6366f1)' : 'transparent',
                color: currency === curr ? '#ffffff' : '#7070a0',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 180ms',
                boxShadow: currency === curr ? '0 0 12px rgba(124,58,237,0.4)' : 'none',
              }}
            >
              {curr}
            </button>
          ))}
        </div>
      </div>

      {/* Period Selector Tabs */}
      <div className="filter-tabs animate-fade-in">
        {(['current_month', 'last_3_months', 'last_6_months', 'year'] as PeriodOption[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`filter-tab ${period === p ? 'filter-tab-active' : ''}`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger animate-slide-up">
        <div className="stat-card stat-card-positive">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#55556a', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>Ingresos Totales</p>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={14} color="#10b981" />
            </div>
          </div>
          <p className="gradient-text-green" style={{ fontSize: '22px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
            {formatCurrency(stats.totalIncome, currency)}
          </p>
        </div>

        <div className="stat-card stat-card-negative">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#55556a', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>Gastos Totales</p>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown size={14} color="#ef4444" />
            </div>
          </div>
          <p className="gradient-text-red" style={{ fontSize: '22px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
            {formatCurrency(stats.totalExpenses, currency)}
          </p>
        </div>

        <div className={`stat-card ${stats.netSavings >= 0 ? 'stat-card-accent' : 'stat-card-negative'}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#55556a', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>Balance Neto</p>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PiggyBank size={14} color="#7c3aed" />
            </div>
          </div>
          <p className={stats.netSavings >= 0 ? 'gradient-text' : 'gradient-text-red'} style={{ fontSize: '22px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
            {formatCurrency(stats.netSavings, currency)}
          </p>
        </div>

        <div className={`stat-card ${stats.savingsRate >= 20 ? 'stat-card-positive' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#55556a', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>Tasa de Ahorro</p>
            <span className="tag tag-accent" style={{ fontSize: '11px' }}>{stats.txCount} movs</span>
          </div>
          <p style={{
            fontSize: '28px', fontWeight: 800,
            color: stats.savingsRate >= 20 ? '#34d399' : stats.savingsRate > 0 ? '#a78bfa' : '#55556a',
            margin: 0, letterSpacing: '-0.03em',
          }}>
            {stats.savingsRate}%
          </p>
        </div>
      </div>

      {/* Main Trend Chart */}
      <div className="section-card animate-fade-in">
        <div className="section-card-header">
          <div>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#eeeeff', margin: 0 }}>
              Evolución de Ingresos vs Gastos
            </h2>
            <p style={{ fontSize: '12px', color: '#55556a', margin: '2px 0 0' }}>
              Comparativa temporal en {currency}
            </p>
          </div>
        </div>
        <div style={{ padding: '20px' }}>
          <IncomeExpenseChart data={chartData} currency={currency} />
        </div>
      </div>

      {/* Bottom Grid: Category Breakdown + Account Breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
      }}>
        {/* Category Breakdown */}
        <div className="section-card animate-slide-up">
          <div className="section-card-header">
            <div>
              <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#eeeeff', margin: 0 }}>
                Gastos por Categoría
              </h2>
              <p style={{ fontSize: '12px', color: '#55556a', margin: '2px 0 0' }}>
                Distribución de egresos en el período
              </p>
            </div>
          </div>

          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <CategoryPieChart data={categoryBreakdown} currency={currency} />

            {/* Categories List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {categoryBreakdown.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#55556a', textAlign: 'center', padding: '16px 0' }}>
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
                      padding: '10px 14px',
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                      <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: cat.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#eeeeff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cat.name}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#eeeeff' }}>
                        {formatCurrency(cat.amount, currency)}
                      </span>
                      <span style={{ fontSize: '11.5px', color: '#a78bfa', fontWeight: 600, width: '36px', textAlign: 'right' }}>
                        {cat.percentage}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Account / Payment Method Breakdown */}
        <div className="section-card animate-slide-up">
          <div className="section-card-header">
            <div>
              <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#eeeeff', margin: 0 }}>
                Gastos por Cuenta
              </h2>
              <p style={{ fontSize: '12px', color: '#55556a', margin: '2px 0 0' }}>
                Medios de pago utilizados en {currency}
              </p>
            </div>
          </div>

          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {accountBreakdown.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#55556a', textAlign: 'center', padding: '16px 0' }}>
                No hay movimientos de egreso en este período.
              </p>
            ) : (
              accountBreakdown.map((acc, idx) => (
                <div
                  key={acc.name + idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    padding: '12px 14px',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: acc.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#eeeeff' }}>
                        {acc.name}
                      </span>
                    </div>
                    <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#eeeeff' }}>
                      {formatCurrency(acc.amount, currency)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="progress-track" style={{ height: '5px' }}>
                    <div style={{ width: `${acc.percentage}%`, height: '100%', backgroundColor: acc.color, borderRadius: '999px' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#55556a' }}>
                    <span>{acc.count} gasto{acc.count !== 1 ? 's' : ''}</span>
                    <span style={{ color: '#a78bfa', fontWeight: 600 }}>{acc.percentage}% del total</span>
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
