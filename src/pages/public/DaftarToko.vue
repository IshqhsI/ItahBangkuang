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
          <h1 class="kepala-judul huruf-papan">Toko di {{ LOKASI_PENDEK }}</h1>
          <p class="kepala-sub">
            Toko dan penyedia jasa dari warga {{ LOKASI }}. Toko bertanda Terverifikasi sudah
            diperiksa admin.
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

    <section ref="areaHasil" class="hasil">
      <div class="wadah">
        <p v-if="pernahMuat && total > 0" class="hasil-info" aria-live="polite">
          <strong>{{ total }}</strong> toko<template v-if="q"> untuk “{{ q }}”</template>
          <template v-if="jumlahHalaman > 1"> · halaman {{ halaman }} dari {{ jumlahHalaman }}</template>
        </p>

        <div v-if="!pernahMuat" class="grid-toko">
          <div v-for="n in 6" :key="n" class="kerangka" style="height: 92px; border-radius: 999px"></div>
        </div>

        <template v-else-if="daftar.length">
          <div class="grid-toko" :class="{ memuat: sedangMemuat }">
            <RouterLink v-for="t in daftar" :key="t.id" :to="`/toko/${t.id}`" class="toko-kartu">
              <span class="toko-foto">
                <img v-if="t.foto_toko" :src="t.foto_toko" :alt="`Foto ${t.nama_toko}`" loading="lazy" />
                <Store v-else :size="26" :stroke-width="1.75" />
              </span>
              <span class="toko-teks">
                <span class="toko-nama">
                  {{ t.nama_toko }}
                  <BadgeCheck v-if="t.terverifikasi" class="toko-verif" :size="16" :stroke-width="2.25" aria-label="Terverifikasi" />
                </span>
                <span v-if="t.alamat" class="toko-alamat">
                  <MapPin :size="14" :stroke-width="2" />
                  {{ t.alamat }}
                </span>
              </span>
              <ArrowRight class="toko-panah" :size="20" :stroke-width="2" />
            </RouterLink>
          </div>
          <Paginasi :halaman="halaman" :total="total" :per-halaman="PER_HALAMAN_TOKO" />
        </template>

        <div v-else class="kosong">
          <Store :size="44" :stroke-width="1.75" />
          <h3>{{ q ? 'Toko tidak ditemukan' : 'Belum ada toko' }}</h3>
          <p>{{ q ? 'Coba nama lain yang lebih singkat.' : 'Belum ada penjual yang mendaftar.' }}</p>
          <button v-if="q" type="button" class="tombol" @click="keyword = ''">Hapus pencarian</button>
        </div>
      </div>
    </section>
  </LayoutPublic>
</template>

<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Search, Store, MapPin, ArrowRight, BadgeCheck, ChevronRight } from 'lucide-vue-next';
import { supabase } from '@/lib/supabase';
import LayoutPublic from '@/layouts/LayoutPublic.vue';
import Paginasi from '@/components/Paginasi.vue';
import { useSeo, pasangBreadcrumb, BASE_URL } from '@/lib/useSeo';
import { LOKASI, LOKASI_PENDEK } from '../../../api/_kategori.js';

const PER_HALAMAN_TOKO = 24;

const route = useRoute();
const router = useRouter();
const q = computed(() => String(route.query.q ?? '').trim());
const halaman = computed(() => Math.max(1, parseInt(route.query.halaman, 10) || 1));

const keyword = ref(q.value);
let tunda = null;
const terapkanCari = () => {
  clearTimeout(tunda);
  const kata = keyword.value.trim();
  if (kata !== q.value) router.replace({ query: kata ? { q: kata } : {} });
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
    .select('id, nama_toko, alamat, foto_toko, terverifikasi, created_at', { count: 'exact' })
    .eq('status', 'AKTIF')
    // Toko terverifikasi lebih dulu, lalu yang terbaru
    .order('terverifikasi', { ascending: false })
    .order('created_at', { ascending: false })
    .range(dari, dari + PER_HALAMAN_TOKO - 1);
  if (q.value) kueri = kueri.ilike('nama_toko', `%${q.value}%`);

  const { data, count } = await kueri;
  if (saya !== token) return;
  daftar.value = data ?? [];
  total.value = count ?? daftar.value.length;
  pernahMuat.value = true;
  sedangMemuat.value = false;
};

watch([q, halaman], muat, { immediate: true });
watch(halaman, async () => {
  await nextTick();
  areaHasil.value?.scrollIntoView({ block: 'start' });
});

watch(
  [halaman, q],
  ([h, kata]) => {
    const dasar = `${BASE_URL}/toko`;
    useSeo({
      title: `Toko di ${LOKASI_PENDEK}${h > 1 ? ` — Halaman ${h}` : ''}`,
      description: `Daftar toko dan penyedia jasa dari warga ${LOKASI}. Lihat produknya dan pesan lewat WhatsApp.`,
      url: h > 1 ? `${dasar}?halaman=${h}` : dasar,
      noindex: Boolean(kata),
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

.hasil {
  background: var(--dinding);
  padding: 1.4rem 0 4rem;
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
.grid-toko {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 330px), 1fr));
  gap: 0.85rem;
}
.grid-toko.memuat {
  opacity: 0.55;
  pointer-events: none;
}
.toko-kartu {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 1.1rem 0.9rem 0.9rem;
  background: #fff;
  border-radius: 999px;
  box-shadow: var(--bayang);
  text-decoration: none;
  color: var(--ink);
  transition:
    transform 0.3s var(--ease-out),
    box-shadow 0.3s ease;
}
.toko-kartu:hover {
  transform: translateY(-3px);
  box-shadow: var(--bayang-naik);
}
.toko-foto {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--sage);
  color: var(--sungai);
  overflow: hidden;
}
.toko-foto img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.toko-teks {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.toko-nama {
  font-weight: 700;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.toko-verif {
  display: inline-block;
  vertical-align: -2px;
  margin-left: 0.2rem;
  color: var(--sungai-sedang);
}
.toko-alamat {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.88rem;
  color: var(--ink-2);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.toko-panah {
  flex-shrink: 0;
  color: var(--sungai);
}
</style>
