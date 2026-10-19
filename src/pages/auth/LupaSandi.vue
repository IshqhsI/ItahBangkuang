<template>
  <LayoutAuth>
    <div class="papan formulir">
      <h1 class="judul-halaman">Lupa kata sandi</h1>

      <template v-if="!terkirim">
        <p class="sub-halaman">
          Masukkan email akun Anda. Kami kirim tautan untuk membuat kata sandi baru.
        </p>

        <form class="isi-form" novalidate @submit.prevent="kirim">
          <div class="isian">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              inputmode="email"
              placeholder="nama@email.com"
              required
              :disabled="loading"
            />
          </div>

          <div v-if="errorMsg" class="pesan pesan-galat" role="alert">
            <CircleAlert :size="20" :stroke-width="2.5" />
            <span>{{ errorMsg }}</span>
          </div>

          <button type="submit" class="tombol tombol-merah tombol-besar tombol-penuh" :disabled="loading">
            <span v-if="loading" class="spinner-sm"></span>
            {{ loading ? 'Mengirim…' : 'Kirim tautan' }}
          </button>
        </form>
      </template>

      <div v-else class="terkirim" role="status">
        <MailCheck :size="44" :stroke-width="1.75" />
        <h2>Periksa email Anda</h2>
        <p>
          Jika email <strong>{{ email.trim() }}</strong> terdaftar, tautan untuk membuat kata sandi baru sudah
          dikirim. Cek juga folder spam. Tautan berlaku sebentar, jadi segera dibuka.
        </p>
        <button type="button" class="tombol tombol-penuh" @click="terkirim = false">Pakai email lain</button>
      </div>

      <div class="bantuan-admin">
        <p>Tidak menerima email, atau tidak punya akses ke email itu?</p>
        <a :href="tautanAdmin" target="_blank" rel="noopener" class="tombol tombol-penuh">
          <IkonWa :size="20" />
          Minta bantuan admin lewat WhatsApp
        </a>
      </div>

      <p class="kembali-masuk">
        Sudah ingat? <RouterLink to="/login">Kembali ke halaman masuk</RouterLink>
      </p>
    </div>
  </LayoutAuth>
</template>

<script setup>
import { ref } from 'vue';
import { CircleAlert, MailCheck } from 'lucide-vue-next';
import { supabase } from '@/lib/supabase';
import LayoutAuth from '@/layouts/LayoutAuth.vue';
import IkonWa from '@/components/IkonWa.vue';
import { tautanWa } from '@/lib/utils';
import { useSeo } from '@/lib/useSeo';

useSeo({ title: 'Lupa kata sandi', noindex: true });

const email = ref('');
const loading = ref(false);
const terkirim = ref(false);
const errorMsg = ref('');

const tautanAdmin = tautanWa(
  '6282253158560',
  'Halo admin, saya lupa kata sandi akun ItahBangkuang dan tidak bisa menerima email reset. Mohon bantuannya.',
);

const kirim = async () => {
  errorMsg.value = '';
  const alamat = email.value.trim();
  if (!/^\S+@\S+\.\S+$/.test(alamat)) {
    errorMsg.value = 'Tulis email dengan benar, contoh: nama@email.com.';
    return;
  }

  loading.value = true;
  const { error } = await supabase.auth.resetPasswordForEmail(alamat, {
    redirectTo: `${window.location.origin}/atur-sandi`,
  });
  loading.value = false;

  // Hasil sengaja dibuat sama untuk email terdaftar maupun tidak (tidak membocorkan siapa yang punya akun).
  if (error && (error.status === 429 || /rate|limit/i.test(error.message ?? ''))) {
    errorMsg.value = 'Terlalu banyak permintaan. Tunggu beberapa menit, lalu coba lagi.';
    return;
  }
  terkirim.value = true;
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
.isi-form {
  display: flex;
  flex-direction: column;
  margin-top: 1.5rem;
}
.isi-form > .tombol {
  margin-top: 1.5rem;
}
.isi-form > .pesan {
  margin-top: 1.25rem;
}
.terkirim {
  display: grid;
  justify-items: center;
  gap: 0.6rem;
  margin-top: 1.5rem;
  padding: 1.5rem 1rem;
  text-align: center;
  background: var(--sage);
  border-radius: 20px;
  color: var(--sungai);
}
.terkirim h2 {
  font-family: var(--font-papan);
  font-weight: 600;
  font-size: 1.3rem;
}
.terkirim p {
  color: var(--ink-2);
  line-height: 1.6;
  max-width: 46ch;
}
.terkirim .tombol {
  margin-top: 0.4rem;
}
.bantuan-admin {
  margin-top: 1.75rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--sage-2);
}
.bantuan-admin p {
  margin-bottom: 0.7rem;
  color: var(--ink-2);
  font-size: 0.95rem;
}
.kembali-masuk {
  margin-top: 1.25rem;
  text-align: center;
  color: var(--ink-2);
}
</style>
