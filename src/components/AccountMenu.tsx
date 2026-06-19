import { useApp } from '../state'
import { COLORS, RED, TEXT_SOFT } from '../theme'
import { Avatar } from './ui'

export function AccountMenu() {
  const { menuOpen, setMenuOpen, mode, user, members, signOut, exportData, deleteMyData } = useApp()
  if (!menuOpen) return null
  const close = () => setMenuOpen(false)
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30 }}>
      <div onClick={close} style={{ position: 'absolute', inset: 0 }} />
      <div
        role="menu"
        style={{
          position: 'absolute', top: 78, right: 18, width: 234, background: '#FFFFFF',
          borderRadius: 16, boxShadow: '0 12px 32px rgba(33,31,42,0.18)', padding: '8px 14px',
          border: '1px solid #F0EEF6',
        }}
      >
        <div style={{ fontSize: 11.5, color: TEXT_SOFT, padding: '8px 2px 6px' }}>
          {user?.email ? user.email : 'Demo mode — no account'}
        </div>
        {members.map((m, i) => {
          const c = COLORS[m.color] ?? COLORS.indigo
          const isOwner = m.role === 'owner'
          const notJoined = !isOwner && m.userId === null
          return (
            <div
              key={m.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0',
                borderTop: `1px solid ${i > 0 ? '#F0EEF6' : 'transparent'}`,
              }}
            >
              <Avatar initial={(m.name[0] || '?').toUpperCase()} bg={c.bg} fg={c.fg} size={28} style={{ fontSize: 12 }} />
              <span style={{ fontSize: 14, fontWeight: 600, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {m.name}{isOwner ? ' (You)' : ''}
              </span>
              {notJoined && (
                <span style={{ fontSize: 11, fontWeight: 600, color: TEXT_SOFT, flexShrink: 0 }}>Not joined yet</span>
              )}
            </div>
          )
        })}

        {mode === 'cloud' && (
          <button
            role="menuitem"
            onClick={() => { close(); exportData() }}
            style={menuItem}
          >
            Export my data
          </button>
        )}
        <button
          role="menuitem"
          onClick={() => { close(); deleteMyData() }}
          style={{ ...menuItem, color: RED }}
        >
          {mode === 'cloud' ? 'Delete my data' : 'Exit demo'}
        </button>
        <button
          role="menuitem"
          onClick={signOut}
          style={{ ...menuItem, color: mode === 'cloud' ? '#211F2A' : RED }}
        >
          Sign out
        </button>
      </div>
    </div>
  )
}

const menuItem: React.CSSProperties = {
  width: '100%', textAlign: 'left', padding: '11px 2px', background: 'none', border: 'none',
  borderTop: '1px solid #F0EEF6', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600,
  color: '#211F2A', cursor: 'pointer',
}
