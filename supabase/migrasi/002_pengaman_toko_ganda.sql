-- ============================================================================
-- 002 — Pengaman toko ganda dan pesanan ke toko sendiri
-- Jalankan sekali di Supabase → SQL Editor. Aman dijalankan ulang.
--
-- SEBELUM menjalankan, cek apakah data lama sudah bentrok (hasilnya harus kosong):
--
--   -- a. akun dengan lebih dari satu toko
--   select user_id, count(*) from public.toko group by user_id having count(*) > 1;
--
--   -- b. nomor WhatsApp yang dipakai lebih dari satu toko aktif/menunggu
--   select nomor_wa, count(*) from public.toko
--   where status in ('PENDING','AKTIF') group by nomor_wa having count(*) > 1;
--
-- Jika ada hasil, rapikan dulu (blokir/ubah salah satunya), baru jalankan file ini.
-- ============================================================================

-- 1. Satu akun hanya boleh punya satu toko
create unique index if not exists toko_user_id_unik
  on public.toko (user_id);

-- 2. Satu nomor WhatsApp hanya boleh dipakai satu toko yang aktif/menunggu.
--    (Toko yang ditolak atau diblokir tidak menghalangi nomor dipakai lagi.)
create unique index if not exists toko_nomor_wa_aktif_unik
  on public.toko (nomor_wa)
  where status in ('PENDING', 'AKTIF');

-- 3. Pembeli tidak boleh memesan dari tokonya sendiri.
--    Ditolak jika: pembeli adalah pemilik toko, nomor WA pembeli sama dengan
--    nomor WA toko, atau pembeli memiliki toko lain dengan nomor WA yang sama
--    dengan nomor yang ia pakai sebagai pembeli.
create or replace function public.cegah_pesan_toko_sendiri()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  wa_toko text;
  pemilik uuid;
  wa_pembeli text;
begin
  select t.nomor_wa, t.user_id into wa_toko, pemilik
  from public.toko t where t.id = new.toko_id;

  -- samakan format: hanya angka, tanpa awalan 0 atau 62
  wa_pembeli := regexp_replace(coalesce(new.nomor_wa_pembeli, ''), '\D', '', 'g');
  wa_pembeli := regexp_replace(wa_pembeli, '^(62|0)', '');

  if pemilik is not null and pemilik = new.pembeli_id then
    raise exception 'pesan_ke_toko_sendiri';
  end if;

  if wa_toko is not null and wa_pembeli <> '' and wa_toko = wa_pembeli then
    raise exception 'pesan_ke_toko_sendiri';
  end if;

  if wa_pembeli <> '' and exists (
    select 1 from public.toko t2
    where t2.user_id = new.pembeli_id and t2.nomor_wa = wa_pembeli
  ) then
    raise exception 'pesan_ke_toko_sendiri';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_cegah_pesan_toko_sendiri on public.orders;
create trigger trg_cegah_pesan_toko_sendiri
  before insert on public.orders
  for each row execute function public.cegah_pesan_toko_sendiri();

-- ----------------------------------------------------------------------------
-- Membatalkan:
--   drop index if exists public.toko_user_id_unik;
--   drop index if exists public.toko_nomor_wa_aktif_unik;
--   drop trigger if exists trg_cegah_pesan_toko_sendiri on public.orders;
-- ----------------------------------------------------------------------------
