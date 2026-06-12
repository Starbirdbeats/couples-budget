import type { AppData, Category } from './types'
import { ACCENT, AMBER, RED } from './theme'
import { isThisMonth } from './store'

export function monthStats(data: AppData) {
  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const pace = Math.round((now.getDate() / daysInMonth) * 100)
  const month = data.txns.filter((t) => isThisMonth(t.date))
  const income = month.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = month.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const spent = (cid: string) =>
    month.filter((t) => t.type === 'expense' && t.catId === cid).reduce((s, t) => s + t.amount, 0)
  return { now, pace, month, income, expense, spent }
}

export interface BudgetRowInfo {
  id: string
  name: string
  pct: number
  pace: number
  hasBudget: boolean
  barColor: string
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
    spentAmount: sp,
    target,
  }
}
