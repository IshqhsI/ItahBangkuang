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
            Toko dan penyedia jasa dari warga Bangkuang. Yang bertanda centang sudah diperiksa admin.
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
          <div v-for="n in 3" :key="n" class="kerangka" style="height: 300px; border-radius: 26px"></div>
        </div>

        <template v-else-if="daftar.length">
          <div class="grid-toko" :class="{ memuat: sedangMemuat }">
            <RouterLink v-for="t in daftar" :key="t.id" :to="urlToko(t)" class="toko-kartu">
              <!-- Kolase foto produk -->
              <span class="kolase" :class="`kolase-${Math.min(t.foto.length, 3)}`" aria-hidden="true">
                <img v-for="(f, i) in t.foto.slice(0, 3)" :key="i" :src="f" alt="" loading="lazy" />
                <span v-if="!t.foto.length" class="kolase-kosong"><Store :size="34" :stroke-width="1.5" /></span>
              </span>

              <span class="toko-isi">
                <span class="toko-foto">
                  <img v-if="t.foto_toko" :src="t.foto_toko" :alt="`Foto ${t.nama_toko}`" loading="lazy" />
                  <Store v-else :size="24" :stroke-width="1.75" />
                </span>

                <span class="toko-teks">
                  <span class="toko-nama">
                    {{ t.nama_toko }}
                    <BadgeCheck
                      v-if="t.terverifikasi"
                      class="toko-verif"
                      :size="18"
                      :stroke-width="2.25"
                      aria-label="Terverifikasi"
                    />
                  </span>
                  <span v-if="t.alamat" class="toko-alamat">
                    <MapPin :size="14" :stroke-width="2" />
                    <span>{{ t.alamat }}</span>
                  </span>
                </span>
              </span>

              <span class="toko-label">
                <span class="label-produk">{{ t.jumlahProduk }} produk</span>
                <span v-if="t.layanan_pesan === false" class="label-etalase">Etalase</span>
                <span v-if="t.layanan_antar !== false">Bisa diantar</span>
                <span v-if="t.layanan_ambil === true">Ambil di tempat</span>
              </span>

              <span class="toko-lihat">
                Lihat toko
                <ArrowRight :size="18" :stroke-width="2" />
              </span>
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
import { urlToko } from '@/lib/tautan';

const PER_HALAMAN_TOKO = 12;

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
    .select(
      'id, slug, nama_toko, alamat, foto_toko, terverifikasi, created_at, layanan_pesan, layanan_antar, layanan_ambil',
      { count: 'exact' },
    )
    .eq('status', 'AKTIF')
    // Toko terverifikasi lebih dulu, lalu yang terbaru
    .order('terverifikasi', { ascending: false })
    .order('created_at', { ascending: false })
    .range(dari, dari + PER_HALAMAN_TOKO - 1);
  if (q.value) kueri = kueri.ilike('nama_toko', `%${q.value}%`);

  const { data, count } = await kueri;
  if (saya !== token) return;
  const toko = data ?? [];

  // Foto dan jumlah produk tiap toko (dari view katalog: hanya produk aktif milik toko aktif)
  const perToko = {};
  if (toko.length) {
    const { data: produk } = await supabase
      .from('produk_katalog')
      .select('toko_id, foto_url, stok_total')
      .in('toko_id', toko.map((t) => t.id))
      .order('created_at', { ascending: false })
      .limit(400);
    for (const p of produk ?? []) {
      const e = (perToko[p.toko_id] ??= { jumlah: 0, foto: [] });
      e.jumlah += 1;
      if (p.foto_url && e.foto.length < 3 && Number(p.stok_total) > 0) e.foto.push(p.foto_url);
    }
    // Toko yang produknya habis semua tetap diberi foto
    for (const p of produk ?? []) {
      const e = perToko[p.toko_id];
      if (p.foto_url && e.foto.length < 3 && !e.foto.includes(p.foto_url)) e.foto.push(p.foto_url);
    }
  }
  if (saya !== token) return;

  daftar.value = toko.map((t) => ({
    ...t,
    jumlahProduk: perToko[t.id]?.jumlah ?? 0,
    foto: perToko[t.id]?.foto ?? [],
  }));
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

/* ── Kartu toko ───────────────────────────────────────────── */
.grid-toko {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.1rem;
}
@media (min-width: 700px) {
  .grid-toko {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.25rem;
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
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 26px;
  overflow: hidden;
  box-shadow: var(--bayang);
  color: var(--ink);
  text-decoration: none;
  transition:
    transform 0.3s var(--ease-out),
    box-shadow 0.3s ease;
}
.toko-kartu:hover {
  transform: translateY(-4px);
  box-shadow: var(--bayang-naik);
}

/* Kolase 1–3 foto produk */
.kolase {
  display: grid;
  gap: 3px;
  height: 150px;
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

.toko-isi {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 0 1.1rem;
  margin-top: -1.6rem; /* foto toko menumpuk di tepi kolase */
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
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding-top: 1.75rem;
}
.toko-nama {
  font-family: var(--font-papan);
  font-weight: 600;
  font-size: 1.15rem;
  line-height: 1.25;
}
.toko-verif {
  display: inline-block;
  vertical-align: -3px;
  margin-left: 0.2rem;
  color: var(--sungai-sedang);
}
.toko-alamat {
  display: flex;
  align-items: flex-start;
  gap: 0.3rem;
  font-size: 0.88rem;
  line-height: 1.4;
  color: var(--ink-2);
}
.toko-alamat svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.toko-label {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  padding: 0.85rem 1.1rem 0;
}
.toko-label > span {
  padding: 0.2rem 0.7rem;
  background: var(--sage);
  border-radius: 999px;
  color: var(--sungai);
  font-size: 0.8rem;
  font-weight: 700;
}
.toko-label .label-produk {
  background: var(--sungai);
  color: #fff;
}
.toko-label .label-etalase {
  background: var(--aprikot-muda);
  color: #7a4a24;
}

.toko-lihat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding: 1rem 1.1rem 1.1rem;
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
</style>
