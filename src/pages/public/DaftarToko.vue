<template>
  <LayoutPublic>
    <section class="kepala">
      <div class="wadah kepala-dalam">
        <div>
          <nav class="remah" aria-label="Lokasi halaman">
            <RouterLink to="/">Beranda</RouterLink>
            <ChevronRight :size="16" :stroke-width="2.25" aria-hidden="true" />
            <span aria-current="page">Toko</span>
          </nav>
          <h1 class="kepala-judul huruf-papan">Toko</h1>
          <p class="kepala-sub">
            Toko dan penyedia jasa dari warga Bangkuang. Yang bertanda Terverifikasi sudah diperiksa admin.
          </p>
        </div>

        <form class="cari" role="search" @submit.prevent="terapkanCari">
          <Search class="cari-ikon" :size="20" :stroke-width="2" aria-hidden="true" />
          <label for="cari-toko" class="sr-only">Cari toko</label>
          <input
            id="cari-toko"
            v-model="keyword"
            type="search"
            placeholder="Cari nama toko"
            class="cari-input"
            enterkeyhint="search"
            autocomplete="off"
          />
        </form>
      </div>
    </section>

    <!-- FILTER -->
    <div class="saring">
      <div class="wadah">
        <div class="deret-chip" role="group" aria-label="Saring toko">
          <button
            v-for="f in FILTER"
            :key="f.nilai"
            type="button"
            class="chip"
            :class="{ aktif: filterAktif === f.nilai }"
            :aria-pressed="filterAktif === f.nilai"
            @click="ubahFilter(f.nilai)"
          >
            <component :is="f.ikon" :size="16" :stroke-width="2" />
            {{ f.label }}
          </button>
        </div>
      </div>
    </div>

    <section ref="areaHasil" class="hasil">
      <div class="wadah">
        <p v-if="pernahMuat && total > 0" class="hasil-info" aria-live="polite">
          <strong>{{ total }}</strong> toko<template v-if="q"> untuk “{{ q }}”</template>
          <template v-if="jumlahHalaman > 1"> · halaman {{ halaman }} dari {{ jumlahHalaman }}</template>
        </p>

        <div v-if="!pernahMuat" class="grid-toko">
          <div v-for="n in 3" :key="n" class="kerangka" style="height: 360px; border-radius: 24px"></div>
        </div>

        <template v-else-if="daftar.length">
          <div class="grid-toko" :class="{ memuat: sedangMemuat }">
            <KartuToko v-for="t in daftar" :key="t.id" :t="t" :tingkat-judul="2" />
          </div>
          <Paginasi :halaman="halaman" :total="total" :per-halaman="PER_HALAMAN_TOKO" />
        </template>

        <div v-else class="kosong">
          <Store :size="44" :stroke-width="1.75" />
          <h3>{{ q || filterAktif ? 'Toko tidak ditemukan' : 'Belum ada toko' }}</h3>
          <p>
            {{ q || filterAktif ? 'Coba nama atau saringan lain.' : 'Belum ada penjual yang mendaftar.' }}
          </p>
          <button v-if="q || filterAktif" type="button" class="tombol" @click="resetSemua">Tampilkan semua toko</button>
        </div>
      </div>
    </section>
  </LayoutPublic>
</template>

<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount, markRaw } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Search, Store, ChevronRight, LayoutGrid, Truck, ShieldCheck } from 'lucide-vue-next';
import { supabase } from '@/lib/supabase';
import LayoutPublic from '@/layouts/LayoutPublic.vue';
import Paginasi from '@/components/Paginasi.vue';
import KartuToko from '@/components/KartuToko.vue';
import { useSeo, pasangBreadcrumb, BASE_URL } from '@/lib/useSeo';
import { LOKASI, LOKASI_PENDEK } from '../../../api/_kategori.js';
import { KOLOM_TOKO_KARTU, lengkapiToko } from '@/lib/dataToko';

const PER_HALAMAN_TOKO = 12;

const FILTER = [
  { nilai: '', label: 'Semua', ikon: markRaw(LayoutGrid) },
  { nilai: 'verif', label: 'Terverifikasi', ikon: markRaw(ShieldCheck) },
  { nilai: 'antar', label: 'Bisa diantar', ikon: markRaw(Truck) },
  { nilai: 'ambil', label: 'Ambil di tempat', ikon: markRaw(Store) },
];

const route = useRoute();
const router = useRouter();
const q = computed(() => String(route.query.q ?? '').trim());
const halaman = computed(() => Math.max(1, parseInt(route.query.halaman, 10) || 1));
const filterAktif = computed(() => {
  const f = String(route.query.filter ?? '');
  return FILTER.some((x) => x.nilai === f) ? f : '';
});

const ubahFilter = (nilai) => {
  const baru = { ...route.query };
  delete baru.halaman;
  if (nilai) baru.filter = nilai;
  else delete baru.filter;
  router.replace({ query: baru });
};
const resetSemua = () => {
  keyword.value = '';
  router.replace({ query: {} });
};

const keyword = ref(q.value);
let tunda = null;
const terapkanCari = () => {
  clearTimeout(tunda);
  const kata = keyword.value.trim();
  if (kata === q.value) return;
  const baru = { ...route.query };
  delete baru.halaman;
  if (kata) baru.q = kata;
  else delete baru.q;
  router.replace({ query: baru });
};
watch(keyword, () => {
  clearTimeout(tunda);
  tunda = setTimeout(terapkanCari, 350);
});
watch(q, (baru) => {
  if (baru !== keyword.value.trim()) keyword.value = baru;
});
onBeforeUnmount(() => clearTimeout(tunda));

const daftar = ref([]);
const total = ref(0);
const pernahMuat = ref(false);
const sedangMemuat = ref(false);
const areaHasil = ref(null);
const jumlahHalaman = computed(() => Math.max(1, Math.ceil(total.value / PER_HALAMAN_TOKO)));

let token = 0;
const muat = async () => {
  const saya = ++token;
  sedangMemuat.value = true;
  const dari = (halaman.value - 1) * PER_HALAMAN_TOKO;
  let kueri = supabase
    .from('toko')
    .select(KOLOM_TOKO_KARTU, { count: 'exact' })
    .eq('status', 'AKTIF')
    // Toko terverifikasi lebih dulu, lalu yang terbaru
    .order('terverifikasi', { ascending: false })
    .order('created_at', { ascending: false })
    .range(dari, dari + PER_HALAMAN_TOKO - 1);
  if (q.value) kueri = kueri.ilike('nama_toko', `%${q.value}%`);
  if (filterAktif.value === 'verif') kueri = kueri.eq('terverifikasi', true);
  if (filterAktif.value === 'antar') kueri = kueri.neq('layanan_antar', false);
  if (filterAktif.value === 'ambil') kueri = kueri.eq('layanan_ambil', true);

  const { data, count } = await kueri;
  if (saya !== token) return;
  const lengkap = await lengkapiToko(data ?? []);
  if (saya !== token) return;

  daftar.value = lengkap;
  total.value = count ?? daftar.value.length;
  pernahMuat.value = true;
  sedangMemuat.value = false;
};

watch([q, halaman, filterAktif], muat, { immediate: true });
watch(halaman, async () => {
  await nextTick();
  areaHasil.value?.scrollIntoView({ block: 'start' });
});

watch(
  [halaman, q, filterAktif],
  ([h, kata, f]) => {
    const dasar = `${BASE_URL}/toko`;
    useSeo({
      title: `Toko di ${LOKASI_PENDEK}${h > 1 ? ` — Halaman ${h}` : ''}`,
      description: `Daftar toko dan penyedia jasa dari warga ${LOKASI}. Lihat produknya dan pesan lewat WhatsApp.`,
      url: h > 1 ? `${dasar}?halaman=${h}` : dasar,
      noindex: Boolean(kata || f), // hasil pencarian dan saringan tidak perlu diindeks
    });
    pasangBreadcrumb([
      { name: 'Beranda', url: `${BASE_URL}/` },
      { name: 'Toko', url: dasar },
    ]);
  },
  { immediate: true },
);
</script>

<style scoped>
.kepala {
  background: var(--sage);
  color: var(--sungai-dalam);
  border-radius: 0 0 28px 28px;
  padding: 1.25rem 0 1.6rem;
}
.kepala-dalam {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
}
@media (min-width: 820px) {
  .kepala-dalam {
    grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
    align-items: end;
    gap: 2rem;
  }
}
.remah {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 0.8rem;
  font-size: 0.9rem;
  color: var(--ink-2);
}
.remah a {
  color: var(--sungai);
  font-weight: 700;
  text-decoration: none;
}
.kepala-judul {
  font-size: clamp(1.7rem, 4.8vw, 2.5rem);
  line-height: 1.1;
  color: var(--sungai-dalam);
}
.kepala-sub {
  margin-top: 0.5rem;
  max-width: 60ch;
  color: var(--ink-2);
  line-height: 1.6;
}
.cari {
  position: relative;
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
  padding: 0 1.2rem 0 2.9rem;
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
.cari-input:focus {
  outline: none;
  box-shadow:
    0 0 0 3px #fff,
    0 0 0 6px var(--sungai-sedang);
}

.saring {
  padding: 0.7rem 0 0.2rem;
  background: var(--dinding);
}

.hasil {
  background: var(--dinding);
  padding: 0.8rem 0 4rem;
  min-height: 50vh;
  scroll-margin-top: calc(var(--nav-h) + 1rem);
}
.hasil-info {
  margin-bottom: 1rem;
  color: var(--ink-2);
}
.hasil-info strong {
  color: var(--ink);
}

/* ── Grid kartu toko (kartunya: components/KartuToko.vue) ─── */
.grid-toko {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.25rem;
}
@media (min-width: 700px) {
  .grid-toko {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (min-width: 1100px) {
  .grid-toko {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
.grid-toko.memuat {
  opacity: 0.55;
  pointer-events: none;
}
</style>
