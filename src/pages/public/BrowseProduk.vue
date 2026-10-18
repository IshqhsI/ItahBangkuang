<template>
  <LayoutPublic>
    <!-- KEPALA -->
    <section class="kepala">
      <div class="wadah kepala-dalam">
        <div class="kepala-teks">
          <h1 class="kepala-judul huruf-papan">Produk</h1>
          <p class="kepala-sub">Produk dan jasa dari warga Kelurahan Bangkuang.</p>
        </div>

        <form class="cari" role="search" @submit.prevent="terapkanCari">
          <Search class="cari-ikon" :size="20" :stroke-width="2" aria-hidden="true" />
          <label for="cari-produk" class="sr-only">Cari produk</label>
          <input
            id="cari-produk"
            v-model="keyword"
            type="search"
            placeholder="Cari produk, toko, atau kategori"
            class="cari-input"
            enterkeyhint="search"
            autocomplete="off"
          />
          <button
            v-if="keyword"
            type="button"
            class="cari-hapus"
            aria-label="Hapus pencarian"
            @click="keyword = ''"
          >
            <X :size="18" :stroke-width="2.25" />
          </button>
        </form>
      </div>
    </section>

    <!-- FILTER -->
    <div class="saring">
      <div class="wadah saring-dalam">
        <div class="deret-chip" role="group" aria-label="Kategori">
          <button
            v-for="k in kategoriList"
            :key="k.slug"
            type="button"
            class="chip"
            :aria-pressed="kategoriAktif === k.slug"
            :class="{ aktif: kategoriAktif === k.slug }"
            @click="ubahQuery({ kategori: k.slug === 'semua' ? undefined : k.slug })"
          >
            <component :is="k.icon" :size="18" :stroke-width="2" />
            {{ k.label }}
            <span v-if="jumlahKategori" class="hitung">{{ jumlahKategori[k.slug] ?? 0 }}</span>
          </button>
        </div>
        <div class="urut">
          <label class="sembunyi-habis">
            <input
              type="checkbox"
              :checked="sembunyikanHabis"
              @change="ubahQuery({ habis: $event.target.checked ? undefined : '1' })"
            />
            <span>Sembunyikan yang habis</span>
          </label>
          <div class="urut-pilih-bungkus">
            <label for="urutan" class="sr-only">Urutkan</label>
            <ArrowDownUp :size="18" :stroke-width="2" aria-hidden="true" />
            <select
              id="urutan"
              :value="sortBy"
              class="urut-pilih"
              @change="ubahQuery({ urut: $event.target.value === 'beragam' ? undefined : $event.target.value })"
            >
              <option value="beragam">Pilihan beragam</option>
              <option value="terbaru">Paling baru</option>
              <option value="termurah">Harga termurah</option>
              <option value="termahal">Harga termahal</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- HASIL -->
    <section ref="areaHasil" class="hasil">
      <div class="wadah">
        <p v-if="pernahMuat && total > 0" class="hasil-info" aria-live="polite">
          <template v-if="q || kategoriAktif !== 'semua'">
            Ditemukan <strong>{{ total }}</strong> produk
            <template v-if="q"> untuk “{{ q }}”</template>
            <template v-if="kategoriAktif !== 'semua'"> di {{ labelKategori(kategoriAktif) }}</template>
          </template>
          <template v-else>
            <strong>{{ total }}</strong> produk
          </template>
          <template v-if="jumlahHalaman > 1"> · halaman {{ halaman }} dari {{ jumlahHalaman }}</template>
        </p>

        <div v-if="!pernahMuat" class="grid-produk">
          <div v-for="n in 8" :key="n" class="kerangka" style="aspect-ratio: 4 / 5.6; border-radius: 20px"></div>
        </div>

        <template v-else-if="daftar.length">
          <div class="grid-produk" :class="{ memuat: sedangMemuat }">
            <KartuProduk v-for="p in daftar" :key="p.id" :produk="p" />
          </div>
          <Paginasi :halaman="halaman" :total="total" :per-halaman="PER_HALAMAN" />
        </template>

        <div v-else-if="gagal" class="kosong">
          <SearchX :size="44" :stroke-width="1.75" />
          <h3>Produk belum dapat dimuat</h3>
          <p>Periksa koneksi internet Anda, lalu coba lagi.</p>
          <button type="button" class="tombol tombol-merah" @click="muat">Coba lagi</button>
        </div>

        <div v-else class="kosong">
          <SearchX :size="44" :stroke-width="1.75" />
          <template v-if="q || kategoriAktif !== 'semua' || sembunyikanHabis">
            <h3>Tidak ditemukan</h3>
            <p v-if="q">
              Tidak ada produk untuk “{{ q }}”<template v-if="kategoriAktif !== 'semua'"> di {{ labelKategori(kategoriAktif) }}</template>. Coba kata kunci lain yang lebih singkat.
            </p>
            <p v-else>Belum ada produk yang tersedia dengan pilihan ini.</p>
            <div class="kosong-aksi">
              <button
                v-if="sembunyikanHabis"
                type="button"
                class="tombol"
                @click="ubahQuery({ habis: '1' })"
              >
                Tampilkan yang habis
              </button>
              <button type="button" class="tombol tombol-merah" @click="resetFilter">
                Lihat semua produk
              </button>
            </div>
          </template>
          <template v-else>
            <h3>Belum ada produk</h3>
            <p>Belum ada penjual yang menambahkan produk.</p>
          </template>
        </div>
      </div>
    </section>
  </LayoutPublic>
</template>

<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount, markRaw } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Search, SearchX, X, ArrowDownUp, LayoutGrid } from 'lucide-vue-next';
import LayoutPublic from '@/layouts/LayoutPublic.vue';
import KartuProduk from '@/components/KartuProduk.vue';
import Paginasi from '@/components/Paginasi.vue';
import { useSeo, BASE_URL } from '@/lib/useSeo';
import { KATEGORI, labelKategori } from '@/lib/kategori';
import { cariKatalog, hitungKatalog, PER_HALAMAN } from '@/lib/katalog';
import { slugUrl } from '../../../api/_kategori.js';

const route = useRoute();
const router = useRouter();

// ---------- keadaan: satu-satunya sumber kebenaran adalah URL ----------
const URUTAN = ['beragam', 'terbaru', 'termurah', 'termahal'];
const q = computed(() => String(route.query.q ?? '').trim());
const kategoriAktif = computed(() => String(route.query.kategori ?? 'semua'));
const sortBy = computed(() => (URUTAN.includes(route.query.urut) ? route.query.urut : 'beragam'));
const sembunyikanHabis = computed(() => route.query.habis !== '1');
const halaman = computed(() => Math.max(1, parseInt(route.query.halaman, 10) || 1));

const kategoriList = [{ slug: 'semua', label: 'Semua', icon: markRaw(LayoutGrid) }, ...KATEGORI];

const ubahQuery = (patch) => {
  const baru = { ...route.query, ...patch };
  // Ganti saringan selalu kembali ke halaman 1
  if (!('halaman' in patch)) delete baru.halaman;
  for (const k of Object.keys(baru)) if (baru[k] === undefined || baru[k] === '') delete baru[k];
  router.replace({ query: baru });
};

const resetFilter = () => {
  keyword.value = '';
  router.replace({ query: {} });
};

// ---------- kolom cari (ditunda agar tidak memanggil database di tiap huruf) ----------
const keyword = ref(q.value);
let tundaCari = null;
const terapkanCari = () => {
  clearTimeout(tundaCari);
  if (keyword.value.trim() !== q.value) ubahQuery({ q: keyword.value.trim() || undefined });
};
watch(keyword, () => {
  clearTimeout(tundaCari);
  tundaCari = setTimeout(terapkanCari, 350);
});
watch(q, (baru) => {
  // Tombol kembali/maju mengubah URL: samakan isi kolom cari
  if (baru !== keyword.value.trim()) keyword.value = baru;
});
onBeforeUnmount(() => clearTimeout(tundaCari));

// ---------- data ----------
const daftar = ref([]);
const total = ref(0);
const jumlahKategori = ref(null);
const pernahMuat = ref(false);
const sedangMemuat = ref(false);
const gagal = ref(false);
const areaHasil = ref(null);
const jumlahHalaman = computed(() => Math.max(1, Math.ceil(total.value / PER_HALAMAN)));

let token = 0;
const muat = async () => {
  const saya = ++token;
  sedangMemuat.value = true;
  gagal.value = false;
  const hasil = await cariKatalog({
    cari: q.value,
    kategori: kategoriAktif.value === 'semua' ? null : kategoriAktif.value,
    sembunyikanHabis: sembunyikanHabis.value,
    urut: sortBy.value,
    halaman: halaman.value,
  });
  if (saya !== token) return; // permintaan lama diabaikan

  // Halaman di luar jangkauan (mis. ?halaman=99): arahkan ke halaman terakhir
  if (hasil.total > 0 && hasil.baris.length === 0 && halaman.value > 1) {
    router.replace({
      query: { ...route.query, halaman: String(Math.ceil(hasil.total / PER_HALAMAN)) },
    });
    return;
  }

  daftar.value = hasil.baris;
  total.value = hasil.total;
  gagal.value = hasil.gagal;
  pernahMuat.value = true;
  sedangMemuat.value = false;
};

let tokenHitung = 0;
const muatHitung = async () => {
  const saya = ++tokenHitung;
  const hasil = await hitungKatalog({ cari: q.value, sembunyikanHabis: sembunyikanHabis.value });
  if (saya === tokenHitung) jumlahKategori.value = hasil;
};

watch(
  () => [q.value, kategoriAktif.value, sortBy.value, sembunyikanHabis.value, halaman.value],
  () => muat(),
  { immediate: true },
);
watch(() => [q.value, sembunyikanHabis.value], muatHitung, { immediate: true });

// Pindah halaman: gulir ke awal hasil
watch(halaman, async () => {
  await nextTick();
  areaHasil.value?.scrollIntoView({ block: 'start' });
});

// ---------- SEO ----------
watch(
  () => [kategoriAktif.value, halaman.value, q.value],
  ([k, h, kata]) => {
    const dasar = k === 'semua' ? `${BASE_URL}/produk` : `${BASE_URL}/kategori/${slugUrl(k)}`;
    useSeo({
      title: `${k === 'semua' ? 'Semua Produk' : labelKategori(k)}${h > 1 ? ` — Halaman ${h}` : ''}`,
      description:
        'Daftar produk dan jasa warga Kelurahan Bangkuang: makanan, minuman, pakaian, dan jasa.',
      url: h > 1 ? `${dasar}?halaman=${h}` : dasar,
      noindex: Boolean(kata), // hasil pencarian tidak perlu diindeks
    });
  },
  { immediate: true },
);
</script>

<style scoped>
.kepala {
  background: var(--sage);
  color: var(--sungai-dalam);
  border-radius: 0 0 28px 28px;
  padding: 1.25rem 0 1.4rem;
}
.kepala-dalam {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.9rem;
}
@media (min-width: 820px) {
  .kepala {
    padding: 1.75rem 0 1.9rem;
  }
  .kepala-dalam {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
    align-items: end;
    gap: 2rem;
  }
}
.kepala-judul {
  font-size: clamp(1.8rem, 5vw, 2.6rem);
  color: var(--sungai-dalam);
  line-height: 1.05;
}
.kepala-sub {
  margin-top: 0.3rem;
  font-size: 0.98rem;
  color: var(--ink-2);
  max-width: 52ch;
}

.cari {
  position: relative;
  width: 100%;
}
.cari-ikon {
  position: absolute;
  left: 1.1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--ink-2);
  pointer-events: none;
}
.cari-input {
  width: 100%;
  min-height: 52px;
  padding: 0 3rem 0 2.9rem;
  background: #fff;
  color: var(--ink);
  border: 0;
  border-radius: 999px;
  box-shadow: 0 6px 18px rgba(22, 58, 50, 0.1);
  font-family: var(--font-teks);
  font-size: 1.02rem;
  -webkit-appearance: none;
  appearance: none;
}
.cari-input::-webkit-search-cancel-button {
  display: none;
}
.cari-input::placeholder {
  color: #6b7a74;
}
.cari-input:focus {
  outline: none;
  box-shadow:
    0 0 0 3px #fff,
    0 0 0 6px var(--sungai-sedang);
}
.cari-hapus {
  position: absolute;
  right: 0.45rem;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  background: none;
  border: none;
  border-radius: 50%;
  color: var(--ink-2);
  cursor: pointer;
}
.cari-hapus:hover {
  background: var(--sage);
}

.saring {
  position: sticky;
  top: var(--nav-h);
  z-index: 20;
  background: rgba(244, 246, 242, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--sage-2);
}
.saring-dalam {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-top: 0.6rem;
  padding-bottom: 0.4rem;
}
.saring .deret-chip {
  flex: 1;
  min-width: 0;
}
.urut {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding-bottom: 0.25rem;
}
.sembunyi-habis {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--ink-2);
  cursor: pointer;
  white-space: nowrap;
}
.sembunyi-habis input {
  width: 18px;
  height: 18px;
  accent-color: var(--sungai-sedang);
}
.urut-pilih-bungkus {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--ink-2);
}
.urut-pilih {
  min-height: 44px;
  padding: 0 2.2rem 0 0.9rem;
  background: #fff
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' fill='none' stroke='%231d2a26' stroke-width='2.25' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m4 7 5 5 5-5'/%3E%3C/svg%3E")
    no-repeat right 0.7rem center;
  border: 1.5px solid var(--garis-lembut);
  border-radius: 999px;
  font-family: var(--font-teks);
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--ink);
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}
@media (max-width: 760px) {
  .saring-dalam {
    flex-direction: column;
    align-items: stretch;
    gap: 0.15rem;
  }
  .urut {
    justify-content: space-between;
  }
}

.hasil {
  background: var(--dinding);
  padding: 1.4rem 0 4rem;
  min-height: 50vh;
  scroll-margin-top: calc(var(--nav-h) + 4.5rem);
}
.hasil-info {
  margin-bottom: 1rem;
  color: var(--ink-2);
}
.hasil-info strong {
  color: var(--ink);
}
.grid-produk.memuat {
  opacity: 0.55;
  transition: opacity 0.2s ease;
  pointer-events: none;
}
.kosong-aksi {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.6rem;
  margin-top: 0.6rem;
}
</style>
