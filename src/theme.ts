import type { ColorKey } from './types'

export const INK = '#211F2A'
export const MUTED = '#8B86A0' // decorative / ≥18px only — fails AA on small text
export const GREEN = '#2E7D5B'
export const RED = '#B6455A'
export const AMBER = '#A8742B' // bar/graphic fill only (~3:1 — fine for non-text)
export const AMBER_TEXT = '#8A5A18' // 5.9:1 on white — amber for small status text (AA)
export const ACCENT = '#6053CE'
export const BORDER = '#E6E3EF'
export const TRACK = '#F0EEF6'
export const FAINT = '#B0ACBE' // decorative / ≥18px only
export const TEXT_SOFT = '#6E6A7E' // 4.85:1 on #FFFFFF — the default for meaning-bearing small text
export const ICON_MUTED = '#6E6A7E' // perceivable icon affordances (e.g. delete ×)
export const PLACEHOLDER = '#7C7889' // ~4:1 — readable input placeholder
export const DIVIDER = '#F0EEF6'

export const COLORS: Record<ColorKey, { fg: string; bg: string }> = {
  indigo: { fg: '#6053CE', bg: '#ECE9FA' },
  rose: { fg: '#C0457E', bg: '#F8E8F0' },
  green: { fg: '#2E7D5B', bg: '#E4F0EA' },
  amber: { fg: '#A8742B', bg: '#F6ECDC' },
}

// Category palette — kept distinct from the member identity colors above so a
// category swatch never reads as "this is Star's". Hues sit in the same calm
// family but are shifted off the exact member fg values.
export const CAT_COLORS = ['#5547B8', '#B83C72', '#2F8C7A', '#8A7FE0', '#D685AC', '#C79A3A', '#5E8BC4', '#9B7BB8']

/**
 * Stable color for a category, keyed by a hash of its id rather than its spend
 * rank — so a category keeps the same color month to month even as the ranking
 * shifts. (Fixes the "colors reshuffle every month" defect.)
 */
export function catColor(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return CAT_COLORS[h % CAT_COLORS.length]
}

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
