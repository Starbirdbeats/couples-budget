import { useApp } from '../state'
import { card } from '../theme'
import { budgetRow, monthStats } from '../derive'
import { Bar } from '../components/ui'

export function Budgets() {
  const { data, currency, fmt, budgetEdits, setBudgetEdit, commitBudgetEdit, newCat, setNewCat, addCategory } = useApp()
  const { pace, spent } = monthStats(data)
  const expCats = data.cats.filter((c) => c.type === 'expense')

  return (
    <div>
      <div style={{ fontSize: 13, color: '#8B86A0', margin: '14px 2px 12px', lineHeight: 1.5 }}>
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
                <span style={{ fontSize: 15, fontWeight: 600, flex: 1 }}>{c.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, color: '#B0ACBE' }}>{currency}</span>
                  <input
                    className="foc-accent"
                    value={value}
                    onChange={(e) => setBudgetEdit(c.id, e.target.value)}
                    onBlur={() => commitBudgetEdit(c.id)}
                    type="number"
                    placeholder="—"
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
                  <div style={{ fontSize: 12, color: '#8B86A0', marginTop: 5, fontVariantNumeric: 'tabular-nums' }}>
                    {fmt(r.spentAmount, 0)} of {fmt(r.target, 0)}
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
          style={{
            flex: 1, boxSizing: 'border-box', padding: '13px 15px', borderRadius: 13,
            border: '1px solid #E6E3EF', fontSize: 14, background: '#FFFFFF', outline: 'none',
            fontFamily: 'inherit', color: '#211F2A',
          }}
        />
        <button
          className="hov-dark"
          onClick={addCategory}
          style={{
            padding: '0 22px', borderRadius: 13, border: 'none', background: '#211F2A',
            color: '#FFFFFF', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Add
        </button>
      </div>
    </div>
  )
}
