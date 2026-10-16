<template>
  <LayoutAdmin>
    <section class="kepala">
      <div class="wadah">
        <h1 class="judul-halaman">Kelola pengguna</h1>
        <p class="sub-halaman">Semua orang yang sudah mendaftar, dan peran mereka.</p>
      </div>
    </section>

    <div class="wadah isi">
      <ul class="ringkasan" aria-label="Jumlah pengguna">
        <li><span>Semua</span> <strong>{{ userList.length }}</strong></li>
        <li><span>Pembeli</span> <strong>{{ hitung('pembeli') }}</strong></li>
        <li><span>Penjual</span> <strong>{{ hitung('penjual') }}</strong></li>
        <li><span>Admin</span> <strong>{{ hitung('admin') }}</strong></li>
      </ul>

      <div class="alat">
        <form class="cari" role="search" @submit.prevent>
          <Search class="cari-ikon" :size="20" :stroke-width="2.5" aria-hidden="true" />
          <label for="cari-user" class="sr-only">Cari pengguna</label>
          <input id="cari-user" v-model="keyword" type="search" placeholder="Cari nama pengguna…" class="cari-input" />
          <button v-if="keyword" type="button" class="cari-hapus" aria-label="Hapus pencarian" @click="keyword = ''">
            <X :size="18" :stroke-width="2.5" />
          </button>
        </form>
        <div class="isian saring">
          <label for="f-peran" class="sr-only">Peran</label>
          <select id="f-peran" v-model="filterRole">
            <option value="">Semua peran</option>
            <option value="pembeli">Pembeli</option>
            <option value="penjual">Penjual</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div v-if="loading" class="memuat">
        <div class="spinner"></div>
        <p>Mengambil data pengguna…</p>
      </div>

      <div v-else-if="userFiltered.length" class="bungkus-tabel">
        <table class="tabel">
          <thead>
            <tr>
              <th scope="col">Pengguna</th>
              <th scope="col">Peran</th>
              <th scope="col">Toko</th>
              <th scope="col">Bergabung</th>
              <th scope="col">Ubah peran</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in userFiltered" :key="u.id">
              <td>
                <div class="user-sel">
                  <span class="avatar" aria-hidden="true">{{ (u.nama_lengkap || '?')[0].toUpperCase() }}</span>
                  <span class="user-nama">{{ u.nama_lengkap || 'Tanpa nama' }}</span>
                </div>
              </td>
              <td><span class="plat" :class="platPeran[u.role]">{{ labelPeran(u.role) }}</span></td>
              <td>
                <RouterLink v-if="tokoDari(u)" :to="`/toko/${tokoDari(u).id}`" target="_blank" class="toko-link">
                  {{ tokoDari(u).nama_toko }}
                  <span class="plat" :class="`plat-${statusPlat[tokoDari(u).status] ?? 'tinta'}`">{{ tokoDari(u).status.toLowerCase() }}</span>
                </RouterLink>
                <span v-else class="kosong-sel">–</span>
              </td>
              <td>{{ formatTanggal(u.created_at) }}</td>
              <td>
                <div class="isian peran">
                  <label :for="`peran-${u.id}`" class="sr-only">Peran {{ u.nama_lengkap }}</label>
                  <select
                    v-if="u.id !== currentUserId"
                    :id="`peran-${u.id}`"
                    :value="u.role"
                    :disabled="prosesId === u.id"
                    @change="mintaGantiRole(u, $event)"
                  >
                    <option value="pembeli">Pembeli</option>
                    <option value="penjual">Penjual</option>
                    <option value="admin">Admin</option>
                  </select>
                  <span v-else class="dirimu">Ini kamu</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="kosong">
        <UserSearch :size="44" :stroke-width="2" />
        <h3>Tidak ada pengguna yang cocok</h3>
        <p>Coba ubah peran atau kata kuncinya.</p>
      </div>
    </div>

    <dialog ref="dialogRole" class="dialog" @close="batalGanti">
      <div class="dialog-isi">
        <h2 class="huruf-papan">Ubah peran {{ target?.user.nama_lengkap || 'pengguna ini' }}?</h2>
        <p>
          Dari <strong>{{ labelPeran(target?.user.role) }}</strong> menjadi
          <strong>{{ labelPeran(target?.baru) }}</strong>.
          <template v-if="target?.baru === 'admin'"> Admin bisa menyetujui toko, memblokir, dan mengubah peran orang lain.</template>
          <template v-else-if="target?.user.role === 'admin'"> Dia akan kehilangan akses ke panel admin.</template>
        </p>
        <div class="dialog-aksi">
          <button type="button" class="tombol" @click="dialogRole.close()">Batal</button>
          <button type="button" class="tombol tombol-merah" :disabled="!!prosesId" @click="konfirmasiGanti">Ubah peran</button>
        </div>
      </div>
    </dialog>
  </LayoutAdmin>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Search, X, UserSearch } from 'lucide-vue-next';
import { supabase } from '@/lib/supabase';
import { useToastStore } from '@/stores/toast';
import LayoutAdmin from '@/layouts/LayoutAdmin.vue';
import { formatTanggal } from '@/lib/utils';

const route = useRoute();
const router = useRouter();
const toast = useToastStore();

const loading = ref(true);
const userList = ref([]);
const keyword = ref('');
const filterRole = ref('');
const prosesId = ref(null);
const currentUserId = ref(null);
const dialogRole = ref(null);
const target = ref(null); // { user, baru, el }

const labelPeran = (r) => ({ pembeli: 'Pembeli', penjual: 'Penjual', admin: 'Admin' })[r] ?? r ?? '';
const platPeran = { pembeli: 'plat-biru', penjual: 'plat-hijau', admin: 'plat-merah' };
const statusPlat = { AKTIF: 'hijau', PENDING: 'kuning', DITOLAK: 'merah', DIBLOKIR: 'tinta' };

// Relasi toko bisa berupa objek atau larik, tergantung skema
const tokoDari = (u) => (Array.isArray(u.toko) ? u.toko[0] : u.toko) ?? null;

const hitung = (role) => userList.value.filter((u) => u.role === role).length;

const userFiltered = computed(() => {
  let list = userList.value;
  if (filterRole.value) list = list.filter((u) => u.role === filterRole.value);
  const kw = keyword.value.trim().toLowerCase();
  if (kw) list = list.filter((u) => u.nama_lengkap?.toLowerCase().includes(kw));
  return list;
});

const mintaGantiRole = (u, event) => {
  const baru = event.target.value;
  if (baru === u.role) return;
  target.value = { user: u, baru, el: event.target };
  dialogRole.value?.showModal();
};

// Dialog ditutup tanpa konfirmasi: kembalikan pilihan ke peran semula
const batalGanti = () => {
  if (target.value?.el) target.value.el.value = target.value.user.role;
  target.value = null;
};

const konfirmasiGanti = async () => {
  const t = target.value;
  if (!t) return;
  prosesId.value = t.user.id;
  const { error } = await supabase.from('profiles').update({ role: t.baru }).eq('id', t.user.id);
  if (error) {
    toast.error('Perannya belum berubah. Periksa koneksi internetmu, lalu coba lagi.');
  } else {
    t.user.role = t.baru;
    toast.success(`${t.user.nama_lengkap || 'Pengguna'} sekarang ${labelPeran(t.baru)}.`);
  }
  prosesId.value = null;
  dialogRole.value?.close();
};

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    router.replace({ path: '/login', query: { redirect: route.fullPath } });
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

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*, toko(id, nama_toko, status)')
    .order('created_at', { ascending: false });

  userList.value = profiles ?? [];
  loading.value = false;
});
</script>

<style scoped>
.kepala {
  background: var(--biru);
  color: #fff;
  border-bottom: 3px solid var(--tinta);
  padding: 1.5rem 0 1.75rem;
}
.kepala .judul-halaman {
  color: #fff;
}
.kepala .sub-halaman {
  color: #c9d8f2;
}
.isi {
  padding-top: 1.25rem;
  padding-bottom: 2rem;
}

.ringkasan {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.ringkasan li {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0.35rem 0.8rem;
  background: var(--papan);
  border: 2px solid var(--tinta);
  border-radius: 999px;
}
.ringkasan span {
  color: var(--tinta-2);
  font-weight: 700;
  font-size: 0.92rem;
}
.ringkasan strong {
  font-family: var(--font-papan);
  font-weight: 400;
}

.alat {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 1rem;
}
.cari {
  position: relative;
  flex: 1 1 280px;
}
.cari-ikon {
  position: absolute;
  left: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}
.cari-input {
  width: 100%;
  min-height: 48px;
  padding: 0 2.9rem;
  background: var(--papan);
  color: var(--tinta);
  border: 2px solid var(--tinta);
  border-radius: var(--sudut-kecil);
  font-family: var(--font-teks);
  font-size: 1rem;
  -webkit-appearance: none;
  appearance: none;
}
.cari-input::-webkit-search-cancel-button {
  display: none;
}
.cari-input:focus {
  outline: none;
  border-color: var(--biru);
  box-shadow: 0 0 0 3px var(--biru-muda);
}
.cari-hapus {
  position: absolute;
  right: 0.35rem;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  background: none;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}
.cari-hapus:hover {
  background: var(--dinding);
}
.saring {
  flex: 0 1 200px;
}

.user-sel {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 180px;
}
.avatar {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  background: var(--kuning);
  border: 2px solid var(--tinta);
  border-radius: 50%;
  font-family: var(--font-papan);
}
.user-nama {
  font-weight: 700;
}
.toko-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
}
.kosong-sel {
  color: var(--tinta-3);
}
.peran select {
  min-height: 42px;
  min-width: 130px;
}
.dirimu {
  color: var(--tinta-3);
  font-weight: 700;
}

.dialog {
  margin: auto;
  width: min(460px, calc(100vw - 2rem));
  padding: 0;
  background: var(--papan);
  color: var(--tinta);
  border: 3px solid var(--tinta);
  border-radius: 10px;
}
.dialog::backdrop {
  background: rgba(20, 20, 20, 0.55);
}
.dialog-isi {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1.5rem;
}
.dialog-isi h2 {
  font-size: 1.25rem;
  overflow-wrap: anywhere;
}
.dialog-isi p {
  color: var(--tinta-2);
}
.dialog-aksi {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.4rem;
}
</style>
