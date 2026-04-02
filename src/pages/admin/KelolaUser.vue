<template>
  <LayoutAdmin>
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">Kelola Users</h1>
        <p class="page-sub">Semua pengguna terdaftar</p>
      </div>
    </div>

    <div class="container main-content">
      <!-- Search & Filter -->
      <div class="toolbar">
        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input
            v-model="keyword"
            type="text"
            placeholder="Cari nama atau email..."
            class="search-input"
          />
          <button v-if="keyword" class="search-clear" @click="keyword = ''">
            ✕
          </button>
        </div>
        <select v-model="filterRole" class="filter-select">
          <option value="">Semua Role</option>
          <option value="pembeli">Pembeli</option>
          <option value="penjual">Penjual</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <!-- Stats row -->
      <div class="stats-row">
        <div class="stat-pill">
          👥 Total: <strong>{{ userList.length }}</strong>
        </div>
        <div class="stat-pill">
          🛒 Pembeli: <strong>{{ hitung('pembeli') }}</strong>
        </div>
        <div class="stat-pill">
          🍱 Penjual: <strong>{{ hitung('penjual') }}</strong>
        </div>
        <div class="stat-pill">
          👑 Admin: <strong>{{ hitung('admin') }}</strong>
        </div>
      </div>

      <div v-if="loading" class="loading-wrap"><div class="spinner"></div></div>

      <div v-else-if="userFiltered.length" class="user-table-wrap">
        <table class="user-table">
          <thead>
            <tr>
              <th>Pengguna</th>
              <th>Role</th>
              <th>Toko</th>
              <th>Bergabung</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in userFiltered" :key="u.id">
              <td>
                <div class="user-cell">
                  <div class="avatar">
                    {{ (u.nama_lengkap || '?')[0].toUpperCase() }}
                    <!-- {{ (u.nama_lengkap || u.email || '?')[0].toUpperCase() }} -->
                  </div>
                  <div>
                    <p class="user-nama">
                      {{ u.nama_lengkap || 'Tidak ada nama' }}
                    </p>
                    <!-- <p class="user-email">{{ u.email }}</p> -->
                  </div>
                </div>
              </td>
              <td>
                <span class="role-badge" :class="roleBadge(u.role)">{{
                  u.role
                }}</span>
              </td>
              <td>
                <RouterLink
                  v-if="u.toko"
                  :to="`/toko/${u.toko.id}`"
                  class="toko-link"
                  target="_blank"
                >
                 <span v-if="console.log('Sedang merender:', u.toko)"></span>

                  {{ u.toko.nama_toko }}
                  <span
                    class="toko-status-dot"
                    :class="u.toko.status.toLowerCase()"
                  ></span>
                </RouterLink>
                <span v-else class="no-toko">—</span>
              </td>
              <td class="date-cell">{{ formatTanggal(u.created_at) }}</td>
              <td>
                <div class="aksi-cell">
                  <!-- Ganti role — tidak bisa ubah role admin lain, tidak bisa ubah diri sendiri -->
                  <select
                    v-if="u.id !== currentUserId"
                    v-model="u.role"
                    class="role-select"
                    @change="gantiRole(u)"
                    :disabled="prosesId === u.id"
                  >
                    <option value="pembeli">Pembeli</option>
                    <option value="penjual">Penjual</option>
                    <option value="admin">Admin</option>
                  </select>
                  <span v-else class="self-label">Kamu</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-state">
        <span>👥</span>
        <h3>Tidak ada user ditemukan</h3>
        <p>Coba ubah filter atau kata kunci.</p>
      </div>
    </div>
  </LayoutAdmin>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/lib/supabase';
import LayoutAdmin from '@/layouts/LayoutAdmin.vue';
import { formatTanggal } from '@/lib/utils';

const router = useRouter();
const menuOpen = ref(false);
const loading = ref(true);
const userList = ref([]);
const keyword = ref('');
const filterRole = ref('');
const prosesId = ref(null);
const currentUserId = ref(null);

const roleBadge = (r) => ({
  'role-pembeli': r === 'pembeli',
  'role-penjual': r === 'penjual',
  'role-admin': r === 'admin',
});

const hitung = (role) => userList.value.filter((u) => u.role === role).length;

const userFiltered = computed(() => {
  let list = userList.value;
  if (filterRole.value) list = list.filter((u) => u.role === filterRole.value);
  if (keyword.value.trim()) {
    const kw = keyword.value.toLowerCase();
    list = list.filter(
      (u) =>
        u.nama_lengkap?.toLowerCase().includes(kw)
        // || u.email?.toLowerCase().includes(kw),
    );
  }
  return list;
});

const gantiRole = async (u) => {
  prosesId.value = u.id;
  await supabase.from('profiles').update({ role: u.role }).eq('id', u.id);
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

  currentUserId.value = session.user.id;

  // Ambil semua profiles + join toko + email dari auth via view/join
  // Karena email ada di auth.users, kita join lewat profiles → toko saja dulu
  // Email perlu ditambahkan manual atau via Supabase service role
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*, toko(id, nama_toko, status)')
    // .select(`*, toko!user_id (id, nama_toko, status)`)
    .order('created_at', { ascending: false });

    console.log(userFiltered.value);

  userList.value = profiles ?? [];
  loading.value = false;
});
</script>

<style scoped>
.page-header {
  background: linear-gradient(135deg, #1a2e0a, #2d5016);
  padding: 2.5rem 0;
}
.container {
  max-width: 1000px;
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
.stats-row {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.stat-pill {
  background: #fff;
  border: 1px solid #e8e0d0;
  border-radius: 999px;
  padding: 0.4rem 0.85rem;
  font-size: 0.8rem;
  color: #6b7280;
}
.stat-pill strong {
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
.user-table-wrap {
  background: #fff;
  border: 1px solid #e8e0d0;
  border-radius: 16px;
  overflow: hidden;
  overflow-x: auto;
}
.user-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}
.user-table thead {
  background: #f9fafb;
  border-bottom: 1px solid #e8e0d0;
}
.user-table th {
  padding: 0.85rem 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}
.user-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #f0ede6;
  vertical-align: middle;
}
.user-table tr:last-child td {
  border-bottom: none;
}
.user-table tr:hover td {
  background: #fdfaf4;
}
.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #2d5016;
  color: #f5edd6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 700;
  flex-shrink: 0;
}
.user-nama {
  font-weight: 600;
  font-size: 0.875rem;
  color: #1a2e0a;
}
.user-email {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.1rem;
}
.role-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 600;
}
.role-pembeli {
  background: #eff6ff;
  color: #1e40af;
}
.role-penjual {
  background: #f0f7e8;
  color: #2d5016;
}
.role-admin {
  background: #fef9c3;
  color: #92400e;
}
.toko-link {
  color: #2d5016;
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.toko-link:hover {
  text-decoration: underline;
}
.toko-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.toko-status-dot.aktif {
  background: #22c55e;
}
.toko-status-dot.pending {
  background: #f59e0b;
}
.toko-status-dot.ditolak {
  background: #ef4444;
}
.toko-status-dot.diblokir {
  background: #9ca3af;
}
.no-toko {
  color: #d1d5db;
  font-size: 0.875rem;
}
.date-cell {
  font-size: 0.78rem;
  color: #9ca3af;
  white-space: nowrap;
}
.aksi-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.role-select {
  padding: 0.4rem 0.6rem;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.78rem;
  font-family: inherit;
  background: #fff;
  color: #374151;
  cursor: pointer;
}
.role-select:focus {
  outline: none;
  border-color: #2d5016;
}
.role-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.self-label {
  font-size: 0.78rem;
  color: #9ca3af;
  font-style: italic;
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
}
</style>
