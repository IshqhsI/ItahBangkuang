// HTML ramah crawler untuk /produk (daftar produk), termasuk /produk?kategori=...
import {
  BASE_URL, KATEGORI, ambil, halaman, kirim, esc, teksHarga,
} from './_seo.js';

export default async function handler(req, res) {
  const slug = String(req.query.kategori || '');
  const label = KATEGORI[slug] || '';
  const kanonik = label ? `${BASE_URL}/produk?kategori=${slug}` : `${BASE_URL}/produk`;

  const filter = label ? `&kategori=eq.${slug}` : '';
  const rows = await ambil(
    `produk?status=eq.AKTIF${filter}` +
      '&select=id,nama_produk,harga,varian,kategori,toko(nama_toko,status)&order=created_at.desc&limit=100',
  );
  const produk = rows.filter((p) => p.toko?.status === 'AKTIF');

  const judul = label
    ? `${label} — Produk Warga Kelurahan Bangkuang | ItahBangkuang`
    : 'Semua Produk Warga Kelurahan Bangkuang | ItahBangkuang';
  const deskripsi = label
    ? `Daftar ${label.toLowerCase()} dari warga Kelurahan Bangkuang. Pesan langsung dari penjual lewat WhatsApp.`
    : 'Daftar produk dan jasa dari warga Kelurahan Bangkuang: makanan, minuman, pakaian, dan jasa. Pesan langsung dari penjual lewat WhatsApp.';

  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: label || 'Semua produk',
      itemListElement: produk.slice(0, 50).map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${BASE_URL}/produk/${p.id}`,
        name: p.nama_produk,
      })),
    },
  ];

  const isi = `
<h1>${esc(label || 'Semua produk')}</h1>
<p>Produk dan jasa dari warga Kelurahan Bangkuang.</p>
<h2>Kategori</h2>
<ul>${Object.entries(KATEGORI).map(([s, l]) => `<li><a href="${BASE_URL}/produk?kategori=${s}">${esc(l)}</a></li>`).join('')}</ul>
<h2>Daftar produk</h2>
${produk.length
    ? `<ul>${produk.map((p) => `<li><a href="${BASE_URL}/produk/${esc(p.id)}">${esc(p.nama_produk)}</a> — ${esc(teksHarga(p))} — ${esc(p.toko.nama_toko)}</li>`).join('')}</ul>`
    : '<p>Belum ada produk.</p>'}`;

  kirim(res, 200, halaman({ judul, deskripsi, kanonik, jsonld, isi }));
}
