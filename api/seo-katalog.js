// HTML ramah crawler untuk /produk (semua produk) dan /kategori/:slug, berhalaman.
import {
  BASE_URL, PER_HALAMAN, ambilDenganTotal, halaman as bangunHalaman, kirim, esc, teksHarga, tautanHalaman,
} from './_seo.js';
import { KATEGORI_TEKS, LOKASI, LOKASI_PENDEK, slugUrl, slugDariUrl } from './_kategori.js';

export default async function handler(req, res) {
  // Mendukung /kategori/:slug (slug) maupun /produk?kategori=... (kategori)
  const slug = slugDariUrl(req.query.slug || req.query.kategori || '');
  const info = KATEGORI_TEKS[slug];
  const diminta = Boolean(req.query.slug);
  const hal = Math.max(1, parseInt(req.query.halaman, 10) || 1);

  if (diminta && !info) {
    return kirim(
      res,
      404,
      bangunHalaman({
        judul: 'Kategori tidak ditemukan — ItahBangkuang',
        deskripsi: 'Kategori ini tidak tersedia di ItahBangkuang.',
        kanonik: `${BASE_URL}/produk`,
        noindex: true,
        isi: '<h1>Kategori tidak ditemukan</h1><p><a href="/produk">Lihat semua produk</a></p>',
      }),
    );
  }

  const dasar = info ? `${BASE_URL}/kategori/${slugUrl(slug)}` : `${BASE_URL}/produk`;
  const filter = info ? `&kategori=eq.${slug}` : '';
  const { baris, total } = await ambilDenganTotal(
    `produk?status=eq.AKTIF${filter}&toko.status=eq.AKTIF` +
      '&select=id,slug,nama_produk,harga,varian,kategori,toko!inner(nama_toko,status)' +
      `&order=created_at.desc&limit=${PER_HALAMAN}&offset=${(hal - 1) * PER_HALAMAN}`,
  );
  const produk = baris;

  // Halaman di luar jangkauan: 404 agar tidak diindeks
  if (hal > 1 && produk.length === 0) {
    return kirim(
      res,
      404,
      bangunHalaman({
        judul: 'Halaman tidak ditemukan — ItahBangkuang',
        deskripsi: 'Halaman ini tidak tersedia.',
        kanonik: dasar,
        noindex: true,
        isi: `<h1>Halaman tidak ditemukan</h1><p><a href="${dasar}">Kembali</a></p>`,
      }),
    );
  }

  const nav = tautanHalaman(dasar, hal, total);
  const kanonik = nav.alamat(hal);
  const nama = info ? `${info.label} di ${LOKASI_PENDEK}` : `Semua Produk Warga ${LOKASI_PENDEK}`;
  const judul = `${nama}${hal > 1 ? ` — Halaman ${hal}` : ''} | ItahBangkuang`;
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
        itemListElement: produk.map((p, i) => ({
          '@type': 'ListItem',
          position: (hal - 1) * PER_HALAMAN + i + 1,
          url: `${BASE_URL}/produk/${p.slug || p.id}`,
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
        ...(info ? [{ '@type': 'ListItem', position: 3, name: info.label, item: dasar }] : []),
      ],
    },
  ];

  const isi = `
<h1>${esc(info ? `${info.label} di ${LOKASI_PENDEK}` : 'Semua produk')}</h1>
<p>${esc(info ? info.intro : `Produk dan jasa dari warga ${LOKASI}.`)}</p>
<h2>Kategori</h2>
<ul>${Object.entries(KATEGORI_TEKS).map(([s, v]) => `<li><a href="${BASE_URL}/kategori/${slugUrl(s)}">${esc(v.label)}</a></li>`).join('')}</ul>
<h2>Daftar produk${total ? ` (${total})` : ''}</h2>
${produk.length
    ? `<ul>${produk.map((p) => `<li><a href="${BASE_URL}/produk/${esc(p.slug || p.id)}">${esc(p.nama_produk)}</a> — ${esc(teksHarga(p))} — ${esc(p.toko.nama_toko)}</li>`).join('')}</ul>`
    : '<p>Belum ada produk.</p>'}
${nav.nav}`;

  kirim(res, 200, bangunHalaman({ judul, deskripsi, kanonik, jsonld, isi, kepala: nav.head }));
}
