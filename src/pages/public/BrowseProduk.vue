<template>
  <LayoutPublic>
    <!-- KEPALA -->
    <section class="kepala">
      <div class="wadah kepala-dalam">
        <div class="kepala-teks">
          <h1 class="kepala-judul huruf-papan">Produk</h1>
          <p class="kepala-sub">Produk dan jasa dari warga Kelurahan Bangkuang.</p>
        </div>

        <form class="cari" role="search" @submit.prevent>
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
            @click="kategoriAktif = k.slug"
          >
            <component :is="k.icon" :size="18" :stroke-width="2" />
            {{ k.label }}
            <span v-if="!memuat" class="hitung">{{ jumlahPerKategori[k.slug] ?? 0 }}</span>
          </button>
        </div>
        <div class="urut">
          <label class="sembunyi-habis">
            <input v-model="sembunyikanHabis" type="checkbox" />
            <span>Sembunyikan yang habis</span>
          </label>
          <div class="urut-pilih-bungkus">
            <label for="urutan" class="sr-only">Urutkan</label>
            <ArrowDownUp :size="18" :stroke-width="2" aria-hidden="true" />
            <select id="urutan" v-model="sortBy" class="urut-pilih">
              <option value="terbaru">Paling baru</option>
              <option value="termurah">Harga termurah</option>
              <option value="termahal">Harga termahal</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- HASIL -->
    <section class="hasil">
      <div class="wadah">
        <p v-if="!memuat && hasil.length" class="hasil-info" aria-live="polite">
          <template v-if="keyword.trim() || kategoriAktif !== 'semua'">
            Ditemukan <strong>{{ hasil.length }}</strong> produk
            <template v-if="keyword.trim()"> untuk “{{ keyword.trim() }}”</template>
            <template v-if="kategoriAktif !== 'semua'"> di {{ labelKategori(kategoriAktif) }}</template>
          </template>
          <template v-else>
            <strong>{{ hasil.length }}</strong> produk
          </template>
          <template v-if="jumlahDisembunyikan > 0">
            ·
            <button type="button" class="tautan-tombol" @click="sembunyikanHabis = false">
              tampilkan {{ jumlahDisembunyikan }} yang habis
            </button>
          </template>
        </p>

        <div v-if="memuat" class="grid-produk">
          <div v-for="n in 8" :key="n" class="kerangka" style="aspect-ratio: 4 / 5.6; border-radius: 20px"></div>
        </div>

        <template v-else-if="hasil.length">
          <div class="grid-produk">
            <KartuProduk v-for="p in tampilDaftar" :key="p.id" :produk="p" />
          </div>
          <div v-if="sisaTampil > 0" class="lagi">
            <button type="button" class="tombol" @click="tampilBatas += LANGKAH">
              Tampilkan {{ Math.min(LANGKAH, sisaTampil) }} produk lagi
              <span class="lagi-sisa">({{ sisaTampil }} tersisa)</span>
            </button>
          </div>
        </template>

        <div v-else-if="gagal" class="kosong">
          <SearchX :size="44" :stroke-width="1.75" />
          <h3>Produk belum dapat dimuat</h3>
          <p>Periksa koneksi internet Anda, lalu coba lagi.</p>
          <button type="button" class="tombol tombol-merah" @click="muatProduk">Coba lagi</button>
        </div>

        <div v-else class="kosong">
          <SearchX :size="44" :stroke-width="1.75" />
          <template v-if="keyword.trim() || kategoriAktif !== 'semua' || jumlahDisembunyikan > 0">
            <h3>Tidak ditemukan</h3>
            <p v-if="keyword.trim()">
              Tidak ada produk untuk “{{ keyword.trim() }}”<template v-if="kategoriAktif !== 'semua'"> di {{ labelKategori(kategoriAktif) }}</template>. Coba kata kunci lain yang lebih singkat.
            </p>
            <p v-else-if="jumlahDisembunyikan > 0">
              Semua produk yang cocok sedang habis. Anda dapat menampilkannya kembali.
            </p>
            <p v-else>Belum ada produk di kategori {{ labelKategori(kategoriAktif) }}.</p>
            <button type="button" class="tombol tombol-merah" @click="resetFilter">
              Lihat semua produk
            </button>
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
import { ref, computed, watch, onMounted, markRaw } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Search, SearchX, X, ArrowDownUp, LayoutGrid } from 'lucide-vue-next';
import { supabase } from '@/lib/supabase';
import LayoutPublic from '@/layouts/LayoutPublic.vue';
import KartuProduk from '@/components/KartuProduk.vue';
import { useSeo } from '@/lib/useSeo';
import { KATEGORI, labelKategori } from '@/lib/kategori';
import { totalStok, punyaVarian } from '@/lib/utils';

// Daftar disimpan di tingkat modul: saat kembali dari halaman detail,
// daftar langsung tampil dan posisi gulir dapat dipulihkan oleh router.
const TTL_CACHE = 2 * 60 * 1000;
const BATAS_AMBIL = 300;
const LANGKAH = 24;
let cache = { data: null, waktu: 0 };

const route = useRoute();
const router = useRouter();

const semuaProduk = ref(cache.data ?? []);
const memuat = ref(!cache.data);
const gagal = ref(false);

const keyword = ref(String(route.query.q ?? ''));
const kategoriAktif = ref(String(route.query.kategori ?? 'semua'));
const sortBy = ref(String(route.query.urut ?? 'terbaru'));
const sembunyikanHabis = ref(route.query.habis !== '1');
const tampilBatas = ref(LANGKAH);

const kategoriList = [{ slug: 'semua', label: 'Semua', icon: markRaw(LayoutGrid) }, ...KATEGORI];

// ---------- data ----------
let tokenMuat = 0;
const muatProduk = async () => {
  const token = ++tokenMuat;
  gagal.value = false;
  if (!semuaProduk.value.length) memuat.value = true;

  const { data, error } = await supabase
    .from('produk')
    .select(
      'id, nama_produk, deskripsi, harga, stok, varian, foto_url, kategori, created_at, toko_id, toko(nama_toko, alamat, status)',
    )
    .eq('status', 'AKTIF')
    .order('created_at', { ascending: false })
    .limit(BATAS_AMBIL);

  if (token !== tokenMuat) return; // permintaan lama diabaikan
  if (error) {
    gagal.value = !semuaProduk.value.length;
  } else {
    semuaProduk.value = (data ?? []).filter((p) => p.toko?.status === 'AKTIF');
    cache = { data: semuaProduk.value, waktu: Date.now() };
  }
  memuat.value = false;
};

// ---------- pencarian & penyaringan (di sisi klien) ----------
const normal = (t) =>
  String(t ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

const kataKunci = computed(() => normal(keyword.value).split(/\s+/).filter(Boolean));

const cocokKata = (p) => {
  if (!kataKunci.value.length) return true;
  const gudang = normal(
    [p.nama_produk, p.deskripsi, p.toko?.nama_toko, labelKategori(p.kategori)].join(' '),
  );
  return kataKunci.value.every((k) => gudang.includes(k));
};

const habis = (p) => totalStok(p) === 0;

// Setelah kata kunci dan penyembunyian, sebelum kategori (untuk jumlah di chip)
const dasar = computed(() =>
  semuaProduk.value.filter((p) => cocokKata(p) && (!sembunyikanHabis.value || !habis(p))),
);

const jumlahPerKategori = computed(() => {
  const hitung = { semua: dasar.value.length };
  for (const p of dasar.value) hitung[p.kategori] = (hitung[p.kategori] ?? 0) + 1;
  return hitung;
});

// Berapa produk yang cocok tetapi disembunyikan karena habis
const jumlahDisembunyikan = computed(() => {
  if (!sembunyikanHabis.value) return 0;
  return semuaProduk.value.filter(
    (p) =>
      cocokKata(p) &&
      habis(p) &&
      (kategoriAktif.value === 'semua' || p.kategori === kategoriAktif.value),
  ).length;
});

const hargaTerendah = (p) =>
  punyaVarian(p) ? Math.min(...p.varian.map((v) => Number(v.harga) || 0)) : Number(p.harga) || 0;
const hargaTertinggi = (p) =>
  punyaVarian(p) ? Math.max(...p.varian.map((v) => Number(v.harga) || 0)) : Number(p.harga) || 0;

const hasil = computed(() => {
  const daftar = dasar.value.filter(
    (p) => kategoriAktif.value === 'semua' || p.kategori === kategoriAktif.value,
  );
  const urut = {
    terbaru: (a, b) => new Date(b.created_at) - new Date(a.created_at),
    termurah: (a, b) => hargaTerendah(a) - hargaTerendah(b),
    termahal: (a, b) => hargaTertinggi(b) - hargaTertinggi(a),
  }[sortBy.value] ?? (() => 0);
  // Yang masih ada stok selalu di depan; yang habis di belakang
  return [...daftar].sort((a, b) => Number(habis(a)) - Number(habis(b)) || urut(a, b));
});

const tampilDaftar = computed(() => hasil.value.slice(0, tampilBatas.value));
const sisaTampil = computed(() => Math.max(0, hasil.value.length - tampilBatas.value));

const resetFilter = () => {
  keyword.value = '';
  kategoriAktif.value = 'semua';
  sembunyikanHabis.value = true;
};

// ---------- URL & riwayat ----------
const bangunQuery = () => {
  const q = {};
  if (kategoriAktif.value !== 'semua') q.kategori = kategoriAktif.value;
  if (keyword.value.trim()) q.q = keyword.value.trim();
  if (sortBy.value !== 'terbaru') q.urut = sortBy.value;
  if (!sembunyikanHabis.value) q.habis = '1';
  return q;
};

let tundaUrl = null;
watch([keyword, kategoriAktif, sortBy, sembunyikanHabis], () => {
  tampilBatas.value = LANGKAH;
  clearTimeout(tundaUrl);
  tundaUrl = setTimeout(() => router.replace({ query: bangunQuery() }), 350);
});

// Tombol kembali/maju atau tautan yang hanya mengubah query
watch(
  () => route.query,
  (qr) => {
    const k = String(qr.kategori ?? 'semua');
    const q = String(qr.q ?? '');
    const u = String(qr.urut ?? 'terbaru');
    const h = qr.habis !== '1';
    if (k !== kategoriAktif.value) kategoriAktif.value = k;
    if (q.trim() !== keyword.value.trim()) keyword.value = q;
    if (u !== sortBy.value) sortBy.value = u;
    if (h !== sembunyikanHabis.value) sembunyikanHabis.value = h;
  },
);

// Judul tab dan deskripsi mengikuti kategori
watch(
  kategoriAktif,
  (k) =>
    useSeo({
      title: k === 'semua' ? 'Semua Produk' : labelKategori(k),
      description:
        'Daftar produk dan jasa warga Kelurahan Bangkuang: makanan, minuman, pakaian, dan jasa.',
    }),
  { immediate: true },
);

onMounted(() => {
  const segar = cache.data && Date.now() - cache.waktu < TTL_CACHE;
  if (!segar) muatProduk();
  else memuat.value = false;
});
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
}
.hasil-info {
  margin-bottom: 1rem;
  color: var(--ink-2);
}
.hasil-info strong {
  color: var(--ink);
}
.tautan-tombol {
  padding: 0;
  background: none;
  border: 0;
  color: var(--sungai-sedang);
  font: inherit;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 0.2em;
  cursor: pointer;
}
.lagi {
  display: flex;
  justify-content: center;
  margin-top: 1.75rem;
}
.lagi-sisa {
  font-weight: 500;
  color: var(--ink-2);
}
</style>
