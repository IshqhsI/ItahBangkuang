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

// Lencana notifikasi: Android hanya memakai kanal alfa, jadi harus siluet satu warna.
// Lengkung putih dengan toko "dilubangi" (transparan).
const svgLencana = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
  <defs>
    <mask id="m">
      <rect width="96" height="96" fill="#000"/>
      <path d="M22 80 V44 A26 26 0 0 1 74 44 V80 Q74 86 68 86 H28 Q22 86 22 80 Z" fill="#fff"/>
      <path d="M31 42 H65 V50 A5.7 5.7 0 0 1 53.6 50 A5.7 5.7 0 0 1 42.2 50 A5.7 5.7 0 0 1 31 50 Z" fill="#000"/>
      <rect x="34" y="57" width="28" height="22" rx="2" fill="#000"/>
    </mask>
  </defs>
  <rect width="96" height="96" fill="#fff" mask="url(#m)"/>
</svg>`;
await sharp(Buffer.from(svgLencana)).resize(96, 96).png().toFile('public/badge-notif.png');
console.log('dibuat public/badge-notif.png');

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
