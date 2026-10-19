<template>
  <LayoutAuth>
    <div class="papan formulir">
      <h1 class="judul-halaman">{{ step === 1 ? 'Buat akun' : 'Info toko' }}</h1>
      <p v-if="step === 1" class="sub-halaman">
        Sudah punya akun?
        <RouterLink :to="{ path: '/login', query: route.query }">Masuk di sini</RouterLink>
      </p>
      <p v-else class="sub-halaman">Informasi ini akan ditampilkan kepada pembeli.</p>

      <!-- LANGKAH (khusus penjual) -->
      <ol v-if="form.role === 'penjual'" class="langkah" aria-label="Langkah pendaftaran">
        <li :class="{ aktif: step === 1, selesai: step > 1 }">
          <span class="langkah-no">
            <Check v-if="step > 1" :size="16" :stroke-width="3" />
            <template v-else>1</template>
          </span>
          Akun
        </li>
        <li class="langkah-garis" aria-hidden="true"></li>
        <li :class="{ aktif: step === 2 }">
          <span class="langkah-no">2</span>
          Toko
        </li>
      </ol>

      <form class="isi-form" novalidate @submit.prevent="step === 1 ? nextStep() : handleSubmit()">
        <!-- LANGKAH 1: AKUN -->
        <template v-if="step === 1">
          <fieldset class="peran">
            <legend class="label">Daftar sebagai</legend>
            <div class="peran-pilihan">
              <label class="peran-kartu" :class="{ dipilih: form.role === 'pembeli' }">
                <input v-model="form.role" type="radio" value="pembeli" class="sr-only" />
                <ShoppingBasket :size="28" :stroke-width="2.25" />
                <span class="peran-nama">Belanja</span>
                <span class="peran-ket">Cari dan pesan produk lokal</span>
              </label>
              <label class="peran-kartu" :class="{ dipilih: form.role === 'penjual' }">
                <input v-model="form.role" type="radio" value="penjual" class="sr-only" />
                <Store :size="28" :stroke-width="2.25" />
                <span class="peran-nama">Jualan</span>
                <span class="peran-ket">Buka toko dan terima pesanan</span>
              </label>
            </div>
          </fieldset>

          <div class="isian">
            <label for="nama">Nama lengkap</label>
            <input id="nama" v-model="form.nama" type="text" autocomplete="name" :disabled="loading" />
          </div>

          <div class="isian">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              inputmode="email"
              autocomplete="email"
              placeholder="nama@email.com"
              :disabled="loading"
            />
          </div>

          <div class="isian">
            <label for="sandi">Kata sandi</label>
            <div class="sandi">
              <input
                id="sandi"
                v-model="form.password"
                :type="showPass ? 'text' : 'password'"
                autocomplete="new-password"
                aria-describedby="sandi-bantuan"
                :disabled="loading"
              />
              <button
                type="button"
                class="sandi-lihat"
                :aria-label="showPass ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
                :aria-pressed="showPass"
                @click="showPass = !showPass"
              >
                <EyeOff v-if="showPass" :size="22" :stroke-width="2.25" />
                <Eye v-else :size="22" :stroke-width="2.25" />
              </button>
            </div>
            <span id="sandi-bantuan" class="bantuan">Minimal 8 karakter.</span>
          </div>
        </template>

        <!-- LANGKAH 2: TOKO -->
        <template v-else>
          <div class="pesan pesan-info">
            <ShieldCheck :size="20" :stroke-width="2.5" />
            <span>Toko langsung tampil setelah didaftarkan. Admin memverifikasinya kemudian untuk memberi lencana Terverifikasi.</span>
          </div>

          <div class="isian">
            <label for="nama-toko">Nama toko</label>
            <input
              id="nama-toko"
              v-model="form.nama_toko"
              type="text"
              placeholder="Contoh: Kue Bunda Sari"
              :disabled="loading"
            />
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
                placeholder="81234567890"
                aria-describedby="wa-bantuan"
                :disabled="loading"
                @input="rapikanWa"
              />
            </div>
            <span id="wa-bantuan" class="bantuan">Pembeli menghubungi Anda lewat nomor ini.</span>
          </div>

          <div class="isian">
            <label for="alamat">Alamat toko</label>
            <input
              id="alamat"
              v-model="form.alamat"
              type="text"
              autocomplete="street-address"
              placeholder="Contoh: Jl. Pahlawan RT 03, dekat masjid"
              :disabled="loading"
            />
          </div>

          <LayananToko :data="form" :disabled="loading" />

          <div class="isian">
            <label for="deskripsi">Deskripsi singkat toko <span class="opsional">(boleh dikosongkan)</span></label>
            <textarea
              id="deskripsi"
              v-model="form.deskripsi"
              rows="3"
              placeholder="Misalnya: Kue basah buatan rumah, pesan H-1 untuk acara."
              :disabled="loading"
            ></textarea>
          </div>
        </template>

        <div v-if="errorMsg" class="pesan pesan-galat" role="alert">
          <CircleAlert :size="20" :stroke-width="2.5" />
          <span>{{ errorMsg }}</span>
        </div>

        <div class="aksi">
          <button
            v-if="step === 2"
            type="button"
            class="tombol tombol-besar"
            :disabled="loading"
            @click="step = 1"
          >
            <ArrowLeft :size="20" :stroke-width="2.5" />
            Kembali
          </button>
          <button type="submit" class="tombol tombol-merah tombol-besar aksi-utama" :disabled="loading">
            <span v-if="loading" class="spinner-sm"></span>
            <template v-if="loading">Mendaftarkan…</template>
            <template v-else-if="step === 1 && form.role === 'penjual'">
              Lanjut isi info toko
              <ArrowRight :size="20" :stroke-width="2.5" />
            </template>
            <template v-else-if="step === 1">Buat akun</template>
            <template v-else>Daftarkan toko</template>
          </button>
        </div>
      </form>
    </div>
  </LayoutAuth>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ShoppingBasket,
  Store,
  Eye,
  EyeOff,
  Check,
  CircleAlert,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
} from 'lucide-vue-next';
import { supabase } from '@/lib/supabase';
import { useToastStore } from '@/stores/toast';
import LayoutAuth from '@/layouts/LayoutAuth.vue';
import LayananToko, { periksaLayanan, layananAwal, kolomLayanan } from '@/components/LayananToko.vue';
import { tujuanAman } from '@/lib/utils';

const route = useRoute();
const router = useRouter();
const toast = useToastStore();

const step = ref(1);
const loading = ref(false);
const showPass = ref(false);
const errorMsg = ref('');

const form = ref({
  nama: '',
  email: '',
  password: '',
  role: route.query.peran === 'penjual' ? 'penjual' : 'pembeli',
  nama_toko: '',
  nomor_wa: '',
  alamat: '',
  deskripsi: '',
  ...layananAwal(),
});

// Nomor WA: hanya angka, tanpa awalan 0 / 62
const rapikanWa = () => {
  form.value.nomor_wa = form.value.nomor_wa.replace(/\D/g, '').replace(/^(62|0)/, '');
};

const nextStep = () => {
  errorMsg.value = '';
  if (!form.value.nama.trim() || !form.value.email.trim() || !form.value.password) {
    errorMsg.value = 'Nama, email, dan kata sandi wajib diisi.';
    return;
  }
  if (!/^\S+@\S+\.\S+$/.test(form.value.email.trim())) {
    errorMsg.value = 'Format email belum benar. Contoh: nama@email.com';
    return;
  }
  if (form.value.password.length < 8) {
    errorMsg.value = 'Kata sandi minimal 8 karakter.';
    return;
  }
  if (form.value.role === 'penjual') {
    step.value = 2;
  } else {
    handleSubmit();
  }
};

const handleSubmit = async () => {
  errorMsg.value = '';

  if (form.value.role === 'penjual') {
    if (!form.value.nama_toko.trim() || !form.value.nomor_wa || !form.value.alamat.trim()) {
      errorMsg.value = 'Nama toko, nomor WA, dan alamat wajib diisi.';
      return;
    }
    if (form.value.nomor_wa.length < 9 || form.value.nomor_wa.length > 13) {
      errorMsg.value = 'Nomor WA sepertinya belum lengkap. Tulis tanpa 0 di depan, contoh: 81234567890.';
      return;
    }
    const galatLayanan = periksaLayanan(form.value);
    if (galatLayanan) {
      errorMsg.value = galatLayanan;
      return;
    }
  }

  loading.value = true;

  const { data, error } = await supabase.auth.signUp({
    email: form.value.email.trim(),
    password: form.value.password,
    options: {
      data: {
        role: form.value.role,
        nama_lengkap: form.value.nama.trim(),
      },
    },
  });

  if (error) {
    errorMsg.value =
      error.message === 'User already registered'
        ? 'Email ini sudah terdaftar. Coba masuk, atau pakai email lain.'
        : 'Pendaftaran belum berhasil. Periksa koneksi internet Anda, lalu coba lagi.';
    loading.value = false;
    return;
  }

  await supabase
    .from('profiles')
    .update({ nama_lengkap: form.value.nama.trim() })
    .eq('id', data.user.id);

  if (form.value.role === 'penjual') {
    const { error: errToko } = await supabase.from('toko').insert({
      user_id: data.user.id,
      nama_toko: form.value.nama_toko.trim(),
      nomor_wa: form.value.nomor_wa,
      alamat: form.value.alamat.trim(),
      deskripsi: form.value.deskripsi.trim(),
      ...kolomLayanan(form.value),
      status: 'PENDING',
    });

    if (errToko) {
      const waKembar = errToko.code === '23505' && String(errToko.message).includes('nomor_wa');
      toast.warning(
        waKembar
          ? 'Akun berhasil dibuat, tetapi nomor WhatsApp itu sudah dipakai toko lain. Lengkapi melalui menu Buka Toko dengan nomor Anda sendiri.'
          : 'Akun berhasil dibuat, tetapi info toko belum tersimpan. Lengkapi melalui menu Buka Toko.',
      );
      router.push('/buka-toko');
    } else {
      toast.success('Toko berhasil didaftarkan dan sudah tampil.');
      router.push('/toko/dashboard');
    }
  } else {
    toast.success('Akun berhasil dibuat.');
    router.push(tujuanAman(route.query.redirect) ?? '/');
  }

  loading.value = false;
};
</script>

<style scoped>
.formulir {
  padding: 1.75rem 1.4rem;
}
@media (min-width: 480px) {
  .formulir {
    padding: 2.25rem 2rem;
  }
}

.langkah {
  list-style: none;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 1.25rem;
  font-weight: 700;
  color: var(--tinta-3);
}
.langkah li {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}
.langkah-no {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 2px solid currentColor;
  border-radius: 50%;
  font-size: 0.9rem;
}
.langkah li.aktif {
  color: var(--tinta);
}
.langkah li.aktif .langkah-no {
  background: var(--merah);
  border-color: var(--tinta);
  color: #fff;
}
.langkah li.selesai {
  color: var(--hijau);
}
.langkah li.selesai .langkah-no {
  background: var(--hijau);
  border-color: var(--tinta);
  color: #fff;
}
.langkah-garis {
  flex: 1;
  height: 2px;
  background: var(--garis-lembut);
}

.isi-form {
  display: flex;
  flex-direction: column;
  margin-top: 1.5rem;
}
.isi-form > .pesan {
  margin-bottom: 1.1rem;
}
.isi-form > .pesan-galat {
  margin: 1.25rem 0 0;
}

.peran {
  border: 0;
  margin-bottom: 1.25rem;
}
.peran legend {
  margin-bottom: 0.5rem;
}
.peran-pilihan {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.7rem;
}
.peran-kartu {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.9rem 0.9rem 1rem;
  background: var(--papan);
  border: var(--tebal) solid var(--garis);
  border-radius: var(--sudut);
  cursor: pointer;
  transition: background-color 0.15s ease;
}
.peran-kartu:hover {
  background: var(--kuning-muda);
}
.peran-kartu.dipilih {
  background: var(--kuning);
  box-shadow:
    0 0 0 4px rgba(63, 127, 108, 0.22);
}
.peran-kartu:has(input:focus-visible) {
  outline: 3px solid var(--biru);
  outline-offset: 3px;
}
.peran-nama {
  font-family: var(--font-papan);
  font-weight: 600;
  font-size: 1.1rem;
  margin-top: 0.2rem;
}
.peran-ket {
  font-size: 0.88rem;
  color: var(--tinta-2);
  line-height: 1.35;
}

.opsional {
  font-weight: 400;
  color: var(--tinta-3);
}

.sandi {
  position: relative;
}
.sandi input {
  padding-right: 3.25rem !important;
}
.sandi-lihat {
  position: absolute;
  right: 0.25rem;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  background: none;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
  color: var(--tinta-2);
}
.sandi-lihat:hover {
  background: var(--dinding);
  color: var(--tinta);
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

.aksi {
  display: flex;
  gap: 0.6rem;
  margin-top: 1.5rem;
}
.aksi-utama {
  flex: 1;
}
</style>
