// HTML ramah crawler untuk /produk (semua produk) dan /kategori/:slug.
import { BASE_URL, ambil, halaman, kirim, esc, teksHarga } from './_seo.js';
import { KATEGORI_TEKS, LOKASI, LOKASI_PENDEK, slugUrl, slugDariUrl } from './_kategori.js';

export default async function handler(req, res) {
  // Mendukung /kategori/:slug (slug) maupun /produk?kategori=... (kategori)
  const slug = slugDariUrl(req.query.slug || req.query.kategori || '');
  const info = KATEGORI_TEKS[slug];
  const diminta = Boolean(req.query.slug);

  if (diminta && !info) {
    return kirim(
      res,
      404,
      halaman({
        judul: 'Kategori tidak ditemukan — ItahBangkuang',
        deskripsi: 'Kategori ini tidak tersedia di ItahBangkuang.',
        kanonik: `${BASE_URL}/produk`,
        noindex: true,
        isi: '<h1>Kategori tidak ditemukan</h1><p><a href="/produk">Lihat semua produk</a></p>',
      }),
    );
  }

  const kanonik = info ? `${BASE_URL}/kategori/${slugUrl(slug)}` : `${BASE_URL}/produk`;
  const filter = info ? `&kategori=eq.${slug}` : '';
  const rows = await ambil(
    `produk?status=eq.AKTIF${filter}` +
      '&select=id,nama_produk,harga,varian,kategori,toko(nama_toko,status)&order=created_at.desc&limit=100',
  );
  const produk = rows.filter((p) => p.toko?.status === 'AKTIF');

  const judul = info
    ? `${info.label} di ${LOKASI_PENDEK} | ItahBangkuang`
    : `Semua Produk Warga ${LOKASI_PENDEK} | ItahBangkuang`;
  const deskripsi = info
    ? `${info.label} dari warga ${LOKASI}. Lihat produk, cek harga dan stok, lalu pesan lewat WhatsApp.`
    : `Daftar produk dan jasa dari warga ${LOKASI}: makanan, minuman, pakaian, dan jasa. Pesan langsung dari penjual lewat WhatsApp.`;

  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: info ? `${info.label} di ${LOKASI_PENDEK}` : 'Semua produk',
      description: deskripsi,
      url: kanonik,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: produk.slice(0, 50).map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${BASE_URL}/produk/${p.id}`,
          name: p.nama_produk,
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Beranda', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Produk', item: `${BASE_URL}/produk` },
        ...(info ? [{ '@type': 'ListItem', position: 3, name: info.label, item: kanonik }] : []),
      ],
    },
  ];

  const isi = `
<h1>${esc(info ? `${info.label} di ${LOKASI_PENDEK}` : 'Semua produk')}</h1>
<p>${esc(info ? info.intro : `Produk dan jasa dari warga ${LOKASI}.`)}</p>
<h2>Kategori</h2>
<ul>${Object.entries(KATEGORI_TEKS).map(([s, v]) => `<li><a href="${BASE_URL}/kategori/${slugUrl(s)}">${esc(v.label)}</a></li>`).join('')}</ul>
<h2>Daftar produk</h2>
${produk.length
    ? `<ul>${produk.map((p) => `<li><a href="${BASE_URL}/produk/${esc(p.id)}">${esc(p.nama_produk)}</a> — ${esc(teksHarga(p))} — ${esc(p.toko.nama_toko)}</li>`).join('')}</ul>`
    : '<p>Belum ada produk.</p>'}`;

  kirim(res, 200, halaman({ judul, deskripsi, kanonik, jsonld, isi }));
}
