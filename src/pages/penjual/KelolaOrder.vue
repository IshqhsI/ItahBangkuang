<template>
  <div class="page">
    <nav class="navbar">
      <RouterLink to="/" class="nav-brand">🛒 ItahBangkuang</RouterLink>
      <div class="nav-links">
        <RouterLink to="/toko/dashboard">Dashboard</RouterLink>
        <RouterLink to="/toko/produk">Produk Saya</RouterLink>
        <RouterLink to="/toko/order" class="active">Order Masuk</RouterLink>
        <RouterLink to="/toko/profil">Profil Toko</RouterLink>
        <button class="btn-nav-outline" @click="logout">Keluar</button>
      </div>
      <button class="hamburger" @click="menuOpen = !menuOpen">☰</button>
    </nav>
    <div class="mobile-menu" v-if="menuOpen">
      <RouterLink to="/toko/dashboard" @click="menuOpen = false"
        >Dashboard</RouterLink
      >
      <RouterLink to="/toko/produk" @click="menuOpen = false"
        >Produk Saya</RouterLink
      >
      <RouterLink to="/toko/order" @click="menuOpen = false"
        >Order Masuk</RouterLink
      >
      <RouterLink to="/toko/profil" @click="menuOpen = false"
        >Profil Toko</RouterLink
      >
      <button @click="logout">Keluar</button>
    </div>

    <div class="page-header">
      <div class="container">
        <h1 class="page-title">Order Masuk</h1>
        <p class="page-sub">Kelola semua pesanan dari pembeli</p>
      </div>
    </div>

    <div class="container main-content">
      <!-- Filter tabs -->
      <div class="filter-tabs">
        <button
          v-for="f in filterList"
          :key="f.val"
          class="filter-tab"
          :class="{ active: filterAktif === f.val }"
          @click="filterAktif = f.val"
        >
          {{ f.label }}
          <span class="tab-count" v-if="hitungFilter(f.val) > 0">{{
            hitungFilter(f.val)
          }}</span>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-wrap">
        <div class="spinner"></div>
      </div>

      <!-- Order list -->
      <div v-else-if="orderFiltered.length" class="order-list">
        <div v-for="o in orderFiltered" :key="o.id" class="order-card">
          <div class="order-header">
            <div class="order-header-left">
              <span class="badge" :class="badgeClass(o.status)">{{
                labelStatus(o.status)
              }}</span>
              <span class="order-date">{{ formatTanggal(o.created_at) }}</span>
            </div>
            <span class="order-metode" :class="{ cod: o.metode === 'COD' }">
              {{ o.metode === 'COD' ? '🤝 COD' : '🏦 Transfer' }}
            </span>
          </div>

          <div class="order-body">
            <!-- Info produk -->
            <div class="order-produk-info">
              <img
                :src="o.produk?.foto_url"
                :alt="o.produk?.nama_produk"
                class="order-foto"
              />
              <div>
                <p class="order-produk-nama">{{ o.produk?.nama_produk }}</p>
                <p class="order-jumlah">
                  {{ o.jumlah }} pcs × {{ formatRupiah(o.produk?.harga) }}
                </p>
              </div>
            </div>

            <!-- Info pembeli -->
            <div class="order-pembeli-info">
              <div class="pembeli-row">
                <span class="pembeli-icon">👤</span>
                <div>
                  <p class="pembeli-label">Nama Pemesan</p>
                  <p class="pembeli-val">{{ o.nama_pemesan }}</p>
                </div>
              </div>
              <div class="pembeli-row">
                <span class="pembeli-icon">📍</span>
                <div>
                  <p class="pembeli-label">Alamat</p>
                  <p class="pembeli-val">{{ o.alamat }}</p>
                </div>
              </div>
              <div class="pembeli-row" v-if="o.catatan">
                <span class="pembeli-icon">📝</span>
                <div>
                  <p class="pembeli-label">Catatan</p>
                  <p class="pembeli-val">{{ o.catatan }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="order-footer">
            <div class="order-total-wrap">
              <span class="total-label">Total</span>
              <span class="total-val">{{ formatRupiah(o.total_harga) }}</span>
            </div>

            <div class="order-actions">
              <!-- Tombol WA pembeli -->
              <button class="btn-wa" @click="chatPembeli(o)">
                💬 WA Pembeli
              </button>

              <!-- Update status -->
              <template v-if="o.status === 'MENUNGGU'">
                <button
                  class="btn-konfirmasi"
                  @click="updateStatus(o, 'DIKONFIRMASI')"
                  :disabled="prosesId === o.id"
                >
                  {{ prosesId === o.id ? '...' : '✅ Konfirmasi' }}
                </button>
                <button
                  class="btn-batal"
                  @click="updateStatus(o, 'DIBATALKAN')"
                  :disabled="prosesId === o.id"
                >
                  Batalkan
                </button>
              </template>

              <template v-if="o.status === 'DIKONFIRMASI'">
                <button
                  class="btn-selesai"
                  @click="updateStatus(o, 'SELESAI')"
                  :disabled="prosesId === o.id"
                >
                  {{ prosesId === o.id ? '...' : '🎉 Tandai Selesai' }}
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-else class="empty-state">
        <span>📭</span>
        <h3>
          Belum ada order
          {{
            filterAktif !== 'semua'
              ? labelStatus(filterAktif).toLowerCase()
              : ''
          }}
        </h3>
        <p>Share link toko kamu agar pembeli menemukanmu!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/lib/supabase';

const router = useRouter();
const menuOpen = ref(false);
const loading = ref(true);
const orderList = ref([]);
const filterAktif = ref('semua');
const prosesId = ref(null);

const filterList = [
  { val: 'semua', label: 'Semua' },
  { val: 'MENUNGGU', label: '⏳ Menunggu' },
  { val: 'DIKONFIRMASI', label: '✅ Dikonfirmasi' },
  { val: 'SELESAI', label: '🎉 Selesai' },
  { val: 'DIBATALKAN', label: '❌ Dibatalkan' },
];

const labelStatus = (s) =>
  ({
    MENUNGGU: 'Menunggu',
    DIKONFIRMASI: 'Dikonfirmasi',
    SELESAI: 'Selesai',
    DIBATALKAN: 'Dibatalkan',
  })[s] ?? s;

const badgeClass = (s) => ({
  'badge-menunggu': s === 'MENUNGGU',
  'badge-konfirmasi': s === 'DIKONFIRMASI',
  'badge-selesai': s === 'SELESAI',
  'badge-batal': s === 'DIBATALKAN',
});

const formatRupiah = (a) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(a ?? 0);

const formatTanggal = (iso) =>
  new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const orderFiltered = computed(() => {
  if (filterAktif.value === 'semua') return orderList.value;
  return orderList.value.filter((o) => o.status === filterAktif.value);
});

const hitungFilter = (val) => {
  if (val === 'semua') return orderList.value.length;
  return orderList.value.filter((o) => o.status === val).length;
};

const updateStatus = async (order, statusBaru) => {
  prosesId.value = order.id;
  await supabase
    .from('orders')
    .update({ status: statusBaru })
    .eq('id', order.id);
  order.status = statusBaru;
  prosesId.value = null;
};

const chatPembeli = (o) => {
  const wa = o.nomor_wa_pembeli?.replace(/^0/, '') ?? '';
  const pesan = `Halo ${o.nama_pemesan}, saya dari toko ItahBangkuang terkait pesanan *${o.produk?.nama_produk}* (${o.jumlah} pcs). `;
  window.open(
    `https://wa.me/62${wa}?text=${encodeURIComponent(pesan)}`,
    '_blank',
  );
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

  const { data: toko } = await supabase
    .from('toko')
    .select('id, status')
    .eq('user_id', session.user.id)
    .single();
  if (!toko || toko.status !== 'AKTIF') {
    router.push('/toko/dashboard');
    return;
  }

  const { data } = await supabase
    .from('orders')
    .select('*, produk(nama_produk, foto_url, harga)')
    .eq('toko_id', toko.id)
    .order('created_at', { ascending: false });

  orderList.value = data ?? [];
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
.nav-links a:hover,
.nav-links a.active {
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

.page-header {
  background: linear-gradient(135deg, #2d5016, #3a6b1e);
  padding: 2.5rem 0;
}
.container {
  max-width: 860px;
  margin: 0 auto;
  padding: 0 2rem;
}
.page-title {
  font-family: 'Lora', serif;
  font-size: 2rem;
  font-weight: 700;
  color: #f5edd6;
  margin-bottom: 0.25rem;
}
.page-sub {
  color: #a8c97f;
  font-size: 0.875rem;
}

.main-content {
  padding: 2rem 2rem 4rem;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.75rem;
  flex-wrap: wrap;
}
.filter-tab {
  padding: 0.45rem 1rem;
  border: 1.5px solid #e8e0d0;
  border-radius: 999px;
  background: #fff;
  color: #6b7280;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.filter-tab:hover {
  border-color: #a8c97f;
  color: #2d5016;
}
.filter-tab.active {
  border-color: #2d5016;
  background: #2d5016;
  color: #f5edd6;
}
.tab-count {
  background: rgba(255, 255, 255, 0.25);
  padding: 0.05rem 0.4rem;
  border-radius: 999px;
  font-size: 0.72rem;
}
.filter-tab:not(.active) .tab-count {
  background: #fef9c3;
  color: #92400e;
}

.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 4rem;
}
.spinner {
  width: 32px;
  height: 32px;
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

.order-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.order-card {
  background: #fff;
  border: 1px solid #e8e0d0;
  border-radius: 16px;
  overflow: hidden;
}

.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.25rem;
  background: #fdfaf4;
  border-bottom: 1px solid #f0ede6;
}
.order-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.order-date {
  font-size: 0.75rem;
  color: #9ca3af;
}
.order-metode {
  font-size: 0.78rem;
  font-weight: 600;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
}
.order-metode.cod {
  background: #eff6ff;
  color: #1e40af;
}

.order-body {
  padding: 1.25rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.order-produk-info {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}
.order-foto {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
  background: #f3f4f6;
}
.order-produk-nama {
  font-weight: 600;
  font-size: 0.9rem;
  color: #1a2e0a;
  margin-bottom: 0.25rem;
}
.order-jumlah {
  font-size: 0.78rem;
  color: #6b7280;
}

.order-pembeli-info {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}
.pembeli-row {
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
}
.pembeli-icon {
  font-size: 0.9rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}
.pembeli-label {
  font-size: 0.7rem;
  color: #9ca3af;
  margin-bottom: 0.1rem;
}
.pembeli-val {
  font-size: 0.82rem;
  font-weight: 500;
  color: #374151;
  line-height: 1.4;
}

.order-footer {
  padding: 0.85rem 1.25rem;
  border-top: 1px solid #f0ede6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.order-total-wrap {
  display: flex;
  flex-direction: column;
}
.total-label {
  font-size: 0.72rem;
  color: #9ca3af;
}
.total-val {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2d5016;
}

.order-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-wa {
  background: #f0fff4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
  padding: 0.5rem 0.85rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}
.btn-wa:hover {
  background: #dcfce7;
}
.btn-konfirmasi {
  background: #2d5016;
  color: #f5edd6;
  border: none;
  padding: 0.5rem 0.85rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}
.btn-konfirmasi:hover:not(:disabled) {
  background: #3a6b1e;
}
.btn-konfirmasi:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-selesai {
  background: #1e40af;
  color: #fff;
  border: none;
  padding: 0.5rem 0.85rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}
.btn-selesai:hover:not(:disabled) {
  background: #1e3a8a;
}
.btn-selesai:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-batal {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  padding: 0.5rem 0.85rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}
.btn-batal:hover:not(:disabled) {
  background: #fee2e2;
}
.btn-batal:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
  font-size: 0.72rem;
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

.empty-state {
  text-align: center;
  padding: 5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}
.empty-state span {
  font-size: 3rem;
}
.empty-state h3 {
  font-family: 'Lora', serif;
  font-size: 1.2rem;
  color: #1a2e0a;
}
.empty-state p {
  color: #6b7280;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  .hamburger {
    display: block;
  }
  .order-body {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .order-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
