export type ColorKey = 'indigo' | 'rose' | 'green' | 'amber'
export type TxnType = 'expense' | 'income'
export type Scope = 'shared' | 'personal'
export type Tab = 'home' | 'activity' | 'add' | 'budgets' | 'funds'
export type Screen = 'auth' | 'onboarding' | 'app'

export interface Member {
  name: string
  color: ColorKey
}

export interface User {
  name: string
  email: string
}

export interface Category {
  id: string
  name: string
  type: TxnType
}

export interface Txn {
  id: string
  type: TxnType
  amount: number
  date: number
  catId: string
  member: string
  scope: Scope
  notes: string
}

export interface Fund {
  id: string
  name: string
  balance: number
  target: number
}

export interface Contrib {
  id: string
  fundId: string
  amount: number
  member: string
  date: number
}

export interface AppData {
  txns: Txn[]
  cats: Category[]
  budgets: Record<string, number>
  funds: Fund[]
  contribs: Contrib[]
}

export interface Profile {
  user: User | null
  members: Member[]
  currency: string
}

export interface OnboardingDraft {
  yourName: string
  yourColor: ColorKey
  partnerName: string
  partnerColor: ColorKey
  currency: string
  suggested: boolean
}

export interface EntryForm {
  type: TxnType
  amount: string
  date: string
  catId: string
  member: string
  scope: Scope
  notes: string
}
