-- ============================================================================
-- 005 — Alamat ramah (slug) untuk produk dan toko
--   /produk/nastar-jeje-cake-cookies   (bukan /produk/<uuid>)
--   /toko/jeje-cake-cookies            (bukan /toko/<uuid>)
--
-- Jalankan di Supabase → SQL Editor, SETELAH 004 dan SEBELUM merilis kode aplikasinya.
-- Aman dijalankan ulang. Alamat lama (UUID) tetap berfungsi: aplikasi mengalihkannya.
--
-- Aturan: slug dibuat SEKALI saat baris dibuat dan tidak berubah ketika nama diganti,
-- agar tautan yang sudah dibagikan tidak rusak.
-- ============================================================================

-- 1. Kolom slug
alter table public.toko   add column if not exists slug text;
alter table public.produk add column if not exists slug text;

-- 2. Mengubah teks jadi slug: huruf kecil, hanya a-z 0-9, pemisah tanda hubung
create or replace function public.buat_slug(teks text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(teks, '')), '[^a-z0-9]+', '-', 'g'));
$$;

-- 3. Membuat slug unik di tabel tertentu: tambah -2, -3, ... bila bentrok
create or replace function public.slug_unik(p_tabel text, p_dasar text, p_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  calon text := p_dasar;
  n integer := 1;
  ada boolean;
begin
  if p_tabel not in ('toko', 'produk') then
    raise exception 'tabel tidak didukung';
  end if;
  loop
    execute format(
      'select exists (select 1 from public.%I where slug = $1 and id is distinct from $2)', p_tabel
    ) into ada using calon, p_id;
    exit when not ada;
    n := n + 1;
    calon := p_dasar || '-' || n;
  end loop;
  return calon;
end;
$$;

-- 4. Dasar slug toko dan produk
create or replace function public.dasar_slug_toko(p_nama text)
returns text
language plpgsql
immutable
as $$
declare
  d text := left(public.buat_slug(p_nama), 60);
begin
  if d = '' then d := 'toko'; end if;
  -- hindari bentrok dengan halaman penjual: /toko/dashboard, /toko/produk, ...
  if d in ('dashboard', 'produk', 'order', 'profil', 'tambah', 'api', 'admin') then
    d := d || '-toko';
  end if;
  return d;
end;
$$;

create or replace function public.dasar_slug_produk(p_nama text, p_nama_toko text)
returns text
language plpgsql
immutable
as $$
declare
  d text := left(
    trim(both '-' from public.buat_slug(p_nama) || '-' || public.buat_slug(p_nama_toko)),
    80
  );
begin
  d := trim(both '-' from d);
  if d = '' then d := 'produk'; end if;
  return d;
end;
$$;

-- 5. Isi slug untuk data yang sudah ada (yang paling lama mendapat alamat terpendek)
do $$
declare
  r record;
begin
  for r in select id, nama_toko from public.toko where slug is null order by created_at, id loop
    update public.toko
       set slug = public.slug_unik('toko', public.dasar_slug_toko(r.nama_toko), r.id)
     where id = r.id;
  end loop;

  for r in
    select p.id, p.nama_produk, t.nama_toko
    from public.produk p
    left join public.toko t on t.id = p.toko_id
    where p.slug is null
    order by p.created_at, p.id
  loop
    update public.produk
       set slug = public.slug_unik('produk', public.dasar_slug_produk(r.nama_produk, r.nama_toko), r.id)
     where id = r.id;
  end loop;
end;
$$;

-- 6. Indeks unik
create unique index if not exists toko_slug_unik   on public.toko (slug);
create unique index if not exists produk_slug_unik on public.produk (slug);

-- 7. Baris baru otomatis mendapat slug (tidak menimpa slug yang sudah ada)
create or replace function public.isi_slug_toko()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug := public.slug_unik('toko', public.dasar_slug_toko(new.nama_toko), new.id);
  end if;
  return new;
end;
$$;

create or replace function public.isi_slug_produk()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  nama_toko_ini text;
begin
  if new.slug is null or new.slug = '' then
    select nama_toko into nama_toko_ini from public.toko where id = new.toko_id;
    new.slug := public.slug_unik('produk', public.dasar_slug_produk(new.nama_produk, nama_toko_ini), new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_isi_slug_toko on public.toko;
create trigger trg_isi_slug_toko
  before insert on public.toko
  for each row execute function public.isi_slug_toko();

drop trigger if exists trg_isi_slug_produk on public.produk;
create trigger trg_isi_slug_produk
  before insert on public.produk
  for each row execute function public.isi_slug_produk();

-- 8. View katalog: tambahkan slug produk dan slug toko (kolom baru di AKHIR)
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
  t.slug as toko_slug
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
-- Membatalkan (kolom boleh dibiarkan; aplikasi jatuh kembali ke UUID bila slug kosong):
--   drop trigger if exists trg_isi_slug_toko on public.toko;
--   drop trigger if exists trg_isi_slug_produk on public.produk;
-- ----------------------------------------------------------------------------
