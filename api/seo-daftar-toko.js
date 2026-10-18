// HTML ramah crawler untuk /toko (daftar toko), berhalaman.
import {
  BASE_URL, PER_HALAMAN, ambilDenganTotal, halaman as bangunHalaman, kirim, esc, tautanHalaman,
} from './_seo.js';
import { LOKASI, LOKASI_PENDEK } from './_kategori.js';

export default async function handler(req, res) {
  const hal = Math.max(1, parseInt(req.query.halaman, 10) || 1);
  const dasar = `${BASE_URL}/toko`;

  const { baris, total } = await ambilDenganTotal(
    'toko?status=eq.AKTIF&select=id,slug,nama_toko,alamat,terverifikasi' +
      `&order=terverifikasi.desc,created_at.desc&limit=${PER_HALAMAN}&offset=${(hal - 1) * PER_HALAMAN}`,
  );

  if (hal > 1 && baris.length === 0) {
    return kirim(
      res,
      404,
      bangunHalaman({
        judul: 'Halaman tidak ditemukan — ItahBangkuang',
        deskripsi: 'Halaman ini tidak tersedia.',
        kanonik: dasar,
        noindex: true,
        isi: `<h1>Halaman tidak ditemukan</h1><p><a href="${dasar}">Kembali ke daftar toko</a></p>`,
      }),
    );
  }

  const nav = tautanHalaman(dasar, hal, total);
  const kanonik = nav.alamat(hal);
  const judul = `Toko di ${LOKASI_PENDEK}${hal > 1 ? ` — Halaman ${hal}` : ''} | ItahBangkuang`;
  const deskripsi = `Daftar toko dan penyedia jasa dari warga ${LOKASI}. Lihat produknya dan pesan lewat WhatsApp.`;

  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `Toko di ${LOKASI_PENDEK}`,
      description: deskripsi,
      url: kanonik,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: baris.map((t, i) => ({
          '@type': 'ListItem',
          position: (hal - 1) * PER_HALAMAN + i + 1,
          url: `${BASE_URL}/toko/${t.slug || t.id}`,
          name: t.nama_toko,
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Beranda', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Toko', item: dasar },
      ],
    },
  ];

  const isi = `
<h1>Toko di ${esc(LOKASI_PENDEK)}</h1>
<p>Toko dan penyedia jasa dari warga ${esc(LOKASI)}.</p>
${baris.length
    ? `<ul>${baris.map((t) => `<li><a href="${BASE_URL}/toko/${esc(t.slug || t.id)}">${esc(t.nama_toko)}</a>${t.alamat ? ` — ${esc(t.alamat)}` : ''}${t.terverifikasi ? ' (terverifikasi)' : ''}</li>`).join('')}</ul>`
    : '<p>Belum ada toko.</p>'}
${nav.nav}`;

  kirim(res, 200, bangunHalaman({ judul, deskripsi, kanonik, jsonld, isi, kepala: nav.head }));
}
