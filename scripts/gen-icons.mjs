// Generates PWA icons from the app mark: two overlapping circles (indigo + rose)
// on the soft shell background, matching the sign-in screen logo.
import sharp from 'sharp'
import { writeFileSync } from 'node:fs'

const mark = (size, pad, bg) => {
  const r = (size - pad * 2) / 3.2
  const cy = size / 2
  const cx1 = size / 2 - r * 0.62
  const cx2 = size / 2 + r * 0.62
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${bg ? `<rect width="${size}" height="${size}" fill="#F7F6FB"/>` : ''}
  <g style="mix-blend-mode:multiply">
    <circle cx="${cx1}" cy="${cy}" r="${r}" fill="#6053CE"/>
  </g>
  <g style="mix-blend-mode:multiply">
    <circle cx="${cx2}" cy="${cy}" r="${r}" fill="#C0457E"/>
  </g>
</svg>`
}

const out = (name, size, pad) =>
  sharp(Buffer.from(mark(size, pad, true))).png().toFile(`public/${name}`)

await Promise.all([
  out('pwa-192x192.png', 192, 24),
  out('pwa-512x512.png', 512, 64),
  out('pwa-maskable-512x512.png', 512, 128),
  out('apple-touch-icon.png', 180, 24),
])

writeFileSync('public/favicon.svg', mark(64, 6, false))
console.log('icons written to public/')
