'use client'

import { useState } from 'react'
import { useTransactions, useTransfers } from '@/hooks/useTransactions'
import { TransactionList } from '@/components/finances/TransactionList'
import { TransactionForm } from '@/components/finances/TransactionForm'
import { TransferForm } from '@/components/finances/TransferForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils/currency'
import { getCurrentMonthRange } from '@/lib/utils/date'
import { Plus, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react'
import type { TransactionFormValues, TransferFormValues } from '@/lib/validations/transaction'

export default function FinancesPage() {
  const [modal, setModal] = useState<'income' | 'expense' | 'transfer' | null>(null)

  const monthRange = getCurrentMonthRange()
  const { transactions, isLoading: txLoading, createTransaction, deleteTransaction } = useTransactions({
    from: monthRange.from,
    to: monthRange.to,
  })
  const { transfers, isLoading: trLoading, createTransfer, deleteTransfer } = useTransfers({
    from: monthRange.from,
    to: monthRange.to,
  })

  const totalIncome  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  // Get primary currency (most used)
  const primaryCurrency = transactions.length > 0
    ? (transactions.filter(t => t.currency === 'ARS').length >= transactions.filter(t => t.currency === 'USD').length ? 'ARS' : 'USD')
    : 'ARS'

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
            Finanzas
          </h1>
          <p style={{ fontSize: '13.5px', color: '#a0a0b0', margin: '4px 0 0' }}>
            Movimientos y transacciones del mes
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

      {/* Summary cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
      }}>
        <div style={{
          backgroundColor: '#111117',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '20px',
        }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#646473', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>
            Ingresos del mes
          </p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#4ade80', margin: 0, letterSpacing: '-0.02em' }}>
            +{formatCurrency(totalIncome, primaryCurrency)}
          </p>
        </div>
        <div style={{
          backgroundColor: '#111117',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '20px',
        }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#646473', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>
            Gastos del mes
          </p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#f87171', margin: 0, letterSpacing: '-0.02em' }}>
            -{formatCurrency(totalExpense, primaryCurrency)}
          </p>
        </div>
        <div style={{
          backgroundColor: '#111117',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '20px',
        }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#646473', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>
            Balance del mes
          </p>
          <p style={{
            fontSize: '24px',
            fontWeight: 600,
            color: totalIncome - totalExpense >= 0 ? '#f2f2f8' : '#f87171',
            margin: 0,
            letterSpacing: '-0.02em',
          }}>
            {formatCurrency(totalIncome - totalExpense, primaryCurrency)}
          </p>
        </div>
      </div>

      {/* Transaction list */}
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
            Movimientos
          </h2>
          <Button variant="ghost" size="sm" leftIcon={<Plus size={14} />} onClick={() => setModal('expense')}>
            Agregar
          </Button>
        </div>
        <TransactionList
          transactions={transactions}
          transfers={transfers}
          isLoading={txLoading || trLoading}
          onDeleteTransaction={deleteTransaction}
          onDeleteTransfer={deleteTransfer}
        />
      </div>

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
