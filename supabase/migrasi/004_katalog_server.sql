-- ============================================================================
-- 004 — Katalog di sisi database: cari, saring, urut, dan halaman
-- Jalankan di Supabase → SQL Editor. Aman dijalankan ulang (CREATE OR REPLACE).
-- Jalankan SEBELUM merilis kode aplikasinya; kode punya cadangan sederhana bila
-- fungsi ini belum ada, tetapi pencarian dan halaman baru berfungsi penuh setelah ini.
--
-- Yang dibuat:
--   1. view  produk_katalog    : produk aktif dari toko aktif + harga/stok efektif + teks cari
--   2. fungsi katalog_cari()   : satu halaman hasil (+ total), urutan "beragam" dihitung di database
--   3. fungsi katalog_hitung() : jumlah hasil per kategori (untuk angka di chip)
--
-- Tidak mengubah tabel apa pun. Hak akses mengikuti pemanggil (security invoker),
-- sehingga aturan RLS yang sudah ada tetap berlaku.
-- ============================================================================

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
  ) as cari_teks
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

-- ----------------------------------------------------------------------------
-- katalog_cari: satu halaman hasil.
--   p_urut: 'beragam' | 'terbaru' | 'termurah' | 'termahal'
--   Hasil: { "total": 57, "baris": [ {...}, ... ] }
--   Produk yang masih ada stok selalu di depan. "beragam" menggilir toko:
--   produk teratas tiap toko dulu, lalu produk kedua tiap toko, dan seterusnya.
-- ----------------------------------------------------------------------------
create or replace function public.katalog_cari(
  p_cari text default '',
  p_kategori text default null,
  p_sembunyi_habis boolean default true,
  p_urut text default 'beragam',
  p_limit integer default 24,
  p_offset integer default 0
)
returns jsonb
language sql
stable
as $$
  with dasar as (
    select
      k.*,
      row_number() over (
        partition by k.toko_id
        order by (k.stok_total > 0) desc, k.created_at desc
      ) as urutan_toko
    from public.produk_katalog k
    where (p_kategori is null or p_kategori = '' or k.kategori = p_kategori)
      and (not p_sembunyi_habis or k.stok_total > 0)
      and not exists (
        select 1
        from unnest(string_to_array(lower(btrim(coalesce(p_cari, ''))), ' ')) as w
        where w <> ''
          and k.cari_teks not like '%' || replace(replace(replace(w, '\', '\\'), '%', '\%'), '_', '\_') || '%'
      )
  ),
  urut as (
    select
      d.*,
      row_number() over (
        order by
          (d.stok_total > 0) desc,
          case when p_urut = 'beragam' then d.urutan_toko end asc,
          case when p_urut = 'termurah' then d.harga_min end asc,
          case when p_urut = 'termahal' then d.harga_maks end desc,
          d.created_at desc
      ) as ord
    from dasar d
  )
  select jsonb_build_object(
    'total', (select count(*) from dasar),
    'baris', coalesce(
      (
        select jsonb_agg((to_jsonb(u) - 'cari_teks' - 'urutan_toko') order by u.ord)
        from urut u
        where u.ord > greatest(p_offset, 0)
          and u.ord <= greatest(p_offset, 0) + least(greatest(p_limit, 1), 100)
      ),
      '[]'::jsonb
    )
  );
$$;

-- ----------------------------------------------------------------------------
-- katalog_hitung: jumlah hasil per kategori (mengikuti kata kunci dan opsi sembunyi-habis).
--   Hasil: { "semua": 57, "makanan_jajanan": 30, ... }
-- ----------------------------------------------------------------------------
create or replace function public.katalog_hitung(
  p_cari text default '',
  p_sembunyi_habis boolean default true
)
returns jsonb
language sql
stable
as $$
  with d as (
    select k.kategori
    from public.produk_katalog k
    where (not p_sembunyi_habis or k.stok_total > 0)
      and not exists (
        select 1
        from unnest(string_to_array(lower(btrim(coalesce(p_cari, ''))), ' ')) as w
        where w <> ''
          and k.cari_teks not like '%' || replace(replace(replace(w, '\', '\\'), '%', '\%'), '_', '\_') || '%'
      )
  )
  select coalesce(
           (select jsonb_object_agg(g.kategori, g.n) from (select kategori, count(*) as n from d group by kategori) g),
           '{}'::jsonb
         ) || jsonb_build_object('semua', (select count(*) from d));
$$;

grant execute on function public.katalog_cari(text, text, boolean, text, integer, integer) to anon, authenticated;
grant execute on function public.katalog_hitung(text, boolean) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- Membatalkan:
--   drop function if exists public.katalog_cari(text, text, boolean, text, integer, integer);
--   drop function if exists public.katalog_hitung(text, boolean);
--   drop view if exists public.produk_katalog;
-- ----------------------------------------------------------------------------
