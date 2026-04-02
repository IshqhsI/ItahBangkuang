<template>
  <div class="auth-wrap">
    <div class="auth-left">
      <div class="brand">
        <span class="brand-icon">🛒</span>
        <h1 class="brand-name">ItahBangkuang</h1>
        <p class="brand-tagline">
          Bergabung dan mulai belanja atau jualan produk lokal kecamatan.
        </p>
      </div>
      <div class="deco-circles">
        <div class="circle c1"></div>
        <div class="circle c2"></div>
        <div class="circle c3"></div>
      </div>
    </div>

    <div class="auth-right">
      <div class="auth-card">
        <h2 class="form-title">Buat Akun</h2>
        <p class="form-sub">
          Sudah punya akun? <RouterLink to="/login">Masuk di sini</RouterLink>
        </p>

        <!-- STEP INDICATOR -->
        <div class="steps" v-if="form.role === 'penjual'">
          <div class="step" :class="{ active: step >= 1, done: step > 1 }">
            <span>1</span><small>Akun</small>
          </div>
          <div class="step-line" :class="{ active: step > 1 }"></div>
          <div class="step" :class="{ active: step >= 2 }">
            <span>2</span><small>Toko</small>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="form">
          <!-- ===== STEP 1: DATA AKUN ===== -->
          <template v-if="step === 1">
            <div class="field">
              <label>Nama Lengkap</label>
              <input
                v-model="form.nama"
                type="text"
                placeholder="Nama kamu"
                required
                :disabled="loading"
              />
            </div>

            <div class="field">
              <label>Email</label>
              <input
                v-model="form.email"
                type="email"
                placeholder="contoh@email.com"
                required
                :disabled="loading"
              />
            </div>

            <div class="field">
              <label>Password</label>
              <div class="input-wrap">
                <input
                  v-model="form.password"
                  :type="showPass ? 'text' : 'password'"
                  placeholder="Minimal 8 karakter"
                  required
                  :disabled="loading"
                />
                <button
                  type="button"
                  class="toggle-pass"
                  @click="showPass = !showPass"
                >
                  {{ showPass ? '🙈' : '👁️' }}
                </button>
              </div>
            </div>

            <div class="field">
              <label>Saya ingin bergabung sebagai</label>
              <div class="role-options">
                <label
                  class="role-card"
                  :class="{ selected: form.role === 'pembeli' }"
                >
                  <input type="radio" v-model="form.role" value="pembeli" />
                  <span class="role-icon">🛒</span>
                  <span class="role-label">Pembeli</span>
                  <span class="role-desc">Cari & beli produk lokal</span>
                </label>
                <label
                  class="role-card"
                  :class="{ selected: form.role === 'penjual' }"
                >
                  <input type="radio" v-model="form.role" value="penjual" />
                  <span class="role-icon">🍱</span>
                  <span class="role-label">Penjual</span>
                  <span class="role-desc">Buka toko & jual produk</span>
                </label>
              </div>
            </div>

            <div v-if="errorMsg" class="alert-error">⚠️ {{ errorMsg }}</div>

            <button
              type="button"
              class="btn-primary"
              @click="nextStep"
              :disabled="loading"
            >
              {{
                form.role === 'penjual' ? 'Lanjut → Isi Info Toko' : 'Buat Akun'
              }}
            </button>
          </template>

          <!-- ===== STEP 2: DATA TOKO (PENJUAL) ===== -->
          <template v-if="step === 2">
            <div class="info-box">
              📋 Toko kamu akan <strong>diverifikasi admin</strong> sebelum bisa
              mulai jualan.
            </div>

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
                @click="step = 1"
                :disabled="loading"
              >
                ← Kembali
              </button>
              <button type="submit" class="btn-primary" :disabled="loading">
                <span v-if="loading" class="spinner"></span>
                <span v-else>Daftar Sekarang</span>
              </button>
            </div>
          </template>
        </form>

        <!-- SUCCESS STATE -->
        <div v-if="success" class="success-box">
          <span class="success-icon">🎉</span>
          <h3>Pendaftaran Berhasil!</h3>
          <p v-if="form.role === 'penjual'">
            Toko kamu sedang dalam review admin. Kami akan mengaktifkan akunmu
            segera.
          </p>
          <p v-else>Silakan masuk ke akunmu sekarang.</p>
          <RouterLink
            to="/login"
            class="btn-primary"
            style="
              display: inline-block;
              margin-top: 1rem;
              text-decoration: none;
              text-align: center;
            "
          >
            Masuk Sekarang
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { supabase } from '@/lib/supabase';

const step = ref(1);
const loading = ref(false);
const showPass = ref(false);
const errorMsg = ref('');
const success = ref(false);

const form = ref({
  nama: '',
  email: '',
  password: '',
  role: 'pembeli',
  nama_toko: '',
  nomor_wa: '',
  alamat: '',
  deskripsi: '',
});

const nextStep = () => {
  errorMsg.value = '';
  if (!form.value.nama || !form.value.email || !form.value.password) {
    errorMsg.value = 'Semua field wajib diisi.';
    return;
  }
  if (form.value.password.length < 8) {
    errorMsg.value = 'Password minimal 8 karakter.';
    return;
  }
  if (form.value.role === 'penjual') {
    step.value = 2;
  } else {
    handleSubmit();
  }
};

const handleSubmit = async () => {
  loading.value = true
  errorMsg.value = ''

  const { data, error } = await supabase.auth.signUp({
    email: form.value.email,
    password: form.value.password,
    options: {
      data: {
        role: form.value.role,
        nama_lengkap: form.value.nama,
      },
    },
  })

  if (error) {
    errorMsg.value =
      error.message === 'User already registered'
        ? 'Email ini sudah terdaftar.'
        : 'Terjadi kesalahan. Coba lagi.'
    loading.value = false
    return
  }

  // Update nama di profiles
  await supabase
    .from('profiles')
    .update({ nama_lengkap: form.value.nama })
    .eq('id', data.user.id)

  // Jika penjual, buat data toko
  if (form.value.role === 'penjual') {
    await supabase.from('toko').insert({
      user_id: data.user.id,
      nama_toko: form.value.nama_toko,
      nomor_wa: form.value.nomor_wa,
      alamat: form.value.alamat,
      deskripsi: form.value.deskripsi,
      status: 'PENDING',
    })

    router.push('/toko/dashboard')   // ← langsung ke dashboard penjual
  } else {
    router.push('/')                 // ← langsung ke beranda
  }

  loading.value = false
}

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
  width: 40%;
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
  font-size: 2.6rem;
  color: #f5edd6;
  font-weight: 700;
  margin-bottom: 0.75rem;
}
.brand-tagline {
  color: #a8c97f;
  font-size: 0.95rem;
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
  max-width: 460px;
  padding: 0.5rem 0;
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
  margin-bottom: 1.5rem;
}
.form-sub a {
  color: #2d5016;
  font-weight: 600;
  text-decoration: none;
}
.form-sub a:hover {
  text-decoration: underline;
}

/* STEPS */
.steps {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 1.75rem;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.step span {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 600;
  color: #9ca3af;
  transition: all 0.3s;
}

.step small {
  font-size: 0.7rem;
  color: #9ca3af;
  transition: color 0.3s;
}

.step.active span {
  border-color: #2d5016;
  background: #2d5016;
  color: white;
}
.step.active small {
  color: #2d5016;
}
.step.done span {
  border-color: #2d5016;
  background: #f0f7e8;
  color: #2d5016;
}

.step-line {
  flex: 1;
  height: 2px;
  background: #e5e7eb;
  margin: 0 0.5rem;
  margin-bottom: 1rem;
  transition: background 0.3s;
}
.step-line.active {
  background: #2d5016;
}

/* FORM */
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

.input-wrap {
  position: relative;
}
.input-wrap input {
  padding-right: 3rem;
}
.toggle-pass {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
}

.input-prefix-wrap {
  display: flex;
}
.input-prefix {
  background: #f3f4f6;
  border: 1.5px solid #d1d5db;
  border-right: none;
  border-radius: 10px 0 0 10px;
  padding: 0.75rem 0.75rem;
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 600;
  white-space: nowrap;
}
.input-prefix-wrap input {
  border-radius: 0 10px 10px 0;
}

/* ROLE CARDS */
.role-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.role-card {
  border: 1.5px solid #d1d5db;
  border-radius: 12px;
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;
}
.role-card input[type='radio'] {
  display: none;
}
.role-card:hover {
  border-color: #a8c97f;
  background: #f7fbf0;
}
.role-card.selected {
  border-color: #2d5016;
  background: #f0f7e8;
}

.role-icon {
  font-size: 1.75rem;
}
.role-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #1a2e0a;
}
.role-desc {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
}

/* MISC */
.info-box {
  background: #fff8e7;
  border: 1px solid #fde68a;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #92400e;
}

.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
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

.btn-row {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.25rem;
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

/* SUCCESS */
.success-box {
  text-align: center;
  padding: 2rem;
  background: #f0f7e8;
  border-radius: 16px;
  border: 1.5px solid #a8c97f;
  margin-top: 1rem;
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
  .role-options {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
