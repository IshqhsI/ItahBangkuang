-- ============================================================================
-- 006 — Cara layanan toko: pesan online, antar, ambil di tempat, jam buka, peta
--
-- Jalankan di Supabase → SQL Editor, SEBELUM merilis kode aplikasinya.
-- Aman dijalankan ulang. Toko yang sudah ada tetap seperti sekarang:
-- terima pesanan online dan bisa diantar.
-- ============================================================================

alter table public.toko add column if not exists layanan_pesan boolean not null default true;
alter table public.toko add column if not exists layanan_antar boolean not null default true;
alter table public.toko add column if not exists layanan_ambil boolean not null default false;
alter table public.toko add column if not exists jam_buka text;
alter table public.toko add column if not exists tautan_peta text;

-- Batasan isi: panjang jam buka, dan tautan peta harus berupa alamat http(s)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'toko_jam_buka_panjang') then
    alter table public.toko add constraint toko_jam_buka_panjang
      check (jam_buka is null or char_length(jam_buka) <= 120);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'toko_tautan_peta_valid') then
    alter table public.toko add constraint toko_tautan_peta_valid
      check (tautan_peta is null or (char_length(tautan_peta) <= 300 and tautan_peta ~* '^https?://'));
  end if;
  -- minimal satu cara menerima barang: diantar atau diambil
  if not exists (select 1 from pg_constraint where conname = 'toko_minimal_satu_cara') then
    alter table public.toko add constraint toko_minimal_satu_cara
      check (layanan_antar or layanan_ambil);
  end if;
end;
$$;

-- Toko yang tidak menerima pesanan online tidak boleh menerima pesanan lewat API sekalipun.
create or replace function public.cegah_pesan_toko_etalase()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  menerima boolean;
begin
  select layanan_pesan into menerima from public.toko where id = new.toko_id;
  if coalesce(menerima, true) = false then
    raise exception 'toko_tidak_menerima_pesanan';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_cegah_pesan_toko_etalase on public.orders;
create trigger trg_cegah_pesan_toko_etalase
  before insert on public.orders
  for each row execute function public.cegah_pesan_toko_etalase();

-- ----------------------------------------------------------------------------
-- Membatalkan:
--   drop trigger if exists trg_cegah_pesan_toko_etalase on public.orders;
--   (kolom boleh dibiarkan; aplikasi menganggap kolom kosong sebagai "terima pesanan")
-- ----------------------------------------------------------------------------
