<template>
  <LayoutPenjual :statusToko="statusToko" :tokoId="toko?.id">
    <section class="kepala">
      <div class="wadah kepala-dalam">
        <div>
          <h1 class="judul-halaman">Produk saya</h1>
          <p class="sub-halaman">Ubah, sembunyikan, atau hapus produk toko Anda.</p>
          <p v-if="toko && !toko.terverifikasi" class="sub-halaman kuota">
            {{ produkList.length }} dari {{ BATAS_PRODUK }} produk terpakai (toko belum terverifikasi).
          </p>
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
        <article v-for="p in produkFiltered" :key="p.id" class="kartu" :class="{ tersembunyi: p.status === 'DISEMBUNYIKAN' }">
          <div class="foto">
            <img :src="p.foto_url" :alt="p.nama_produk" loading="lazy" />
            <span v-if="p.status === 'DISEMBUNYIKAN'" class="lencana lencana-sembunyi">
              <EyeOff :size="14" :stroke-width="2.5" /> Disembunyikan
            </span>
          </div>

          <div class="badan">
            <p class="kategori">{{ labelKategori(p.kategori) }}</p>
            <h2 class="nama">{{ p.nama_produk }}</h2>
            <p class="harga">{{ formatHargaProduk(p) }}</p>

            <div class="status">
              <span v-if="p.po" class="cip cip-po">{{ labelPo(p) }}</span>
              <span v-if="totalStok(p) === 0" class="cip cip-habis">
                {{ punyaVarian(p) ? 'Semua varian habis' : 'Stok habis' }}
              </span>
              <span v-else-if="stokBebas(totalStok(p))" class="cip">Stok tidak dibatasi</span>
              <span v-else-if="totalStok(p) <= 5 && !punyaVarian(p)" class="cip cip-sedikit">Hampir habis</span>
              <span v-if="punyaVarian(p)" class="cip">{{ p.varian.length }} varian</span>
            </div>

            <!-- Atur stok cepat: area ini selalu setinggi sama supaya kartu sejajar -->
            <div class="stok-area">
              <div
                v-if="!punyaVarian(p) && !stokBebas(totalStok(p))"
                class="stok-atur"
                role="group"
                :aria-label="`Atur stok ${p.nama_produk}`"
              >
                <button
                  type="button"
                  class="stok-tombol"
                  aria-label="Kurangi stok"
                  :disabled="prosesId === p.id || totalStok(p) <= 0"
                  @click="ubahStok(p, -1)"
                >
                  <Minus :size="18" :stroke-width="2.5" />
                </button>
                <output class="stok-angka" aria-live="polite">{{ totalStok(p) }}</output>
                <button
                  type="button"
                  class="stok-tombol"
                  aria-label="Tambah stok"
                  :disabled="prosesId === p.id"
                  @click="ubahStok(p, 1)"
                >
                  <Plus :size="18" :stroke-width="2.5" />
                </button>
                <span class="stok-satuan">stok</span>
              </div>

              <ul v-else-if="punyaVarian(p)" class="varian">
                <li v-for="(v, i) in p.varian.slice(0, 3)" :key="i" :class="{ habis: Number(v.stok) === 0 }">
                  {{ v.nama }} <b>{{ stokBebas(v.stok) ? 'Ada' : v.stok }}</b>
                </li>
                <li v-if="p.varian.length > 3" class="lagi">+{{ p.varian.length - 3 }} lagi</li>
              </ul>

              <button
                v-if="totalStok(p) > 0 && (punyaVarian(p) || stokBebas(totalStok(p)))"
                type="button"
                class="tombol tombol-kecil tandai-habis"
                :disabled="prosesId === p.id"
                @click="tandaiHabis(p)"
              >
                {{ punyaVarian(p) ? 'Tandai semua varian habis' : 'Tandai habis' }}
              </button>
              <button
                v-else-if="totalStok(p) > 0"
                type="button"
                class="tautan-habis"
                :disabled="prosesId === p.id"
                @click="tandaiHabis(p)"
              >
                Tandai habis
              </button>
            </div>
          </div>

          <div class="aksi">
            <RouterLink :to="`/toko/produk/${p.id}/edit`" class="tombol tombol-kuning aksi-edit">
              <Pencil :size="18" :stroke-width="2.5" />
              Edit
            </RouterLink>
            <RouterLink
              :to="{ path: '/toko/produk/tambah', query: { salin: p.id } }"
              class="ikon-aksi"
              title="Salin jadi produk baru"
              :aria-label="`Salin ${p.nama_produk} jadi produk baru`"
            >
              <Copy :size="19" :stroke-width="2.25" />
            </RouterLink>
            <button
              type="button"
              class="ikon-aksi"
              :disabled="prosesId === p.id"
              :title="p.status === 'DISEMBUNYIKAN' ? 'Tampilkan di toko' : 'Sembunyikan dari toko'"
              :aria-label="p.status === 'DISEMBUNYIKAN' ? `Tampilkan ${p.nama_produk}` : `Sembunyikan ${p.nama_produk}`"
              @click="toggleStatus(p)"
            >
              <Eye v-if="p.status === 'DISEMBUNYIKAN'" :size="19" :stroke-width="2.25" />
              <EyeOff v-else :size="19" :stroke-width="2.25" />
            </button>
            <button
              type="button"
              class="ikon-aksi ikon-bahaya"
              :disabled="prosesId === p.id"
              title="Hapus produk"
              :aria-label="`Hapus ${p.nama_produk}`"
              @click="bukaHapus(p)"
            >
              <Trash2 :size="19" :stroke-width="2.25" />
            </button>
          </div>
        </article>
      </div>

      <div v-else class="kosong">
        <PackageOpen :size="44" :stroke-width="2" />
        <h3>{{ filterAktif === 'semua' ? 'Belum ada produk' : 'Tidak ada produk di sini' }}</h3>
        <p v-if="filterAktif === 'semua'">Tambahkan produk pertama agar dapat dilihat pembeli.</p>
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
        <p>Produk ini hilang permanen dan tidak bisa dikembalikan. Jika hanya ingin berhenti menjual sementara, pilih <strong>Sembunyikan</strong>.</p>
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
import { Plus, Pencil, Eye, EyeOff, Trash2, PackageOpen, Minus, Copy } from 'lucide-vue-next';
import { supabase } from '@/lib/supabase';
import { useToastStore } from '@/stores/toast';
import LayoutPenjual from '@/layouts/LayoutPenjual.vue';
import { punyaVarian, totalStok, stokBebas, formatHargaProduk, labelPo } from '@/lib/utils';
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
const BATAS_PRODUK = 5; // toko belum terverifikasi
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

// Stok cepat: tanpa membuka halaman ubah produk
const simpanStok = async (p, perubahan, pesan) => {
  prosesId.value = p.id;
  const { error } = await supabase.from('produk').update(perubahan).eq('id', p.id);
  prosesId.value = null;
  if (error) {
    toast.error('Stok belum tersimpan. Periksa koneksi internet Anda, lalu coba lagi.');
    return;
  }
  Object.assign(p, perubahan);
  if (pesan) toast.success(pesan);
};

const ubahStok = (p, selisih) =>
  simpanStok(p, { stok: Math.max(0, (Number(p.stok) || 0) + selisih) });

const tandaiHabis = (p) =>
  punyaVarian(p)
    ? simpanStok(p, { varian: p.varian.map((v) => ({ ...v, stok: 0 })) }, `Semua varian “${p.nama_produk}” ditandai habis.`)
    : simpanStok(p, { stok: 0 }, `“${p.nama_produk}” ditandai habis.`);

const toggleStatus = async (p) => {
  prosesId.value = p.id;
  const statusBaru = p.status === 'DISEMBUNYIKAN' ? 'AKTIF' : 'DISEMBUNYIKAN';
  const { error } = await supabase.from('produk').update({ status: statusBaru }).eq('id', p.id);
  if (error) {
    toast.error('Statusnya belum berubah. Periksa koneksi internet Anda, lalu coba lagi.');
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
    .select('id, status, terverifikasi')
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
.kuota {
  margin-top: 0.2rem;
  font-weight: 700;
}
.kepala {
  background: var(--sage);
  color: var(--sungai-dalam);
  border-radius: 0 0 32px 32px;
  padding: 1.5rem 0 1.75rem;
}
.kepala .judul-halaman {
  color: var(--sungai-dalam);
}
.kepala .sub-halaman {
  color: var(--ink-2);
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

/* ── Kartu produk penjual ─────────────────────────────────── */
.grid-kelola {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.1rem;
  margin-top: 0.75rem;
}
.kartu {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  border-radius: 22px;
  box-shadow: var(--bayang);
}
.foto {
  position: relative;
  aspect-ratio: 4 / 3; /* tinggi foto sama di semua kartu, apa pun ukuran aslinya */
  background: var(--sage);
  overflow: hidden;
}
.foto img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.kartu.tersembunyi .foto img {
  filter: grayscale(0.85);
  opacity: 0.7;
}
.lencana-sembunyi {
  position: absolute;
  top: 0.65rem;
  left: 0.65rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.7rem;
  background: rgba(29, 42, 38, 0.82);
  color: #fff;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 800;
}
.badan {
  display: flex;
  flex-direction: column;
  flex: 1; /* mengisi sisa tinggi supaya baris tombol selalu sejajar di bawah */
  padding: 0.95rem 1rem 0.9rem;
}
.kategori {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--ink-2);
}
.nama {
  margin-top: 0.15rem;
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.harga {
  margin-top: 0.35rem;
  font-family: var(--font-papan);
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--sungai-dalam);
}
.status {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.6rem;
}
.cip {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  padding: 0.2rem 0.6rem;
  background: var(--sage);
  color: var(--sungai);
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 800;
  line-height: 1.3;
}
.cip-po {
  background: var(--aprikot-muda);
  color: #7a4a24;
}
.cip-habis {
  background: #f9e3df;
  color: #a1352a;
}
.cip-sedikit {
  background: #fdf0d5;
  color: #8a5a00;
}

.stok-area {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 0.5rem;
  margin-top: 0.7rem;
  padding-top: 0.7rem;
  border-top: 1px solid var(--sage-2);
}
.stok-atur {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.stok-tombol {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  background: #fff;
  border: 1.5px solid var(--sage-2);
  border-radius: 50%;
  color: var(--sungai);
  cursor: pointer;
}
.stok-tombol:hover:not(:disabled) {
  background: var(--sage);
}
.stok-tombol:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.stok-angka {
  min-width: 2.4rem;
  text-align: center;
  font-weight: 800;
  font-size: 1.15rem;
}
.stok-satuan {
  margin-left: 0.15rem;
  font-size: 0.85rem;
  color: var(--ink-2);
}
.tautan-habis {
  align-self: flex-start;
  min-height: 32px;
  padding: 0;
  background: none;
  border: 0;
  color: #a1352a;
  font-size: 0.86rem;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}
.tautan-habis:disabled {
  opacity: 0.5;
}
.tandai-habis {
  align-self: flex-start;
}
.varian {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}
.varian li {
  padding: 0.1rem 0.55rem;
  background: var(--dinding);
  border: 1px solid var(--sage-2);
  border-radius: 999px;
  font-size: 0.82rem;
}
.varian li.habis {
  color: #a1352a;
  border-color: #e9b9b2;
  text-decoration: line-through;
}
.varian li.lagi {
  border-style: dashed;
  color: var(--ink-2);
}

/* Kartu berdampingan: sisakan ruang tetap supaya harga, status, dan stok sejajar antar kartu */
@media (min-width: 560px) {
  .nama {
    min-height: 2.5em;
  }
  .status {
    min-height: 1.9rem;
  }
  .stok-area {
    min-height: 5.1rem;
  }
}

/* Baris tombol: Edit lebar, sisanya ikon (nama muncul sebagai tooltip dan label aksesibilitas) */
.aksi {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.75rem 0.85rem 0.9rem;
  border-top: 1px solid var(--sage-2);
}
.aksi-edit {
  flex: 1;
  min-height: 44px;
}
.ikon-aksi {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  background: var(--sage);
  border: 0;
  border-radius: 50%;
  color: var(--sungai);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}
.ikon-aksi:hover:not(:disabled) {
  background: var(--sungai);
  color: #fff;
}
.ikon-aksi:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.ikon-bahaya {
  background: #f9e3df;
  color: #a1352a;
}
.ikon-bahaya:hover:not(:disabled) {
  background: #a1352a;
  color: #fff;
}

/* Dialog */
.dialog {
  margin: auto;
  width: min(440px, calc(100vw - 2rem));
  padding: 0;
  background: var(--papan);
  color: var(--tinta);
  border: 1.5px solid var(--garis);
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
