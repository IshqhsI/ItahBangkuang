<template>
  <div class="beranda">

    <!-- NAVBAR -->
    <nav class="navbar">
      <RouterLink to="/" class="nav-brand">
        <span>🛒</span> ItahBangkuang
      </RouterLink>
      <div class="nav-links">
        <RouterLink to="/produk">Semua Produk</RouterLink>
        <template v-if="!user">
          <RouterLink to="/login" class="btn-nav-login">Masuk</RouterLink>
          <RouterLink to="/register" class="btn-nav-daftar">Daftar</RouterLink>
        </template>
        <template v-else>
          <RouterLink v-if="role === 'penjual'" to="/toko/dashboard" class="btn-nav-login">Dashboard Toko</RouterLink>
          <RouterLink v-if="role === 'admin'" to="/admin/dashboard" class="btn-nav-login">Panel Admin</RouterLink>
          <button class="btn-nav-login" @click="logout">Keluar</button>
        </template>
      </div>
      <!-- Mobile menu toggle -->
      <button class="hamburger" @click="menuOpen = !menuOpen">☰</button>
    </nav>

    <!-- MOBILE MENU -->
    <div class="mobile-menu" v-if="menuOpen">
      <RouterLink to="/produk" @click="menuOpen = false">Semua Produk</RouterLink>
      <template v-if="!user">
        <RouterLink to="/login" @click="menuOpen = false">Masuk</RouterLink>
        <RouterLink to="/register" @click="menuOpen = false">Daftar</RouterLink>
      </template>
      <template v-else>
        <RouterLink v-if="role === 'penjual'" to="/toko/dashboard" @click="menuOpen = false">Dashboard Toko</RouterLink>
        <button @click="logout">Keluar</button>
      </template>
    </div>

    <!-- HERO -->
    <section class="hero">
      <div class="hero-content">
        <div class="hero-badge">🌾 Produk Asli Kecamatan</div>
        <h1 class="hero-title">
          Jajanan Lokal<br/>
          <span class="hero-highlight">Langsung dari Dapur</span><br/>
          Tetangga Kita
        </h1>
        <p class="hero-desc">
          Temukan kue, makanan, dan jajanan rumahan buatan warga desa.
          Pesan langsung, tanpa perantara.
        </p>
        <div class="hero-actions">
          <RouterLink to="/produk" class="btn-hero-primary">Lihat Semua Produk →</RouterLink>
          <RouterLink to="/register" class="btn-hero-secondary">Mulai Jualan</RouterLink>
        </div>
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-num">{{ stats.produk }}+</span>
            <span class="stat-label">Produk</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <span class="stat-num">{{ stats.toko }}+</span>
            <span class="stat-label">Toko Aktif</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <span class="stat-num">{{ stats.alamat }}+</span>
            <span class="stat-label">Desa</span>
          </div>
        </div>
      </div>
      <div class="hero-visual">
        <div class="hero-blob"></div>
        <div class="hero-cards-float">
          <div class="float-card fc1">🍰 Kue Lapis Legit</div>
          <div class="float-card fc2">🥮 Klepon Pandan</div>
          <div class="float-card fc3">🍜 Lontong Sayur</div>
          <div class="float-card fc4">🧁 Bolu Kukus</div>
        </div>
      </div>
    </section>

    <!-- KATEGORI -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Cari Berdasarkan Kategori</h2>
        </div>
        <div class="kategori-grid">
          <RouterLink
            v-for="kat in kategori"
            :key="kat.slug"
            :to="`/produk?kategori=${kat.slug}`"
            class="kat-card"
          >
            <span class="kat-icon">{{ kat.icon }}</span>
            <span class="kat-name">{{ kat.nama }}</span>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- PRODUK TERBARU -->
    <section class="section section-alt">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Produk Terbaru</h2>
          <RouterLink to="/produk" class="lihat-semua">Lihat Semua →</RouterLink>
        </div>

        <!-- Loading skeleton -->
        <div v-if="loadingProduk" class="produk-grid">
          <div v-for="n in 8" :key="n" class="produk-skeleton"></div>
        </div>

        <!-- Produk grid -->
        <div v-else-if="produkTerbaru.length" class="produk-grid">
          <RouterLink
            v-for="p in produkTerbaru"
            :key="p.id"
            :to="`/produk/${p.id}`"
            class="produk-card"
          >
            <div class="produk-foto-wrap">
              <img :src="p.foto_url" :alt="p.nama_produk" class="produk-foto" loading="lazy" />
              <span class="produk-kategori-badge">{{ labelKategori(p.kategori) }}</span>
            </div>
            <div class="produk-info">
              <p class="produk-toko">🏪 {{ p.toko?.nama_toko }}</p>
              <h3 class="produk-nama">{{ p.nama_produk }}</h3>
              <div class="produk-footer">
                <span class="produk-harga">{{ formatRupiah(p.harga) }}</span>
                <span class="produk-desa">📍 {{ p.toko?.alamat }}</span>
              </div>
            </div>
          </RouterLink>
        </div>

        <!-- Empty state -->
        <div v-else class="empty-state">
          <span>🍽️</span>
          <p>Belum ada produk. Jadilah yang pertama jualan!</p>
          <RouterLink to="/register" class="btn-hero-primary" style="display:inline-block; margin-top:1rem;">
            Buka Toko Sekarang
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- CTA PENJUAL -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-card">
          <div class="cta-text">
            <h2>Kamu punya kue atau makanan andalan?</h2>
            <p>Buka toko gratis, jangkau pembeli satu kecamatan tanpa ribet.</p>
          </div>
          <RouterLink to="/register" class="btn-cta">Buka Toko Gratis →</RouterLink>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="footer">
      <div class="container">
        <div class="footer-brand">
          <span>🛒</span> ItahBangkuang
        </div>
        <p class="footer-desc">Marketplace makanan & jajanan lokal kecamatan.</p>
        <p class="footer-copy">© {{ new Date().getFullYear() }} ItahBangkuang. Dibuat dengan ❤️ untuk warga desa.</p>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(null)
const role = ref(null)
const menuOpen = ref(false)
const loadingProduk = ref(true)
const produkTerbaru = ref([])
const stats = ref({ produk: 0, toko: 0, desa: 0 })

const kategori = [
  { slug: 'kue_basah', nama: 'Kue Basah', icon: '🍰' },
  { slug: 'kue_kering', nama: 'Kue Kering', icon: '🍪' },
  { slug: 'makanan', nama: 'Makanan', icon: '🍱' },
  { slug: 'minuman', nama: 'Minuman', icon: '🥤' },
]

const labelKategori = (slug) => {
  return kategori.find(k => k.slug === slug)?.nama ?? slug
}

const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka)
}

const logout = async () => {
  await supabase.auth.signOut()
  user.value = null
  role.value = null
  router.push('/')
}

onMounted(async () => {
  // Cek session user
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    user.value = session.user
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', session.user.id).single()
    role.value = profile?.role
  }

  // Ambil produk terbaru
  const { data: produk } = await supabase
    .from('produk')
    .select('*, toko(nama_toko, alamat, status)')
    .eq('status', 'AKTIF')
    .order('created_at', { ascending: false })
    .limit(8)

  produkTerbaru.value = produk?.filter(p => p.toko?.status === 'AKTIF') ?? []
  loadingProduk.value = false

  // Hitung stats
  const { count: jumlahProduk } = await supabase
    .from('produk').select('*', { count: 'exact', head: true }).eq('status', 'AKTIF')

  const { count: jumlahToko } = await supabase
    .from('toko').select('*', { count: 'exact', head: true }).eq('status', 'AKTIF')

  const { data: alamatData } = await supabase
    .from('toko').select('alamat').eq('status', 'AKTIF')

  const alamatUnik = new Set(alamatData?.map(t => t.alamat))

  stats.value = {
    produk: jumlahProduk ?? 0,
    toko: jumlahToko ?? 0,
    alamat: alamatUnik.size,
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Lora:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.beranda {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: #FDFAF4;
  color: #1A2E0A;
  min-height: 100vh;
}

/* NAVBAR */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(253, 250, 244, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid #E8E0D0;
  padding: 0 2rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-brand {
  font-family: 'Lora', serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #2D5016;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-links a {
  color: #374151;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.2s;
}
.nav-links a:hover { color: #2D5016; }

.btn-nav-login {
  background: none;
  border: 1.5px solid #2D5016;
  color: #2D5016 !important;
  padding: 0.4rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem !important;
  font-weight: 600 !important;
  cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: all 0.2s;
}
.btn-nav-login:hover { background: #F0F7E8 !important; }

.btn-nav-daftar {
  background: #2D5016;
  color: #F5EDD6 !important;
  padding: 0.4rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem !important;
  font-weight: 600 !important;
  transition: background 0.2s;
}
.btn-nav-daftar:hover { background: #3a6b1e !important; }

.hamburger {
  display: none;
  background: none;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
  color: #2D5016;
}

.mobile-menu {
  background: #fff;
  border-bottom: 1px solid #E8E0D0;
  padding: 1rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.mobile-menu a, .mobile-menu button {
  font-size: 0.95rem;
  font-weight: 500;
  color: #374151;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif;
  text-align: left;
  padding: 0;
}

/* HERO */
.hero {
  min-height: calc(100vh - 64px);
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  padding: 4rem 4rem;
  gap: 3rem;
  background: linear-gradient(135deg, #FDFAF4 60%, #F0F7E8);
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  width: 600px; height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(168, 201, 127, 0.15), transparent 70%);
  top: -200px; right: -200px;
  pointer-events: none;
}

.hero-content { position: relative; z-index: 1; }

.hero-badge {
  display: inline-block;
  background: #F0F7E8;
  border: 1px solid #A8C97F;
  color: #2D5016;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
}

.hero-title {
  font-family: 'Lora', serif;
  font-size: clamp(2.2rem, 4vw, 3.4rem);
  font-weight: 700;
  line-height: 1.2;
  color: #1A2E0A;
  margin-bottom: 1.25rem;
}

.hero-highlight {
  color: #2D5016;
  position: relative;
}
.hero-highlight::after {
  content: '';
  position: absolute;
  bottom: 2px; left: 0; right: 0;
  height: 4px;
  background: #A8C97F;
  border-radius: 2px;
  opacity: 0.6;
}

.hero-desc {
  color: #4B5563;
  font-size: 1.05rem;
  line-height: 1.7;
  margin-bottom: 2rem;
  max-width: 460px;
}

.hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2.5rem; }

.btn-hero-primary {
  background: #2D5016;
  color: #F5EDD6;
  padding: 0.85rem 1.75rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: background 0.2s, transform 0.15s;
  display: inline-block;
}
.btn-hero-primary:hover { background: #3a6b1e; transform: translateY(-1px); }

.btn-hero-secondary {
  background: transparent;
  color: #2D5016;
  border: 2px solid #2D5016;
  padding: 0.85rem 1.75rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s;
  display: inline-block;
}
.btn-hero-secondary:hover { background: #F0F7E8; }

.hero-stats {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.stat { display: flex; flex-direction: column; gap: 0.1rem; }
.stat-num { font-family: 'Lora', serif; font-size: 1.75rem; font-weight: 700; color: #2D5016; }
.stat-label { font-size: 0.8rem; color: #6B7280; }
.stat-divider { width: 1px; height: 36px; background: #D1D5DB; }

/* HERO VISUAL */
.hero-visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
}

.hero-blob {
  width: 320px; height: 320px;
  border-radius: 60% 40% 70% 30% / 50% 60% 40% 50%;
  background: linear-gradient(135deg, #A8C97F, #2D5016);
  opacity: 0.15;
  position: absolute;
  animation: blob 6s ease-in-out infinite alternate;
}

@keyframes blob {
  from { border-radius: 60% 40% 70% 30% / 50% 60% 40% 50%; }
  to   { border-radius: 40% 60% 30% 70% / 60% 40% 60% 40%; }
}

.hero-cards-float { position: absolute; width: 100%; height: 100%; }

.float-card {
  position: absolute;
  background: white;
  border: 1px solid #E8E0D0;
  border-radius: 12px;
  padding: 0.65rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  white-space: nowrap;
  animation: float 4s ease-in-out infinite alternate;
}

.fc1 { top: 15%; left: 5%; animation-delay: 0s; }
.fc2 { top: 35%; right: 2%; animation-delay: 0.8s; }
.fc3 { bottom: 25%; left: 10%; animation-delay: 1.4s; }
.fc4 { bottom: 10%; right: 10%; animation-delay: 0.4s; }

@keyframes float {
  from { transform: translateY(0px); }
  to   { transform: translateY(-10px); }
}

/* SECTIONS */
.section { padding: 5rem 0; }
.section-alt { background: #fff; }

.container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.section-title {
  font-family: 'Lora', serif;
  font-size: 1.75rem;
  font-weight: 700;
  color: #1A2E0A;
}

.lihat-semua {
  color: #2D5016;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: opacity 0.2s;
}
.lihat-semua:hover { opacity: 0.7; }

/* KATEGORI */
.kategori-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.kat-card {
  background: #fff;
  border: 1.5px solid #E8E0D0;
  border-radius: 16px;
  padding: 1.75rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  transition: all 0.2s;
}
.kat-card:hover {
  border-color: #2D5016;
  background: #F0F7E8;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(45,80,22,0.1);
}

.kat-icon { font-size: 2.5rem; }
.kat-name { font-size: 0.9rem; font-weight: 600; color: #374151; }

/* PRODUK GRID */
.produk-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.25rem;
}

.produk-skeleton {
  background: #F3F4F6;
  border-radius: 16px;
  height: 300px;
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }

.produk-card {
  background: #fff;
  border: 1px solid #E8E0D0;
  border-radius: 16px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
  display: block;
}
.produk-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.1);
  border-color: #A8C97F;
}

.produk-foto-wrap { position: relative; }
.produk-foto {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
  background: #F3F4F6;
}

.produk-kategori-badge {
  position: absolute;
  top: 0.6rem; left: 0.6rem;
  background: rgba(45,80,22,0.85);
  color: #F5EDD6;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  backdrop-filter: blur(4px);
}

.produk-info { padding: 0.9rem; }
.produk-toko { font-size: 0.75rem; color: #6B7280; margin-bottom: 0.25rem; }
.produk-nama {
  font-weight: 600;
  font-size: 0.95rem;
  color: #1A2E0A;
  margin-bottom: 0.75rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.produk-footer { display: flex; align-items: center; justify-content: space-between; }
.produk-harga {
  font-weight: 700;
  color: #2D5016;
  font-size: 0.95rem;
}
.produk-desa { font-size: 0.7rem; color: #9CA3AF; }

/* EMPTY STATE */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6B7280;
}
.empty-state span { font-size: 3rem; display: block; margin-bottom: 1rem; }

/* CTA */
.cta-section { padding: 5rem 0; }

.cta-card {
  background: linear-gradient(135deg, #2D5016, #3a6b1e);
  border-radius: 24px;
  padding: 3rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.cta-text h2 {
  font-family: 'Lora', serif;
  font-size: 1.75rem;
  color: #F5EDD6;
  margin-bottom: 0.5rem;
}

.cta-text p { color: #A8C97F; font-size: 1rem; }

.btn-cta {
  background: #F5EDD6;
  color: #2D5016;
  padding: 0.9rem 2rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.95rem;
  white-space: nowrap;
  transition: all 0.2s;
}
.btn-cta:hover { background: #fff; transform: translateY(-1px); }

/* FOOTER */
.footer {
  background: #1A2E0A;
  padding: 3rem 0;
  text-align: center;
}

.footer-brand {
  font-family: 'Lora', serif;
  font-size: 1.4rem;
  color: #F5EDD6;
  font-weight: 700;
  margin-bottom: 0.5rem;
}
.footer-desc { color: #A8C97F; font-size: 0.875rem; margin-bottom: 1rem; }
.footer-copy { color: #4B5563; font-size: 0.8rem; }

/* RESPONSIVE */
@media (max-width: 900px) {
  .hero { grid-template-columns: 1fr; padding: 3rem 2rem; min-height: auto; }
  .hero-visual { display: none; }
  .kategori-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .nav-links { display: none; }
  .hamburger { display: block; }
  .hero-title { font-size: 2rem; }
  .cta-card { flex-direction: column; text-align: center; }
  .kategori-grid { grid-template-columns: repeat(2, 1fr); }
  .produk-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>