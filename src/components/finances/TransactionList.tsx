'use client'

import { useState } from 'react'
import { TransactionWithRelations, TransferWithRelations } from '@/types'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDateRelative } from '@/lib/utils/date'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonRow } from '@/components/ui/Skeleton'
import { TrendingUp, TrendingDown, ArrowRight, Trash2, Receipt } from 'lucide-react'

type ActivityItem =
  | ({ itemType: 'transaction' } & TransactionWithRelations)
  | ({ itemType: 'transfer' } & TransferWithRelations)

interface TransactionListProps {
  transactions: TransactionWithRelations[]
  transfers: TransferWithRelations[]
  isLoading: boolean
  onDeleteTransaction: (id: string) => Promise<void>
  onDeleteTransfer: (id: string) => Promise<void>
}

export function TransactionList({
  transactions,
  transfers,
  isLoading,
  onDeleteTransaction,
  onDeleteTransfer,
}: TransactionListProps) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'transaction' | 'transfer' } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const items: ActivityItem[] = [
    ...transactions.map(t => ({ ...t, itemType: 'transaction' as const })),
    ...transfers.map(t => ({ ...t, itemType: 'transfer' as const })),
  ].sort((a, b) => {
    const dateA = new Date(a.date + 'T' + a.created_at.slice(11)).getTime()
    const dateB = new Date(b.date + 'T' + b.created_at.slice(11)).getTime()
    return dateB - dateA
  })

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      if (deleteTarget.type === 'transaction') await onDeleteTransaction(deleteTarget.id)
      else await onDeleteTransfer(deleteTarget.id)
      setDeleteTarget(null)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', padding: '8px 20px', gap: '2px' }}>
        {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <EmptyState
          icon={Receipt}
          title="No hay movimientos todavía"
          description="Registrá tu primer ingreso, gasto o transferencia para ver el historial."
        />
      </div>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1

          if (item.itemType === 'transaction') {
            const isIncome = item.type === 'income'
            const iconBg = isIncome ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)'
            const iconColor = isIncome ? '#10b981' : '#ef4444'
            const amountColor = isIncome ? '#34d399' : '#f87171'
            const amountPrefix = isIncome ? '+' : '-'

            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '13px 20px',
                  borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.05)',
                  transition: 'background 150ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                {/* Icon */}
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, backgroundColor: iconBg,
                }}>
                  {isIncome
                    ? <TrendingUp size={15} color={iconColor} />
                    : <TrendingDown size={15} color={iconColor} />
                  }
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13.5px', fontWeight: 500, color: '#eeeeff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11.5px', color: '#55556a' }}>
                      {formatDateRelative(item.date)}
                    </span>
                    {item.account && (
                      <>
                        <span style={{ fontSize: '11px', color: '#383848' }}>·</span>
                        <span style={{ fontSize: '11.5px', color: '#7070a0' }}>{item.account.name}</span>
                      </>
                    )}
                    {item.category && (
                      <>
                        <span style={{ fontSize: '11px', color: '#383848' }}>·</span>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center',
                          fontSize: '11px', fontWeight: 500,
                          color: item.category.color || '#7070a0',
                          background: `${item.category.color || '#7070a0'}15`,
                          padding: '1px 6px', borderRadius: '4px',
                        }}>
                          {item.category.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Amount */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: amountColor, letterSpacing: '-0.01em' }}>
                    {amountPrefix}{formatCurrency(item.amount, item.currency)}
                  </span>
                </div>

                {/* Delete */}
                <button
                  onClick={() => setDeleteTarget({ id: item.id, type: 'transaction' })}
                  style={{
                    padding: '5px', borderRadius: '6px', border: 'none',
                    background: 'transparent', color: '#383848', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 150ms',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#383848' }}
                  aria-label="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )
          }

          // Transfer
          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '13px 20px',
                borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.05)',
                transition: 'background 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                backgroundColor: 'rgba(124,58,237,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <ArrowRight size={15} color="#a78bfa" />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13.5px', fontWeight: 500, color: '#eeeeff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.description ?? 'Transferencia'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                  <span style={{ fontSize: '11.5px', color: '#55556a' }}>{formatDateRelative(item.date)}</span>
                  <span style={{ fontSize: '11px', color: '#383848' }}>·</span>
                  <span style={{ fontSize: '11.5px', color: '#7070a0' }}>
                    {item.from_account?.name} → {item.to_account?.name}
                  </span>
                </div>
              </div>

              <span style={{ fontSize: '14px', fontWeight: 700, color: '#a78bfa', letterSpacing: '-0.01em', flexShrink: 0 }}>
                {formatCurrency(item.amount, item.currency)}
              </span>

              <button
                onClick={() => setDeleteTarget({ id: item.id, type: 'transfer' })}
                style={{
                  padding: '5px', borderRadius: '6px', border: 'none',
                  background: 'transparent', color: '#383848', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 150ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#383848' }}
                aria-label="Eliminar"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )
        })}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Eliminar movimiento"
        description="Esta acción no se puede deshacer. El movimiento será eliminado permanentemente."
      />
    </>
  )
}
