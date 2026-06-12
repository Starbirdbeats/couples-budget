import { useApp } from '../state'

export function Toast() {
  const { toast } = useApp()
  if (!toast) return null
  return (
    <div
      style={{
        position: 'absolute', bottom: 104, left: '50%', transform: 'translateX(-50%)',
        background: '#211F2A', color: '#FFFFFF', fontSize: 13.5, fontWeight: 600,
        padding: '11px 20px', borderRadius: 22, boxShadow: '0 8px 24px rgba(33,31,42,0.25)',
        animation: 'toastIn 0.25s ease', zIndex: 20, whiteSpace: 'nowrap',
      }}
    >
      {toast}
    </div>
  )
}
