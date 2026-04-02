<template>
 <LayoutAdmin>

    <!-- Semua konten halaman tetap sama, tidak ada yang berubah di sini -->
    <div v-if="loading" class="loading-wrap">
      <div class="spinner"></div>
      <p>Memuat dashboard...</p>
    </div>

    <template v-else>
      <div class="page-header">
      <div class="container">
        <h1 class="page-title">Kelola Toko</h1>
        <p class="page-sub">Verifikasi dan kelola semua toko</p>
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

      <!-- Search -->
      <div class="search-wrap">
        <span class="search-icon">🔍</span>
        <input
          v-model="keyword"
          type="text"
          placeholder="Cari nama toko atau alamat..."
          class="search-input"
        />
        <button v-if="keyword" class="search-clear" @click="keyword = ''">
          ✕
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-wrap">
        <div class="spinner"></div>
      </div>

      <!-- Toko list -->
      <div v-else-if="tokoFiltered.length" class="toko-list">
        <div v-for="t in tokoFiltered" :key="t.id" class="toko-card">
          <div class="toko-header">
            <div class="toko-foto-wrap">
              <img
                v-if="t.foto_toko"
                :src="t.foto_toko"
                :alt="t.nama_toko"
                class="toko-foto"
              />
              <div v-else class="toko-foto-placeholder">🏪</div>
            </div>
            <div class="toko-info">
              <div class="toko-nama-row">
                <h3 class="toko-nama">{{ t.nama_toko }}</h3>
                <span class="badge" :class="badgeClass(t.status)">{{
                  labelStatus(t.status)
                }}</span>
              </div>
              <p class="toko-meta">📍 {{ t.alamat }}</p>
              <p class="toko-meta">📞 +62{{ t.nomor_wa }}</p>
              <p class="toko-meta">
                👤 {{ t.profiles?.nama_lengkap || 'Tidak ada nama' }} ·
                {{ t.profiles?.email }}
              </p>
              <p class="toko-date">Daftar: {{ formatTanggal(t.created_at) }}</p>
            </div>
          </div>

          <div class="toko-desc" v-if="t.deskripsi">
            <p>{{ t.deskripsi }}</p>
          </div>

          <div v-if="t.alasan_tolak" class="alasan-box">
            <span class="alasan-label">Alasan penolakan sebelumnya:</span>
            <span class="alasan-text">"{{ t.alasan_tolak }}"</span>
          </div>

          <div class="toko-actions">
            <!-- Toko PENDING -->
            <template v-if="t.status === 'PENDING'">
              <button
                class="btn-acc"
                @click="accToko(t)"
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
            </template>

            <!-- Toko AKTIF -->
            <template v-else-if="t.status === 'AKTIF'">
              <button
                class="btn-blokir"
                @click="updateStatus(t, 'DIBLOKIR')"
                :disabled="prosesId === t.id"
              >
                🚫 Blokir
              </button>
            </template>

            <!-- Toko DITOLAK -->
            <template v-else-if="t.status === 'DITOLAK'">
              <button
                class="btn-acc"
                @click="accToko(t)"
                :disabled="prosesId === t.id"
              >
                ✅ ACC Ulang
              </button>
            </template>

            <!-- Toko DIBLOKIR -->
            <template v-else-if="t.status === 'DIBLOKIR'">
              <button
                class="btn-aktifkan"
                @click="updateStatus(t, 'AKTIF')"
                :disabled="prosesId === t.id"
              >
                ✅ Aktifkan
              </button>
            </template>

            <RouterLink :to="`/toko/${t.id}`" class="btn-lihat" target="_blank">
              👁️ Lihat Toko
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-else class="empty-state">
        <span>🏪</span>
        <h3>
          Tidak ada toko
          {{
            filterAktif !== 'semua'
              ? labelStatus(filterAktif).toLowerCase()
              : ''
          }}
        </h3>
        <p v-if="keyword">Coba hapus kata kunci pencarian.</p>
      </div>
    </div>

    <!-- Modal Tolak -->
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
          <label>Alasan Penolakan <span class="required">*</span></label>
          <textarea
            v-model="alasanTolak"
            rows="3"
            placeholder="Jelaskan alasan penolakan agar penjual bisa memperbaiki..."
            autofocus
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
    </template>

  </LayoutAdmin>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/lib/supabase';
import LayoutAdmin from '../../layouts/LayoutAdmin.vue';
import { formatRupiah, formatTanggal, badgeOrderClass } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()  
const router = useRouter();
const menuOpen = ref(false);
const loading = ref(true);
const tokoList = ref([]);
const filterAktif = ref('semua');
const keyword = ref('');
const prosesId = ref(null);
const showTolakModal = ref(false);
const tolakTarget = ref(null);
const alasanTolak = ref('');

const filterList = [
  { val: 'semua', label: 'Semua' },
  { val: 'PENDING', label: '⏳ Pending' },
  { val: 'AKTIF', label: '✅ Aktif' },
  { val: 'DITOLAK', label: '❌ Ditolak' },
  { val: 'DIBLOKIR', label: '🚫 Diblokir' },
];

const labelStatus = (s) =>
  ({
    PENDING: 'Pending',
    AKTIF: 'Aktif',
    DITOLAK: 'Ditolak',
    DIBLOKIR: 'Diblokir',
  })[s] ?? s;

const badgeClass = (s) => ({
  'badge-pending': s === 'PENDING',
  'badge-aktif': s === 'AKTIF',
  'badge-tolak': s === 'DITOLAK',
  'badge-blokir': s === 'DIBLOKIR',
});

const tokoFiltered = computed(() => {
  let list =
    filterAktif.value === 'semua'
      ? tokoList.value
      : tokoList.value.filter((t) => t.status === filterAktif.value);
  if (keyword.value.trim()) {
    const kw = keyword.value.toLowerCase();
    list = list.filter(
      (t) =>
        t.nama_toko.toLowerCase().includes(kw) ||
        t.alamat?.toLowerCase().includes(kw),
    );
  }
  return list;
});

const hitungFilter = (val) => {
  if (val === 'semua') return tokoList.value.length;
  return tokoList.value.filter((t) => t.status === val).length;
};

const setFilter = (val) => {
  filterAktif.value = val;
};

const accToko = async (t) => {
  prosesId.value = t.id;
  await supabase
    .from('toko')
    .update({ status: 'AKTIF', alasan_tolak: null })
    .eq('id', t.id);
  t.status = 'AKTIF';
  t.alasan_tolak = null;
  prosesId.value = null;
};

const updateStatus = async (t, statusBaru) => {
  prosesId.value = t.id;
  await supabase.from('toko').update({ status: statusBaru }).eq('id', t.id);
  t.status = statusBaru;
  prosesId.value = null;
};

const bukaTolakModal = (t) => {
  tolakTarget.value = t;
  alasanTolak.value = '';
  showTolakModal.value = true;
};

const konfirmasiTolak = async () => {
  if (!alasanTolak.value.trim()) return;
  prosesId.value = tolakTarget.value.id;
  await supabase
    .from('toko')
    .update({ status: 'DITOLAK', alasan_tolak: alasanTolak.value.trim() })
    .eq('id', tolakTarget.value.id);
  tolakTarget.value.status = 'DITOLAK';
  tolakTarget.value.alasan_tolak = alasanTolak.value.trim();
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();
  if (profile?.role !== 'admin') {
    router.push('/');
    return;
  }

  const { data } = await supabase
    .from('toko')
    .select('*')
    .order('created_at', { ascending: false });

  tokoList.value = data ?? [];
  loading.value = false;
});
</script>

<style scoped>

.page-header {
  background: linear-gradient(135deg, #1a2e0a, #2d5016);
  padding: 2.5rem 0;
}
.container {
  max-width: 900px;
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
  margin-bottom: 1rem;
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

.search-wrap {
  position: relative;
  margin-bottom: 1.75rem;
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
  padding: 0.7rem 2.5rem 0.7rem 2.4rem;
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
  font-size: 0.85rem;
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

.toko-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.toko-card {
  background: #fff;
  border: 1px solid #e8e0d0;
  border-radius: 16px;
  overflow: hidden;
}

.toko-header {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  align-items: flex-start;
}
.toko-foto-wrap {
  flex-shrink: 0;
}
.toko-foto {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  object-fit: cover;
}
.toko-foto-placeholder {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: #f0f7e8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  border: 1px solid #e8e0d0;
}
.toko-info {
  flex: 1;
}
.toko-nama-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.3rem;
  flex-wrap: wrap;
}
.toko-nama {
  font-family: 'Lora', serif;
  font-size: 1rem;
  font-weight: 700;
  color: #1a2e0a;
}
.toko-meta {
  font-size: 0.78rem;
  color: #6b7280;
  margin-bottom: 0.15rem;
}
.toko-date {
  font-size: 0.72rem;
  color: #9ca3af;
  margin-top: 0.25rem;
}

.toko-desc {
  padding: 0 1.25rem 1rem;
  border-top: 1px solid #f0ede6;
  padding-top: 0.85rem;
}
.toko-desc p {
  font-size: 0.82rem;
  color: #4b5563;
  line-height: 1.6;
}

.alasan-box {
  margin: 0 1.25rem 0.85rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 0.65rem 0.85rem;
  font-size: 0.78rem;
}
.alasan-label {
  color: #9ca3af;
  font-weight: 500;
  margin-right: 0.3rem;
}
.alasan-text {
  color: #dc2626;
  font-style: italic;
}

.toko-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0.85rem 1.25rem;
  border-top: 1px solid #f0ede6;
  flex-wrap: wrap;
}

.btn-acc {
  background: #2d5016;
  color: #f5edd6;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
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
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
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

.btn-blokir {
  background: #fff7ed;
  color: #d97706;
  border: 1px solid #fde68a;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}
.btn-blokir:hover:not(:disabled) {
  background: #fef3c7;
}
.btn-blokir:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-aktifkan {
  background: #f0f7e8;
  color: #2d5016;
  border: 1px solid #a8c97f;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}
.btn-aktifkan:hover:not(:disabled) {
  background: #e0f0cc;
}
.btn-aktifkan:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-lihat {
  background: #f9fafb;
  color: #374151;
  border: 1px solid #e5e7eb;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.2s;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
}
.btn-lihat:hover {
  background: #f3f4f6;
}

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
.badge-aktif {
  background: #dcfce7;
  color: #166534;
}
.badge-tolak {
  background: #fee2e2;
  color: #991b1b;
}
.badge-blokir {
  background: #f3f4f6;
  color: #6b7280;
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
  font-size: 0.875rem;
  color: #6b7280;
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
.required {
  color: #dc2626;
}
textarea {
  padding: 0.75rem 1rem;
  border: 1.5px solid #d1d5db;
  border-radius: 10px;
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
  width: 100%;
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

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  .hamburger {
    display: block;
  }
  .toko-header {
    flex-direction: column;
  }
}
</style>
