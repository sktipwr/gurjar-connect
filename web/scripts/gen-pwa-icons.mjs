// Generates PWA icon set from public/logo.png using sharp.
// Run from web/:  node scripts/gen-pwa-icons.mjs
import sharp from 'sharp'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = path.dirname(fileURLToPath(import.meta.url))
const pub = path.join(dir, '..', 'public')
const SRC = path.join(pub, 'logo.png')
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 }

/**
 * @param out          output filename in public/
 * @param size         square canvas size
 * @param contentScale fraction of the canvas the logo occupies (rest = white margin).
 *                     Maskable needs a smaller scale so content stays in the safe zone.
 */
async function make(out, size, contentScale) {
  const inner = Math.round(size * contentScale)
  const pad   = Math.round((size - inner) / 2)

  const logo = await sharp(SRC)
    .resize(inner, inner, { fit: 'contain', background: WHITE })
    .flatten({ background: WHITE })
    .toBuffer()

  await sharp({ create: { width: size, height: size, channels: 3, background: WHITE } })
    .composite([{ input: logo, top: pad, left: pad }])
    .png()
    .toFile(path.join(pub, out))

  console.log('✓', out, `${size}x${size}`)
}

await make('icon-192.png',          192, 0.92)
await make('icon-512.png',          512, 0.92)
await make('icon-maskable-512.png', 512, 0.80) // extra margin → safe zone for adaptive masks
await make('apple-touch-icon.png',  180, 0.86) // iOS applies its own rounded corners
console.log('done')
