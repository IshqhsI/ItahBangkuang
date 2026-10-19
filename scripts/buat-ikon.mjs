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

// favicon.ico sungguhan (PNG di dalam wadah ICO). Tanpa ini /favicon.ico dijawab
// halaman aplikasi (HTML), padahal crawler dan browser selalu mencoba alamat itu.
const ukuranIco = [16, 32, 48];
const gambarIco = await Promise.all(
  ukuranIco.map((u) => sharp(biasa).resize(u, u).png().toBuffer()),
);
const kepala = Buffer.alloc(6);
kepala.writeUInt16LE(0, 0); // dicadangkan
kepala.writeUInt16LE(1, 2); // jenis: ikon
kepala.writeUInt16LE(ukuranIco.length, 4);
let offset = 6 + 16 * ukuranIco.length;
const entri = gambarIco.map((png, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(ukuranIco[i], 0); // lebar
  e.writeUInt8(ukuranIco[i], 1); // tinggi
  e.writeUInt16LE(1, 4); // bidang warna
  e.writeUInt16LE(32, 6); // bit per piksel
  e.writeUInt32LE(png.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += png.length;
  return e;
});
writeFileSync('public/favicon.ico', Buffer.concat([kepala, ...entri, ...gambarIco]));
console.log('dibuat public/favicon.ico', ukuranIco.join('/'));
