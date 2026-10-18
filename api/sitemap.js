// Sitemap dinamis: halaman utama, kategori, semua produk dan toko yang aktif.
import { BASE_URL, KATEGORI, ambil, esc } from './_seo.js';
import { slugUrl } from './_kategori.js';

const tanggal = (v) => (v ? String(v).slice(0, 10) : undefined);

const url = (loc, { lastmod, changefreq, priority } = {}) =>
  `  <url>
    <loc>${esc(loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}${changefreq ? `\n    <changefreq>${changefreq}</changefreq>` : ''}${priority ? `\n    <priority>${priority}</priority>` : ''}
  </url>`;

export default async function handler(req, res) {
  const [produk, toko] = await Promise.all([
    ambil('produk?status=eq.AKTIF&select=id,created_at,toko(status)&order=created_at.desc&limit=1000'),
    ambil('toko?status=eq.AKTIF&select=id,created_at&order=created_at.desc&limit=1000'),
  ]);

  const entri = [
    url(`${BASE_URL}/`, { changefreq: 'daily', priority: '1.0' }),
    url(`${BASE_URL}/produk`, { changefreq: 'daily', priority: '0.9' }),
    ...Object.keys(KATEGORI).map((s) =>
      url(`${BASE_URL}/kategori/${slugUrl(s)}`, { changefreq: 'daily', priority: '0.8' }),
    ),
    url(`${BASE_URL}/toko`, { changefreq: 'daily', priority: '0.7' }),
    url(`${BASE_URL}/tutorial`, { changefreq: 'monthly', priority: '0.4' }),
    ...produk
      .filter((p) => p.toko?.status === 'AKTIF')
      .map((p) =>
        url(`${BASE_URL}/produk/${p.id}`, { lastmod: tanggal(p.created_at), changefreq: 'weekly', priority: '0.8' }),
      ),
    ...toko.map((t) =>
      url(`${BASE_URL}/toko/${t.id}`, { lastmod: tanggal(t.created_at), changefreq: 'weekly', priority: '0.6' }),
    ),
  ];

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entri.join('\n')}\n</urlset>\n`,
  );
}
