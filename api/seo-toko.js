// HTML ramah crawler untuk /toko/:id.
import { LOKASI_PENDEK } from './_kategori.js';
import {
  BASE_URL, GAMBAR_DEFAULT, ambil, adalahUuid, adalahSlug, alihkan, halaman, kirim, esc, ringkas, teksHarga,
} from './_seo.js';

export default async function handler(req, res) {
  const kunci = String(req.query.id || '');
  const lewatUuid = adalahUuid(kunci);
  const kanonik = `${BASE_URL}/toko/${encodeURIComponent(kunci)}`;

  const rows =
    lewatUuid || adalahSlug(kunci)
      ? await ambil(
          `toko?${lewatUuid ? 'id' : 'slug'}=eq.${kunci}&status=eq.AKTIF` +
            '&select=id,slug,nama_toko,alamat,deskripsi,foto_toko,terverifikasi,jam_buka,tautan_peta,layanan_pesan,layanan_antar,layanan_ambil',
        )
      : [];
  const t = rows[0];

  if (t && lewatUuid && t.slug) return alihkan(res, `${BASE_URL}/toko/${t.slug}`);

  if (!t) {
    return kirim(
      res,
      404,
      halaman({
        judul: 'Toko tidak ditemukan — ItahBangkuang',
        deskripsi: 'Toko ini tidak tersedia di ItahBangkuang.',
        kanonik,
        noindex: true,
        isi: '<h1>Toko tidak ditemukan</h1><p><a href="/produk">Lihat semua produk</a></p>',
      }),
    );
  }

  const produk = await ambil(
    `produk?toko_id=eq.${t.id}&status=eq.AKTIF&select=id,slug,nama_produk,harga,varian&order=created_at.desc&limit=50`,
  );

  const alamatToko = `${BASE_URL}/toko/${t.slug || t.id}`;
  const judul = `${t.nama_toko} — Toko di ${LOKASI_PENDEK} | ItahBangkuang`;
  const deskripsi = ringkas(
    `${t.nama_toko}${t.alamat ? `, ${t.alamat}` : ''}. ${t.deskripsi || 'Produk lokal dari warga Kelurahan Bangkuang.'} Pesan lewat WhatsApp.`,
  );

  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: t.nama_toko,
      description: t.deskripsi || `Toko ${t.nama_toko} di Kelurahan Bangkuang`,
      image: t.foto_toko || undefined,
      url: alamatToko,
      address: {
        '@type': 'PostalAddress',
        streetAddress: t.alamat || undefined,
        addressLocality: 'Bangkuang, Karau Kuala',
        addressRegion: 'Kalimantan Tengah',
        postalCode: '73761',
        addressCountry: 'ID',
      },
      areaServed: 'Kabupaten Barito Selatan',
      ...(t.tautan_peta ? { hasMap: t.tautan_peta } : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Beranda', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: t.nama_toko, item: alamatToko },
      ],
    },
  ];

  const isi = `
<h1>${esc(t.nama_toko)}</h1>
${t.foto_toko ? `<img src="${esc(t.foto_toko)}" alt="Foto ${esc(t.nama_toko)}" width="300" height="300">` : ''}
${t.alamat ? `<p>Alamat: ${esc(t.alamat)}</p>` : ''}
${t.jam_buka ? `<p>Jam buka: ${esc(t.jam_buka)}</p>` : ''}
<p>${t.layanan_pesan === false ? 'Toko ini memajang produk dan tidak menerima pesanan online; hubungi penjual atau datang langsung.' : 'Menerima pesanan online.'}${t.layanan_antar !== false ? ' Bisa diantar.' : ''}${t.layanan_ambil === true ? ' Ambil di tempat.' : ''}</p>
${t.terverifikasi ? '<p>Toko terverifikasi admin.</p>' : ''}
${t.deskripsi ? `<p>${esc(t.deskripsi)}</p>` : ''}
<h2>Produk dari ${esc(t.nama_toko)}</h2>
${produk.length
    ? `<ul>${produk.map((p) => `<li><a href="${BASE_URL}/produk/${esc(p.slug || p.id)}">${esc(p.nama_produk)}</a> — ${esc(teksHarga(p))}</li>`).join('')}</ul>`
    : '<p>Belum ada produk.</p>'}`;

  kirim(res, 200, halaman({ judul, deskripsi, kanonik: alamatToko, gambar: t.foto_toko || GAMBAR_DEFAULT, jsonld, isi }));
}
