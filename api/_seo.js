// Pembantu bersama untuk fungsi SEO sisi server (awalan "_" = bukan rute).
// Crawler mesin pencari dan media sosial tidak selalu menjalankan JavaScript,
// jadi vercel.json mengalihkan mereka ke HTML yang sudah berisi konten nyata.

export const BASE_URL = 'https://www.itahbangkuang.my.id';
export const GAMBAR_DEFAULT = `${BASE_URL}/og-image.jpg`;

// Salinan dari src/lib/kategori.js (file itu tidak bisa diimpor dari sini
// karena memuat Vue). Ubah keduanya bersamaan.
export const KATEGORI = {
  makanan_jajanan: 'Makanan & Jajanan',
  aneka_minuman: 'Aneka Minuman',
  dapur_lauk: 'Dapur & Lauk Pauk',
  pakaian_jahitan: 'Pakaian & Jahitan',
  jasa_tukang: 'Jasa & Tukang',
  mesin_elektronik: 'Mesin & Elektronik',
  lainnya: 'Lainnya',
};

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
${jsonld.map((j) => `<script type="application/ld+json">${laJson(j)}</script>`).join('\n')}
</head>
<body>
<header>
  <p><a href="${BASE_URL}/">ItahBangkuang</a> — Marketplace produk lokal Kelurahan Bangkuang</p>
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

export const adalahUuid = (v) => /^[0-9a-f-]{8,40}$/i.test(String(v || ''));
