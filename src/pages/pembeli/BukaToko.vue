<template>
  <div class="auth-wrap">
    <div class="auth-left">
      <div class="brand">
        <span class="brand-icon">🍱</span>
        <h1 class="brand-name">Buka Toko</h1>
        <p class="brand-tagline">Jangkau pembeli satu kecamatan, gratis.</p>
      </div>
      <div class="deco-circles">
        <div class="circle c1"></div>
        <div class="circle c2"></div>
        <div class="circle c3"></div>
      </div>
    </div>

    <div class="auth-right">
      <div class="auth-card">
        <!-- LOADING STATE -->
        <div v-if="loadingPage" class="loading-box">
          <div class="spinner-page"></div>
        </div>

        <!-- FORM STATE -->
        <template v-else-if="!success">
          <h2 class="form-title">Info Toko Kamu</h2>
          <p class="form-sub">Toko akan diverifikasi admin sebelum aktif.</p>

          <div class="info-box">
            📋 Kamu akan mendaftar sebagai <strong>Penjual</strong>. Setelah
            diverifikasi, kamu tetap bisa belanja seperti biasa.
          </div>

          <form @submit.prevent="handleSubmit" class="form">
            <div class="field">
              <label>Nama Toko</label>
              <input
                v-model="form.nama_toko"
                type="text"
                placeholder="Contoh: Kue Bunda Sari"
                required
                :disabled="loading"
              />
            </div>

            <div class="field">
              <label>Nomor WhatsApp</label>
              <div class="input-prefix-wrap">
                <span class="input-prefix">+62</span>
                <input
                  v-model="form.nomor_wa"
                  type="tel"
                  placeholder="81234567890"
                  required
                  :disabled="loading"
                />
              </div>
            </div>

            <div class="field">
              <label>Alamat Lengkap</label>
              <input
                v-model="form.alamat"
                type="text"
                placeholder="Contoh: Jl. Raya Suka Maju No. 123"
                required
                :disabled="loading"
              />
            </div>

            <div class="field">
              <label
                >Deskripsi Toko <span class="optional">(opsional)</span></label
              >
              <textarea
                v-model="form.deskripsi"
                placeholder="Ceritakan sedikit tentang toko kamu..."
                rows="3"
                :disabled="loading"
              ></textarea>
            </div>

            <div v-if="errorMsg" class="alert-error">⚠️ {{ errorMsg }}</div>

            <div class="btn-row">
              <button
                type="button"
                class="btn-back"
                @click="router.back()"
                :disabled="loading"
              >
                ← Kembali
              </button>
              <button type="submit" class="btn-primary" :disabled="loading">
                <span v-if="loading" class="spinner"></span>
                <span v-else>Daftar Jadi Penjual</span>
              </button>
            </div>
          </form>
        </template>

        <!-- SUCCESS STATE -->
        <div v-else class="success-box">
          <span class="success-icon">🎉</span>
          <h3>Pendaftaran Berhasil!</h3>
          <p>
            Toko kamu sedang dalam review admin. Kami akan mengaktifkan akunmu
            segera. Kamu sudah bisa masuk ke dashboard penjual.
          </p>
          <RouterLink to="/toko/dashboard" class="btn-primary btn-link">
            Ke Dashboard Toko →
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/lib/supabase';

const router = useRouter();

const loadingPage = ref(true);
const loading = ref(false);
const errorMsg = ref('');
const success = ref(false);

const form = ref({
  nama_toko: '',
  nomor_wa: '',
  alamat: '',
  deskripsi: '',
});

onMounted(async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Kalau belum login, suruh login dulu
  if (!session) {
    router.push('/login');
    return;
  }

  // Kalau sudah penjual, langsung ke dashboard
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (profile?.role === 'penjual') {
    router.push('/toko/dashboard');
    return;
  }

  const { data: tokoAda } = await supabase
    .from('toko')
    .select('id, status')
    .eq('user_id', session.user.id)
    .single()

  if (tokoAda) {
    // Sudah pernah daftar toko, arahkan ke dashboard penjual
    router.push('/toko/dashboard')
    return
  }

  loadingPage.value = false;
});

const handleSubmit = async () => {
  loading.value = true;
  errorMsg.value = '';

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    router.push('/login');
    return;
  }

  // Buat record toko
  const { error: tokoError } = await supabase.from('toko').insert({
    user_id: session.user.id,
    nama_toko: form.value.nama_toko,
    nomor_wa: form.value.nomor_wa,
    alamat: form.value.alamat,
    deskripsi: form.value.deskripsi,
    status: 'PENDING',
  });

  if (tokoError) {
    errorMsg.value = 'Gagal membuat toko. Coba lagi.';
    loading.value = false;
    return;
  }

  // Update role di profiles jadi penjual
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'penjual' })
    .eq('id', session.user.id);

  if (profileError) {
    errorMsg.value = 'Toko dibuat tapi gagal update role. Hubungi admin.';
    loading.value = false;
    return;
  }

  loading.value = false;
  success.value = true;
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Lora:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.auth-wrap {
  display: flex;
  min-height: 100vh;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.auth-left {
  width: 42%;
  background: #2d5016;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  padding: 3rem;
}

.brand {
  text-align: center;
  position: relative;
  z-index: 2;
}
.brand-icon {
  font-size: 3.5rem;
  display: block;
  margin-bottom: 1rem;
}
.brand-name {
  font-family: 'Lora', serif;
  font-size: 2.8rem;
  color: #f5edd6;
  font-weight: 700;
  margin-bottom: 0.75rem;
}
.brand-tagline {
  color: #a8c97f;
  font-size: 1.05rem;
  line-height: 1.6;
}

.deco-circles {
  position: absolute;
  inset: 0;
}
.circle {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.c1 {
  width: 320px;
  height: 320px;
  top: -80px;
  right: -80px;
}
.c2 {
  width: 200px;
  height: 200px;
  bottom: 40px;
  left: -60px;
  background: rgba(168, 201, 127, 0.08);
}
.c3 {
  width: 100px;
  height: 100px;
  bottom: 160px;
  right: 40px;
  background: rgba(245, 237, 214, 0.05);
}

.auth-right {
  flex: 1;
  background: #fdfaf4;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  overflow-y: auto;
}

.auth-card {
  width: 100%;
  max-width: 440px;
}

.form-title {
  font-family: 'Lora', serif;
  font-size: 2rem;
  color: #1a2e0a;
  font-weight: 700;
  margin-bottom: 0.4rem;
}

.form-sub {
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 1.25rem;
}

.info-box {
  background: #fff8e7;
  border: 1px solid #fde68a;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #92400e;
  margin-bottom: 1.5rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
}

.optional {
  font-weight: 400;
  color: #9ca3af;
}

input,
textarea {
  padding: 0.75rem 1rem;
  border: 1.5px solid #d1d5db;
  border-radius: 10px;
  font-size: 0.95rem;
  font-family: 'Plus Jakarta Sans', sans-serif;
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
input:disabled,
textarea:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}
textarea {
  resize: vertical;
}

.input-prefix-wrap {
  display: flex;
}
.input-prefix {
  background: #f3f4f6;
  border: 1.5px solid #d1d5db;
  border-right: none;
  border-radius: 10px 0 0 10px;
  padding: 0.75rem;
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 600;
}
.input-prefix-wrap input {
  border-radius: 0 10px 10px 0;
}

.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
}

.btn-row {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.btn-primary {
  background: #2d5016;
  color: #f5edd6;
  border: none;
  padding: 0.85rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Plus Jakarta Sans', sans-serif;
  cursor: pointer;
  transition:
    background 0.2s,
    transform 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex: 1;
}
.btn-primary:hover:not(:disabled) {
  background: #3a6b1e;
}
.btn-primary:active:not(:disabled) {
  transform: scale(0.98);
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-link {
  display: block;
  margin-top: 1.25rem;
  text-decoration: none;
  text-align: center;
}

.btn-back {
  background: #f3f4f6;
  color: #374151;
  border: 1.5px solid #d1d5db;
  padding: 0.85rem 1.25rem;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: 'Plus Jakarta Sans', sans-serif;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-back:hover {
  background: #e5e7eb;
}
.btn-back:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
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

.loading-box {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}
.spinner-page {
  width: 36px;
  height: 36px;
  border: 3px solid #e5e7eb;
  border-top-color: #2d5016;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.success-box {
  text-align: center;
  padding: 2rem;
  background: #f0f7e8;
  border-radius: 16px;
  border: 1.5px solid #a8c97f;
}
.success-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}
.success-box h3 {
  font-family: 'Lora', serif;
  font-size: 1.4rem;
  color: #1a2e0a;
  margin-bottom: 0.5rem;
}
.success-box p {
  color: #4b5563;
  font-size: 0.9rem;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .auth-left {
    display: none;
  }
}
</style>
