-- ============================================================================
-- 001 — Toko langsung aktif, verifikasi admin menyusul
-- Jalankan sekali di Supabase → SQL Editor, SEBELUM merilis kode aplikasinya.
-- Aman dijalankan ulang (memakai IF NOT EXISTS / CREATE OR REPLACE / DROP IF EXISTS).
-- ============================================================================

-- 1. Kolom lencana verifikasi
alter table public.toko
  add column if not exists terverifikasi boolean not null default false;

-- 2. Toko yang sudah aktif sebelumnya sudah pernah diperiksa admin
update public.toko set terverifikasi = true where status = 'AKTIF';

-- 3. Toko baru: klien tetap menyimpan status 'PENDING' (sesuai aturan RLS yang ada),
--    lalu trigger ini langsung mengaktifkannya. SECURITY DEFINER agar tidak
--    bergantung pada kebijakan UPDATE milik penjual.
create or replace function public.toko_langsung_aktif()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'PENDING' then
    update public.toko set status = 'AKTIF' where id = new.id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_toko_langsung_aktif on public.toko;
create trigger trg_toko_langsung_aktif
  after insert on public.toko
  for each row execute function public.toko_langsung_aktif();

-- 4. Lencana "terverifikasi" hanya boleh diubah admin (atau SQL Editor / service role).
create or replace function public.jaga_terverifikasi()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  adalah_admin boolean;
begin
  if auth.uid() is null then
    return new; -- SQL Editor atau service role
  end if;

  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ) into adalah_admin;

  if tg_op = 'INSERT' then
    if not adalah_admin then new.terverifikasi := false; end if;
  elsif new.terverifikasi is distinct from old.terverifikasi and not adalah_admin then
    new.terverifikasi := old.terverifikasi;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_jaga_terverifikasi on public.toko;
create trigger trg_jaga_terverifikasi
  before insert or update on public.toko
  for each row execute function public.jaga_terverifikasi();

-- 5. Toko yang belum terverifikasi dibatasi 5 produk
create or replace function public.batasi_produk_toko_baru()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  sudah_verifikasi boolean;
  jumlah integer;
begin
  select terverifikasi into sudah_verifikasi from public.toko where id = new.toko_id;
  if coalesce(sudah_verifikasi, false) = false then
    select count(*) into jumlah from public.produk where toko_id = new.toko_id;
    if jumlah >= 5 then
      raise exception 'batas_produk_belum_verifikasi';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_batasi_produk_toko_baru on public.produk;
create trigger trg_batasi_produk_toko_baru
  before insert on public.produk
  for each row execute function public.batasi_produk_toko_baru();

-- 6. (Opsional) Toko yang masih berstatus PENDING dari masa lalu: aktifkan juga.
--    Hapus tanda komentar jika ingin dijalankan.
-- update public.toko set status = 'AKTIF' where status = 'PENDING';

-- ----------------------------------------------------------------------------
-- Membatalkan semua ini:
--   drop trigger if exists trg_toko_langsung_aktif on public.toko;
--   drop trigger if exists trg_jaga_terverifikasi on public.toko;
--   drop trigger if exists trg_batasi_produk_toko_baru on public.produk;
--   (kolom terverifikasi boleh dibiarkan)
-- ----------------------------------------------------------------------------
