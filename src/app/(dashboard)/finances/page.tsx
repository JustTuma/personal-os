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
import { Plus, ArrowRight, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
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
  const balance = totalIncome - totalExpense

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Header */}
      <div className="animate-fade-in" style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
      }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 10px', borderRadius: '999px',
            backgroundColor: 'rgba(16,185,129,0.12)',
            border: '1px solid rgba(16,185,129,0.25)', marginBottom: '10px',
          }}>
            <Wallet size={11} color="#10b981" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#34d399', letterSpacing: '0.04em' }}>
              Finanzas
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#eeeeff', margin: 0, letterSpacing: '-0.03em' }}>
            Movimientos
          </h1>
          <p style={{ fontSize: '13.5px', color: '#7070a0', margin: '6px 0 0' }}>
            Transacciones del mes actual
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button variant="secondary" size="sm" leftIcon={<ArrowRight size={14} color="#818cf8" />} onClick={() => setModal('transfer')}>
            Transferir
          </Button>
          <Button variant="secondary" size="sm" leftIcon={<TrendingDown size={14} color="#f87171" />} onClick={() => setModal('expense')}>
            Gasto
          </Button>
          <Button size="sm" leftIcon={<Plus size={14} color="white" />} onClick={() => setModal('income')}>
            Ingreso
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger animate-slide-up">
        <div className="stat-card stat-card-positive">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#55556a', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Ingresos del mes</p>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={15} color="#10b981" />
            </div>
          </div>
          <p className="gradient-text-green" style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>
            +{formatCurrency(totalIncome, primaryCurrency)}
          </p>
        </div>

        <div className="stat-card stat-card-negative">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#55556a', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Gastos del mes</p>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown size={15} color="#ef4444" />
            </div>
          </div>
          <p className="gradient-text-red" style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>
            -{formatCurrency(totalExpense, primaryCurrency)}
          </p>
        </div>

        <div className={`stat-card ${balance >= 0 ? 'stat-card-accent' : 'stat-card-negative'}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#55556a', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Balance del mes</p>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: balance >= 0 ? 'rgba(124,58,237,0.15)' : 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={15} color={balance >= 0 ? '#7c3aed' : '#ef4444'} />
            </div>
          </div>
          <p className={balance >= 0 ? 'gradient-text' : 'gradient-text-red'} style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>
            {formatCurrency(balance, primaryCurrency)}
          </p>
        </div>
      </div>

      {/* Transaction list */}
      <div className="section-card animate-fade-in">
        <div className="section-card-header">
          <h2 style={{ fontSize: '13.5px', fontWeight: 600, color: '#eeeeff', margin: 0 }}>Movimientos</h2>
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

      <Modal isOpen={modal === 'income' || modal === 'expense'} onClose={() => setModal(null)} title={modal === 'income' ? 'Registrar ingreso' : 'Registrar gasto'}>
        <TransactionForm defaultType={modal === 'income' ? 'income' : 'expense'} onSubmit={handleCreateTransaction} onCancel={() => setModal(null)} />
      </Modal>
      <Modal isOpen={modal === 'transfer'} onClose={() => setModal(null)} title="Transferencia entre cuentas">
        <TransferForm onSubmit={handleCreateTransfer} onCancel={() => setModal(null)} />
      </Modal>
    </div>
  )
}
