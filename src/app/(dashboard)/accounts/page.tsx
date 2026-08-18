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
import { Building2, Plus, Wallet, Banknote, PiggyBank, TrendingUp, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
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
  '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'
]

function AccountCard({
  account,
  onEdit,
  onDelete,
}: {
  account: AccountWithBalance
  onEdit: (a: AccountWithBalance) => void
  onDelete: (a: AccountWithBalance) => void
}) {
  const isNegative = account.current_balance < 0

  return (
    <div style={{
      backgroundColor: '#111117',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '14px',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '160px',
      transition: 'border-color 150ms',
    }}>
      {/* Color accent line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        backgroundColor: account.color || '#6366f1',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          backgroundColor: (account.color || '#6366f1') + '18',
          color: account.color || '#6366f1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {ACCOUNT_TYPE_ICONS[account.type]}
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => onEdit(account)}
            style={{
              padding: '6px',
              borderRadius: '6px',
              border: 'none',
              background: 'transparent',
              color: '#646473',
              cursor: 'pointer',
            }}
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(account)}
            style={{
              padding: '6px',
              borderRadius: '6px',
              border: 'none',
              background: 'transparent',
              color: '#646473',
              cursor: 'pointer',
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div>
        <p style={{ fontSize: '15px', fontWeight: 600, color: '#f2f2f8', margin: '0 0 2px' }}>
          {account.name}
        </p>
        <p style={{ fontSize: '12px', color: '#646473', margin: 0 }}>
          {ACCOUNT_TYPE_LABELS[account.type]}
        </p>
      </div>

      <div style={{ marginTop: '12px' }}>
        <p style={{
          fontSize: '22px',
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: isNegative ? '#f87171' : '#f2f2f8',
          margin: 0,
        }}>
          {formatCurrency(account.current_balance, account.currency)}
        </p>
        <p style={{ fontSize: '11px', fontWeight: 600, color: '#646473', margin: '2px 0 0', textTransform: 'uppercase' }}>
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
      color: '#6366f1',
      currency: 'ARS',
      ...defaultValues,
      notes: defaultValues?.notes ?? undefined,
    },
  })

  const selectedColor = watch('color') ?? '#6366f1'

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '11px', fontWeight: 600, color: '#a0a0b0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Color
        </label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {PRESET_COLORS.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => setValue('color', color)}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: color,
                border: selectedColor === color ? '2px solid white' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'transform 120ms',
                transform: selectedColor === color ? 'scale(1.15)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>

      <Input label="Notas (opcional)" placeholder="Información adicional..." {...register('notes')} />

      <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
        <Button type="button" variant="ghost" onClick={onCancel} style={{ flex: 1 }}>
          Cancelar
        </Button>
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

  // Group by currency
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
            Cuentas
          </h1>
          <p style={{ fontSize: '13.5px', color: '#a0a0b0', margin: '4px 0 0' }}>
            {accounts.length} cuenta{accounts.length !== 1 ? 's' : ''} activa{accounts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button leftIcon={<Plus size={15} color="white" />} onClick={() => setShowCreate(true)}>
          Nueva cuenta
        </Button>
      </div>

      {/* Totals summary */}
      {accounts.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {arsAccounts.length > 0 && (
            <div style={{ backgroundColor: '#111117', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '20px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#646473', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
                Total ARS
              </p>
              <p style={{ fontSize: '26px', fontWeight: 600, color: '#f2f2f8', margin: 0, letterSpacing: '-0.02em' }}>
                {formatCurrency(totalARS, 'ARS')}
              </p>
              <p style={{ fontSize: '12px', color: '#646473', margin: '4px 0 0' }}>
                {arsAccounts.length} cuenta{arsAccounts.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
          {usdAccounts.length > 0 && (
            <div style={{ backgroundColor: '#111117', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '20px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#646473', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
                Total USD
              </p>
              <p style={{ fontSize: '26px', fontWeight: 600, color: '#f2f2f8', margin: 0, letterSpacing: '-0.02em' }}>
                {formatCurrency(totalUSD, 'USD')}
              </p>
              <p style={{ fontSize: '12px', color: '#646473', margin: '4px 0 0' }}>
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
        <div style={{
          backgroundColor: '#111117',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '48px 24px',
          textAlign: 'center',
        }}>
          <EmptyState
            icon={Building2}
            title="No tenés cuentas todavía"
            description="Agregá tu primera cuenta para empezar a registrar tus movimientos de dinero."
            actionLabel="Crear cuenta"
            onAction={() => setShowCreate(true)}
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {accounts.map(account => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={setEditing}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nueva cuenta">
        <AccountForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} isLoading={isSubmitting} />
      </Modal>

      {/* Edit modal */}
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

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Eliminar cuenta"
        description={`¿Eliminás la cuenta "${deleting?.name}"? Los movimientos asociados no serán eliminados.`}
      />
    </div>
  )
}
