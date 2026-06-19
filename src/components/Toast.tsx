import { useApp } from '../state'
import { RED } from '../theme'

export function Toast() {
  const { toast } = useApp()
  if (!toast) return null
  const isError = toast.tone === 'error'
  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      style={{
        position: 'absolute', bottom: 104, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 14, maxWidth: 'calc(100% - 40px)',
        background: isError ? RED : '#211F2A', color: '#FFFFFF', fontSize: 13.5, fontWeight: 600,
        padding: toast.action ? '10px 12px 10px 18px' : '11px 20px', borderRadius: 22,
        boxShadow: '0 8px 24px rgba(33,31,42,0.25)', animation: 'toastIn 0.25s ease', zIndex: 20,
      }}
    >
      <span style={{ whiteSpace: toast.action ? 'normal' : 'nowrap' }}>{toast.msg}</span>
      {toast.action && (
        <button
          onClick={toast.action.run}
          style={{
            flexShrink: 0, background: 'rgba(255,255,255,0.16)', border: 'none', color: '#FFFFFF',
            fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
            padding: '7px 14px', borderRadius: 16,
          }}
        >
          {toast.action.label}
        </button>
      )}
    </div>
  )
}
