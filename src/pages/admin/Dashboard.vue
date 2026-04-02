<template>
  <div class="page">
    <!-- NAVBAR -->
    <nav class="navbar">
      <RouterLink to="/" class="nav-brand">🛒 ItahBangkuang</RouterLink>
      <div class="nav-links">
        <RouterLink to="/admin/dashboard">Dashboard</RouterLink>
        <!-- <RouterLink to="/admin/toko">Kelola Toko</RouterLink>
        <RouterLink to="/admin/produk">Produk</RouterLink>
        <RouterLink to="/admin/users">Users</RouterLink> -->
        <button class="btn-nav-outline" @click="logout">Keluar</button>
      </div>
      <button class="hamburger" @click="menuOpen = !menuOpen">☰</button>
    </nav>

    <div class="mobile-menu" v-if="menuOpen">
      <RouterLink to="/admin/dashboard" @click="menuOpen = false"
        >Dashboard</RouterLink
      >
      <!-- <RouterLink to="/admin/toko" @click="menuOpen = false"
        >Kelola Toko</RouterLink
      >
      <RouterLink to="/admin/produk" @click="menuOpen = false"
        >Produk</RouterLink
      >
      <RouterLink to="/admin/users" @click="menuOpen = false">Users</RouterLink> -->
      <button @click="logout">Keluar</button>
    </div>

    <!-- HEADER -->
    <div class="dashboard-header">
      <div class="container">
        <p class="header-greeting">Panel Admin 👑</p>
        <h1 class="header-title">Dashboard ItahBangkuang</h1>
      </div>
    </div>

    <div class="container dashboard-body">
      <!-- STAT CARDS -->
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-icon">🏪</div>
          <div>
            <p class="stat-num">{{ stats.tokoAktif }}</p>
            <p class="stat-label">Toko Aktif</p>
          </div>
        </div>
        <div class="stat-card highlight-yellow">
          <div class="stat-icon">⏳</div>
          <div>
            <p class="stat-num">{{ stats.tokoPending }}</p>
            <p class="stat-label">Menunggu Verifikasi</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div>
            <p class="stat-num">{{ stats.totalProduk }}</p>
            <p class="stat-label">Total Produk</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🛒</div>
          <div>
            <p class="stat-num">{{ stats.totalOrder }}</p>
            <p class="stat-label">Total Order</p>
          </div>
        </div>
      </div>

      <div class="dashboard-cols">
        <!-- TOKO PENDING — VERIFIKASI -->
        <div class="dash-section">
          <div class="section-head">
            <h2 class="section-title">Toko Menunggu Verifikasi</h2>
            <RouterLink to="/admin/toko" class="lihat-semua"
              >Lihat Semua →</RouterLink
            >
          </div>

          <div v-if="loadingToko" class="loading-mini">
            <div class="spinner-sm"></div>
          </div>

          <div v-else-if="tokoPending.length" class="toko-list">
            <div v-for="t in tokoPending" :key="t.id" class="toko-item">
              <div class="toko-info">
                <p class="toko-nama">{{ t.nama_toko }}</p>
                <p class="toko-meta">📍 {{ t.alamat }} • 📞 {{ t.nomor_wa }}</p>
                <p class="toko-date">
                  Daftar: {{ formatTanggal(t.created_at) }}
                </p>
              </div>
              <div class="toko-actions">
                <button
                  class="btn-acc"
                  @click="accToko(t.id)"
                  :disabled="prosesId === t.id"
                >
                  {{ prosesId === t.id ? '...' : '✅ ACC' }}
                </button>
                <button
                  class="btn-tolak"
                  @click="bukaTolakModal(t)"
                  :disabled="prosesId === t.id"
                >
                  ❌ Tolak
                </button>
              </div>
            </div>
          </div>

          <div v-else class="empty-mini">
            <p>✅ Tidak ada toko yang menunggu verifikasi</p>
          </div>
        </div>

        <!-- ORDER TERBARU -->
        <div class="dash-section">
          <div class="section-head">
            <h2 class="section-title">Order Terbaru</h2>
          </div>

          <div v-if="loadingOrder" class="loading-mini">
            <div class="spinner-sm"></div>
          </div>

          <div v-else-if="orderTerbaru.length" class="order-list">
            <div v-for="o in orderTerbaru" :key="o.id" class="order-item">
              <div class="order-info">
                <p class="order-nama">{{ o.nama_pemesan }}</p>
                <p class="order-detail">
                  {{ o.produk?.nama_produk }} • {{ o.toko?.nama_toko }}
                </p>
                <p class="order-date">{{ formatTanggal(o.created_at) }}</p>
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
            <p>📭 Belum ada order</p>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL TOLAK -->
    <div
      class="modal-overlay"
      v-if="showTolakModal"
      @click.self="showTolakModal = false"
    >
      <div class="modal">
        <h3 class="modal-title">Tolak Toko</h3>
        <p class="modal-sub">
          Toko: <strong>{{ tolakTarget?.nama_toko }}</strong>
        </p>
        <div class="field">
          <label>Alasan Penolakan <span style="color: #dc2626">*</span></label>
          <textarea
            v-model="alasanTolak"
            rows="3"
            placeholder="Jelaskan alasan penolakan agar penjual bisa memperbaiki..."
          ></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="showTolakModal = false">
            Batal
          </button>
          <button
            class="btn-tolak-confirm"
            @click="konfirmasiTolak"
            :disabled="!alasanTolak.trim() || prosesId"
          >
            Tolak Toko
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/lib/supabase';

const router = useRouter();
const menuOpen = ref(false);
const loadingToko = ref(true);
const loadingOrder = ref(true);
const tokoPending = ref([]);
const orderTerbaru = ref([]);
const prosesId = ref(null);
const showTolakModal = ref(false);
const tolakTarget = ref(null);
const alasanTolak = ref('');
const stats = ref({
  tokoAktif: 0,
  tokoPending: 0,
  totalProduk: 0,
  totalOrder: 0,
});

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
    year: 'numeric',
  });

const badgeClass = (status) => ({
  'badge-menunggu': status === 'MENUNGGU',
  'badge-konfirmasi': status === 'DIKONFIRMASI',
  'badge-selesai': status === 'SELESAI',
  'badge-batal': status === 'DIBATALKAN',
});

const accToko = async (id) => {
  prosesId.value = id;
  await supabase.from('toko').update({ status: 'AKTIF' }).eq('id', id);
  tokoPending.value = tokoPending.value.filter((t) => t.id !== id);
  stats.value.tokoPending--;
  stats.value.tokoAktif++;
  prosesId.value = null;
};

const bukaTolakModal = (toko) => {
  tolakTarget.value = toko;
  alasanTolak.value = '';
  showTolakModal.value = true;
};

const konfirmasiTolak = async () => {
  if (!alasanTolak.value.trim()) return;
  prosesId.value = tolakTarget.value.id;
  await supabase
    .from('toko')
    .update({ status: 'DITOLAK', alasan_tolak: alasanTolak.value })
    .eq('id', tolakTarget.value.id);
  tokoPending.value = tokoPending.value.filter(
    (t) => t.id !== tolakTarget.value.id,
  );
  stats.value.tokoPending--;
  showTolakModal.value = false;
  prosesId.value = null;
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

  // Cek role admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();
  if (profile?.role !== 'admin') {
    router.push('/');
    return;
  }

  // Fetch paralel
  const [tokoPendingRes, orderRes, statsRes] = await Promise.all([
    supabase
      .from('toko')
      .select('*')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: true })
      .limit(10).throwOnError(),
    supabase
      .from('orders')
      .select('*, produk(nama_produk), toko(nama_toko)')
      .order('created_at', { ascending: false })
      .limit(8),
    Promise.all([
      supabase
        .from('toko')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'AKTIF'),
      supabase
        .from('toko')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PENDING'),
      supabase
        .from('produk')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'AKTIF'),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
    ]),
  ]);

  console.log(tokoPendingRes.error, orderRes, statsRes);

  tokoPending.value = tokoPendingRes.data ?? [];
  orderTerbaru.value = orderRes.data ?? [];
  loadingToko.value = false;
  loadingOrder.value = false;

  const [a, b, c, d] = statsRes;
  stats.value = {
    tokoAktif: a.count ?? 0,
    tokoPending: b.count ?? 0,
    totalProduk: c.count ?? 0,
    totalOrder: d.count ?? 0,
  };
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
.nav-links a:hover,
.nav-links .router-link-active {
  color: #2d5016;
  font-weight: 600;
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

.dashboard-header {
  background: linear-gradient(135deg, #1a2e0a, #2d5016);
  padding: 2.5rem 0;
}
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 2rem;
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
}

.dashboard-body {
  padding: 2rem 2rem 4rem;
}

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
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.stat-card.highlight-yellow {
  border-color: #fde68a;
  background: #fffbeb;
}
.stat-icon {
  font-size: 1.75rem;
  flex-shrink: 0;
}
.stat-num {
  font-family: 'Lora', serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a2e0a;
}
.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.1rem;
}

.dashboard-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
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

.loading-mini {
  display: flex;
  justify-content: center;
  padding: 2rem;
}
.spinner-sm {
  width: 24px;
  height: 24px;
  border: 2px solid #e8e0d0;
  border-top-color: #2d5016;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* TOKO LIST */
.toko-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.toko-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 12px;
}
.toko-nama {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a2e0a;
  margin-bottom: 0.2rem;
}
.toko-meta {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.15rem;
}
.toko-date {
  font-size: 0.7rem;
  color: #9ca3af;
}
.toko-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-shrink: 0;
}
.btn-acc {
  background: #2d5016;
  color: #f5edd6;
  border: none;
  padding: 0.45rem 0.85rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}
.btn-acc:hover:not(:disabled) {
  background: #3a6b1e;
}
.btn-acc:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-tolak {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  padding: 0.45rem 0.85rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}
.btn-tolak:hover:not(:disabled) {
  background: #fee2e2;
}
.btn-tolak:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ORDER LIST */
.order-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
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
  font-size: 0.85rem;
  font-weight: 600;
  color: #1a2e0a;
  margin-bottom: 0.15rem;
}
.order-detail {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.1rem;
}
.order-date {
  font-size: 0.7rem;
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
  margin-bottom: 0.3rem;
}

.badge {
  display: inline-block;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  font-size: 0.68rem;
  font-weight: 600;
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

.empty-mini {
  text-align: center;
  padding: 2rem 1rem;
}
.empty-mini p {
  font-size: 0.875rem;
  color: #6b7280;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 2rem;
}
.modal {
  background: #fff;
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}
.modal-title {
  font-family: 'Lora', serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #1a2e0a;
  margin-bottom: 0.3rem;
}
.modal-sub {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1.25rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1.25rem;
}
label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #374151;
}
textarea {
  padding: 0.75rem 1rem;
  border: 1.5px solid #d1d5db;
  border-radius: 10px;
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
}
textarea:focus {
  outline: none;
  border-color: #2d5016;
}
.modal-actions {
  display: flex;
  gap: 0.75rem;
}
.btn-cancel {
  flex: 1;
  background: #f3f4f6;
  color: #374151;
  border: 1.5px solid #d1d5db;
  padding: 0.75rem;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
}
.btn-cancel:hover {
  background: #e5e7eb;
}
.btn-tolak-confirm {
  flex: 1;
  background: #dc2626;
  color: #fff;
  border: none;
  padding: 0.75rem;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-tolak-confirm:hover:not(:disabled) {
  background: #b91c1c;
}
.btn-tolak-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .toko-item {
    flex-direction: column;
  }
  .toko-actions {
    flex-direction: row;
  }
}
</style>
