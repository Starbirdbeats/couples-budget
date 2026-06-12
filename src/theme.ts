import type { ColorKey } from './types'

export const INK = '#211F2A'
export const MUTED = '#8B86A0'
export const GREEN = '#2E7D5B'
export const RED = '#B6455A'
export const AMBER = '#A8742B'
export const ACCENT = '#6053CE'
export const BORDER = '#E6E3EF'
export const TRACK = '#F0EEF6'
export const FAINT = '#B0ACBE'
export const TEXT_SOFT = '#6E6A7E'
export const DIVIDER = '#F0EEF6'

export const COLORS: Record<ColorKey, { fg: string; bg: string }> = {
  indigo: { fg: '#6053CE', bg: '#ECE9FA' },
  rose: { fg: '#C0457E', bg: '#F8E8F0' },
  green: { fg: '#2E7D5B', bg: '#E4F0EA' },
  amber: { fg: '#A8742B', bg: '#F6ECDC' },
}

// category palette derived from the Funds page colors (indigo / rose / green + tints)
export const CAT_COLORS = ['#6053CE', '#C0457E', '#2E7D5B', '#8A7FE0', '#D685AC', '#6FAE91', '#8E8A9E', '#C9C3E2']

export const COLOR_KEYS: ColorKey[] = ['indigo', 'rose', 'green', 'amber']

export const card: React.CSSProperties = {
  background: '#FFFFFF',
  borderRadius: 18,
  boxShadow: '0 1px 3px rgba(33,31,42,0.04)',
}

export const chipStyle = (active: boolean) => ({
  border: `1px solid ${active ? INK : BORDER}`,
  background: active ? INK : '#FFFFFF',
  color: active ? '#FFFFFF' : TEXT_SOFT,
})
