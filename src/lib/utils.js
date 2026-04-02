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
