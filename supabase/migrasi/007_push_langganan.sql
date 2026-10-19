-- ============================================================================
-- 007 — Langganan notifikasi (Web Push) untuk penjual
--
-- Jalankan di Supabase → SQL Editor. Aman dijalankan ulang.
-- Tabel ini menyimpan "alamat" tempat browser penjual menerima notifikasi.
-- Isinya bukan rahasia pengguna, tetapi tetap hanya boleh dibaca pemiliknya.
-- ============================================================================

create table if not exists public.push_langganan (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists push_langganan_per_user on public.push_langganan (user_id);

alter table public.push_langganan enable row level security;

drop policy if exists "push_lihat_milik_sendiri" on public.push_langganan;
create policy "push_lihat_milik_sendiri" on public.push_langganan
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "push_tambah_milik_sendiri" on public.push_langganan;
create policy "push_tambah_milik_sendiri" on public.push_langganan
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "push_hapus_milik_sendiri" on public.push_langganan;
create policy "push_hapus_milik_sendiri" on public.push_langganan
  for delete to authenticated using (user_id = auth.uid());

-- Fungsi server memakai service role (melewati RLS) untuk membaca langganan penjual
-- dan menghapus langganan yang sudah tidak berlaku.

-- ----------------------------------------------------------------------------
-- LANGKAH TAMBAHAN (lewat dasbor, bukan SQL): Database Webhook untuk pesanan baru
--   Supabase → Database → Webhooks → Create a new hook
--     Name   : pesanan_baru_push
--     Table  : public.orders      Events: Insert
--     Type   : HTTP Request       Method: POST
--     URL    : https://www.itahbangkuang.my.id/api/push-pesanan
--     Headers: Authorization = Bearer <isi PUSH_WEBHOOK_SECRET yang sama dengan di Vercel>
--
-- Membatalkan:
--   drop table if exists public.push_langganan;
-- ----------------------------------------------------------------------------
