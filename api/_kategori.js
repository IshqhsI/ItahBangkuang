// Sumber tunggal teks kategori dan lokasi untuk SEO.
// Dipakai oleh fungsi server (api/*) dan aplikasi (src/pages/public/Kategori.vue).
// File ini tidak boleh mengimpor Vue atau pustaka browser.

export const LOKASI = 'Kelurahan Bangkuang, Kecamatan Karau Kuala, Kabupaten Barito Selatan';
export const LOKASI_PENDEK = 'Bangkuang, Barito Selatan';

export const KATEGORI_TEKS = {
  makanan_jajanan: {
    label: 'Makanan & Jajanan',
    intro:
      'Kue, makanan, dan jajanan rumahan buatan warga Bangkuang. Pilih produknya, lalu pesan langsung dari penjual lewat WhatsApp. Sebagian produk dibuat sesuai pesanan (PO), jadi tanyakan ketersediaan dan waktu pengerjaannya kepada penjual.',
    contoh: ['kue basah', 'kue kering', 'kue ulang tahun', 'brownies', 'nastar', 'jajanan rumahan'],
  },
  aneka_minuman: {
    label: 'Aneka Minuman',
    intro:
      'Aneka minuman olahan warga Bangkuang. Lihat pilihan yang tersedia, cek stok, lalu pesan dan atur pengantarannya langsung dengan penjual.',
    contoh: ['minuman kemasan', 'minuman tradisional', 'minuman segar'],
  },
  dapur_lauk: {
    label: 'Dapur & Lauk Pauk',
    intro:
      'Lauk pauk, bumbu, dan olahan dapur dari warga Bangkuang. Pesan langsung dari penjual dan tanyakan jadwal pengantarannya lewat WhatsApp.',
    contoh: ['lauk pauk', 'sambal', 'bumbu dapur', 'olahan rumahan'],
  },
  pakaian_jahitan: {
    label: 'Pakaian & Jahitan',
    intro:
      'Pakaian, kerajinan jahit, dan jasa menjahit dari warga Bangkuang. Hubungi penjual untuk menanyakan ukuran, bahan, dan lama pengerjaan.',
    contoh: ['pakaian', 'jasa jahit', 'permak', 'kerajinan jahit'],
  },
  jasa_tukang: {
    label: 'Jasa & Tukang',
    intro:
      'Jasa tukang dan layanan keterampilan dari warga Bangkuang. Hubungi penyedia jasa lewat WhatsApp untuk menanyakan jadwal dan biaya.',
    contoh: ['tukang bangunan', 'jasa perbaikan', 'layanan keterampilan'],
  },
  mesin_elektronik: {
    label: 'Mesin & Elektronik',
    intro:
      'Mesin, peralatan, dan barang elektronik yang dijual warga Bangkuang. Cek stok dan spesifikasi, lalu pesan dan atur pengantarannya dengan penjual.',
    contoh: ['mesin', 'peralatan', 'barang elektronik', 'aksesori komputer'],
  },
  lainnya: {
    label: 'Lainnya',
    intro:
      'Produk dan jasa lain dari warga Bangkuang yang tidak termasuk kategori lain. Pesan langsung dari penjual lewat WhatsApp.',
    contoh: ['produk lokal', 'barang lainnya'],
  },
};

// URL memakai tanda hubung (makanan-jajanan); data memakai garis bawah (makanan_jajanan)
export const slugUrl = (slug) => String(slug).replace(/_/g, '-');
export const slugDariUrl = (url) => String(url || '').replace(/-/g, '_');
