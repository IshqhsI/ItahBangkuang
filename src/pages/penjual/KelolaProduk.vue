<template>
  <LayoutPenjual :statusToko="statusToko" :tokoId="toko?.id">
    <section class="kepala">
      <div class="wadah kepala-dalam">
        <div>
          <h1 class="judul-halaman">Produk saya</h1>
          <p class="sub-halaman">Ubah, sembunyikan, atau hapus produk tokomu.</p>
        </div>
        <RouterLink to="/toko/produk/tambah" class="tombol tombol-merah">
          <Plus :size="20" :stroke-width="2.75" />
          Tambah produk
        </RouterLink>
      </div>
    </section>

    <div class="wadah isi">
      <div class="deret-chip" role="group" aria-label="Saring produk">
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

      <div v-if="loading" class="grid-produk">
        <div v-for="n in 6" :key="n" class="kerangka" style="height: 360px"></div>
      </div>

      <div v-else-if="produkFiltered.length" class="grid-kelola">
        <article v-for="p in produkFiltered" :key="p.id" class="kartu papan" :class="{ tersembunyi: p.status === 'DISEMBUNYIKAN' }">
          <div class="foto">
            <img :src="p.foto_url" :alt="p.nama_produk" />
            <span v-if="p.status === 'DISEMBUNYIKAN'" class="plat plat-tinta foto-plat">
              <EyeOff :size="14" :stroke-width="2.5" /> Disembunyikan
            </span>
          </div>

          <div class="badan">
            <p class="kategori">{{ labelKategori(p.kategori) }}</p>
            <h2 class="nama">{{ p.nama_produk }}</h2>
            <p class="harga">{{ formatHargaProduk(p) }}</p>

            <p class="stok" :class="{ habis: totalStok(p) === 0, sedikit: totalStok(p) > 0 && totalStok(p) <= 5 }">
              <template v-if="totalStok(p) === 0">{{ punyaVarian(p) ? 'Semua varian habis' : 'Stok habis' }}</template>
              <template v-else>Stok {{ totalStok(p) }}<template v-if="punyaVarian(p)"> · {{ p.varian.length }} varian</template></template>
            </p>

            <ul v-if="punyaVarian(p)" class="varian">
              <li v-for="(v, i) in p.varian.slice(0, 3)" :key="i" :class="{ habis: Number(v.stok) === 0 }">
                {{ v.nama }} <b>{{ v.stok }}</b>
              </li>
              <li v-if="p.varian.length > 3" class="lagi">+{{ p.varian.length - 3 }} lagi</li>
            </ul>
          </div>

          <div class="aksi">
            <RouterLink :to="`/toko/produk/${p.id}/edit`" class="tombol tombol-kecil aksi-edit">
              <Pencil :size="16" :stroke-width="2.5" />
              Edit
            </RouterLink>
            <button type="button" class="tombol tombol-kecil" :disabled="prosesId === p.id" @click="toggleStatus(p)">
              <Eye v-if="p.status === 'DISEMBUNYIKAN'" :size="16" :stroke-width="2.5" />
              <EyeOff v-else :size="16" :stroke-width="2.5" />
              {{ p.status === 'DISEMBUNYIKAN' ? 'Tampilkan' : 'Sembunyikan' }}
            </button>
            <button
              type="button"
              class="tombol tombol-kecil tombol-bahaya"
              :disabled="prosesId === p.id"
              :aria-label="`Hapus ${p.nama_produk}`"
              @click="bukaHapus(p)"
            >
              <Trash2 :size="16" :stroke-width="2.5" />
            </button>
          </div>
        </article>
      </div>

      <div v-else class="kosong">
        <PackageOpen :size="44" :stroke-width="2" />
        <h3>{{ filterAktif === 'semua' ? 'Belum ada produk' : 'Tidak ada produk di sini' }}</h3>
        <p v-if="filterAktif === 'semua'">Pajang produk pertamamu supaya bisa dilihat pembeli.</p>
        <p v-else>Coba lihat kelompok lain.</p>
        <RouterLink v-if="filterAktif === 'semua'" to="/toko/produk/tambah" class="tombol tombol-merah">Tambah produk pertama</RouterLink>
        <button v-else type="button" class="tombol" @click="filterAktif = 'semua'">Lihat semua produk</button>
      </div>
    </div>

    <!-- Konfirmasi hapus -->
    <dialog ref="dialogHapus" class="dialog" @close="hapusTarget = null">
      <form method="dialog" class="dialog-isi" @submit.prevent>
        <Trash2 :size="32" :stroke-width="2.25" class="dialog-ikon" />
        <h2 class="huruf-papan">Hapus “{{ hapusTarget?.nama_produk }}”?</h2>
        <p>Produk ini hilang permanen dan tidak bisa dikembalikan. Kalau cuma mau berhenti menjual sementara, pilih <strong>Sembunyikan</strong>.</p>
        <div class="dialog-aksi">
          <button type="button" class="tombol" @click="dialogHapus.close()">Batal</button>
          <button type="button" class="tombol tombol-merah" :disabled="!!prosesId" @click="konfirmasiHapus">
            {{ prosesId ? 'Menghapus…' : 'Hapus produk' }}
          </button>
        </div>
      </form>
    </dialog>
  </LayoutPenjual>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Plus, Pencil, Eye, EyeOff, Trash2, PackageOpen } from 'lucide-vue-next';
import { supabase } from '@/lib/supabase';
import { useToastStore } from '@/stores/toast';
import LayoutPenjual from '@/layouts/LayoutPenjual.vue';
import { punyaVarian, totalStok, formatHargaProduk } from '@/lib/utils';
import { labelKategori } from '@/lib/kategori';

const route = useRoute();
const router = useRouter();
const toast = useToastStore();
const loading = ref(true);
const produkList = ref([]);
const filterAktif = ref('semua');
const prosesId = ref(null);
const dialogHapus = ref(null);
const hapusTarget = ref(null);
const statusToko = ref(null);
const toko = ref(null);

const filterList = [
  { val: 'semua', label: 'Semua' },
  { val: 'AKTIF', label: 'Tampil' },
  { val: 'HABIS', label: 'Stok habis' },
  { val: 'DISEMBUNYIKAN', label: 'Disembunyikan' },
];

const cocok = (p, val) => {
  if (val === 'semua') return true;
  if (val === 'HABIS') return totalStok(p) === 0;
  return p.status === val;
};
const produkFiltered = computed(() => produkList.value.filter((p) => cocok(p, filterAktif.value)));
const hitungFilter = (val) => produkList.value.filter((p) => cocok(p, val)).length;

const toggleStatus = async (p) => {
  prosesId.value = p.id;
  const statusBaru = p.status === 'DISEMBUNYIKAN' ? 'AKTIF' : 'DISEMBUNYIKAN';
  const { error } = await supabase.from('produk').update({ status: statusBaru }).eq('id', p.id);
  if (error) {
    toast.error('Statusnya belum berubah. Periksa koneksi internetmu, lalu coba lagi.');
  } else {
    p.status = statusBaru;
    toast.success(statusBaru === 'AKTIF' ? `“${p.nama_produk}” tampil lagi.` : `“${p.nama_produk}” disembunyikan.`);
  }
  prosesId.value = null;
};

const bukaHapus = (p) => {
  hapusTarget.value = p;
  dialogHapus.value?.showModal();
};

const konfirmasiHapus = async () => {
  const target = hapusTarget.value;
  if (!target) return;
  prosesId.value = target.id;
  const { error } = await supabase.from('produk').delete().eq('id', target.id);
  if (error) {
    toast.error('Produk belum terhapus. Kalau produk ini pernah dipesan, coba sembunyikan saja.');
  } else {
    produkList.value = produkList.value.filter((p) => p.id !== target.id);
    toast.success(`“${target.nama_produk}” dihapus.`);
  }
  prosesId.value = null;
  dialogHapus.value?.close();
};

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    router.replace({ path: '/login', query: { redirect: route.fullPath } });
    return;
  }

  const { data: tokoData } = await supabase
    .from('toko')
    .select('id, status')
    .eq('user_id', session.user.id)
    .single();

  if (!tokoData || tokoData.status !== 'AKTIF') {
    router.push('/toko/dashboard');
    return;
  }
  toko.value = tokoData;
  statusToko.value = tokoData.status;

  const { data } = await supabase
    .from('produk')
    .select('*')
    .eq('toko_id', tokoData.id)
    .order('created_at', { ascending: false });

  produkList.value = data ?? [];
  loading.value = false;
});
</script>

<style scoped>
.kepala {
  background: var(--hijau);
  color: #fff;
  border-bottom: 3px solid var(--tinta);
  padding: 1.5rem 0 1.75rem;
}
.kepala .judul-halaman {
  color: #fff;
}
.kepala .sub-halaman {
  color: #cfe8d7;
}
.kepala-dalam {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}
.isi {
  padding-top: 1.25rem;
  padding-bottom: 2rem;
}

.grid-kelola {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.1rem;
  margin-top: 0.75rem;
}
.kartu {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.kartu.tersembunyi .foto img {
  filter: grayscale(0.85);
  opacity: 0.7;
}
.foto {
  position: relative;
  aspect-ratio: 4 / 3;
  background: var(--dinding);
  border-bottom: var(--tebal) solid var(--garis);
}
.foto img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.foto-plat {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
}
.badan {
  flex: 1;
  padding: 0.85rem 0.9rem;
}
.kategori {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--tinta-3);
}
.nama {
  margin-top: 0.1rem;
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.harga {
  margin-top: 0.4rem;
  font-family: var(--font-papan);
  font-size: 1.05rem;
}
.stok {
  margin-top: 0.35rem;
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--hijau-tua);
}
.stok.sedikit,
.stok.habis {
  color: var(--merah-tua);
}
.varian {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-top: 0.6rem;
}
.varian li {
  padding: 0.05rem 0.45rem;
  background: var(--dinding);
  border: 1.5px solid var(--garis-lembut);
  border-radius: 4px;
  font-size: 0.82rem;
}
.varian li.habis {
  color: var(--merah-tua);
  border-color: var(--merah);
  text-decoration: line-through;
}
.varian li.lagi {
  border-style: dashed;
  color: var(--tinta-3);
}

.aksi {
  display: flex;
  gap: 0.4rem;
  padding: 0.7rem 0.8rem 0.8rem;
  border-top: 1px solid var(--garis-lembut);
}
.aksi > .tombol {
  min-height: 42px;
}
.aksi-edit {
  --t-bg: var(--kuning);
  --t-bg-hover: var(--kuning-tua);
}
.aksi > button:not(.tombol-bahaya) {
  flex: 1;
}

/* Dialog */
.dialog {
  margin: auto;
  width: min(440px, calc(100vw - 2rem));
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
  gap: 0.7rem;
  padding: 1.5rem;
}
.dialog-ikon {
  color: var(--merah);
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
  margin-top: 0.6rem;
}
</style>
