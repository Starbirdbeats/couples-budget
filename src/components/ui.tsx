/* eslint-disable react-refresh/only-export-components */
import type { CSSProperties, ReactNode } from 'react'
import { TRACK } from '../theme'

export function Avatar({
  initial, bg, fg, size = 34, style,
}: {
  initial: string
  bg: string
  fg: string
  size?: number
  style?: CSSProperties
}) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: size / 2, background: bg, color: fg,
        fontSize: size <= 26 ? 11 : size <= 30 ? 12 : 13, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        ...style,
      }}
    >
      {initial}
    </div>
  )
}

export function Chip({
  label, active, border, bg, fg, onClick, children,
}: {
  label?: string
  active?: boolean
  border: string
  bg: string
  fg: string
  onClick: () => void
  children?: ReactNode
}) {
  void active
  return (
    <button
      onClick={onClick}
      style={{
        padding: children ? undefined : '10px 16px',
        borderRadius: 18,
        border: `1px solid ${border}`,
        background: bg,
        color: fg,
        fontSize: 13.5,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {children ?? label}
    </button>
  )
}

export function Bar({
  pct, color, pace, height = 6, style,
}: {
  pct: number
  color: string
  pace?: number
  height?: number
  style?: CSSProperties
}) {
  return (
    <div style={{ height, background: TRACK, borderRadius: height / 2, position: 'relative', ...style }}>
      <div
        style={{
          height: '100%', width: `${pct}%`, background: color, borderRadius: height / 2,
          transition: 'width 0.4s ease',
        }}
      />
      {pace !== undefined && (
        <div
          style={{
            position: 'absolute', top: -2, bottom: -2, left: `${pace}%`, width: 2,
            background: '#211F2A', opacity: 0.25,
          }}
        />
      )}
    </div>
  )
}

export function SectionLabel({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        fontSize: 12, fontWeight: 600, letterSpacing: 1.2, color: '#8B86A0',
        textTransform: 'uppercase', margin: '22px 2px 10px', ...style,
      }}
    >
      {children}
    </div>
  )
}

export function FieldLabel({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 600, color: '#6E6A7E', margin: '18px 2px 8px', ...style }}>
      {children}
    </div>
  )
}

export const inputStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 14px',
  borderRadius: 13,
  border: '1px solid #E6E3EF',
  fontSize: 14,
  background: '#FFFFFF',
  outline: 'none',
  fontFamily: 'inherit',
  color: '#211F2A',
}

export function PrimaryButton({
  children, onClick, style,
}: {
  children: ReactNode
  onClick: () => void
  style?: CSSProperties
}) {
  return (
    <button
      className="hov-dark"
      onClick={onClick}
      style={{
        width: '100%', padding: '16px 0', borderRadius: 15, border: 'none',
        background: '#211F2A', color: '#FFFFFF', fontSize: 15.5, fontWeight: 600,
        cursor: 'pointer', fontFamily: 'inherit', ...style,
      }}
    >
      {children}
    </button>
  )
}
