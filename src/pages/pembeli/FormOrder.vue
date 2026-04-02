<template>
  <div class="page">
    <nav class="navbar">
      <RouterLink to="/" class="nav-brand">🛒 ItahBangkuang</RouterLink>
      <div class="nav-links">
        <RouterLink to="/produk">Semua Produk</RouterLink>
        <RouterLink to="/riwayat" class="btn-nav-outline"
          >Pesanan Saya</RouterLink
        >
        <button class="btn-nav-outline" @click="logout">Keluar</button>
      </div>
      <button class="hamburger" @click="menuOpen = !menuOpen">☰</button>
    </nav>
    <div class="mobile-menu" v-if="menuOpen">
      <RouterLink to="/produk" @click="menuOpen = false"
        >Semua Produk</RouterLink
      >
      <RouterLink to="/riwayat" @click="menuOpen = false"
        >Pesanan Saya</RouterLink
      >
      <button @click="logout">Keluar</button>
    </div>

    <div class="page-header">
      <div class="container">
        <RouterLink :to="`/produk/${route.params.id}`" class="back-link"
          >← Kembali ke Produk</RouterLink
        >
        <h1 class="page-title">Buat Pesanan</h1>
      </div>
    </div>

    <div v-if="loadingData" class="loading-wrap">
      <div class="spinner"></div>
      <p>Memuat produk...</p>
    </div>

    <div v-else-if="!produk" class="not-found">
      <span>😕</span>
      <h2>Produk tidak ditemukan</h2>
      <RouterLink to="/produk" class="btn-link">← Kembali</RouterLink>
    </div>

    <!-- SUCCESS STATE -->
    <div v-else-if="orderSuccess" class="success-wrap">
      <div class="success-card">
        <span class="success-icon">🎉</span>
        <h2>Pesanan Berhasil Dikirim!</h2>
        <p>
          Penjual akan segera mengkonfirmasi pesananmu. Koordinasikan pengiriman
          langsung via WhatsApp.
        </p>
        <div class="success-detail">
          <div class="detail-row">
            <span>Produk</span>
            <strong>{{ produk.nama_produk }}</strong>
          </div>
          <div class="detail-row">
            <span>Jumlah</span>
            <strong>{{ form.jumlah }} pcs</strong>
          </div>
          <div class="detail-row">
            <span>Total</span>
            <strong class="total-green">{{
              formatRupiah(produk.harga * form.jumlah)
            }}</strong>
          </div>
          <div class="detail-row">
            <span>Metode Bayar</span>
            <strong>{{ form.metode }}</strong>
          </div>
        </div>
        <div class="success-actions">
          <button class="btn-wa-seller" @click="chatPenjual">
            💬 Chat Penjual via WA
          </button>
          <RouterLink to="/riwayat" class="btn-riwayat"
            >Lihat Riwayat Pesanan</RouterLink
          >
        </div>
      </div>
    </div>

    <!-- FORM ORDER -->
    <div v-else class="container main-content">
      <div class="order-layout">
        <!-- RINGKASAN PRODUK -->
        <div class="produk-summary">
          <h2 class="summary-title">Ringkasan Produk</h2>
          <div class="summary-card">
            <img
              :src="produk.foto_url"
              :alt="produk.nama_produk"
              class="summary-foto"
            />
            <div class="summary-info">
              <p class="summary-toko">🏪 {{ produk.toko?.nama_toko }}</p>
              <h3 class="summary-nama">{{ produk.nama_produk }}</h3>
              <p class="summary-harga">
                {{ formatRupiah(produk.harga) }} / pcs
              </p>
              <p class="summary-stok">Stok tersedia: {{ produk.stok }}</p>
            </div>
          </div>

          <!-- Jumlah -->
          <div class="jumlah-wrap">
            <label>Jumlah Pesanan</label>
            <div class="jumlah-control">
              <button
                type="button"
                @click="kurangi"
                :disabled="form.jumlah <= 1"
              >
                −
              </button>
              <input
                v-model.number="form.jumlah"
                type="number"
                :min="1"
                :max="produk.stok"
                @change="clampJumlah"
              />
              <button
                type="button"
                @click="tambah"
                :disabled="form.jumlah >= produk.stok"
              >
                +
              </button>
            </div>
          </div>

          <!-- Total -->
          <div class="total-box">
            <span class="total-label">Total Pembayaran</span>
            <span class="total-val">{{
              formatRupiah(produk.harga * form.jumlah)
            }}</span>
          </div>
        </div>

        <!-- FORM -->
        <div class="form-wrap">
          <h2 class="form-title">Data Pemesan</h2>

          <form @submit.prevent="handleOrder">
            <div class="field">
              <label>Nama Lengkap <span class="required">*</span></label>
              <input
                v-model="form.nama_pemesan"
                type="text"
                placeholder="Nama kamu"
                required
                :disabled="loading"
              />
            </div>

            <div class="field">
              <label>Nomor WhatsApp <span class="required">*</span></label>
              <div class="input-prefix-wrap">
                <span class="prefix">+62</span>
                <input
                  v-model="form.nomor_wa"
                  type="tel"
                  placeholder="81234567890"
                  required
                  :disabled="loading"
                />
              </div>
              <span class="field-hint">Penjual akan menghubungi nomor ini</span>
            </div>

            <div class="field">
              <label>Alamat Lengkap <span class="required">*</span></label>
              <textarea
                v-model="form.alamat"
                rows="3"
                placeholder="Jl. contoh No. 5, RT 02, Desa ..."
                required
                :disabled="loading"
              ></textarea>
            </div>

            <div class="field">
              <label>Metode Pembayaran <span class="required">*</span></label>
              <div class="metode-options">
                <label
                  class="metode-card"
                  :class="{ selected: form.metode === 'COD' }"
                >
                  <input type="radio" v-model="form.metode" value="COD" />
                  <span class="metode-icon">🤝</span>
                  <span class="metode-label">COD</span>
                  <span class="metode-desc">Bayar saat terima</span>
                </label>
                <label
                  class="metode-card"
                  :class="{ selected: form.metode === 'TRANSFER' }"
                >
                  <input type="radio" v-model="form.metode" value="TRANSFER" />
                  <span class="metode-icon">🏦</span>
                  <span class="metode-label">Transfer</span>
                  <span class="metode-desc">Transfer via bank/e-wallet</span>
                </label>
              </div>
            </div>

            <div class="field">
              <label>Catatan <span class="optional">(opsional)</span></label>
              <textarea
                v-model="form.catatan"
                rows="2"
                placeholder="Contoh: tolong jangan pedas, minta dikemas rapi..."
                :disabled="loading"
              ></textarea>
            </div>

            <div v-if="errorMsg" class="alert-error">⚠️ {{ errorMsg }}</div>

            <button type="submit" class="btn-order" :disabled="loading">
              <span v-if="loading" class="spinner-sm"></span>
              <span v-else>🛒 Kirim Pesanan</span>
            </button>

            <p class="order-note">
              Dengan memesan, kamu setuju untuk berkoordinasi langsung dengan
              penjual via WhatsApp untuk konfirmasi dan pengiriman.
            </p>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '@/lib/supabase';

const route = useRoute();
const router = useRouter();
const menuOpen = ref(false);
const loadingData = ref(true);
const loading = ref(false);
const errorMsg = ref('');
const produk = ref(null);
const orderSuccess = ref(false);
const userId = ref(null);

const form = ref({
  nama_pemesan: '',
  nomor_wa: '',
  alamat: '',
  metode: 'COD',
  catatan: '',
  jumlah: 1,
});

const formatRupiah = (a) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(a);

const kurangi = () => {
  if (form.value.jumlah > 1) form.value.jumlah--;
};
const tambah = () => {
  if (form.value.jumlah < produk.value.stok) form.value.jumlah++;
};
const clampJumlah = () => {
  if (form.value.jumlah < 1) form.value.jumlah = 1;
  if (form.value.jumlah > produk.value.stok)
    form.value.jumlah = produk.value.stok;
};

const chatPenjual = () => {
  const wa = produk.value?.toko?.nomor_wa?.replace(/^0/, '') ?? '';
  const pesan = `Halo, saya sudah memesan *${produk.value.nama_produk}* (${form.value.jumlah} pcs) via ItahBangkuang. Mohon dikonfirmasi ya!`;
  window.open(
    `https://wa.me/62${wa}?text=${encodeURIComponent(pesan)}`,
    '_blank',
  );
};

const handleOrder = async () => {
  loading.value = true;
  errorMsg.value = '';

  if (form.value.jumlah > produk.value.stok) {
    errorMsg.value = `Stok tidak cukup. Stok tersedia: ${produk.value.stok}`;
    loading.value = false;
    return;
  }

  const { error } = await supabase.from('orders').insert({
    produk_id: produk.value.id,
    toko_id: produk.value.toko_id,
    pembeli_id: userId.value,
    nama_pemesan: form.value.nama_pemesan,
    nomor_wa_pembeli: form.value.nomor_wa,
    alamat: form.value.alamat,
    jumlah: form.value.jumlah,
    total_harga: produk.value.harga * form.value.jumlah,
    metode: form.value.metode,
    catatan: form.value.catatan,
    status: 'MENUNGGU',
  });

  if (error) {
    errorMsg.value = 'Gagal mengirim pesanan. Coba lagi.';
    loading.value = false;
    return;
  }

  // Kurangi stok
  await supabase
    .from('produk')
    .update({ stok: produk.value.stok - form.value.jumlah })
    .eq('id', produk.value.id);

  orderSuccess.value = true;
  loading.value = false;
};

const logout = async () => {
  await supabase.auth.signOut();
  router.push('/');
};

onMounted(async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    router.push('/login');
    return;
  }
  userId.value = session.user.id;

  // Pre-fill dari query param
  if (route.query.jumlah) form.value.jumlah = parseInt(route.query.jumlah) || 1;

  const { data: p } = await supabase
    .from('produk')
    .select('*, toko(nama_toko, nomor_wa, status)')
    .eq('id', route.params.id)
    .single();

  if (!p || p.status !== 'AKTIF' || p.toko?.status !== 'AKTIF') {
    loadingData.value = false;
    return;
  }

  produk.value = p;
  if (form.value.jumlah > p.stok) form.value.jumlah = p.stok || 1;
  loadingData.value = false;
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.page {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: #fdfaf4;
  min-height: 100vh;
  color: #1a2e0a;
}

.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(253, 250, 244, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid #e8e0d0;
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
  color: #2d5016;
  text-decoration: none;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}
.nav-links a {
  color: #374151;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
}
.nav-links a:hover {
  color: #2d5016;
}
.btn-nav-outline {
  background: none;
  border: 1.5px solid #2d5016;
  color: #2d5016 !important;
  padding: 0.4rem 0.9rem;
  border-radius: 8px;
  font-size: 0.8rem !important;
  font-weight: 600 !important;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s;
}
.btn-nav-outline:hover {
  background: #f0f7e8 !important;
}
.hamburger {
  display: none;
  background: none;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
  color: #2d5016;
}
.mobile-menu {
  background: #fff;
  border-bottom: 1px solid #e8e0d0;
  padding: 1rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.mobile-menu a,
.mobile-menu button {
  font-size: 0.95rem;
  font-weight: 500;
  color: #374151;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
}

.page-header {
  background: linear-gradient(135deg, #2d5016, #3a6b1e);
  padding: 2rem 0;
}
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 2rem;
}
.back-link {
  color: #a8c97f;
  font-size: 0.85rem;
  text-decoration: none;
  display: inline-block;
  margin-bottom: 0.75rem;
}
.back-link:hover {
  opacity: 0.7;
}
.page-title {
  font-family: 'Lora', serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: #f5edd6;
}

.loading-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 5rem;
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
.spinner-sm {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(245, 237, 214, 0.3);
  border-top-color: #f5edd6;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.not-found {
  text-align: center;
  padding: 5rem;
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
  font-size: 1.4rem;
}
.btn-link {
  color: #2d5016;
  text-decoration: none;
  font-weight: 600;
}

/* SUCCESS */
.success-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
  padding: 2rem;
}
.success-card {
  background: #fff;
  border: 1.5px solid #a8c97f;
  border-radius: 24px;
  padding: 2.5rem;
  max-width: 460px;
  width: 100%;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.07);
}
.success-icon {
  font-size: 3.5rem;
  display: block;
  margin-bottom: 1rem;
}
.success-card h2 {
  font-family: 'Lora', serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a2e0a;
  margin-bottom: 0.5rem;
}
.success-card p {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}
.success-detail {
  background: #fdfaf4;
  border: 1px solid #e8e0d0;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}
.detail-row span {
  color: #6b7280;
}
.detail-row strong {
  color: #374151;
}
.total-green {
  color: #2d5016 !important;
  font-size: 1rem;
}
.success-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.btn-wa-seller {
  background: #25d366;
  color: #fff;
  border: none;
  padding: 0.85rem;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-wa-seller:hover {
  background: #1ebe5d;
}
.btn-riwayat {
  display: block;
  background: #f0f7e8;
  color: #2d5016;
  border: 1.5px solid #a8c97f;
  padding: 0.85rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s;
}
.btn-riwayat:hover {
  background: #e0f0cc;
}

/* FORM */
.main-content {
  padding: 2rem 2rem 4rem;
}
.order-layout {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 1.5rem;
  align-items: start;
}

/* PRODUK SUMMARY */
.produk-summary {
  background: #fff;
  border: 1px solid #e8e0d0;
  border-radius: 16px;
  padding: 1.5rem;
  position: sticky;
  top: 80px;
}
.summary-title {
  font-family: 'Lora', serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: #1a2e0a;
  margin-bottom: 1rem;
}
.summary-card {
  display: flex;
  gap: 0.85rem;
  margin-bottom: 1.25rem;
}
.summary-foto {
  width: 72px;
  height: 72px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
  background: #f3f4f6;
}
.summary-toko {
  font-size: 0.72rem;
  color: #6b7280;
  margin-bottom: 0.2rem;
}
.summary-nama {
  font-weight: 600;
  font-size: 0.875rem;
  color: #1a2e0a;
  margin-bottom: 0.25rem;
  line-height: 1.4;
}
.summary-harga {
  font-weight: 700;
  color: #2d5016;
  font-size: 0.875rem;
  margin-bottom: 0.15rem;
}
.summary-stok {
  font-size: 0.72rem;
  color: #6b7280;
}

.jumlah-wrap {
  margin-bottom: 1rem;
}
.jumlah-wrap label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #374151;
  display: block;
  margin-bottom: 0.5rem;
}
.jumlah-control {
  display: flex;
  align-items: center;
  border: 1.5px solid #d1d5db;
  border-radius: 10px;
  overflow: hidden;
  width: fit-content;
}
.jumlah-control button {
  width: 38px;
  height: 38px;
  background: #f3f4f6;
  border: none;
  font-size: 1.1rem;
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
.jumlah-control input {
  width: 52px;
  height: 38px;
  border: none;
  text-align: center;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: inherit;
  background: #fff;
  color: #1a2e0a;
}
.jumlah-control input:focus {
  outline: none;
}

.total-box {
  background: #f0f7e8;
  border: 1.5px solid #a8c97f;
  border-radius: 10px;
  padding: 0.85rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.total-label {
  font-size: 0.82rem;
  color: #2d5016;
  font-weight: 500;
}
.total-val {
  font-family: 'Lora', serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d5016;
}

/* FORM WRAP */
.form-wrap {
  background: #fff;
  border: 1px solid #e8e0d0;
  border-radius: 16px;
  padding: 1.5rem;
}
.form-title {
  font-family: 'Lora', serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: #1a2e0a;
  margin-bottom: 1.25rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1.1rem;
}
label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #374151;
}
.field-hint {
  font-size: 0.72rem;
  color: #9ca3af;
}
.required {
  color: #dc2626;
}
.optional {
  font-size: 0.78rem;
  color: #9ca3af;
  font-weight: 400;
}
input[type='text'],
input[type='tel'],
textarea {
  padding: 0.75rem 1rem;
  border: 1.5px solid #d1d5db;
  border-radius: 10px;
  font-size: 0.9rem;
  font-family: inherit;
  background: #fff;
  color: #111827;
  transition: border-color 0.2s;
  width: 100%;
}
input:focus,
textarea:focus {
  outline: none;
  border-color: #2d5016;
}
textarea {
  resize: vertical;
}
.input-prefix-wrap {
  display: flex;
}
.prefix {
  background: #f3f4f6;
  border: 1.5px solid #d1d5db;
  border-right: none;
  border-radius: 10px 0 0 10px;
  padding: 0.75rem 0.75rem;
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 600;
}
.input-prefix-wrap input {
  border-radius: 0 10px 10px 0;
}

.metode-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.metode-card {
  border: 1.5px solid #d1d5db;
  border-radius: 12px;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;
}
.metode-card input[type='radio'] {
  display: none;
}
.metode-card:hover {
  border-color: #a8c97f;
  background: #f7fbf0;
}
.metode-card.selected {
  border-color: #2d5016;
  background: #f0f7e8;
}
.metode-icon {
  font-size: 1.5rem;
}
.metode-label {
  font-weight: 600;
  font-size: 0.875rem;
  color: #1a2e0a;
}
.metode-desc {
  font-size: 0.72rem;
  color: #6b7280;
  text-align: center;
}

.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.btn-order {
  width: 100%;
  background: #2d5016;
  color: #f5edd6;
  border: none;
  padding: 1rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.85rem;
}
.btn-order:hover:not(:disabled) {
  background: #3a6b1e;
}
.btn-order:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.order-note {
  font-size: 0.75rem;
  color: #9ca3af;
  line-height: 1.5;
  text-align: center;
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  .hamburger {
    display: block;
  }
  .order-layout {
    grid-template-columns: 1fr;
  }
  .produk-summary {
    position: static;
  }
  .metode-options {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
