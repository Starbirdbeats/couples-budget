import { useApp } from '../state'
import { CAT_COLORS, card } from '../theme'
import { budgetRow, monthStats } from '../derive'
import { Bar, SectionLabel } from '../components/ui'

export function Dashboard() {
  const { data, currency, fmt, num } = useApp()
  const { pace, income, expense, spent } = monthStats(data)
  const expCats = data.cats.filter((c) => c.type === 'expense')
  const catTotals = expCats
    .map((c) => ({ c, sp: spent(c.id) }))
    .filter((x) => x.sp > 0)
    .sort((a, b) => b.sp - a.sp)

  return (
    <div>
      <div style={{ padding: '26px 2px 8px' }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#6E6A7E' }}>Spent this month</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 2 }}>
          <span style={{ fontSize: 17, fontWeight: 500, color: '#8B86A0' }}>{currency}</span>
          <span style={{ fontSize: 52, fontWeight: 300, letterSpacing: -2, fontVariantNumeric: 'tabular-nums' }}>
            {num(expense, 2)}
          </span>
        </div>
        <div style={{ fontSize: 13, color: '#8B86A0', marginTop: 4 }}>
          income {fmt(income, 0)} · net {fmt(income - expense, 0)}
        </div>
        <div style={{ height: 6, background: '#F0EEF6', borderRadius: 3, marginTop: 16, display: 'flex', overflow: 'hidden' }}>
          {catTotals.map((x, i) => (
            <div
              key={x.c.id}
              style={{
                width: `${expense > 0 ? Math.max((x.sp / expense) * 100, 1.5) : 0}%`,
                background: CAT_COLORS[i % CAT_COLORS.length],
              }}
            />
          ))}
        </div>
      </div>

      <SectionLabel>By category</SectionLabel>
      <div style={{ ...card, padding: '6px 18px' }}>
        {catTotals.map((x, i) => {
          const r = budgetRow(x.c, data, spent, pace)
          const color = CAT_COLORS[i % CAT_COLORS.length]
          return (
            <div key={x.c.id} style={{ padding: '13px 0', borderTop: `1px solid ${i > 0 ? '#F0EEF6' : 'transparent'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 15, fontWeight: 600, flex: 1 }}>{x.c.name}</span>
                <span style={{ fontSize: 14, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{fmt(x.sp, 0)}</span>
              </div>
              {r.hasBudget && (
                <>
                  <Bar pct={r.pct} color={color} pace={pace} style={{ marginTop: 10, marginLeft: 18 }} />
                  <div style={{ fontSize: 12, color: '#8B86A0', marginTop: 5, marginLeft: 18, fontVariantNumeric: 'tabular-nums' }}>
                    {fmt(r.spentAmount, 0)} of {fmt(r.target, 0)} budgeted
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
