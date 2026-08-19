'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { accountSchema, type AccountFormValues } from '@/lib/validations/account'
import { useAccounts } from '@/hooks/useAccounts'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { formatCurrency } from '@/lib/utils/currency'
import {
  Building2, Plus, Wallet, Banknote, PiggyBank, TrendingUp,
  MoreHorizontal, Pencil, Trash2
} from 'lucide-react'
import type { AccountWithBalance, AccountType } from '@/types'

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  cash:           'Efectivo',
  bank:           'Banco',
  digital_wallet: 'Billetera virtual',
  savings:        'Ahorro',
  investment:     'Inversión',
  other:          'Otra',
}

const ACCOUNT_TYPE_ICONS: Record<AccountType, React.ReactNode> = {
  cash:           <Banknote size={18} />,
  bank:           <Building2 size={18} />,
  digital_wallet: <Wallet size={18} />,
  savings:        <PiggyBank size={18} />,
  investment:     <TrendingUp size={18} />,
  other:          <MoreHorizontal size={18} />,
}

const PRESET_COLORS = [
  '#7c3aed', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'
]

function AccountCard({
  account, onEdit, onDelete,
}: {
  account: AccountWithBalance
  onEdit: (a: AccountWithBalance) => void
  onDelete: (a: AccountWithBalance) => void
}) {
  const isNegative = account.current_balance < 0
  const color = account.color || '#7c3aed'

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '170px',
        padding: '20px',
        borderRadius: '16px',
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${color}30`,
        transition: 'border-color 200ms, box-shadow 200ms, transform 200ms',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${color}60`
        e.currentTarget.style.boxShadow = `0 0 20px ${color}18, 0 8px 24px rgba(0,0,0,0.4)`
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = `${color}30`
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Top color glow */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: `linear-gradient(90deg, ${color}, ${color}88)`,
      }} />

      {/* Ambient glow corner */}
      <div style={{
        position: 'absolute', top: -20, right: -20, width: '80px', height: '80px',
        borderRadius: '50%', background: color, opacity: 0.07, filter: 'blur(20px)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '11px',
          backgroundColor: `${color}22`, color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 10px ${color}30`,
        }}>
          {ACCOUNT_TYPE_ICONS[account.type]}
        </div>

        <div style={{ display: 'flex', gap: '2px' }}>
          <button
            onClick={() => onEdit(account)}
            style={{
              padding: '6px', borderRadius: '7px', border: 'none',
              background: 'transparent', color: '#55556a', cursor: 'pointer', transition: 'all 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#c8c8e8' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#55556a' }}
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(account)}
            style={{
              padding: '6px', borderRadius: '7px', border: 'none',
              background: 'transparent', color: '#55556a', cursor: 'pointer', transition: 'all 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#55556a' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div>
        <p style={{ fontSize: '15px', fontWeight: 700, color: '#eeeeff', margin: '0 0 2px', letterSpacing: '-0.01em' }}>
          {account.name}
        </p>
        <p style={{ fontSize: '12px', color: '#55556a', margin: 0 }}>
          {ACCOUNT_TYPE_LABELS[account.type]}
        </p>
      </div>

      <div style={{ marginTop: '12px' }}>
        <p style={{
          fontSize: '24px', fontWeight: 700, letterSpacing: '-0.03em', margin: 0,
          color: isNegative ? '#f87171' : '#eeeeff',
        }}>
          {formatCurrency(account.current_balance, account.currency)}
        </p>
        <p style={{
          fontSize: '10px', fontWeight: 700, color: color,
          margin: '3px 0 0', textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          {account.currency}
        </p>
      </div>
    </div>
  )
}

function AccountForm({ defaultValues, onSubmit, onCancel, isLoading }: {
  defaultValues?: Partial<AccountFormValues>
  onSubmit: (v: AccountFormValues) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema) as never,
    defaultValues: {
      color: '#7c3aed',
      currency: 'ARS',
      ...defaultValues,
      notes: defaultValues?.notes ?? undefined,
    },
  })

  const selectedColor = watch('color') ?? '#7c3aed'

  return (
    <form onSubmit={handleSubmit(onSubmit as never)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Input label="Nombre" placeholder="Ej: Mercado Pago" error={errors.name?.message} {...register('name')} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <Select
          label="Tipo"
          options={Object.entries(ACCOUNT_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
          error={errors.type?.message}
          {...register('type')}
        />
        <Select
          label="Moneda"
          options={[{ value: 'ARS', label: 'ARS — Peso Argentino' }, { value: 'USD', label: 'USD — Dólar' }]}
          error={errors.currency?.message}
          {...register('currency')}
        />
      </div>

      <Input
        label="Saldo inicial"
        type="number"
        step="0.01"
        placeholder="0.00"
        hint="El saldo con el que empieza esta cuenta"
        error={errors.initial_balance?.message}
        {...register('initial_balance')}
      />

      {/* Color picker */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '11px', fontWeight: 600, color: '#9898b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Color
        </label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {PRESET_COLORS.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => setValue('color', color)}
              style={{
                width: '28px', height: '28px', borderRadius: '50%',
                backgroundColor: color,
                border: selectedColor === color ? `2px solid white` : '2px solid transparent',
                cursor: 'pointer', transition: 'transform 150ms',
                transform: selectedColor === color ? 'scale(1.2)' : 'scale(1)',
                boxShadow: selectedColor === color ? `0 0 10px ${color}80` : 'none',
              }}
            />
          ))}
        </div>
      </div>

      <Input label="Notas (opcional)" placeholder="Información adicional..." {...register('notes')} />

      <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
        <Button type="button" variant="ghost" onClick={onCancel} style={{ flex: 1 }}>Cancelar</Button>
        <Button type="submit" isLoading={isLoading} style={{ flex: 1 }}>
          {defaultValues ? 'Guardar cambios' : 'Crear cuenta'}
        </Button>
      </div>
    </form>
  )
}

export default function AccountsPage() {
  const { accounts, isLoading, createAccount, updateAccount, deleteAccount } = useAccounts()
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<AccountWithBalance | null>(null)
  const [deleting, setDeleting] = useState<AccountWithBalance | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const arsAccounts = accounts.filter(a => a.currency === 'ARS')
  const usdAccounts = accounts.filter(a => a.currency === 'USD')
  const totalARS = arsAccounts.reduce((s, a) => s + a.current_balance, 0)
  const totalUSD = usdAccounts.reduce((s, a) => s + a.current_balance, 0)

  async function handleCreate(values: AccountFormValues) {
    setIsSubmitting(true)
    try { await createAccount(values); setShowCreate(false) }
    finally { setIsSubmitting(false) }
  }

  async function handleUpdate(values: AccountFormValues) {
    if (!editing) return
    setIsSubmitting(true)
    try { await updateAccount(editing.id, values); setEditing(null) }
    finally { setIsSubmitting(false) }
  }

  async function handleDelete() {
    if (!deleting) return
    setIsDeleting(true)
    try { await deleteAccount(deleting.id); setDeleting(null) }
    finally { setIsDeleting(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Header */}
      <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 10px', borderRadius: '999px',
            backgroundColor: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.25)',
            marginBottom: '10px',
          }}>
            <Building2 size={11} color="#0ea5e9" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#38bdf8', letterSpacing: '0.04em' }}>Billeteras</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#eeeeff', margin: 0, letterSpacing: '-0.03em' }}>Cuentas</h1>
          <p style={{ fontSize: '13.5px', color: '#7070a0', margin: '6px 0 0' }}>
            {accounts.length} cuenta{accounts.length !== 1 ? 's' : ''} activa{accounts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button leftIcon={<Plus size={15} color="white" />} onClick={() => setShowCreate(true)}>
          Nueva cuenta
        </Button>
      </div>

      {/* Totals summary */}
      {accounts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger animate-slide-up">
          {arsAccounts.length > 0 && (
            <div className="stat-card stat-card-accent">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#55556a', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Total ARS</p>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wallet size={14} color="#7c3aed" />
                </div>
              </div>
              <p className="gradient-text" style={{ fontSize: '28px', fontWeight: 800, margin: 0, letterSpacing: '-0.03em' }}>
                {formatCurrency(totalARS, 'ARS')}
              </p>
              <p style={{ fontSize: '11.5px', color: '#55556a', margin: '8px 0 0' }}>
                {arsAccounts.length} cuenta{arsAccounts.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
          {usdAccounts.length > 0 && (
            <div className="stat-card" style={{ borderColor: 'rgba(14,165,233,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#55556a', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Total USD</p>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'rgba(14,165,233,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wallet size={14} color="#0ea5e9" />
                </div>
              </div>
              <p style={{ fontSize: '28px', fontWeight: 800, color: '#38bdf8', margin: 0, letterSpacing: '-0.03em' }}>
                {formatCurrency(totalUSD, 'USD')}
              </p>
              <p style={{ fontSize: '11.5px', color: '#55556a', margin: '8px 0 0' }}>
                {usdAccounts.length} cuenta{usdAccounts.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Accounts grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : accounts.length === 0 ? (
        <div className="glass-card" style={{ padding: '56px 24px', textAlign: 'center' }}>
          <EmptyState
            icon={Building2}
            title="No tenés cuentas todavía"
            description="Agregá tu primera cuenta para empezar a registrar tus movimientos de dinero."
            actionLabel="Crear cuenta"
            onAction={() => setShowCreate(true)}
          />
        </div>
      ) : (
        <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {accounts.map((account, i) => (
            <div key={account.id} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
              <AccountCard account={account} onEdit={setEditing} onDelete={setDeleting} />
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nueva cuenta">
        <AccountForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} isLoading={isSubmitting} />
      </Modal>
      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Editar cuenta">
        {editing && (
          <AccountForm
            defaultValues={{ ...editing, notes: editing.notes ?? undefined }}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
            isLoading={isSubmitting}
          />
        )}
      </Modal>
      <ConfirmDialog isOpen={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} isLoading={isDeleting} title="Eliminar cuenta" description={`¿Eliminás la cuenta "${deleting?.name}"? Los movimientos asociados no serán eliminados.`} />
    </div>
  )
}
