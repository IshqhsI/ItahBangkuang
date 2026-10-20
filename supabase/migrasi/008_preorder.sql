-- ============================================================================
-- 008 — Produk pre-order (PO)
--
-- Jalankan di Supabase → SQL Editor, SEBELUM merilis kode aplikasinya.
-- Aman dijalankan ulang. Produk yang sudah ada tetap sebagai produk siap (bukan PO).
--
--   po           : true bila produk dibuat setelah dipesan
--   lama_proses  : perkiraan waktu pengerjaan, mis. "2 hari" atau "dibuat tiap Sabtu"
-- ============================================================================

alter table public.produk add column if not exists po boolean not null default false;
alter table public.produk add column if not exists lama_proses text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'produk_lama_proses_panjang') then
    alter table public.produk add constraint produk_lama_proses_panjang
      check (lama_proses is null or char_length(lama_proses) <= 60);
  end if;
end;
$$;

-- View katalog: kolom baru ditambahkan di AKHIR (syarat create or replace view)
create or replace view public.produk_katalog
with (security_invoker = true) as
select
  p.id,
  p.nama_produk,
  p.deskripsi,
  p.harga,
  p.stok,
  p.varian,
  p.foto_url,
  p.kategori::text as kategori,
  p.created_at,
  p.toko_id,
  t.nama_toko,
  t.alamat as alamat_toko,
  t.terverifikasi as toko_terverifikasi,
  h.harga_min,
  h.harga_maks,
  h.stok_total,
  lower(
    coalesce(p.nama_produk, '') || ' ' ||
    coalesce(p.deskripsi, '') || ' ' ||
    coalesce(t.nama_toko, '') || ' ' ||
    replace(coalesce(p.kategori::text, ''), '_', ' ')
  ) as cari_teks,
  p.slug as slug,
  t.slug as toko_slug,
  p.po as po,
  p.lama_proses as lama_proses
from public.produk p
join public.toko t on t.id = p.toko_id
cross join lateral (select to_jsonb(p.varian) as v) j
cross join lateral (
  select
    case when jsonb_typeof(j.v) = 'array' and jsonb_array_length(j.v) > 0
      then (select min(coalesce(nullif(e->>'harga', ''), '0')::numeric) from jsonb_array_elements(j.v) e)
      else p.harga::numeric end as harga_min,
    case when jsonb_typeof(j.v) = 'array' and jsonb_array_length(j.v) > 0
      then (select max(coalesce(nullif(e->>'harga', ''), '0')::numeric) from jsonb_array_elements(j.v) e)
      else p.harga::numeric end as harga_maks,
    case when jsonb_typeof(j.v) = 'array' and jsonb_array_length(j.v) > 0
      then (select coalesce(sum(coalesce(nullif(e->>'stok', ''), '0')::numeric), 0) from jsonb_array_elements(j.v) e)
      else coalesce(p.stok::numeric, 0) end as stok_total
) h
where p.status = 'AKTIF' and t.status = 'AKTIF';

grant select on public.produk_katalog to anon, authenticated;

-- Membatalkan:
--   (kembalikan view dari 005) lalu
--   alter table public.produk drop column if exists po, drop column if exists lama_proses;
