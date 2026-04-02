<template>
  <div class="page">
    <!-- NAVBAR -->
    <nav class="navbar">
      <RouterLink to="/" class="nav-brand">🛒 ItahBangkuang</RouterLink>
      <div class="nav-links">
        <RouterLink to="/produk">Lihat Toko</RouterLink>
        <RouterLink to="/toko/produk" v-if="statusToko === 'AKTIF'"
          >Produk Saya</RouterLink
        >
        <RouterLink to="/toko/order" v-if="statusToko === 'AKTIF'"
          >Order Masuk</RouterLink
        >
        <RouterLink to="/toko/profil">Profil Toko</RouterLink>
        <button class="btn-nav-outline" @click="logout">Keluar</button>
      </div>
      <button class="hamburger" @click="menuOpen = !menuOpen">☰</button>
    </nav>

    <div class="mobile-menu" v-if="menuOpen">
      <RouterLink to="/produk" @click="menuOpen = false">Lihat Toko</RouterLink>
      <RouterLink
        to="/toko/produk"
        v-if="statusToko === 'AKTIF'"
        @click="menuOpen = false"
        >Produk Saya</RouterLink
      >
      <RouterLink
        to="/toko/order"
        v-if="statusToko === 'AKTIF'"
        @click="menuOpen = false"
        >Order Masuk</RouterLink
      >
      <RouterLink to="/toko/profil" @click="menuOpen = false"
        >Profil Toko</RouterLink
      >
      <button @click="logout">Keluar</button>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="loading-wrap">
      <div class="spinner"></div>
      <p>Memuat dashboard...</p>
    </div>

    <template v-else>
      <!-- ==================== STATUS: PENDING ==================== -->
      <div v-if="statusToko === 'PENDING'" class="status-page">
        <div class="status-card pending">
          <div class="status-icon">⏳</div>
          <h2>Toko Sedang Diverifikasi</h2>
          <p>
            Terima kasih sudah mendaftar! Tim admin sedang memeriksa informasi
            toko kamu. Proses verifikasi biasanya memakan waktu
            <strong>1×24 jam</strong>.
          </p>
          <div class="status-info-box">
            <div class="info-row">
              <span class="info-label">Nama Toko</span>
              <span class="info-val">{{ toko?.nama_toko }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Alamat</span>
              <span class="info-val">{{ toko?.alamat }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status</span>
              <span class="badge badge-pending">Menunggu Verifikasi</span>
            </div>
          </div>
          <p class="status-hint">
            Kamu akan bisa mengelola toko dan mengupload produk setelah
            diverifikasi admin.
          </p>
          <RouterLink to="/toko/profil" class="btn-secondary"
            >Lengkapi Profil Toko →</RouterLink
          >
        </div>
      </div>

      <!-- ==================== STATUS: DITOLAK ==================== -->
      <div v-else-if="statusToko === 'DITOLAK'" class="status-page">
        <div class="status-card ditolak">
          <div class="status-icon">❌</div>
          <h2>Pendaftaran Toko Ditolak</h2>
          <p>Maaf, pendaftaran toko kamu belum bisa kami setujui saat ini.</p>
          <div class="alasan-box" v-if="toko?.alasan_tolak">
            <p class="alasan-label">Alasan dari Admin:</p>
            <p class="alasan-text">"{{ toko.alasan_tolak }}"</p>
          </div>
          <p class="status-hint">
            Perbaiki informasi toko sesuai alasan di atas, lalu hubungi admin
            untuk verifikasi ulang.
          </p>
          <div class="btn-row">
            <RouterLink to="/toko/profil" class="btn-primary"
              >Perbaiki Profil Toko</RouterLink
            >
          </div>
        </div>
      </div>

      <!-- ==================== STATUS: DIBLOKIR ==================== -->
      <div v-else-if="statusToko === 'DIBLOKIR'" class="status-page">
        <div class="status-card diblokir">
          <div class="status-icon">🚫</div>
          <h2>Toko Diblokir</h2>
          <p>
            Toko kamu telah diblokir oleh admin. Silakan hubungi admin untuk
            informasi lebih lanjut.
          </p>
        </div>
      </div>

      <!-- ==================== STATUS: AKTIF ==================== -->
      <div v-else-if="statusToko === 'AKTIF'" class="dashboard">
        <!-- Header -->
        <div class="dashboard-header">
          <div class="container">
            <div class="header-inner">
              <div>
                <p class="header-greeting">Selamat datang kembali 👋</p>
                <h1 class="header-title">{{ toko?.nama_toko }}</h1>
                <p class="header-sub">📍 {{ toko?.alamat }}</p>
              </div>
              <div class="header-actions">
                <RouterLink to="/toko/produk/tambah" class="btn-primary"
                  >+ Tambah Produk</RouterLink
                >
                <RouterLink :to="`/toko/${toko?.id}`" class="btn-outline"
                  >Lihat Toko →</RouterLink
                >
              </div>
            </div>
          </div>
        </div>

        <div class="container dashboard-body">
          <!-- STAT CARDS -->
          <div class="stat-grid">
            <div class="stat-card">
              <div class="stat-icon" style="background: #eff6ff">📦</div>
              <div class="stat-info">
                <p class="stat-num">{{ stats.totalProduk }}</p>
                <p class="stat-label">Produk Aktif</p>
              </div>
            </div>
            <div class="stat-card highlight">
              <div class="stat-icon" style="background: #fef9c3">🔔</div>
              <div class="stat-info">
                <p class="stat-num">{{ stats.orderMenunggu }}</p>
                <p class="stat-label">Order Menunggu</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon" style="background: #f0fdf4">✅</div>
              <div class="stat-info">
                <p class="stat-num">{{ stats.orderSelesai }}</p>
                <p class="stat-label">Order Selesai</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon" style="background: #fff7ed">💰</div>
              <div class="stat-info">
                <p class="stat-num">
                  {{ formatRupiah(stats.totalPendapatan) }}
                </p>
                <p class="stat-label">Total Pendapatan</p>
              </div>
            </div>
          </div>

          <div class="dashboard-cols">
            <!-- ORDER TERBARU -->
            <div class="dash-section">
              <div class="section-head">
                <h2 class="section-title">Order Masuk Terbaru</h2>
                <RouterLink to="/toko/order" class="lihat-semua"
                  >Lihat Semua →</RouterLink
                >
              </div>

              <div v-if="orderTerbaru.length" class="order-list">
                <div v-for="o in orderTerbaru" :key="o.id" class="order-item">
                  <div class="order-info">
                    <p class="order-nama">{{ o.nama_pemesan }}</p>
                    <p class="order-produk">
                      {{ o.produk?.nama_produk }} × {{ o.jumlah }}
                    </p>
                    <p class="order-metode">
                      {{ o.metode }} • {{ formatTanggal(o.created_at) }}
                    </p>
                  </div>
                  <div class="order-right">
                    <p class="order-total">{{ formatRupiah(o.total_harga) }}</p>
                    <span class="badge" :class="badgeClass(o.status)">{{
                      o.status
                    }}</span>
                  </div>
                </div>
              </div>

              <div v-else class="empty-mini">
                <p>🎉 Belum ada order masuk</p>
                <span>Share toko kamu agar pembeli menemukanmu!</span>
              </div>
            </div>

            <!-- PRODUK & STOK -->
            <div class="dash-section">
              <div class="section-head">
                <h2 class="section-title">Produk Saya</h2>
                <RouterLink to="/toko/produk" class="lihat-semua"
                  >Kelola →</RouterLink
                >
              </div>

              <div v-if="produkList.length" class="produk-mini-list">
                <RouterLink
                  v-for="p in produkList"
                  :key="p.id"
                  :to="`/toko/produk/${p.id}/edit`"
                  class="produk-mini-item"
                >
                  <img
                    :src="p.foto_url"
                    :alt="p.nama_produk"
                    class="produk-mini-foto"
                  />
                  <div class="produk-mini-info">
                    <p class="produk-mini-nama">{{ p.nama_produk }}</p>
                    <p class="produk-mini-harga">{{ formatRupiah(p.harga) }}</p>
                  </div>
                  <div
                    class="produk-mini-stok"
                    :class="{
                      habis: p.stok === 0,
                      low: p.stok <= 5 && p.stok > 0,
                    }"
                  >
                    {{ p.stok === 0 ? 'Habis' : `Stok: ${p.stok}` }}
                  </div>
                </RouterLink>
              </div>

              <div v-else class="empty-mini">
                <p>📭 Belum ada produk</p>
                <RouterLink
                  to="/toko/produk/tambah"
                  class="btn-primary"
                  style="
                    margin-top: 0.75rem;
                    font-size: 0.875rem;
                    padding: 0.6rem 1.25rem;
                  "
                >
                  + Tambah Produk Pertama
                </RouterLink>
              </div>
            </div>
          </div>

          <!-- LINK TOKO -->
          <div class="share-box">
            <div class="share-info">
              <p class="share-label">🔗 Link Toko Kamu</p>
              <p class="share-url">{{ baseUrl }}/toko/{{ toko?.id }}</p>
            </div>
            <button class="btn-copy" @click="copyLink">
              {{ copied ? '✅ Tersalin!' : '📋 Salin' }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/lib/supabase';

const router = useRouter();
const menuOpen = ref(false);
const loading = ref(true);
const toko = ref(null);
const statusToko = ref(null);
const stats = ref({
  totalProduk: 0,
  orderMenunggu: 0,
  orderSelesai: 0,
  totalPendapatan: 0,
});
const orderTerbaru = ref([]);
const produkList = ref([]);
const copied = ref(false);
const baseUrl = window.location.origin;

const formatRupiah = (angka) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka ?? 0);

const formatTanggal = (iso) =>
  new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

const badgeClass = (status) => ({
  'badge-menunggu': status === 'MENUNGGU',
  'badge-konfirmasi': status === 'DIKONFIRMASI',
  'badge-selesai': status === 'SELESAI',
  'badge-batal': status === 'DIBATALKAN',
});

const copyLink = () => {
  navigator.clipboard.writeText(`${baseUrl}/toko/${toko.value?.id}`);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
};

const logout = async () => {
  await supabase.auth.signOut();
  router.push('/');
};

onMounted(async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    router.push('/login');
    return;
  }

  // Ambil data toko
  const { data: tokoData } = await supabase
    .from('toko')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (!tokoData) {
    router.push('/');
    return;
  }

  toko.value = tokoData;
  statusToko.value = tokoData.status;

  if (tokoData.status !== 'AKTIF') {
    loading.value = false;
    return;
  }

  // Fetch semua data dashboard paralel
  const [produkRes, orderRes] = await Promise.all([
    supabase
      .from('produk')
      .select('id, nama_produk, foto_url, harga, stok')
      .eq('toko_id', tokoData.id)
      .eq('status', 'AKTIF')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('orders')
      .select('*, produk(nama_produk)')
      .eq('toko_id', tokoData.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  produkList.value = produkRes.data ?? [];
  orderTerbaru.value = orderRes.data ?? [];

  // Hitung stats
  const { count: totalProduk } = await supabase
    .from('produk')
    .select('*', { count: 'exact', head: true })
    .eq('toko_id', tokoData.id)
    .eq('status', 'AKTIF');
  const { count: orderMenunggu } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('toko_id', tokoData.id)
    .eq('status', 'MENUNGGU');
  const { count: orderSelesai } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('toko_id', tokoData.id)
    .eq('status', 'SELESAI');
  const { data: pendapatanData } = await supabase
    .from('orders')
    .select('total_harga')
    .eq('toko_id', tokoData.id)
    .eq('status', 'SELESAI');

  stats.value = {
    totalProduk: totalProduk ?? 0,
    orderMenunggu: orderMenunggu ?? 0,
    orderSelesai: orderSelesai ?? 0,
    totalPendapatan:
      pendapatanData?.reduce((sum, o) => sum + o.total_harga, 0) ?? 0,
  };

  loading.value = false;
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.page {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: #fdfaf4;
  min-height: 100vh;
  color: #1a2e0a;
}

.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(253, 250, 244, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid #e8e0d0;
  padding: 0 2rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.nav-brand {
  font-family: 'Lora', serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #2d5016;
  text-decoration: none;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}
.nav-links a {
  color: #374151;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.2s;
}
.nav-links a:hover {
  color: #2d5016;
}
.btn-nav-outline {
  background: none;
  border: 1.5px solid #2d5016;
  color: #2d5016 !important;
  padding: 0.4rem 0.9rem;
  border-radius: 8px;
  font-size: 0.8rem !important;
  font-weight: 600 !important;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s;
}
.btn-nav-outline:hover {
  background: #f0f7e8 !important;
}
.hamburger {
  display: none;
  background: none;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
  color: #2d5016;
}
.mobile-menu {
  background: #fff;
  border-bottom: 1px solid #e8e0d0;
  padding: 1rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.mobile-menu a,
.mobile-menu button {
  font-size: 0.95rem;
  font-weight: 500;
  color: #374151;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
}

.loading-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 6rem 2rem;
  color: #6b7280;
}
.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e8e0d0;
  border-top-color: #2d5016;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* STATUS PAGES */
.status-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
  padding: 2rem;
}
.status-card {
  max-width: 480px;
  width: 100%;
  text-align: center;
  background: #fff;
  border-radius: 24px;
  padding: 3rem 2.5rem;
  border: 1.5px solid #e8e0d0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
}
.status-card.pending {
  border-color: #fde68a;
}
.status-card.ditolak {
  border-color: #fecaca;
}
.status-card.diblokir {
  border-color: #d1d5db;
}
.status-icon {
  font-size: 3.5rem;
  margin-bottom: 1.25rem;
  display: block;
}
.status-card h2 {
  font-family: 'Lora', serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a2e0a;
  margin-bottom: 0.75rem;
}
.status-card p {
  color: #4b5563;
  font-size: 0.9rem;
  line-height: 1.7;
  margin-bottom: 1.25rem;
}

.status-info-box {
  background: #fdfaf4;
  border: 1px solid #e8e0d0;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.25rem;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
.info-label {
  font-size: 0.78rem;
  color: #9ca3af;
  font-weight: 500;
}
.info-val {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  text-align: right;
}

.status-hint {
  font-size: 0.82rem !important;
  color: #9ca3af !important;
  margin-bottom: 1.5rem !important;
}

.alasan-box {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.25rem;
  text-align: left;
}
.alasan-label {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
  margin-bottom: 0.3rem;
}
.alasan-text {
  font-size: 0.9rem;
  color: #dc2626;
  font-style: italic;
  line-height: 1.6;
}

/* BADGES */
.badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
}
.badge-pending {
  background: #fef9c3;
  color: #92400e;
}
.badge-menunggu {
  background: #fef9c3;
  color: #92400e;
}
.badge-konfirmasi {
  background: #dbeafe;
  color: #1e40af;
}
.badge-selesai {
  background: #dcfce7;
  color: #166534;
}
.badge-batal {
  background: #fee2e2;
  color: #991b1b;
}

/* BUTTONS */
.btn-primary {
  display: inline-block;
  background: #2d5016;
  color: #f5edd6;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.2s;
}
.btn-primary:hover {
  background: #3a6b1e;
}
.btn-secondary {
  display: inline-block;
  background: #f0f7e8;
  color: #2d5016;
  border: 1.5px solid #a8c97f;
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
}
.btn-secondary:hover {
  background: #e0f0cc;
}
.btn-outline {
  display: inline-block;
  background: transparent;
  color: #f5edd6;
  border: 1.5px solid rgba(245, 237, 214, 0.5);
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
}
.btn-outline:hover {
  background: rgba(245, 237, 214, 0.1);
}
.btn-row {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

/* DASHBOARD AKTIF */
.dashboard-header {
  background: linear-gradient(135deg, #2d5016, #3a6b1e);
  padding: 2.5rem 0;
}
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 2rem;
}
.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.header-greeting {
  font-size: 0.85rem;
  color: #a8c97f;
  margin-bottom: 0.25rem;
}
.header-title {
  font-family: 'Lora', serif;
  font-size: 2rem;
  font-weight: 700;
  color: #f5edd6;
  margin-bottom: 0.25rem;
}
.header-sub {
  font-size: 0.85rem;
  color: #a8c97f;
}
.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.dashboard-body {
  padding: 2rem 2rem 4rem;
}

/* STATS */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}
.stat-card {
  background: #fff;
  border: 1px solid #e8e0d0;
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: box-shadow 0.2s;
}
.stat-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.07);
}
.stat-card.highlight {
  border-color: #fde68a;
  background: #fffbeb;
}
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;
}
.stat-num {
  font-family: 'Lora', serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: #1a2e0a;
}
.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.1rem;
}

/* DASHBOARD COLS */
.dashboard-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}
.dash-section {
  background: #fff;
  border: 1px solid #e8e0d0;
  border-radius: 16px;
  padding: 1.5rem;
}
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}
.section-title {
  font-family: 'Lora', serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a2e0a;
}
.lihat-semua {
  font-size: 0.8rem;
  color: #2d5016;
  text-decoration: none;
  font-weight: 600;
}
.lihat-semua:hover {
  opacity: 0.7;
}

/* ORDER LIST */
.order-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.order-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.85rem;
  background: #fdfaf4;
  border-radius: 10px;
  border: 1px solid #f0ede6;
}
.order-nama {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a2e0a;
  margin-bottom: 0.15rem;
}
.order-produk {
  font-size: 0.78rem;
  color: #6b7280;
  margin-bottom: 0.1rem;
}
.order-metode {
  font-size: 0.72rem;
  color: #9ca3af;
}
.order-right {
  text-align: right;
  flex-shrink: 0;
}
.order-total {
  font-size: 0.875rem;
  font-weight: 700;
  color: #2d5016;
  margin-bottom: 0.25rem;
}

/* PRODUK MINI */
.produk-mini-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.produk-mini-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem;
  background: #fdfaf4;
  border-radius: 10px;
  border: 1px solid #f0ede6;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s;
}
.produk-mini-item:hover {
  border-color: #a8c97f;
}
.produk-mini-foto {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  background: #f3f4f6;
}
.produk-mini-info {
  flex: 1;
}
.produk-mini-nama {
  font-size: 0.82rem;
  font-weight: 600;
  color: #1a2e0a;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.produk-mini-harga {
  font-size: 0.78rem;
  color: #2d5016;
  font-weight: 600;
  margin-top: 0.1rem;
}
.produk-mini-stok {
  font-size: 0.72rem;
  font-weight: 600;
  color: #6b7280;
  flex-shrink: 0;
}
.produk-mini-stok.habis {
  color: #dc2626;
}
.produk-mini-stok.low {
  color: #d97706;
}

.empty-mini {
  text-align: center;
  padding: 2rem 1rem;
}
.empty-mini p {
  font-size: 0.9rem;
  color: #374151;
  font-weight: 500;
  margin-bottom: 0.25rem;
}
.empty-mini span {
  font-size: 0.8rem;
  color: #9ca3af;
}

/* SHARE BOX */
.share-box {
  background: #fff;
  border: 1px solid #e8e0d0;
  border-radius: 14px;
  padding: 1.1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.share-label {
  font-size: 0.78rem;
  color: #9ca3af;
  font-weight: 500;
  margin-bottom: 0.2rem;
}
.share-url {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
  word-break: break-all;
}
.btn-copy {
  background: #f0f7e8;
  color: #2d5016;
  border: 1.5px solid #a8c97f;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}
.btn-copy:hover {
  background: #e0f0cc;
}

@media (max-width: 900px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .dashboard-cols {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 640px) {
  .nav-links {
    display: none;
  }
  .hamburger {
    display: block;
  }
  .header-inner {
    flex-direction: column;
    align-items: flex-start;
  }
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .share-box {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
