import { AppProvider, useApp } from './state'
import { COLORS } from './theme'
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

function Header() {
  const { tab, members, setMenuOpen, menuOpen } = useApp()
  const m0 = members[0]
  const m1 = members[1]
  const c0 = COLORS[m0.color] ?? COLORS.indigo
  const c1 = COLORS[m1.color] ?? COLORS.rose
  const monthLabel = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  return (
    <div style={{ padding: '34px 2px 6px' }}>
      <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.4, color: '#8B86A0', textTransform: 'uppercase' }}>
        {monthLabel}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
        <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.6 }}>{TITLES[tab]}</div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Account menu"
          style={{ display: 'flex', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <Avatar initial={(m0.name[0] || '?').toUpperCase()} bg={c0.bg} fg={c0.fg} size={30} style={{ fontSize: 13 }} />
          <Avatar
            initial={(m1.name[0] || '?').toUpperCase()}
            bg={c1.bg}
            fg={c1.fg}
            size={30}
            style={{ fontSize: 13, marginLeft: -12, border: '2px solid #F7F6FB' }}
          />
        </button>
      </div>
    </div>
  )
}

function MainApp() {
  const { tab, scrollRef } = useApp()
  return (
    <>
      <div ref={scrollRef} className="tab-content">
        <Header />
        {tab === 'home' && <Dashboard />}
        {tab === 'activity' && <Activity />}
        {tab === 'add' && <AddEntry />}
        {tab === 'budgets' && <Budgets />}
        {tab === 'funds' && <Funds />}
      </div>
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
