<template>
  <LayoutPublic>
    <div class="page-header">
      <div class="container">
        <RouterLink to="/" class="back-link">← Kembali</RouterLink>
        <h1 class="page-title">Sampaikan Pendapatmu</h1>
        <p class="page-sub">Saran, keluhan, atau ide fitur kamu sangat berarti untuk kami.</p>
      </div>
    </div>

    <div class="container main-content">

      <!-- Belum login -->
      <div v-if="!authStore.user" class="gate-card">
        <span class="gate-icon">🔐</span>
        <h2>Perlu Login Dulu</h2>
        <p>Kamu perlu login untuk mengirim feedback.</p>
        <RouterLink to="/login" class="btn-primary">Masuk Sekarang</RouterLink>
      </div>

      <!-- Sudah login - success state -->
      <div v-else-if="success" class="success-card">
        <span class="success-icon">🎉</span>
        <h2>Terima Kasih!</h2>
        <p>Feedback kamu sudah kami terima. Tim kami akan membacanya dan terus memperbaiki ItahBangkuang.</p>
        <div class="success-actions">
          <button class="btn-secondary" @click="kirimLagi">Kirim Feedback Lagi</button>
          <RouterLink to="/" class="btn-primary">Kembali ke Beranda</RouterLink>
        </div>
      </div>

      <!-- Form feedback -->
      <div v-else class="form-card">
        <div class="kategori-grid">
          <button
            v-for="k in kategoriList"
            :key="k.slug"
            type="button"
            class="kat-btn"
            :class="{ active: form.kategori === k.slug }"
            @click="form.kategori = k.slug"
          >
            <span class="kat-icon">{{ k.icon }}</span>
            <span class="kat-label">{{ k.label }}</span>
            <span class="kat-desc">{{ k.desc }}</span>
          </button>
        </div>

        <div class="field">
          <label>
            {{ labelKategori }} <span class="required">*</span>
          </label>
          <textarea
            v-model="form.isi"
            :placeholder="placeholder"
            rows="6"
            maxlength="1000"
            :disabled="loading"
          ></textarea>
          <span class="field-hint">{{ form.isi.length }}/1000 karakter</span>
        </div>

        <div v-if="errorMsg" class="alert-error">⚠️ {{ errorMsg }}</div>

        <button
          class="btn-submit"
          @click="handleSubmit"
          :disabled="loading || !form.kategori || !form.isi.trim()"
        >
          <span v-if="loading" class="spinner-sm"></span>
          <span v-else>Kirim Feedback</span>
        </button>
      </div>
    </div>
  </LayoutPublic>
</template>

<script setup>
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import LayoutPublic from '@/layouts/LayoutPublic.vue'

const authStore = useAuthStore()

const loading = ref(false)
const success = ref(false)
const errorMsg = ref('')

const form = ref({
  kategori: 'saran',
  isi: '',
})

const kategoriList = [
  {
    slug: 'saran',
    label: 'Saran & Ide',
    icon: '💡',
    desc: 'Ide perbaikan platform',
    placeholder: 'Contoh: Saya rasa halaman produk akan lebih baik jika ada fitur...',
  },
  {
    slug: 'keluhan',
    label: 'Keluhan & Laporan',
    icon: '⚠️',
    desc: 'Ada masalah atau pelanggaran',
    placeholder: 'Contoh: Saya menemukan masalah saat melakukan order, yaitu...',
  },
  {
    slug: 'fitur',
    label: 'Request Fitur',
    icon: '🛠️',
    desc: 'Fitur baru yang kamu butuhkan',
    placeholder: 'Contoh: Saya ingin ada fitur [nama fitur] karena...',
  },
]

const labelKategori = computed(() =>
  kategoriList.find((k) => k.slug === form.value.kategori)?.label ?? 'Ceritakan'
)

const placeholder = computed(() =>
  kategoriList.find((k) => k.slug === form.value.kategori)?.placeholder ?? 'Tulis di sini...'
)

const handleSubmit = async () => {
  if (!form.value.isi.trim()) {
    errorMsg.value = 'Isi feedback tidak boleh kosong.'
    return
  }

  loading.value = true
  errorMsg.value = ''

  const { error } = await supabase.from('feedback').insert({
    user_id:  authStore.user.id,
    kategori: form.value.kategori,
    isi:      form.value.isi.trim(),
    status:   'BARU',
  })

  if (error) {
    errorMsg.value = 'Gagal mengirim feedback. Coba lagi.'
    loading.value = false
    return
  }

  success.value = true
  loading.value = false
}

const kirimLagi = () => {
  success.value = false
  form.value = { kategori: 'saran', isi: '' }
  errorMsg.value = ''
}
</script>

<style scoped>
.page-header {
  background: linear-gradient(135deg, #2d5016, #3a6b1e);
  padding: 2rem 0;
}
.container {
  max-width: 680px;
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
.back-link:hover { opacity: 0.7; }
.page-title {
  font-family: 'Lora', serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: #f5edd6;
  margin-bottom: 0.35rem;
}
.page-sub {
  color: #a8c97f;
  font-size: 0.9rem;
}

.main-content { padding: 2rem 2rem 4rem; }

/* GATE */
.gate-card {
  text-align: center;
  background: #fff;
  border: 1px solid #e8e0d0;
  border-radius: 20px;
  padding: 3rem 2rem;
}
.gate-icon { font-size: 3rem; display: block; margin-bottom: 1rem; }
.gate-card h2 {
  font-family: 'Lora', serif;
  font-size: 1.4rem;
  color: #1a2e0a;
  margin-bottom: 0.5rem;
}
.gate-card p { color: #6b7280; font-size: 0.9rem; margin-bottom: 1.5rem; }

/* SUCCESS */
.success-card {
  text-align: center;
  background: #f0f7e8;
  border: 1.5px solid #a8c97f;
  border-radius: 20px;
  padding: 3rem 2rem;
}
.success-icon { font-size: 3.5rem; display: block; margin-bottom: 1rem; }
.success-card h2 {
  font-family: 'Lora', serif;
  font-size: 1.5rem;
  color: #1a2e0a;
  margin-bottom: 0.5rem;
}
.success-card p { color: #4b5563; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.5rem; }
.success-actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }

/* FORM */
.form-card {
  background: #fff;
  border: 1px solid #e8e0d0;
  border-radius: 20px;
  padding: 2rem;
}

.kategori-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.75rem;
}
.kat-btn {
  border: 1.5px solid #d1d5db;
  border-radius: 12px;
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  background: #fff;
  transition: all 0.2s;
  font-family: inherit;
}
.kat-btn:hover { border-color: #a8c97f; background: #f7fbf0; }
.kat-btn.active { border-color: #2d5016; background: #f0f7e8; }
.kat-icon { font-size: 1.75rem; }
.kat-label { font-weight: 600; font-size: 0.85rem; color: #1a2e0a; }
.kat-desc { font-size: 0.72rem; color: #6b7280; text-align: center; line-height: 1.3; }

.field { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.25rem; }
label { font-size: 0.85rem; font-weight: 600; color: #374151; }
.required { color: #dc2626; }
.field-hint { font-size: 0.72rem; color: #9ca3af; }

textarea {
  padding: 0.85rem 1rem;
  border: 1.5px solid #d1d5db;
  border-radius: 10px;
  font-size: 0.9rem;
  font-family: inherit;
  background: #fff;
  color: #111827;
  transition: border-color 0.2s;
  width: 100%;
  resize: vertical;
}
textarea:focus { outline: none; border-color: #2d5016; }
textarea:disabled { background: #f9fafb; cursor: not-allowed; }

.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.btn-submit {
  width: 100%;
  background: #2d5016;
  color: #f5edd6;
  border: none;
  padding: 0.9rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.btn-submit:hover:not(:disabled) { background: #3a6b1e; }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-primary {
  display: inline-block;
  background: #2d5016;
  color: #f5edd6;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.2s;
}
.btn-primary:hover { background: #3a6b1e; }

.btn-secondary {
  display: inline-block;
  background: #f0f7e8;
  color: #2d5016;
  border: 1.5px solid #a8c97f;
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.2s;
}
.btn-secondary:hover { background: #e0f0cc; }

.spinner-sm {
  width: 16px; height: 16px;
  border: 2px solid rgba(245, 237, 214, 0.3);
  border-top-color: #f5edd6;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 640px) {
  .kategori-grid { grid-template-columns: 1fr; }
}
</style>
