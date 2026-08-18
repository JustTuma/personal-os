import { type Currency } from '@/types'

const ARS_FORMATTER = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

const USD_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatCurrency(amount: number, currency: Currency): string {
  if (currency === 'ARS') return ARS_FORMATTER.format(amount)
  return USD_FORMATTER.format(amount)
}

export function formatCompact(amount: number, currency: Currency): string {
  const symbol = currency === 'ARS' ? '$' : 'US$'
  const abs = Math.abs(amount)

  if (abs >= 1_000_000) {
    return `${symbol}${(amount / 1_000_000).toFixed(1)}M`
  }
  if (abs >= 1_000) {
    return `${symbol}${(amount / 1_000).toFixed(0)}K`
  }
  return formatCurrency(amount, currency)
}

export function parseCurrencyInput(value: string): number {
  // Remove currency symbols, spaces, and convert commas to dots
  const cleaned = value.replace(/[^0-9.,\-]/g, '').replace(',', '.')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}
