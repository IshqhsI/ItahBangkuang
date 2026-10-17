// ============================================================
// Utility functions — import dari sini, jangan copy-paste lagi
// ============================================================

export const formatRupiah = (angka) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka ?? 0)

export const formatTanggal = (iso) =>
  new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

export const badgeOrderClass = (status) => ({
  'badge-menunggu':   status === 'MENUNGGU',
  'badge-konfirmasi': status === 'DIKONFIRMASI',
  'badge-selesai':    status === 'SELESAI',
  'badge-batal':      status === 'DIBATALKAN',
})

// ---------- Produk & varian ----------

export const punyaVarian = (p) => Array.isArray(p?.varian) && p.varian.length > 0

// Total stok: jumlah stok semua varian, atau kolom stok biasa
export const totalStok = (p) =>
  punyaVarian(p)
    ? p.varian.reduce((sum, v) => sum + (Number(v.stok) || 0), 0)
    : Number(p?.stok) || 0

// Harga tunggal, atau rentang min–max kalau produk punya varian
export const formatHargaProduk = (p) => {
  if (!punyaVarian(p)) return formatRupiah(p?.harga)
  const hargaList = p.varian.map((v) => Number(v.harga)).filter((h) => h > 0)
  if (!hargaList.length) return formatRupiah(p.harga)
  const min = Math.min(...hargaList)
  const max = Math.max(...hargaList)
  return min === max ? formatRupiah(min) : `${formatRupiah(min)} – ${formatRupiah(max)}`
}

// ---------- WhatsApp ----------

// Normalisasi nomor WA ke format internasional tanpa '+': 08xx / 628xx / +62 8xx → 628xx
export const nomorWa = (nomor) => {
  const angka = String(nomor ?? '').replace(/\D/g, '').replace(/^(62|0)/, '')
  return angka ? `62${angka}` : ''
}

// Tautan wa.me lengkap dengan pesan
export const tautanWa = (nomor, pesan = '') => {
  const n = nomorWa(nomor)
  const teks = pesan ? `?text=${encodeURIComponent(pesan)}` : ''
  return `https://wa.me/${n}${teks}`
}

// ---------- Navigasi ----------

// Hanya izinkan redirect ke path internal (cegah open redirect ke situs lain)
export const tujuanAman = (tujuan) =>
  typeof tujuan === 'string' && tujuan.startsWith('/') && !tujuan.startsWith('//')
    ? tujuan
    : null

/**
 * Menyusun ulang daftar produk (yang sudah terurut) supaya beragam:
 * produk dari toko atau kategori yang sama tidak menumpuk berdekatan.
 * Urutan asal tetap dihormati selama tidak melanggar keberagaman.
 * @param {Array} daftar produk dengan `toko_id` dan `kategori`
 * @param {number} jendela jumlah produk terakhir yang dibandingkan
 */
export const beragamkan = (daftar, jendela = 4) => {
  const sisa = [...daftar]
  const hasil = []
  while (sisa.length) {
    const terakhir = hasil.slice(-jendela)
    let i = sisa.findIndex(
      (p) => !terakhir.some((t) => t.toko_id === p.toko_id || t.kategori === p.kategori),
    )
    if (i === -1) i = sisa.findIndex((p) => !terakhir.some((t) => t.toko_id === p.toko_id))
    if (i === -1) i = 0
    hasil.push(sisa.splice(i, 1)[0])
  }
  return hasil
}
