export type AccountType = 'cash' | 'bank' | 'digital_wallet' | 'savings' | 'investment' | 'other'
export type Currency = 'ARS' | 'USD'
export type TransactionType = 'income' | 'expense'
export type SubscriptionFrequency = 'monthly' | 'annual' | 'weekly' | 'custom'
export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled'
export type ProjectStatus = 'idea' | 'planning' | 'in_progress' | 'paused' | 'completed' | 'cancelled'
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type CategoryType = 'income' | 'expense' | 'both'

// ── Database row types ────────────────────────────────────────
export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  currency_preference: Currency
  created_at: string
  updated_at: string
}

export interface Account {
  id: string
  user_id: string
  name: string
  type: AccountType
  currency: Currency
  initial_balance: number
  is_active: boolean
  color: string
  icon: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface AccountWithBalance extends Account {
  current_balance: number
}

export interface Category {
  id: string
  user_id: string
  name: string
  type: CategoryType
  color: string
  icon: string | null
  is_default: boolean
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  account_id: string
  category_id: string | null
  business_id: string | null
  subscription_id: string | null
  type: TransactionType
  amount: number
  currency: Currency
  date: string
  description: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface TransactionWithRelations extends Transaction {
  account: Pick<Account, 'id' | 'name' | 'color' | 'currency'>
  category: Pick<Category, 'id' | 'name' | 'color' | 'icon'> | null
}

export interface Transfer {
  id: string
  user_id: string
  from_account_id: string
  to_account_id: string
  amount: number
  currency: Currency
  date: string
  description: string | null
  notes: string | null
  created_at: string
}

export interface TransferWithRelations extends Transfer {
  from_account: Pick<Account, 'id' | 'name' | 'color'>
  to_account: Pick<Account, 'id' | 'name' | 'color'>
}

export interface Subscription {
  id: string
  user_id: string
  account_id: string | null
  category_id: string | null
  name: string
  amount: number
  currency: Currency
  frequency: SubscriptionFrequency
  custom_days: number | null
  next_payment_date: string
  start_date: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SubscriptionWithRelations extends Subscription {
  account: Pick<Account, 'id' | 'name' | 'color' | 'currency'> | null
  category: Pick<Category, 'id' | 'name' | 'color' | 'icon'> | null
}

export interface FinancialGoal {
  id: string
  user_id: string
  name: string
  description: string | null
  target_amount: number
  current_amount: number
  currency: Currency
  target_date: string | null
  status: GoalStatus
  icon: string | null
  color: string
  created_at: string
  updated_at: string
}

export interface GoalContribution {
  id: string
  user_id: string
  goal_id: string
  amount: number
  date: string
  notes: string | null
  created_at: string
}

export interface Budget {
  id: string
  user_id: string
  category_id: string
  amount: number
  period_month: number
  period_year: number
  created_at: string
}

export interface Business {
  id: string
  user_id: string
  name: string
  description: string | null
  currency: Currency
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  status: ProjectStatus
  priority: Priority
  start_date: string | null
  target_date: string | null
  progress: number
  color: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  project_id: string | null
  title: string
  description: string | null
  priority: Priority
  status: TaskStatus
  due_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface TaskWithRelations extends Task {
  project: Pick<Project, 'id' | 'name' | 'color'> | null
}

export interface Note {
  id: string
  user_id: string
  project_id: string | null
  title: string
  content: string | null
  is_pinned?: boolean
  color?: string
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface NoteWithRelations extends Note {
  project: Pick<Project, 'id' | 'name' | 'color'> | null
}

// ── UI / utility types ────────────────────────────────────────
export interface MonthlyFinancialSummary {
  currency: Currency
  income: number
  expenses: number
  balance: number
  previousIncome: number
  previousExpenses: number
}

export interface ActivityItem {
  id: string
  type: 'income' | 'expense' | 'transfer' | 'task_completed' | 'goal_updated'
  title: string
  subtitle: string | null
  amount?: number
  currency?: Currency
  date: string
  color?: string
  icon?: string
}

export interface ChartDataPoint {
  month: string
  income: number
  expenses: number
}

export interface CategoryChartData {
  name: string
  value: number
  color: string
}
