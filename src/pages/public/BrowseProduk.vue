<template>
  <LayoutPublic>
    <!-- KEPALA -->
    <section class="kepala">
      <div class="wadah">
        <h1 class="kepala-judul huruf-papan">Semua produk</h1>
        <p class="kepala-sub">Dagangan tetangga se-Bangkuang. Dari jajanan sampai jasa tukang.</p>

        <form class="cari" role="search" @submit.prevent="fetchProduk">
          <Search class="cari-ikon" :size="22" :stroke-width="2.5" aria-hidden="true" />
          <label for="cari-produk" class="sr-only">Cari produk</label>
          <input
            id="cari-produk"
            v-model="keyword"
            type="search"
            placeholder="Cari kue, sambal, jahit baju…"
            class="cari-input"
            enterkeyhint="search"
            @input="onSearch"
          />
          <button
            v-if="keyword"
            type="button"
            class="cari-hapus"
            aria-label="Hapus pencarian"
            @click="clearSearch"
          >
            <X :size="20" :stroke-width="2.5" />
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
            @click="setKategori(k.slug)"
          >
            <component :is="k.icon" :size="18" :stroke-width="2.25" />
            {{ k.label }}
          </button>
        </div>
        <div class="urut">
          <label for="urutan" class="sr-only">Urutkan</label>
          <ArrowDownUp :size="18" :stroke-width="2.25" aria-hidden="true" />
          <select id="urutan" v-model="sortBy" class="urut-pilih" @change="fetchProduk">
            <option value="terbaru">Paling baru</option>
            <option value="termurah">Harga termurah</option>
            <option value="termahal">Harga termahal</option>
          </select>
        </div>
      </div>
    </div>

    <!-- HASIL -->
    <section class="hasil">
      <div class="wadah">
        <p v-if="!loadingProduk && produkList.length" class="hasil-info" aria-live="polite">
          <template v-if="keyword || kategoriAktif !== 'semua'">
            Ketemu <strong>{{ produkList.length }}</strong> produk
            <template v-if="keyword"> untuk “{{ keyword }}”</template>
            <template v-if="kategoriAktif !== 'semua'"> di {{ labelKategori(kategoriAktif) }}</template>
          </template>
          <template v-else>
            <strong>{{ produkList.length }}</strong> produk dari tetangga
          </template>
        </p>

        <div v-if="loadingProduk" class="grid-produk">
          <div v-for="n in 8" :key="n" class="kerangka" style="aspect-ratio: 3 / 4"></div>
        </div>

        <div v-else-if="produkList.length" class="grid-produk">
          <KartuProduk v-for="p in produkList" :key="p.id" :produk="p" />
        </div>

        <div v-else class="kosong">
          <SearchX :size="44" :stroke-width="2" />
          <template v-if="keyword || kategoriAktif !== 'semua'">
            <h3>Belum ketemu</h3>
            <p v-if="keyword">
              Tidak ada produk dengan nama “{{ keyword }}”<template v-if="kategoriAktif !== 'semua'"> di {{ labelKategori(kategoriAktif) }}</template>. Coba kata lain yang lebih pendek.
            </p>
            <p v-else>Belum ada yang jualan di kategori {{ labelKategori(kategoriAktif) }}.</p>
            <button type="button" class="tombol tombol-merah" @click="resetFilter">
              Lihat semua produk
            </button>
          </template>
          <template v-else>
            <h3>Etalase masih kosong</h3>
            <p>Belum ada tetangga yang memajang produk.</p>
          </template>
        </div>
      </div>
    </section>
  </LayoutPublic>
</template>

<script setup>
import { ref, onMounted, watch, markRaw } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Search, SearchX, X, ArrowDownUp, LayoutGrid } from 'lucide-vue-next';
import { supabase } from '@/lib/supabase';
import LayoutPublic from '@/layouts/LayoutPublic.vue';
import KartuProduk from '@/components/KartuProduk.vue';
import { useSeo } from '@/lib/useSeo';
import { KATEGORI, labelKategori } from '@/lib/kategori';

useSeo({
  title: 'Semua Produk',
  description:
    'Lihat semua produk warga Kelurahan Bangkuang: jajanan, lauk, minuman, jahitan, sampai jasa tukang.',
});

const route = useRoute();
const router = useRouter();
const loadingProduk = ref(true);
const produkList = ref([]);
const keyword = ref(route.query.q ?? '');
const kategoriAktif = ref(route.query.kategori ?? 'semua');
const sortBy = ref('terbaru');
let searchTimeout = null;

const kategoriList = [
  { slug: 'semua', label: 'Semua', icon: markRaw(LayoutGrid) },
  ...KATEGORI,
];

// Simpan filter di URL supaya bisa dibagikan & tombol kembali tetap jalan
const sinkronUrl = () => {
  const query = {};
  if (kategoriAktif.value !== 'semua') query.kategori = kategoriAktif.value;
  if (keyword.value.trim()) query.q = keyword.value.trim();
  router.replace({ query });
};

const fetchProduk = async () => {
  loadingProduk.value = true;
  let query = supabase
    .from('produk')
    .select('*, toko(nama_toko, alamat, status)')
    .eq('status', 'AKTIF');

  if (kategoriAktif.value !== 'semua')
    query = query.eq('kategori', kategoriAktif.value);
  if (keyword.value.trim())
    query = query.ilike('nama_produk', `%${keyword.value.trim()}%`);

  if (sortBy.value === 'terbaru')
    query = query.order('created_at', { ascending: false });
  else if (sortBy.value === 'termurah')
    query = query.order('harga', { ascending: true });
  else if (sortBy.value === 'termahal')
    query = query.order('harga', { ascending: false });

  const { data } = await query;
  produkList.value = data?.filter((p) => p.toko?.status === 'AKTIF') ?? [];
  loadingProduk.value = false;
};

const setKategori = (slug) => {
  kategoriAktif.value = slug;
  sinkronUrl();
  fetchProduk();
};
const onSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    sinkronUrl();
    fetchProduk();
  }, 400);
};
const clearSearch = () => {
  keyword.value = '';
  sinkronUrl();
  fetchProduk();
};
const resetFilter = () => {
  keyword.value = '';
  kategoriAktif.value = 'semua';
  sinkronUrl();
  fetchProduk();
};

// Kalau datang dari papan kategori lain (mis. lewat footer/beranda) saat sudah di halaman ini
watch(
  () => route.query.kategori,
  (val) => {
    const slug = val ?? 'semua';
    if (slug !== kategoriAktif.value) {
      kategoriAktif.value = slug;
      fetchProduk();
    }
  },
);

onMounted(fetchProduk);
</script>

<style scoped>
.kepala {
  background: var(--sage);
  color: var(--sungai-dalam);
  border-radius: 0 0 32px 32px;
  padding: 2rem 0 2.25rem;
}
.kepala-judul {
  font-size: clamp(2rem, 6vw, 3.2rem);
  color: var(--sungai-dalam);
}
.kepala-sub {
  margin-top: 0.5rem;
  font-size: 1.05rem;
  color: var(--ink-2);
  max-width: 52ch;
}

.cari {
  position: relative;
  margin-top: 1.4rem;
  max-width: 640px;
}
.cari-ikon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}
.cari-input {
  width: 100%;
  min-height: 56px;
  padding: 0 3.25rem;
  background: var(--papan);
  color: var(--tinta);
  border: var(--tebal) solid var(--garis);
  border-radius: var(--sudut);
  font-family: var(--font-teks);
  font-size: 1.05rem;
  -webkit-appearance: none;
  appearance: none;
}
.cari-input::-webkit-search-cancel-button {
  display: none;
}
.cari-input::placeholder {
  color: #6b6b6b;
}
.cari-input:focus {
  outline: none;
  box-shadow: 0 0 0 4px var(--papan), 0 0 0 7px var(--biru);
}
.cari-hapus {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.cari-hapus:hover {
  background: var(--dinding);
}

.saring {
  position: sticky;
  top: var(--nav-h);
  z-index: 20;
  background: var(--papan);
  border-bottom: 1px solid var(--sage-2);
}
.saring-dalam {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-top: 0.6rem;
  padding-bottom: 0.35rem;
}
.saring .deret-chip {
  flex: 1;
  min-width: 0;
}
.urut {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding-bottom: 0.25rem;
}
.urut-pilih {
  min-height: 42px;
  padding: 0 2.2rem 0 0.75rem;
  background: var(--papan)
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' fill='none' stroke='%231d2a26' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m4 7 5 5 5-5'/%3E%3C/svg%3E")
    no-repeat right 0.6rem center;
  border: 1.5px solid var(--garis);
  border-radius: 999px;
  font-family: var(--font-teks);
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--tinta);
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}
@media (max-width: 640px) {
  .saring-dalam {
    flex-direction: column;
    align-items: stretch;
    gap: 0.25rem;
  }
  .urut {
    justify-content: flex-end;
  }
}

.hasil {
  background: var(--dinding);
  padding: 1.5rem 0 4rem;
  min-height: 50vh;
}
.hasil-info {
  margin-bottom: 1rem;
  color: var(--tinta-2);
}
.hasil-info strong {
  color: var(--tinta);
}
</style>
