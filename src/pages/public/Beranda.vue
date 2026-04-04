<template>
  <LayoutPublic>
    <!-- HERO -->
    <section class="hero">
      <div class="hero-inner container">
        <div class="hero-text">
          <div class="hero-badge">
            <span class="badge-dot"></span>
            Uluh Itah Kia
          </div>
          <h1 class="hero-title">
            Bapapili mangat,<br />
            <em>Bajualan mangat kia.</em>
          </h1>
          <p class="hero-sub">
            Belanja mudah, berjualan juga mudah — khusus untuk warga
            <strong>Kelurahan Bangkuang</strong>. Produk rumahan langsung dari
            tetangga kita, tanpa perantara.
          </p>
          <div class="hero-cta-grid">
            <RouterLink to="/produk" class="cta-card cta-beli">
              <span class="cta-icon">🛒</span>
              <div>
                <p class="cta-label">Saya mau belanja</p>
                <p class="cta-desc">Cari kue, makanan & jajanan lokal</p>
              </div>
              <span class="cta-arrow">→</span>
            </RouterLink>
            <RouterLink :to="bukaTokoDest" class="cta-card cta-jual">
              <span class="cta-icon">🍱</span>
              <div>
                <p class="cta-label">Saya mau jualan</p>
                <p class="cta-desc">Buka toko gratis & dapatkan pembeli</p>
              </div>
              <span class="cta-arrow">→</span>
            </RouterLink>
          </div>
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-num">{{ stats.produk }}</span>
              <span class="stat-label">Produk</span>
            </div>
            <div class="stat-sep"></div>
            <div class="stat-item">
              <span class="stat-num">{{ stats.toko }}</span>
              <span class="stat-label">Toko Aktif</span>
            </div>
            <div class="stat-sep"></div>
            <div class="stat-item">
              <span class="stat-num">{{ stats.alamat }}</span>
              <span class="stat-label">Lokasi</span>
            </div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="visual-main">
            <div class="visual-ring ring-1"></div>
            <div class="visual-ring ring-2"></div>
            <div class="visual-center">🛒</div>
          </div>
          <div class="float-card fc1">
            <span>🍰</span>
            <div>
              <p class="fc-name">Kue Lapis Pandan</p>
              <p class="fc-price">Rp 25.000</p>
            </div>
          </div>
          <div class="float-card fc2">
            <span>🥮</span>
            <div>
              <p class="fc-name">Klepon Isi Gula</p>
              <p class="fc-price">Rp 15.000</p>
            </div>
          </div>
          <div class="float-card fc3">
            <span>🍜</span>
            <div>
              <p class="fc-name">Lontong Sayur</p>
              <p class="fc-price">Rp 12.000</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CARA KERJA -->
    <section class="section">
      <div class="container">
        <div class="section-label">Sesimple ini</div>
        <h2 class="section-title">Gimana caranya?</h2>
        <div class="cara-grid">
          <div class="cara-col">
            <p class="cara-role">Untuk Pembeli 🛒</p>
            <div class="cara-steps">
              <div class="cara-step">
                <div class="step-num">1</div>
                <div>
                  <p class="step-title">Buka & cari produk</p>
                  <p class="step-desc">
                    Browse semua produk lokal dari warga sekitar
                  </p>
                </div>
              </div>
              <div class="cara-step">
                <div class="step-num">2</div>
                <div>
                  <p class="step-title">Pilih & pesan</p>
                  <p class="step-desc">
                    Isi nama, alamat, dan metode bayar (COD atau transfer)
                  </p>
                </div>
              </div>
              <div class="cara-step">
                <div class="step-num">3</div>
                <div>
                  <p class="step-title">Koordinasi via WA</p>
                  <p class="step-desc">
                    Penjual konfirmasi dan atur pengiriman langsung via WhatsApp
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="cara-divider"></div>
          <div class="cara-col">
            <p class="cara-role">Untuk Penjual 🍱</p>
            <div class="cara-steps">
              <div class="cara-step">
                <div class="step-num">1</div>
                <div>
                  <p class="step-title">Daftar & buka toko</p>
                  <p class="step-desc">
                    Daftar gratis, isi info toko, tunggu verifikasi admin
                  </p>
                </div>
              </div>
              <div class="cara-step">
                <div class="step-num">2</div>
                <div>
                  <p class="step-title">Upload produk</p>
                  <p class="step-desc">
                    Foto, nama, harga, stok — mudah dan cepat
                  </p>
                </div>
              </div>
              <div class="cara-step">
                <div class="step-num">3</div>
                <div>
                  <p class="step-title">Terima order</p>
                  <p class="step-desc">
                    Notifikasi masuk, konfirmasi, atur pengiriman lewat WA
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- KATEGORI -->
    <section class="section section-alt">
      <div class="container">
        <div class="section-label">Ada apa aja?</div>
        <h2 class="section-title">Cari Berdasarkan Kategori</h2>
        <div class="kategori-grid">
          <RouterLink
            v-for="kat in kategori"
            :key="kat.slug"
            :to="`/produk?kategori=${kat.slug}`"
            class="kat-card"
          >
            <span class="kat-icon">{{ kat.icon }}</span>
            <span class="kat-name">{{ kat.nama }}</span>
            <span class="kat-arrow">→</span>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- PRODUK TERBARU -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <div>
            <div class="section-label">Baru masuk</div>
            <h2 class="section-title" style="margin-bottom: 0">
              Produk Terbaru
            </h2>
          </div>
          <RouterLink to="/produk" class="lihat-semua"
            >Lihat Semua →</RouterLink
          >
        </div>
        <div v-if="loadingProduk" class="produk-grid">
          <div v-for="n in 8" :key="n" class="produk-skeleton"></div>
        </div>
        <div v-else-if="produkTerbaru.length" class="produk-grid">
          <RouterLink
            v-for="p in produkTerbaru"
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
              <span class="produk-kat-badge">{{
                labelKategori(p.kategori)
              }}</span>
            </div>
            <div class="produk-info">
              <p class="produk-toko">🏪 {{ p.toko?.nama_toko }}</p>
              <h3 class="produk-nama">{{ p.nama_produk }}</h3>
              <div class="produk-footer">
                <span class="produk-harga">{{ formatRupiah(p.harga) }}</span>
                <span class="produk-lokasi">📍 {{ p.toko?.alamat }}</span>
              </div>
            </div>
          </RouterLink>
        </div>
        <div v-else class="empty-state">
          <span>🍽️</span>
          <p>Belum ada produk. Jadilah yang pertama jualan!</p>
          <RouterLink
            :to="bukaTokoDest"
            class="btn-primary"
            style="margin-top: 1rem; display: inline-block"
            >Buka Toko Sekarang</RouterLink
          >
        </div>
      </div>
    </section>

    <!-- CTA PENJUAL -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-wrap">
          <div class="cta-kiri">
            <p class="cta-badge">Gratis, selamanya 🎉</p>
            <h2 class="cta-title">Punya kue atau makanan andalan?</h2>
            <p class="cta-desc">
              Warga Bangkuang yang biasa jualan lewat WA atau Facebook —
              sekarang bisa punya toko sendiri yang rapi. Gratis, tanpa biaya
              apapun.
            </p>
            <ul class="cta-list">
              <li>✅ Upload produk tidak terbatas</li>
              <li>✅ Pembeli bisa langsung ketemu kamu</li>
              <li>✅ Bayar COD atau transfer, atur sendiri</li>
              <li>✅ Tidak perlu keahlian teknis</li>
            </ul>
            <RouterLink :to="bukaTokoDest" class="btn-cta"
              >Buka Toko Sekarang →</RouterLink
            >
          </div>
          <div class="cta-kanan">
            <div class="cta-bubbles">
              <div class="bubble b1">Kue Basah 🍰</div>
              <div class="bubble b2">Makanan 🍜</div>
              <div class="bubble b3">Minuman 🥤</div>
              <div class="bubble b4">Kue Kering 🍪</div>
              <div class="cta-icon-big">🍱</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="footer">
      <div class="container">
        <div class="footer-brand">🛒 ItahBangkuang</div>
        <p class="footer-tagline">Bapapili mangat, Bajualan mangat kia.</p>
        <p class="footer-loc">📍 Kelurahan Bangkuang, Kalimantan Selatan</p>
        <div class="footer-sep"></div>
        <p class="footer-copy">
          © {{ new Date().getFullYear() }} ItahBangkuang — Dibuat dengan ❤️
          untuk warga Bangkuang
        </p>
      </div>
    </footer>
  </LayoutPublic>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '@/lib/supabase';
import { formatRupiah } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import LayoutPublic from '@/layouts/LayoutPublic.vue';

const authStore = useAuthStore();
const loadingProduk = ref(true);
const produkTerbaru = ref([]);
const stats = ref({ produk: 0, toko: 0, alamat: 0 });

const kategori = [
  { slug: 'kue_basah', nama: 'Kue Basah', icon: '🍰' },
  { slug: 'kue_kering', nama: 'Kue Kering', icon: '🍪' },
  { slug: 'makanan', nama: 'Makanan', icon: '🍱' },
  { slug: 'minuman', nama: 'Minuman', icon: '🥤' },
];

const labelKategori = (slug) =>
  kategori.find((k) => k.slug === slug)?.nama ?? slug;

const bukaTokoDest = computed(() => {
  if (authStore.role === 'penjual') return '/toko/dashboard';
  if (authStore.user) return '/buka-toko';
  return '/register';
});

onMounted(async () => {
  const { data: produk } = await supabase
    .from('produk')
    .select('*, toko(nama_toko, alamat, status)')
    .eq('status', 'AKTIF')
    .order('created_at', { ascending: false })
    .limit(8);

  produkTerbaru.value = produk?.filter((p) => p.toko?.status === 'AKTIF') ?? [];
  loadingProduk.value = false;

  const [{ count: jProduk }, { count: jToko }, { data: alamatData }] =
    await Promise.all([
      supabase
        .from('produk')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'AKTIF'),
      supabase
        .from('toko')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'AKTIF'),
      supabase.from('toko').select('alamat').eq('status', 'AKTIF'),
    ]);

  stats.value = {
    produk: jProduk ?? 0,
    toko: jToko ?? 0,
    alamat: new Set(alamatData?.map((t) => t.alamat)).size,
  };
});
</script>

<style scoped>
.hero {
  background: linear-gradient(155deg, #1a2e0a 0%, #2d5016 55%, #3a6b1e 100%);
  padding: 5rem 0 4rem;
  overflow: hidden;
  position: relative;
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
}
.hero::before {
  content: '';
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: rgba(168, 201, 127, 0.07);
  top: -150px;
  right: -100px;
  pointer-events: none;
}
.hero-inner {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 4rem;
  align-items: center;
  width: 100%;
}
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(168, 201, 127, 0.15);
  border: 1px solid rgba(168, 201, 127, 0.35);
  color: #a8c97f;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}
.badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #a8c97f;
  animation: blink 2s ease-in-out infinite;
}
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}
.hero-title {
  font-family: 'Lora', serif;
  font-size: clamp(1.9rem, 3.2vw, 2.8rem);
  font-weight: 700;
  color: #f5edd6;
  line-height: 1.3;
  margin-bottom: 1.25rem;
}
.hero-title em {
  font-style: italic;
  color: #a8c97f;
}
.hero-sub {
  color: rgba(245, 237, 214, 0.72);
  font-size: 0.975rem;
  line-height: 1.75;
  margin-bottom: 2.25rem;
  max-width: 480px;
}
.hero-sub strong {
  color: #f5edd6;
}
.hero-cta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
  margin-bottom: 2.5rem;
}
.cta-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 14px;
  text-decoration: none;
  transition: all 0.2s;
}
.cta-beli {
  background: #f5edd6;
  color: #1a2e0a;
}
.cta-beli:hover {
  background: #e7dec3;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}
.cta-jual {
  background: rgba(255, 255, 255, 0.07);
  border: 1.5px solid rgba(245, 237, 214, 0.2);
  color: #f5edd6;
}
.cta-jual:hover {
  background: rgba(255, 255, 255, 0.13);
  transform: translateY(-2px);
}
.cta-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}
.cta-label {
  font-weight: 700;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}
.cta-desc {
  font-size: 0.7rem;
  opacity: 0.85;
  line-height: 1.4;
}

.cta-beli .cta-label {
  color: #050b01;
}

.cta-jual .cta-label {
  color: #f5edd6;
}

.cta-beli .cta-desc {
  color: #050a00;
}

.cta-jual .cta-desc {
  color: #f5edd6
}

.cta-arrow {
  margin-left: auto;
  flex-shrink: 0;
  font-size: 1rem;
  opacity: 0.45;
  transition: transform 0.2s;
}
.cta-card:hover .cta-arrow {
  transform: translateX(3px);
  opacity: 1;
}
.hero-stats {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.stat-item {
  display: flex;
  flex-direction: column;
}
.stat-num {
  font-family: 'Lora', serif;
  font-size: 1.6rem;
  font-weight: 700;
  color: #f5edd6;
}
.stat-label {
  font-size: 0.7rem;
  color: rgba(245, 237, 214, 0.55);
  margin-top: 0.1rem;
}
.stat-sep {
  width: 1px;
  height: 30px;
  background: rgba(245, 237, 214, 0.18);
}
.hero-visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 360px;
}
.visual-main {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.visual-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(168, 201, 127, 0.18);
  animation: ringpulse 4s ease-in-out infinite;
}
.ring-1 {
  width: 200px;
  height: 200px;
}
.ring-2 {
  width: 300px;
  height: 300px;
  animation-delay: 1s;
  opacity: 0.5;
}
@keyframes ringpulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.4;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}
.visual-center {
  width: 90px;
  height: 90px;
  border-radius: 24px;
  background: rgba(245, 237, 214, 0.08);
  border: 1.5px solid rgba(245, 237, 214, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  position: relative;
  z-index: 2;
}
.float-card {
  position: absolute;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(245, 237, 214, 0.14);
  border-radius: 12px;
  padding: 0.6rem 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  animation: floatY 4s ease-in-out infinite alternate;
}
.fc1 {
  top: 8%;
  left: 0;
  animation-delay: 0s;
}
.fc2 {
  top: 40%;
  right: 0;
  animation-delay: 0.7s;
}
.fc3 {
  bottom: 8%;
  left: 5%;
  animation-delay: 1.3s;
}
@keyframes floatY {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-10px);
  }
}
.float-card span {
  font-size: 1.3rem;
  flex-shrink: 0;
}
.fc-name {
  font-size: 0.72rem;
  font-weight: 600;
  color: #f5edd6;
}
.fc-price {
  font-size: 0.65rem;
  color: #a8c97f;
  margin-top: 0.1rem;
}
.section {
  padding: 5rem 0;
}
.section-alt {
  background: #fff;
}
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 2rem;
}
.section-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: #2d5016;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.4rem;
}
.section-title {
  font-family: 'Lora', serif;
  font-size: 1.7rem;
  font-weight: 700;
  color: #1a2e0a;
  margin-bottom: 2.5rem;
}
.section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 2rem;
}
.lihat-semua {
  color: #2d5016;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.2rem;
}
.lihat-semua:hover {
  opacity: 0.7;
}
.cara-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 3rem;
  align-items: start;
}
.cara-role {
  font-weight: 700;
  font-size: 1rem;
  color: #2d5016;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e8e0d0;
}
.cara-steps {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.cara-step {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}
.step-num {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #2d5016;
  color: #f5edd6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
}
.step-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: #1a2e0a;
  margin-bottom: 0.2rem;
}
.step-desc {
  font-size: 0.78rem;
  color: #6b7280;
  line-height: 1.5;
}
.cara-divider {
  width: 1px;
  background: #e8e0d0;
  align-self: stretch;
  margin-top: 2.5rem;
}
.kategori-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}
.kat-card {
  background: #fdfaf4;
  border: 1.5px solid #e8e0d0;
  border-radius: 16px;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  transition: all 0.2s;
  position: relative;
}
.kat-card:hover {
  border-color: #2d5016;
  background: #f0f7e8;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(45, 80, 22, 0.1);
}
.kat-icon {
  font-size: 2.25rem;
}
.kat-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}
.kat-arrow {
  position: absolute;
  right: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  color: #d1d5db;
  font-size: 0.85rem;
  transition: all 0.2s;
}
.kat-card:hover .kat-arrow {
  color: #2d5016;
}

/* ========================================= */
/* BAGIAN PRODUK YANG SUDAH DI-REDESIGN     */
/* ========================================= */

.produk-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr); /* Default HP: 2 Kolom */
  gap: 1rem;
}

.produk-skeleton {
  background: linear-gradient(90deg, #f3f4f6 25%, #e9eaeb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  border-radius: 16px;
  height: 290px;
  animation: shimmer 1.4s ease-in-out infinite;
}
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.produk-card {
  background: #fff;
  border: 1px solid #e8e0d0;
  border-radius: 16px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  display: block;
  transition: all 0.3s ease;
}
.produk-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  border-color: #a8c97f;
}

/* Wrapper foto dibuat presisi 1:1 */
.produk-foto-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1; 
  overflow: hidden;
}

.produk-foto {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  background: #f3f4f6;
  transition: transform 0.5s ease;
}

/* Efek zoom saat kartu di-hover */
.produk-card:hover .produk-foto {
  transform: scale(1.08); 
}

.produk-kat-badge {
  position: absolute;
  top: 0.6rem;
  left: 0.6rem;
  background: rgba(45, 80, 22, 0.88);
  color: #f5edd6;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  font-size: 0.67rem;
  font-weight: 600;
  z-index: 2; /* Memastikan badge di atas foto saat di-zoom */
}

.produk-info {
  padding: 0.85rem;
}

.produk-toko {
  font-size: 0.72rem;
  color: #6b7280;
  margin-bottom: 0.2rem;
}

.produk-nama {
  font-weight: 600;
  font-size: 0.9rem;
  color: #1a2e0a;
  margin-bottom: 0.6rem;
  /* Line Clamping agar seragam tingginya */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 2.8em; 
  line-height: 1.4;
}

.produk-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px; /* Adds a safe breathing room between price and location */
}

.produk-harga {
  font-weight: 700;
  color: #2d5016;
  font-size: 0.9rem;
  /* Magic trick 1: Never let the price wrap to a new line */
  white-space: nowrap; 
  /* Magic trick 2: Never let the price shrink, it dictates its own width */
  flex-shrink: 0; 
}

.produk-lokasi {
  font-size: 0.7rem;
  color: #9ca3af;
  text-align: right;
  
  /* Magic trick 3: The Ellipsis combo for long addresses */
  white-space: nowrap;       /* Keeps address on one line */
  overflow: hidden;          /* Hides the excess text */
  text-overflow: ellipsis;   /* Adds the "..." at the end */
  
  /* CRITICAL: This allows truncation to work inside a flexbox container */
  min-width: 0; 
}

/* ========================================= */
/* SELESAI BAGIAN PRODUK                     */
/* ========================================= */

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
}
.empty-state span {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}
.btn-primary {
  background: #2d5016;
  color: #f5edd6;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: background 0.2s;
}
.btn-primary:hover {
  background: #3a6b1e;
}
.cta-section {
  padding: 3rem 0;
}
.cta-wrap {
  background: linear-gradient(135deg, #1a2e0a 0%, #2d5016 100%);
  border-radius: 24px;
  padding: 3.5rem;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 3rem;
  align-items: center;
  overflow: hidden;
  position: relative;
}
.cta-wrap::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 80% 50%,
    rgba(168, 201, 127, 0.1),
    transparent 60%
  );
  pointer-events: none;
}
.cta-badge {
  display: inline-block;
  background: rgba(168, 201, 127, 0.15);
  border: 1px solid rgba(168, 201, 127, 0.3);
  color: #a8c97f;
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 1rem;
}
.cta-title {
  font-family: 'Lora', serif;
  font-size: 1.6rem;
  color: #f5edd6;
  font-weight: 700;
  margin-bottom: 0.75rem;
  line-height: 1.35;
}
.cta-desc {
  color: rgba(245, 237, 214, 0.7);
  font-size: 0.875rem;
  line-height: 1.75;
}
.cta-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 2rem 0rem;
}
.cta-list li {
  font-size: 0.875rem;
  color: rgba(245, 237, 214, 0.82);
}
.btn-cta {
  display: inline-block;
  background: #f5edd6;
  color: #1a2e0a;
  padding: 0.9rem 1.75rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.95rem;
  transition: all 0.2s;
}
.btn-cta:hover {
  background: #fff;
  transform: translateY(-1px);
}
.cta-kanan {
  position: relative;
  z-index: 1;
}
.cta-bubbles {
  position: relative;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cta-icon-big {
  font-size: 5rem;
  opacity: 0.15;
}
.bubble {
  position: absolute;
  background: rgba(245, 237, 214, 0.07);
  border: 1px solid rgba(245, 237, 214, 0.14);
  border-radius: 999px;
  padding: 0.4rem 0.85rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #f5edd6;
  white-space: nowrap;
  animation: floatY 4s ease-in-out infinite alternate;
}
.b1 {
  top: 10%;
  left: 5%;
  animation-delay: 0s;
}
.b2 {
  top: 30%;
  right: 0;
  animation-delay: 0.6s;
}
.b3 {
  bottom: 25%;
  left: 15%;
  animation-delay: 1.2s;
}
.b4 {
  bottom: 8%;
  right: 10%;
  animation-delay: 0.3s;
}
.footer {
  background: #1a2e0a;
  padding: 3rem 0;
  text-align: center;
}
.footer-brand {
  font-family: 'Lora', serif;
  font-size: 1.4rem;
  color: #f5edd6;
  font-weight: 700;
  margin-bottom: 0.4rem;
}
.footer-tagline {
  color: #a8c97f;
  font-size: 0.875rem;
  font-style: italic;
  margin-bottom: 0.35rem;
}
.footer-loc {
  color: rgba(245, 237, 214, 0.35);
  font-size: 0.78rem;
}
.footer-sep {
  width: 60px;
  height: 1px;
  background: rgba(245, 237, 214, 0.1);
  margin: 1.5rem auto;
}
.footer-copy {
  color: rgba(245, 237, 214, 0.25);
  font-size: 0.75rem;
}

/* ========================================= */
/* MEDIA QUERIES (RESPONSIVITAS UTAMA)       */
/* ========================================= */

/* Desktop & Tablet Grid Produk */
@media (min-width: 768px) {
  .produk-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
  }
}

@media (min-width: 1024px) {
  .produk-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 900px) {
  .hero {
    min-height: auto;
    padding: 3.5rem 0 3rem;
  }
  .hero-inner {
    grid-template-columns: 1fr;
  }
  .hero-visual {
    display: none;
  }
  .cara-grid {
    grid-template-columns: 1fr;
  }
  .cara-divider {
    display: none;
  }
  .kategori-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .cta-wrap {
    grid-template-columns: 1fr;
  }
  .cta-kanan {
    display: none;
  }
}

@media (max-width: 640px) {
  .hero-cta-grid {
    grid-template-columns: 1fr;
  }
  .hero-title {
    font-size: 1.85rem;
  }
  .cta-wrap {
    padding: 2rem;
  }
}

/* HP Layar Sangat Kecil */
@media (max-width: 380px) {
  .produk-grid {
    grid-template-columns: 1fr; /* Jadi 1 baris penuh agar tidak terlalu sempit */
  }
}
</style>
