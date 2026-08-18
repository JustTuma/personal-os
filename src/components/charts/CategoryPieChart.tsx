'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils/currency'
import type { Currency } from '@/types'

export interface CategoryExpenseData {
  name: string
  amount: number
  color: string
  percentage: number
  count: number
}

interface CategoryPieChartProps {
  data: CategoryExpenseData[]
  currency: Currency
}

const CustomTooltip = ({ active, payload, currency }: {
  active?: boolean
  payload?: Array<{ payload: CategoryExpenseData }>
  currency: Currency
}) => {
  if (!active || !payload?.length) return null
  const item = payload[0].payload

  return (
    <div style={{
      backgroundColor: '#181820',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: '8px',
      padding: '10px 14px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
      fontSize: '12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color }} />
        <span style={{ fontWeight: 600, color: '#f2f2f8' }}>{item.name}</span>
      </div>
      <p style={{ margin: 0, color: '#a0a0b0' }}>
        {formatCurrency(item.amount, currency)} ({item.percentage}%)
      </p>
      <p style={{ margin: '2px 0 0', color: '#646473', fontSize: '11px' }}>
        {item.count} transacción{item.count !== 1 ? 'es' : ''}
      </p>
    </div>
  )
}

export function CategoryPieChart({ data, currency }: CategoryPieChartProps) {
  if (data.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '220px', color: '#646473', fontSize: '13px' }}>
        Sin gastos en este período
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} stroke="rgba(0,0,0,0.4)" strokeWidth={1} />
            ))}
          </Pie>
          <Tooltip
            content={<CustomTooltip currency={currency} />}
            wrapperStyle={{ outline: 'none' }}
            contentStyle={{ backgroundColor: 'transparent', border: 'none', padding: 0 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
