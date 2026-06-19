import { useApp } from '../state'
import { GREEN, ICON_MUTED, INK, TEXT_SOFT, TRACK, card, chipStyle } from '../theme'
import { dayLabel } from '../store'
import { Avatar, SectionLabel } from '../components/ui'
import type { Txn } from '../types'

export function Activity() {
  const { data, members, filter, setFilter, fmt, person, deleteTxn, startEdit } = useApp()

  const catName = (cid: string) => data.cats.find((x) => x.id === cid)?.name ?? '—'
  const sorted = [...data.txns].sort((a, b) => b.date - a.date)
  const filtered = sorted.filter((t) => {
    if (filter === 'all') return true
    if (filter === 'shared') return t.scope === 'shared'
    return t.member === filter
  })
  const groups: Array<{ label: string; rows: Txn[] }> = []
  filtered.forEach((t) => {
    const label = dayLabel(t.date)
    let g = groups.find((x) => x.label === label)
    if (!g) {
      g = { label, rows: [] }
      groups.push(g)
    }
    g.rows.push(t)
  })

  const chips = [
    { id: 'all', label: 'All' },
    { id: 'shared', label: 'Shared' },
    ...members.map((m) => ({ id: m.name, label: m.name })),
  ]

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, margin: '18px 0 6px' }}>
        {chips.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: '9px 15px', borderRadius: 18, fontSize: 13.5, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit', ...chipStyle(filter === f.id),
            }}
          >
            {f.label}
          </button>
        ))}
      </div>
      {groups.map((g) => (
        <div key={g.label}>
          <SectionLabel style={{ margin: '20px 2px 8px' }}>{g.label}</SectionLabel>
          <div style={{ ...card, padding: '4px 18px' }}>
            {g.rows.map((t, i) => {
              const p = person(t.member)
              const isInc = t.type === 'income'
              return (
                <div
                  key={t.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0',
                    borderTop: `1px solid ${i > 0 ? '#F0EEF6' : 'transparent'}`,
                  }}
                >
                  <button
                    onClick={() => startEdit(t.id)}
                    aria-label={`Edit ${catName(t.catId)} entry`}
                    style={{
                      flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 12,
                      background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer',
                      fontFamily: 'inherit', color: 'inherit', textAlign: 'left',
                    }}
                  >
                    <Avatar initial={t.member[0]} bg={p.bg} fg={p.fg} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ fontSize: 14.5, fontWeight: 600, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {catName(t.catId)}
                        </span>
                        {t.scope === 'personal' && (
                          <span
                            style={{
                              flexShrink: 0, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.3,
                              color: TEXT_SOFT, background: TRACK, borderRadius: 6, padding: '2px 6px',
                              textTransform: 'uppercase',
                            }}
                          >
                            Personal
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: TEXT_SOFT, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {[t.member, t.notes].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                    <span
                      style={{
                        flexShrink: 0, fontSize: 14.5, fontWeight: 600, fontVariantNumeric: 'tabular-nums',
                        color: isInc ? GREEN : INK,
                      }}
                    >
                      {(isInc ? '+' : '−') + fmt(t.amount)}
                    </span>
                  </button>
                  <button
                    className="hov-red"
                    onClick={() => deleteTxn(t.id)}
                    aria-label={`Delete ${catName(t.catId)} entry`}
                    style={{
                      flexShrink: 0, width: 44, height: 44, marginRight: -10,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      background: 'none', border: 'none', color: ICON_MUTED, fontSize: 19,
                      cursor: 'pointer', lineHeight: 1, fontFamily: 'inherit',
                    }}
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      ))}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', color: TEXT_SOFT, fontSize: 14, padding: '48px 0' }}>
          Nothing here yet — add an entry with the + button.
        </div>
      )}
    </div>
  )
}
