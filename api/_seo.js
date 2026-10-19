// Pembantu bersama untuk fungsi SEO sisi server (awalan "_" = bukan rute).
// Crawler mesin pencari dan media sosial tidak selalu menjalankan JavaScript,
// jadi vercel.json mengalihkan mereka ke HTML yang sudah berisi konten nyata.

import { KATEGORI_TEKS } from './_kategori.js';

export const BASE_URL = 'https://www.itahbangkuang.my.id';
export const GAMBAR_DEFAULT = `${BASE_URL}/og-image.jpg`;

// Label kategori diturunkan dari sumber tunggal di _kategori.js
export const KATEGORI = Object.fromEntries(
  Object.entries(KATEGORI_TEKS).map(([slug, v]) => [slug, v.label]),
);

export const esc = (v = '') =>
  String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const rupiah = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

export const adaVarian = (p) => Array.isArray(p?.varian) && p.varian.length > 0;

export const totalStok = (p) =>
  adaVarian(p)
    ? p.varian.reduce((a, v) => a + (Number(v.stok) || 0), 0)
    : Number(p?.stok) || 0;

export const rentangHarga = (p) => {
  if (!adaVarian(p)) return { min: Number(p.harga) || 0, maks: Number(p.harga) || 0 };
  const h = p.varian.map((v) => Number(v.harga) || 0);
  return { min: Math.min(...h), maks: Math.max(...h) };
};

export const teksHarga = (p) => {
  const { min, maks } = rentangHarga(p);
  return min === maks ? rupiah(min) : `${rupiah(min)} – ${rupiah(maks)}`;
};

export const ringkas = (teks = '', panjang = 155) => {
  const t = String(teks).replace(/\s+/g, ' ').trim();
  return t.length > panjang ? t.slice(0, panjang - 1).trimEnd() + '…' : t;
};

// GET ke PostgREST (Supabase). Mengembalikan [] bila gagal.
export async function ambil(path) {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  try {
    const r = await fetch(`${url}/rest/v1/${path}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    return r.ok ? await r.json() : [];
  } catch {
    return [];
  }
}

// Seperti ambil(), tetapi juga mengembalikan jumlah seluruh baris (header Content-Range).
export async function ambilDenganTotal(path) {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return { baris: [], total: 0 };
  try {
    const r = await fetch(`${url}/rest/v1/${path}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'count=exact' },
    });
    if (!r.ok) return { baris: [], total: 0 };
    const baris = await r.json();
    const total = Number((r.headers.get('content-range') || '').split('/')[1]);
    return { baris, total: Number.isFinite(total) ? total : baris.length };
  } catch {
    return { baris: [], total: 0 };
  }
}

export const PER_HALAMAN = 24;

// Penomoran halaman untuk HTML bot: tautan sebelumnya/berikutnya yang bisa diikuti crawler
export function tautanHalaman(dasar, halaman, total) {
  const jumlah = Math.max(1, Math.ceil(total / PER_HALAMAN));
  const alamat = (n) => (n > 1 ? `${dasar}${dasar.includes('?') ? '&' : '?'}halaman=${n}` : dasar);
  const head = [
    halaman > 1 ? `<link rel="prev" href="${alamat(halaman - 1)}">` : '',
    halaman < jumlah ? `<link rel="next" href="${alamat(halaman + 1)}">` : '',
  ].join('\n');
  const nav = jumlah > 1
    ? `<nav aria-label="Halaman">${halaman > 1 ? `<a rel="prev" href="${alamat(halaman - 1)}">Sebelumnya</a> ` : ''}Halaman ${halaman} dari ${jumlah}${halaman < jumlah ? ` <a rel="next" href="${alamat(halaman + 1)}">Berikutnya</a>` : ''}</nav>`
    : '';
  return { head, nav, alamat, jumlah };
}

export const laJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

/**
 * Membangun halaman HTML lengkap yang ramah crawler.
 * @param {object} o judul, deskripsi, kanonik, gambar, tipe, jsonld[], isi (HTML), noindex
 */
export function halaman({
  judul,
  deskripsi,
  kanonik,
  gambar = GAMBAR_DEFAULT,
  tipe = 'website',
  jsonld = [],
  isi = '',
  noindex = false,
  kepala = '',
}) {
  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(judul)}</title>
<meta name="description" content="${esc(deskripsi)}">
<meta name="robots" content="${noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}">
<link rel="canonical" href="${esc(kanonik)}">
<meta property="og:type" content="${esc(tipe)}">
<meta property="og:site_name" content="ItahBangkuang">
<meta property="og:locale" content="id_ID">
<meta property="og:title" content="${esc(judul)}">
<meta property="og:description" content="${esc(deskripsi)}">
<meta property="og:image" content="${esc(gambar)}">
<meta property="og:url" content="${esc(kanonik)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(judul)}">
<meta name="twitter:description" content="${esc(deskripsi)}">
<meta name="twitter:image" content="${esc(gambar)}">
${kepala}
${jsonld.map((j) => `<script type="application/ld+json">${laJson(j)}</script>`).join('\n')}
</head>
<body>
<header>
  <p><a href="${BASE_URL}/">ItahBangkuang</a> (Itah Bangkuang) — Marketplace produk lokal Kelurahan Bangkuang, Barito Selatan</p>
  <nav><a href="${BASE_URL}/">Beranda</a> · <a href="${BASE_URL}/produk">Semua produk</a> · <a href="${BASE_URL}/tutorial">Cara pakai</a></nav>
</header>
<main>
${isi}
</main>
</body>
</html>`;
}

export function kirim(res, status, html, { cache = 'public, s-maxage=600, stale-while-revalidate=1800' } = {}) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', status === 200 ? cache : 'public, s-maxage=60');
  res.status(status).send(html);
}

export const adalahSlug = (v) => /^[a-z0-9-]{1,120}$/.test(String(v || ''));

// Pengalihan permanen (301) untuk alamat lama (UUID) ke alamat ramah
export function alihkan(res, tujuan) {
  res.setHeader('Location', tujuan);
  res.setHeader('Cache-Control', 'public, s-maxage=3600');
  res.status(301).send(`Dialihkan ke ${tujuan}`);
}

export const adalahUuid = (v) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(v || ''));
