<template>
  <LayoutAdmin>
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">Moderasi Produk</h1>
        <p class="page-sub">Semua produk dari seluruh toko</p>
      </div>
    </div>

    <div class="container main-content">
      <div class="toolbar">
        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input
            v-model="keyword"
            type="text"
            placeholder="Cari nama produk atau toko..."
            class="search-input"
            @input="onSearch"
          />
          <button v-if="keyword" class="search-clear" @click="clearSearch">
            ✕
          </button>
        </div>
        <div class="filter-group">
          <select
            v-model="filterKategori"
            @change="fetchProduk"
            class="filter-select"
          >
            <option value="">Semua Kategori</option>
            <option v-for="k in kategoriList" :key="k.slug" :value="k.slug">
              {{ k.label }}
            </option>
          </select>
          <select
            v-model="filterStatus"
            @change="fetchProduk"
            class="filter-select"
          >
            <option value="">Semua Status</option>
            <option value="AKTIF">Aktif</option>
            <option value="HABIS">Stok Habis</option>
            <option value="DISEMBUNYIKAN">Disembunyikan</option>
          </select>
        </div>
      </div>

      <p class="result-info" v-if="!loading">
        Menampilkan <strong>{{ produkList.length }}</strong> produk
      </p>

      <div v-if="loading" class="loading-wrap"><div class="spinner"></div></div>

      <div v-else-if="produkList.length" class="produk-table-wrap">
        <table class="produk-table">
          <thead>
            <tr>
              <th>Produk</th>
              <th>Toko</th>
              <th>Kategori</th>
              <th>Harga</th>
              <th>Stok</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in produkList" :key="p.id">
              <td>
                <div class="produk-cell">
                  <img
                    :src="p.foto_url"
                    :alt="p.nama_produk"
                    class="produk-thumb"
                  />
                  <span class="produk-nama">{{ p.nama_produk }}</span>
                </div>
              </td>
              <td>
                <RouterLink
                  :to="`/toko/${p.toko?.id}`"
                  class="toko-link"
                  target="_blank"
                  >{{ p.toko?.nama_toko }}</RouterLink
                >
              </td>
              <td>
                <span class="kat-pill">{{ labelKategori(p.kategori) }}</span>
              </td>
              <td class="harga-cell">{{ formatRupiah(p.harga) }}</td>
              <td>
                <span
                  class="stok-text"
                  :class="{
                    habis: p.stok === 0,
                    low: p.stok <= 5 && p.stok > 0,
                  }"
                  >{{ p.stok }}</span
                >
              </td>
              <td>
                <span class="badge" :class="badgeProduk(p.status)">{{
                  p.status
                }}</span>
              </td>
              <td>
                <div class="aksi-cell">
                  <button
                    class="btn-icon"
                    @click="toggleSembunyikan(p)"
                    :disabled="prosesId === p.id"
                    :title="
                      p.status === 'DISEMBUNYIKAN' ? 'Tampilkan' : 'Sembunyikan'
                    "
                  >
                    {{ p.status === 'DISEMBUNYIKAN' ? '👁️' : '🙈' }}
                  </button>
                  <RouterLink
                    :to="`/produk/${p.id}`"
                    class="btn-icon-link"
                    target="_blank"
                    title="Lihat produk"
                    >🔗</RouterLink
                  >
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-state">
        <span>📦</span>
        <h3>Tidak ada produk ditemukan</h3>
        <p>Coba ubah filter atau kata kunci.</p>
      </div>
    </div>
  </LayoutAdmin>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/lib/supabase';
import LayoutAdmin from '@/layouts/LayoutAdmin.vue';
import { formatRupiah } from '@/lib/utils';
import { KATEGORI, labelKategori } from '@/lib/kategori';

const router = useRouter();
const loading = ref(true);
const produkList = ref([]);
const keyword = ref('');
const filterKategori = ref('');
const filterStatus = ref('');
const prosesId = ref(null);
let searchTimeout = null;

const kategoriList = KATEGORI;

const badgeProduk = (s) => ({
  'badge-aktif': s === 'AKTIF',
  'badge-habis': s === 'HABIS',
  'badge-hidden': s === 'DISEMBUNYIKAN',
});

const fetchProduk = async () => {
  loading.value = true;
  let query = supabase
    .from('produk')
    .select('*, toko(id, nama_toko)')
    .order('created_at', { ascending: false });
  if (filterKategori.value) query = query.eq('kategori', filterKategori.value);
  if (filterStatus.value) query = query.eq('status', filterStatus.value);
  if (keyword.value.trim())
    query = query.ilike('nama_produk', `%${keyword.value.trim()}%`);
  const { data } = await query;
  produkList.value = data ?? [];
  loading.value = false;
};

const onSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(fetchProduk, 400);
};
const clearSearch = () => {
  keyword.value = '';
  fetchProduk();
};

const toggleSembunyikan = async (p) => {
  prosesId.value = p.id;
  const statusBaru = p.status === 'DISEMBUNYIKAN' ? 'AKTIF' : 'DISEMBUNYIKAN';
  const statusUpdate = await supabase
    .from('produk')
    .update({ status: statusBaru })
    .eq('id', p.id);
  console.log(statusUpdate, statusBaru, p.id);
  p.status = statusBaru;
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
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();
  if (profile?.role !== 'admin') {
    router.push('/');
    return;
  }
  fetchProduk();
});
</script>

<style scoped>
.page-header {
  background: linear-gradient(135deg, #1a2e0a, #2d5016);
  padding: 2.5rem 0;
}
.container {
  max-width: 1100px;
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
.toolbar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  align-items: center;
}
.search-wrap {
  position: relative;
  flex: 1;
  min-width: 200px;
}
.search-icon {
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.9rem;
}
.search-input {
  width: 100%;
  padding: 0.65rem 2.5rem 0.65rem 2.4rem;
  border: 1.5px solid #d1d5db;
  border-radius: 10px;
  font-size: 0.875rem;
  font-family: inherit;
  background: #fff;
  color: #111827;
  transition: border-color 0.2s;
}
.search-input:focus {
  outline: none;
  border-color: #2d5016;
}
.search-clear {
  position: absolute;
  right: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
}
.filter-group {
  display: flex;
  gap: 0.5rem;
}
.filter-select {
  padding: 0.6rem 0.85rem;
  border: 1.5px solid #d1d5db;
  border-radius: 10px;
  font-size: 0.82rem;
  font-family: inherit;
  background: #fff;
  color: #374151;
  cursor: pointer;
}
.filter-select:focus {
  outline: none;
  border-color: #2d5016;
}
.result-info {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1.25rem;
}
.result-info strong {
  color: #1a2e0a;
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
.produk-table-wrap {
  background: #fff;
  border: 1px solid #e8e0d0;
  border-radius: 16px;
  overflow: hidden;
  overflow-x: auto;
}
.produk-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}
.produk-table thead {
  background: #f9fafb;
  border-bottom: 1px solid #e8e0d0;
}
.produk-table th {
  padding: 0.85rem 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}
.produk-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #f0ede6;
  vertical-align: middle;
}
.produk-table tr:last-child td {
  border-bottom: none;
}
.produk-table tr:hover td {
  background: #fdfaf4;
}
.produk-cell {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}
.produk-thumb {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  background: #f3f4f6;
}
.produk-nama {
  font-weight: 600;
  color: #1a2e0a;
  font-size: 0.85rem;
  max-width: 180px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.toko-link {
  color: #2d5016;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.82rem;
}
.toko-link:hover {
  text-decoration: underline;
}
.kat-pill {
  background: #f0f7e8;
  color: #2d5016;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 600;
  white-space: nowrap;
}
.harga-cell {
  font-weight: 700;
  color: #2d5016;
  white-space: nowrap;
}
.stok-text {
  font-weight: 600;
  color: #374151;
}
.stok-text.habis {
  color: #dc2626;
}
.stok-text.low {
  color: #d97706;
}
.badge {
  display: inline-block;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
}
.badge-aktif {
  background: #dcfce7;
  color: #166534;
}
.badge-habis {
  background: #fee2e2;
  color: #991b1b;
}
.badge-hidden {
  background: #f3f4f6;
  color: #6b7280;
}
.aksi-cell {
  display: flex;
  gap: 0.4rem;
  align-items: center;
}
.btn-icon {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  padding: 0.35rem 0.55rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-icon:hover:not(:disabled) {
  background: #f3f4f6;
}
.btn-icon:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.btn-icon-link {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  padding: 0.35rem 0.55rem;
  border-radius: 6px;
  font-size: 0.9rem;
  text-decoration: none;
  transition: background 0.2s;
}
.btn-icon-link:hover {
  background: #dbeafe;
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
  .toolbar {
    flex-direction: column;
  }
  .filter-group {
    flex-wrap: wrap;
  }
}
</style>
