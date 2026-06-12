/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  AppData, ColorKey, Contrib, EntryForm, Member, OnboardingDraft, Screen, Tab, Txn, User,
} from './types'
import { COLORS } from './theme'
import {
  clearProfile, loadData, loadProfile, saveData, saveProfile, seed, todayISO, uid,
} from './store'

interface AppState {
  screen: Screen
  oauthOpen: boolean
  menuOpen: boolean
  obStep: number
  ob: OnboardingDraft
  user: User | null
  members: Member[]
  currency: string
  tab: Tab
  filter: string
  toast: string
  data: AppData
  form: EntryForm
  budgetEdits: Record<string, string>
  newCat: string
  contrib: { fundId: string; amount: string; member: string }
}

interface AppActions {
  setOauthOpen: (v: boolean) => void
  setMenuOpen: (v: boolean) => void
  setOb: (patch: Partial<OnboardingDraft>) => void
  setObStep: (n: number) => void
  setScreen: (s: Screen) => void
  setUser: (u: User | null) => void
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
  pickOauthAccount: (user: User) => void
  continueAsGuest: () => void
  obNext: () => void
  obBack: () => void
  signOut: () => void
  fmt: (n: number, dec?: number) => string
  num: (n: number, dec?: number) => string
  person: (member: string) => { fg: string; bg: string }
  scrollRef: React.RefObject<HTMLDivElement | null>
}

const Ctx = createContext<(AppState & AppActions) | null>(null)

const EMPTY_DATA: AppData = { txns: [], cats: [], budgets: {}, funds: [], contribs: [] }

const DEFAULT_OB: OnboardingDraft = {
  yourName: '', yourColor: 'indigo', partnerName: '', partnerColor: 'rose', currency: 'AED', suggested: true,
}

// Hydrate once at boot: a stored profile means a returning visit — skip straight to the app.
const boot = (() => {
  const profile = loadProfile()
  if (!profile) return null
  return {
    profile,
    data: loadData() ?? seed(profile.members[0].name, profile.members[1].name),
  }
})()

export function AppProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>(boot ? 'app' : 'auth')
  const [oauthOpen, setOauthOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [obStep, setObStep] = useState(0)
  const [ob, setObState] = useState<OnboardingDraft>(DEFAULT_OB)
  const [user, setUser] = useState<User | null>(boot ? boot.profile.user : null)
  const [members, setMembers] = useState<Member[]>(
    boot ? boot.profile.members : [
      { name: 'Star', color: 'indigo' },
      { name: 'Niki', color: 'rose' },
    ],
  )
  const [currency, setCurrency] = useState(boot ? boot.profile.currency || 'AED' : 'AED')
  const [tab, setTabState] = useState<Tab>('home')
  const [filter, setFilter] = useState('all')
  const [toast, setToast] = useState('')
  const [data, setData] = useState<AppData>(boot ? boot.data : EMPTY_DATA)
  const [form, setFormState] = useState<EntryForm>({
    type: 'expense', amount: '', date: todayISO(), catId: '',
    member: boot ? boot.profile.members[0].name : 'Star', scope: 'shared', notes: '',
  })
  const [budgetEdits, setBudgetEdits] = useState<Record<string, string>>({})
  const [newCat, setNewCat] = useState('')
  const [contrib, setContribState] = useState({
    fundId: 'f1', amount: '', member: boot ? boot.profile.members[0].name : 'Star',
  })

  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const flash = useCallback((msg: string) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2200)
  }, [])

  const persist = useCallback((patch: Partial<AppData>) => {
    setData((prev) => {
      const next = { ...prev, ...patch }
      saveData(next)
      return next
    })
  }, [])

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

  const setTab = useCallback((t: Tab) => {
    setTabState(t)
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [])

  const finishSetup = useCallback(
    (newMembers: Member[], cur: string, newUser: User | null, opts: { reuseData?: boolean; suggested?: boolean } = {}) => {
      let stored: AppData | null = null
      if (opts.reuseData) stored = loadData()
      const names = newMembers.map((m) => m.name)
      const ok = stored && stored.txns.length > 0 && stored.txns.every((t) => names.indexOf(t.member) >= 0)
      let next = ok && stored ? stored : seed(names[0], names[1])
      if (opts.suggested === false) next = { ...next, budgets: {} }
      saveProfile({ user: newUser, members: newMembers, currency: cur })
      saveData(next)
      setScreen('app')
      setUser(newUser)
      setMembers(newMembers)
      setCurrency(cur)
      setData(next)
      setFormState((f) => ({ ...f, member: names[0], date: todayISO() }))
      setContribState((c) => ({ ...c, member: names[0] }))
      setTabState('home')
      setMenuOpen(false)
      setOauthOpen(false)
      flash("You're all set, " + names[0])
    },
    [flash],
  )

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
    const newMembers: Member[] = [
      { name: ob.yourName.trim(), color: ob.yourColor },
      { name: ob.partnerName.trim(), color: pColor },
    ]
    finishSetup(newMembers, ob.currency, user, { reuseData: true, suggested: ob.suggested })
  }, [ob, obStep, user, finishSetup, flash])

  const obBack = useCallback(() => {
    if (obStep === 0) setScreen('auth')
    else setObStep(obStep - 1)
  }, [obStep])

  const signOut = useCallback(() => {
    clearProfile()
    setScreen('auth')
    setMenuOpen(false)
    setOauthOpen(false)
    setObStep(0)
    setUser(null)
    setTabState('home')
  }, [])

  const submitTxn = useCallback(() => {
    const amt = parseFloat(form.amount)
    if (!amt || amt <= 0) return flash('Enter a valid amount')
    const cats = data.cats.filter((c) => c.type === form.type)
    if (!form.catId || !cats.find((c) => c.id === form.catId)) return flash('Pick a category')
    const txn: Txn = {
      id: uid(),
      type: form.type,
      amount: amt,
      date: new Date(form.date + 'T12:00:00').getTime(),
      catId: form.catId,
      member: form.member,
      scope: form.scope,
      notes: form.notes,
    }
    persist({ txns: [txn, ...data.txns] })
    setFormState((f) => ({ ...f, amount: '', notes: '', catId: '' }))
    setTabState('home')
    flash(form.type === 'income' ? 'Income logged' : 'Expense logged')
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [form, data, persist, flash])

  const deleteTxn = useCallback(
    (id: string) => {
      persist({ txns: data.txns.filter((x) => x.id !== id) })
      flash('Entry deleted')
    },
    [data.txns, persist, flash],
  )

  const commitBudgetEdit = useCallback(
    (catId: string) => {
      const raw = budgetEdits[catId]
      if (raw === undefined) return
      const val = parseFloat(raw)
      const budgets = { ...data.budgets }
      if (!val || val <= 0) delete budgets[catId]
      else budgets[catId] = val
      setBudgetEdits((prev) => {
        const next = { ...prev }
        delete next[catId]
        return next
      })
      persist({ budgets })
      flash('Budget updated')
    },
    [budgetEdits, data.budgets, persist, flash],
  )

  const addCategory = useCallback(() => {
    const name = newCat.trim()
    if (!name) return
    persist({ cats: [...data.cats, { id: uid(), name, type: 'expense' }] })
    setNewCat('')
    flash('Category added')
  }, [newCat, data.cats, persist, flash])

  const contribute = useCallback(() => {
    const amt = parseFloat(contrib.amount)
    if (!amt) return flash('Enter an amount')
    const funds = data.funds.map((fd) => (fd.id === contrib.fundId ? { ...fd, balance: fd.balance + amt } : fd))
    const entry: Contrib = { id: uid(), fundId: contrib.fundId, amount: amt, member: contrib.member, date: Date.now() }
    persist({ funds, contribs: [entry, ...data.contribs] })
    setContribState((c) => ({ ...c, amount: '' }))
    flash(amt > 0 ? 'Contribution added' : 'Withdrawal recorded')
  }, [contrib, data, persist, flash])

  const value = useMemo<AppState & AppActions>(
    () => ({
      screen, oauthOpen, menuOpen, obStep, ob, user, members, currency, tab, filter, toast,
      data, form, budgetEdits, newCat, contrib,
      setOauthOpen, setMenuOpen,
      setOb: (patch) => setObState((prev) => ({ ...prev, ...patch })),
      setObStep, setScreen, setUser,
      setTab, setFilter,
      setForm: (patch) => setFormState((prev) => ({ ...prev, ...patch })),
      setBudgetEdit: (catId, v) => setBudgetEdits((prev) => ({ ...prev, [catId]: v })),
      commitBudgetEdit,
      setNewCat, addCategory,
      setContrib: (patch) => setContribState((prev) => ({ ...prev, ...patch })),
      contribute, submitTxn, deleteTxn, flash,
      startGoogle: () => setOauthOpen(true),
      pickOauthAccount: (u) => {
        setOauthOpen(false)
        setScreen('onboarding')
        setObStep(0)
        setUser(u)
        setObState((prev) => ({ ...prev, yourName: u.name.split(' ')[0] ?? '' }))
      },
      continueAsGuest: () =>
        finishSetup(
          [{ name: 'Star', color: 'indigo' }, { name: 'Niki', color: 'rose' }],
          'AED', null, { reuseData: true, suggested: true },
        ),
      obNext, obBack, signOut,
      fmt, num, person, scrollRef,
    }),
    [
      screen, oauthOpen, menuOpen, obStep, ob, user, members, currency, tab, filter, toast,
      data, form, budgetEdits, newCat, contrib,
      commitBudgetEdit, addCategory, contribute, submitTxn, deleteTxn, flash,
      finishSetup, obNext, obBack, signOut, fmt, num, person, setTab,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
