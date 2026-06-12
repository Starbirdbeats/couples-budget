import { useApp } from '../state'
import { Avatar } from './ui'

const ACCOUNTS = [
  { name: 'Star Haddad', email: 'star.haddad@gmail.com', bg: '#ECE9FA', fg: '#6053CE' },
  { name: 'Star Haddad', email: 's.haddad.studio@gmail.com', bg: '#E4F0EA', fg: '#2E7D5B' },
]

export function OAuthSheet() {
  const { oauthOpen, setOauthOpen, pickOauthAccount, setScreen, setObStep, setUser, setOb } = useApp()
  if (!oauthOpen) return null
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 40 }}>
      <div
        onClick={() => setOauthOpen(false)}
        style={{ position: 'absolute', inset: 0, background: 'rgba(33,31,42,0.4)' }}
      />
      <div
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, background: '#FFFFFF',
          borderRadius: '22px 22px 0 0', padding: '24px 22px 30px',
          boxShadow: '0 -8px 30px rgba(33,31,42,0.18)',
        }}
      >
        <div style={{ fontSize: 17, fontWeight: 600 }}>Choose an account</div>
        <div style={{ fontSize: 13, color: '#8B86A0', marginTop: 3 }}>to continue to Couples Budget</div>
        <div style={{ marginTop: 14 }}>
          {ACCOUNTS.map((a, i) => (
            <button
              key={a.email}
              className="hov-row"
              onClick={() => pickOauthAccount({ name: a.name, email: a.email })}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
                padding: '12px 4px', background: 'none', border: 'none',
                borderTop: `1px solid ${i > 0 ? '#F0EEF6' : 'transparent'}`,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <Avatar initial={a.name[0]} bg={a.bg} fg={a.fg} size={36} style={{ fontSize: 14 }} />
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: '#211F2A' }}>{a.name}</div>
                <div style={{ fontSize: 12.5, color: '#8B86A0' }}>{a.email}</div>
              </div>
            </button>
          ))}
          <button
            onClick={() => {
              setOauthOpen(false)
              setScreen('onboarding')
              setObStep(0)
              setUser({ name: '', email: '' })
              setOb({ yourName: '' })
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
              padding: '14px 4px', background: 'none', border: 'none', borderTop: '1px solid #F0EEF6',
              cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: '#6053CE',
            }}
          >
            Use another account
          </button>
        </div>
      </div>
    </div>
  )
}
