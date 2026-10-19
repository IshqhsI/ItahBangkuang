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
            <article v-for="t in daftar" :key="t.id" class="toko-kartu">
              <!-- Sampul: kolase foto produk -->
              <div class="sampul">
                <div class="kolase" :class="`kolase-${Math.min(t.foto.length, 3)}`" aria-hidden="true">
                  <img v-for="(f, i) in t.foto.slice(0, 3)" :key="i" :src="f" alt="" loading="lazy" />
                  <span v-if="!t.foto.length" class="kolase-kosong"><Store :size="36" :stroke-width="1.5" /></span>
                </div>
                <span v-if="t.terverifikasi" class="lencana lencana-verif">
                  <BadgeCheck :size="15" :stroke-width="2.25" />
                  Terverifikasi
                </span>
                <span
                  v-if="t.status_buka"
                  class="lencana lencana-buka"
                  :class="{ tutup: !t.status_buka.buka }"
                >
                  <span class="titik" aria-hidden="true"></span>
                  {{ t.status_buka.teks }}
                </span>
              </div>

              <div class="isi">
                <div class="toko-kepala">
                  <span class="toko-foto">
                    <img v-if="t.foto_toko" :src="t.foto_toko" :alt="`Foto ${t.nama_toko}`" loading="lazy" />
                    <Store v-else :size="24" :stroke-width="1.75" />
                  </span>
                  <div class="toko-teks">
                    <h2 class="toko-nama">
                      <RouterLink :to="urlToko(t)" class="toko-tautan">{{ t.nama_toko }}</RouterLink>
                    </h2>
                    <p v-if="t.alamat" class="toko-alamat">
                      <MapPin :size="14" :stroke-width="2" />
                      <span>{{ t.alamat }}</span>
                    </p>
                  </div>
                </div>

                <p v-if="t.kategori.length" class="toko-kategori">{{ t.kategori.join(' · ') }}</p>

                <ul class="toko-meta">
                  <li><LayoutGrid :size="15" :stroke-width="2" /> {{ t.jumlahProduk }} produk</li>
                  <li v-if="t.layanan_pesan === false" class="etalase"><Eye :size="15" :stroke-width="2" /> Etalase</li>
                  <li v-if="t.layanan_antar !== false"><Truck :size="15" :stroke-width="2" /> Bisa diantar</li>
                  <li v-if="t.layanan_ambil === true"><Store :size="15" :stroke-width="2" /> Ambil di tempat</li>
                </ul>

                <div class="toko-aksi">
                  <span class="toko-lihat">
                    Lihat toko
                    <ArrowRight :size="18" :stroke-width="2" />
                  </span>
                  <a
                    v-if="t.nomor_wa"
                    :href="tautanWa(t.nomor_wa, `Halo ${t.nama_toko}, saya melihat toko Anda di ItahBangkuang. Boleh saya bertanya?`)"
                    target="_blank"
                    rel="noopener"
                    class="toko-wa"
                    :aria-label="`Chat ${t.nama_toko} di WhatsApp`"
                  >
                    <IkonWa :size="20" />
                  </a>
                </div>
              </div>
            </article>
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
import {
  Search, Store, MapPin, ArrowRight, BadgeCheck, ChevronRight, LayoutGrid, Truck, Eye, ShieldCheck,
} from 'lucide-vue-next';
import { supabase } from '@/lib/supabase';
import LayoutPublic from '@/layouts/LayoutPublic.vue';
import Paginasi from '@/components/Paginasi.vue';
import IkonWa from '@/components/IkonWa.vue';
import { useSeo, pasangBreadcrumb, BASE_URL } from '@/lib/useSeo';
import { LOKASI, LOKASI_PENDEK } from '../../../api/_kategori.js';
import { urlToko } from '@/lib/tautan';
import { tautanWa } from '@/lib/utils';
import { labelKategori } from '@/lib/kategori';
import { statusBuka } from '@/lib/jamBuka';

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
    .select(
      'id, slug, nama_toko, alamat, foto_toko, nomor_wa, terverifikasi, created_at, jam_buka, layanan_pesan, layanan_antar, layanan_ambil',
      { count: 'exact' },
    )
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
  const toko = data ?? [];

  // Foto, jumlah, dan kategori produk tiap toko (view katalog: hanya produk aktif milik toko aktif)
  const perToko = {};
  if (toko.length) {
    const { data: produk } = await supabase
      .from('produk_katalog')
      .select('toko_id, foto_url, kategori, stok_total')
      .in('toko_id', toko.map((t) => t.id))
      .order('created_at', { ascending: false })
      .limit(400);
    for (const p of produk ?? []) {
      const e = (perToko[p.toko_id] ??= { jumlah: 0, foto: [], kat: {} });
      e.jumlah += 1;
      e.kat[p.kategori] = (e.kat[p.kategori] ?? 0) + 1;
      if (p.foto_url && e.foto.length < 3 && Number(p.stok_total) > 0) e.foto.push(p.foto_url);
    }
    // Toko yang produknya habis semua tetap diberi foto
    for (const p of produk ?? []) {
      const e = perToko[p.toko_id];
      if (p.foto_url && e.foto.length < 3 && !e.foto.includes(p.foto_url)) e.foto.push(p.foto_url);
    }
  }
  if (saya !== token) return;

  daftar.value = toko.map((t) => {
    const e = perToko[t.id];
    return {
      ...t,
      jumlahProduk: e?.jumlah ?? 0,
      foto: e?.foto ?? [],
      // dua kategori terbanyak
      kategori: Object.entries(e?.kat ?? {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([k]) => labelKategori(k)),
      status_buka: statusBuka(t.jam_buka),
    };
  });
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

/* ── Kartu toko ───────────────────────────────────────────── */
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

.toko-kartu {
  position: relative; /* tautan nama meliputi seluruh kartu */
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: var(--bayang);
  color: var(--ink);
  transition:
    transform 0.3s var(--ease-out),
    box-shadow 0.3s ease;
}
.toko-kartu:hover {
  transform: translateY(-4px);
  box-shadow: var(--bayang-naik);
}

/* Sampul */
.sampul {
  position: relative;
}
.kolase {
  display: grid;
  gap: 3px;
  height: 160px;
  background: var(--sage);
  overflow: hidden;
}
.kolase img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s var(--ease-out);
}
.toko-kartu:hover .kolase img {
  transform: scale(1.04);
}
.kolase-0,
.kolase-1 {
  grid-template-columns: 1fr;
}
.kolase-2 {
  grid-template-columns: 1fr 1fr;
}
.kolase-3 {
  grid-template-columns: 1.4fr 1fr;
  grid-template-rows: 1fr 1fr;
}
.kolase-3 img:first-child {
  grid-row: span 2;
}
.kolase-kosong {
  display: grid;
  place-items: center;
  color: var(--sungai);
}
.lencana {
  position: absolute;
  top: 0.7rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.7rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 999px;
  box-shadow: 0 2px 8px rgba(29, 42, 38, 0.15);
  font-size: 0.76rem;
  font-weight: 800;
  line-height: 1.2;
}
.lencana-verif {
  left: 0.7rem;
  color: var(--sungai);
}
.lencana-buka {
  right: 0.7rem;
  color: var(--sungai);
}
.lencana-buka .titik {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2f9e62;
  box-shadow: 0 0 0 3px rgba(47, 158, 98, 0.2);
}
.lencana-buka.tutup {
  color: var(--ink-2);
}
.lencana-buka.tutup .titik {
  background: #a3aea9;
  box-shadow: 0 0 0 3px rgba(163, 174, 169, 0.25);
}

/* Isi */
.isi {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 0 1.15rem 1.1rem;
}
.toko-kepala {
  position: relative;
  z-index: 1; /* di atas sampul supaya foto toko tidak terpotong */
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  margin-top: -1.6rem; /* foto toko menumpuk di tepi sampul */
  pointer-events: none; /* klik tetap jatuh ke tautan yang meliputi kartu */
}
.toko-kepala .toko-tautan {
  pointer-events: auto;
}
.toko-foto {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--sage);
  color: var(--sungai);
  border: 3px solid #fff;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(29, 42, 38, 0.12);
}
.toko-foto img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.toko-teks {
  flex: 1;
  min-width: 0;
  padding-top: 1.85rem;
}
.toko-nama {
  font-family: var(--font-papan);
  font-weight: 600;
  font-size: 1.2rem;
  line-height: 1.25;
}
.toko-tautan {
  color: inherit;
  text-decoration: none;
}
.toko-tautan::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
}
.toko-tautan:focus-visible {
  outline: none;
}
.toko-kartu:has(.toko-tautan:focus-visible) {
  outline: 3px solid var(--sungai-sedang);
  outline-offset: 3px;
}
.toko-alamat {
  display: flex;
  align-items: flex-start;
  gap: 0.3rem;
  margin-top: 0.2rem;
  font-size: 0.88rem;
  line-height: 1.4;
  color: var(--ink-2);
}
.toko-alamat svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.toko-kategori {
  margin-top: 0.9rem;
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--sungai-sedang);
}
.toko-meta {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 1rem;
  margin-top: 0.6rem;
  color: var(--ink-2);
  font-size: 0.86rem;
}
.toko-meta li {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
.toko-meta svg {
  color: var(--sungai);
}
.toko-meta .etalase {
  color: #7a4a24;
  font-weight: 700;
}
.toko-meta .etalase svg {
  color: #7a4a24;
}

.toko-aksi {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: auto;
  padding-top: 1rem;
}
.toko-lihat {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--sungai);
  font-weight: 800;
  font-size: 0.95rem;
}
.toko-lihat svg {
  transition: transform 0.3s var(--ease-out);
}
.toko-kartu:hover .toko-lihat svg {
  transform: translateX(4px);
}
.toko-wa {
  position: relative;
  z-index: 2; /* di atas tautan yang meliputi kartu */
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--sage);
  color: var(--sungai);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}
.toko-wa:hover {
  background: var(--sungai);
  color: #fff;
}
</style>
