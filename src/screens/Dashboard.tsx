import { useApp } from '../state'
import { AMBER_TEXT, RED, TEXT_SOFT, card, catColor } from '../theme'
import { budgetRow, monthStats } from '../derive'
import { Avatar, Bar, SectionLabel } from '../components/ui'

export function Dashboard() {
  const { data, currency, fmt, num, members, person, setTab } = useApp()
  const { pace, income, expense, spent, personalExpense, byMember } = monthStats(data)
  const expCats = data.cats.filter((c) => c.type === 'expense')
  const catTotals = expCats
    .map((c) => ({ c, sp: spent(c.id) }))
    .filter((x) => x.sp > 0)
    .sort((a, b) => b.sp - a.sp)

  const net = income - expense
  const empty = income === 0 && expense === 0 && personalExpense === 0

  const paidRows = members
    .map((m) => ({ m, e: byMember.get(m.name) ?? { shared: 0, personal: 0 } }))
    .filter((r) => r.e.shared + r.e.personal > 0)

  if (empty) {
    return (
      <button
        onClick={() => setTab('add')}
        style={{
          ...card, width: '100%', textAlign: 'center', padding: '40px 24px', marginTop: 28,
          border: 'none', cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <div style={{ fontSize: 30, marginBottom: 6 }}>✨</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#211F2A' }}>Nothing logged this month yet</div>
        <div style={{ fontSize: 13.5, color: TEXT_SOFT, marginTop: 6, lineHeight: 1.5 }}>
          Tap here, or the + button, to add your first expense.
        </div>
      </button>
    )
  }

  return (
    <div>
      <div style={{ padding: '26px 2px 8px' }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: TEXT_SOFT }}>Shared spend this month</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 2 }}>
          <span style={{ fontSize: 17, fontWeight: 500, color: TEXT_SOFT }}>{currency}</span>
          <span style={{ fontSize: 52, fontWeight: 300, letterSpacing: -2, fontVariantNumeric: 'tabular-nums' }}>
            {num(expense, 0)}
          </span>
        </div>
        <div style={{ fontSize: 13, color: TEXT_SOFT, marginTop: 4 }}>
          income {fmt(income, 0)} · net{' '}
          <span style={{ color: net < 0 ? RED : TEXT_SOFT, fontWeight: net < 0 ? 600 : 500 }}>
            {net < 0 ? `−${fmt(Math.abs(net), 0)}` : fmt(net, 0)}
          </span>
        </div>
        {personalExpense > 0 && (
          <div style={{ fontSize: 12.5, color: TEXT_SOFT, marginTop: 3 }}>
            + {fmt(personalExpense, 0)} personal · just yours
          </div>
        )}
        <div style={{ height: 6, background: '#F0EEF6', borderRadius: 3, marginTop: 16, display: 'flex', overflow: 'hidden' }}>
          {catTotals.map((x) => (
            <div
              key={x.c.id}
              style={{
                width: `${expense > 0 ? Math.max((x.sp / expense) * 100, 1.5) : 0}%`,
                background: catColor(x.c.id),
              }}
            />
          ))}
        </div>
      </div>

      <SectionLabel>By category</SectionLabel>
      <div style={{ ...card, padding: '6px 18px' }}>
        {catTotals.map((x, i) => {
          const r = budgetRow(x.c, data, spent, pace)
          const color = catColor(x.c.id)
          return (
            <div key={x.c.id} style={{ padding: '13px 0', borderTop: `1px solid ${i > 0 ? '#F0EEF6' : 'transparent'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 15, fontWeight: 600, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{x.c.name}</span>
                {r.hasBudget && r.status !== 'ok' && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: r.status === 'over' ? RED : AMBER_TEXT, flexShrink: 0 }}>
                    {r.status === 'over' ? 'Over' : 'Near limit'}
                  </span>
                )}
                <span style={{ fontSize: 14, fontWeight: 600, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{fmt(x.sp, 0)}</span>
              </div>
              {r.hasBudget && (
                <>
                  <Bar pct={r.pct} color={color} pace={pace} style={{ marginTop: 10, marginLeft: 18 }} />
                  <div style={{ fontSize: 12, color: TEXT_SOFT, marginTop: 5, marginLeft: 18, fontVariantNumeric: 'tabular-nums' }}>
                    {fmt(r.spentAmount, 0)} of {fmt(r.target, 0)} budgeted
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      {paidRows.length > 0 && (
        <>
          <SectionLabel>Who paid this month</SectionLabel>
          <div style={{ ...card, padding: '4px 18px' }}>
            {paidRows.map((r, i) => {
              const p = person(r.m.name)
              const total = r.e.shared + r.e.personal
              return (
                <div
                  key={r.m.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
                    borderTop: `1px solid ${i > 0 ? '#F0EEF6' : 'transparent'}`,
                  }}
                >
                  <Avatar initial={(r.m.name[0] || '?').toUpperCase()} bg={p.bg} fg={p.fg} size={30} style={{ fontSize: 12 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{r.m.name}</div>
                    {r.e.personal > 0 && (
                      <div style={{ fontSize: 12, color: TEXT_SOFT, marginTop: 1 }}>{fmt(r.e.personal, 0)} personal</div>
                    )}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{fmt(total, 0)}</span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
