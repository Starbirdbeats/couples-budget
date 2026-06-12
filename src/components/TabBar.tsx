import { useApp } from '../state'
import type { Tab } from '../types'

const LEFT: Array<{ id: Tab; label: string }> = [
  { id: 'home', label: 'Home' },
  { id: 'activity', label: 'Activity' },
]
const RIGHT: Array<{ id: Tab; label: string }> = [
  { id: 'budgets', label: 'Budgets' },
  { id: 'funds', label: 'Funds' },
]

function NavButton({ id, label }: { id: Tab; label: string }) {
  const { tab, setTab } = useApp()
  const active = tab === id
  return (
    <button
      onClick={() => setTab(id)}
      style={{
        background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
        fontSize: 13, fontWeight: active ? 700 : 500, color: active ? '#211F2A' : '#A8A4B8',
        padding: '12px 6px', minWidth: 60,
      }}
    >
      {label}
    </button>
  )
}

export function TabBar() {
  const { setTab } = useApp()
  return (
    <div
      className="tabbar"
      style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, background: 'rgba(247,246,251,0.92)',
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderTop: '1px solid #E9E6F1',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 22px 22px', zIndex: 5,
      }}
    >
      {LEFT.map((n) => <NavButton key={n.id} {...n} />)}
      <button
        className="hov-dark"
        onClick={() => setTab('add')}
        aria-label="New entry"
        style={{
          width: 52, height: 52, borderRadius: 26, border: 'none', background: '#211F2A',
          color: '#FFFFFF', fontSize: 24, fontWeight: 300, cursor: 'pointer', marginTop: -26,
          boxShadow: '0 8px 20px rgba(33,31,42,0.28)', fontFamily: 'inherit', lineHeight: 1,
        }}
      >
        +
      </button>
      {RIGHT.map((n) => <NavButton key={n.id} {...n} />)}
    </div>
  )
}
