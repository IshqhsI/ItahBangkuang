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
              <img :src="produk.foto_url" :alt="produk.nama_produk" class="foto-utama" />
              <span class="kat-badge">{{ labelKategori(produk.kategori) }}</span>
              <span v-if="produk.stok === 0" class="habis-overlay">Stok Habis</span>
            </div>
          </div>

          <!-- INFO PRODUK -->
          <div class="info-section">
            <h1 class="produk-nama">{{ produk.nama_produk }}</h1>
            <div class="produk-harga">{{ formatRupiah(produk.harga) }}</div>

            <div class="produk-meta">
              <div class="meta-item">
                <span class="meta-label">Stok</span>
                <span class="meta-val" :class="{ habis: produk.stok === 0, low: produk.stok <= 5 && produk.stok > 0 }">
                  {{ produk.stok === 0 ? 'Habis' : produk.stok <= 5 ? `Sisa ${produk.stok}` : produk.stok + ' tersedia' }}
                </span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Kategori</span>
                <span class="meta-val">{{ labelKategori(produk.kategori) }}</span>
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
                <button @click="kurangiJumlah" :disabled="jumlah <= 1">−</button>
                <span>{{ jumlah }}</span>
                <button @click="tambahJumlah" :disabled="jumlah >= produk.stok">+</button>
              </div>
              <span class="subtotal">Total: <strong>{{ formatRupiah(produk.harga * jumlah) }}</strong></span>
            </div>

            <!-- TOMBOL AKSI -->
            <div class="aksi-wrap">
              <button v-if="produk.stok > 0" class="btn-pesan" @click="handlePesan">
                🛒 Pesan Sekarang
              </button>

              <button class="btn-wa" @click="chatWA">
                💬 Chat via WhatsApp
              </button>

              <!-- SHARE -->
              <div class="share-wrap">
                <span class="share-label">Bagikan produk ini:</span>
                <div class="share-btns">

                  <button class="share-btn share-wa" @click="shareWA" title="Bagikan ke WhatsApp">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="pointer-events:none">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.117 1.528 5.845L.057 23.5l5.815-1.527A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.373l-.36-.213-3.712.975.991-3.624-.234-.373A9.818 9.818 0 1112 21.818z"/>
                    </svg>
                    WhatsApp
                  </button>

                  <button class="share-btn share-fb" @click="shareFB" title="Bagikan ke Facebook">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="pointer-events:none">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </button>

                  <button class="share-btn share-copy" @click="copyLink">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="pointer-events:none">
                      <rect x="9" y="9" width="13" height="13" rx="2"></rect>
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                    </svg>
                    {{ copied ? '✅ Tersalin!' : 'Salin Link' }}
                  </button>

                </div>
              </div>
            </div>

            <div v-if="produk.stok === 0" class="info-habis">
              Stok sedang habis. Chat penjual untuk tanya ketersediaan.
            </div>

            <!-- INFO TOKO -->
            <RouterLink :to="`/toko/${toko?.id}`" class="toko-card">
              <div class="toko-foto-wrap">
                <img v-if="toko?.foto_toko" :src="toko.foto_toko" :alt="toko.nama_toko" class="toko-foto" />
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
            <RouterLink v-for="p in produkLain" :key="p.id" :to="`/produk/${p.id}`" class="mini-card">
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
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import LayoutPublic from '@/layouts/LayoutPublic.vue'
import { formatRupiah } from '@/lib/utils'
import { useProductSeo } from '@/lib/useSeo'
import { labelKategori } from '@/lib/kategori'

const route = useRoute()
const router = useRouter()
const user = ref(null)
const loading = ref(true)
const produk = ref(null)
const toko = ref(null)
const produkLain = ref([])
const jumlah = ref(1)
const copied = ref(false)

const kurangiJumlah = () => { if (jumlah.value > 1) jumlah.value-- }
const tambahJumlah  = () => { if (jumlah.value < produk.value.stok) jumlah.value++ }

const handlePesan = () => {
  if (!user.value) { router.push('/login'); return }
  router.push(`/pesan/${produk.value.id}?jumlah=${jumlah.value}`)
}

// Chat WA ke penjual — tanya stok
const chatWA = () => {
  const wa = toko.value?.nomor_wa?.replace(/^0/, '') ?? ''
  const pesan = `Halo, saya tertarik dengan produk *${produk.value.nama_produk}* di toko ${toko.value?.nama_toko}. Apakah masih tersedia?`
  window.open(`https://wa.me/62${wa}?text=${encodeURIComponent(pesan)}`, '_blank')
}

// Share ke WhatsApp (bukan ke penjual, tapi share link produk)
const shareWA = () => {
  const url = window.location.href
  const teks = `Hei, lihat produk ini 👇\n*${produk.value.nama_produk}*\n${formatRupiah(produk.value.harga)}\n\n${url}`
  window.open(`https://wa.me/?text=${encodeURIComponent(teks)}`, '_blank')
}

// Share ke Facebook
const shareFB = () => {
  const url = encodeURIComponent(window.location.href)
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400')
}

// Salin link
const copyLink = async () => {
  await navigator.clipboard.writeText(window.location.href)
  copied.value = true
  setTimeout(() => copied.value = false, 2500)
}

const getProduk = async (id) => {
  const { data: p } = await supabase
    .from('produk').select('*, toko(*)').eq('id', id).single()
  return p
}

const fetchData = async () => {
  loading.value = true
  jumlah.value = 1

  const p = await getProduk(route.params.id)

  if (!p || p.status !== 'AKTIF' || p.toko?.status !== 'AKTIF') {
    produk.value = null
    loading.value = false
    return
  }

  produk.value = p
  toko.value = p.toko

  useProductSeo({
    nama: p.nama_produk,
    deskripsi: p.deskripsi,
    harga: p.harga,
    foto: p.foto_url,
    tokoNama: p.toko.nama_toko,
    produkId: p.id,
  })

  const { data: lain } = await supabase
    .from('produk').select('id, nama_produk, foto_url, harga')
    .eq('toko_id', p.toko_id).eq('status', 'AKTIF').neq('id', p.id).limit(4)

  produkLain.value = lain ?? []
  loading.value = false
}

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) user.value = session.user
  fetchData()
})

watch(() => route.params.id, fetchData)
</script>

<style scoped>
.loading-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; padding: 6rem 2rem; color: #6b7280; }
.loading-spinner { width: 36px; height: 36px; border: 3px solid #e8e0d0; border-top-color: #2d5016; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.not-found { text-align: center; padding: 6rem 2rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
.not-found span { font-size: 3rem; }
.not-found h2 { font-family: 'Lora', serif; font-size: 1.5rem; color: #1a2e0a; }
.btn-back { color: #2d5016; text-decoration: none; font-weight: 600; font-size: 0.9rem; }
.detail-wrap { padding: 2rem 0 5rem; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 2rem; }
.breadcrumb { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: #9ca3af; margin-bottom: 2rem; flex-wrap: wrap; }
.breadcrumb a { color: #6b7280; text-decoration: none; transition: color 0.2s; }
.breadcrumb a:hover { color: #2d5016; }
.breadcrumb span:last-child { color: #374151; font-weight: 500; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; margin-bottom: 4rem; }
.foto-wrap { position: relative; border-radius: 20px; overflow: hidden; aspect-ratio: 1; }
.foto-utama { width: 100%; height: 100%; object-fit: cover; display: block; background: #f3f4f6; }
.kat-badge { position: absolute; top: 1rem; left: 1rem; background: rgba(45,80,22,0.88); color: #f5edd6; padding: 0.3rem 0.8rem; border-radius: 8px; font-size: 0.78rem; font-weight: 600; pointer-events: none; }
.habis-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.4rem; font-weight: 700; font-family: 'Lora', serif; pointer-events: none; }
.info-section { display: flex; flex-direction: column; gap: 1.25rem; }
.produk-nama { font-family: 'Lora', serif; font-size: 1.8rem; font-weight: 700; line-height: 1.3; color: #1a2e0a; }
.produk-harga { font-size: 1.75rem; font-weight: 700; color: #2d5016; }
.produk-meta { display: flex; gap: 1.5rem; }
.meta-item { display: flex; flex-direction: column; gap: 0.2rem; }
.meta-label { font-size: 0.75rem; color: #9ca3af; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
.meta-val { font-size: 0.9rem; font-weight: 600; color: #374151; }
.meta-val.habis { color: #dc2626; }
.meta-val.low { color: #d97706; }
.deskripsi-section h3 { font-size: 0.85rem; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
.deskripsi-section p { font-size: 0.95rem; color: #4b5563; line-height: 1.7; }
.jumlah-section { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
.jumlah-section label { font-size: 0.875rem; font-weight: 600; color: #374151; }
.jumlah-control { display: flex; align-items: center; border: 1.5px solid #d1d5db; border-radius: 10px; overflow: hidden; }
.jumlah-control button { width: 36px; height: 36px; background: #f3f4f6; border: none; font-size: 1.1rem; font-weight: 600; cursor: pointer; color: #374151; transition: background 0.2s; }
.jumlah-control button:hover:not(:disabled) { background: #e5e7eb; }
.jumlah-control button:disabled { opacity: 0.4; cursor: not-allowed; }
.jumlah-control span { width: 44px; text-align: center; font-weight: 600; font-size: 0.95rem; }
.subtotal { font-size: 0.875rem; color: #6b7280; }
.subtotal strong { color: #2d5016; }
.aksi-wrap { display: flex; flex-direction: column; gap: 0.75rem; }
.btn-pesan { background: #2d5016; color: #f5edd6; border: none; padding: 1rem; border-radius: 12px; font-size: 1rem; font-weight: 600; font-family: inherit; cursor: pointer; transition: background 0.2s, transform 0.15s; text-align: center; }
.btn-pesan:hover { background: #3a6b1e; transform: translateY(-1px); }
.btn-wa { background: #fff; color: #374151; border: 1.5px solid #d1d5db; padding: 0.9rem; border-radius: 12px; font-size: 0.95rem; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.2s; }
.btn-wa:hover { border-color: #25d366; color: #25d366; background: #f0fff4; }

/* SHARE */
.share-wrap { border-top: 1px solid #F0EDE6; padding-top: 0.85rem; }
.share-label { font-size: 0.75rem; color: #9CA3AF; font-weight: 500; display: block; margin-bottom: 0.6rem; text-transform: uppercase; letter-spacing: 0.05em; }
.share-btns { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.share-btn {
  display: inline-flex; align-items: center; gap: 0.45rem;
  padding: 0.5rem 0.9rem; border-radius: 8px; border: 1.5px solid;
  font-size: 0.8rem; font-weight: 600; font-family: inherit;
  cursor: pointer; transition: all 0.2s; white-space: nowrap;
}
.share-wa { background: #F0FFF4; color: #16A34A; border-color: #BBF7D0; }
.share-wa:hover { background: #25D366; color: #fff; border-color: #25D366; }
.share-fb { background: #EFF6FF; color: #1D4ED8; border-color: #BFDBFE; }
.share-fb:hover { background: #1877F2; color: #fff; border-color: #1877F2; }
.share-copy { background: #F9FAFB; color: #374151; border-color: #E5E7EB; }
.share-copy:hover { background: #F3F4F6; border-color: #D1D5DB; }

.info-habis { font-size: 0.85rem; color: #d97706; background: #fffbeb; border: 1px solid #fde68a; padding: 0.75rem 1rem; border-radius: 8px; }
.toko-card { display: flex; align-items: center; gap: 0.85rem; background: #fff; border: 1.5px solid #e8e0d0; border-radius: 14px; padding: 0.85rem 1rem; text-decoration: none; color: inherit; transition: all 0.2s; margin-top: 0.25rem; }
.toko-card:hover { border-color: #2d5016; background: #f7fbf0; }
.toko-foto-wrap { flex-shrink: 0; }
.toko-foto { width: 48px; height: 48px; border-radius: 10px; object-fit: cover; }
.toko-foto-placeholder { width: 48px; height: 48px; background: #f0f7e8; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; }
.toko-info { flex: 1; }
.toko-label { font-size: 0.7rem; color: #9ca3af; margin-bottom: 0.15rem; }
.toko-nama { font-weight: 600; font-size: 0.9rem; color: #1a2e0a; }
.toko-alamat { font-size: 0.75rem; color: #6b7280; margin-top: 0.15rem; }
.toko-arrow { color: #9ca3af; font-size: 1.2rem; pointer-events: none; }
.produk-lain { border-top: 1px solid #e8e0d0; padding-top: 3rem; }
.section-title { font-family: 'Lora', serif; font-size: 1.4rem; font-weight: 700; color: #1a2e0a; margin-bottom: 1.5rem; }
.produk-lain-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.mini-card { text-decoration: none; color: inherit; background: #fff; border: 1px solid #e8e0d0; border-radius: 12px; overflow: hidden; transition: all 0.2s; }
.mini-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); border-color: #a8c97f; }
.mini-foto { width: 100%; height: 120px; object-fit: cover; display: block; background: #f3f4f6; }
.mini-info { padding: 0.65rem; }
.mini-nama { font-size: 0.82rem; font-weight: 600; color: #1a2e0a; margin-bottom: 0.25rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.mini-harga { font-size: 0.82rem; font-weight: 700; color: #2d5016; }

@media (max-width: 768px) {
  .detail-grid { grid-template-columns: 1fr; gap: 1.5rem; }
  .produk-lain-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>