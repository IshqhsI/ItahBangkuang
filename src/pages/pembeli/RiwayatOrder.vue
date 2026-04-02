<template>
  <div class="page">
    <nav class="navbar">
      <RouterLink to="/" class="nav-brand">🛒 ItahBangkuang</RouterLink>
      <div class="nav-links">
        <RouterLink to="/produk">Semua Produk</RouterLink>
        <RouterLink to="/riwayat" class="active">Pesanan Saya</RouterLink>
        <button class="btn-nav-outline" @click="logout">Keluar</button>
      </div>
      <button class="hamburger" @click="menuOpen = !menuOpen">☰</button>
    </nav>
    <div class="mobile-menu" v-if="menuOpen">
      <RouterLink to="/" @click="menuOpen = false">Beranda</RouterLink>
      <RouterLink to="/produk" @click="menuOpen = false"
        >Semua Produk</RouterLink
      >
      <RouterLink to="/riwayat" @click="menuOpen = false"
        >Pesanan Saya</RouterLink
      >
      <button @click="logout">Keluar</button>
    </div>

    <div class="page-header">
      <div class="container">
        <h1 class="page-title">Pesanan Saya</h1>
        <p class="page-sub">Riwayat semua pesananmu</p>
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

      <div v-if="loading" class="loading-wrap">
        <div class="spinner"></div>
      </div>

      <div v-else-if="orderFiltered.length" class="order-list">
        <div v-for="o in orderFiltered" :key="o.id" class="order-card">
          <div class="order-header">
            <span class="badge" :class="badgeClass(o.status)">{{
              labelStatus(o.status)
            }}</span>
            <span class="order-date">{{ formatTanggal(o.created_at) }}</span>
          </div>

          <div class="order-body">
            <RouterLink :to="`/produk/${o.produk_id}`" class="order-produk">
              <img
                :src="o.produk?.foto_url"
                :alt="o.produk?.nama_produk"
                class="order-foto"
              />
              <div class="order-produk-info">
                <p class="order-toko">🏪 {{ o.toko?.nama_toko }}</p>
                <p class="order-nama">{{ o.produk?.nama_produk }}</p>
                <p class="order-jumlah">
                  {{ o.jumlah }} pcs × {{ formatRupiah(o.produk?.harga) }}
                </p>
              </div>
            </RouterLink>

            <div class="order-kanan">
              <div class="order-metode" :class="{ cod: o.metode === 'COD' }">
                {{ o.metode === 'COD' ? '🤝 COD' : '🏦 Transfer' }}
              </div>
              <p class="order-total">{{ formatRupiah(o.total_harga) }}</p>
            </div>
          </div>

          <div class="order-footer" v-if="o.catatan">
            <span class="catatan-label">📝 Catatan:</span>
            <span class="catatan-val">{{ o.catatan }}</span>
          </div>

          <div class="order-actions">
            <button class="btn-wa" @click="chatPenjual(o)">
              💬 Hubungi Penjual
            </button>
            <RouterLink :to="`/produk/${o.produk_id}`" class="btn-beli-lagi">
              🔁 Beli Lagi
            </RouterLink>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <span>🛒</span>
        <h3>
          {{
            filterAktif === 'semua'
              ? 'Belum ada pesanan'
              : `Tidak ada pesanan ${labelStatus(filterAktif).toLowerCase()}`
          }}
        </h3>
        <p>Yuk mulai belanja produk lokal kecamatan!</p>
        <RouterLink to="/produk" class="btn-belanja">Lihat Produk →</RouterLink>
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

const chatPenjual = (o) => {
  const wa = o.toko?.nomor_wa?.replace(/^(0|62)/, '') ?? '';
  const pesan = `Halo, saya ingin tanya mengenai pesanan *${o.produk?.nama_produk}* (${o.jumlah} pcs) yang saya buat via ItahBangkuang.`;
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

  const { data } = await supabase
    .from('orders')
    .select(
      '*, produk(nama_produk, foto_url, harga), toko(nama_toko, nomor_wa)',
    )
    .eq('pembeli_id', session.user.id)
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
  max-width: 720px;
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
.order-date {
  font-size: 0.75rem;
  color: #9ca3af;
}

.order-body {
  padding: 1.1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}
.order-produk {
  display: flex;
  gap: 0.85rem;
  text-decoration: none;
  color: inherit;
  flex: 1;
  transition: opacity 0.2s;
}
.order-produk:hover {
  opacity: 0.8;
}
.order-foto {
  width: 64px;
  height: 64px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
  background: #f3f4f6;
}
.order-toko {
  font-size: 0.7rem;
  color: #9ca3af;
  margin-bottom: 0.2rem;
}
.order-nama {
  font-weight: 600;
  font-size: 0.875rem;
  color: #1a2e0a;
  margin-bottom: 0.2rem;
}
.order-jumlah {
  font-size: 0.75rem;
  color: #6b7280;
}
.order-kanan {
  text-align: right;
  flex-shrink: 0;
}
.order-metode {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  margin-bottom: 0.4rem;
  display: inline-block;
}
.order-metode.cod {
  background: #eff6ff;
  color: #1e40af;
}
.order-total {
  font-family: 'Lora', serif;
  font-size: 1rem;
  font-weight: 700;
  color: #2d5016;
}

.order-footer {
  padding: 0.65rem 1.25rem;
  background: #fdfaf4;
  border-top: 1px solid #f0ede6;
  font-size: 0.78rem;
  color: #6b7280;
}
.catatan-label {
  font-weight: 600;
  margin-right: 0.3rem;
}

.order-actions {
  display: flex;
  gap: 0.75rem;
  padding: 0.85rem 1.25rem;
  border-top: 1px solid #f0ede6;
}
.btn-wa {
  flex: 1;
  background: #f0fff4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
  padding: 0.55rem 0.85rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s;
  text-align: center;
}
.btn-wa:hover {
  background: #dcfce7;
}
.btn-beli-lagi {
  flex: 1;
  background: #f0f7e8;
  color: #2d5016;
  border: 1px solid #a8c97f;
  padding: 0.55rem 0.85rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: inherit;
  text-decoration: none;
  transition: background 0.2s;
  text-align: center;
  display: block;
}
.btn-beli-lagi:hover {
  background: #e0f0cc;
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
.btn-belanja {
  margin-top: 0.5rem;
  display: inline-block;
  background: #2d5016;
  color: #f5edd6;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  transition: background 0.2s;
}
.btn-belanja:hover {
  background: #3a6b1e;
}

@media (max-width: 640px) {
  .nav-links {
    display: none;
  }
  .hamburger {
    display: block;
  }
  .order-body {
    flex-direction: column;
  }
  .order-kanan {
    text-align: left;
  }
}
</style>
