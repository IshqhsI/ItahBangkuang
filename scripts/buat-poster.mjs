// Membuat poster ajakan penjual (A5, siap cetak) lengkap dengan kode QR.
//   node scripts/buat-poster.mjs
// Hasil: materi/poster-ajakan.html, .png (untuk dikirim lewat WhatsApp), dan .pdf (untuk dicetak).
// Memerlukan Google Chrome / Edge terpasang (dipakai tanpa tampilan untuk membuat PNG dan PDF).
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import QRCode from 'qrcode';

const AKAR = path.resolve(import.meta.dirname, '..');
const KELUAR = path.join(AKAR, 'materi');
mkdirSync(KELUAR, { recursive: true });

const TAUTAN = 'https://www.itahbangkuang.my.id/jualan?dari=poster';
const TAUTAN_TAMPIL = 'itahbangkuang.my.id/jualan';
const WA_TAMPIL = '0822-5315-8560';

const qr = await QRCode.toString(TAUTAN, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#163a32', light: '#ffffff' } });
const logo = readFileSync(path.join(AKAR, 'public', 'pwa-192x192.png')).toString('base64');

const html = `<!doctype html>
<html lang="id"><head><meta charset="utf-8"><title>Poster ajakan penjual ItahBangkuang</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Besley:wght@600;700&family=Schibsted+Grotesk:wght@400;600;800&display=swap" rel="stylesheet">
<style>
  @page { size: 148mm 210mm; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 148mm; height: 210mm; }
  body { font-family: 'Schibsted Grotesk', system-ui, sans-serif; color: #163a32; background: #e5ece6; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .poster { position: relative; width: 148mm; height: 210mm; padding: 11mm 11mm 9mm; display: flex; flex-direction: column; overflow: hidden; background: #e5ece6; }
  .poster::before { content: ''; position: absolute; right: -28mm; top: -26mm; width: 80mm; height: 80mm; border-radius: 50%; background: #f4b98a; opacity: .55; }
  .poster::after { content: ''; position: absolute; left: -30mm; bottom: -34mm; width: 90mm; height: 90mm; border-radius: 50%; background: #cfdcd2; opacity: .8; }
  .poster > * { position: relative; z-index: 1; }
  .merek { display: flex; align-items: center; gap: 3mm; }
  .merek img { width: 11mm; height: 11mm; border-radius: 3mm; }
  .merek span { font-family: 'Besley', serif; font-weight: 700; font-size: 6.4mm; }
  .kicker { align-self: flex-start; margin-top: 9mm; padding: 1.2mm 3.6mm; background: #fff; border-radius: 99mm; font-weight: 800; font-size: 3.3mm; letter-spacing: .02em; }
  h1 { margin-top: 4mm; font-family: 'Besley', serif; font-weight: 700; font-size: 11.2mm; line-height: 1.1; }
  .sub { margin-top: 4mm; max-width: 112mm; font-size: 4.5mm; line-height: 1.5; color: #3d524b; }
  ul { list-style: none; margin: 5mm 0 7mm; display: grid; gap: 2.2mm; }
  li { display: flex; align-items: center; gap: 3mm; font-weight: 800; font-size: 4.3mm; }
  li i { display: grid; place-items: center; width: 6.2mm; height: 6.2mm; border-radius: 50%; background: #163a32; color: #fff; font-style: normal; font-size: 3.6mm; }
  .kartu-qr { margin-top: auto; display: flex; align-items: center; gap: 6mm; padding: 6mm; background: #fff; border-radius: 8mm; box-shadow: 0 2mm 6mm rgba(22,58,50,.12); }
  .qr { width: 44mm; height: 44mm; flex-shrink: 0; }
  .qr svg { width: 100%; height: 100%; display: block; }
  .qr-teks h2 { font-family: 'Besley', serif; font-weight: 700; font-size: 6.2mm; line-height: 1.15; }
  .qr-teks p { margin-top: 2.2mm; font-size: 3.7mm; line-height: 1.45; color: #3d524b; }
  .tautan { display: inline-block; margin-top: 3mm; padding: 1.4mm 3.4mm; background: #e5ece6; border-radius: 99mm; font-weight: 800; font-size: 3.6mm; }
  .bantuan { margin-top: 5mm; text-align: center; font-size: 3.8mm; color: #3d524b; }
  .bantuan strong { color: #163a32; white-space: nowrap; }
</style></head>
<body><main class="poster">
  <div class="merek"><img alt="" src="data:image/png;base64,${logo}"><span>ItahBangkuang</span></div>
  <p class="kicker">Untuk penjual di Bangkuang</p>
  <h1>Punya usaha di Bangkuang?<br>Jual di sini.</h1>
  <p class="sub">Toko online untuk warga Bangkuang. Pembeli melihat produk Anda, memesan, lalu selesai lewat WhatsApp.</p>
  <ul>
    <li><i>✓</i> Gratis, tanpa potongan dari penjualan</li>
    <li><i>✓</i> Toko langsung tampil setelah mendaftar</li>
    <li><i>✓</i> Pesanan masuk ke HP Anda</li>
    <li><i>✓</i> Cukup dengan HP, foto langsung dari kamera</li>
  </ul>
  <section class="kartu-qr">
    <div class="qr">${qr}</div>
    <div class="qr-teks">
      <h2>Pindai untuk membuka toko gratis</h2>
      <p>Arahkan kamera HP ke kode ini, lalu ikuti langkahnya.</p>
      <span class="tautan">${TAUTAN_TAMPIL}</span>
    </div>
  </section>
  <p class="bantuan">Perlu bantuan mendaftar? Hubungi admin: WhatsApp <strong>${WA_TAMPIL}</strong></p>
</main></body></html>`;

const berkasHtml = path.join(KELUAR, 'poster-ajakan.html');
writeFileSync(berkasHtml, html);

const kandidat = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);
const peramban = kandidat.find((p) => existsSync(p));
if (!peramban) {
  console.log('Chrome/Edge tidak ditemukan. HTML sudah dibuat; buka dan cetak ke PDF secara manual.');
  process.exit(0);
}

const url = pathToFileURL(berkasHtml).href;
const dasar = ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=8000'];
// PNG: 148 x 210 mm pada 96 dpi = 559 x 794 px; skala 3x ≈ 288 dpi
execFileSync(peramban, [...dasar, '--force-device-scale-factor=3', '--window-size=560,794', `--screenshot=${path.join(KELUAR, 'poster-ajakan.png')}`, url], { stdio: 'ignore' });
execFileSync(peramban, [...dasar, '--no-pdf-header-footer', `--print-to-pdf=${path.join(KELUAR, 'poster-ajakan.pdf')}`, url], { stdio: 'ignore' });
console.log('Selesai: materi/poster-ajakan.png dan materi/poster-ajakan.pdf');
