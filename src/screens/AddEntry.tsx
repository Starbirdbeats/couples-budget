import { useApp } from '../state'
import { INK, TEXT_SOFT, chipStyle } from '../theme'
import { Avatar, FieldLabel, PrimaryButton, inputStyle } from '../components/ui'
import type { Scope, TxnType } from '../types'

export function AddEntry() {
  const { data, currency, form, setForm, members, person, submitTxn, pending, editingId, cancelEdit } = useApp()
  const isIncome = form.type === 'income'
  const cats = data.cats.filter((c) => c.type === form.type)

  return (
    <div>
      {editingId && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, margin: '16px 2px 0' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: TEXT_SOFT }}>Editing entry</span>
          <button
            onClick={cancelEdit}
            style={{
              background: 'none', border: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
              color: TEXT_SOFT, cursor: 'pointer', padding: 4,
            }}
          >
            Cancel
          </button>
        </div>
      )}
      <div style={{ display: 'flex', background: '#E6E3EF', borderRadius: 13, padding: 3, margin: '18px 0 6px' }}>
        {(['expense', 'income'] as TxnType[]).map((t) => {
          const active = form.type === t
          return (
            <button
              key={t}
              onClick={() => setForm({ type: t, catId: '' })}
              style={{
                flex: 1, padding: '11px 0', borderRadius: 10, border: 'none',
                background: active ? '#FFFFFF' : 'transparent',
                // Darker than TEXT_SOFT so it clears AA on the #E6E3EF track.
                color: active ? INK : '#5E5A6B',
                fontSize: 14.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: active ? '0 1px 3px rgba(33,31,42,0.1)' : 'none',
              }}
            >
              {t === 'expense' ? 'Expense' : 'Income'}
            </button>
          )
        })}
      </div>

      <div style={{ textAlign: 'center', padding: '28px 0 10px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 17, fontWeight: 500, color: TEXT_SOFT }}>{currency}</span>
          <input
            value={form.amount}
            onChange={(e) => setForm({ amount: e.target.value })}
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            autoFocus
            aria-label={isIncome ? 'Income amount' : 'Expense amount'}
            style={{
              fontSize: 46, fontWeight: 300, letterSpacing: -1.5, border: 'none', background: 'transparent',
              outline: 'none', width: 220, fontFamily: 'inherit', color: INK,
              fontVariantNumeric: 'tabular-nums', padding: 0,
            }}
          />
        </div>
      </div>

      <FieldLabel style={{ margin: '14px 2px 8px' }}>Category</FieldLabel>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {cats.map((c) => (
          <button
            key={c.id}
            onClick={() => setForm({ catId: c.id })}
            style={{
              padding: '10px 15px', borderRadius: 18, fontSize: 13.5, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit', ...chipStyle(form.catId === c.id),
            }}
          >
            {c.name}
          </button>
        ))}
      </div>

      <FieldLabel>{isIncome ? 'Who received it' : 'Who paid'}</FieldLabel>
      <div style={{ display: 'flex', gap: 8 }}>
        {members.map((m) => {
          const p = person(m.name)
          const active = form.member === m.name
          return (
            <button
              key={m.name}
              onClick={() => setForm({ member: m.name })}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px 9px 9px',
                borderRadius: 22, border: `1px solid ${active ? p.fg : '#E6E3EF'}`,
                background: active ? p.bg : '#FFFFFF', color: active ? p.fg : '#6E6A7E',
                fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <Avatar initial={m.name[0]} bg={active ? p.fg : p.bg} fg={active ? '#FFFFFF' : p.fg} size={26} />
              {m.name}
            </button>
          )
        })}
      </div>

      <FieldLabel>Scope</FieldLabel>
      <div style={{ display: 'flex', gap: 8 }}>
        {(['shared', 'personal'] as Scope[]).map((s) => (
          <button
            key={s}
            onClick={() => setForm({ scope: s })}
            style={{
              padding: '10px 16px', borderRadius: 18, fontSize: 13.5, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit', ...chipStyle(form.scope === s),
            }}
          >
            {s === 'shared' ? 'Shared' : 'Personal'}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 12, color: TEXT_SOFT, margin: '8px 2px 0', lineHeight: 1.5 }}>
        Shared counts toward your joint budgets · Personal is just yours.
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <div style={{ flex: 1 }}>
          <FieldLabel style={{ margin: '0 2px 8px' }}>Date</FieldLabel>
          <input
            className="foc-accent"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ date: e.target.value })}
            aria-label="Date"
            style={inputStyle}
          />
        </div>
        <div style={{ flex: 1.4 }}>
          <FieldLabel style={{ margin: '0 2px 8px' }}>{isIncome ? 'Source' : 'Note (optional)'}</FieldLabel>
          <input
            className="foc-accent"
            value={form.notes}
            onChange={(e) => setForm({ notes: e.target.value })}
            placeholder={isIncome ? 'e.g. salary, freelance gig' : 'e.g. weekly shop'}
            maxLength={80}
            aria-label={isIncome ? 'Income source' : 'Note'}
            style={inputStyle}
          />
        </div>
      </div>

      <PrimaryButton onClick={submitTxn} disabled={pending.submit} style={{ marginTop: 26 }}>
        {pending.submit ? 'Saving…' : editingId ? 'Save changes' : isIncome ? 'Add income' : 'Add expense'}
      </PrimaryButton>
    </div>
  )
}
