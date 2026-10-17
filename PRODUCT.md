# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Pembeli — warga lokal, di HP.** Warga Kelurahan Bangkuang yang belanja lewat HP Android, sering masuk dari link yang dibagikan di WhatsApp. Sebagian sudah berumur atau baru kenal belanja online. Tugasnya: menemukan kue/makanan/jajanan tetangga, memesan, lalu koordinasi lewat WA.
- **Penjual — ibu rumah tangga & UMKM rumahan.** Mengelola produk (termasuk varian harga/stok) dan order masuk dari HP, dengan waktu terbatas di sela produksi.
- **Admin — pengelola kelurahan/platform.** Memverifikasi toko baru, memantau produk dan pengguna, biasanya dari laptop.

Ketiganya sama penting; desain tidak boleh mengorbankan satu peran demi yang lain.

## Product Purpose

Marketplace produk lokal satu kelurahan: pembeli menemukan produk rumahan buatan tetangga, penjual membuka toko gratis dan menerima order tanpa perantara. Sukses = warga benar-benar memesan, dan penjual bisa mengurus tokonya sendiri tanpa bantuan.

## Positioning

Bukan marketplace nasional: cakupannya satu kelurahan (Bangkuang, Kalimantan Tengah). Penjual adalah tetangga, transaksi diselesaikan langsung lewat WhatsApp (COD atau transfer), dan toko diverifikasi admin setempat.

## Operating Context

- Alur pembeli: browse/kategori → detail produk (pilih varian) → form order (nama, WA, alamat, metode COD/transfer, catatan) → chat penjual via WA → riwayat pesanan.
- Alur penjual: daftar/buka toko → tunggu verifikasi (PENDING → AKTIF / DITOLAK / DIBLOKIR) → kelola produk & varian → kelola order (konfirmasi, selesai, batalkan) → profil toko dengan link shareable. Notifikasi WA otomatis via Fonnte saat order masuk.
- Alur admin: dashboard, kelola toko (approve/tolak), kelola produk, kelola user.
- Halaman pendukung: Tutorial, Feedback.

## Capabilities and Constraints

- Vue 3 + Vite + Vue Router + Pinia; backend Supabase (Auth, DB, Storage, RPC `handle_create_order_v2`). Deploy di Vercel.
- Styling CSS custom (global `src/style.css` + scoped per halaman); belum ada library komponen.
- Bahasa antarmuka: Bahasa Indonesia yang umum.
- Kategori produk didefinisikan di `src/lib/kategori.js`.

## Brand Commitments

- Nama: **ItahBangkuang** (juga ditulis itah-bangkuang di domain/meta).
- Tagline: **"Belanja dari tetangga, jualan untuk tetangga."** dan **"Dari warga, untuk warga"** (menggantikan tagline bahasa daerah atas permintaan pemilik).
- Warna, font, dan tampilan lain boleh diganti total (dikonfirmasi pengguna).

### Suara & bahasa (dikonfirmasi pengguna, direvisi)

- Gaya **profesional dan netral**: kalimat singkat, jelas, sopan, tanpa slang dan tanpa seruan. Contoh: "Cari produk", "Produk terbaru", "Toko di Bangkuang".
- Menyapa pengguna dengan **"Anda"** hanya bila perlu; sering kali cukup label atau kalimat perintah tanpa kata ganti. Jangan sok akrab, jangan lebay, tanpa tanda seru.
- Hindari kosakata warung yang terlalu gaya (etalase, dipajang, mampir, dagangan, tetangga). Gunakan: produk, toko, ditambahkan, warga.
- Tidak memakai bahasa daerah; gunakan bahasa Indonesia yang umum.
- Istilah baku di seluruh aplikasi: **produk**, **toko**, **pesanan** (bukan "order"), **pembeli**, **penjual**, **pesan** (kata kerja), **Masuk** / **Daftar** / **Keluar** (bukan Login/Logout), **WA** atau **WhatsApp**.
- Tombol menyebut hasilnya ("Kirim pesanan", "Simpan produk"), bukan "Submit"/"OK".
- Pesan error: apa yang gagal + apa yang bisa dilakukan. Tanpa emoji.

## Evidence on Hand

- Statistik nyata dari database: jumlah produk, toko aktif.
- Foto produk asli dari penjual (Supabase Storage).
- Tidak ada testimoni, angka penjualan, atau nama pelanggan yang terverifikasi — jangan dibuat-buat.
- Contoh produk di hero harus diambil dari produk asli di database, bukan data statis karangan.

## Product Principles

1. Tetangga dulu, platform belakangan: yang menonjol adalah produk dan penjualnya, bukan aplikasinya.
2. Bisa dipakai orang yang baru pertama belanja online: satu tugas per layar, label jelas, tanpa jargon.
3. HP adalah layar utama untuk pembeli dan penjual; laptop untuk admin.
4. WhatsApp adalah jalur transaksi; desain mengantar ke sana, bukan menggantikannya.
5. Jujur: stok, harga varian, dan status toko selalu ditampilkan apa adanya.

## Accessibility & Inclusion

Pengguna mencakup orang yang lebih tua dan HP Android kelas bawah dengan koneksi tidak stabil: teks cukup besar, target sentuh lega, kontras tinggi, halaman ringan.
