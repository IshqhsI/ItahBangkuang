<template>
  <LayoutPublic>
        <!-- LOADING -->
    <div v-if="loading" class="loading-wrap">
      <div class="loading-spinner"></div>
      <p>Memuat produk...</p>
    </div>

    <!-- NOT FOUND -->
    <div v-else-if="!produk" class="not-found">
      <span>😕</span>
      <h2>Produk tidak ditemukan</h2>
      <RouterLink to="/produk" class="btn-back">← Kembali ke Produk</RouterLink>
    </div>

    <!-- DETAIL PRODUK -->
    <div v-else class="detail-wrap">
      <div class="container">
        <!-- Breadcrumb -->
        <div class="breadcrumb">
          <RouterLink to="/">Beranda</RouterLink>
          <span>›</span>
          <RouterLink to="/produk">Produk</RouterLink>
          <span>›</span>
          <span>{{ produk.nama_produk }}</span>
        </div>

        <div class="detail-grid">
          <!-- FOTO -->
          <div class="foto-section">
            <div class="foto-wrap">
              <img
                :src="produk.foto_url"
                :alt="produk.nama_produk"
                class="foto-utama"
              />
              <span class="kat-badge">{{
                labelKategori(produk.kategori)
              }}</span>
              <span v-if="produk.stok === 0" class="habis-overlay"
                >Stok Habis</span
              >
            </div>
          </div>

          <!-- INFO PRODUK -->
          <div class="info-section">
            <h1 class="produk-nama">{{ produk.nama_produk }}</h1>
            <div class="produk-harga">{{ formatRupiah(produk.harga) }}</div>

            <div class="produk-meta">
              <div class="meta-item">
                <span class="meta-label">Stok</span>
                <span
                  class="meta-val"
                  :class="{
                    habis: produk.stok === 0,
                    low: produk.stok <= 5 && produk.stok > 0,
                  }"
                >
                  {{
                    produk.stok === 0
                      ? 'Habis'
                      : produk.stok <= 5
                        ? `Sisa ${produk.stok}`
                        : produk.stok + ' tersedia'
                  }}
                </span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Kategori</span>
                <span class="meta-val">{{
                  labelKategori(produk.kategori)
                }}</span>
              </div>
            </div>

            <div class="deskripsi-section" v-if="produk.deskripsi">
              <h3>Deskripsi</h3>
              <p>{{ produk.deskripsi }}</p>
            </div>

            <!-- JUMLAH -->
            <div class="jumlah-section" v-if="produk.stok > 0">
              <label>Jumlah</label>
              <div class="jumlah-control">
                <button @click="kurangiJumlah" :disabled="jumlah <= 1">
                  −
                </button>
                <span>{{ jumlah }}</span>
                <button @click="tambahJumlah" :disabled="jumlah >= produk.stok">
                  +
                </button>
              </div>
              <span class="subtotal"
                >Total:
                <strong>{{ formatRupiah(produk.harga * jumlah) }}</strong></span
              >
            </div>

            <!-- TOMBOL AKSI -->
            <div class="aksi-wrap">
              <button
                v-if="produk.stok > 0"
                class="btn-pesan"
                @click="handlePesan"
              >
                🛒 Pesan Sekarang
              </button>

              <button class="btn-wa" @click="chatWA">
                💬 Chat via WhatsApp
              </button>
            </div>

            <div v-if="produk.stok === 0" class="info-habis">
              Stok sedang habis. Chat penjual untuk tanya ketersediaan.
            </div>

            <!-- INFO TOKO -->
            <RouterLink :to="`/toko/${toko?.id}`" class="toko-card">
              <div class="toko-foto-wrap">
                <img
                  v-if="toko?.foto_toko"
                  :src="toko.foto_toko"
                  :alt="toko.nama_toko"
                  class="toko-foto"
                />
                <div v-else class="toko-foto-placeholder">🏪</div>
              </div>
              <div class="toko-info">
                <p class="toko-label">Dijual oleh</p>
                <p class="toko-nama">{{ toko?.nama_toko }}</p>
                <p class="toko-alamat">📍 {{ toko?.alamat }}</p>
              </div>
              <span class="toko-arrow">›</span>
            </RouterLink>
          </div>
        </div>

        <!-- PRODUK LAIN DARI TOKO INI -->
        <div class="produk-lain" v-if="produkLain.length">
          <h2 class="section-title">Produk Lain dari Toko Ini</h2>
          <div class="produk-lain-grid">
            <RouterLink
              v-for="p in produkLain"
              :key="p.id"
              :to="`/produk/${p.id}`"
              class="mini-card"
            >
              <img :src="p.foto_url" :alt="p.nama_produk" class="mini-foto" />
              <div class="mini-info">
                <p class="mini-nama">{{ p.nama_produk }}</p>
                <p class="mini-harga">{{ formatRupiah(p.harga) }}</p>
              </div>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

  </LayoutPublic>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '@/lib/supabase';
import LayoutPublic from '@/layouts/LayoutPublic.vue';
import { formatRupiah } from '@/lib/utils';

const route = useRoute();
const router = useRouter();
const user = ref(null);
const role = ref(null);
const loading = ref(true);
const produk = ref(null);
const toko = ref(null);
const produkLain = ref([]);
const jumlah = ref(1);

const kategoriList = [
  { slug: 'kue_basah', nama: 'Kue Basah' },
  { slug: 'kue_kering', nama: 'Kue Kering' },
  { slug: 'makanan', nama: 'Makanan' },
  { slug: 'minuman', nama: 'Minuman' },
];

const labelKategori = (slug) =>
  kategoriList.find((k) => k.slug === slug)?.nama ?? slug;

const kurangiJumlah = () => {
  if (jumlah.value > 1) jumlah.value--;
};
const tambahJumlah = () => {
  if (jumlah.value < produk.value.stok) jumlah.value++;
};

const handlePesan = () => {
  if (!user.value) {
    router.push('/login');
    return;
  }
  router.push(`/pesan/${produk.value.id}?jumlah=${jumlah.value}`);
};

const chatWA = () => {
  const wa = toko.value?.nomor_wa?.replace(/^0/, '') ?? '';
  const pesan = `Halo, saya tertarik dengan produk *${produk.value.nama_produk}* di toko ${toko.value?.nama_toko}. Apakah masih tersedia?`;
  window.open(
    `https://wa.me/62${wa}?text=${encodeURIComponent(pesan)}`,
    '_blank',
  );
};

const fetchData = async () => {
  loading.value = true;
  jumlah.value = 1;

  const { data: p } = await supabase
    .from('produk')
    .select('*, toko(*)')
    .eq('id', route.params.id)
    .single();

  if (!p || p.status !== 'AKTIF' || p.toko?.status !== 'AKTIF') {
    produk.value = null;
    loading.value = false;
    return;
  }

  produk.value = p;
  toko.value = p.toko;

  // Produk lain dari toko yang sama
  const { data: lain } = await supabase
    .from('produk')
    .select('id, nama_produk, foto_url, harga')
    .eq('toko_id', p.toko_id)
    .eq('status', 'AKTIF')
    .neq('id', p.id)
    .limit(4);

  produkLain.value = lain ?? [];
  loading.value = false;
};

onMounted(async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) {
    user.value = session.user;
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    role.value = profile?.role;
  }
  fetchData();
});

// Reload kalau pindah ke produk lain
watch(() => route.params.id, fetchData);
</script>

<style scoped>

/* LOADING */
.loading-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 6rem 2rem;
  color: #6b7280;
}
.loading-spinner {
  width: 36px;
  height: 36px;
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
  color: #1a2e0a;
}
.btn-back {
  color: #2d5016;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
}

/* DETAIL */
.detail-wrap {
  padding: 2rem 0 5rem;
}
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 2rem;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #9ca3af;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}
.breadcrumb a {
  color: #6b7280;
  text-decoration: none;
  transition: color 0.2s;
}
.breadcrumb a:hover {
  color: #2d5016;
}
.breadcrumb span:last-child {
  color: #374151;
  font-weight: 500;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 4rem;
}

/* FOTO */
.foto-section {
}
.foto-wrap {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  aspect-ratio: 1;
}
.foto-utama {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  background: #f3f4f6;
}
.kat-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: rgba(45, 80, 22, 0.88);
  color: #f5edd6;
  padding: 0.3rem 0.8rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
}
.habis-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.4rem;
  font-weight: 700;
  font-family: 'Lora', serif;
}

/* INFO */
.info-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.produk-nama {
  font-family: 'Lora', serif;
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1.3;
  color: #1a2e0a;
}
.produk-harga {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2d5016;
}

.produk-meta {
  display: flex;
  gap: 1.5rem;
}
.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.meta-label {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.meta-val {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
}
.meta-val.habis {
  color: #dc2626;
}
.meta-val.low {
  color: #d97706;
}

.deskripsi-section h3 {
  font-size: 0.85rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}
.deskripsi-section p {
  font-size: 0.95rem;
  color: #4b5563;
  line-height: 1.7;
}

/* JUMLAH */
.jumlah-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.jumlah-section label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}
.jumlah-control {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1.5px solid #d1d5db;
  border-radius: 10px;
  overflow: hidden;
}
.jumlah-control button {
  width: 36px;
  height: 36px;
  background: #f3f4f6;
  border: none;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  color: #374151;
  transition: background 0.2s;
}
.jumlah-control button:hover:not(:disabled) {
  background: #e5e7eb;
}
.jumlah-control button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.jumlah-control span {
  width: 44px;
  text-align: center;
  font-weight: 600;
  font-size: 0.95rem;
}
.subtotal {
  font-size: 0.875rem;
  color: #6b7280;
}
.subtotal strong {
  color: #2d5016;
}

/* AKSI */
.aksi-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.btn-pesan {
  background: #2d5016;
  color: #f5edd6;
  border: none;
  padding: 1rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition:
    background 0.2s,
    transform 0.15s;
  text-align: center;
}
.btn-pesan:hover {
  background: #3a6b1e;
  transform: translateY(-1px);
}
.btn-wa {
  background: #fff;
  color: #374151;
  border: 1.5px solid #d1d5db;
  padding: 0.9rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-wa:hover {
  border-color: #25d366;
  color: #25d366;
  background: #f0fff4;
}

.info-habis {
  font-size: 0.85rem;
  color: #d97706;
  background: #fffbeb;
  border: 1px solid #fde68a;
  padding: 0.75rem 1rem;
  border-radius: 8px;
}

/* TOKO CARD */
.toko-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  background: #fff;
  border: 1.5px solid #e8e0d0;
  border-radius: 14px;
  padding: 0.85rem 1rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
  margin-top: 0.25rem;
}
.toko-card:hover {
  border-color: #2d5016;
  background: #f7fbf0;
}
.toko-foto-wrap {
  flex-shrink: 0;
}
.toko-foto {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  object-fit: cover;
}
.toko-foto-placeholder {
  width: 48px;
  height: 48px;
  background: #f0f7e8;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
}
.toko-info {
  flex: 1;
}
.toko-label {
  font-size: 0.7rem;
  color: #9ca3af;
  margin-bottom: 0.15rem;
}
.toko-nama {
  font-weight: 600;
  font-size: 0.9rem;
  color: #1a2e0a;
}
.toko-alamat {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.15rem;
}
.toko-arrow {
  color: #9ca3af;
  font-size: 1.2rem;
}

/* PRODUK LAIN */
.produk-lain {
  border-top: 1px solid #e8e0d0;
  padding-top: 3rem;
}
.section-title {
  font-family: 'Lora', serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: #1a2e0a;
  margin-bottom: 1.5rem;
}
.produk-lain-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}
.mini-card {
  text-decoration: none;
  color: inherit;
  background: #fff;
  border: 1px solid #e8e0d0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
}
.mini-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: #a8c97f;
}
.mini-foto {
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
  background: #f3f4f6;
}
.mini-info {
  padding: 0.65rem;
}
.mini-nama {
  font-size: 0.82rem;
  font-weight: 600;
  color: #1a2e0a;
  margin-bottom: 0.25rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.mini-harga {
  font-size: 0.82rem;
  font-weight: 700;
  color: #2d5016;
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  .hamburger {
    display: block;
  }
  .detail-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  .produk-lain-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
