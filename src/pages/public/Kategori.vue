<template>
  <LayoutPublic>
    <div v-if="!info" class="wadah tidak-ada">
      <div class="kosong">
        <SearchX :size="44" :stroke-width="1.75" />
        <h3>Kategori tidak ditemukan</h3>
        <p>Kategori yang Anda cari tidak tersedia.</p>
        <RouterLink to="/produk" class="tombol tombol-merah">Lihat semua produk</RouterLink>
      </div>
    </div>

    <template v-else>
      <section class="kepala">
        <div class="wadah">
          <nav class="remah" aria-label="Lokasi halaman">
            <RouterLink to="/">Beranda</RouterLink>
            <ChevronRight :size="16" :stroke-width="2.25" aria-hidden="true" />
            <RouterLink to="/produk">Produk</RouterLink>
            <ChevronRight :size="16" :stroke-width="2.25" aria-hidden="true" />
            <span aria-current="page">{{ info.label }}</span>
          </nav>
          <h1 class="kepala-judul huruf-papan">{{ info.label }} di {{ LOKASI_PENDEK }}</h1>
          <p class="kepala-intro">{{ info.intro }}</p>
        </div>
      </section>

      <div class="saring">
        <div class="wadah">
          <nav class="deret-chip" aria-label="Kategori lain">
            <RouterLink
              v-for="k in daftarKategori"
              :key="k.slug"
              :to="`/kategori/${slugUrl(k.slug)}`"
              class="chip"
              :class="{ aktif: k.slug === slug }"
              :aria-current="k.slug === slug ? 'page' : undefined"
            >
              {{ k.label }}
            </RouterLink>
          </nav>
        </div>
      </div>

      <section class="hasil">
        <div class="wadah">
          <div v-if="memuat" class="grid-produk">
            <div v-for="n in 8" :key="n" class="kerangka" style="aspect-ratio: 4 / 5.6; border-radius: 20px"></div>
          </div>

          <template v-else-if="produk.length">
            <p class="hasil-info">
              <strong>{{ total }}</strong> produk {{ info.label.toLowerCase() }}
              <template v-if="total > PER_HALAMAN"> · halaman {{ halaman }} dari {{ Math.ceil(total / PER_HALAMAN) }}</template>
            </p>
            <div class="grid-produk">
              <KartuProduk v-for="p in produk" :key="p.id" :produk="p" />
            </div>
            <Paginasi :halaman="halaman" :total="total" :per-halaman="PER_HALAMAN" />
          </template>

          <div v-else class="kosong">
            <SearchX :size="44" :stroke-width="1.75" />
            <h3>Belum ada produk</h3>
            <p>Belum ada penjual yang menambahkan produk di kategori {{ info.label }}.</p>
            <RouterLink to="/produk" class="tombol tombol-merah">Lihat semua produk</RouterLink>
          </div>

          <section class="teks-bawah" aria-labelledby="judul-cara">
            <h2 id="judul-cara">Cara memesan {{ info.label.toLowerCase() }}</h2>
            <p>
              Pilih produk, isi nama dan alamat, lalu pilih COD atau transfer. Penjual akan
              mengonfirmasi pesanan melalui WhatsApp, dan pengantaran diatur langsung dengan
              penjual.
            </p>
            <p v-if="info.contoh?.length">
              Yang dapat Anda temukan di kategori ini antara lain: {{ info.contoh.join(', ') }}.
            </p>
          </section>
        </div>
      </section>
    </template>
  </LayoutPublic>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { SearchX, ChevronRight } from 'lucide-vue-next';
import LayoutPublic from '@/layouts/LayoutPublic.vue';
import KartuProduk from '@/components/KartuProduk.vue';
import Paginasi from '@/components/Paginasi.vue';
import { useSeo, pasangBreadcrumb, BASE_URL } from '@/lib/useSeo';
import { cariKatalog, PER_HALAMAN } from '@/lib/katalog';
import {
  KATEGORI_TEKS,
  LOKASI,
  LOKASI_PENDEK,
  slugUrl,
  slugDariUrl,
} from '../../../api/_kategori.js';

const route = useRoute();
const slug = computed(() => slugDariUrl(route.params.slug));
const info = computed(() => KATEGORI_TEKS[slug.value] ?? null);
const daftarKategori = Object.entries(KATEGORI_TEKS).map(([s, v]) => ({ slug: s, label: v.label }));

const produk = ref([]);
const total = ref(0);
const memuat = ref(true);
const halaman = computed(() => Math.max(1, parseInt(route.query.halaman, 10) || 1));

const pasangSeo = () => {
  if (!info.value) {
    useSeo({ title: 'Kategori tidak ditemukan', noindex: true });
    return;
  }
  const dasar = `${BASE_URL}/kategori/${slugUrl(slug.value)}`;
  const url = halaman.value > 1 ? `${dasar}?halaman=${halaman.value}` : dasar;
  useSeo({
    title: `${info.value.label} di ${LOKASI_PENDEK}${halaman.value > 1 ? ` — Halaman ${halaman.value}` : ''}`,
    description: `${info.value.label} dari warga ${LOKASI}. Lihat produk, cek harga dan stok, lalu pesan lewat WhatsApp.`,
    url,
  });
  pasangBreadcrumb([
    { name: 'Beranda', url: `${BASE_URL}/` },
    { name: 'Produk', url: `${BASE_URL}/produk` },
    { name: info.value.label, url: dasar },
  ]);
};

let token = 0;
const muat = async () => {
  pasangSeo();
  if (!info.value) {
    memuat.value = false;
    return;
  }
  const saya = ++token;
  memuat.value = true;
  const hasil = await cariKatalog({
    kategori: slug.value,
    sembunyikanHabis: false, // halaman kategori menampilkan semuanya; yang habis di belakang
    urut: 'beragam',
    halaman: halaman.value,
  });
  if (saya !== token) return;
  produk.value = hasil.baris;
  total.value = hasil.total;
  memuat.value = false;
  if (halaman.value > 1) window.scrollTo({ top: 0 });
};

watch([slug, halaman], muat, { immediate: true });
</script>

<style scoped>
.tidak-ada {
  padding-top: 3rem;
  padding-bottom: 4rem;
}

.kepala {
  background: var(--sage);
  color: var(--sungai-dalam);
  border-radius: 0 0 28px 28px;
  padding: 1.25rem 0 1.75rem;
}
.remah {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.9rem;
  font-size: 0.9rem;
  color: var(--ink-2);
}
.remah a {
  color: var(--sungai);
  font-weight: 700;
  text-decoration: none;
}
.remah a:hover {
  text-decoration: underline;
}
.kepala-judul {
  font-size: clamp(1.7rem, 4.8vw, 2.5rem);
  line-height: 1.1;
  color: var(--sungai-dalam);
  text-wrap: balance;
}
.kepala-intro {
  margin-top: 0.7rem;
  max-width: 68ch;
  font-size: 1.02rem;
  line-height: 1.65;
  color: var(--ink-2);
}

.saring {
  position: sticky;
  top: var(--nav-h);
  z-index: 20;
  padding: 0.5rem 0 0.2rem;
  background: rgba(244, 246, 242, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--sage-2);
}

.hasil {
  background: var(--dinding);
  padding: 1.4rem 0 4rem;
  min-height: 45vh;
}
.hasil-info {
  margin-bottom: 1rem;
  color: var(--ink-2);
}
.hasil-info strong {
  color: var(--ink);
}
.teks-bawah {
  max-width: 68ch;
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--sage-2);
}
.teks-bawah h2 {
  font-family: var(--font-papan);
  font-weight: 600;
  font-size: 1.3rem;
  color: var(--sungai);
}
.teks-bawah p {
  margin-top: 0.6rem;
  line-height: 1.65;
  color: var(--ink-2);
}
</style>
