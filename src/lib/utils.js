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
