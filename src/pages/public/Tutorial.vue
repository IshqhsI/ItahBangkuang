<template>
  <LayoutPublic>
    <!-- HERO -->
    <div class="hero">
      <div class="container">
        <p class="hero-label">Panduan Lengkap</p>
        <h1 class="hero-title">Cara Pakai ItahBangkuang</h1>
        <p class="hero-sub">
          Mudah diikuti, langkah per langkah. Cocok untuk siapa saja.
        </p>

        <!-- Tab Switch -->
        <div class="tab-switch">
          <button
            class="tab-btn"
            :class="{ active: tab === 'pembeli' }"
            @click="tab = 'pembeli'"
          >
            🛒 Saya Mau Belanja
          </button>
          <button
            class="tab-btn"
            :class="{ active: tab === 'penjual' }"
            @click="tab = 'penjual'"
          >
            🍱 Saya Mau Jualan
          </button>
        </div>
      </div>
    </div>

    <!-- ===================== PEMBELI ===================== -->
    <div v-if="tab === 'pembeli'" class="content">
      <div class="container">
        <div class="intro-box">
          <span class="intro-icon">🛒</span>
          <div>
            <h2 class="intro-title">Panduan untuk Pembeli</h2>
            <p class="intro-desc">
              Ikuti langkah-langkah di bawah ini untuk mulai belanja produk
              lokal dari warga Bangkuang.
            </p>
          </div>
        </div>

        <!-- LANGKAH 1 -->
        <div class="step-card">
          <div class="step-header">
            <div class="step-num">1</div>
            <div>
              <h3 class="step-title">Buka ItahBangkuang di HP kamu</h3>
              <p class="step-sub">
                Tidak perlu install aplikasi. Cukup buka lewat browser.
              </p>
            </div>
          </div>
          <div class="step-body">
            <div class="tip-box tip-info">
              <span>💡</span>
              <p>
                Buka <strong>Google Chrome</strong> atau
                <strong>browser bawaan HP</strong> kamu, lalu ketik alamat
                website ini di bagian atas.
              </p>
            </div>
            <div class="step-visual">
              <div class="phone-mock">
                <div class="phone-bar">
                  <div class="phone-dot"></div>
                  <div class="phone-dot"></div>
                  <div class="phone-dot"></div>
                </div>
                <div class="phone-url">itahbangkuang.vercel.app</div>
                <div class="phone-screen">
                  <div class="mock-header">🛒 ItahBangkuang</div>
                  <div class="mock-hero-text">Bapapili mangat...</div>
                  <div class="mock-btn">Saya mau belanja →</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- LANGKAH 2 -->
        <div class="step-card">
          <div class="step-header">
            <div class="step-num">2</div>
            <div>
              <h3 class="step-title">Daftar akun (cukup sekali)</h3>
              <p class="step-sub">
                Kamu perlu daftar dulu agar bisa memesan produk.
              </p>
            </div>
          </div>
          <div class="step-body">
            <div class="mini-steps">
              <div class="mini-step">
                <span class="mini-num">a</span>
                <p>Klik tombol <strong>"Daftar"</strong> di pojok kanan atas</p>
              </div>
              <div class="mini-step">
                <span class="mini-num">b</span>
                <p>
                  Isi <strong>nama lengkap</strong>, <strong>email</strong>, dan
                  buat <strong>password</strong> (minimal 8 huruf/angka)
                </p>
              </div>
              <div class="mini-step">
                <span class="mini-num">c</span>
                <p>Pilih <strong>"Pembeli"</strong> sebagai peran kamu</p>
              </div>
              <div class="mini-step">
                <span class="mini-num">d</span>
                <p>Klik <strong>"Buat Akun"</strong> — selesai!</p>
              </div>
            </div>
            <div class="tip-box tip-warning">
              <span>⚠️</span>
              <p>
                Ingat email dan password kamu ya. Catat di tempat yang aman
                kalau perlu.
              </p>
            </div>
          </div>
        </div>

        <!-- LANGKAH 3 -->
        <div class="step-card">
          <div class="step-header">
            <div class="step-num">3</div>
            <div>
              <h3 class="step-title">Cari produk yang kamu mau</h3>
              <p class="step-sub">Ada banyak cara untuk menemukan produk.</p>
            </div>
          </div>
          <div class="step-body">
            <div class="cara-cari-grid">
              <div class="cara-cari-card">
                <span class="cara-icon">📂</span>
                <p class="cara-label">Pilih Kategori</p>
                <p class="cara-desc">
                  Klik sesuai kategori yang kamu mau: Makanan, Minuman dll.
                </p>
              </div>
              <div class="cara-cari-card">
                <span class="cara-icon">🔍</span>
                <p class="cara-label">Cari Langsung</p>
                <p class="cara-desc">
                  Ketik nama produk di kotak pencarian, contoh: "klepon"
                </p>
              </div>
              <div class="cara-cari-card">
                <span class="cara-icon">🏪</span>
                <p class="cara-label">Lihat Toko</p>
                <p class="cara-desc">
                  Klik nama toko untuk lihat semua produk dari toko itu
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- LANGKAH 4 -->
        <div class="step-card">
          <div class="step-header">
            <div class="step-num">4</div>
            <div>
              <h3 class="step-title">Lihat detail produk</h3>
              <p class="step-sub">
                Pastikan produk yang kamu pilih sesuai sebelum memesan.
              </p>
            </div>
          </div>
          <div class="step-body">
            <div class="checklist">
              <div class="check-item">
                <span class="check-icon">📸</span>
                <p>Lihat <strong>foto produk</strong> dengan jelas</p>
              </div>
              <div class="check-item">
                <span class="check-icon">💰</span>
                <p>
                  Cek <strong>harga</strong> dan <strong>stok tersedia</strong>
                </p>
              </div>
              <div class="check-item">
                <span class="check-icon">📝</span>
                <p>
                  Baca <strong>deskripsi produk</strong> — biasanya ada info
                  bahan, rasa, atau cara pemesanan
                </p>
              </div>
              <div class="check-item">
                <span class="check-icon">🏪</span>
                <p>
                  Cek <strong>info toko</strong> — nama, lokasi, dan nomor WA
                  penjual
                </p>
              </div>
            </div>
            <div class="tip-box tip-info">
              <span>💡</span>
              <p>
                Bisa juga klik <strong>"Chat via WhatsApp"</strong> untuk
                tanya-tanya ke penjual dulu sebelum pesan.
              </p>
            </div>
          </div>
        </div>

        <!-- LANGKAH 5 -->
        <div class="step-card">
          <div class="step-header">
            <div class="step-num">5</div>
            <div>
              <h3 class="step-title">Buat pesanan</h3>
              <p class="step-sub">
                Klik "Pesan Sekarang" dan isi form pemesanan.
              </p>
            </div>
          </div>
          <div class="step-body">
            <div class="form-preview">
              <div class="form-field-preview">
                <span class="field-label">Nama Lengkap</span>
                <span class="field-example">contoh: Siti Rahayu</span>
              </div>
              <div class="form-field-preview">
                <span class="field-label">Nomor WhatsApp</span>
                <span class="field-example">contoh: 08123456789</span>
              </div>
              <div class="form-field-preview">
                <span class="field-label">Alamat Lengkap</span>
                <span class="field-example"
                  >contoh: Jl. Mawar RT 02, dekat masjid</span
                >
              </div>
              <div class="form-field-preview">
                <span class="field-label">Jumlah</span>
                <span class="field-example"
                  >berapa banyak yang mau dipesan</span
                >
              </div>
              <div class="form-field-preview">
                <span class="field-label">Cara Bayar</span>
                <span class="field-example"
                  >COD (bayar di tempat) atau Transfer</span
                >
              </div>
              <div class="form-field-preview">
                <span class="field-label">Catatan</span>
                <span class="field-example"
                  >opsional, misal: "jangan terlalu manis"</span
                >
              </div>
            </div>
            <div class="tip-box tip-success">
              <span>✅</span>
              <p>
                Klik <strong>"Kirim Pesanan"</strong> — pesananmu langsung masuk
                ke penjual!
              </p>
            </div>
          </div>
        </div>

        <!-- LANGKAH 6 -->
        <div class="step-card">
          <div class="step-header">
            <div class="step-num">6</div>
            <div>
              <h3 class="step-title">Koordinasi dengan penjual lewat WA</h3>
              <p class="step-sub">
                Setelah pesan, penjual akan menghubungimu untuk konfirmasi.
              </p>
            </div>
          </div>
          <div class="step-body">
            <div class="flow-steps">
              <div class="flow-step">
                <div class="flow-dot"></div>
                <p>
                  Penjual <strong>konfirmasi pesanan</strong> lewat WhatsApp
                </p>
              </div>
              <div class="flow-line"></div>
              <div class="flow-step">
                <div class="flow-dot"></div>
                <p>
                  Atur <strong>waktu pengiriman</strong> atau
                  <strong>tempat COD</strong> bersama penjual
                </p>
              </div>
              <div class="flow-line"></div>
              <div class="flow-step">
                <div class="flow-dot"></div>
                <p>
                  Kalau transfer, penjual akan kirim
                  <strong>nomor rekening</strong>
                </p>
              </div>
              <div class="flow-line"></div>
              <div class="flow-step">
                <div class="flow-dot active"></div>
                <p>Terima produk & <strong>selesai!</strong> 🎉</p>
              </div>
            </div>
            <div class="tip-box tip-info">
              <span>💡</span>
              <p>
                Kamu juga bisa lihat status pesanan di menu
                <strong>"Pesanan Saya"</strong>.
              </p>
            </div>
          </div>
        </div>

        <!-- FAQ PEMBELI -->
        <div class="faq-section">
          <h2 class="faq-title">❓ Pertanyaan yang Sering Ditanya</h2>
          <div class="faq-list">
            <div
              class="faq-item"
              v-for="(q, i) in faqPembeli"
              :key="i"
              @click="toggleFaq('pembeli', i)"
            >
              <div class="faq-q">
                <span>{{ q.pertanyaan }}</span>
                <span
                  class="faq-arrow"
                  :class="{ open: activeFaq.pembeli === i }"
                  >▼</span
                >
              </div>
              <div class="faq-a" v-if="activeFaq.pembeli === i">
                {{ q.jawaban }}
              </div>
            </div>
          </div>
        </div>

        <div class="cta-bottom">
          <p>Sudah paham? Yuk mulai belanja!</p>
          <RouterLink to="/produk" class="btn-cta"
            >Lihat Produk Sekarang →</RouterLink
          >
        </div>
      </div>
    </div>

    <!-- ===================== PENJUAL ===================== -->
    <div v-if="tab === 'penjual'" class="content">
      <div class="container">
        <div class="intro-box intro-penjual">
          <span class="intro-icon">🍱</span>
          <div>
            <h2 class="intro-title">Panduan untuk Penjual</h2>
            <p class="intro-desc">
              Ikuti langkah-langkah di bawah untuk mulai berjualan dan dapat
              pembeli dari Bangkuang.
            </p>
          </div>
        </div>

        <!-- LANGKAH 1 -->
        <div class="step-card">
          <div class="step-header">
            <div class="step-num penjual">1</div>
            <div>
              <h3 class="step-title">Daftar sebagai Penjual</h3>
              <p class="step-sub">Gratis, tidak perlu bayar apapun.</p>
            </div>
          </div>
          <div class="step-body">
            <div class="mini-steps">
              <div class="mini-step">
                <span class="mini-num">a</span>
                <p>
                  Klik tombol <strong>"Daftar"</strong> di pojok kanan atas
                  halaman
                </p>
              </div>
              <div class="mini-step">
                <span class="mini-num">b</span>
                <p>Isi nama lengkap, email, dan password</p>
              </div>
              <div class="mini-step">
                <span class="mini-num">c</span>
                <p>
                  Pilih <strong>"Penjual"</strong> sebagai peran kamu — form
                  info toko akan muncul
                </p>
              </div>
              <div class="mini-step">
                <span class="mini-num">d</span>
                <p>
                  Isi <strong>nama toko</strong>,
                  <strong>nomor WhatsApp</strong>, dan
                  <strong>alamat</strong> kamu
                </p>
              </div>
              <div class="mini-step">
                <span class="mini-num">e</span>
                <p>Klik <strong>"Daftar Sekarang"</strong></p>
              </div>
            </div>
            <div class="tip-box tip-warning">
              <span>⚠️</span>
              <p>
                <strong>Nomor WhatsApp wajib diisi dengan benar</strong> —
                pembeli akan menghubungi kamu lewat nomor ini.
              </p>
            </div>
          </div>
        </div>

        <!-- LANGKAH 2 -->
        <div class="step-card">
          <div class="step-header">
            <div class="step-num penjual">2</div>
            <div>
              <h3 class="step-title">Tunggu verifikasi admin</h3>
              <p class="step-sub">
                Toko kamu akan dicek dulu oleh admin sebelum aktif.
              </p>
            </div>
          </div>
          <div class="step-body">
            <div class="status-flow">
              <div class="status-item">
                <div class="status-dot pending"></div>
                <div>
                  <p class="status-label">Menunggu Verifikasi</p>
                  <p class="status-desc">
                    Setelah daftar, toko kamu langsung masuk antrian review
                    admin
                  </p>
                </div>
              </div>
              <div class="status-arrow">↓</div>
              <div class="status-item">
                <div class="status-dot aktif"></div>
                <div>
                  <p class="status-label">Toko Aktif ✅</p>
                  <p class="status-desc">
                    Admin menyetujui — kamu langsung bisa upload produk dan
                    terima order
                  </p>
                </div>
              </div>
            </div>
            <div class="tip-box tip-info">
              <span>💡</span>
              <p>
                Proses verifikasi biasanya <strong>kurang dari 24 jam</strong>.
                Kalau ditolak, akan ada penjelasan alasannya dan kamu bisa
                perbaiki.
              </p>
            </div>
          </div>
        </div>

        <!-- LANGKAH 3 -->
        <div class="step-card">
          <div class="step-header">
            <div class="step-num penjual">3</div>
            <div>
              <h3 class="step-title">Lengkapi profil toko kamu</h3>
              <p class="step-sub">Toko yang lengkap lebih dipercaya pembeli.</p>
            </div>
          </div>
          <div class="step-body">
            <div class="profil-tips">
              <div class="profil-tip">
                <span class="tip-icon">📸</span>
                <div>
                  <p class="tip-title">Upload foto toko</p>
                  <p class="tip-desc">
                    Bisa foto logo toko, atau foto produk unggulan kamu
                  </p>
                </div>
              </div>
              <div class="profil-tip">
                <span class="tip-icon">✍️</span>
                <div>
                  <p class="tip-title">Tulis deskripsi toko</p>
                  <p class="tip-desc">
                    Contoh: "Menerima pesanan kue basah, minimal 1 hari
                    sebelumnya. Bisa antar area Bangkuang."
                  </p>
                </div>
              </div>
              <div class="profil-tip">
                <span class="tip-icon">📍</span>
                <div>
                  <p class="tip-title">Isi alamat lengkap</p>
                  <p class="tip-desc">Supaya pembeli tahu kamu di mana</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- LANGKAH 4 -->
        <div class="step-card">
          <div class="step-header">
            <div class="step-num penjual">4</div>
            <div>
              <h3 class="step-title">Upload produk pertama kamu</h3>
              <p class="step-sub">
                Ini bagian terpenting — foto yang bagus = produk lebih laris.
              </p>
            </div>
          </div>
          <div class="step-body">
            <div class="mini-steps">
              <div class="mini-step">
                <span class="mini-num">a</span>
                <p>
                  Klik menu <strong>"Produk Saya"</strong> lalu
                  <strong>"+ Tambah Produk"</strong>
                </p>
              </div>
              <div class="mini-step">
                <span class="mini-num">b</span>
                <p>
                  Upload <strong>foto produk</strong> — ambil foto di tempat
                  terang, latar bersih lebih bagus
                </p>
              </div>
              <div class="mini-step">
                <span class="mini-num">c</span>
                <p>
                  Isi <strong>nama produk</strong> yang jelas, contoh: "Kue
                  Lapis Pandan 10 lapis"
                </p>
              </div>
              <div class="mini-step">
                <span class="mini-num">d</span>
                <p>
                  Pilih <strong>kategori</strong> yang sesuai (Kue Basah, Kue
                  Kering, Makanan, atau Minuman)
                </p>
              </div>
              <div class="mini-step">
                <span class="mini-num">e</span>
                <p>
                  Isi <strong>harga</strong> dan <strong>stok</strong> yang
                  tersedia
                </p>
              </div>
              <div class="mini-step">
                <span class="mini-num">f</span>
                <p>
                  Tulis <strong>deskripsi</strong> — ceritakan bahan, rasa, cara
                  simpan, minimal order, dll
                </p>
              </div>
              <div class="mini-step">
                <span class="mini-num">g</span>
                <p>
                  Klik <strong>"Tambah Produk"</strong> — produk langsung tampil
                  di toko!
                </p>
              </div>
            </div>

            <div class="foto-tips-box">
              <p class="foto-tips-title">📸 Tips Foto Produk yang Bagus:</p>
              <div class="foto-tips-list">
                <div class="foto-tip-item">
                  <span>☀️</span>
                  <p>
                    Foto di dekat jendela saat siang hari — cahaya alami paling
                    bagus
                  </p>
                </div>
                <div class="foto-tip-item">
                  <span>🍽️</span>
                  <p>Taruh produk di piring atau alas yang bersih dan rapi</p>
                </div>
                <div class="foto-tip-item">
                  <span>📱</span>
                  <p>Lap lensa HP dulu sebelum foto supaya tidak buram</p>
                </div>
                <div class="foto-tip-item">
                  <span>🔍</span>
                  <p>Ambil dari dekat agar detail produk terlihat jelas</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- LANGKAH 5 -->
        <div class="step-card">
          <div class="step-header">
            <div class="step-num penjual">5</div>
            <div>
              <h3 class="step-title">Terima dan kelola order masuk</h3>
              <p class="step-sub">
                Ketika ada yang pesan, kamu akan lihat order baru di dashboard.
              </p>
            </div>
          </div>
          <div class="step-body">
            <div class="flow-steps">
              <div class="flow-step">
                <div class="flow-dot penjual"></div>
                <p>
                  Buka <strong>"Order Masuk"</strong> di menu — lihat detail
                  pesanan
                </p>
              </div>
              <div class="flow-line penjual"></div>
              <div class="flow-step">
                <div class="flow-dot penjual"></div>
                <p>
                  Klik <strong>"✅ Konfirmasi"</strong> kalau kamu bisa memenuhi
                  pesanan
                </p>
              </div>
              <div class="flow-line penjual"></div>
              <div class="flow-step">
                <div class="flow-dot penjual"></div>
                <p>
                  Klik <strong>"💬 WA Pembeli"</strong> untuk atur pengiriman
                  atau COD lewat WhatsApp
                </p>
              </div>
              <div class="flow-line penjual"></div>
              <div class="flow-step">
                <div class="flow-dot penjual active"></div>
                <p>
                  Setelah barang diterima, klik
                  <strong>"🎉 Tandai Selesai"</strong>
                </p>
              </div>
            </div>
            <div class="tip-box tip-warning">
              <span>⚠️</span>
              <p>
                Segera konfirmasi order yang masuk ya. Pembeli yang menunggu
                terlalu lama bisa membatalkan pesanan.
              </p>
            </div>
          </div>
        </div>

        <!-- LANGKAH 6 -->
        <div class="step-card">
          <div class="step-header">
            <div class="step-num penjual">6</div>
            <div>
              <h3 class="step-title">Kelola stok produk kamu</h3>
              <p class="step-sub">
                Jaga stok selalu up to date agar pembeli tidak kecewa.
              </p>
            </div>
          </div>
          <div class="step-body">
            <div class="stok-tips">
              <div class="stok-tip">
                <span>📦</span>
                <div>
                  <p class="tip-title">Update stok rutin</p>
                  <p class="tip-desc">
                    Kalau produk habis, ubah stok jadi 0 atau sembunyikan produk
                    dulu agar tidak ada yang pesan
                  </p>
                </div>
              </div>
              <div class="stok-tip">
                <span>🙈</span>
                <div>
                  <p class="tip-title">Sembunyikan produk</p>
                  <p class="tip-desc">
                    Di halaman "Produk Saya", ada tombol "Sembunyikan" — produk
                    tidak akan tampil tapi data tidak hilang
                  </p>
                </div>
              </div>
              <div class="stok-tip">
                <span>✏️</span>
                <div>
                  <p class="tip-title">Edit produk kapan saja</p>
                  <p class="tip-desc">
                    Ganti foto, harga, atau deskripsi kapanpun kamu mau lewat
                    tombol "Edit"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TIPS SUKSES -->
        <div class="sukses-box">
          <h3 class="sukses-title">🌟 Tips Jualan Laris di ItahBangkuang</h3>
          <div class="sukses-grid">
            <div class="sukses-item">
              <span class="sukses-icon">⚡</span>
              <p class="sukses-label">Cepat respons</p>
              <p class="sukses-desc">Konfirmasi order dalam 1-2 jam</p>
            </div>
            <div class="sukses-item">
              <span class="sukses-icon">📸</span>
              <p class="sukses-label">Foto menarik</p>
              <p class="sukses-desc">
                Foto terang dan rapi bikin produk lebih laris
              </p>
            </div>
            <div class="sukses-item">
              <span class="sukses-icon">💬</span>
              <p class="sukses-label">Ramah ke pembeli</p>
              <p class="sukses-desc">Balas WA dengan sopan dan informatif</p>
            </div>
            <div class="sukses-item">
              <span class="sukses-icon">🔄</span>
              <p class="sukses-label">Update rutin</p>
              <p class="sukses-desc">Upload produk baru secara berkala</p>
            </div>
            <div class="sukses-item">
              <span class="sukses-icon">📢</span>
              <p class="sukses-label">Share ke WA & FB</p>
              <p class="sukses-desc">
                Share link toko ke group WA & Facebook-mu
              </p>
            </div>
            <div class="sukses-item">
              <span class="sukses-icon">✅</span>
              <p class="sukses-label">Jaga kualitas</p>
              <p class="sukses-desc">Produk sesuai foto = pembeli balik lagi</p>
            </div>
          </div>
        </div>

        <!-- FAQ PENJUAL -->
        <div class="faq-section">
          <h2 class="faq-title">❓ Pertanyaan yang Sering Ditanya</h2>
          <div class="faq-list">
            <div
              class="faq-item"
              v-for="(q, i) in faqPenjual"
              :key="i"
              @click="toggleFaq('penjual', i)"
            >
              <div class="faq-q">
                <span>{{ q.pertanyaan }}</span>
                <span
                  class="faq-arrow"
                  :class="{ open: activeFaq.penjual === i }"
                  >▼</span
                >
              </div>
              <div class="faq-a" v-if="activeFaq.penjual === i">
                {{ q.jawaban }}
              </div>
            </div>
          </div>
        </div>

        <div class="cta-bottom cta-penjual">
          <p>Siap buka toko? Yuk mulai sekarang!</p>
          <RouterLink to="/register" class="btn-cta btn-cta-penjual"
            >Buka Toko Gratis →</RouterLink
          >
        </div>
      </div>
    </div>

    <!-- BUTUH BANTUAN -->
    <div class="bantuan-section">
      <div class="container">
        <div class="bantuan-card">
          <span class="bantuan-icon">🤝</span>
          <h3 class="bantuan-title">Masih Bingung?</h3>
          <p class="bantuan-desc">
            Tidak apa-apa! Kamu bisa langsung hubungi admin ItahBangkuang lewat
            WhatsApp untuk dibantu.
          </p>
          <a
            href="https://wa.me/6282253158560?text=Halo, saya butuh bantuan pakai ItahBangkuang"
            target="_blank"
            class="btn-wa-bantuan"
          >
            💬 Chat Admin via WhatsApp
          </a>
        </div>
      </div>
    </div>
  </LayoutPublic>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import LayoutPublic from '@/layouts/LayoutPublic.vue';
import { useSeo } from '@/lib/useSeo';

const route = useRoute();

// Default tab dari query param ?untuk=penjual
const tab = ref(route.query.untuk === 'penjual' ? 'penjual' : 'pembeli');

const activeFaq = ref({ pembeli: null, penjual: null });

const toggleFaq = (type, i) => {
  activeFaq.value[type] = activeFaq.value[type] === i ? null : i;
};

const faqPembeli = [
  {
    pertanyaan: 'Apakah harus daftar dulu untuk lihat produk?',
    jawaban:
      'Tidak. Kamu bisa melihat semua produk tanpa daftar. Tapi untuk memesan, kamu perlu daftar akun terlebih dahulu.',
  },
  {
    pertanyaan: 'Bagaimana cara bayarnya?',
    jawaban:
      'Ada dua cara: COD (bayar langsung ke penjual saat menerima barang) atau Transfer bank/e-wallet. Kamu pilih saat mengisi form pesanan.',
  },
  {
    pertanyaan: 'Berapa lama barang sampai?',
    jawaban:
      'Tergantung kesepakatan dengan penjual. Biasanya diatur langsung lewat WhatsApp setelah penjual konfirmasi pesanan.',
  },
  {
    pertanyaan: 'Bagaimana kalau pesanan saya tidak dikonfirmasi penjual?',
    jawaban:
      'Kamu bisa langsung hubungi penjual lewat tombol "Chat via WhatsApp" yang ada di halaman detail produk atau di riwayat pesananmu.',
  },
  {
    pertanyaan: 'Apakah bisa batalkan pesanan?',
    jawaban:
      'Bisa, selama penjual belum konfirmasi. Hubungi penjual lewat WhatsApp untuk membatalkan.',
  },
];

const faqPenjual = [
//   {
//     pertanyaan: 'Apakah benar-benar gratis?',
//     jawaban:
//       'Ya, benar-benar gratis. Tidak ada biaya pendaftaran, biaya upload produk, maupun komisi penjualan.',
//   },
  {
    pertanyaan: 'Berapa lama verifikasi toko?',
    jawaban:
      'Biasanya kurang dari 24 jam. Admin akan memeriksa informasi tokomu dan mengaktifkan kalau sudah sesuai.',
  },
  {
    pertanyaan: 'Bagaimana kalau toko saya ditolak?',
    jawaban:
      'Admin akan memberikan alasan penolakan. Kamu bisa perbaiki informasi tokomu dan hubungi admin untuk diverifikasi ulang.',
  },
  {
    pertanyaan: 'Berapa banyak produk yang bisa di-upload?',
    jawaban:
      'Tidak terbatas. Kamu bisa upload sebanyak apapun produk yang ingin dijual.',
  },
  {
    pertanyaan: 'Bagaimana cara terima pembayaran transfer?',
    jawaban:
      'Kamu atur sendiri dengan pembeli lewat WhatsApp. Berikan nomor rekening atau e-wallet kamu kepada pembeli setelah konfirmasi order.',
  },
  {
    pertanyaan: 'Apakah bisa jualan produk titipan orang lain?',
    jawaban:
      'Boleh, selama kamu yang bertanggung jawab atas toko dan bisa dihubungi pembeli.',
  },
];

onMounted(() => {
  useSeo({
    title: 'Cara Pakai ItahBangkuang — Panduan Pembeli & Penjual',
    description:
      'Panduan lengkap cara belanja dan berjualan di ItahBangkuang. Step by step, mudah diikuti untuk semua orang.',
  });
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* HERO */
.hero {
  background: linear-gradient(155deg, #1a2e0a 0%, #2d5016 100%);
  padding: 4rem 0 3rem;
  text-align: center;
}
.hero-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #a8c97f;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
}
.hero-title {
  font-family: 'Lora', serif;
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 700;
  color: #f5edd6;
  margin-bottom: 0.75rem;
}
.hero-sub {
  color: rgba(245, 237, 214, 0.65);
  font-size: 1rem;
  margin-bottom: 2.5rem;
}

.tab-switch {
  display: inline-flex;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 14px;
  padding: 0.3rem;
  gap: 0.3rem;
}
.tab-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: rgba(245, 237, 214, 0.6);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.25s;
  white-space: nowrap;
}
.tab-btn.active {
  background: #f5edd6;
  color: #1a2e0a;
}

/* CONTENT */
.content {
  padding: 3rem 0 2rem;
  background: #fdfaf4;
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #1a2e0a;
}
.container {
  max-width: 760px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* INTRO BOX */
.intro-box {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: #f0f7e8;
  border: 1.5px solid #a8c97f;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}
.intro-penjual {
  background: #fff8e7;
  border-color: #fde68a;
}
.intro-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}
.intro-title {
  font-family: 'Lora', serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #1a2e0a;
  margin-bottom: 0.3rem;
}
.intro-desc {
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.6;
}

/* STEP CARDS */
.step-card {
  background: #fff;
  border: 1px solid #e8e0d0;
  border-radius: 18px;
  padding: 1.75rem;
  margin-bottom: 1.5rem;
}
.step-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.step-num {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #2d5016;
  color: #f5edd6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 700;
  flex-shrink: 0;
  font-family: 'Lora', serif;
}
.step-num.penjual {
  background: #92400e;
}
.step-title {
  font-family: 'Lora', serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a2e0a;
  margin-bottom: 0.2rem;
}
.step-sub {
  font-size: 0.82rem;
  color: #6b7280;
}
.step-body {
  padding-left: 0;
}

/* TIP BOXES */
.tip-box {
  display: flex;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  font-size: 0.85rem;
  line-height: 1.6;
  margin-top: 1rem;
}
.tip-box span {
  font-size: 1.1rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}
.tip-info {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
}
.tip-warning {
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
}
.tip-success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
}

/* MINI STEPS */
.mini-steps {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.mini-step {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}
.mini-num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f0f7e8;
  border: 1.5px solid #a8c97f;
  color: #2d5016;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 0.1rem;
}
.mini-step p {
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.6;
}
.mini-step strong {
  color: #1a2e0a;
}

/* CARA CARI */
.cara-cari-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.85rem;
}
.cara-cari-card {
  background: #fdfaf4;
  border: 1px solid #e8e0d0;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
}
.cara-icon {
  font-size: 1.75rem;
  display: block;
  margin-bottom: 0.5rem;
}
.cara-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #1a2e0a;
  margin-bottom: 0.25rem;
}
.cara-desc {
  font-size: 0.75rem;
  color: #6b7280;
  line-height: 1.5;
}

/* CHECKLIST */
.checklist {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.check-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}
.check-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}
.check-item p {
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.6;
}

/* FORM PREVIEW */
.form-preview {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.form-field-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  gap: 1rem;
}
.field-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
  flex-shrink: 0;
}
.field-example {
  font-size: 0.75rem;
  color: #9ca3af;
  font-style: italic;
  text-align: right;
}

/* FLOW STEPS */
.flow-steps {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.flow-step {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}
.flow-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #a8c97f;
  border: 2px solid #2d5016;
  flex-shrink: 0;
}
.flow-dot.penjual {
  border-color: #92400e;
  background: #fde68a;
}
.flow-dot.active {
  background: #2d5016;
}
.flow-dot.penjual.active {
  background: #92400e;
}
.flow-step p {
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.6;
  padding: 0.5rem 0;
}
.flow-step strong {
  color: #1a2e0a;
}
.flow-line {
  width: 2px;
  height: 20px;
  background: #e8e0d0;
  margin-left: 6px;
}
.flow-line.penjual {
  background: #fde68a;
}

/* PHONE MOCK */
.step-visual {
  display: flex;
  justify-content: center;
  margin-top: 1.25rem;
}
.phone-mock {
  width: 200px;
  background: #1a2e0a;
  border-radius: 20px;
  padding: 0.75rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}
.phone-bar {
  display: flex;
  gap: 0.3rem;
  margin-bottom: 0.5rem;
}
.phone-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(245, 237, 214, 0.3);
}
.phone-url {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 0.3rem 0.6rem;
  font-size: 0.65rem;
  color: rgba(245, 237, 214, 0.6);
  margin-bottom: 0.5rem;
  font-family: monospace;
}
.phone-screen {
  background: #fdfaf4;
  border-radius: 10px;
  padding: 0.75rem;
}
.mock-header {
  font-family: 'Lora', serif;
  font-size: 0.7rem;
  font-weight: 700;
  color: #2d5016;
  margin-bottom: 0.5rem;
}
.mock-hero-text {
  font-size: 0.65rem;
  color: #374151;
  margin-bottom: 0.5rem;
  font-style: italic;
}
.mock-btn {
  background: #2d5016;
  color: #f5edd6;
  font-size: 0.6rem;
  padding: 0.3rem 0.5rem;
  border-radius: 6px;
  display: inline-block;
}

/* STATUS FLOW */
.status-flow {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.status-item {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 0.75rem 0;
}
.status-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 0.2rem;
}
.status-dot.pending {
  background: #fde68a;
  border: 2px solid #92400e;
}
.status-dot.aktif {
  background: #22c55e;
  border: 2px solid #166534;
}
.status-arrow {
  text-align: left;
  padding-left: 8px;
  font-size: 1.2rem;
  color: #9ca3af;
}
.status-label {
  font-weight: 700;
  font-size: 0.9rem;
  color: #1a2e0a;
  margin-bottom: 0.15rem;
}
.status-desc {
  font-size: 0.8rem;
  color: #6b7280;
  line-height: 1.5;
}

/* PROFIL TIPS */
.profil-tips {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.profil-tip {
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;
}
.tip-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}
.tip-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: #1a2e0a;
  margin-bottom: 0.2rem;
}
.tip-desc {
  font-size: 0.8rem;
  color: #6b7280;
  line-height: 1.5;
}

/* FOTO TIPS */
.foto-tips-box {
  margin-top: 1.25rem;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 12px;
  padding: 1rem;
}
.foto-tips-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #92400e;
  margin-bottom: 0.75rem;
}
.foto-tips-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.foto-tip-item {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
}
.foto-tip-item span {
  font-size: 1rem;
  flex-shrink: 0;
}
.foto-tip-item p {
  font-size: 0.8rem;
  color: #78350f;
  line-height: 1.5;
}

/* STOK TIPS */
.stok-tips {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.stok-tip {
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;
}
.stok-tip span {
  font-size: 1.5rem;
  flex-shrink: 0;
}

/* SUKSES BOX */
.sukses-box {
  background: linear-gradient(135deg, #1a2e0a, #2d5016);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
}
.sukses-title {
  font-family: 'Lora', serif;
  font-size: 1.2rem;
  color: #f5edd6;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
}
.sukses-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
.sukses-item {
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(245, 237, 214, 0.12);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
}
.sukses-icon {
  font-size: 1.75rem;
  display: block;
  margin-bottom: 0.5rem;
}
.sukses-label {
  font-weight: 700;
  font-size: 0.82rem;
  color: #f5edd6;
  margin-bottom: 0.25rem;
}
.sukses-desc {
  font-size: 0.72rem;
  color: rgba(245, 237, 214, 0.6);
  line-height: 1.4;
}

/* FAQ */
.faq-section {
  margin: 2rem 0;
}
.faq-title {
  font-family: 'Lora', serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: #1a2e0a;
  margin-bottom: 1rem;
}
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.faq-item {
  background: #fff;
  border: 1px solid #e8e0d0;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s;
}
.faq-item:hover {
  border-color: #a8c97f;
}
.faq-q {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a2e0a;
}
.faq-arrow {
  font-size: 0.7rem;
  color: #9ca3af;
  transition: transform 0.2s;
  flex-shrink: 0;
}
.faq-arrow.open {
  transform: rotate(180deg);
  color: #2d5016;
}
.faq-a {
  padding: 0 1.1rem 1rem;
  font-size: 0.85rem;
  color: #4b5563;
  line-height: 1.7;
  border-top: 1px solid #f0ede6;
  padding-top: 0.75rem;
  margin-top: 0;
}

/* CTA BOTTOM */
.cta-bottom {
  text-align: center;
  padding: 2rem 0;
}
.cta-bottom p {
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}
.btn-cta {
  display: inline-block;
  background: #2d5016;
  color: #f5edd6;
  padding: 0.9rem 2rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.95rem;
  transition: all 0.2s;
}
.btn-cta:hover {
  background: #3a6b1e;
  transform: translateY(-1px);
}
.cta-penjual .btn-cta-penjual {
  background: #92400e;
}
.cta-penjual .btn-cta-penjual:hover {
  background: #78350f;
}

/* BANTUAN */
.bantuan-section {
  background: #fff;
  padding: 3rem 0 4rem;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.bantuan-card {
  background: #f0f7e8;
  border: 1.5px solid #a8c97f;
  border-radius: 20px;
  padding: 2.5rem;
  text-align: center;
}
.bantuan-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}
.bantuan-title {
  font-family: 'Lora', serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #1a2e0a;
  margin-bottom: 0.5rem;
}
.bantuan-desc {
  color: #4b5563;
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
}
.btn-wa-bantuan {
  display: inline-block;
  background: #25d366;
  color: #fff;
  padding: 0.9rem 2rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.95rem;
  transition: all 0.2s;
}
.btn-wa-bantuan:hover {
  background: #1ebe5d;
  transform: translateY(-1px);
}

/* RESPONSIVE */
@media (max-width: 640px) {
  .tab-switch {
    flex-direction: column;
    width: 100%;
  }
  .tab-btn {
    text-align: center;
  }
  .cara-cari-grid {
    grid-template-columns: 1fr;
  }
  .sukses-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .form-field-preview {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.2rem;
  }
  .field-example {
    text-align: left;
  }
}
</style>
