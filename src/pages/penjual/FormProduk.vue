<template>
  <LayoutPenjual :statusToko="statusToko" :tokoId="tokoId">
    <div class="page-header">
      <div class="container">
        <RouterLink to="/toko/produk" class="back-link"
          >← Kembali ke Produk</RouterLink
        >
        <h1 class="page-title">
          {{ isEdit ? 'Edit Produk' : 'Tambah Produk Baru' }}
        </h1>
      </div>
    </div>

    <div class="container main-content">
      <!-- Alert error -->
      <div v-if="errorMsg" class="alert-error">⚠️ {{ errorMsg }}</div>
      
      <!-- Loading saat edit -->
      <div v-if="loadingData" class="loading-wrap">
        <div class="spinner"></div>
        <p>Memuat data produk...</p>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="form-grid">

        <!-- KOLOM KIRI -->
        <div class="form-left">
          <!-- Upload Foto -->
          <div class="form-section">
            <h2 class="section-title">
              Foto Produk <span class="required">*</span>
            </h2>
            <p class="section-sub">
              Foto yang menarik = produk lebih cepat laku. Gunakan foto terang
              dan jernih.
            </p>

            <div
              class="foto-upload"
              :class="{ 'has-foto': previewUrl, 'drag-over': isDragging }"
              @click="triggerUpload"
              @dragover.prevent="isDragging = true"
              @dragleave="isDragging = false"
              @drop.prevent="onDrop"
            >
              <img
                v-if="previewUrl"
                :src="previewUrl"
                class="foto-preview"
                alt="preview"
              />
              <div v-else class="foto-placeholder">
                <span class="upload-icon">📷</span>
                <p class="upload-text">Klik atau seret foto ke sini</p>
                <p class="upload-hint">JPG, PNG • Maks. 2MB</p>
              </div>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                @change="onFileChange"
                class="hidden-input"
              />
            </div>

            <button
              v-if="previewUrl"
              type="button"
              class="btn-ganti-foto"
              @click="triggerUpload"
            >
              🔄 Ganti Foto
            </button>
          </div>

          <!-- Info Harga & Stok -->
          <div class="form-section">
            <h2 class="section-title">Harga & Stok</h2>
            <div class="field-row">
              <div class="field">
                <label>Harga (Rp) <span class="required">*</span></label>
                <div class="input-prefix-wrap">
                  <span class="prefix">Rp</span>
                  <input
                    v-model.number="form.harga"
                    type="number"
                    min="100"
                    placeholder="15000"
                    required
                    :disabled="loading"
                  />
                </div>
                <span class="field-hint">{{
                  form.harga ? formatRupiah(form.harga) : ''
                }}</span>
              </div>
              <div class="field">
                <label>Stok <span class="required">*</span></label>
                <input
                  v-model.number="form.stok"
                  type="number"
                  min="0"
                  placeholder="10"
                  required
                  :disabled="loading"
                />
                <span class="field-hint">Isi 0 jika sedang habis</span>
              </div>
            </div>
          </div>
        </div>

        <!-- KOLOM KANAN -->
        <div class="form-right">
          <div class="form-section">
            <h2 class="section-title">Informasi Produk</h2>

            <div class="field">
              <label>Nama Produk <span class="required">*</span></label>
              <input
                v-model="form.nama_produk"
                type="text"
                placeholder="Contoh: Kue Lapis Pandan"
                required
                maxlength="100"
                :disabled="loading"
              />
              <span class="field-hint"
                >{{ form.nama_produk.length }}/100 karakter</span
              >
            </div>

            <div class="field">
              <label>Kategori <span class="required">*</span></label>
              <select v-model="form.kategori" required :disabled="loading">
                <option value="" disabled>Pilih kategori...</option>
                <option value="kue_basah">🍰 Kue Basah</option>
                <option value="kue_kering">🍪 Kue Kering</option>
                <option value="makanan">🍱 Makanan</option>
                <option value="minuman">🥤 Minuman</option>
              </select>
            </div>

            <div class="field">
              <label>Deskripsi <span class="optional">(opsional)</span></label>
              <textarea
                v-model="form.deskripsi"
                rows="5"
                placeholder="Ceritakan tentang produk ini: bahan, rasa, cara penyimpanan, minimal order, dll..."
                maxlength="500"
                :disabled="loading"
              ></textarea>
              <span class="field-hint"
                >{{ form.deskripsi.length }}/500 karakter</span
              >
            </div>

            <!-- Status (hanya saat edit) -->
            <div class="field" v-if="isEdit">
              <label>Status Produk</label>
              <select v-model="form.status" :disabled="loading">
                <option value="AKTIF">✅ Aktif — tampil di toko</option>
                <option value="HABIS">❌ Stok Habis</option>
                <option value="DISEMBUNYIKAN">🙈 Disembunyikan</option>
              </select>
            </div>
          </div>

          <!-- Alert sukses -->
          <div v-if="successMsg" class="alert-success">✅ {{ successMsg }}</div>

          <!-- Upload progress -->
          <div v-if="uploading" class="upload-progress">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: uploadProgress + '%' }"
              ></div>
            </div>
            <p class="progress-text">
              Mengupload foto... {{ uploadProgress }}%
            </p>
          </div>

          <div class="form-actions">
            <RouterLink to="/toko/produk" class="btn-cancel">Batal</RouterLink>
            <button
              type="submit"
              class="btn-submit"
              :disabled="loading || uploading"
            >
              <span v-if="loading || uploading" class="spinner-sm"></span>
              <span v-else>{{
                isEdit ? '💾 Simpan Perubahan' : '🚀 Tambah Produk'
              }}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </LayoutPenjual>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '@/lib/supabase';
import { formatRupiah } from '@/lib/utils';
import LayoutPenjual from '@/layouts/LayoutPenjual.vue';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const loadingData = ref(!!route.params.id);
const uploading = ref(false);
const uploadProgress = ref(0);
const errorMsg = ref('');
const successMsg = ref('');
const fileInput = ref(null);
const previewUrl = ref('');
const fotoFile = ref(null);
const isDragging = ref(false);
const tokoId = ref(null);
const statusToko = ref(null);

const isEdit = computed(() => !!route.params.id);

const form = ref({
  nama_produk: '',
  kategori: '',
  deskripsi: '',
  harga: '',
  stok: '',
  status: 'AKTIF',
});

const triggerUpload = () => fileInput.value?.click();

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) prosesFile(file);
};

const onDrop = (e) => {
  isDragging.value = false;
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) prosesFile(file);
};

const prosesFile = (file) => {
  if (file.size > 2 * 1024 * 1024) {
    errorMsg.value = 'Ukuran foto maksimal 2MB.';
    return;
  }
  fotoFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
  errorMsg.value = '';
};

const uploadFoto = async () => {
  if (!fotoFile.value) return null;
  uploading.value = true;
  uploadProgress.value = 30;

  const ext = fotoFile.value.name.split('.').pop();
  const namaFile = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from('foto-produk')
    .upload(namaFile, fotoFile.value);
  if (error) {
    uploading.value = false;
    return null;
  }

  uploadProgress.value = 80;
  const { data } = supabase.storage.from('foto-produk').getPublicUrl(namaFile);
  uploadProgress.value = 100;
  uploading.value = false;
  return data.publicUrl;
};

const handleSubmit = async () => {
  errorMsg.value = '';
  successMsg.value = '';

  // Validasi foto wajib saat tambah
  if (!isEdit.value && !fotoFile.value) {
    errorMsg.value = 'Foto produk wajib diisi.';
    return;
  }

  // Tambahkan validasi ini:
  if (!form.value.harga || form.value.harga < 100) {
    errorMsg.value = 'Harga minimal Rp 100.';
    return;
  }

  if (
    form.value.stok === '' ||
    form.value.stok === null ||
    form.value.stok < 0
  ) {
    errorMsg.value = 'Stok tidak boleh kosong atau negatif.';
    return;
  }

  loading.value = true;

  let fotoUrl = previewUrl.value; // pakai url lama kalau edit & tidak ganti foto

  // Upload foto baru kalau ada
  if (fotoFile.value) {
    fotoUrl = await uploadFoto();
    if (!fotoUrl) {
      errorMsg.value = 'Gagal upload foto. Coba lagi.';
      loading.value = false;
      return;
    }
  }

  const payload = {
    nama_produk: form.value.nama_produk,
    kategori: form.value.kategori,
    deskripsi: form.value.deskripsi,
    harga: form.value.harga,
    stok: form.value.stok,
    foto_url: fotoUrl,
    ...(isEdit.value
      ? { status: form.value.status }
      : { toko_id: tokoId.value }),
  };

  if (isEdit.value) {
    const { error } = await supabase
      .from('produk')
      .update(payload)
      .eq('id', route.params.id)
      .eq('toko_id', tokoId.value);
    if (error) {
      errorMsg.value = 'Gagal menyimpan. Coba lagi.';
      loading.value = false;
      return;
    }
    successMsg.value = 'Produk berhasil diperbarui!';
    setTimeout(() => router.push('/toko/produk'), 750);
  } else {
    const { error } = await supabase.from('produk').insert(payload);
    if (error) {
      errorMsg.value = 'Gagal menambah produk. Coba lagi.';
      loading.value = false;
      return;
    }
    successMsg.value = 'Produk berhasil ditambahkan!';
    setTimeout(() => router.push('/toko/produk'), 1000);
  }

  loading.value = false;
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
    .select('id, status')
    .eq('user_id', session.user.id)
    .single();
  if (!toko || toko.status !== 'AKTIF') {
    router.push('/toko/dashboard');
    return;
  }
  
  statusToko.value = toko.status;
  tokoId.value = toko.id;

  // Load data produk kalau mode edit
  if (isEdit.value) {
    loadingData.value = true;
    const { data: p } = await supabase
      .from('produk')
      .select('*')
      .eq('id', route.params.id)
      .eq('toko_id', toko.id)
      .single();
    if (!p) {
      router.push('/toko/produk');
      return;
    }

    form.value = {
      nama_produk: p.nama_produk,
      kategori: p.kategori,
      deskripsi: p.deskripsi ?? '',
      harga: p.harga,
      stok: p.stok,
      status: p.status,
    };
    previewUrl.value = p.foto_url;
    loadingData.value = false;
  } else {
    loadingData.value = false; // mode tambah: langsung tampil form
  }
});
</script>

<style scoped>
.page-header {
  background: linear-gradient(135deg, #2d5016, #3a6b1e);
  padding: 2rem 0;
}
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 2rem;
}
.back-link {
  color: #a8c97f;
  font-size: 0.85rem;
  text-decoration: none;
  display: inline-block;
  margin-bottom: 0.75rem;
  transition: opacity 0.2s;
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

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 1.5rem;
  align-items: start;
}

.form-section {
  background: #fff;
  border: 1px solid #e8e0d0;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}
.section-title {
  font-family: 'Lora', serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: #1a2e0a;
  margin-bottom: 0.3rem;
}
.section-sub {
  font-size: 0.78rem;
  color: #9ca3af;
  margin-bottom: 1.25rem;
  line-height: 1.5;
}
.required {
  color: #dc2626;
}
.optional {
  font-size: 0.78rem;
  color: #9ca3af;
  font-weight: 400;
}

/* FOTO UPLOAD */
.foto-upload {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.foto-upload:hover,
.foto-upload.drag-over {
  border-color: #2d5016;
  background: #f7fbf0;
}
.foto-upload.has-foto {
  border-style: solid;
  border-color: #a8c97f;
}
.foto-preview {
  width: 100%;
  height: 240px;
  object-fit: cover;
  display: block;
}
.foto-placeholder {
  text-align: center;
  padding: 2rem;
}
.upload-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.75rem;
}
.upload-text {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
}
.upload-hint {
  font-size: 0.78rem;
  color: #9ca3af;
}
.hidden-input {
  display: none;
}
.btn-ganti-foto {
  width: 100%;
  margin-top: 0.75rem;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 0.6rem;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-ganti-foto:hover {
  background: #e5e7eb;
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
select,
textarea {
  padding: 0.7rem 1rem;
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
select:focus,
textarea:focus {
  outline: none;
  border-color: #2d5016;
}
input:disabled,
select:disabled,
textarea:disabled {
  background: #f9fafb;
  cursor: not-allowed;
}
textarea {
  resize: vertical;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.input-prefix-wrap {
  display: flex;
}
.prefix {
  background: #f3f4f6;
  border: 1.5px solid #d1d5db;
  border-right: none;
  border-radius: 10px 0 0 10px;
  padding: 0.7rem 0.75rem;
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 600;
}
.input-prefix-wrap input {
  border-radius: 0 10px 10px 0;
}

/* ALERTS */
.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}
.alert-success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

/* UPLOAD PROGRESS */
.upload-progress {
  margin-bottom: 1rem;
}
.progress-bar {
  background: #e5e7eb;
  border-radius: 999px;
  height: 6px;
  overflow: hidden;
  margin-bottom: 0.4rem;
}
.progress-fill {
  background: #2d5016;
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s;
}
.progress-text {
  font-size: 0.78rem;
  color: #6b7280;
}

/* ACTIONS */
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
  .form-grid {
    grid-template-columns: 1fr;
  }
  .field-row {
    grid-template-columns: 1fr;
  }
}
</style>
