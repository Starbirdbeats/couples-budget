import { useApp } from '../state'
import { GREEN, RED, TEXT_SOFT, card, catColor, chipStyle } from '../theme'
import { dayLabel } from '../store'
import { Avatar, Bar, SectionLabel } from '../components/ui'

export function Funds() {
  const { data, contrib, setContrib, contribute, members, person, fmt, num, pending } = useApp()

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
        {data.funds.length === 0 && (
          <div style={{ ...card, textAlign: 'center', padding: '36px 24px' }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>No funds yet</div>
            <div style={{ fontSize: 13, color: TEXT_SOFT, marginTop: 6, lineHeight: 1.5 }}>
              Savings goals you set up will show here.
            </div>
          </div>
        )}
        {data.funds.map((f) => {
          const pct = f.target > 0 ? Math.round(Math.min((f.balance / f.target) * 100, 100)) : 0
          return (
            <div key={f.id} style={{ ...card, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{f.name}</span>
                <span style={{ fontSize: 13, color: TEXT_SOFT, fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
                <span style={{ fontSize: 23, fontWeight: 600, letterSpacing: -0.4, fontVariantNumeric: 'tabular-nums' }}>
                  {fmt(f.balance, 0)}
                </span>
                <span style={{ fontSize: 13, color: TEXT_SOFT, fontVariantNumeric: 'tabular-nums' }}>
                  / {fmt(f.target, 0)}
                </span>
              </div>
              <Bar pct={pct} color={catColor(f.id)} style={{ marginTop: 12 }} />
            </div>
          )
        })}
      </div>

      <SectionLabel style={{ margin: '24px 2px 10px' }}>Contribute</SectionLabel>
      <div style={{ ...card, padding: 18 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {data.funds.map((f) => (
            <button
              key={f.id}
              onClick={() => setContrib({ fundId: f.id })}
              style={{
                padding: '9px 15px', borderRadius: 18, fontSize: 13.5, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', ...chipStyle(contrib.fundId === f.id),
              }}
            >
              {f.name}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
          <input
            className="foc-accent"
            value={contrib.amount}
            onChange={(e) => setContrib({ amount: e.target.value })}
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            aria-label="Contribution amount"
            onFocus={(e) => e.currentTarget.scrollIntoView({ block: 'center', behavior: 'smooth' })}
            style={{
              flex: 1, minWidth: 0, boxSizing: 'border-box', padding: '12px 14px', borderRadius: 13,
              border: '1px solid #E6E3EF', fontSize: 15, background: '#FAF9FD', outline: 'none',
              fontFamily: 'inherit', fontVariantNumeric: 'tabular-nums', color: '#211F2A',
            }}
          />
          {[250, 500, 1000].map((q) => (
            <button
              key={q}
              className="hov-accent"
              onClick={() => setContrib({ amount: String(q) })}
              style={{
                padding: '11px 12px', borderRadius: 11, border: '1px solid #E6E3EF', background: '#FAF9FD',
                color: '#6E6A7E', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              +{num(q)}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          {members.map((m) => {
            const p = person(m.name)
            const active = contrib.member === m.name
            return (
              <button
                key={m.name}
                onClick={() => setContrib({ member: m.name })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 15px 8px 8px',
                  borderRadius: 22, border: `1px solid ${active ? p.fg : '#E6E3EF'}`,
                  background: active ? p.bg : '#FFFFFF', color: active ? p.fg : '#6E6A7E',
                  fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <Avatar initial={m.name[0]} bg={active ? p.fg : p.bg} fg={active ? '#FFFFFF' : p.fg} size={24} />
                {m.name}
              </button>
            )
          })}
        </div>
        <div style={{ fontSize: 12, color: TEXT_SOFT, marginTop: 10 }}>Use a negative amount to withdraw.</div>
        <button
          className={pending.contrib ? undefined : 'hov-dark press'}
          onClick={contribute}
          disabled={pending.contrib}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 13, border: 'none', background: '#211F2A',
            color: '#FFFFFF', fontSize: 14.5, fontWeight: 600, marginTop: 14, fontFamily: 'inherit',
            cursor: pending.contrib ? 'default' : 'pointer', opacity: pending.contrib ? 0.55 : 1,
          }}
        >
          {pending.contrib ? 'Saving…' : 'Save contribution'}
        </button>
      </div>

      {data.contribs.length > 0 && (
        <>
          <SectionLabel style={{ margin: '24px 2px 10px' }}>Recent contributions</SectionLabel>
          <div style={{ ...card, padding: '4px 18px' }}>
            {data.contribs.slice(0, 8).map((c, i) => {
              const fd = data.funds.find((x) => x.id === c.fundId)
              const p = person(c.member)
              return (
                <div
                  key={c.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
                    borderTop: `1px solid ${i > 0 ? '#F0EEF6' : 'transparent'}`,
                  }}
                >
                  <Avatar initial={c.member[0]} bg={p.bg} fg={p.fg} size={30} style={{ fontSize: 12 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{fd ? fd.name : '—'}</div>
                    <div style={{ fontSize: 12, color: TEXT_SOFT }}>{c.member} · {dayLabel(c.date)}</div>
                  </div>
                  <span
                    style={{
                      fontSize: 14, fontWeight: 600, fontVariantNumeric: 'tabular-nums',
                      color: c.amount >= 0 ? GREEN : RED,
                    }}
                  >
                    {(c.amount >= 0 ? '+' : '−') + fmt(Math.abs(c.amount), 0)}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
