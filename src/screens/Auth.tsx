import { useApp } from '../state'

export function Auth() {
  const { startGoogle, continueAsGuest } = useApp()
  return (
    <div
      style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '0 36px 40px',
        boxSizing: 'border-box', textAlign: 'center',
      }}
    >
      <div style={{ display: 'flex' }}>
        <div style={{ width: 52, height: 52, borderRadius: 26, background: '#6053CE', mixBlendMode: 'multiply' }} />
        <div style={{ width: 52, height: 52, borderRadius: 26, background: '#C0457E', marginLeft: -16, mixBlendMode: 'multiply' }} />
      </div>
      <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.6, marginTop: 26 }}>Couples Budget</div>
      <div style={{ fontSize: 14.5, color: '#6E6A7E', lineHeight: 1.55, marginTop: 10, textWrap: 'pretty' }}>
        One calm place for what you spend, save and share — together.
      </div>
      <button
        className="hov-border"
        onClick={startGoogle}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%',
          padding: '15px 0', borderRadius: 15, border: '1px solid #E6E3EF', background: '#FFFFFF',
          fontSize: 15, fontWeight: 600, color: '#211F2A', cursor: 'pointer', marginTop: 40,
          fontFamily: 'inherit', boxShadow: '0 1px 3px rgba(33,31,42,0.04)',
        }}
      >
        <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.57 5.57 0 0 1-2.4 3.58v2.98h3.87c2.26-2.09 3.55-5.17 3.55-8.8z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.94-2.93l-3.87-2.98c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24z" />
          <path fill="#FBBC05" d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29a11.97 11.97 0 0 0 0 10.76l3.98-3.09z" />
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
        </svg>
        Continue with Google
      </button>
      <button
        onClick={continueAsGuest}
        style={{
          background: 'none', border: 'none', fontFamily: 'inherit', fontSize: 13.5,
          fontWeight: 600, color: '#6053CE', cursor: 'pointer', marginTop: 18, padding: 8,
        }}
      >
        Explore the demo instead
      </button>
      <div style={{ fontSize: 11.5, color: '#6E6A7E', marginTop: 36, lineHeight: 1.5 }}>
        Sign in to sync across devices · the demo stays on this device.
      </div>
    </div>
  )
}
