<template>
  <LayoutAdmin>
    <section class="kepala">
      <div class="wadah">
        <h1 class="judul-halaman">Kelola toko</h1>
        <p class="sub-halaman">Periksa toko baru, tolak yang tidak sesuai, dan blokir yang melanggar.</p>
      </div>
    </section>

    <div class="wadah isi">
      <div class="deret-chip" role="group" aria-label="Saring menurut status">
        <button
          v-for="f in filterList"
          :key="f.val"
          type="button"
          class="chip"
          :aria-pressed="filterAktif === f.val"
          @click="filterAktif = f.val"
        >
          {{ f.label }}
          <span v-if="hitungFilter(f.val) > 0" class="hitung">{{ hitungFilter(f.val) }}</span>
        </button>
      </div>

      <form class="cari" role="search" @submit.prevent>
        <Search class="cari-ikon" :size="20" :stroke-width="2.5" aria-hidden="true" />
        <label for="cari-toko" class="sr-only">Cari toko</label>
        <input id="cari-toko" v-model="keyword" type="search" placeholder="Cari nama toko atau alamat…" class="cari-input" />
        <button v-if="keyword" type="button" class="cari-hapus" aria-label="Hapus pencarian" @click="keyword = ''">
          <X :size="18" :stroke-width="2.5" />
        </button>
      </form>

      <div v-if="loading" class="memuat">
        <div class="spinner"></div>
        <p>Mengambil data toko…</p>
      </div>

      <ul v-else-if="tokoFiltered.length" class="daftar">
        <li v-for="t in tokoFiltered" :key="t.id" class="kartu papan">
          <div class="kartu-atas">
            <span class="foto">
              <img v-if="t.foto_toko" :src="t.foto_toko" :alt="`Foto ${t.nama_toko}`" />
              <Store v-else :size="28" :stroke-width="2.25" />
            </span>
            <div class="info">
              <div class="info-nama">
                <h2>{{ t.nama_toko }}</h2>
                <span class="badge" :class="badgeClass(t.status)">{{ labelStatus(t.status) }}</span>
              </div>
              <p class="info-ket"><MapPin :size="14" :stroke-width="2.5" /> {{ t.alamat }}</p>
              <p class="info-ket"><Phone :size="14" :stroke-width="2.5" /> +62{{ t.nomor_wa }}</p>
              <p class="info-ket">Daftar {{ formatTanggal(t.created_at) }}</p>
            </div>
          </div>

          <p v-if="t.deskripsi" class="deskripsi">{{ t.deskripsi }}</p>
          <p v-if="t.alasan_tolak" class="pesan pesan-awas alasan">
            <TriangleAlert :size="18" :stroke-width="2.5" />
            <span>Alasan penolakan: “{{ t.alasan_tolak }}”</span>
          </p>

          <div class="aksi">
            <template v-if="t.status === 'PENDING'">
              <button type="button" class="tombol tombol-kecil tombol-hijau" :disabled="prosesId === t.id" @click="accToko(t)">
                <Check :size="16" :stroke-width="3" />
                {{ prosesId === t.id ? 'Menyimpan…' : 'Setujui' }}
              </button>
              <button type="button" class="tombol tombol-kecil tombol-bahaya" :disabled="prosesId === t.id" @click="bukaTolak(t)">Tolak</button>
            </template>
            <button
              v-else-if="t.status === 'AKTIF'"
              type="button"
              class="tombol tombol-kecil tombol-bahaya"
              :disabled="prosesId === t.id"
              @click="mintaBlokir(t)"
            >
              <Ban :size="16" :stroke-width="2.5" />
              Blokir
            </button>
            <button
              v-else-if="t.status === 'DITOLAK'"
              type="button"
              class="tombol tombol-kecil tombol-hijau"
              :disabled="prosesId === t.id"
              @click="accToko(t)"
            >
              <Check :size="16" :stroke-width="3" />
              Setujui sekarang
            </button>
            <button
              v-else-if="t.status === 'DIBLOKIR'"
              type="button"
              class="tombol tombol-kecil tombol-hijau"
              :disabled="prosesId === t.id"
              @click="updateStatus(t, 'AKTIF')"
            >
              <Check :size="16" :stroke-width="3" />
              Aktifkan lagi
            </button>
            <RouterLink :to="`/toko/${t.id}`" target="_blank" class="tombol tombol-kecil">
              <ExternalLink :size="16" :stroke-width="2.5" />
              Lihat toko
            </RouterLink>
          </div>
        </li>
      </ul>

      <div v-else class="kosong">
        <Store :size="44" :stroke-width="2" />
        <h3>{{ keyword ? 'Tidak ada toko yang cocok' : filterAktif === 'semua' ? 'Belum ada toko' : `Tidak ada toko yang ${labelStatus(filterAktif).toLowerCase()}` }}</h3>
        <p v-if="keyword">Coba kata kunci lain.</p>
        <button v-if="keyword" type="button" class="tombol" @click="keyword = ''">Hapus pencarian</button>
      </div>
    </div>

    <!-- Tolak -->
    <dialog ref="dialogTolak" class="dialog" @close="tolakTarget = null">
      <div class="dialog-isi">
        <h2 class="huruf-papan">Tolak {{ tolakTarget?.nama_toko }}?</h2>
        <div class="isian">
          <label for="alasan">Alasan penolakan</label>
          <textarea
            id="alasan"
            v-model="alasanTolak"
            rows="3"
            aria-describedby="alasan-bantuan"
            placeholder="Contoh: Nomor WhatsApp tidak aktif. Mohon perbaiki lalu hubungi admin."
          ></textarea>
          <span id="alasan-bantuan" class="bantuan">Penjual akan membaca alasan ini, jadi tulis supaya mereka tahu apa yang perlu diperbaiki.</span>
        </div>
        <div class="dialog-aksi">
          <button type="button" class="tombol" @click="dialogTolak.close()">Batal</button>
          <button type="button" class="tombol tombol-merah" :disabled="!alasanTolak.trim() || !!prosesId" @click="konfirmasiTolak">Tolak toko</button>
        </div>
      </div>
    </dialog>

    <!-- Blokir -->
    <dialog ref="dialogBlokir" class="dialog" @close="blokirTarget = null">
      <div class="dialog-isi">
        <h2 class="huruf-papan">Blokir {{ blokirTarget?.nama_toko }}?</h2>
        <p>Toko ini dan semua produknya tidak akan tampil lagi, dan penjualnya tidak bisa menerima pesanan. Kamu bisa mengaktifkannya lagi nanti.</p>
        <div class="dialog-aksi">
          <button type="button" class="tombol" @click="dialogBlokir.close()">Batal</button>
          <button type="button" class="tombol tombol-merah" @click="konfirmasiBlokir">Blokir toko</button>
        </div>
      </div>
    </dialog>
  </LayoutAdmin>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Search, X, Store, MapPin, Phone, Check, Ban, ExternalLink, TriangleAlert } from 'lucide-vue-next';
import { supabase } from '@/lib/supabase';
import { useToastStore } from '@/stores/toast';
import LayoutAdmin from '@/layouts/LayoutAdmin.vue';
import { formatTanggal } from '@/lib/utils';

const route = useRoute();
const router = useRouter();
const toast = useToastStore();

const loading = ref(true);
const tokoList = ref([]);
const filterAktif = ref('semua');
const keyword = ref('');
const prosesId = ref(null);
const dialogTolak = ref(null);
const dialogBlokir = ref(null);
const tolakTarget = ref(null);
const blokirTarget = ref(null);
const alasanTolak = ref('');

const filterList = [
  { val: 'semua', label: 'Semua' },
  { val: 'PENDING', label: 'Menunggu' },
  { val: 'AKTIF', label: 'Aktif' },
  { val: 'DITOLAK', label: 'Ditolak' },
  { val: 'DIBLOKIR', label: 'Diblokir' },
];

const labelStatus = (s) =>
  ({ PENDING: 'Menunggu', AKTIF: 'Aktif', DITOLAK: 'Ditolak', DIBLOKIR: 'Diblokir' })[s] ?? s;
const badgeClass = (s) => `badge-${(s ?? '').toLowerCase()}`;

const tokoFiltered = computed(() => {
  let list =
    filterAktif.value === 'semua'
      ? tokoList.value
      : tokoList.value.filter((t) => t.status === filterAktif.value);
  const kw = keyword.value.trim().toLowerCase();
  if (kw) {
    list = list.filter(
      (t) => t.nama_toko.toLowerCase().includes(kw) || t.alamat?.toLowerCase().includes(kw),
    );
  }
  return list;
});

const hitungFilter = (val) =>
  val === 'semua' ? tokoList.value.length : tokoList.value.filter((t) => t.status === val).length;

const ubah = async (t, perubahan, pesanSukses) => {
  prosesId.value = t.id;
  const { error } = await supabase.from('toko').update(perubahan).eq('id', t.id);
  prosesId.value = null;
  if (error) {
    toast.error('Perubahannya belum tersimpan. Cek internetmu, lalu coba lagi.');
    return false;
  }
  Object.assign(t, perubahan);
  toast.success(pesanSukses);
  return true;
};

const accToko = (t) => ubah(t, { status: 'AKTIF', alasan_tolak: null }, `${t.nama_toko} disetujui.`);
const updateStatus = (t, status) => ubah(t, { status }, `${t.nama_toko} ${status === 'AKTIF' ? 'diaktifkan lagi' : 'diperbarui'}.`);

const bukaTolak = (t) => {
  tolakTarget.value = t;
  alasanTolak.value = '';
  dialogTolak.value?.showModal();
};
const konfirmasiTolak = async () => {
  const t = tolakTarget.value;
  if (!t || !alasanTolak.value.trim()) return;
  const ok = await ubah(t, { status: 'DITOLAK', alasan_tolak: alasanTolak.value.trim() }, `${t.nama_toko} ditolak.`);
  if (ok) dialogTolak.value?.close();
};

const mintaBlokir = (t) => {
  blokirTarget.value = t;
  dialogBlokir.value?.showModal();
};
const konfirmasiBlokir = async () => {
  const t = blokirTarget.value;
  dialogBlokir.value?.close();
  if (t) await ubah(t, { status: 'DIBLOKIR' }, `${t.nama_toko} diblokir.`);
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

  const { data } = await supabase.from('toko').select('*').order('created_at', { ascending: false });
  tokoList.value = data ?? [];
  if (tokoList.value.some((t) => t.status === 'PENDING')) filterAktif.value = 'PENDING';
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
  max-width: 980px;
}

.cari {
  position: relative;
  margin-top: 0.5rem;
  max-width: 480px;
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

.daftar {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  margin-top: 1.1rem;
}
.kartu {
  padding: 1rem 1.1rem 1.1rem;
}
.kartu-atas {
  display: flex;
  gap: 0.9rem;
}
.foto {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 60px;
  height: 60px;
  background: var(--hijau);
  color: #fff;
  border: var(--tebal) solid var(--garis);
  border-radius: 50%;
  overflow: hidden;
}
.foto img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.info {
  flex: 1;
  min-width: 0;
}
.info-nama {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.3rem 0.7rem;
}
.info-nama h2 {
  font-size: 1.1rem;
  font-weight: 700;
  overflow-wrap: anywhere;
}
.info-ket {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.92rem;
  color: var(--tinta-2);
  overflow-wrap: anywhere;
}
.deskripsi {
  margin-top: 0.8rem;
  padding: 0.7rem 0.9rem;
  background: var(--dinding);
  border-radius: var(--sudut-kecil);
  white-space: pre-line;
  overflow-wrap: anywhere;
}
.alasan {
  margin-top: 0.7rem;
  font-weight: 400;
}
.aksi {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.9rem;
}

.dialog {
  margin: auto;
  width: min(480px, calc(100vw - 2rem));
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
  gap: 0.9rem;
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
}
</style>
