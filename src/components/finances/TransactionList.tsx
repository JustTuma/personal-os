'use client'

import { useState } from 'react'
import { TransactionWithRelations, TransferWithRelations } from '@/types'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDateRelative } from '@/lib/utils/date'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonRow } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
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

  // Merge and sort by date desc
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
      if (deleteTarget.type === 'transaction') {
        await onDeleteTransaction(deleteTarget.id)
      } else {
        await onDeleteTransfer(deleteTarget.id)
      }
      setDeleteTarget(null)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
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
          if (item.itemType === 'transaction') {
            const isIncome = item.type === 'income'
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 20px',
                  borderBottom: idx !== items.length - 1 ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
                  transition: 'background 120ms',
                }}
              >
                {/* Icon */}
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  backgroundColor: isIncome ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                }}>
                  {isIncome
                    ? <TrendingUp size={16} color="#4ade80" />
                    : <TrendingDown size={16} color="#f87171" />
                  }
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13.5px', fontWeight: 500, color: '#f2f2f8', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                    <span style={{ fontSize: '12px', color: '#646473' }}>
                      {formatDateRelative(item.date)}
                    </span>
                    {item.account && <span style={{ fontSize: '12px', color: '#646473' }}>·</span>}
                    {item.account && (
                      <span style={{ fontSize: '12px', color: '#a0a0b0' }}>{item.account.name}</span>
                    )}
                    {item.category && (
                      <>
                        <span style={{ fontSize: '12px', color: '#646473' }}>·</span>
                        <Badge variant="default">{item.category.name}</Badge>
                      </>
                    )}
                  </div>
                </div>

                {/* Amount */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: isIncome ? '#4ade80' : '#f87171',
                  }}>
                    {isIncome ? '+' : '-'}{formatCurrency(item.amount, item.currency)}
                  </span>
                </div>

                {/* Delete action */}
                <button
                  onClick={() => setDeleteTarget({ id: item.id, type: 'transaction' })}
                  style={{
                    padding: '6px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#646473',
                    cursor: 'pointer',
                    marginLeft: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
                    e.currentTarget.style.color = '#f87171'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = '#646473'
                  }}
                  aria-label="Eliminar"
                >
                  <Trash2 size={15} />
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
                padding: '14px 20px',
                borderBottom: idx !== items.length - 1 ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
                transition: 'background 120ms',
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <ArrowRight size={16} color="#818cf8" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13.5px', fontWeight: 500, color: '#f2f2f8', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.description ?? 'Transferencia'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                  <span style={{ fontSize: '12px', color: '#646473' }}>{formatDateRelative(item.date)}</span>
                  <span style={{ fontSize: '12px', color: '#646473' }}>·</span>
                  <span style={{ fontSize: '12px', color: '#a0a0b0' }}>
                    {item.from_account?.name} → {item.to_account?.name}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#818cf8' }}>
                  {formatCurrency(item.amount, item.currency)}
                </span>
              </div>
              <button
                onClick={() => setDeleteTarget({ id: item.id, type: 'transfer' })}
                style={{
                  padding: '6px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#646473',
                  cursor: 'pointer',
                  marginLeft: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
                  e.currentTarget.style.color = '#f87171'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#646473'
                }}
                aria-label="Eliminar"
              >
                <Trash2 size={15} />
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
