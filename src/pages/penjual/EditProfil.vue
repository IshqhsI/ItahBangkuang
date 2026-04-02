<template>
  <div class="page">
    <nav class="navbar">
      <RouterLink to="/" class="nav-brand">🛒 ItahBangkuang</RouterLink>
      <div class="nav-links">
        <RouterLink to="/toko/dashboard">Dashboard</RouterLink>
        <RouterLink to="/toko/produk">Produk Saya</RouterLink>
        <RouterLink to="/toko/order">Order Masuk</RouterLink>
        <RouterLink to="/toko/profil" class="active">Profil Toko</RouterLink>
        <button class="btn-nav-outline" @click="logout">Keluar</button>
      </div>
      <button class="hamburger" @click="menuOpen = !menuOpen">☰</button>
    </nav>
    <div class="mobile-menu" v-if="menuOpen">
      <RouterLink to="/toko/dashboard" @click="menuOpen = false"
        >Dashboard</RouterLink
      >
      <RouterLink to="/toko/produk" @click="menuOpen = false"
        >Produk Saya</RouterLink
      >
      <RouterLink to="/toko/order" @click="menuOpen = false"
        >Order Masuk</RouterLink
      >
      <RouterLink to="/toko/profil" @click="menuOpen = false"
        >Profil Toko</RouterLink
      >
      <button @click="logout">Keluar</button>
    </div>

    <div class="page-header">
      <div class="container">
        <h1 class="page-title">Profil Toko</h1>
        <p class="page-sub">Informasi toko yang dilihat pembeli</p>
      </div>
    </div>

    <div class="container main-content">
      <div v-if="loadingData" class="loading-wrap">
        <div class="spinner"></div>
        <p>Memuat data toko...</p>
      </div>

      <div v-else class="form-layout">
        <!-- STATUS BANNER -->
        <div class="status-banner" :class="statusClass">
          <span class="status-icon-sm">{{ statusIcon }}</span>
          <div>
            <p class="status-label">Status Toko</p>
            <p class="status-val">{{ statusText }}</p>
            <p v-if="form.alasan_tolak" class="status-alasan">
              Alasan: "{{ form.alasan_tolak }}"
            </p>
          </div>
        </div>

        <form @submit.prevent="handleSubmit">
          <!-- FOTO TOKO -->
          <div class="form-section">
            <h2 class="section-title">Foto Toko</h2>
            <div class="foto-layout">
              <div
                class="foto-preview-wrap"
                @click="triggerUpload"
                :title="'Ganti foto toko'"
              >
                <img
                  v-if="previewUrl"
                  :src="previewUrl"
                  class="foto-preview"
                  alt="foto toko"
                />
                <div v-else class="foto-placeholder">🏪</div>
                <div class="foto-overlay">📷 Ganti</div>
              </div>
              <div class="foto-info">
                <p class="foto-hint">
                  Foto toko membuat pembeli lebih percaya. Gunakan logo atau
                  foto produk unggulan.
                </p>
                <button
                  type="button"
                  class="btn-upload-foto"
                  @click="triggerUpload"
                >
                  Upload Foto Toko
                </button>
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="onFileChange"
                  class="hidden"
                />
              </div>
            </div>
          </div>

          <!-- INFO TOKO -->
          <div class="form-section">
            <h2 class="section-title">Informasi Toko</h2>

            <div class="field">
              <label>Nama Toko <span class="required">*</span></label>
              <input
                v-model="form.nama_toko"
                type="text"
                placeholder="Nama tokomu"
                required
                maxlength="60"
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
              <span class="field-hint"
                >Nomor ini digunakan pembeli untuk menghubungi kamu</span
              >
            </div>

            <div class="field">
              <label>Alamat <span class="required">*</span></label>
              <input
                v-model="form.alamat"
                type="text"
                placeholder="Contoh: Jl. Mawar No. 5, RT 02, Desa Suka Maju"
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
                rows="4"
                placeholder="Ceritakan tentang toko kamu: jenis produk, cara order, jam buka, dll..."
                maxlength="300"
                :disabled="loading"
              ></textarea>
              <span class="field-hint"
                >{{ form.deskripsi.length }}/300 karakter</span
              >
            </div>
          </div>

          <div v-if="errorMsg" class="alert-error">⚠️ {{ errorMsg }}</div>
          <div v-if="successMsg" class="alert-success">✅ {{ successMsg }}</div>

          <div class="form-actions">
            <RouterLink to="/toko/dashboard" class="btn-cancel"
              >Kembali</RouterLink
            >
            <button
              type="submit"
              class="btn-submit"
              :disabled="loading || uploading"
            >
              <span v-if="loading || uploading" class="spinner-sm"></span>
              <span v-else>💾 Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/lib/supabase';

const router = useRouter();
const menuOpen = ref(false);
const loadingData = ref(true);
const loading = ref(false);
const uploading = ref(false);
const errorMsg = ref('');
const successMsg = ref('');
const fileInput = ref(null);
const previewUrl = ref('');
const fotoFile = ref(null);
const tokoId = ref(null);

const form = ref({
  nama_toko: '',
  nomor_wa: '',
  alamat: '',
  deskripsi: '',
  status: '',
  alasan_tolak: '',
});

const statusClass = computed(() => ({
  'status-aktif': form.value.status === 'AKTIF',
  'status-pending': form.value.status === 'PENDING',
  'status-tolak': form.value.status === 'DITOLAK',
  'status-blokir': form.value.status === 'DIBLOKIR',
}));

const statusIcon = computed(
  () =>
    ({ AKTIF: '✅', PENDING: '⏳', DITOLAK: '❌', DIBLOKIR: '🚫' })[
      form.value.status
    ] ?? '❓',
);
const statusText = computed(
  () =>
    ({
      AKTIF: 'Toko aktif dan bisa menerima order',
      PENDING: 'Menunggu verifikasi admin',
      DITOLAK: 'Pendaftaran ditolak admin',
      DIBLOKIR: 'Toko diblokir oleh admin',
    })[form.value.status] ?? '-',
);

const triggerUpload = () => fileInput.value?.click();

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    errorMsg.value = 'Ukuran foto maksimal 5MB.';
    return;
  }
  fotoFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
  errorMsg.value = '';
};

const uploadFoto = async () => {
  uploading.value = true;
  const ext = fotoFile.value.name.split('.').pop();
  const nama = `toko-${tokoId.value}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from('foto-toko')
    .upload(nama, fotoFile.value, { upsert: true });
  if (error) {
    uploading.value = false;
    return null;
  }
  const { data } = supabase.storage.from('foto-toko').getPublicUrl(nama);
  uploading.value = false;
  return data.publicUrl;
};

const handleSubmit = async () => {
  errorMsg.value = '';
  successMsg.value = '';
  loading.value = true;

  let fotoUrl = previewUrl.value;

  if (fotoFile.value) {
    fotoUrl = await uploadFoto();
    if (!fotoUrl) {
      errorMsg.value = 'Gagal upload foto. Coba lagi.';
      loading.value = false;
      return;
    }
  }

  const { error } = await supabase
    .from('toko')
    .update({
      nama_toko: form.value.nama_toko,
      nomor_wa: form.value.nomor_wa,
      alamat: form.value.alamat,
      deskripsi: form.value.deskripsi,
      foto_toko: fotoUrl || null,
    })
    .eq('id', tokoId.value);

  if (error) {
    errorMsg.value = 'Gagal menyimpan. Coba lagi.';
    loading.value = false;
    return;
  }

  successMsg.value = 'Profil toko berhasil diperbarui!';
  fotoFile.value = null;
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

  const { data: toko } = await supabase
    .from('toko')
    .select('*')
    .eq('user_id', session.user.id)
    .single();
  if (!toko) {
    router.push('/');
    return;
  }

  tokoId.value = toko.id;
  form.value = {
    nama_toko: toko.nama_toko ?? '',
    nomor_wa: toko.nomor_wa ?? '',
    alamat: toko.alamat ?? '',
    deskripsi: toko.deskripsi ?? '',
    status: toko.status ?? '',
    alasan_tolak: toko.alasan_tolak ?? '',
  };
  previewUrl.value = toko.foto_toko ?? '';
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
  transition: color 0.2s;
}
.nav-links a:hover,
.nav-links a.active {
  color: #2d5016;
  font-weight: 600;
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
  padding: 2.5rem 0;
}
.container {
  max-width: 680px;
  margin: 0 auto;
  padding: 0 2rem;
}
.page-title {
  font-family: 'Lora', serif;
  font-size: 2rem;
  font-weight: 700;
  color: #f5edd6;
  margin-bottom: 0.25rem;
}
.page-sub {
  color: #a8c97f;
  font-size: 0.875rem;
}

.main-content {
  padding: 2rem 2rem 4rem;
}

.loading-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem;
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

.form-layout {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* STATUS BANNER */
.status-banner {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  border: 1.5px solid;
}
.status-aktif {
  background: #f0fdf4;
  border-color: #bbf7d0;
}
.status-pending {
  background: #fffbeb;
  border-color: #fde68a;
}
.status-tolak {
  background: #fef2f2;
  border-color: #fecaca;
}
.status-blokir {
  background: #f9fafb;
  border-color: #d1d5db;
}
.status-icon-sm {
  font-size: 1.25rem;
  flex-shrink: 0;
}
.status-label {
  font-size: 0.7rem;
  color: #9ca3af;
  margin-bottom: 0.15rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.status-val {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}
.status-alasan {
  font-size: 0.78rem;
  color: #dc2626;
  margin-top: 0.25rem;
  font-style: italic;
}

/* FORM SECTIONS */
.form-section {
  background: #fff;
  border: 1px solid #e8e0d0;
  border-radius: 16px;
  padding: 1.5rem;
}
.section-title {
  font-family: 'Lora', serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: #1a2e0a;
  margin-bottom: 1.25rem;
}
.required {
  color: #dc2626;
}
.optional {
  font-size: 0.78rem;
  color: #9ca3af;
  font-weight: 400;
}

/* FOTO TOKO */
.foto-layout {
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
}
.foto-preview-wrap {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  border: 2px solid #e8e0d0;
}
.foto-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.foto-placeholder {
  width: 100%;
  height: 100%;
  background: #f0f7e8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
}
.foto-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  opacity: 0;
  transition: opacity 0.2s;
}
.foto-preview-wrap:hover .foto-overlay {
  opacity: 1;
}
.foto-info {
  flex: 1;
}
.foto-hint {
  font-size: 0.8rem;
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 0.75rem;
}
.btn-upload-foto {
  background: #f0f7e8;
  color: #2d5016;
  border: 1.5px solid #a8c97f;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-upload-foto:hover {
  background: #e0f0cc;
}
.hidden {
  display: none;
}

/* FIELDS */
.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1.1rem;
}
.field:last-child {
  margin-bottom: 0;
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

input,
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
input:disabled,
textarea:disabled {
  background: #f9fafb;
  cursor: not-allowed;
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
  white-space: nowrap;
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
.alert-success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
}
.btn-cancel {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  color: #374151;
  border: 1.5px solid #d1d5db;
  padding: 0.85rem 1.5rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.2s;
}
.btn-cancel:hover {
  background: #e5e7eb;
}
.btn-submit {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #2d5016;
  color: #f5edd6;
  border: none;
  padding: 0.85rem;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-submit:hover:not(:disabled) {
  background: #3a6b1e;
}
.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  .hamburger {
    display: block;
  }
}
</style>
