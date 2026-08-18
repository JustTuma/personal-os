'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import type { ChartDataPoint, Currency } from '@/types'
import { formatCompact } from '@/lib/utils/currency'

interface IncomeExpenseChartProps {
  data: ChartDataPoint[]
  currency: Currency
}

const CustomTooltip = ({ active, payload, label, currency }: {
  active?: boolean
  payload?: Array<{ value: number; name: string; color: string }>
  label?: string
  currency: Currency
}) => {
  if (!active || !payload?.length) return null

  return (
    <div style={{
      backgroundColor: '#181820',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: '10px',
      padding: '12px 16px',
      boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)',
      fontSize: '12px',
      minWidth: '150px',
    }}>
      <p style={{ color: '#a0a0b0', fontWeight: 600, margin: '0 0 8px', fontSize: '13px' }}>
        {label}
      </p>
      {payload.map(entry => (
        <div key={entry.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color }} />
            <span style={{ color: '#a0a0b0', fontSize: '12px' }}>{entry.name}:</span>
          </div>
          <span style={{ color: '#f2f2f8', fontWeight: 600, fontSize: '12.5px' }}>
            {formatCompact(entry.value, currency)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function IncomeExpenseChart({ data, currency }: IncomeExpenseChartProps) {
  if (data.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '220px', color: '#646473', fontSize: '13px' }}>
        Sin datos para mostrar
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barGap={4}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255, 255, 255, 0.05)"
          vertical={false}
        />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#646473', fontSize: 11 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#646473', fontSize: 11 }}
          tickFormatter={(v: number) => formatCompact(v, currency)}
        />
        <Tooltip
          content={<CustomTooltip currency={currency} />}
          cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
          wrapperStyle={{ outline: 'none' }}
          contentStyle={{ backgroundColor: 'transparent', border: 'none', padding: 0 }}
        />
        <Legend
          wrapperStyle={{ fontSize: '12px', color: '#a0a0b0', paddingTop: '12px' }}
          iconType="circle"
          iconSize={8}
        />
        <Bar dataKey="income" name="Ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={36} />
        <Bar dataKey="expenses" name="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  )
}
