import { useApp } from '../state'
import { ACCENT, BORDER, COLORS, COLOR_KEYS, INK } from '../theme'
import { chipStyle } from '../theme'
import type { ColorKey } from '../types'
import { Avatar, PrimaryButton } from '../components/ui'

function Swatches({ selected, onPick }: { selected: ColorKey; onPick: (k: ColorKey) => void }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      {COLOR_KEYS.map((k) => (
        <button
          key={k}
          onClick={() => onPick(k)}
          aria-label={k}
          style={{
            width: 36, height: 36, borderRadius: 18, background: COLORS[k].fg,
            border: '3px solid #F7F6FB', boxShadow: `0 0 0 2px ${selected === k ? INK : 'transparent'}`,
            cursor: 'pointer',
          }}
        />
      ))}
    </div>
  )
}

const nameInput: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '15px 16px', borderRadius: 14,
  border: `1px solid ${BORDER}`, fontSize: 16, background: '#FFFFFF', outline: 'none',
  fontFamily: 'inherit', color: INK, marginTop: 28,
}

export function Onboarding() {
  const { ob, setOb, obStep, obNext, obBack } = useApp()
  const c0 = COLORS[ob.yourColor]
  const c1 = COLORS[ob.partnerColor]

  return (
    <div
      style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        padding: '24px 24px 28px', boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          className="hov-border"
          onClick={obBack}
          aria-label="Back"
          style={{
            width: 40, height: 40, borderRadius: 20, border: `1px solid ${BORDER}`, background: '#FFFFFF',
            fontSize: 16, color: '#6E6A7E', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
          }}
        >
          ←
        </button>
        <div style={{ flex: 1, display: 'flex', gap: 6 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= obStep ? ACCENT : BORDER }} />
          ))}
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#8B86A0', flexShrink: 0 }}>{obStep + 1} of 3</div>
      </div>

      {obStep === 0 && (
        <div style={{ flex: 1, paddingTop: 48 }}>
          <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.5, lineHeight: 1.2 }}>
            What should we call you?
          </div>
          <div style={{ fontSize: 14, color: '#6E6A7E', marginTop: 8, lineHeight: 1.5 }}>
            Your name and color appear on everything you log.
          </div>
          <input
            className="foc-accent"
            value={ob.yourName}
            onChange={(e) => setOb({ yourName: e.target.value })}
            placeholder="Your first name"
            style={nameInput}
          />
          <div style={{ fontSize: 13, fontWeight: 600, color: '#6E6A7E', margin: '22px 2px 10px' }}>Your color</div>
          <Swatches selected={ob.yourColor} onPick={(k) => setOb({ yourColor: k })} />
        </div>
      )}

      {obStep === 1 && (
        <div style={{ flex: 1, paddingTop: 48 }}>
          <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.5, lineHeight: 1.2 }}>Now your partner</div>
          <div style={{ fontSize: 14, color: '#6E6A7E', marginTop: 8, lineHeight: 1.5 }}>
            They get their own color — you can invite them to the app later.
          </div>
          <input
            className="foc-accent"
            value={ob.partnerName}
            onChange={(e) => setOb({ partnerName: e.target.value })}
            placeholder="Partner's first name"
            style={nameInput}
          />
          <div style={{ fontSize: 13, fontWeight: 600, color: '#6E6A7E', margin: '22px 2px 10px' }}>Their color</div>
          <Swatches selected={ob.partnerColor} onPick={(k) => setOb({ partnerColor: k })} />
        </div>
      )}

      {obStep === 2 && (
        <div style={{ flex: 1, paddingTop: 48 }}>
          <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.5, lineHeight: 1.2 }}>Household basics</div>
          <div style={{ fontSize: 14, color: '#6E6A7E', marginTop: 8, lineHeight: 1.5 }}>
            You can change any of this later.
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#6E6A7E', margin: '26px 2px 10px' }}>Currency</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['AED', 'USD', 'EUR', 'GBP'].map((c) => (
              <button
                key={c}
                onClick={() => setOb({ currency: c })}
                style={{
                  padding: '10px 16px', borderRadius: 18, fontSize: 13.5, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit', ...chipStyle(ob.currency === c),
                }}
              >
                {c}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#6E6A7E', margin: '22px 2px 10px' }}>Monthly budgets</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { id: true, label: 'Suggested budgets' },
              { id: false, label: 'Start blank' },
            ].map((b) => (
              <button
                key={b.label}
                onClick={() => setOb({ suggested: b.id })}
                style={{
                  padding: '10px 16px', borderRadius: 18, fontSize: 13.5, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit', ...chipStyle(ob.suggested === b.id),
                }}
              >
                {b.label}
              </button>
            ))}
          </div>
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 12, background: '#FFFFFF', borderRadius: 18,
              padding: 16, marginTop: 30, boxShadow: '0 1px 3px rgba(33,31,42,0.04)',
            }}
          >
            <div style={{ display: 'flex' }}>
              <Avatar initial={(ob.yourName.trim()[0] || '?').toUpperCase()} bg={c0.bg} fg={c0.fg} />
              <Avatar
                initial={(ob.partnerName.trim()[0] || '?').toUpperCase()}
                bg={c1.bg}
                fg={c1.fg}
                style={{ marginLeft: -10, border: '2px solid #FFFFFF' }}
              />
            </div>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 600 }}>
                {(ob.yourName.trim() || 'You') + ' & ' + (ob.partnerName.trim() || 'your partner')}
              </div>
              <div style={{ fontSize: 12, color: '#8B86A0', marginTop: 1 }}>Ready to budget together</div>
            </div>
          </div>
        </div>
      )}

      <PrimaryButton onClick={obNext}>{obStep === 2 ? 'Finish setup' : 'Continue'}</PrimaryButton>
    </div>
  )
}
