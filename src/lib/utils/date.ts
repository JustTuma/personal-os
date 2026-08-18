import { format, formatRelative, isToday, isYesterday, parseISO, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy')
}

export function formatDateLong(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, "d 'de' MMMM, yyyy", { locale: es })
}

export function formatDateRelative(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (isToday(d)) return 'Hoy'
  if (isYesterday(d)) return 'Ayer'
  return format(d, "d MMM", { locale: es })
}

export function formatMonthYear(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, "MMM yyyy", { locale: es })
}

export function getCurrentMonthRange() {
  const now = new Date()
  return {
    from: format(startOfMonth(now), 'yyyy-MM-dd'),
    to: format(endOfMonth(now), 'yyyy-MM-dd'),
  }
}

export function getPreviousMonthRange() {
  const prev = subMonths(new Date(), 1)
  return {
    from: format(startOfMonth(prev), 'yyyy-MM-dd'),
    to: format(endOfMonth(prev), 'yyyy-MM-dd'),
  }
}

export function getLastNMonths(n: number): Array<{ from: string; to: string; label: string }> {
  const months = []
  for (let i = n - 1; i >= 0; i--) {
    const date = subMonths(new Date(), i)
    months.push({
      from: format(startOfMonth(date), 'yyyy-MM-dd'),
      to: format(endOfMonth(date), 'yyyy-MM-dd'),
      label: format(date, "MMM yyyy", { locale: es }),
    })
  }
  return months
}

export function toDateInputValue(date?: string | null): string {
  if (!date) return format(new Date(), 'yyyy-MM-dd')
  return date.slice(0, 10)
}
