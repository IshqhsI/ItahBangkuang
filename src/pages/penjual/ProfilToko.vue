<template>
  <LayoutPenjual :statusToko="statusToko" :tokoId="tokoId">
    <section class="kepala">
      <div class="wadah sempit">
        <h1 class="judul-halaman">Profil toko</h1>
        <p class="sub-halaman">
          {{ mode === 'edit' ? 'Ubah informasi toko, lalu simpan.' : 'Tampilan toko di mata pembeli.' }}
        </p>
      </div>
    </section>

    <div v-if="loadingData" class="memuat">
      <div class="spinner"></div>
      <p>Mengambil data toko…</p>
    </div>

    <div v-else class="wadah sempit isi">
      <!-- Status toko (hanya dibaca) -->
      <div class="status papan" :class="`status-${toko.status.toLowerCase()}`">
        <component :is="statusInfo.icon" :size="28" :stroke-width="2.25" />
        <div>
          <p class="status-judul">{{ statusInfo.teks }}</p>
          <p v-if="toko.alasan_tolak" class="status-alasan">Alasan dari admin: “{{ toko.alasan_tolak }}”</p>
        </div>
      </div>

      <div v-if="errorMsg" class="pesan pesan-galat" role="alert">
        <CircleAlert :size="20" :stroke-width="2.5" />
        <span>{{ errorMsg }}</span>
      </div>
      <div v-if="successMsg" class="pesan pesan-sukses" role="status">
        <CircleCheck :size="20" :stroke-width="2.5" />
        <span>{{ successMsg }}</span>
      </div>

      <!-- FOTO -->
      <section class="bagian papan" aria-labelledby="h-foto">
        <h2 id="h-foto" class="bagian-judul">Foto toko</h2>
        <div class="foto-baris">
          <div class="foto-bulat">
            <img v-if="previewUrl" :src="previewUrl" alt="Foto toko" />
            <Store v-else :size="40" :stroke-width="2" />
          </div>
          <div class="foto-teks">
            <p>Logo atau foto produk andalan bikin pembeli lebih percaya.</p>
            <button v-if="mode === 'edit'" type="button" class="tombol tombol-kecil" @click="triggerUpload">
              <ImagePlus :size="16" :stroke-width="2.5" />
              {{ previewUrl ? 'Ganti foto' : 'Pilih foto' }}
            </button>
            <input ref="fileInput" type="file" accept="image/*" class="sr-only" tabindex="-1" @change="onFileChange" />
          </div>
        </div>
      </section>

      <!-- INFO -->
      <section class="bagian papan" aria-labelledby="h-info">
        <h2 id="h-info" class="bagian-judul">Info toko</h2>

        <template v-if="mode === 'edit'">
          <div class="isian">
            <label for="nama">Nama toko</label>
            <input id="nama" v-model="form.nama_toko" type="text" maxlength="60" :disabled="loading" />
          </div>

          <div class="isian">
            <label for="wa">Nomor WhatsApp</label>
            <div class="awalan">
              <span class="awalan-teks" aria-hidden="true">+62</span>
              <input
                id="wa"
                v-model="form.nomor_wa"
                type="tel"
                inputmode="numeric"
                autocomplete="tel-national"
                aria-describedby="wa-bantuan"
                :disabled="loading"
                @input="rapikanWa"
              />
            </div>
            <span id="wa-bantuan" class="bantuan">Pembeli menghubungi Anda lewat nomor ini. Pesanan baru juga muncul di halaman Pesanan. Tulis tanpa 0 di depan.</span>
          </div>

          <div class="isian">
            <label for="alamat">Alamat</label>
            <input id="alamat" v-model="form.alamat" type="text" autocomplete="street-address" placeholder="Contoh: Jl. Pahlawan RT 03, dekat masjid" :disabled="loading" />
          </div>

          <fieldset class="isian layanan">
            <legend class="label">Cara layanan</legend>
            <label class="centang">
              <input v-model="form.layanan_pesan" type="checkbox" :disabled="loading" />
              <span>
                <strong>Terima pesanan online</strong>
                <small>Pembeli dapat memesan lewat aplikasi. Matikan bila toko hanya memajang produk dan pembeli datang langsung.</small>
              </span>
            </label>
            <label class="centang">
              <input v-model="form.layanan_antar" type="checkbox" :disabled="loading" />
              <span><strong>Bisa diantar</strong></span>
            </label>
            <label class="centang">
              <input v-model="form.layanan_ambil" type="checkbox" :disabled="loading" />
              <span><strong>Ambil di tempat</strong></span>
            </label>
          </fieldset>

          <div class="isian">
            <label for="jam">Jam buka <span class="opsional">(boleh dikosongkan)</span></label>
            <input id="jam" v-model="form.jam_buka" type="text" maxlength="120" placeholder="Contoh: Setiap hari 07.00–17.00" :disabled="loading" />
          </div>

          <div class="isian">
            <label for="peta">Tautan peta <span class="opsional">(boleh dikosongkan)</span></label>
            <input id="peta" v-model="form.tautan_peta" type="url" inputmode="url" placeholder="https://maps.app.goo.gl/…" aria-describedby="peta-bantuan" :disabled="loading" />
            <span id="peta-bantuan" class="bantuan">Buka Google Maps, tekan Bagikan, lalu salin tautannya.</span>
          </div>

          <div class="isian">
            <label for="deskripsi">Deskripsi singkat toko <span class="opsional">(boleh dikosongkan)</span></label>
            <textarea id="deskripsi" v-model="form.deskripsi" rows="4" maxlength="300" aria-describedby="desk-hitung" :disabled="loading"></textarea>
            <span id="desk-hitung" class="bantuan">{{ form.deskripsi.length }} dari 300 karakter</span>
          </div>
        </template>

        <dl v-else class="data">
          <div><dt>Nama toko</dt><dd>{{ form.nama_toko || '–' }}</dd></div>
          <div><dt>WhatsApp</dt><dd>{{ form.nomor_wa ? `+62${form.nomor_wa}` : '–' }}</dd></div>
          <div><dt>Alamat</dt><dd>{{ form.alamat || '–' }}</dd></div>
          <div><dt>Layanan</dt><dd>{{ ringkasLayanan }}</dd></div>
          <div><dt>Jam buka</dt><dd>{{ form.jam_buka || '–' }}</dd></div>
          <div v-if="form.tautan_peta"><dt>Peta</dt><dd><a :href="form.tautan_peta" target="_blank" rel="noopener">Buka di peta</a></dd></div>
          <div><dt>Cerita</dt><dd class="cerita">{{ form.deskripsi || 'Belum ada cerita.' }}</dd></div>
        </dl>
      </section>

      <!-- AKSI -->
      <div class="aksi">
        <template v-if="mode === 'view'">
          <RouterLink to="/toko/dashboard" class="tombol tombol-besar">Kembali</RouterLink>
          <button type="button" class="tombol tombol-merah tombol-besar aksi-utama" @click="mode = 'edit'">
            <Pencil :size="20" :stroke-width="2.5" />
            Ubah profil
          </button>
        </template>
        <template v-else>
          <button type="button" class="tombol tombol-besar" :disabled="loading" @click="cancelEdit">Batal</button>
          <button type="button" class="tombol tombol-merah tombol-besar aksi-utama" :disabled="loading || uploading" @click="handleSubmit">
            <span v-if="loading || uploading" class="spinner-sm"></span>
            {{ loading || uploading ? 'Menyimpan…' : 'Simpan' }}
          </button>
        </template>
      </div>
    </div>
  </LayoutPenjual>
</template>

<script setup>
import { ref, computed, onMounted, markRaw } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Store,
  ImagePlus,
  Pencil,
  CircleAlert,
  CircleCheck,
  Hourglass,
  CircleX,
  Ban,
} from 'lucide-vue-next';
import { siapkanFoto } from '@/lib/gambar';
import { supabase } from '@/lib/supabase';
import LayoutPenjual from '@/layouts/LayoutPenjual.vue';

const route = useRoute();
const router = useRouter();
const mode = ref('view');
const loadingData = ref(true);
const loading = ref(false);
const uploading = ref(false);
const errorMsg = ref('');
const successMsg = ref('');
const fileInput = ref(null);
const previewUrl = ref('');
const fotoFile = ref(null);
const tokoId = ref(null);
const statusToko = ref('');

// Data yang tidak boleh diubah penjual
const toko = ref({ status: '', alasan_tolak: '' });

// Data yang boleh diubah penjual
const form = ref({
  nama_toko: '',
  nomor_wa: '',
  alamat: '',
  deskripsi: '',
  foto_toko: '',
  layanan_pesan: true,
  layanan_antar: true,
  layanan_ambil: false,
  jam_buka: '',
  tautan_peta: '',
});

const ringkasLayanan = computed(() => {
  const f = form.value;
  const bagian = [f.layanan_pesan ? 'Terima pesanan online' : 'Hanya memajang produk (tanpa pesanan online)'];
  if (f.layanan_antar) bagian.push('bisa diantar');
  if (f.layanan_ambil) bagian.push('ambil di tempat');
  return bagian.join(', ');
});

let snapshot = null;

const INFO_STATUS = {
  AKTIF: { icon: markRaw(CircleCheck), teks: 'Toko Anda aktif dan bisa menerima pesanan.' },
  PENDING: { icon: markRaw(Hourglass), teks: 'Toko sedang diperiksa admin.' },
  DITOLAK: { icon: markRaw(CircleX), teks: 'Pendaftaran toko Anda belum disetujui.' },
  DIBLOKIR: { icon: markRaw(Ban), teks: 'Toko diblokir admin.' },
};
const statusInfo = computed(() => INFO_STATUS[toko.value.status] ?? INFO_STATUS.PENDING);

// Nomor WA: hanya angka, tanpa awalan 0 / 62
const rapikanWa = () => {
  form.value.nomor_wa = form.value.nomor_wa.replace(/\D/g, '').replace(/^(62|0)/, '');
};

const triggerUpload = () => fileInput.value?.click();

const onFileChange = async (e) => {
  const asli = e.target.files[0];
  if (!asli) return;
  if (asli.size > 10 * 1024 * 1024) {
    errorMsg.value = 'Foto terlalu besar. Pilih foto dengan ukuran di bawah 10 MB.';
    return;
  }
  const file = await siapkanFoto(asli, { maksSisi: 800 });
  if (file.size > 2 * 1024 * 1024) {
    errorMsg.value = 'Foto masih terlalu besar setelah dikecilkan. Pilih foto lain.';
    return;
  }
  if (previewUrl.value?.startsWith('blob:')) URL.revokeObjectURL(previewUrl.value);
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

  if (!form.value.nama_toko.trim()) {
    errorMsg.value = 'Lengkapi nama toko.';
    return;
  }
  if (!form.value.nomor_wa) {
    errorMsg.value = 'Lengkapi nomor WhatsApp.';
    return;
  }
  if (form.value.nomor_wa.length < 9 || form.value.nomor_wa.length > 13) {
    errorMsg.value = 'Nomor WA sepertinya belum lengkap. Tulis tanpa 0 di depan, contoh: 81234567890.';
    return;
  }
  if (!form.value.alamat.trim()) {
    errorMsg.value = 'Lengkapi alamat toko.';
    return;
  }
  if (!form.value.layanan_antar && !form.value.layanan_ambil) {
    errorMsg.value = 'Pilih minimal satu: bisa diantar atau ambil di tempat.';
    return;
  }
  if (form.value.tautan_peta.trim() && !/^https?:\/\//i.test(form.value.tautan_peta.trim())) {
    errorMsg.value = 'Tautan peta harus diawali https://. Salin dari tombol Bagikan di Google Maps.';
    return;
  }

  loading.value = true;

  let fotoUrl = previewUrl.value?.startsWith('blob:') ? null : previewUrl.value;

  if (fotoFile.value) {
    fotoUrl = await uploadFoto();
    if (!fotoUrl) {
      errorMsg.value = 'Fotonya belum terunggah. Periksa koneksi internet Anda, lalu coba lagi.';
      loading.value = false;
      return;
    }
  }

  // Hanya kolom yang boleh diubah penjual; status, alasan_tolak, user_id tidak ikut
  const { error } = await supabase
    .from('toko')
    .update({
      nama_toko: form.value.nama_toko.trim(),
      nomor_wa: form.value.nomor_wa,
      alamat: form.value.alamat.trim(),
      deskripsi: form.value.deskripsi.trim(),
      layanan_pesan: form.value.layanan_pesan,
      layanan_antar: form.value.layanan_antar,
      layanan_ambil: form.value.layanan_ambil,
      jam_buka: form.value.jam_buka.trim() || null,
      tautan_peta: form.value.tautan_peta.trim() || null,
      ...(fotoUrl ? { foto_toko: fotoUrl } : {}),
    })
    .eq('id', tokoId.value);

  if (error) {
    errorMsg.value = 'Perubahan belum tersimpan. Periksa koneksi internet Anda, lalu coba lagi.';
    loading.value = false;
    return;
  }

  successMsg.value = 'Profil toko tersimpan.';
  fotoFile.value = null;
  mode.value = 'view';
  await muatData();
  loading.value = false;
};

const cancelEdit = () => {
  form.value = { ...snapshot };
  previewUrl.value = snapshot.foto_toko ?? '';
  fotoFile.value = null;
  errorMsg.value = '';
  mode.value = 'view';
};

const muatData = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    router.replace({ path: '/login', query: { redirect: route.fullPath } });
    return;
  }

  const { data } = await supabase
    .from('toko')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (!data) {
    router.push('/');
    return;
  }

  statusToko.value = data.status;
  tokoId.value = data.id;
  toko.value = { status: data.status ?? '', alasan_tolak: data.alasan_tolak ?? '' };
  form.value = {
    nama_toko: data.nama_toko ?? '',
    nomor_wa: (data.nomor_wa ?? '').replace(/^(\+62|62|0)/, ''),
    alamat: data.alamat ?? '',
    deskripsi: data.deskripsi ?? '',
    foto_toko: data.foto_toko ?? '',
    layanan_pesan: data.layanan_pesan !== false,
    layanan_antar: data.layanan_antar !== false,
    layanan_ambil: data.layanan_ambil === true,
    jam_buka: data.jam_buka ?? '',
    tautan_peta: data.tautan_peta ?? '',
  };
  snapshot = { ...form.value };
  previewUrl.value = data.foto_toko ?? '';
};

onMounted(async () => {
  await muatData();
  loadingData.value = false;
});
</script>

<style scoped>
.layanan {
  border: 0;
  padding: 0;
}
.centang {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  min-height: 48px;
  padding: 0.7rem 0.9rem;
  margin-top: 0.5rem;
  background: #fff;
  border: 1.5px solid var(--garis-lembut);
  border-radius: 16px;
  cursor: pointer;
}
.centang input {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-top: 2px;
  accent-color: var(--sungai-sedang);
}
.centang span {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.centang small {
  color: var(--ink-2);
  font-size: 0.86rem;
  line-height: 1.45;
}
.sempit {
  max-width: 720px;
}
.kepala {
  background: var(--sage);
  color: var(--sungai-dalam);
  border-radius: 0 0 32px 32px;
  padding: 1.5rem 0 1.75rem;
}
.kepala .judul-halaman {
  color: var(--sungai-dalam);
}
.kepala .sub-halaman {
  color: var(--ink-2);
}
.isi {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  padding-top: 1.5rem;
  padding-bottom: 2rem;
}

.status {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.9rem 1.1rem;
}
.status-aktif {
  --papan-bg: var(--hijau-muda);
}
.status-pending {
  --papan-bg: var(--kuning-muda);
}
.status-ditolak {
  --papan-bg: var(--merah-muda);
}
.status-diblokir {
  --papan-bg: #e8e8e8;
}
.status-judul {
  font-weight: 700;
}
.status-alasan {
  margin-top: 0.15rem;
  color: var(--tinta-2);
}

.bagian {
  padding: 1.25rem 1.2rem 1.4rem;
}
.bagian-judul {
  font-family: var(--font-papan);
  font-weight: 600;
  font-size: 1.15rem;
  margin-bottom: 1rem;
}
.opsional {
  font-weight: 400;
  color: var(--tinta-3);
}

.foto-baris {
  display: flex;
  align-items: center;
  gap: 1.1rem;
}
.foto-bulat {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 96px;
  height: 96px;
  background: var(--kuning);
  border: var(--tebal) solid var(--garis);
  border-radius: 50%;
  overflow: hidden;
}
.foto-bulat img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.foto-teks {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.6rem;
  color: var(--tinta-2);
}

.awalan {
  display: flex;
  align-items: stretch;
}
.awalan-teks {
  display: grid;
  place-items: center;
  padding: 0 0.8rem;
  background: var(--kuning);
  border: 1.5px solid var(--garis);
  border-right: 0;
  border-radius: var(--sudut-kecil) 0 0 var(--sudut-kecil);
  font-weight: 700;
}
.awalan input {
  border-radius: 0 var(--sudut-kecil) var(--sudut-kecil) 0 !important;
}

.data > div {
  display: grid;
  grid-template-columns: 8rem 1fr;
  gap: 0.75rem;
  padding: 0.7rem 0;
  border-bottom: 1px solid var(--garis-lembut);
}
.data > div:last-child {
  border-bottom: 0;
}
.data dt {
  color: var(--tinta-3);
}
.data dd {
  font-weight: 700;
  overflow-wrap: anywhere;
}
.data dd.cerita {
  font-weight: 400;
  white-space: pre-line;
}
@media (max-width: 520px) {
  .data > div {
    grid-template-columns: 1fr;
    gap: 0.1rem;
  }
}

.aksi {
  display: flex;
  gap: 0.6rem;
}
.aksi-utama {
  flex: 1;
}
</style>
