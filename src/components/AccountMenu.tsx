import { useApp } from '../state'
import { COLORS } from '../theme'
import { Avatar } from './ui'

export function AccountMenu() {
  const { menuOpen, setMenuOpen, user, members, signOut } = useApp()
  if (!menuOpen) return null
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30 }}>
      <div onClick={() => setMenuOpen(false)} style={{ position: 'absolute', inset: 0 }} />
      <div
        style={{
          position: 'absolute', top: 78, right: 18, width: 230, background: '#FFFFFF',
          borderRadius: 16, boxShadow: '0 12px 32px rgba(33,31,42,0.18)', padding: '8px 14px',
          border: '1px solid #F0EEF6',
        }}
      >
        <div style={{ fontSize: 11.5, color: '#B0ACBE', padding: '8px 2px 6px' }}>
          {user?.email ? user.email : 'Demo mode — no account'}
        </div>
        {members.map((m, i) => {
          const c = COLORS[m.color] ?? COLORS.indigo
          return (
            <div
              key={m.name}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0',
                borderTop: `1px solid ${i > 0 ? '#F0EEF6' : 'transparent'}`,
              }}
            >
              <Avatar initial={(m.name[0] || '?').toUpperCase()} bg={c.bg} fg={c.fg} size={28} style={{ fontSize: 12 }} />
              <span style={{ fontSize: 14, fontWeight: 600 }}>{m.name}</span>
            </div>
          )
        })}
        <button
          onClick={signOut}
          style={{
            width: '100%', textAlign: 'left', padding: '11px 2px', background: 'none', border: 'none',
            borderTop: '1px solid #F0EEF6', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600,
            color: '#B6455A', cursor: 'pointer',
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
