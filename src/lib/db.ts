import { supabase } from './supabase'
import type { AppData, ColorKey, Scope, TxnType } from '../types'

export interface DbMember {
  id: string
  name: string
  color: ColorKey
  userId: string | null
  role: string
}

export interface HouseholdBundle {
  householdId: string
  currency: string
  members: DbMember[]
  data: AppData
}

const ms = (iso: string) => Date.parse(iso)
const iso = (millis: number) => new Date(millis).toISOString()

/** Load the signed-in user's household and all its data, in app-ready shapes. */
export async function loadHousehold(userId: string): Promise<HouseholdBundle | null> {
  const { data: membership, error: mErr } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()
  if (mErr) throw mErr
  if (!membership) return null

  const householdId = membership.household_id as string

  const [household, members, cats, txns, budgets, funds, contribs] = await Promise.all([
    supabase.from('households').select('currency').eq('id', householdId).single(),
    supabase.from('household_members').select('id,name,color,user_id,role').eq('household_id', householdId),
    supabase.from('categories').select('id,name,type').eq('household_id', householdId).order('created_at'),
    supabase.from('transactions').select('id,type,amount,occurred_at,category_id,member_id,scope,notes').eq('household_id', householdId),
    supabase.from('budgets').select('category_id,amount').eq('household_id', householdId),
    supabase.from('funds').select('id,name,target,created_at').eq('household_id', householdId).order('created_at'),
    supabase.from('contributions').select('id,fund_id,amount,member_id,occurred_at').eq('household_id', householdId),
  ])
  for (const r of [household, members, cats, txns, budgets, funds, contribs]) {
    if (r.error) throw r.error
  }

  const memberRows = members.data!
  const memberName = (id: string | null) => memberRows.find((m) => m.id === id)?.name ?? '—'

  const budgetMap: Record<string, number> = {}
  for (const b of budgets.data!) budgetMap[b.category_id] = Number(b.amount)

  // Derive each fund's balance from its contributions (single source of truth).
  const balanceByFund: Record<string, number> = {}
  for (const c of contribs.data!) {
    balanceByFund[c.fund_id] = (balanceByFund[c.fund_id] ?? 0) + Number(c.amount)
  }

  const appData: AppData = {
    cats: cats.data!.map((c) => ({ id: c.id, name: c.name, type: c.type as TxnType })),
    txns: txns.data!.map((t) => ({
      id: t.id,
      type: t.type as TxnType,
      amount: Number(t.amount),
      date: ms(t.occurred_at),
      catId: t.category_id ?? '',
      member: memberName(t.member_id),
      scope: t.scope as Scope,
      notes: t.notes ?? '',
    })),
    budgets: budgetMap,
    funds: funds.data!.map((f) => ({
      id: f.id,
      name: f.name,
      target: Number(f.target),
      balance: balanceByFund[f.id] ?? 0,
    })),
    contribs: contribs.data!.map((c) => ({
      id: c.id,
      fundId: c.fund_id,
      amount: Number(c.amount),
      member: memberName(c.member_id),
      date: ms(c.occurred_at),
    })),
  }

  return {
    householdId,
    currency: household.data!.currency,
    members: memberRows.map((m) => ({
      id: m.id,
      name: m.name,
      color: m.color as ColorKey,
      userId: m.user_id,
      role: m.role,
    })),
    data: appData,
  }
}

export async function createHousehold(params: {
  currency: string
  yourName: string
  yourColor: ColorKey
  partnerName: string
  partnerColor: ColorKey
  suggested: boolean
}): Promise<string> {
  const { data, error } = await supabase.rpc('create_household', {
    p_currency: params.currency,
    p_your_name: params.yourName,
    p_your_color: params.yourColor,
    p_partner_name: params.partnerName,
    p_partner_color: params.partnerColor,
    p_suggested: params.suggested,
  })
  if (error) throw error
  return data as string
}

export async function insertTransaction(input: {
  householdId: string
  type: TxnType
  amount: number
  dateMs: number
  categoryId: string
  memberId: string | null
  scope: Scope
  notes: string
}): Promise<string> {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      household_id: input.householdId,
      type: input.type,
      amount: input.amount,
      occurred_at: iso(input.dateMs),
      category_id: input.categoryId,
      member_id: input.memberId,
      scope: input.scope,
      notes: input.notes,
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id as string
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) throw error
}

export async function upsertBudget(householdId: string, categoryId: string, amount: number): Promise<void> {
  const { error } = await supabase
    .from('budgets')
    .upsert({ household_id: householdId, category_id: categoryId, amount }, { onConflict: 'household_id,category_id' })
  if (error) throw error
}

export async function deleteBudget(householdId: string, categoryId: string): Promise<void> {
  const { error } = await supabase.from('budgets').delete().eq('household_id', householdId).eq('category_id', categoryId)
  if (error) throw error
}

export async function insertCategory(householdId: string, name: string): Promise<string> {
  const { data, error } = await supabase
    .from('categories')
    .insert({ household_id: householdId, name, type: 'expense' })
    .select('id')
    .single()
  if (error) throw error
  return data.id as string
}

export async function insertContribution(input: {
  householdId: string
  fundId: string
  memberId: string | null
  amount: number
  dateMs: number
}): Promise<string> {
  const { data, error } = await supabase
    .from('contributions')
    .insert({
      household_id: input.householdId,
      fund_id: input.fundId,
      member_id: input.memberId,
      amount: input.amount,
      occurred_at: iso(input.dateMs),
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id as string
}
