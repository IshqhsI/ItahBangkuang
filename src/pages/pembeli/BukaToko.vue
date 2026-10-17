<template>
  <LayoutAuth>
    <div v-if="loadingPage" class="memuat">
      <div class="spinner"></div>
    </div>

    <div v-else-if="!success" class="papan formulir">
      <h1 class="judul-halaman">Buka tokomu</h1>
      <p class="sub-halaman">Gratis. Tokomu diperiksa admin dulu sebelum tampil.</p>

      <p class="pesan pesan-info catatan">
        <ShieldCheck :size="20" :stroke-width="2.5" />
        <span>Kamu tetap bisa belanja seperti biasa setelah punya toko.</span>
      </p>

      <form class="isi-form" novalidate @submit.prevent="handleSubmit">
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
          <span id="wa-bantuan" class="bantuan">Pesanan baru akan dikabarkan ke nomor ini. Tulis tanpa 0 di depan.</span>
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

        <div class="isian">
          <label for="deskripsi">Cerita singkat tokomu <span class="opsional">(boleh dikosongkan)</span></label>
          <textarea
            id="deskripsi"
            v-model="form.deskripsi"
            rows="3"
            placeholder="Misalnya: Kue basah buatan rumah, pesan H-1 untuk acara."
            :disabled="loading"
          ></textarea>
        </div>

        <div v-if="errorMsg" class="pesan pesan-galat" role="alert">
          <CircleAlert :size="20" :stroke-width="2.5" />
          <span>{{ errorMsg }}</span>
        </div>

        <div class="aksi">
          <button type="button" class="tombol tombol-besar" :disabled="loading" @click="router.back()">
            <ArrowLeft :size="20" :stroke-width="2.5" />
            Kembali
          </button>
          <button type="submit" class="tombol tombol-merah tombol-besar aksi-utama" :disabled="loading">
            <span v-if="loading" class="spinner-sm"></span>
            {{ loading ? 'Mendaftarkan…' : 'Daftarkan toko' }}
          </button>
        </div>
      </form>
    </div>

    <div v-else class="papan papan-hijau papan-bingkai berhasil">
      <CircleCheck :size="48" :stroke-width="2.25" />
      <h2 class="huruf-papan">Tokomu terdaftar!</h2>
      <p>Admin akan memeriksanya dulu. Sambil menunggu, kamu sudah bisa melengkapi profil tokomu.</p>
      <button type="button" class="tombol tombol-kuning tombol-besar" @click="keDashboard">
        Ke dashboard toko
        <ArrowRight :size="20" :stroke-width="2.5" />
      </button>
    </div>
  </LayoutAuth>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ShieldCheck, CircleAlert, CircleCheck, ArrowLeft, ArrowRight } from 'lucide-vue-next';
import { supabase } from '@/lib/supabase';
import LayoutAuth from '@/layouts/LayoutAuth.vue';

const route = useRoute();
const router = useRouter();
const loadingPage = ref(true);
const loading = ref(false);
const errorMsg = ref('');
const success = ref(false);

const form = ref({ nama_toko: '', nomor_wa: '', alamat: '', deskripsi: '' });

const rapikanWa = () => {
  form.value.nomor_wa = form.value.nomor_wa.replace(/\D/g, '').replace(/^(62|0)/, '');
};

// Muat ulang penuh supaya peran baru (penjual) terbaca oleh menu dan penjaga halaman
const keDashboard = () => window.location.assign('/toko/dashboard');

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    router.replace({ path: '/login', query: { redirect: route.fullPath } });
    return;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (profile?.role === 'penjual') {
    router.replace('/toko/dashboard');
    return;
  }

  const { data: tokoAda } = await supabase
    .from('toko')
    .select('id, status')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (tokoAda) {
    router.replace('/toko/dashboard');
    return;
  }

  loadingPage.value = false;
});

const handleSubmit = async () => {
  errorMsg.value = '';

  if (!form.value.nama_toko.trim() || !form.value.nomor_wa || !form.value.alamat.trim()) {
    errorMsg.value = 'Nama toko, nomor WA, dan alamat wajib diisi.';
    return;
  }
  if (form.value.nomor_wa.length < 9 || form.value.nomor_wa.length > 13) {
    errorMsg.value = 'Nomor WA sepertinya belum lengkap. Tulis tanpa 0 di depan, contoh: 81234567890.';
    return;
  }

  loading.value = true;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    router.replace({ path: '/login', query: { redirect: route.fullPath } });
    return;
  }

  const { error: tokoError } = await supabase.from('toko').insert({
    user_id: session.user.id,
    nama_toko: form.value.nama_toko.trim(),
    nomor_wa: form.value.nomor_wa,
    alamat: form.value.alamat.trim(),
    deskripsi: form.value.deskripsi.trim(),
    status: 'PENDING',
  });

  if (tokoError) {
    errorMsg.value = 'Tokomu belum tersimpan. Cek internetmu, lalu coba lagi.';
    loading.value = false;
    return;
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'penjual' })
    .eq('id', session.user.id);

  if (profileError) {
    errorMsg.value = 'Tokomu sudah tersimpan, tapi statusmu sebagai penjual belum berubah. Hubungi admin lewat menu Cara Pakai.';
    loading.value = false;
    return;
  }

  loading.value = false;
  success.value = true;
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
.catatan {
  margin-top: 1.25rem;
}
.isi-form {
  display: flex;
  flex-direction: column;
  margin-top: 1.5rem;
}
.isi-form > .pesan {
  margin-top: 1.25rem;
}
.opsional {
  font-weight: 400;
  color: var(--tinta-3);
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
  border: 2px solid var(--tinta);
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
.berhasil {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 2rem 1.5rem;
}
.berhasil h2 {
  font-size: 1.9rem;
}
.berhasil p {
  color: #e6f4ea;
}
</style>
