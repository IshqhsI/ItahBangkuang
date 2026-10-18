-- ============================================================================
-- 003 — Indeks untuk kueri yang paling sering dijalankan aplikasi
-- Jalankan di Supabase → SQL Editor. Aman dijalankan ulang (IF NOT EXISTS).
--
-- LANGKAH 1 (cek dulu): lihat indeks yang SUDAH ada, supaya tidak dobel.
--
--   select tablename, indexname, indexdef
--   from pg_indexes
--   where schemaname = 'public' and tablename in ('produk','toko','orders','feedback')
--   order by tablename, indexname;
--
-- Bila sudah ada indeks yang mencakup kolom yang sama (nama berbeda pun),
-- lewati (beri tanda komentar) baris CREATE INDEX yang bersangkutan.
--
-- LANGKAH 2: jalankan bagian di bawah ini. Tabel kecil tidak terasa bedanya,
-- tetapi kueri tetap cepat ketika produk, toko, dan pesanan sudah ribuan.
-- ============================================================================

-- Katalog dan Beranda: produk aktif, terbaru dulu
create index if not exists produk_aktif_terbaru
  on public.produk (created_at desc)
  where status = 'AKTIF';

-- Halaman kategori dan filter kategori
create index if not exists produk_aktif_kategori
  on public.produk (kategori, created_at desc)
  where status = 'AKTIF';

-- Produk per toko (halaman toko, "Produk lain dari toko ini", batas produk)
create index if not exists produk_per_toko
  on public.produk (toko_id);

-- Daftar toko aktif, dan antrean verifikasi
create index if not exists toko_per_status
  on public.toko (status, created_at desc);

-- Pesanan penjual (Kelola Pesanan) dan pembeli (Riwayat)
create index if not exists orders_per_toko
  on public.orders (toko_id, created_at desc);

create index if not exists orders_per_pembeli
  on public.orders (pembeli_id, created_at desc);

-- Saran dan keluhan yang belum dibaca (dasbor admin)
create index if not exists feedback_per_status
  on public.feedback (status, created_at desc);

-- Perbarui statistik agar perencana kueri langsung memakai indeks baru
analyze public.produk;
analyze public.toko;
analyze public.orders;

-- ----------------------------------------------------------------------------
-- Membatalkan:
--   drop index if exists public.produk_aktif_terbaru, public.produk_aktif_kategori,
--     public.produk_per_toko, public.toko_per_status, public.orders_per_toko,
--     public.orders_per_pembeli, public.feedback_per_status;
-- ----------------------------------------------------------------------------
