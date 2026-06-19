import { useApp } from '../state'
import { AMBER, RED, TEXT_SOFT, card } from '../theme'
import { budgetRow, monthStats } from '../derive'
import { Bar } from '../components/ui'

export function Budgets() {
  const { data, currency, fmt, budgetEdits, setBudgetEdit, commitBudgetEdit, newCat, setNewCat, addCategory, pending } = useApp()
  const { pace, spent } = monthStats(data)
  const expCats = data.cats.filter((c) => c.type === 'expense')

  return (
    <div>
      <div style={{ fontSize: 13, color: TEXT_SOFT, margin: '14px 2px 12px', lineHeight: 1.5 }}>
        Monthly targets per category. The tick marks today's pace through the month.
      </div>
      <div style={{ ...card, padding: '6px 18px' }}>
        {expCats.map((c, i) => {
          const r = budgetRow(c, data, spent, pace)
          const editVal = budgetEdits[c.id]
          const value = editVal !== undefined
            ? editVal
            : data.budgets[c.id] !== undefined ? String(data.budgets[c.id]) : ''
          return (
            <div key={c.id} style={{ padding: '13px 0', borderTop: `1px solid ${i > 0 ? '#F0EEF6' : 'transparent'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <span style={{ fontSize: 15, fontWeight: 600, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <span style={{ fontSize: 12, color: TEXT_SOFT }}>{currency}</span>
                  <input
                    className="foc-accent"
                    value={value}
                    onChange={(e) => setBudgetEdit(c.id, e.target.value)}
                    onBlur={() => commitBudgetEdit(c.id)}
                    type="number"
                    placeholder="—"
                    aria-label={`${c.name} monthly budget`}
                    style={{
                      width: 92, textAlign: 'right', padding: '9px 12px', borderRadius: 11,
                      border: '1px solid #E6E3EF', fontSize: 14, background: '#FAF9FD', outline: 'none',
                      fontFamily: 'inherit', fontVariantNumeric: 'tabular-nums', color: '#211F2A',
                    }}
                  />
                </div>
              </div>
              {r.hasBudget && (
                <>
                  <Bar pct={r.pct} color={r.barColor} pace={pace} style={{ marginTop: 10 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginTop: 5 }}>
                    <span style={{ fontSize: 12, color: TEXT_SOFT, fontVariantNumeric: 'tabular-nums' }}>
                      {fmt(r.spentAmount, 0)} of {fmt(r.target, 0)}
                    </span>
                    {r.status !== 'ok' && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: r.status === 'over' ? RED : AMBER, flexShrink: 0 }}>
                        {r.status === 'over' ? 'Over budget' : 'Near limit'}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <input
          className="foc-accent"
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') addCategory() }}
          placeholder="New expense category"
          maxLength={40}
          aria-label="New expense category"
          onFocus={(e) => e.currentTarget.scrollIntoView({ block: 'center', behavior: 'smooth' })}
          style={{
            flex: 1, boxSizing: 'border-box', padding: '13px 15px', borderRadius: 13,
            border: '1px solid #E6E3EF', fontSize: 14, background: '#FFFFFF', outline: 'none',
            fontFamily: 'inherit', color: '#211F2A',
          }}
        />
        <button
          className={pending.addCat ? undefined : 'hov-dark press'}
          onClick={addCategory}
          disabled={pending.addCat}
          style={{
            padding: '0 22px', borderRadius: 13, border: 'none', background: '#211F2A',
            color: '#FFFFFF', fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
            cursor: pending.addCat ? 'default' : 'pointer', opacity: pending.addCat ? 0.55 : 1,
          }}
        >
          {pending.addCat ? '…' : 'Add'}
        </button>
      </div>
    </div>
  )
}
