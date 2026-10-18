import { supabase } from '@/lib/supabase';

export const PER_HALAMAN = 24;

// Hasil RPC dibuat menyerupai bentuk produk + toko yang dipakai KartuProduk
const petakan = (b) => ({
  ...b,
  toko: {
    nama_toko: b.nama_toko,
    alamat: b.alamat_toko,
    terverifikasi: b.toko_terverifikasi,
    status: 'AKTIF',
  },
});

/**
 * Cadangan bila fungsi database (supabase/migrasi/004) belum dijalankan:
 * tanpa pencarian lanjutan, urutan terbaru saja, tetapi halaman tidak kosong.
 */
async function cadangan({ cari, kategori, halaman }) {
  let q = supabase
    .from('produk')
    .select('*, toko(nama_toko, alamat, status)', { count: 'exact' })
    .eq('status', 'AKTIF')
    .order('created_at', { ascending: false })
    .range((halaman - 1) * PER_HALAMAN, halaman * PER_HALAMAN - 1);
  if (kategori) q = q.eq('kategori', kategori);
  if (cari.trim()) q = q.ilike('nama_produk', `%${cari.trim()}%`);
  const { data, count, error } = await q;
  if (error) return { total: 0, baris: [], gagal: true, sumber: 'cadangan' };
  const baris = (data ?? []).filter((p) => p.toko?.status === 'AKTIF');
  return { total: count ?? baris.length, baris, gagal: false, sumber: 'cadangan' };
}

/** Satu halaman katalog dari database: cari, saring, urut, halaman. */
export async function cariKatalog({
  cari = '',
  kategori = null,
  sembunyikanHabis = true,
  urut = 'beragam',
  halaman = 1,
} = {}) {
  const { data, error } = await supabase.rpc('katalog_cari', {
    p_cari: cari,
    p_kategori: kategori,
    p_sembunyi_habis: sembunyikanHabis,
    p_urut: urut,
    p_limit: PER_HALAMAN,
    p_offset: (halaman - 1) * PER_HALAMAN,
  });
  if (error || !data) return cadangan({ cari, kategori, halaman });
  return {
    total: Number(data.total) || 0,
    baris: (data.baris ?? []).map(petakan),
    gagal: false,
    sumber: 'rpc',
  };
}

/** Jumlah hasil per kategori (untuk angka di chip). null bila tidak tersedia. */
export async function hitungKatalog({ cari = '', sembunyikanHabis = true } = {}) {
  const { data, error } = await supabase.rpc('katalog_hitung', {
    p_cari: cari,
    p_sembunyi_habis: sembunyikanHabis,
  });
  return error || !data ? null : data;
}
