<template>
  <div class="page">

    <!-- NAVBAR -->
    <nav class="navbar">
      <RouterLink to="/" class="nav-brand">🛒 ItahBangkuang</RouterLink>
      <div class="nav-links">
        <RouterLink to="/produk" class="active">Semua Produk</RouterLink>
        <template v-if="!user">
          <RouterLink to="/login" class="btn-nav-outline">Masuk</RouterLink>
          <RouterLink to="/daftar" class="btn-nav-solid">Daftar</RouterLink>
        </template>
        <template v-else>
          <RouterLink v-if="role === 'penjual'" to="/toko/dashboard" class="btn-nav-outline">Dashboard</RouterLink>
          <RouterLink v-if="role === 'admin'" to="/admin/dashboard" class="btn-nav-outline">Admin</RouterLink>
          <RouterLink to="/riwayat" class="btn-nav-outline">Pesanan Saya</RouterLink>
          <button class="btn-nav-outline" @click="logout">Keluar</button>
        </template>
      </div>
      <button class="hamburger" @click="menuOpen = !menuOpen">☰</button>
    </nav>

    <div class="mobile-menu" v-if="menuOpen">
      <RouterLink to="/" @click="menuOpen = false">Beranda</RouterLink>
      <RouterLink to="/produk" @click="menuOpen = false">Semua Produk</RouterLink>
      <template v-if="!user">
        <RouterLink to="/login" @click="menuOpen = false">Masuk</RouterLink>
        <RouterLink to="/daftar" @click="menuOpen = false">Daftar</RouterLink>
      </template>
      <template v-else>
        <RouterLink to="/riwayat" @click="menuOpen = false">Pesanan Saya</RouterLink>
        <button @click="logout">Keluar</button>
      </template>
    </div>

    <!-- PAGE HEADER -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">Semua Produk</h1>
        <p class="page-sub">Jajanan & makanan rumahan dari warga kecamatan</p>
      </div>
    </div>

    <!-- FILTER & SEARCH -->
    <div class="filter-bar">
      <div class="container filter-inner">
        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input
            v-model="keyword"
            type="text"
            placeholder="Cari produk..."
            @input="onSearch"
            class="search-input"
          />
          <button v-if="keyword" class="search-clear" @click="clearSearch">✕</button>
        </div>
        <div class="kat-tabs">
          <button
            v-for="k in kategoriList"
            :key="k.slug"
            class="kat-tab"
            :class="{ active: kategoriAktif === k.slug }"
            @click="setKategori(k.slug)"
          >
            {{ k.icon }} {{ k.nama }}
          </button>
        </div>
        <select v-model="sortBy" @change="fetchProduk" class="sort-select">
          <option value="terbaru">Terbaru</option>
          <option value="termurah">Harga: Termurah</option>
          <option value="termahal">Harga: Termahal</option>
        </select>
      </div>
    </div>

    <!-- CONTENT -->
    <div class="main-content">
      <div class="container">
        <div class="result-info" v-if="!loadingProduk">
          <span v-if="keyword || kategoriAktif !== 'semua'">
            Menampilkan <strong>{{ produkList.length }}</strong> produk
            <span v-if="keyword"> untuk "<em>{{ keyword }}</em>"</span>
            <span v-if="kategoriAktif !== 'semua'"> • {{ labelKategori(kategoriAktif) }}</span>
          </span>
          <span v-else><strong>{{ produkList.length }}</strong> produk tersedia</span>
        </div>

        <!-- Loading skeleton -->
        <div v-if="loadingProduk" class="produk-grid">
          <div v-for="n in 8" :key="n" class="produk-skeleton"></div>
        </div>

        <!-- Produk grid -->
        <div v-else-if="produkList.length" class="produk-grid">
          <RouterLink
            v-for="p in produkList"
            :key="p.id"
            :to="`/produk/${p.id}`"
            class="produk-card"
          >
            <div class="produk-foto-wrap">
              <img :src="p.foto_url" :alt="p.nama_produk" class="produk-foto" loading="lazy" />
              <span class="produk-kat-badge">{{ labelKategori(p.kategori) }}</span>
              <span v-if="p.stok === 0" class="produk-habis-badge">Habis</span>
            </div>
            <div class="produk-info">
              <p class="produk-toko">🏪 {{ p.toko?.nama_toko }}</p>
              <h3 class="produk-nama">{{ p.nama_produk }}</h3>
              <p class="produk-alamat">📍 {{ p.toko?.alamat }}</p>
              <div class="produk-footer">
                <span class="produk-harga">{{ formatRupiah(p.harga) }}</span>
                <span class="produk-stok" :class="{ low: p.stok <= 5 && p.stok > 0 }">
                  {{ p.stok > 0 ? `Stok: ${p.stok}` : 'Habis' }}
                </span>
              </div>
            </div>
          </RouterLink>
        </div>

        <!-- Empty state -->
        <div v-else class="empty-state">
          <span class="empty-icon">🍽️</span>
          <h3>Produk tidak ditemukan</h3>
          <p v-if="keyword">Coba kata kunci lain atau hapus filter.</p>
          <p v-else>Belum ada produk di kategori ini.</p>
          <button v-if="keyword || kategoriAktif !== 'semua'" @click="resetFilter" class="btn-reset">
            Tampilkan Semua Produk
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const user = ref(null)
const role = ref(null)
const menuOpen = ref(false)
const loadingProduk = ref(true)
const produkList = ref([])
const keyword = ref('')
const kategoriAktif = ref('semua')
const sortBy = ref('terbaru')
let searchTimeout = null

const kategoriList = [
  { slug: 'semua', nama: 'Semua', icon: '🛒' },
  { slug: 'kue_basah', nama: 'Kue Basah', icon: '🍰' },
  { slug: 'kue_kering', nama: 'Kue Kering', icon: '🍪' },
  { slug: 'makanan', nama: 'Makanan', icon: '🍱' },
  { slug: 'minuman', nama: 'Minuman', icon: '🥤' },
]

const labelKategori = (slug) => kategoriList.find(k => k.slug === slug)?.nama ?? slug

const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', {
  style: 'currency', currency: 'IDR', minimumFractionDigits: 0
}).format(angka)

const fetchProduk = async () => {
  loadingProduk.value = true
  let query = supabase
    .from('produk')
    .select('*, toko(nama_toko, alamat, status)')
    .eq('status', 'AKTIF')

  if (kategoriAktif.value !== 'semua') query = query.eq('kategori', kategoriAktif.value)
  if (keyword.value.trim()) query = query.ilike('nama_produk', `%${keyword.value.trim()}%`)
  if (sortBy.value === 'terbaru') query = query.order('created_at', { ascending: false })
  else if (sortBy.value === 'termurah') query = query.order('harga', { ascending: true })
  else if (sortBy.value === 'termahal') query = query.order('harga', { ascending: false })

  const { data } = await query
  produkList.value = data?.filter(p => p.toko?.status === 'AKTIF') ?? []
  loadingProduk.value = false
}

const setKategori = (slug) => { kategoriAktif.value = slug; fetchProduk() }
const onSearch = () => { clearTimeout(searchTimeout); searchTimeout = setTimeout(fetchProduk, 400) }
const clearSearch = () => { keyword.value = ''; fetchProduk() }
const resetFilter = () => { keyword.value = ''; kategoriAktif.value = 'semua'; fetchProduk() }
const logout = async () => { await supabase.auth.signOut(); router.push('/') }

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    user.value = session.user
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
    role.value = profile?.role
  }
  fetchProduk()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
.page { font-family: 'Plus Jakarta Sans', sans-serif; background: #FDFAF4; min-height: 100vh; color: #1A2E0A; }

.navbar {
  position: sticky; top: 0; z-index: 100;
  background: rgba(253,250,244,0.95); backdrop-filter: blur(8px);
  border-bottom: 1px solid #E8E0D0; padding: 0 2rem; height: 64px;
  display: flex; align-items: center; justify-content: space-between;
}
.nav-brand { font-family: 'Lora', serif; font-size: 1.3rem; font-weight: 700; color: #2D5016; text-decoration: none; }
.nav-links { display: flex; align-items: center; gap: 1.25rem; }
.nav-links a { color: #374151; text-decoration: none; font-size: 0.875rem; font-weight: 500; transition: color 0.2s; }
.nav-links a:hover, .nav-links a.active { color: #2D5016; }
.btn-nav-outline {
  background: none; border: 1.5px solid #2D5016; color: #2D5016 !important;
  padding: 0.4rem 0.9rem; border-radius: 8px; font-size: 0.8rem !important;
  font-weight: 600 !important; cursor: pointer; font-family: inherit; transition: background 0.2s;
}
.btn-nav-outline:hover { background: #F0F7E8 !important; }
.btn-nav-solid {
  background: #2D5016; color: #F5EDD6 !important; padding: 0.4rem 0.9rem;
  border-radius: 8px; font-size: 0.8rem !important; font-weight: 600 !important; transition: background 0.2s;
}
.btn-nav-solid:hover { background: #3a6b1e !important; }
.hamburger { display: none; background: none; border: none; font-size: 1.4rem; cursor: pointer; color: #2D5016; }
.mobile-menu {
  background: #fff; border-bottom: 1px solid #E8E0D0;
  padding: 1rem 2rem; display: flex; flex-direction: column; gap: 0.75rem;
}
.mobile-menu a, .mobile-menu button {
  font-size: 0.95rem; font-weight: 500; color: #374151; text-decoration: none;
  background: none; border: none; cursor: pointer; font-family: inherit; text-align: left;
}

.page-header { background: linear-gradient(135deg, #2D5016, #3a6b1e); padding: 3rem 0 2.5rem; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
.page-title { font-family: 'Lora', serif; font-size: 2.2rem; font-weight: 700; color: #F5EDD6; margin-bottom: 0.4rem; }
.page-sub { color: #A8C97F; font-size: 0.95rem; }

.filter-bar {
  background: #fff; border-bottom: 1px solid #E8E0D0;
  padding: 1rem 0; position: sticky; top: 64px; z-index: 90;
}
.filter-inner { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
.search-wrap { position: relative; flex: 1; min-width: 180px; }
.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); font-size: 0.9rem; }
.search-input {
  width: 100%; padding: 0.6rem 2.5rem 0.6rem 2.25rem;
  border: 1.5px solid #D1D5DB; border-radius: 10px;
  font-size: 0.875rem; font-family: inherit; background: #FDFAF4;
  color: #111827; transition: border-color 0.2s;
}
.search-input:focus { outline: none; border-color: #2D5016; }
.search-clear { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #9CA3AF; }
.kat-tabs { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.kat-tab {
  padding: 0.4rem 0.8rem; border: 1.5px solid #E8E0D0; border-radius: 999px;
  background: #fff; color: #6B7280; font-size: 0.78rem; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: all 0.2s; white-space: nowrap;
}
.kat-tab:hover { border-color: #A8C97F; color: #2D5016; background: #F7FBF0; }
.kat-tab.active { border-color: #2D5016; background: #2D5016; color: #F5EDD6; }
.sort-select {
  padding: 0.5rem 0.75rem; border: 1.5px solid #D1D5DB; border-radius: 10px;
  font-size: 0.8rem; font-family: inherit; background: #fff; color: #374151; cursor: pointer;
}
.sort-select:focus { outline: none; border-color: #2D5016; }

.main-content { padding: 2rem 0 4rem; }
.result-info { font-size: 0.875rem; color: #6B7280; margin-bottom: 1.5rem; }
.result-info strong { color: #1A2E0A; }

.produk-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.25rem; }
.produk-skeleton {
  background: linear-gradient(90deg, #F3F4F6 25%, #E9EAEB 50%, #F3F4F6 75%);
  background-size: 200% 100%; border-radius: 16px; height: 290px;
  animation: shimmer 1.4s ease-in-out infinite;
}
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

.produk-card {
  background: #fff; border: 1px solid #E8E0D0; border-radius: 16px;
  overflow: hidden; text-decoration: none; color: inherit;
  display: block; transition: all 0.2s;
}
.produk-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); border-color: #A8C97F; }
.produk-foto-wrap { position: relative; }
.produk-foto { width: 100%; height: 170px; object-fit: cover; display: block; background: #F3F4F6; }
.produk-kat-badge {
  position: absolute; top: 0.6rem; left: 0.6rem;
  background: rgba(45,80,22,0.88); color: #F5EDD6;
  padding: 0.2rem 0.55rem; border-radius: 6px; font-size: 0.67rem; font-weight: 600;
}
.produk-habis-badge {
  position: absolute; top: 0.6rem; right: 0.6rem;
  background: rgba(220,38,38,0.88); color: #fff;
  padding: 0.2rem 0.55rem; border-radius: 6px; font-size: 0.67rem; font-weight: 600;
}
.produk-info { padding: 0.85rem; }
.produk-toko { font-size: 0.71rem; color: #6B7280; margin-bottom: 0.2rem; }
.produk-nama {
  font-weight: 600; font-size: 0.9rem; color: #1A2E0A; margin-bottom: 0.25rem;
  line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.produk-alamat { font-size: 0.69rem; color: #9CA3AF; margin-bottom: 0.6rem; }
.produk-footer { display: flex; align-items: center; justify-content: space-between; }
.produk-harga { font-weight: 700; color: #2D5016; font-size: 0.9rem; }
.produk-stok { font-size: 0.69rem; color: #6B7280; }
.produk-stok.low { color: #D97706; font-weight: 600; }

.empty-state { text-align: center; padding: 5rem 2rem; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
.empty-icon { font-size: 3.5rem; }
.empty-state h3 { font-family: 'Lora', serif; font-size: 1.3rem; color: #1A2E0A; }
.empty-state p { color: #6B7280; font-size: 0.9rem; }
.btn-reset {
  margin-top: 0.5rem; background: #2D5016; color: #F5EDD6; border: none;
  padding: 0.7rem 1.5rem; border-radius: 10px; font-size: 0.875rem;
  font-weight: 600; font-family: inherit; cursor: pointer; transition: background 0.2s;
}
.btn-reset:hover { background: #3a6b1e; }

@media (max-width: 768px) {
  .nav-links { display: none; }
  .hamburger { display: block; }
  .filter-inner { flex-direction: column; align-items: stretch; }
  .sort-select { width: 100%; }
  .produk-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 400px) {
  .produk-grid { grid-template-columns: 1fr; }
}
</style>