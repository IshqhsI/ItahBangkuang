// Membuat ikon PWA dan favicon dari bentuk lengkung dan toko.
// Jalankan: node scripts/buat-ikon.mjs
import { writeFileSync } from 'node:fs';
import sharp from 'sharp';
import { svgIkon } from './ikon-lengkung.mjs';

const biasa = Buffer.from(svgIkon());
const maskable = Buffer.from(svgIkon({ maskable: true }));

writeFileSync('public/favicon.svg', svgIkon());

const keluaran = [
  ['public/pwa-192x192.png', biasa, 192],
  ['public/pwa-512x512.png', biasa, 512],
  ['public/pwa-maskable-512x512.png', maskable, 512],
  ['public/apple-touch-icon.png', maskable, 180],
  ['public/favicon.png', biasa, 64],
  ['public/favicon-96x96.png', biasa, 96],
];

for (const [berkas, svg, ukuran] of keluaran) {
  await sharp(svg).resize(ukuran, ukuran).png().toFile(berkas);
  console.log('dibuat', berkas);
}
