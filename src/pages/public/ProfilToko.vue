<template>
  <LayoutPublic>
    <div v-if="loading" class="memuat">
      <div class="spinner"></div>
      <p>Membuka toko…</p>
    </div>

    <div v-else-if="!toko" class="wadah tidak-ada">
      <div class="kosong">
        <StoreIcon :size="48" :stroke-width="2" />
        <h3>Toko ini tidak ditemukan</h3>
        <p>Mungkin tautannya salah, atau tokonya sedang tidak aktif.</p>
        <RouterLink to="/produk" class="tombol tombol-merah">Lihat produk lain</RouterLink>
      </div>
    </div>

    <template v-else>
      <!-- PAPAN TOKO -->
      <section class="depan-toko">
        <div class="wadah depan-dalam">
          <div class="papan-nama">
            <span class="toko-foto">
              <img v-if="toko.foto_toko" :src="toko.foto_toko" :alt="`Foto ${toko.nama_toko}`" />
              <StoreIcon v-else :size="40" :stroke-width="2" />
            </span>
            <div class="papan-teks">
              <h1 class="toko-nama huruf-papan">{{ toko.nama_toko }}</h1>
              <p v-if="toko.alamat" class="toko-alamat">
                <MapPin :size="18" :stroke-width="2.25" />
                {{ toko.alamat }}
              </p>
            </div>
          </div>

          <p v-if="toko.deskripsi" class="toko-cerita">{{ toko.deskripsi }}</p>

          <div class="toko-aksi">
            <a :href="tautanChat" target="_blank" rel="noopener" class="tombol tombol-kuning tombol-besar">
              <IkonWa :size="22" />
              Chat penjual di WA
            </a>
            <button type="button" class="tombol tombol-besar tombol-terang" @click="salinTautan">
              <Check v-if="tersalin" :size="20" :stroke-width="2.75" />
              <Share2 v-else :size="20" :stroke-width="2.5" />
              {{ tersalin ? 'Tautan disalin' : 'Bagikan toko' }}
            </button>
          </div>
        </div>
      </section>

      <!-- PRODUK -->
      <section class="produk-toko">
        <div class="wadah">
          <div class="kepala-produk">
            <h2 class="judul-produk huruf-papan">
              {{ produkList.length }} produk
            </h2>
          </div>

          <div v-if="kategoriTersedia.length > 2" class="deret-chip" role="group" aria-label="Kategori">
            <button
              v-for="k in kategoriTersedia"
              :key="k.slug"
              type="button"
              class="chip"
              :aria-pressed="kategoriAktif === k.slug"
              @click="kategoriAktif = k.slug"
            >
              <component :is="k.icon" :size="18" :stroke-width="2.25" />
              {{ k.label }}
            </button>
          </div>

          <div v-if="produkFiltered.length" class="grid-produk">
            <KartuProduk v-for="p in produkFiltered" :key="p.id" :produk="p" :tampil-toko="false" />
          </div>
          <div v-else class="kosong">
            <PackageOpen :size="44" :stroke-width="2" />
            <h3>Belum ada produk</h3>
            <p>Toko ini belum memajang produk. Coba tanya langsung lewat WA.</p>
          </div>
        </div>
      </section>
    </template>
  </LayoutPublic>
</template>

<script setup>
import { ref, computed, onMounted, markRaw } from 'vue';
import { useRoute } from 'vue-router';
import {
  Store as StoreIcon,
  MapPin,
  Share2,
  Check,
  PackageOpen,
  LayoutGrid,
} from 'lucide-vue-next';
import { supabase } from '@/lib/supabase';
import LayoutPublic from '@/layouts/LayoutPublic.vue';
import KartuProduk from '@/components/KartuProduk.vue';
import IkonWa from '@/components/IkonWa.vue';
import { tautanWa } from '@/lib/utils';
import { useStoreSeo } from '@/lib/useSeo';
import { KATEGORI } from '@/lib/kategori';

const route = useRoute();
const loading = ref(true);
const toko = ref(null);
const produkList = ref([]);
const kategoriAktif = ref('semua');
const tersalin = ref(false);

// Hanya tampilkan kategori yang ada produknya
const kategoriTersedia = computed(() => {
  const slugs = new Set(produkList.value.map((p) => p.kategori));
  return [
    { slug: 'semua', label: 'Semua', icon: markRaw(LayoutGrid) },
    ...KATEGORI.filter((k) => slugs.has(k.slug)),
  ];
});

const produkFiltered = computed(() => {
  if (kategoriAktif.value === 'semua') return produkList.value;
  return produkList.value.filter((p) => p.kategori === kategoriAktif.value);
});

const tautanChat = computed(() =>
  tautanWa(
    toko.value?.nomor_wa,
    `Halo ${toko.value?.nama_toko}, saya lihat toko Anda di ItahBangkuang. Boleh saya bertanya?`,
  ),
);

const salinTautan = async () => {
  await navigator.clipboard.writeText(window.location.href);
  tersalin.value = true;
  setTimeout(() => (tersalin.value = false), 2500);
};

onMounted(async () => {
  const { data: t } = await supabase
    .from('toko')
    .select('*')
    .eq('id', route.params.id)
    .eq('status', 'AKTIF')
    .single();
  if (!t) {
    loading.value = false;
    return;
  }

  toko.value = t;

  useStoreSeo({
    namaTokoNama: t.nama_toko,
    deskripsi: t.deskripsi,
    foto: t.foto_toko,
    alamat: t.alamat,
    tokoId: t.id,
  });

  const { data: produk } = await supabase
    .from('produk')
    .select('*')
    .eq('toko_id', t.id)
    .eq('status', 'AKTIF')
    .order('created_at', { ascending: false });

  produkList.value = produk ?? [];
  loading.value = false;
});
</script>

<style scoped>
.tidak-ada {
  padding-top: 3rem;
  padding-bottom: 4rem;
}

.depan-toko {
  background: var(--sage);
  color: var(--sungai-dalam);
  border-radius: 0 0 32px 32px;
  padding: 2rem 0 2.5rem;
}
.depan-dalam {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.papan-nama {
  display: flex;
  align-items: center;
  gap: 1rem;
  align-self: flex-start;
  max-width: 100%;
  padding: 1rem 1.25rem 1rem 1rem;
  background: var(--papan);
  color: var(--tinta);
  border: 1.5px solid var(--garis-lembut);
  border-radius: 28px;
  box-shadow: var(--bayang);
}
.toko-foto {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 76px;
  height: 76px;
  background: var(--aprikot-muda);
  border: 1.5px solid var(--garis-lembut);
  border-radius: 50%;
  overflow: hidden;
}
.toko-foto img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.papan-teks {
  min-width: 0;
}
.toko-nama {
  font-size: clamp(1.5rem, 5.5vw, 2.6rem);
  line-height: 1.05;
  overflow-wrap: anywhere;
}
.toko-alamat {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 0.4rem;
  color: var(--tinta-2);
  font-weight: 700;
}
.toko-cerita {
  max-width: 62ch;
  font-size: 1.05rem;
  line-height: 1.6;
  color: var(--ink-2);
  white-space: pre-line;
}
.toko-aksi {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}
.tombol-terang {
  --t-bg: #fff;
  --t-bg-hover: var(--sage-2);
  --t-fg: var(--sungai);
  border-color: var(--sage-2);
}
@media (max-width: 520px) {
  .toko-aksi .tombol {
    flex: 1 1 100%;
  }
  .papan-nama {
    align-self: stretch;
  }
  .toko-foto {
    width: 60px;
    height: 60px;
  }
}

.produk-toko {
  background: var(--dinding);
  padding: 2rem 0 4rem;
  min-height: 40vh;
}
.kepala-produk {
  margin-bottom: 0.75rem;
}
.judul-produk {
  font-size: clamp(1.3rem, 3.6vw, 1.75rem);
}
.produk-toko .deret-chip {
  margin-bottom: 1rem;
}
</style>
