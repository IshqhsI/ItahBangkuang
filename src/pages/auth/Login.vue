<template>
  <div class="auth-wrap">
    <div class="auth-left">
      <div class="brand">
        <span class="brand-icon">🛒</span>
        <h1 class="brand-name">ItahBangkuang</h1>
        <p class="brand-tagline">Jajan lokal, dukung tetangga sendiri.</p>
      </div>
      <div class="deco-circles">
        <div class="circle c1"></div>
        <div class="circle c2"></div>
        <div class="circle c3"></div>
      </div>
    </div>

    <div class="auth-right">
      <div class="auth-card">
        <h2 class="form-title">Masuk</h2>
        <p class="form-sub">Belum punya akun? <RouterLink to="/register">Daftar di sini</RouterLink></p>

        <form @submit.prevent="handleLogin" class="form">
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
              <button type="button" class="toggle-pass" @click="showPass = !showPass">
                {{ showPass ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <div v-if="errorMsg" class="alert-error">
            ⚠️ {{ errorMsg }}
          </div>

          <button type="submit" class="btn-primary" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            <span v-else>Masuk</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useToastStore } from '@/stores/toast'

const router = useRouter()

const form = ref({ email: '', password: '' })
const loading = ref(false)
const showPass = ref(false)
const errorMsg = ref('')
const toast = useToastStore()

const handleLogin = async () => {
  loading.value = true
  errorMsg.value = ''

  const { data, error } = await supabase.auth.signInWithPassword({
    email: form.value.email,
    password: form.value.password,
  })

  if (error) {
    errorMsg.value = 'Email atau password salah. Coba lagi.'
    loading.value = false
    toast.error('Email atau password salah. Coba lagi.')
    return
  }

  // Ambil role lalu redirect
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  // (profile && profile.role) ? toast.success('Login berhasil!, Selamat datang! 👋') : toast.info('Login berhasil, tapi gagal mengambil profil. Coba refresh halaman.');
  
  if (profile?.role === 'penjual') {
    toast.success('Login berhasil!, Selamat datang! 👋')
    router.push('/toko/dashboard')
  }
  else if (profile?.role === 'admin') {
    toast.success('Login berhasil!, Selamat datang, Admin! 👋')
    router.push('/admin/dashboard')
  }
  else {
    toast.success('Login berhasil!, Selamat datang! 👋')
    router.push('/')
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Lora:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.auth-wrap {
  display: flex;
  min-height: 100vh;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* LEFT PANEL */
.auth-left {
  width: 42%;
  background: #2D5016;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  padding: 3rem;
}

.brand { text-align: center; position: relative; z-index: 2; }

.brand-icon { font-size: 3.5rem; display: block; margin-bottom: 1rem; }

.brand-name {
  font-family: 'Lora', serif;
  font-size: 2.8rem;
  color: #F5EDD6;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.brand-tagline {
  color: #A8C97F;
  font-size: 1.05rem;
  line-height: 1.6;
}

.deco-circles { position: absolute; inset: 0; }
.circle {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.08);
}
.c1 { width: 320px; height: 320px; top: -80px; right: -80px; }
.c2 { width: 200px; height: 200px; bottom: 40px; left: -60px; background: rgba(168, 201, 127, 0.08); }
.c3 { width: 100px; height: 100px; bottom: 160px; right: 40px; background: rgba(245, 237, 214, 0.05); }

/* RIGHT PANEL */
.auth-right {
  flex: 1;
  background: #FDFAF4;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.auth-card {
  width: 100%;
  max-width: 420px;
}

.form-title {
  font-family: 'Lora', serif;
  font-size: 2rem;
  color: #1A2E0A;
  font-weight: 700;
  margin-bottom: 0.4rem;
}

.form-sub {
  color: #6B7280;
  font-size: 0.9rem;
  margin-bottom: 2rem;
}

.form-sub a {
  color: #2D5016;
  font-weight: 600;
  text-decoration: none;
}
.form-sub a:hover { text-decoration: underline; }

.form { display: flex; flex-direction: column; gap: 1.25rem; }

.field { display: flex; flex-direction: column; gap: 0.4rem; }

label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
}

input {
  padding: 0.75rem 1rem;
  border: 1.5px solid #D1D5DB;
  border-radius: 10px;
  font-size: 0.95rem;
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: #fff;
  color: #111827;
  transition: border-color 0.2s;
  width: 100%;
}
input:focus { outline: none; border-color: #2D5016; }
input:disabled { background: #F3F4F6; cursor: not-allowed; }

.input-wrap { position: relative; }
.input-wrap input { padding-right: 3rem; }

.toggle-pass {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.25rem;
}

.alert-error {
  background: #FEF2F2;
  border: 1px solid #FECACA;
  color: #DC2626;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
}

.btn-primary {
  background: #2D5016;
  color: #F5EDD6;
  border: none;
  padding: 0.85rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Plus Jakarta Sans', sans-serif;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.btn-primary:hover:not(:disabled) { background: #3a6b1e; }
.btn-primary:active:not(:disabled) { transform: scale(0.98); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(245,237,214,0.3);
  border-top-color: #F5EDD6;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .auth-left { display: none; }
  .auth-right { background: #FDFAF4; }
  .auth-card { padding: 1rem; }
}
</style>