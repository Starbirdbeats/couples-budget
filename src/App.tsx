import { useEffect, useState } from 'react'
import { AppProvider, useApp } from './state'
import { ACCENT, COLORS, TEXT_SOFT } from './theme'
import { Avatar } from './components/ui'
import { TabBar } from './components/TabBar'
import { Toast } from './components/Toast'
import { AccountMenu } from './components/AccountMenu'
import { Auth } from './screens/Auth'
import { Onboarding } from './screens/Onboarding'
import { Dashboard } from './screens/Dashboard'
import { Activity } from './screens/Activity'
import { AddEntry } from './screens/AddEntry'
import { Budgets } from './screens/Budgets'
import { Funds } from './screens/Funds'

const TITLES = { home: 'Overview', add: 'New entry', budgets: 'Budgets', funds: 'Funds', activity: 'Activity' } as const

function ago(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// Honest sync state: when the household last loaded + a manual re-pull. Realtime
// keeps this fresh on its own; the control is the escape hatch / reassurance.
function SyncStatus() {
  const { mode, lastSyncedAt, refresh, pending } = useApp()
  const [, tick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30000)
    return () => clearInterval(t)
  }, [])
  if (mode !== 'cloud' || lastSyncedAt === null) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
      <span style={{ fontSize: 11.5, color: TEXT_SOFT }}>
        {pending.refresh ? 'Syncing…' : `Updated ${ago(lastSyncedAt)}`}
      </span>
      <button
        onClick={refresh}
        disabled={pending.refresh}
        aria-label="Refresh data"
        style={{
          background: 'none', border: 'none', fontFamily: 'inherit', fontSize: 11.5, fontWeight: 600,
          color: ACCENT, cursor: pending.refresh ? 'default' : 'pointer', padding: 2,
        }}
      >
        ↻ Refresh
      </button>
    </div>
  )
}

function DemoBanner() {
  const { mode, signOut } = useApp()
  if (mode !== 'demo') return null
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 12, marginTop: 14,
        background: '#FFFFFF', borderRadius: 14, padding: '12px 14px',
        boxShadow: '0 1px 3px rgba(33,31,42,0.04)',
      }}
    >
      <span style={{ fontSize: 12.5, color: TEXT_SOFT, flex: 1, lineHeight: 1.45 }}>
        You're exploring the demo — nothing is saved on this device.
      </span>
      <button
        onClick={signOut}
        style={{
          flexShrink: 0, background: '#211F2A', color: '#FFFFFF', border: 'none', borderRadius: 12,
          fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, padding: '9px 14px', cursor: 'pointer',
        }}
      >
        Sign in to keep it
      </button>
    </div>
  )
}

function Header() {
  const { tab, members, setMenuOpen, menuOpen } = useApp()
  const m0 = members[0]
  const m1 = members[1]
  const c0 = COLORS[m0.color] ?? COLORS.indigo
  const c1 = m1 ? (COLORS[m1.color] ?? COLORS.rose) : null
  const monthLabel = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  return (
    <div style={{ padding: '34px 2px 6px' }}>
      <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.4, color: TEXT_SOFT, textTransform: 'uppercase' }}>
        {monthLabel}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.6, margin: 0 }}>{TITLES[tab]}</h1>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Account menu"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          style={{ display: 'flex', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <Avatar initial={(m0.name[0] || '?').toUpperCase()} bg={c0.bg} fg={c0.fg} size={30} style={{ fontSize: 13 }} />
          {c1 && (
            <Avatar
              initial={(m1.name[0] || '?').toUpperCase()}
              bg={c1.bg}
              fg={c1.fg}
              size={30}
              style={{ fontSize: 13, marginLeft: -12, border: '2px solid #F7F6FB' }}
            />
          )}
        </button>
      </div>
      <SyncStatus />
      <DemoBanner />
    </div>
  )
}

function MainApp() {
  const { tab, scrollRef } = useApp()
  return (
    <>
      <main ref={scrollRef} className="tab-content">
        <Header />
        <div key={tab} className="screen-fade">
          {tab === 'home' && <Dashboard />}
          {tab === 'activity' && <Activity />}
          {tab === 'add' && <AddEntry />}
          {tab === 'budgets' && <Budgets />}
          {tab === 'funds' && <Funds />}
        </div>
      </main>
      <TabBar />
      <AccountMenu />
    </>
  )
}

function Splash() {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex' }}>
        <div style={{ width: 44, height: 44, borderRadius: 22, background: '#6053CE', mixBlendMode: 'multiply' }} />
        <div style={{ width: 44, height: 44, borderRadius: 22, background: '#C0457E', marginLeft: -14, mixBlendMode: 'multiply' }} />
      </div>
    </div>
  )
}

function Shell() {
  const { initializing, screen } = useApp()
  return (
    <div className="stage">
      <div className="shell">
        {initializing ? (
          <Splash />
        ) : (
          <>
            {screen === 'auth' && <Auth />}
            {screen === 'onboarding' && <Onboarding />}
            {screen === 'app' && <MainApp />}
          </>
        )}
        <Toast />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
