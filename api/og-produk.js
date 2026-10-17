// Pratinjau tautan produk untuk crawler (WhatsApp, Facebook, Telegram, dll).
// Aplikasi ini SPA: crawler tidak menjalankan JavaScript, sehingga tanpa fungsi
// ini semua tautan produk menampilkan pratinjau umum situs. Rute /produk/:id
// dialihkan ke sini HANYA untuk user-agent crawler (lihat vercel.json).

const BASE_URL = 'https://itah-bangkuang.vercel.app';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.webp`;

const esc = (v = '') =>
  String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const rupiah = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

function teksHarga(p) {
  const v = Array.isArray(p.varian) ? p.varian : [];
  if (v.length) {
    const h = v.map((x) => Number(x.harga) || 0);
    const min = Math.min(...h);
    const max = Math.max(...h);
    return min === max ? rupiah(min) : `${rupiah(min)} – ${rupiah(max)}`;
  }
  return rupiah(p.harga);
}

export default async function handler(req, res) {
  const id = String(req.query.id || '');
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  let judul = 'ItahBangkuang — Marketplace Lokal Kelurahan Bangkuang';
  let deskripsi =
    'Produk dan jasa dari warga Kelurahan Bangkuang. Pesan di sini, selesaikan melalui WhatsApp.';
  let gambar = DEFAULT_IMAGE;
  const kanonik = `${BASE_URL}/produk/${encodeURIComponent(id)}`;

  if (/^[0-9a-f-]{8,40}$/i.test(id) && url && key) {
    try {
      const r = await fetch(
        `${url}/rest/v1/produk?id=eq.${id}&status=eq.AKTIF` +
          '&select=nama_produk,deskripsi,harga,foto_url,varian,toko(nama_toko,status)',
        { headers: { apikey: key, Authorization: `Bearer ${key}` } },
      );
      const rows = r.ok ? await r.json() : [];
      const p = rows[0];
      if (p && p.toko?.status === 'AKTIF') {
        judul = `${p.nama_produk} — ${p.toko.nama_toko} | ItahBangkuang`;
        const ringkas = (p.deskripsi || '').replace(/\s+/g, ' ').trim().slice(0, 140);
        deskripsi = `${teksHarga(p)} · ${p.toko.nama_toko}${ringkas ? ' · ' + ringkas : ''}`;
        if (p.foto_url) gambar = p.foto_url;
      }
    } catch {
      /* jatuh ke pratinjau umum */
    }
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  res.status(200).send(`<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<title>${esc(judul)}</title>
<meta name="description" content="${esc(deskripsi)}">
<link rel="canonical" href="${esc(kanonik)}">
<meta property="og:type" content="product">
<meta property="og:site_name" content="ItahBangkuang">
<meta property="og:title" content="${esc(judul)}">
<meta property="og:description" content="${esc(deskripsi)}">
<meta property="og:image" content="${esc(gambar)}">
<meta property="og:url" content="${esc(kanonik)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(judul)}">
<meta name="twitter:description" content="${esc(deskripsi)}">
<meta name="twitter:image" content="${esc(gambar)}">
</head>
<body><p><a href="${esc(kanonik)}">${esc(judul)}</a></p></body>
</html>`);
}
