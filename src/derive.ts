import type { AppData, Category } from './types'
import { ACCENT, AMBER, RED } from './theme'
import { isThisMonth } from './store'

export function monthStats(data: AppData) {
  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const pace = Math.round((now.getDate() / daysInMonth) * 100)
  const month = data.txns.filter((t) => isThisMonth(t.date))

  // Shared totals drive the household view; "Personal" entries are just one
  // person's and are excluded from shared income / spend / budgets.
  const shared = month.filter((t) => t.scope === 'shared')
  const income = shared.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = shared.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const spent = (cid: string) =>
    shared.filter((t) => t.type === 'expense' && t.catId === cid).reduce((s, t) => s + t.amount, 0)

  const personalExpense = month
    .filter((t) => t.type === 'expense' && t.scope === 'personal')
    .reduce((s, t) => s + t.amount, 0)

  // Per-member expense attribution (who paid what this month, any scope) — L-4.
  const byMember = new Map<string, { shared: number; personal: number }>()
  for (const t of month) {
    if (t.type !== 'expense') continue
    const e = byMember.get(t.member) ?? { shared: 0, personal: 0 }
    if (t.scope === 'personal') e.personal += t.amount
    else e.shared += t.amount
    byMember.set(t.member, e)
  }

  return { now, pace, month, income, expense, spent, personalExpense, byMember }
}

export type BudgetStatus = 'over' | 'warn' | 'ok'

export interface BudgetRowInfo {
  id: string
  name: string
  pct: number
  pace: number
  hasBudget: boolean
  barColor: string
  status: BudgetStatus
  spentAmount: number
  target: number
}

export function budgetRow(c: Category, data: AppData, spent: (cid: string) => number, pace: number): BudgetRowInfo {
  const target = data.budgets[c.id] || 0
  const sp = spent(c.id)
  const pct = target > 0 ? Math.min((sp / target) * 100, 100) : 0
  const over = target > 0 && sp > target
  const warn = !over && target > 0 && pct >= 80
  return {
    id: c.id,
    name: c.name,
    pct: Math.round(pct),
    pace,
    hasBudget: target > 0,
    barColor: over ? RED : warn ? AMBER : ACCENT,
    status: over ? 'over' : warn ? 'warn' : 'ok',
    spentAmount: sp,
    target,
  }
}
