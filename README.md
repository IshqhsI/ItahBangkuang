# ItahBangkuang 🛒

Platform jual beli produk lokal tingkat kecamatan. Pembeli bisa menemukan produk UMKM di sekitar mereka, penjual bisa membuka toko dan menerima order langsung via WhatsApp.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Vue 3 + Vite |
| Routing | Vue Router 4 |
| State | Pinia |
| Backend | Supabase (Auth, Database, Storage, Edge Functions) |
| Notifikasi WA | Fonnte API |
| Styling | CSS custom (Plus Jakarta Sans + Lora) |

---

## Fitur

### Publik (tanpa login)
- Lihat semua produk yang tersedia
- Browse produk berdasarkan kategori
- Lihat detail produk dan profil toko
- Register sebagai pembeli atau penjual

### Pembeli
- Order produk langsung dari halaman detail
- Riwayat pesanan dengan filter status
- Chat penjual langsung via WhatsApp
- Upgrade akun menjadi penjual kapan saja

### Penjual
- Dashboard statistik (produk, order, pendapatan)
- Kelola produk (tambah, edit, sembunyikan, hapus)
- Kelola order masuk (konfirmasi, selesai, batalkan)
- Profil toko dengan foto dan link shareable
- Notifikasi WhatsApp otomatis saat order masuk
- Status toko: PENDING → AKTIF → (DITOLAK / DIBLOKIR)

### Admin
- Dashboard overview platform
- Approve / tolak pendaftaran toko baru

---

## Struktur Proyek

```
src/
├── assets/              # Gambar & ikon statis
├── layouts/
│   ├── LayoutPublic.vue     # Navbar untuk halaman publik
│   ├── LayoutPenjual.vue    # Navbar untuk halaman penjual
│   └── LayoutAdmin.vue      # Navbar untuk halaman admin
├── lib/
│   ├── supabase.js          # Inisialisasi Supabase client
│   └── utils.js             # formatRupiah, formatTanggal, badgeOrderClass
├── pages/
│   ├── auth/
│   │   ├── Login.vue
│   │   └── Register.vue
│   ├── admin/
│   │   └── Dashboard.vue
│   ├── pembeli/
│   │   ├── FormOrder.vue
│   │   ├── RiwayatOrder.vue
│   │   └── BukaToko.vue
│   ├── penjual/
│   │   ├── Dashboard.vue
│   │   ├── KelolaProduk.vue
│   │   ├── FormProduk.vue
│   │   ├── KelolaOrder.vue
│   │   └── ProfilToko.vue
│   └── public/
│       ├── Beranda.vue
│       ├── BrowseProduk.vue
│       ├── DetailProduk.vue
│       └── ProfilToko.vue
├── router/
│   └── index.js             # Route + navigation guard
├── stores/
│   └── auth.js              # Pinia auth store (user, role, logout)
├── App.vue
├── main.js
└── style.css                # Global styles, fonts, navbar, badge, spinner

supabase/
└── functions/
    └── notify-order/
        └── index.ts         # Edge Function notif WA ke penjual
```

---

## Database

### Tabel utama

**profiles** — dibuat otomatis saat user register via Supabase trigger
```
id          uuid (FK → auth.users)
nama_lengkap text
role        text  — 'pembeli' | 'penjual' | 'admin'
no_wa       text
alamat      text
```

**toko**
```
id          uuid
user_id     uuid (FK → profiles)
nama_toko   text
nomor_wa    text
alamat      text
deskripsi   text
foto_toko   text
status      text  — 'PENDING' | 'AKTIF' | 'DITOLAK' | 'DIBLOKIR'
alasan_tolak text
```

**produk**
```
id          uuid
toko_id     uuid (FK → toko)
nama_produk text
kategori    text  — 'kue_basah' | 'kue_kering' | 'makanan' | 'minuman'
deskripsi   text
harga       decimal
stok        int
foto_url    text
status      text  — 'AKTIF' | 'HABIS' | 'DISEMBUNYIKAN'
```

**orders**
```
id                uuid
produk_id         uuid (FK → produk)
toko_id           uuid (FK → toko)
pembeli_id        uuid (FK → profiles)
nama_pemesan      text
nomor_wa_pembeli  text
alamat            text
jumlah            int
total_harga       decimal
metode            text  — 'COD' | 'TRANSFER'
catatan           text
status            text  — 'MENUNGGU' | 'DIKONFIRMASI' | 'SELESAI' | 'DIBATALKAN'
```

### SQL Function

`handle_create_order` — menangani pembuatan order secara atomic:
- Cek stok tersedia
- Kurangi stok produk
- Hitung total harga di server (tidak percaya input client)
- Cegah penjual order produk sendiri
- Insert ke tabel orders
- `SECURITY DEFINER` + `SET search_path = public`

---

## Setup

### 1. Clone & install

```bash
git clone https://github.com/IshqhsI/ItahBangkuang.git
cd ItahBangkuang
npm install
```

### 2. Environment variables

Buat file `.env` di root:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 3. Setup database

Jalankan SQL berikut di Supabase SQL Editor:

**a. Trigger untuk isi profiles saat register:**
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, nama_lengkap, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'nama_lengkap',
    COALESCE(new.raw_user_meta_data->>'role', 'pembeli')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**b. SQL Function handle_create_order:**
```sql
CREATE OR REPLACE FUNCTION handle_create_order(
  p_produk_id UUID, p_pembeli_id UUID, p_nama_pemesan TEXT,
  p_nomor_wa_pembeli TEXT, p_alamat TEXT, p_jumlah INT,
  p_metode TEXT, p_catatan TEXT
) RETURNS VOID AS $$
DECLARE
  v_harga_produk DECIMAL;
  v_toko_id UUID;
  v_owner_id UUID;
BEGIN
  IF p_jumlah <= 0 OR p_jumlah > 100 THEN
    RAISE EXCEPTION 'Jumlah tidak valid (1–100)';
  END IF;

  UPDATE produk p SET stok = stok - p_jumlah
  FROM toko t
  WHERE p.id = p_produk_id AND p.toko_id = t.id
    AND p.status = 'AKTIF' AND t.status = 'AKTIF'
    AND p.stok >= p_jumlah
  RETURNING p.harga, p.toko_id, t.user_id
  INTO v_harga_produk, v_toko_id, v_owner_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Produk tidak tersedia atau stok tidak cukup';
  END IF;

  IF v_owner_id = p_pembeli_id THEN
    RAISE EXCEPTION 'Penjual tidak dapat memesan produk sendiri';
  END IF;

  INSERT INTO orders (
    produk_id, toko_id, pembeli_id, nama_pemesan,
    nomor_wa_pembeli, alamat, jumlah, total_harga,
    metode, catatan, status
  ) VALUES (
    p_produk_id, v_toko_id, p_pembeli_id, p_nama_pemesan,
    p_nomor_wa_pembeli, p_alamat, p_jumlah,
    v_harga_produk * p_jumlah,
    p_metode, p_catatan, 'MENUNGGU'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION handle_create_order(
  UUID, UUID, TEXT, TEXT, TEXT, INT, TEXT, TEXT
) TO authenticated;
```

**c. Storage bucket:**

Buat bucket bernama `foto-produk` dengan visibility **Public**.

### 4. Setup notifikasi WhatsApp (opsional)

**a. Daftar di [Fonnte](https://fonnte.com)** dan dapatkan token.

**b. Deploy Edge Function:**
```bash
npx supabase functions deploy notify-order
```

**c. Set environment variables di Supabase Dashboard → Settings → Edge Functions:**
```
FONNTE_TOKEN   = token dari Fonnte
APP_URL        = https://domain-kamu.vercel.app
```

**d. Buat Database Webhook di Supabase Dashboard → Database → Webhooks:**
```
Name        : notify-order
Table       : orders
Events      : INSERT
Webhook URL : https://[project-ref].supabase.co/functions/v1/notify-order
Headers     : Authorization: Bearer [SUPABASE_ANON_KEY]
```

### 5. Jalankan lokal

```bash
npm run dev
```

---

## Deployment

### Vercel

```bash
npm run build
# Deploy folder dist ke Vercel
# Tambahkan environment variables VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY
```

Atau hubungkan repo GitHub ke Vercel dan deploy otomatis setiap push ke branch `master`.

---

## Role & Akses

| Role | Akses |
|---|---|
| **Guest** | Beranda, browse produk, detail produk, profil toko, login, register |
| **Pembeli** | Semua guest + form order, riwayat order, upgrade ke penjual |
| **Penjual** | Dashboard toko, kelola produk, kelola order, profil toko (setelah diverifikasi admin) |
| **Admin** | Dashboard admin, approve/tolak toko |

---

## Catatan Pengembangan

- Semua fungsi utility ada di `src/lib/utils.js` — import dari sana, jangan copy-paste
- Auth state dikelola global via `src/stores/auth.js` (Pinia) — tidak perlu fetch ulang di setiap halaman
- Order dibuat via RPC `handle_create_order` — tidak via insert langsung dari frontend

---

## Lisensi

Private — Hak cipta © 2026 ItahBangkuang
