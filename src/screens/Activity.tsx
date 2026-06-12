import { useApp } from '../state'
import { GREEN, INK, card, chipStyle } from '../theme'
import { dayLabel } from '../store'
import { Avatar, SectionLabel } from '../components/ui'
import type { Txn } from '../types'

export function Activity() {
  const { data, members, filter, setFilter, fmt, person, deleteTxn } = useApp()

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
                  <Avatar initial={t.member[0]} bg={p.bg} fg={p.fg} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600 }}>{catName(t.catId)}</div>
                    <div style={{ fontSize: 12, color: '#8B86A0', marginTop: 1 }}>
                      {[t.member, t.scope, t.notes].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 14.5, fontWeight: 600, fontVariantNumeric: 'tabular-nums',
                      color: isInc ? GREEN : INK,
                    }}
                  >
                    {(isInc ? '+' : '−') + fmt(t.amount)}
                  </span>
                  <button
                    className="hov-red"
                    onClick={() => deleteTxn(t.id)}
                    aria-label="Delete entry"
                    style={{
                      background: 'none', border: 'none', color: '#C9C5D6', fontSize: 19,
                      cursor: 'pointer', padding: '4px 2px', lineHeight: 1, fontFamily: 'inherit',
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
        <div style={{ textAlign: 'center', color: '#B0ACBE', fontSize: 14, padding: '48px 0' }}>
          Nothing here yet — add an entry with the + button.
        </div>
      )}
    </div>
  )
}
