import type { AppData, Profile } from './types'

export const DATA_KEY = 'couples-budget-redesign-v1'
export const PROFILE_KEY = 'couples-budget-profile-v1'

export function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function todayISO(): string {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

function daysAgo(n: number, hour = 12): number {
  const d = new Date()
  d.setHours(hour, 0, 0, 0)
  d.setDate(d.getDate() - n)
  return d.getTime()
}

export function loadData(): AppData | null {
  try {
    const raw = localStorage.getItem(DATA_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data || !Array.isArray(data.txns)) return null
    return data as AppData
  } catch {
    return null
  }
}

export function saveData(data: AppData) {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(data))
  } catch {
    /* storage unavailable */
  }
}

export function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return null
    const p = JSON.parse(raw)
    if (!p || !Array.isArray(p.members) || p.members.length !== 2) return null
    return p as Profile
  } catch {
    return null
  }
}

export function saveProfile(profile: Profile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  } catch {
    /* storage unavailable */
  }
}

export function clearProfile() {
  try {
    localStorage.removeItem(PROFILE_KEY)
  } catch {
    /* storage unavailable */
  }
}

export function seed(n0: string, n1: string): AppData {
  const N0 = n0 || 'Star'
  const N1 = n1 || 'Niki'
  const ren = (m: string) => (m === 'Star' ? N0 : N1)
  const A = daysAgo
  const cats = [
    { id: 'c1', name: 'Groceries', type: 'expense' as const },
    { id: 'c2', name: 'Rent', type: 'expense' as const },
    { id: 'c3', name: 'Utilities', type: 'expense' as const },
    { id: 'c4', name: 'Transport', type: 'expense' as const },
    { id: 'c5', name: 'Dining', type: 'expense' as const },
    { id: 'c6', name: 'Health', type: 'expense' as const },
    { id: 'c7', name: 'Subscriptions', type: 'expense' as const },
    { id: 'c8', name: 'Salary', type: 'income' as const },
    { id: 'c9', name: 'Freelance', type: 'income' as const },
    { id: 'c10', name: 'Other', type: 'income' as const },
  ]
  const txns = [
    { id: uid(), type: 'income' as const, amount: 12000, date: A(11, 9), catId: 'c8', member: 'Star', scope: 'shared' as const, notes: 'Monthly salary' },
    { id: uid(), type: 'income' as const, amount: 9500, date: A(11, 9), catId: 'c8', member: 'Niki', scope: 'shared' as const, notes: 'Monthly salary' },
    { id: uid(), type: 'expense' as const, amount: 4500, date: A(11, 10), catId: 'c2', member: 'Star', scope: 'shared' as const, notes: 'June rent' },
    { id: uid(), type: 'expense' as const, amount: 286.4, date: A(10, 18), catId: 'c1', member: 'Niki', scope: 'shared' as const, notes: 'Weekly shop' },
    { id: uid(), type: 'expense' as const, amount: 39, date: A(9, 8), catId: 'c7', member: 'Star', scope: 'shared' as const, notes: 'Netflix' },
    { id: uid(), type: 'expense' as const, amount: 142, date: A(8, 20), catId: 'c5', member: 'Niki', scope: 'shared' as const, notes: 'Pasta night' },
    { id: uid(), type: 'expense' as const, amount: 60, date: A(7, 9), catId: 'c4', member: 'Star', scope: 'personal' as const, notes: 'Metro card' },
    { id: uid(), type: 'expense' as const, amount: 312.75, date: A(6, 17), catId: 'c1', member: 'Star', scope: 'shared' as const, notes: 'Weekly shop' },
    { id: uid(), type: 'expense' as const, amount: 480, date: A(5, 11), catId: 'c3', member: 'Niki', scope: 'shared' as const, notes: 'DEWA bill' },
    { id: uid(), type: 'expense' as const, amount: 95.5, date: A(4, 13), catId: 'c5', member: 'Star', scope: 'personal' as const, notes: 'Lunch with Omar' },
    { id: uid(), type: 'expense' as const, amount: 220, date: A(3, 10), catId: 'c6', member: 'Niki', scope: 'personal' as const, notes: 'Dental check-up' },
    { id: uid(), type: 'expense' as const, amount: 198.2, date: A(2, 19), catId: 'c1', member: 'Niki', scope: 'shared' as const, notes: 'Top-up shop' },
    { id: uid(), type: 'expense' as const, amount: 45, date: A(1, 8), catId: 'c4', member: 'Niki', scope: 'shared' as const, notes: 'Taxi' },
    { id: uid(), type: 'expense' as const, amount: 230, date: A(1, 21), catId: 'c5', member: 'Star', scope: 'shared' as const, notes: 'Anniversary dinner' },
    { id: uid(), type: 'expense' as const, amount: 84.6, date: A(0, 10), catId: 'c1', member: 'Star', scope: 'shared' as const, notes: 'Bakery + fruit' },
    { id: uid(), type: 'expense' as const, amount: 19, date: A(0, 9), catId: 'c7', member: 'Niki', scope: 'shared' as const, notes: 'Spotify duo' },
  ]
  const funds = [
    { id: 'f1', name: 'Savings', balance: 12400, target: 20000 },
    { id: 'f2', name: 'Emergency', balance: 8250, target: 15000 },
    { id: 'f3', name: 'Investments', balance: 5600, target: 10000 },
  ]
  const contribs = [
    { id: uid(), fundId: 'f1', amount: 1000, member: 'Star', date: A(11, 9) },
    { id: uid(), fundId: 'f1', amount: 750, member: 'Niki', date: A(11, 9) },
    { id: uid(), fundId: 'f2', amount: 500, member: 'Star', date: A(7, 12) },
    { id: uid(), fundId: 'f3', amount: 400, member: 'Niki', date: A(2, 12) },
  ]
  return {
    txns: txns.map((t) => ({ ...t, member: ren(t.member) })),
    cats,
    budgets: { c1: 1500, c3: 600, c4: 500, c5: 800, c6: 400, c7: 300 },
    funds,
    contribs: contribs.map((c) => ({ ...c, member: ren(c.member) })),
  }
}

export function isThisMonth(ts: number): boolean {
  const d = new Date(ts)
  const n = new Date()
  return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear()
}

export function dayLabel(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const strip = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diff = Math.round((strip(now) - strip(d)) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}
