<template>
  <LayoutPenjual :statusToko="statusToko" :tokoId="tokoId">
    <section class="kepala">
      <div class="wadah sempit">
        <RouterLink to="/toko/produk" class="kembali">
          <ArrowLeft :size="18" :stroke-width="2.5" />
          Kembali ke produk
        </RouterLink>
        <h1 class="judul-halaman">{{ isEdit ? 'Ubah produk' : 'Pajang produk baru' }}</h1>
      </div>
    </section>

    <div v-if="loadingData" class="memuat">
      <div class="spinner"></div>
      <p>Mengambil data produk…</p>
    </div>

    <div v-else class="wadah sempit isi">
      <form class="form" novalidate @submit.prevent="handleSubmit">
        <!-- FOTO -->
        <section class="bagian papan" aria-labelledby="h-foto">
          <h2 id="h-foto" class="bagian-judul">Foto produk</h2>
          <p class="bagian-ket">Foto terang dan dekat bikin produk lebih cepat laku. Maksimal 2 MB.</p>

          <div
            class="unggah"
            :class="{ ada: previewUrl, seret: isDragging }"
            role="button"
            tabindex="0"
            :aria-label="previewUrl ? 'Ganti foto produk' : 'Pilih foto produk'"
            @click="triggerUpload"
            @keydown.enter.prevent="triggerUpload"
            @keydown.space.prevent="triggerUpload"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop.prevent="onDrop"
          >
            <img v-if="previewUrl" :src="previewUrl" class="unggah-foto" alt="Pratinjau foto produk" />
            <div v-else class="unggah-kosong">
              <ImagePlus :size="40" :stroke-width="2" />
              <p class="unggah-judul">Pilih atau seret foto ke sini</p>
              <p class="unggah-ket">JPG atau PNG</p>
            </div>
            <input ref="fileInput" type="file" accept="image/*" class="sr-only" tabindex="-1" @change="onFileChange" />
          </div>

          <button v-if="previewUrl" type="button" class="tombol tombol-kecil ganti" @click="triggerUpload">
            <RefreshCw :size="16" :stroke-width="2.5" />
            Ganti foto
          </button>
        </section>

        <!-- INFO -->
        <section class="bagian papan" aria-labelledby="h-info">
          <h2 id="h-info" class="bagian-judul">Tentang produk</h2>

          <div class="isian">
            <label for="nama">Nama produk</label>
            <input
              id="nama"
              v-model="form.nama_produk"
              type="text"
              maxlength="100"
              placeholder="Contoh: Kue Lapis Pandan isi 10"
              :disabled="loading"
              aria-describedby="nama-hitung"
            />
            <span id="nama-hitung" class="bantuan">{{ form.nama_produk.length }} dari 100 karakter</span>
          </div>

          <div class="isian">
            <label for="kategori">Kategori</label>
            <select id="kategori" v-model="form.kategori" :disabled="loading">
              <option value="" disabled>Pilih kategori</option>
              <option v-for="k in KATEGORI" :key="k.slug" :value="k.slug">{{ k.label }}</option>
            </select>
          </div>

          <div class="isian">
            <label for="deskripsi">Deskripsi <span class="opsional">(boleh dikosongkan)</span></label>
            <textarea
              id="deskripsi"
              v-model="form.deskripsi"
              rows="5"
              maxlength="500"
              placeholder="Bahan, rasa, cara simpan, minimal pesan…"
              :disabled="loading"
              aria-describedby="desk-hitung"
            ></textarea>
            <span id="desk-hitung" class="bantuan">{{ form.deskripsi.length }} dari 500 karakter</span>
          </div>

          <div v-if="isEdit" class="isian">
            <label for="status">Tampil di toko?</label>
            <select id="status" v-model="form.status" :disabled="loading">
              <option value="AKTIF">Tampil</option>
              <option value="HABIS">Tandai habis</option>
              <option value="DISEMBUNYIKAN">Sembunyikan</option>
            </select>
          </div>
        </section>

        <!-- HARGA & STOK -->
        <section class="bagian papan" aria-labelledby="h-harga">
          <div class="bagian-kepala">
            <h2 id="h-harga" class="bagian-judul">Harga &amp; stok</h2>
            <button type="button" class="tombol tombol-kecil" @click="toggleVarian">
              <Layers v-if="form.varian.length === 0" :size="16" :stroke-width="2.5" />
              <X v-else :size="16" :stroke-width="2.5" />
              {{ form.varian.length > 0 ? 'Tanpa varian' : 'Pakai varian' }}
            </button>
          </div>

          <div v-if="form.varian.length === 0" class="baris-isian">
            <div class="isian">
              <label for="harga">Harga (Rp)</label>
              <input id="harga" v-model.number="form.harga" type="number" inputmode="numeric" min="0" placeholder="15000" :disabled="loading" />
            </div>
            <div class="isian">
              <label for="stok">Stok</label>
              <input id="stok" v-model.number="form.stok" type="number" inputmode="numeric" min="0" placeholder="10" :disabled="loading" />
            </div>
          </div>

          <div v-else>
            <p class="bagian-ket">Pakai varian kalau ukuran atau rasanya beda-beda. Tiap varian punya harga dan stok sendiri.</p>

            <div v-for="(v, index) in form.varian" :key="index" class="varian">
              <div class="varian-kepala">
                <span class="varian-no">Varian {{ index + 1 }}</span>
                <button type="button" class="varian-hapus" :aria-label="`Hapus varian ${index + 1}`" @click="hapusVarian(index)">
                  <Trash2 :size="18" :stroke-width="2.5" />
                </button>
              </div>
              <div class="isian">
                <label :for="`v-nama-${index}`">Nama varian</label>
                <input :id="`v-nama-${index}`" v-model="v.nama" type="text" placeholder="Contoh: Keju, 100 gram, atau L" />
              </div>
              <div class="baris-isian">
                <div class="isian">
                  <label :for="`v-harga-${index}`">Harga (Rp)</label>
                  <input :id="`v-harga-${index}`" v-model.number="v.harga" type="number" inputmode="numeric" min="0" />
                </div>
                <div class="isian">
                  <label :for="`v-stok-${index}`">Stok</label>
                  <input :id="`v-stok-${index}`" v-model.number="v.stok" type="number" inputmode="numeric" min="0" />
                </div>
              </div>
            </div>

            <button type="button" class="tombol tambah-varian" @click="tambahBarisVarian">
              <Plus :size="18" :stroke-width="2.75" />
              Tambah varian
            </button>
          </div>
        </section>

        <!-- AKSI -->
        <div v-if="uploading" class="unggah-progres" role="progressbar" :aria-valuenow="uploadProgress" aria-valuemin="0" aria-valuemax="100">
          <div class="progres-bar"><div class="progres-isi" :style="{ transform: `scaleX(${uploadProgress / 100})` }"></div></div>
          <p>Mengunggah foto… {{ uploadProgress }}%</p>
        </div>

        <div v-if="errorMsg" class="pesan pesan-galat" role="alert">
          <CircleAlert :size="20" :stroke-width="2.5" />
          <span>{{ errorMsg }}</span>
        </div>
        <div v-if="successMsg" class="pesan pesan-sukses" role="status">
          <CircleCheck :size="20" :stroke-width="2.5" />
          <span>{{ successMsg }}</span>
        </div>

        <div class="aksi">
          <RouterLink to="/toko/produk" class="tombol tombol-besar">Batal</RouterLink>
          <button type="submit" class="tombol tombol-merah tombol-besar aksi-utama" :disabled="loading || uploading">
            <span v-if="loading || uploading" class="spinner-sm"></span>
            {{ loading || uploading ? 'Menyimpan…' : isEdit ? 'Simpan perubahan' : 'Pajang produk' }}
          </button>
        </div>
      </form>
    </div>

    <dialog ref="dialogVarian" class="dialog">
      <div class="dialog-isi">
        <h2 class="huruf-papan">Hapus semua varian?</h2>
        <p>Produk ini akan kembali jadi satu harga dan satu stok. Harga diambil dari varian termurah, stok dari jumlah semua varian.</p>
        <div class="dialog-aksi">
          <button type="button" class="tombol" @click="dialogVarian.close()">Batal</button>
          <button type="button" class="tombol tombol-merah" @click="hapusSemuaVarian">Hapus varian</button>
        </div>
      </div>
    </dialog>
  </LayoutPenjual>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowLeft,
  ImagePlus,
  RefreshCw,
  Plus,
  Trash2,
  X,
  CircleAlert,
  CircleCheck,
  Layers,
} from 'lucide-vue-next';
import { supabase } from '@/lib/supabase';
import LayoutPenjual from '@/layouts/LayoutPenjual.vue';
import { KATEGORI } from '@/lib/kategori';

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
const dialogVarian = ref(null);
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
  varian: [],
});

const toggleVarian = () => {
  if (form.value.varian.length === 0) {
    form.value.varian.push({
      nama: '',
      harga: form.value.harga || 0,
      stok: form.value.stok || 0,
    });
  } else {
    dialogVarian.value?.showModal();
  }
};

const hapusSemuaVarian = () => {
  // Harga & stok produk diisi dari varian yang ada, supaya tidak mulai dari kosong
  const v = form.value.varian;
  if (v.length) {
    form.value.harga = Math.min(...v.map((x) => Number(x.harga) || 0)) || '';
    form.value.stok = v.reduce((a, x) => a + (Number(x.stok) || 0), 0);
  }
  form.value.varian = [];
  dialogVarian.value?.close();
};

const tambahBarisVarian = () => {
  form.value.varian.push({
    nama: '',
    harga: form.value.harga || 0,
    stok: 1,
  });
};

const hapusVarian = (index) => {
  form.value.varian.splice(index, 1);
};

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
    errorMsg.value = 'Fotonya terlalu besar. Pilih foto yang ukurannya di bawah 2 MB.';
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

  if (!isEdit.value && !fotoFile.value) {
    errorMsg.value = 'Pasang foto produk dulu.';
    return;
  }

  if (!form.value.nama_produk.trim()) {
    errorMsg.value = 'Isi nama produknya dulu.';
    return;
  }

  if (!form.value.kategori) {
    errorMsg.value = 'Pilih kategori produknya dulu.';
    return;
  }

  const pakaiVarian = form.value.varian.length > 0;

  if (pakaiVarian) {
    // Harga & stok produk disembunyikan saat pakai varian, jadi yang dicek tiap varian
    const namaList = form.value.varian.map((v) => (v.nama || '').trim());
    if (namaList.some((n) => !n)) {
      errorMsg.value = 'Setiap varian perlu nama, misalnya “Keju” atau “Besar”.';
      return;
    }
    if (new Set(namaList.map((n) => n.toLowerCase())).size !== namaList.length) {
      errorMsg.value = 'Ada dua varian yang namanya sama. Beri nama yang berbeda.';
      return;
    }
    if (form.value.varian.some((v) => !v.harga || v.harga < 100)) {
      errorMsg.value = 'Harga setiap varian minimal Rp 100.';
      return;
    }
    if (form.value.varian.some((v) => v.stok === '' || v.stok == null || v.stok < 0)) {
      errorMsg.value = 'Isi stok setiap varian. Angkanya tidak boleh minus.';
      return;
    }
  } else {
    if (!form.value.harga || form.value.harga < 100) {
      errorMsg.value = 'Harga minimal Rp 100.';
      return;
    }
    if (form.value.stok === '' || form.value.stok === null || form.value.stok < 0) {
      errorMsg.value = 'Isi stoknya. Angkanya tidak boleh minus.';
      return;
    }
  }

  // Pakai varian: harga produk = harga varian termurah, stok = total stok varian,
  // supaya kolom harga/stok di tabel produk tetap sinkron (urutan, filter, dll)
  const varianBersih = form.value.varian.map((v) => ({
    ...v,
    nama: v.nama.trim(),
    harga: Number(v.harga),
    stok: Number(v.stok),
  }));
  const hargaProduk = pakaiVarian
    ? Math.min(...varianBersih.map((v) => v.harga))
    : form.value.harga;
  const stokProduk = pakaiVarian
    ? varianBersih.reduce((sum, v) => sum + v.stok, 0)
    : form.value.stok;

  loading.value = true;

  let fotoUrl = previewUrl.value; // pakai url lama kalau edit & tidak ganti foto

  if (fotoFile.value) {
    fotoUrl = await uploadFoto();
    if (!fotoUrl) {
      errorMsg.value = 'Fotonya belum terunggah. Cek internetmu, lalu coba lagi.';
      loading.value = false;
      return;
    }
  }

  const payload = {
    nama_produk: form.value.nama_produk.trim(),
    kategori: form.value.kategori,
    deskripsi: form.value.deskripsi,
    harga: hargaProduk,
    stok: stokProduk,
    foto_url: fotoUrl,
    varian: varianBersih,
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
      errorMsg.value = 'Perubahan belum tersimpan. Cek internetmu, lalu coba lagi.';
      loading.value = false;
      return;
    }
    successMsg.value = 'Perubahan tersimpan.';
    setTimeout(() => router.push('/toko/produk'), 750);
  } else {
    const { error } = await supabase.from('produk').insert(payload);

    if (error) {
      errorMsg.value = 'Produk belum tersimpan. Cek internetmu, lalu coba lagi.';
      loading.value = false;
      return;
    }
    successMsg.value = 'Produk sudah dipajang.';
    setTimeout(() => router.push('/toko/produk'), 1000);
  }

  loading.value = false;
};

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    router.replace({ path: '/login', query: { redirect: route.fullPath } });
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
      varian: p.varian || [],
    };
    previewUrl.value = p.foto_url;
    loadingData.value = false;
  } else {
    loadingData.value = false;
  }
});
</script>

<style scoped>
.sempit {
  max-width: 760px;
}
.kepala {
  background: var(--sage);
  color: var(--sungai-dalam);
  border-radius: 0 0 32px 32px;
  padding: 1rem 0 1.5rem;
}
.kepala .judul-halaman {
  color: var(--sungai-dalam);
}
.kembali {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 40px;
  color: var(--sungai-dalam);
  font-weight: 700;
  text-decoration: none;
}
.kembali:hover {
  text-decoration: underline;
}
.isi {
  padding-top: 1.5rem;
  padding-bottom: 2rem;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}
.bagian {
  padding: 1.25rem 1.2rem 1.4rem;
}
.bagian-judul {
  font-family: var(--font-papan);
  font-weight: 600;
  font-size: 1.15rem;
}
.bagian-ket {
  margin: 0.3rem 0 1rem;
  color: var(--tinta-2);
}
.bagian-kepala {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}
.bagian > .isian:first-of-type {
  margin-top: 1rem;
}
.opsional {
  font-weight: 400;
  color: var(--tinta-3);
}

.unggah {
  display: grid;
  place-items: center;
  min-height: 220px;
  background: var(--dinding);
  border: var(--tebal) dashed var(--garis);
  border-radius: var(--sudut);
  cursor: pointer;
  overflow: hidden;
  transition: background-color 0.15s ease;
}
.unggah:hover,
.unggah.seret {
  background: var(--kuning-muda);
  border-color: var(--tinta);
}
.unggah.ada {
  border-style: solid;
  border-color: var(--tinta);
  background: var(--papan);
}
.unggah-foto {
  width: 100%;
  max-height: 380px;
  object-fit: contain;
}
.unggah-kosong {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 1.5rem;
  text-align: center;
}
.unggah-judul {
  font-weight: 700;
}
.unggah-ket {
  font-size: 0.9rem;
  color: var(--tinta-3);
}
.ganti {
  margin-top: 0.75rem;
}

.varian {
  margin-top: 0.9rem;
  padding: 0.9rem 1rem 1.1rem;
  background: var(--dinding);
  border: 1.5px solid var(--garis);
  border-radius: var(--sudut);
}
.varian-kepala {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.6rem;
}
.varian-no {
  font-weight: 700;
}
.varian-hapus {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  background: none;
  border: 0;
  border-radius: 6px;
  color: var(--merah-tua);
  cursor: pointer;
}
.varian-hapus:hover {
  background: var(--merah-muda);
}
.varian .baris-isian {
  margin-top: 1rem;
}
.tambah-varian {
  margin-top: 0.9rem;
  border-style: dashed;
}

.unggah-progres p {
  margin-top: 0.4rem;
  font-size: 0.9rem;
  color: var(--tinta-2);
}
.progres-bar {
  height: 10px;
  background: var(--garis-lembut);
  border: 1.5px solid var(--garis);
  border-radius: 999px;
  overflow: hidden;
}
.progres-isi {
  width: 100%;
  height: 100%;
  background: var(--hijau);
  transform-origin: left;
  transition: transform 0.3s ease-out;
}

.aksi {
  display: flex;
  gap: 0.6rem;
}
.aksi-utama {
  flex: 1;
}

.dialog {
  margin: auto;
  width: min(440px, calc(100vw - 2rem));
  padding: 0;
  background: var(--papan);
  color: var(--tinta);
  border: 1.5px solid var(--garis);
  border-radius: 10px;
}
.dialog::backdrop {
  background: rgba(20, 20, 20, 0.55);
}
.dialog-isi {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  padding: 1.5rem;
}
.dialog-isi h2 {
  font-size: 1.25rem;
}
.dialog-isi p {
  color: var(--tinta-2);
}
.dialog-aksi {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.6rem;
}
</style>
