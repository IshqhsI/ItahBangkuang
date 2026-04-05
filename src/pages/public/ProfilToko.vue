<template>
  <LayoutPublic>
    <!-- LOADING -->
    <div v-if="loading" class="loading-wrap">
      <div class="spinner"></div>
      <p>Memuat toko...</p>
    </div>

    <!-- NOT FOUND -->
    <div v-else-if="!toko" class="not-found">
      <span>😕</span>
      <h2>Toko tidak ditemukan</h2>
      <RouterLink to="/produk" class="btn-back">← Kembali ke Produk</RouterLink>
    </div>

    <template v-else>
      <!-- HERO TOKO -->
      <div class="toko-hero">
        <div class="container">
          <div class="toko-hero-inner">
            <div class="toko-foto-wrap">
              <img
                v-if="toko.foto_toko"
                :src="toko.foto_toko"
                :alt="toko.nama_toko"
                class="toko-foto"
              />
              <div v-else class="toko-foto-placeholder">🏪</div>
            </div>
            <div class="toko-hero-info">
              <h1 class="toko-nama">{{ toko.nama_toko }}</h1>
              <p class="toko-alamat">📍 {{ toko.alamat }}</p>
              <p class="toko-desc" v-if="toko.deskripsi">
                {{ toko.deskripsi }}
              </p>
              <div class="toko-stats">
                <div class="toko-stat">
                  <span class="tstat-num">{{ produkList.length }}</span>
                  <span class="tstat-label">Produk</span>
                </div>
              </div>
            </div>
            <div class="toko-hero-actions">
              <button class="btn-wa-toko" @click="chatWA">
                💬 Chat WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- PRODUK TOKO -->
      <div class="container produk-section">
        <div class="section-head">
          <h2 class="section-title">Produk dari {{ toko.nama_toko }}</h2>
          <div class="kat-tabs">
            <button
              v-for="k in kategoriTersedia"
              :key="k.slug"
              class="kat-tab"
              :class="{ active: kategoriAktif === k.slug }"
              @click="kategoriAktif = k.slug"
            >
              {{ k.icon }} {{ k.nama }}
            </button>
          </div>
        </div>

        <div v-if="produkFiltered.length" class="produk-grid">
          <RouterLink
            v-for="p in produkFiltered"
            :key="p.id"
            :to="`/produk/${p.id}`"
            class="produk-card"
          >
            <div class="produk-foto-wrap">
              <img
                :src="p.foto_url"
                :alt="p.nama_produk"
                class="produk-foto"
                loading="lazy"
              />
              <span class="kat-badge">{{ labelKategori(p.kategori) }}</span>
              <span v-if="p.stok === 0" class="habis-badge">Habis</span>
            </div>
            <div class="produk-info">
              <h3 class="produk-nama">{{ p.nama_produk }}</h3>
              <div class="produk-footer">
                <span class="produk-harga">{{ formatRupiah(p.harga) }}</span>
                <span
                  class="produk-stok"
                  :class="{ low: p.stok <= 5 && p.stok > 0 }"
                >
                  {{ p.stok > 0 ? `Stok: ${p.stok}` : 'Habis' }}
                </span>
              </div>
            </div>
          </RouterLink>
        </div>

        <div v-else class="empty-state">
          <span>📭</span>
          <p>Belum ada produk di kategori ini</p>
        </div>
      </div>
    </template>
  </LayoutPublic>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '@/lib/supabase';
import LayoutPublic from '@/layouts/LayoutPublic.vue';
import { formatRupiah } from '@/lib/utils';
import { useStoreSeo } from '@/lib/useSeo';
import { KATEGORI, labelKategori } from '@/lib/kategori';

const route = useRoute();
const router = useRouter();
const user = ref(null);
const loading = ref(true);
const toko = ref(null);
const produkList = ref([]);
const kategoriAktif = ref('semua');

const semuaKategori = KATEGORI;

// Hanya tampilkan tab kategori yang ada produknya
const kategoriTersedia = computed(() => {
  const slugs = [...new Set(produkList.value.map((p) => p.kategori))];
  const tabs = [{ slug: 'semua', nama: 'Semua', icon: '🛒' }];
  semuaKategori.forEach((k) => {
    if (slugs.includes(k.slug)) tabs.push(k);
  });
  return tabs;
});

const produkFiltered = computed(() => {
  if (kategoriAktif.value === 'semua') return produkList.value;
  return produkList.value.filter((p) => p.kategori === kategoriAktif.value);
});

const chatWA = () => {
  const wa = toko.value?.nomor_wa?.replace(/^0/, '') ?? '';
  const pesan = `Halo, saya tertarik dengan produk di toko *${toko.value.nama_toko}*. Boleh saya tanya-tanya dulu?`;
  window.open(
    `https://wa.me/62${wa}?text=${encodeURIComponent(pesan)}`,
    '_blank',
  );
};

onMounted(async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) user.value = session.user;

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
    namaTokoNama: toko.value.nama_toko,
    deskripsi: toko.value.deskripsi,
    foto: toko.value.foto_toko,
    alamat: toko.value.alamat,
    tokoId: toko.value.id,
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
.loading-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 6rem;
  color: #6b7280;
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e8e0d0;
  border-top-color: #2d5016;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.not-found {
  text-align: center;
  padding: 6rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.not-found span {
  font-size: 3rem;
}
.not-found h2 {
  font-family: 'Lora', serif;
  font-size: 1.5rem;
}
.btn-back {
  color: #2d5016;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
}

/* HERO */
.toko-hero {
  background: linear-gradient(135deg, #2d5016, #3a6b1e);
  padding: 3rem 0;
}
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 2rem;
}
.toko-hero-inner {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}
.toko-foto-wrap {
  flex-shrink: 0;
}
.toko-foto {
  width: 96px;
  height: 96px;
  border-radius: 18px;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.2);
}
.toko-foto-placeholder {
  width: 96px;
  height: 96px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.8rem;
  border: 3px solid rgba(255, 255, 255, 0.2);
}
.toko-hero-info {
  flex: 1;
}
.toko-nama {
  font-family: 'Lora', serif;
  font-size: 2rem;
  font-weight: 700;
  color: #f5edd6;
  margin-bottom: 0.3rem;
}
.toko-alamat {
  color: #a8c97f;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}
.toko-desc {
  color: rgba(245, 237, 214, 0.8);
  font-size: 0.875rem;
  line-height: 1.6;
  margin-bottom: 0.75rem;
  max-width: 500px;
}
.toko-stats {
  display: flex;
  gap: 1.5rem;
}
.toko-stat {
  display: flex;
  flex-direction: column;
}
.tstat-num {
  font-family: 'Lora', serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: #f5edd6;
}
.tstat-label {
  font-size: 0.72rem;
  color: #a8c97f;
}
.toko-hero-actions {
  flex-shrink: 0;
}
.btn-wa-toko {
  background: #25d366;
  color: #fff;
  border: none;
  padding: 0.85rem 1.5rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}
.btn-wa-toko:hover {
  background: #1ebe5d;
}

/* PRODUK */
.produk-section {
  padding: 2.5rem 2rem 4rem;
}
.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.75rem;
  flex-wrap: wrap;
}
.section-title {
  font-family: 'Lora', serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a2e0a;
}
.kat-tabs {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.kat-tab {
  padding: 0.4rem 0.85rem;
  border: 1.5px solid #e8e0d0;
  border-radius: 999px;
  background: #fff;
  color: #6b7280;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.kat-tab:hover {
  border-color: #a8c97f;
  color: #2d5016;
}
.kat-tab.active {
  border-color: #2d5016;
  background: #2d5016;
  color: #f5edd6;
}

.produk-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
}
.produk-card {
  background: #fff;
  border: 1px solid #e8e0d0;
  border-radius: 16px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  display: block;
  transition: all 0.2s;
}
.produk-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  border-color: #a8c97f;
}
.produk-foto-wrap {
  position: relative;
}
.produk-foto {
  width: 100%;
  height: 170px;
  object-fit: cover;
  display: block;
  background: #f3f4f6;
}
.kat-badge {
  position: absolute;
  top: 0.6rem;
  left: 0.6rem;
  background: rgba(45, 80, 22, 0.88);
  color: #f5edd6;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  font-size: 0.67rem;
  font-weight: 600;
}
.habis-badge {
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  background: rgba(220, 38, 38, 0.88);
  color: #fff;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  font-size: 0.67rem;
  font-weight: 600;
}
.produk-info {
  padding: 0.85rem;
}
.produk-nama {
  font-weight: 600;
  font-size: 0.9rem;
  color: #1a2e0a;
  margin-bottom: 0.6rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.produk-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.produk-harga {
  font-weight: 700;
  color: #2d5016;
  font-size: 0.9rem;
}
.produk-stok {
  font-size: 0.69rem;
  color: #6b7280;
}
.produk-stok.low {
  color: #d97706;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  color: #6b7280;
}
.empty-state span {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.75rem;
}
.empty-state p {
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  .hamburger {
    display: block;
  }
  .toko-hero-inner {
    flex-direction: column;
    align-items: flex-start;
  }
  .section-head {
    flex-direction: column;
  }
  .produk-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
