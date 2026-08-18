'use client'

import { useState, useEffect } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { useCategories } from '@/hooks/useCategories'
import { useAccounts } from '@/hooks/useAccounts'
import { useTransactions } from '@/hooks/useTransactions'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { useFinancialGoals } from '@/hooks/useFinancialGoals'
import { useTasks } from '@/hooks/useTasks'
import { useProjects } from '@/hooks/useProjects'
import { useNotes } from '@/hooks/useNotes'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import {
  User, Lock, Tag, Download, Trash2, Plus, Check, Shield
} from 'lucide-react'
import type { Currency, CategoryType, Category } from '@/types'
import { toast } from 'sonner'

const PRESET_COLORS = [
  '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'
]

export default function SettingsPage() {
  const { profile, email, updateProfile, updatePassword, isLoading: profileLoading } = useProfile()
  const { allCategories, createCategory, deleteCategory } = useCategories()
  const { accounts } = useAccounts()
  const { transactions } = useTransactions({ limit: 5000 })
  const { subscriptions } = useSubscriptions()
  const { goals } = useFinancialGoals()
  const { tasks } = useTasks()
  const { projects } = useProjects()
  const { notes } = useNotes()

  // Profile Form state
  const [fullName, setFullName] = useState('')
  const [currencyPref, setCurrencyPref] = useState<Currency>('ARS')
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // Password Form state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  // Custom Category Modal state
  const [showCatModal, setShowCatModal] = useState(false)
  const [catName, setCatName] = useState('')
  const [catType, setCatType] = useState<CategoryType>('expense')
  const [catColor, setCatColor] = useState('#6366f1')
  const [isCreatingCat, setIsCreatingCat] = useState(false)
  const [deletingCat, setDeletingCat] = useState<Category | null>(null)

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setCurrencyPref(profile.currency_preference || 'ARS')
    }
  }, [profile])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setIsSavingProfile(true)
    try {
      await updateProfile({
        full_name: fullName.trim() || undefined,
        currency_preference: currencyPref,
      })
    } finally {
      setIsSavingProfile(false)
    }
  }

  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    setIsSavingPassword(true)
    try {
      await updatePassword(newPassword)
      setNewPassword('')
      setConfirmPassword('')
    } finally {
      setIsSavingPassword(false)
    }
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!catName.trim()) {
      toast.error('Ingresá un nombre para la categoría')
      return
    }

    setIsCreatingCat(true)
    try {
      await createCategory({
        name: catName.trim(),
        type: catType,
        color: catColor,
      })
      setShowCatModal(false)
      setCatName('')
    } finally {
      setIsCreatingCat(false)
    }
  }

  async function handleDeleteCategory() {
    if (!deletingCat) return
    try {
      await deleteCategory(deletingCat.id)
      setDeletingCat(null)
    } catch {
      // Error handled in hook
    }
  }

  function exportJSON() {
    const backupData = {
      exportDate: new Date().toISOString(),
      profile,
      accounts,
      transactions,
      subscriptions,
      financialGoals: goals,
      tasks,
      projects,
      notes,
    }

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `personal_os_backup_${new Date().toISOString().split('T')[0]}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    toast.success('Backup JSON generado y descargado')
  }

  function exportTransactionsCSV() {
    if (transactions.length === 0) {
      toast.info('No hay transacciones para exportar')
      return
    }

    const headers = ['ID', 'Fecha', 'Tipo', 'Monto', 'Moneda', 'Descripción', 'Categoría', 'Cuenta']
    const rows = transactions.map(t => [
      t.id,
      t.date,
      t.type,
      t.amount,
      t.currency,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${t.category?.name || ''}"`,
      `"${t.account?.name || ''}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `transacciones_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    toast.success('Archivo CSV descargado')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '840px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#f2f2f8', margin: 0, letterSpacing: '-0.02em' }}>
          Configuración
        </h1>
        <p style={{ fontSize: '13.5px', color: '#a0a0b0', margin: '4px 0 0' }}>
          Preferencias de usuario, categorías personalizadas y respaldo de datos
        </p>
      </div>

      {/* 1. Profile & Preferences */}
      <div style={{
        backgroundColor: '#111117',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={16} color="#818cf8" />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f2f2f8', margin: 0 }}>
              Perfil y Moneda
            </h2>
            <p style={{ fontSize: '12.5px', color: '#646473', margin: '2px 0 0' }}>
              Tus datos de cuenta y moneda preferida
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label="Nombre completo"
              placeholder="Tu nombre"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input
              label="Correo electrónico"
              value={email || ''}
              disabled
              hint="El email no puede modificarse directamente"
            />
          </div>

          <div style={{ width: '50%' }}>
            <Select
              label="Moneda por defecto"
              options={[
                { value: 'ARS', label: 'ARS — Pesos Argentinos' },
                { value: 'USD', label: 'USD — Dólares Estadounidenses' },
              ]}
              value={currencyPref}
              onChange={(e) => setCurrencyPref(e.target.value as Currency)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
            <Button type="submit" isLoading={isSavingProfile}>
              Guardar perfil
            </Button>
          </div>
        </form>
      </div>

      {/* 2. Categories Management */}
      <div style={{
        backgroundColor: '#111117',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(34, 197, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tag size={16} color="#4ade80" />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f2f2f8', margin: 0 }}>
                Categorías de Finanzas
              </h2>
              <p style={{ fontSize: '12.5px', color: '#646473', margin: '2px 0 0' }}>
                {allCategories.length} categorías disponibles para tus movimientos
              </p>
            </div>
          </div>

          <Button size="sm" leftIcon={<Plus size={14} color="white" />} onClick={() => setShowCatModal(true)}>
            Nueva categoría
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
          {allCategories.map(cat => (
            <div
              key={cat.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: '#181820',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: cat.color || '#6366f1', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#f2f2f8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {cat.name}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Badge variant={cat.type === 'income' ? 'positive' : cat.type === 'expense' ? 'negative' : 'info'} size="sm">
                  {cat.type === 'income' ? 'Ingreso' : cat.type === 'expense' ? 'Gasto' : 'Ambos'}
                </Badge>
                {!cat.is_default && (
                  <button
                    onClick={() => setDeletingCat(cat)}
                    style={{
                      padding: '4px',
                      borderRadius: '4px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#646473',
                      cursor: 'pointer',
                    }}
                    title="Eliminar categoría personalizada"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Data Export / Backup */}
      <div style={{
        backgroundColor: '#111117',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Download size={16} color="#fbbf24" />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f2f2f8', margin: 0 }}>
              Exportación y Respaldo de Datos
            </h2>
            <p style={{ fontSize: '12.5px', color: '#646473', margin: '2px 0 0' }}>
              Descargá una copia completa de tus registros en cualquier momento
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingTop: '4px' }}>
          <Button variant="secondary" onClick={exportJSON}>
            Exportar todo en JSON
          </Button>
          <Button variant="secondary" onClick={exportTransactionsCSV}>
            Exportar transacciones en CSV
          </Button>
        </div>
      </div>

      {/* 4. Security / Password */}
      <div style={{
        backgroundColor: '#111117',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={16} color="#f87171" />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f2f2f8', margin: 0 }}>
              Seguridad
            </h2>
            <p style={{ fontSize: '12.5px', color: '#646473', margin: '2px 0 0' }}>
              Actualizar tu contraseña de acceso
            </p>
          </div>
        </div>

        <form onSubmit={handleSavePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label="Nueva contraseña"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              label="Confirmar nueva contraseña"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
            <Button type="submit" isLoading={isSavingPassword} disabled={!newPassword}>
              Actualizar contraseña
            </Button>
          </div>
        </form>
      </div>

      {/* New Category Modal */}
      <Modal
        isOpen={showCatModal}
        onClose={() => setShowCatModal(false)}
        title="Nueva categoría personalizada"
        size="sm"
      >
        <form onSubmit={handleCreateCategory} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Nombre de la categoría"
            placeholder="Ej: Mascotas, Suscripciones AI, Café"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
          />

          <Select
            label="Tipo"
            options={[
              { value: 'expense', label: 'Gasto' },
              { value: 'income',  label: 'Ingreso' },
              { value: 'both',    label: 'Ambos' },
            ]}
            value={catType}
            onChange={(e) => setCatType(e.target.value as CategoryType)}
          />

          {/* Color picker */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#a0a0b0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Color identificador
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setCatColor(color)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    border: catColor === color ? '2px solid white' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'transform 120ms',
                    transform: catColor === color ? 'scale(1.15)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
            <Button type="button" variant="ghost" onClick={() => setShowCatModal(false)} style={{ flex: 1 }}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isCreatingCat} style={{ flex: 1 }}>
              Crear categoría
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Category Confirm */}
      <ConfirmDialog
        isOpen={!!deletingCat}
        onClose={() => setDeletingCat(null)}
        onConfirm={handleDeleteCategory}
        title="Eliminar categoría"
        description={`¿Querés eliminar la categoría "${deletingCat?.name}"? Las transacciones que la usen conservarán su registro.`}
      />
    </div>
  )
}
