/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import type {
  AppData, ColorKey, Contrib, EntryForm, OnboardingDraft, Screen, Tab, Txn, User,
} from './types'
import { COLORS } from './theme'
import { seed, todayISO, uid } from './store'
import { supabase } from './lib/supabase'
import type { DbMember } from './lib/db'
import {
  createHousehold, deleteBudget, deleteMyHousehold, deleteTransaction, insertCategory,
  insertContribution, insertTransaction, loadHousehold, subscribeHousehold, updateTransaction,
  upsertBudget,
} from './lib/db'

const toISODate = (ms: number) => {
  const d = new Date(ms)
  return new Date(ms - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

type Mode = 'cloud' | 'demo'

// Largest accepted money value — blocks a typed `1e999` from setting a balance
// or budget to Infinity (would poison every derived total thereafter).
const MAX_AMOUNT = 1e12

export type ToastTone = 'info' | 'success' | 'error'
export interface ToastState {
  msg: string
  tone: ToastTone
  action?: { label: string; run: () => void }
}
interface FlashOpts { tone?: ToastTone; action?: { label: string; run: () => void } }

export interface Pending {
  submit: boolean
  contrib: boolean
  finish: boolean
  addCat: boolean
  refresh: boolean
}

interface Ctx {
  // session / routing
  initializing: boolean
  mode: Mode
  screen: Screen
  menuOpen: boolean
  setMenuOpen: (v: boolean) => void
  // identity
  user: User | null
  members: DbMember[]
  currency: string
  lastSyncedAt: number | null
  // data
  data: AppData
  tab: Tab
  filter: string
  toast: ToastState | null
  form: EntryForm
  budgetEdits: Record<string, string>
  newCat: string
  contrib: { fundId: string; amount: string; member: string }
  pending: Pending
  editingId: string | null
  // onboarding
  ob: OnboardingDraft
  obStep: number
  setOb: (patch: Partial<OnboardingDraft>) => void
  obNext: () => void
  obSkipPartner: () => void
  obBack: () => void
  // actions
  setScreen: (s: Screen) => void
  setTab: (t: Tab) => void
  setFilter: (f: string) => void
  setForm: (patch: Partial<EntryForm>) => void
  setBudgetEdit: (catId: string, value: string) => void
  commitBudgetEdit: (catId: string) => void
  setNewCat: (v: string) => void
  addCategory: () => void
  setContrib: (patch: Partial<{ fundId: string; amount: string; member: string }>) => void
  contribute: () => void
  submitTxn: () => void
  startEdit: (id: string) => void
  cancelEdit: () => void
  newEntry: () => void
  deleteTxn: (id: string) => void
  flash: (msg: string, opts?: FlashOpts) => void
  refresh: () => void
  exportData: () => void
  deleteMyData: () => void
  startGoogle: () => void
  continueAsGuest: () => void
  signOut: () => void
  // helpers
  fmt: (n: number, dec?: number) => string
  num: (n: number, dec?: number) => string
  person: (member: string) => { fg: string; bg: string }
  scrollRef: React.RefObject<HTMLDivElement | null>
}

const AppCtx = createContext<Ctx | null>(null)

const EMPTY_DATA: AppData = { txns: [], cats: [], budgets: {}, funds: [], contribs: [] }
const DEFAULT_OB: OnboardingDraft = {
  yourName: '', yourColor: 'indigo', partnerName: '', partnerColor: 'rose', currency: 'AED', suggested: true,
}

const demoMembers = (): DbMember[] => [
  { id: 'demo-0', name: 'Star', color: 'indigo', userId: null, role: 'owner' },
  { id: 'demo-1', name: 'Niki', color: 'rose', userId: null, role: 'member' },
]

export function AppProvider({ children }: { children: ReactNode }) {
  const [initializing, setInitializing] = useState(true)
  const [mode, setMode] = useState<Mode>('cloud')
  const [screen, setScreen] = useState<Screen>('auth')
  const [menuOpen, setMenuOpen] = useState(false)

  const [user, setUser] = useState<User | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [members, setMembers] = useState<DbMember[]>(demoMembers())
  const [currency, setCurrency] = useState('AED')
  const [householdId, setHouseholdId] = useState<string | null>(null)
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null)

  const [data, setData] = useState<AppData>(EMPTY_DATA)
  const [tab, setTabState] = useState<Tab>('home')
  const [filter, setFilter] = useState('all')
  const [toast, setToast] = useState<ToastState | null>(null)
  const [form, setFormState] = useState<EntryForm>({
    type: 'expense', amount: '', date: todayISO(), catId: '', member: 'Star', scope: 'shared', notes: '',
  })
  const [budgetEdits, setBudgetEdits] = useState<Record<string, string>>({})
  const [newCat, setNewCat] = useState('')
  const [contrib, setContribState] = useState({ fundId: '', amount: '', member: 'Star' })
  const [pending, setPending] = useState<Pending>({
    submit: false, contrib: false, finish: false, addCat: false, refresh: false,
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  const [ob, setObState] = useState<OnboardingDraft>(DEFAULT_OB)
  const [obStep, setObStep] = useState(0)

  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const hydrating = useRef(false)

  const setPendingKey = useCallback((k: keyof Pending, v: boolean) => {
    setPending((p) => ({ ...p, [k]: v }))
  }, [])

  const flash = useCallback((msg: string, opts: FlashOpts = {}) => {
    const tone = opts.tone ?? 'info'
    setToast({ msg, tone, action: opts.action })
    clearTimeout(toastTimer.current)
    // Actionable / error toasts linger so they can be read and acted on.
    const ttl = opts.action ? 6000 : tone === 'error' ? 3500 : 2200
    toastTimer.current = setTimeout(() => setToast(null), ttl)
  }, [])

  // Set the household data (used by both first load and live refetch). Does NOT
  // touch the in-progress form, so a background sync never clobbers typing.
  const setBundleData = useCallback((b: NonNullable<Awaited<ReturnType<typeof loadHousehold>>>) => {
    setHouseholdId(b.householdId)
    setMembers(b.members)
    setCurrency(b.currency)
    setData(b.data)
    setLastSyncedAt(Date.now())
  }, [])

  const applyBundle = useCallback((b: NonNullable<Awaited<ReturnType<typeof loadHousehold>>>) => {
    setBundleData(b)
    setFormState((f) => ({ ...f, member: b.members[0].name, date: todayISO() }))
    setContribState((c) => ({
      ...c,
      member: b.members[0].name,
      fundId: c.fundId || (b.data.funds[0]?.id ?? ''),
    }))
  }, [setBundleData])

  // Re-pull the whole household from the server (manual refresh / realtime echo).
  const refetch = useCallback(async (announce = false) => {
    if (!userId) return
    if (announce) setPendingKey('refresh', true)
    try {
      const bundle = await loadHousehold(userId)
      if (bundle) setBundleData(bundle)
      if (announce) flash('Up to date', { tone: 'success' })
    } catch {
      if (announce) flash('Could not refresh — check your connection', { tone: 'error' })
    } finally {
      if (announce) setPendingKey('refresh', false)
    }
  }, [userId, setBundleData, flash, setPendingKey])

  const refresh = useCallback(() => { void refetch(true) }, [refetch])

  // Hydrate from a Supabase session: route to the app (existing household) or onboarding (new user).
  const hydrate = useCallback(async (session: Session) => {
    if (hydrating.current) return
    hydrating.current = true
    try {
      const meta = session.user.user_metadata ?? {}
      const u: User = { name: meta.full_name ?? meta.name ?? '', email: session.user.email ?? '' }
      setMode('cloud')
      setUser(u)
      setUserId(session.user.id)
      const bundle = await loadHousehold(session.user.id)
      if (bundle) {
        applyBundle(bundle)
        setScreen('app')
      } else {
        setObState((prev) => ({ ...prev, yourName: (meta.given_name ?? meta.name ?? '').split(' ')[0] ?? '' }))
        setObStep(0)
        setScreen('onboarding')
      }
    } catch {
      flash('Could not load your data', { tone: 'error' })
    } finally {
      hydrating.current = false
      setInitializing(false)
    }
  }, [applyBundle, flash])

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN') && session) {
        void hydrate(session)
      } else if (event === 'INITIAL_SESSION' && !session) {
        setInitializing(false)
      } else if (event === 'SIGNED_OUT') {
        setMode('cloud')
        setUser(null)
        setUserId(null)
        setHouseholdId(null)
        setLastSyncedAt(null)
        setMembers(demoMembers())
        setData(EMPTY_DATA)
        setScreen('auth')
        setMenuOpen(false)
        setObStep(0)
        setTabState('home')
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [hydrate])

  // Live multi-device sync: subscribe to this household's changes and refetch on
  // any change, on tab re-focus, and when the network comes back.
  useEffect(() => {
    if (mode !== 'cloud' || !householdId || !userId) return
    let timer: ReturnType<typeof setTimeout> | undefined
    const debounced = () => { clearTimeout(timer); timer = setTimeout(() => { void refetch() }, 400) }
    const unsub = subscribeHousehold(householdId, debounced)
    const onVisible = () => { if (document.visibilityState === 'visible') debounced() }
    const onOnline = () => debounced()
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('online', onOnline)
    return () => {
      clearTimeout(timer)
      unsub()
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('online', onOnline)
    }
  }, [mode, householdId, userId, refetch])

  const fmt = useCallback(
    (n: number, dec = 2) => {
      const v = Number(n)
      const sign = v < 0 ? '-' : ''
      // Sign leads the currency code (-AED 1,234), not the number (AED -1,234).
      return sign + currency + ' ' + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })
    },
    [currency],
  )
  const num = useCallback(
    (n: number, dec = 0) =>
      Number(n).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }),
    [],
  )
  const person = useCallback(
    (m: string) => {
      const mem = members.find((x) => x.name === m)
      return COLORS[(mem ? mem.color : 'indigo') as ColorKey]
    },
    [members],
  )
  const memberId = useCallback(
    (name: string) => members.find((m) => m.name === name)?.id ?? null,
    [members],
  )

  const setTab = useCallback((t: Tab) => {
    setTabState(t)
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [])

  // ---- auth ----
  const startGoogle = useCallback(() => {
    const redirectTo = window.location.origin + import.meta.env.BASE_URL
    void supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
  }, [])

  const continueAsGuest = useCallback(() => {
    const m = demoMembers()
    const d = seed('Star', 'Niki')
    setMode('demo')
    setUser(null)
    setUserId(null)
    setHouseholdId(null)
    setMembers(m)
    setCurrency('AED')
    setData(d)
    setFormState((f) => ({ ...f, member: 'Star', date: todayISO() }))
    setContribState((c) => ({ ...c, member: 'Star', fundId: d.funds[0]?.id ?? '' }))
    setTabState('home')
    setScreen('app')
    flash('Exploring the demo')
  }, [flash])

  const signOut = useCallback(() => {
    if (mode === 'demo') {
      setMode('cloud')
      setData(EMPTY_DATA)
      setMembers(demoMembers())
      setScreen('auth')
      setMenuOpen(false)
      return
    }
    void supabase.auth.signOut()
  }, [mode])

  // ---- account / data ----
  const exportData = useCallback(() => {
    const bundle = {
      exportedAt: new Date().toISOString(),
      currency,
      members: members.map((m) => ({ name: m.name, color: m.color, role: m.role })),
      data,
    }
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'couples-budget-export.json'
    a.click()
    URL.revokeObjectURL(url)
    flash('Data exported', { tone: 'success' })
  }, [currency, members, data, flash])

  const deleteMyData = useCallback(() => {
    if (mode === 'demo') { signOut(); return }
    const ok = window.confirm(
      'Permanently delete your household and all of its data? This cannot be undone.',
    )
    if (!ok) return
    void deleteMyHousehold()
      .then(() => {
        flash('Your data was deleted', { tone: 'success' })
        void supabase.auth.signOut()
      })
      .catch(() => flash('Could not delete your data — try again', { tone: 'error' }))
  }, [mode, signOut, flash])

  // ---- onboarding (cloud) ----
  const finishSetup = useCallback(() => {
    if (pending.finish) return
    let pColor = ob.partnerColor
    if (pColor === ob.yourColor) pColor = ob.yourColor === 'rose' ? 'indigo' : 'rose'
    const hasPartner = ob.partnerName.trim().length > 0
    setPendingKey('finish', true)
    void (async () => {
      try {
        await createHousehold({
          currency: ob.currency,
          yourName: ob.yourName.trim(),
          yourColor: ob.yourColor,
          partnerName: hasPartner ? ob.partnerName.trim() : '',
          partnerColor: pColor,
          suggested: ob.suggested,
        })
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { flash('Session expired — sign in again', { tone: 'error' }); return }
        setUserId(session.user.id)
        const bundle = await loadHousehold(session.user.id)
        if (bundle) applyBundle(bundle)
        setTabState('home')
        setScreen('app')
        flash("You're all set, " + ob.yourName.trim(), { tone: 'success' })
      } catch {
        flash('Could not finish setup', { tone: 'error' })
      } finally {
        setPendingKey('finish', false)
      }
    })()
  }, [ob, pending.finish, applyBundle, flash, setPendingKey])

  const obNext = useCallback(() => {
    if (obStep === 0 && !ob.yourName.trim()) return flash('Enter your name', { tone: 'error' })
    if (obStep === 1 && ob.partnerName.trim()) {
      // A partner name is optional, but if given it must differ from yours.
      if (ob.partnerName.trim().toLowerCase() === ob.yourName.trim().toLowerCase())
        return flash('Use two different names', { tone: 'error' })
    }
    if (obStep < 2) return setObStep(obStep + 1)
    finishSetup()
  }, [ob, obStep, finishSetup, flash])

  const obSkipPartner = useCallback(() => {
    setObState((prev) => ({ ...prev, partnerName: '' }))
    setObStep(2)
  }, [])

  const obBack = useCallback(() => {
    if (obStep === 0) signOut()
    else setObStep(obStep - 1)
  }, [obStep, signOut])

  // ---- editing ----
  const startEdit = useCallback((id: string) => {
    const t = data.txns.find((x) => x.id === id)
    if (!t) return
    setFormState({
      type: t.type, amount: String(t.amount), date: toISODate(t.date), catId: t.catId,
      member: t.member, scope: t.scope, notes: t.notes,
    })
    setEditingId(id)
    setTabState('add')
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [data])

  const cancelEdit = useCallback(() => {
    setEditingId(null)
    setFormState((f) => ({ ...f, amount: '', notes: '', catId: '' }))
    setTabState('activity')
  }, [])

  const newEntry = useCallback(() => {
    setEditingId(null)
    setFormState((f) => ({ ...f, amount: '', notes: '', catId: '' }))
    setTab('add')
  }, [setTab])

  // ---- mutations ----
  const submitTxn = useCallback(() => {
    if (pending.submit) return
    const amt = parseFloat(form.amount)
    if (!Number.isFinite(amt) || amt <= 0) return flash('Enter a valid amount', { tone: 'error' })
    if (amt > MAX_AMOUNT) return flash('That amount is too large', { tone: 'error' })
    const cats = data.cats.filter((c) => c.type === form.type)
    if (!form.catId || !cats.find((c) => c.id === form.catId)) return flash('Pick a category', { tone: 'error' })
    const dateMs = new Date(form.date + 'T12:00:00').getTime()
    const type = form.type
    const fields = {
      type, amount: amt, dateMs, categoryId: form.catId,
      memberId: memberId(form.member), scope: form.scope, notes: form.notes,
    }

    // ---- edit an existing entry ----
    if (editingId) {
      const id = editingId
      const prev = data.txns.find((x) => x.id === id)
      const next: Txn = {
        id, type, amount: amt, date: dateMs, catId: form.catId,
        member: form.member, scope: form.scope, notes: form.notes,
      }
      const applyLocal = (t: Txn) => setData((d) => ({ ...d, txns: d.txns.map((x) => (x.id === id ? t : x)) }))
      applyLocal(next)
      setEditingId(null)
      setFormState((f) => ({ ...f, amount: '', notes: '', catId: '' }))
      setTabState('activity')
      if (mode === 'demo') return flash('Entry updated', { tone: 'success' })
      if (!householdId) return
      setPendingKey('submit', true)
      updateTransaction(id, fields)
        .then(() => flash('Entry updated', { tone: 'success' }))
        .catch(() => {
          if (prev) applyLocal(prev) // roll back to the pre-edit values
          flash('Update failed — change reverted', { tone: 'error' })
        })
        .finally(() => setPendingKey('submit', false))
      return
    }

    // ---- create a new entry ----
    const append = (id: string) => {
      const txn: Txn = {
        id, type, amount: amt, date: dateMs, catId: form.catId,
        member: form.member, scope: form.scope, notes: form.notes,
      }
      setData((prev) => ({ ...prev, txns: [txn, ...prev.txns] }))
      setFormState((f) => ({ ...f, amount: '', notes: '', catId: '' }))
      setTabState('home')
      flash(type === 'income' ? 'Income logged' : 'Expense logged', { tone: 'success' })
      if (scrollRef.current) scrollRef.current.scrollTop = 0
    }

    if (mode === 'demo') return append(uid())
    if (!householdId) return

    const payload = { householdId, ...fields }
    // Commit only on a confirmed write — no phantom rows — and keep the entry
    // recoverable via an explicit Retry instead of letting it vanish on failure.
    const run = () => {
      setPendingKey('submit', true)
      insertTransaction(payload)
        .then(append)
        .catch(() => flash('Could not save — check your connection', {
          tone: 'error', action: { label: 'Retry', run },
        }))
        .finally(() => setPendingKey('submit', false))
    }
    run()
  }, [form, data, mode, householdId, memberId, flash, pending.submit, setPendingKey, editingId])

  const deleteTxn = useCallback((id: string) => {
    const txn = data.txns.find((x) => x.id === id)
    if (!txn) return
    setData((prev) => ({ ...prev, txns: prev.txns.filter((x) => x.id !== id) }))

    if (mode === 'demo') {
      flash('Entry deleted', { action: { label: 'Undo', run: () => setData((prev) => ({ ...prev, txns: [txn, ...prev.txns] })) } })
      return
    }

    const restore = () => setData((prev) => ({ ...prev, txns: [txn, ...prev.txns] }))
    const undo = () => {
      // Re-create the deleted entry on the server (its old row is gone).
      void insertTransaction({
        householdId: householdId!, type: txn.type, amount: txn.amount, dateMs: txn.date,
        categoryId: txn.catId, memberId: memberId(txn.member), scope: txn.scope, notes: txn.notes,
      })
        .then((newId) => setData((prev) => ({ ...prev, txns: [{ ...txn, id: newId }, ...prev.txns] })))
        .catch(() => flash('Undo failed — try again', { tone: 'error' }))
    }
    void deleteTransaction(id)
      .then(() => flash('Entry deleted', { action: { label: 'Undo', run: undo } }))
      .catch(() => { restore(); flash('Delete failed — entry restored', { tone: 'error' }) })
  }, [data, mode, householdId, memberId, flash])

  const commitBudgetEdit = useCallback((catId: string) => {
    const raw = budgetEdits[catId]
    if (raw === undefined) return
    const parsed = parseFloat(raw)
    const valid = Number.isFinite(parsed) && parsed > 0 && parsed <= MAX_AMOUNT
    const next = valid ? parsed : undefined
    const prevVal = data.budgets[catId]

    setBudgetEdits((prev) => {
      const n = { ...prev }
      delete n[catId]
      return n
    })

    // No-op: value unchanged → clear the edit, skip the write and the false toast.
    if (next === prevVal) return

    setData((prev) => {
      const budgets = { ...prev.budgets }
      if (next === undefined) delete budgets[catId]
      else budgets[catId] = next
      return { ...prev, budgets }
    })
    flash('Budget updated', { tone: 'success' })

    if (mode === 'cloud' && householdId) {
      const op = next === undefined ? deleteBudget(householdId, catId) : upsertBudget(householdId, catId, next)
      void op.catch(() => {
        // Roll back to the prior value rather than leaving a divergent number.
        setData((prev) => {
          const budgets = { ...prev.budgets }
          if (prevVal === undefined) delete budgets[catId]
          else budgets[catId] = prevVal
          return { ...prev, budgets }
        })
        flash('Budget save failed — change reverted', { tone: 'error' })
      })
    }
  }, [budgetEdits, data, mode, householdId, flash])

  const addCategory = useCallback(() => {
    if (pending.addCat) return
    const name = newCat.trim()
    if (!name) return
    const append = (id: string) => {
      setData((prev) => ({ ...prev, cats: [...prev.cats, { id, name, type: 'expense' }] }))
      setNewCat('')
      flash('Category added', { tone: 'success' })
    }
    if (mode === 'demo') return append(uid())
    if (!householdId) return
    setPendingKey('addCat', true)
    void insertCategory(householdId, name)
      .then(append)
      .catch(() => flash('Could not add category', { tone: 'error' }))
      .finally(() => setPendingKey('addCat', false))
  }, [newCat, mode, householdId, flash, pending.addCat, setPendingKey])

  const contribute = useCallback(() => {
    if (pending.contrib) return
    const amt = parseFloat(contrib.amount)
    if (!Number.isFinite(amt) || amt === 0) return flash('Enter an amount', { tone: 'error' })
    if (Math.abs(amt) > MAX_AMOUNT) return flash('That amount is too large', { tone: 'error' })
    if (!contrib.fundId) return flash('Pick a fund', { tone: 'error' })
    const dateMs = Date.now()
    const append = (id: string) => {
      const entry: Contrib = { id, fundId: contrib.fundId, amount: amt, member: contrib.member, date: dateMs }
      setData((prev) => ({
        ...prev,
        funds: prev.funds.map((fd) => (fd.id === contrib.fundId ? { ...fd, balance: fd.balance + amt } : fd)),
        contribs: [entry, ...prev.contribs],
      }))
      setContribState((c) => ({ ...c, amount: '' }))
      flash(amt > 0 ? 'Contribution added' : 'Withdrawal recorded', { tone: 'success' })
    }
    if (mode === 'demo') return append(uid())
    if (!householdId) return

    const payload = {
      householdId, fundId: contrib.fundId, memberId: memberId(contrib.member), amount: amt, dateMs,
    }
    const run = () => {
      setPendingKey('contrib', true)
      insertContribution(payload)
        .then(append)
        .catch(() => flash('Could not save contribution', {
          tone: 'error', action: { label: 'Retry', run },
        }))
        .finally(() => setPendingKey('contrib', false))
    }
    run()
  }, [contrib, mode, householdId, memberId, flash, pending.contrib, setPendingKey])

  const value = useMemo<Ctx>(() => ({
    initializing, mode, screen, menuOpen, setMenuOpen,
    user, members, currency, lastSyncedAt, data, tab, filter, toast, form, budgetEdits, newCat, contrib, pending,
    editingId,
    ob, obStep,
    setOb: (patch) => setObState((prev) => ({ ...prev, ...patch })),
    obNext, obSkipPartner, obBack,
    setScreen, setTab, setFilter,
    setForm: (patch) => setFormState((prev) => ({ ...prev, ...patch })),
    setBudgetEdit: (catId, v) => setBudgetEdits((prev) => ({ ...prev, [catId]: v })),
    commitBudgetEdit,
    setNewCat, addCategory,
    setContrib: (patch) => setContribState((prev) => ({ ...prev, ...patch })),
    contribute, submitTxn, startEdit, cancelEdit, newEntry, deleteTxn, flash, refresh, exportData, deleteMyData,
    startGoogle, continueAsGuest, signOut,
    fmt, num, person, scrollRef,
  }), [
    initializing, mode, screen, menuOpen, user, members, currency, lastSyncedAt, data, tab, filter, toast,
    form, budgetEdits, newCat, contrib, pending, editingId, ob, obStep,
    obNext, obSkipPartner, obBack, setTab, commitBudgetEdit, addCategory, contribute, submitTxn,
    startEdit, cancelEdit, newEntry, deleteTxn,
    flash, refresh, exportData, deleteMyData, startGoogle, continueAsGuest, signOut, fmt, num, person,
  ])

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useApp() {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
