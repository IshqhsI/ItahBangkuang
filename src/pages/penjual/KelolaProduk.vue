<template>
  <LayoutPenjual :statusToko="statusToko">
    <div class="page-header">
      <div class="container">
        <div class="header-inner">
          <div>
            <h1 class="page-title">Produk Saya</h1>
            <p class="page-sub">Kelola semua produk tokomu</p>
          </div>
          <RouterLink to="/toko/produk/tambah" class="btn-primary"
            >+ Tambah Produk</RouterLink
          >
        </div>
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
          @click="setFilter(f.val)"
        >
          {{ f.label }}
          <span class="tab-count" v-if="hitungFilter(f.val) > 0">{{
            hitungFilter(f.val)
          }}</span>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="produk-grid">
        <div v-for="n in 6" :key="n" class="skeleton"></div>
      </div>

      <!-- Grid produk -->
      <div v-else-if="produkFiltered.length" class="produk-grid">
        <div v-for="p in produkFiltered" :key="p.id" class="produk-card">
          <div class="produk-foto-wrap">
            <img :src="p.foto_url" :alt="p.nama_produk" class="produk-foto" />
            <span class="kat-badge">{{ labelKategori(p.kategori) }}</span>
            <span v-if="p.status === 'DISEMBUNYIKAN'" class="hidden-badge"
              >Disembunyikan</span
            >
          </div>
          <div class="produk-body">
            <h3 class="produk-nama">{{ p.nama_produk }}</h3>
            <p class="produk-harga">{{ formatRupiah(p.harga) }}</p>
            <div class="produk-meta-row">
              <span
                class="stok-badge"
                :class="{ habis: p.stok === 0, low: p.stok <= 5 && p.stok > 0 }"
              >
                {{ p.stok === 0 ? 'Stok Habis' : `Stok: ${p.stok}` }}
              </span>
            </div>
          </div>
          <div class="produk-actions">
            <RouterLink :to="`/toko/produk/${p.id}/edit`" class="btn-edit"
              >✏️ Edit</RouterLink
            >
            <button
              class="btn-toggle"
              @click="toggleStatus(p)"
              :disabled="prosesId === p.id"
            >
              {{
                p.status === 'DISEMBUNYIKAN' ? '👁️ Tampilkan' : '🙈 Sembunyikan'
              }}
            </button>
            <button
              class="btn-hapus"
              @click="bukaHapusModal(p)"
              :disabled="prosesId === p.id"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-else class="empty-state">
        <span>📭</span>
        <h3>
          {{
            filterAktif === 'semua'
              ? 'Belum ada produk'
              : 'Tidak ada produk di kategori ini'
          }}
        </h3>
        <p>Mulai jualan dengan menambahkan produk pertamamu!</p>
        <RouterLink
          to="/toko/produk/tambah"
          class="btn-primary"
          style="margin-top: 1rem"
          >+ Tambah Produk</RouterLink
        >
      </div>
    </div>

    <!-- Modal Konfirmasi Hapus -->
    <div
      class="modal-overlay"
      v-if="showHapusModal"
      @click.self="showHapusModal = false"
    >
      <div class="modal">
        <span class="modal-icon">🗑️</span>
        <h3 class="modal-title">Hapus Produk?</h3>
        <p class="modal-sub">
          Produk "<strong>{{ hapusTarget?.nama_produk }}</strong
          >" akan dihapus permanen dan tidak bisa dikembalikan.
        </p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="showHapusModal = false">
            Batal
          </button>
          <button
            class="btn-hapus-confirm"
            @click="konfirmasiHapus"
            :disabled="prosesId"
          >
            {{ prosesId ? 'Menghapus...' : 'Ya, Hapus' }}
          </button>
        </div>
      </div>
    </div>
  </LayoutPenjual>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/lib/supabase';
import LayoutPenjual from '@/layouts/LayoutPenjual.vue';
import { formatRupiah } from '@/lib/utils';

const router = useRouter();
const loading = ref(true);
const produkList = ref([]);
const filterAktif = ref('semua');
const prosesId = ref(null);
const showHapusModal = ref(false);
const hapusTarget = ref(null);
const statusToko = ref(null);

const filterList = [
  { val: 'semua', label: 'Semua' },
  { val: 'AKTIF', label: 'Aktif' },
  { val: 'HABIS', label: 'Stok Habis' },
  { val: 'DISEMBUNYIKAN', label: 'Disembunyikan' },
];

const kategoriList = [
  { slug: 'kue_basah', nama: 'Kue Basah' },
  { slug: 'kue_kering', nama: 'Kue Kering' },
  { slug: 'makanan', nama: 'Makanan' },
  { slug: 'minuman', nama: 'Minuman' },
];

const labelKategori = (slug) =>
  kategoriList.find((k) => k.slug === slug)?.nama ?? slug;

const produkFiltered = computed(() => {
  if (filterAktif.value === 'semua') return produkList.value;
  return produkList.value.filter((p) => p.status === filterAktif.value);
});

const hitungFilter = (val) => {
  if (val === 'semua') return produkList.value.length;
  return produkList.value.filter((p) => p.status === val).length;
};

const setFilter = (val) => {
  filterAktif.value = val;
};

const toggleStatus = async (p) => {
  prosesId.value = p.id;
  const statusBaru = p.status === 'DISEMBUNYIKAN' ? 'AKTIF' : 'DISEMBUNYIKAN';
  await supabase.from('produk').update({ status: statusBaru }).eq('id', p.id);
  p.status = statusBaru;
  prosesId.value = null;
};

const bukaHapusModal = (p) => {
  hapusTarget.value = p;
  showHapusModal.value = true;
};

const konfirmasiHapus = async () => {
  prosesId.value = hapusTarget.value.id;
  await supabase.from('produk').delete().eq('id', hapusTarget.value.id);
  produkList.value = produkList.value.filter(
    (p) => p.id !== hapusTarget.value.id,
  );
  showHapusModal.value = false;
  prosesId.value = null;
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
  
  statusToko.value = toko.status;

  const { data } = await supabase
    .from('produk')
    .select('*')
    .eq('toko_id', toko.id)
    .order('created_at', { ascending: false });
  produkList.value = data ?? [];
  loading.value = false;
});
</script>

<style scoped>

.page-header {
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
  gap: 1rem;
  flex-wrap: wrap;
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

.btn-primary {
  display: inline-block;
  background: #f5edd6;
  color: #2d5016;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
}
.btn-primary:hover {
  background: #fff;
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
  background: #f0f7e8;
  color: #2d5016;
}

.produk-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.25rem;
}
.skeleton {
  background: linear-gradient(90deg, #f3f4f6 25%, #e9eaeb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  border-radius: 16px;
  height: 300px;
  animation: shimmer 1.4s ease-in-out infinite;
}
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.produk-card {
  background: #fff;
  border: 1px solid #e8e0d0;
  border-radius: 16px;
  overflow: hidden;
  transition: box-shadow 0.2s;
}
.produk-card:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
}
.produk-foto-wrap {
  position: relative;
}
.produk-foto {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
  background: #f3f4f6;
}
.kat-badge {
  position: absolute;
  top: 0.6rem;
  left: 0.6rem;
  background: rgba(45, 80, 22, 0.88);
  color: #f5edd6;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  font-size: 0.67rem;
  font-weight: 600;
}
.hidden-badge {
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  background: rgba(107, 114, 128, 0.88);
  color: #fff;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  font-size: 0.67rem;
  font-weight: 600;
}

.produk-body {
  padding: 0.85rem 0.85rem 0.5rem;
}
.produk-nama {
  font-weight: 600;
  font-size: 0.9rem;
  color: #1a2e0a;
  margin-bottom: 0.25rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.produk-harga {
  font-weight: 700;
  color: #2d5016;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}
.produk-meta-row {
  display: flex;
  align-items: center;
}
.stok-badge {
  font-size: 0.72rem;
  font-weight: 600;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
}
.stok-badge.habis {
  color: #dc2626;
  background: #fee2e2;
}
.stok-badge.low {
  color: #d97706;
  background: #fef9c3;
}

.produk-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 0.85rem;
  border-top: 1px solid #f0ede6;
}
.btn-edit {
  flex: 1;
  text-align: center;
  background: #f0f7e8;
  color: #2d5016;
  border: 1px solid #a8c97f;
  padding: 0.5rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.2s;
}
.btn-edit:hover {
  background: #e0f0cc;
}
.btn-toggle {
  flex: 1;
  background: #f9fafb;
  color: #374151;
  border: 1px solid #e5e7eb;
  padding: 0.5rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-toggle:hover:not(:disabled) {
  background: #f3f4f6;
}
.btn-toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-hapus {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  padding: 0.5rem 0.65rem;
  border-radius: 8px;
  font-size: 0.82rem;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-hapus:hover:not(:disabled) {
  background: #fee2e2;
}
.btn-hapus:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  font-size: 1.3rem;
  color: #1a2e0a;
}
.empty-state p {
  color: #6b7280;
  font-size: 0.875rem;
}

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
  max-width: 380px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}
.modal-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.75rem;
}
.modal-title {
  font-family: 'Lora', serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #1a2e0a;
  margin-bottom: 0.5rem;
}
.modal-sub {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 1.5rem;
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
.btn-hapus-confirm {
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
.btn-hapus-confirm:hover:not(:disabled) {
  background: #b91c1c;
}
.btn-hapus-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  .hamburger {
    display: block;
  }
  .produk-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 400px) {
  .produk-grid {
    grid-template-columns: 1fr;
  }
}
</style>
