// HTML ramah crawler untuk /produk/:id (dialihkan dari vercel.json untuk user-agent bot).
import {
  BASE_URL, GAMBAR_DEFAULT, KATEGORI, ambil, adalahUuid, halaman, kirim,
  esc, ringkas, teksHarga, rentangHarga, adaVarian, totalStok, rupiah,
} from './_seo.js';

export default async function handler(req, res) {
  const id = String(req.query.id || '');
  const kanonik = `${BASE_URL}/produk/${encodeURIComponent(id)}`;

  const rows = adalahUuid(id)
    ? await ambil(
        `produk?id=eq.${id}&status=eq.AKTIF` +
          '&select=id,nama_produk,deskripsi,harga,stok,varian,foto_url,kategori,toko_id,toko(id,nama_toko,alamat,status,terverifikasi)',
      )
    : [];
  const p = rows[0];

  // Halaman yang tidak ada harus benar-benar 404 agar tidak diindeks (soft 404)
  if (!p || p.toko?.status !== 'AKTIF') {
    return kirim(
      res,
      404,
      halaman({
        judul: 'Produk tidak ditemukan — ItahBangkuang',
        deskripsi: 'Produk ini sudah tidak tersedia di ItahBangkuang.',
        kanonik,
        noindex: true,
        isi: '<h1>Produk tidak ditemukan</h1><p><a href="/produk">Lihat semua produk</a></p>',
      }),
    );
  }

  const stok = totalStok(p);
  const { min, maks } = rentangHarga(p);
  const kategoriLabel = KATEGORI[p.kategori] || '';
  const judul = `${p.nama_produk} — ${p.toko.nama_toko} | ItahBangkuang`;
  const deskripsi = ringkas(
    `${p.nama_produk} dari ${p.toko.nama_toko}, ${teksHarga(p)}. ${p.deskripsi || ''} Pesan lewat WhatsApp di ItahBangkuang.`,
  );

  const ketersediaan = stok > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
  const penjual = { '@type': 'Organization', name: p.toko.nama_toko, url: `${BASE_URL}/toko/${p.toko.id}` };
  const penawaran =
    adaVarian(p) && min !== maks
      ? {
          '@type': 'AggregateOffer',
          priceCurrency: 'IDR',
          lowPrice: min,
          highPrice: maks,
          offerCount: p.varian.length,
          availability: ketersediaan,
          seller: penjual,
        }
      : {
          '@type': 'Offer',
          priceCurrency: 'IDR',
          price: min,
          availability: ketersediaan,
          url: kanonik,
          seller: penjual,
        };

  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.nama_produk,
      description: p.deskripsi || `${p.nama_produk} dari ${p.toko.nama_toko}`,
      image: p.foto_url ? [p.foto_url] : undefined,
      category: kategoriLabel || undefined,
      url: kanonik,
      offers: penawaran,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Beranda', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Produk', item: `${BASE_URL}/produk` },
        { '@type': 'ListItem', position: 3, name: p.nama_produk, item: kanonik },
      ],
    },
  ];

  const lain = await ambil(
    `produk?toko_id=eq.${p.toko_id}&status=eq.AKTIF&id=neq.${p.id}&select=id,nama_produk,harga,varian&limit=8`,
  );

  const isi = `
<nav aria-label="Lokasi"><a href="${BASE_URL}/">Beranda</a> › <a href="${BASE_URL}/produk">Produk</a> › ${esc(p.nama_produk)}</nav>
<article>
  <h1>${esc(p.nama_produk)}</h1>
  ${p.foto_url ? `<img src="${esc(p.foto_url)}" alt="${esc(p.nama_produk)}" width="600" height="600">` : ''}
  <p><strong>${esc(teksHarga(p))}</strong> · ${stok > 0 ? `Stok tersedia (${stok})` : 'Stok habis'}</p>
  ${kategoriLabel ? `<p>Kategori: <a href="${BASE_URL}/produk?kategori=${esc(p.kategori)}">${esc(kategoriLabel)}</a></p>` : ''}
  <p>Dijual oleh <a href="${BASE_URL}/toko/${esc(p.toko.id)}">${esc(p.toko.nama_toko)}</a>${p.toko.alamat ? `, ${esc(p.toko.alamat)}` : ''}${p.toko.terverifikasi ? ' (toko terverifikasi)' : ''}.</p>
  ${adaVarian(p) ? `<h2>Varian</h2><ul>${p.varian.map((v) => `<li>${esc(v.nama)} — ${rupiah(v.harga)}${Number(v.stok) > 0 ? '' : ' (habis)'}</li>`).join('')}</ul>` : ''}
  ${p.deskripsi ? `<h2>Tentang produk</h2><p>${esc(p.deskripsi)}</p>` : ''}
  <h2>Cara memesan</h2>
  <p>Pilih produk, isi pesanan, lalu selesaikan transaksi dengan penjual melalui WhatsApp. Pembayaran COD atau transfer.</p>
</article>
${lain.length ? `<section><h2>Produk lain dari ${esc(p.toko.nama_toko)}</h2><ul>${lain.map((x) => `<li><a href="${BASE_URL}/produk/${esc(x.id)}">${esc(x.nama_produk)}</a></li>`).join('')}</ul></section>` : ''}`;

  kirim(
    res,
    200,
    halaman({
      judul,
      deskripsi,
      kanonik,
      gambar: p.foto_url || GAMBAR_DEFAULT,
      tipe: 'product',
      jsonld,
      isi,
    }),
  );
}
