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
  createHousehold, deleteBudget, deleteTransaction, insertCategory, insertContribution,
  insertTransaction, loadHousehold, upsertBudget,
} from './lib/db'

type Mode = 'cloud' | 'demo'

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
  // data
  data: AppData
  tab: Tab
  filter: string
  toast: string
  form: EntryForm
  budgetEdits: Record<string, string>
  newCat: string
  contrib: { fundId: string; amount: string; member: string }
  // onboarding
  ob: OnboardingDraft
  obStep: number
  setOb: (patch: Partial<OnboardingDraft>) => void
  obNext: () => void
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
  deleteTxn: (id: string) => void
  flash: (msg: string) => void
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
  const [members, setMembers] = useState<DbMember[]>(demoMembers())
  const [currency, setCurrency] = useState('AED')
  const [householdId, setHouseholdId] = useState<string | null>(null)

  const [data, setData] = useState<AppData>(EMPTY_DATA)
  const [tab, setTabState] = useState<Tab>('home')
  const [filter, setFilter] = useState('all')
  const [toast, setToast] = useState('')
  const [form, setFormState] = useState<EntryForm>({
    type: 'expense', amount: '', date: todayISO(), catId: '', member: 'Star', scope: 'shared', notes: '',
  })
  const [budgetEdits, setBudgetEdits] = useState<Record<string, string>>({})
  const [newCat, setNewCat] = useState('')
  const [contrib, setContribState] = useState({ fundId: '', amount: '', member: 'Star' })

  const [ob, setObState] = useState<OnboardingDraft>(DEFAULT_OB)
  const [obStep, setObStep] = useState(0)

  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const hydrating = useRef(false)

  const flash = useCallback((msg: string) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2200)
  }, [])

  const applyBundle = useCallback((b: NonNullable<Awaited<ReturnType<typeof loadHousehold>>>) => {
    setHouseholdId(b.householdId)
    setMembers(b.members)
    setCurrency(b.currency)
    setData(b.data)
    setFormState((f) => ({ ...f, member: b.members[0].name, date: todayISO() }))
    setContribState((c) => ({
      ...c,
      member: b.members[0].name,
      fundId: c.fundId || (b.data.funds[0]?.id ?? ''),
    }))
  }, [])

  // Hydrate from a Supabase session: route to the app (existing household) or onboarding (new user).
  const hydrate = useCallback(async (session: Session) => {
    if (hydrating.current) return
    hydrating.current = true
    try {
      const meta = session.user.user_metadata ?? {}
      const u: User = { name: meta.full_name ?? meta.name ?? '', email: session.user.email ?? '' }
      setMode('cloud')
      setUser(u)
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
      flash('Could not load your data')
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
        setHouseholdId(null)
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

  const fmt = useCallback(
    (n: number, dec = 2) =>
      currency + ' ' + Number(n).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }),
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

  // ---- onboarding (cloud) ----
  const obNext = useCallback(() => {
    if (obStep === 0 && !ob.yourName.trim()) return flash('Enter your name')
    if (obStep === 1) {
      if (!ob.partnerName.trim()) return flash("Enter your partner's name")
      if (ob.partnerName.trim().toLowerCase() === ob.yourName.trim().toLowerCase())
        return flash('Use two different names')
    }
    if (obStep < 2) return setObStep(obStep + 1)
    let pColor = ob.partnerColor
    if (pColor === ob.yourColor) pColor = ob.yourColor === 'rose' ? 'indigo' : 'rose'
    void (async () => {
      try {
        await createHousehold({
          currency: ob.currency,
          yourName: ob.yourName.trim(),
          yourColor: ob.yourColor,
          partnerName: ob.partnerName.trim(),
          partnerColor: pColor,
          suggested: ob.suggested,
        })
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return flash('Session expired — sign in again')
        const bundle = await loadHousehold(session.user.id)
        if (bundle) applyBundle(bundle)
        setTabState('home')
        setScreen('app')
        flash("You're all set, " + ob.yourName.trim())
      } catch {
        flash('Could not finish setup')
      }
    })()
  }, [ob, obStep, applyBundle, flash])

  const obBack = useCallback(() => {
    if (obStep === 0) signOut()
    else setObStep(obStep - 1)
  }, [obStep, signOut])

  // ---- mutations ----
  const submitTxn = useCallback(() => {
    const amt = parseFloat(form.amount)
    if (!amt || amt <= 0) return flash('Enter a valid amount')
    const cats = data.cats.filter((c) => c.type === form.type)
    if (!form.catId || !cats.find((c) => c.id === form.catId)) return flash('Pick a category')
    const dateMs = new Date(form.date + 'T12:00:00').getTime()

    const append = (id: string) => {
      const txn: Txn = {
        id, type: form.type, amount: amt, date: dateMs, catId: form.catId,
        member: form.member, scope: form.scope, notes: form.notes,
      }
      setData((prev) => ({ ...prev, txns: [txn, ...prev.txns] }))
      setFormState((f) => ({ ...f, amount: '', notes: '', catId: '' }))
      setTabState('home')
      flash(form.type === 'income' ? 'Income logged' : 'Expense logged')
      if (scrollRef.current) scrollRef.current.scrollTop = 0
    }

    if (mode === 'demo') return append(uid())
    if (!householdId) return
    void insertTransaction({
      householdId, type: form.type, amount: amt, dateMs,
      categoryId: form.catId, memberId: memberId(form.member), scope: form.scope, notes: form.notes,
    }).then(append).catch(() => flash('Could not save — check your connection'))
  }, [form, data, mode, householdId, memberId, flash])

  const deleteTxn = useCallback((id: string) => {
    setData((prev) => ({ ...prev, txns: prev.txns.filter((x) => x.id !== id) }))
    flash('Entry deleted')
    if (mode === 'cloud') void deleteTransaction(id).catch(() => flash('Delete failed — refresh to resync'))
  }, [mode, flash])

  const commitBudgetEdit = useCallback((catId: string) => {
    const raw = budgetEdits[catId]
    if (raw === undefined) return
    const val = parseFloat(raw)
    setBudgetEdits((prev) => {
      const next = { ...prev }
      delete next[catId]
      return next
    })
    setData((prev) => {
      const budgets = { ...prev.budgets }
      if (!val || val <= 0) delete budgets[catId]
      else budgets[catId] = val
      return { ...prev, budgets }
    })
    flash('Budget updated')
    if (mode === 'cloud' && householdId) {
      const op = !val || val <= 0 ? deleteBudget(householdId, catId) : upsertBudget(householdId, catId, val)
      void op.catch(() => flash('Budget save failed — refresh to resync'))
    }
  }, [budgetEdits, mode, householdId, flash])

  const addCategory = useCallback(() => {
    const name = newCat.trim()
    if (!name) return
    const append = (id: string) => {
      setData((prev) => ({ ...prev, cats: [...prev.cats, { id, name, type: 'expense' }] }))
      setNewCat('')
      flash('Category added')
    }
    if (mode === 'demo') return append(uid())
    if (!householdId) return
    void insertCategory(householdId, name).then(append).catch(() => flash('Could not add category'))
  }, [newCat, mode, householdId, flash])

  const contribute = useCallback(() => {
    const amt = parseFloat(contrib.amount)
    if (!amt) return flash('Enter an amount')
    const dateMs = Date.now()
    const append = (id: string) => {
      const entry: Contrib = { id, fundId: contrib.fundId, amount: amt, member: contrib.member, date: dateMs }
      setData((prev) => ({
        ...prev,
        funds: prev.funds.map((fd) => (fd.id === contrib.fundId ? { ...fd, balance: fd.balance + amt } : fd)),
        contribs: [entry, ...prev.contribs],
      }))
      setContribState((c) => ({ ...c, amount: '' }))
      flash(amt > 0 ? 'Contribution added' : 'Withdrawal recorded')
    }
    if (mode === 'demo') return append(uid())
    if (!householdId) return
    void insertContribution({
      householdId, fundId: contrib.fundId, memberId: memberId(contrib.member), amount: amt, dateMs,
    }).then(append).catch(() => flash('Could not save contribution'))
  }, [contrib, mode, householdId, memberId, flash])

  const value = useMemo<Ctx>(() => ({
    initializing, mode, screen, menuOpen, setMenuOpen,
    user, members, currency, data, tab, filter, toast, form, budgetEdits, newCat, contrib,
    ob, obStep,
    setOb: (patch) => setObState((prev) => ({ ...prev, ...patch })),
    obNext, obBack,
    setScreen, setTab, setFilter,
    setForm: (patch) => setFormState((prev) => ({ ...prev, ...patch })),
    setBudgetEdit: (catId, v) => setBudgetEdits((prev) => ({ ...prev, [catId]: v })),
    commitBudgetEdit,
    setNewCat, addCategory,
    setContrib: (patch) => setContribState((prev) => ({ ...prev, ...patch })),
    contribute, submitTxn, deleteTxn, flash,
    startGoogle, continueAsGuest, signOut,
    fmt, num, person, scrollRef,
  }), [
    initializing, mode, screen, menuOpen, user, members, currency, data, tab, filter, toast,
    form, budgetEdits, newCat, contrib, ob, obStep,
    obNext, obBack, setTab, commitBudgetEdit, addCategory, contribute, submitTxn, deleteTxn,
    flash, startGoogle, continueAsGuest, signOut, fmt, num, person,
  ])

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useApp() {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
