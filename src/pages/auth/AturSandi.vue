<template>
  <LayoutAuth>
    <div class="papan formulir">
      <h1 class="judul-halaman">Atur kata sandi baru</h1>

      <div v-if="memeriksa" class="memuat kecil" role="status">
        <div class="spinner"></div>
        <p>Memeriksa tautan…</p>
      </div>

      <div v-else-if="!siap" class="kedaluwarsa" role="alert">
        <TriangleAlert :size="40" :stroke-width="1.75" />
        <h2>Tautan tidak berlaku</h2>
        <p>
          Tautan ini sudah dipakai atau kedaluwarsa. Minta tautan baru, lalu buka segera setelah
          email masuk.
        </p>
        <RouterLink to="/lupa-sandi" class="tombol tombol-merah tombol-penuh">Minta tautan baru</RouterLink>
      </div>

      <template v-else>
        <p class="sub-halaman">Buat kata sandi baru untuk akun Anda. Minimal 8 karakter.</p>

        <form class="isi-form" novalidate @submit.prevent="simpan">
          <div class="isian">
            <label for="sandi-baru">Kata sandi baru</label>
            <div class="sandi">
              <input
                id="sandi-baru"
                v-model="sandi"
                :type="lihat ? 'text' : 'password'"
                autocomplete="new-password"
                required
                :disabled="loading"
              />
              <button
                type="button"
                class="sandi-lihat"
                :aria-label="lihat ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
                :aria-pressed="lihat"
                @click="lihat = !lihat"
              >
                <EyeOff v-if="lihat" :size="22" :stroke-width="2.25" />
                <Eye v-else :size="22" :stroke-width="2.25" />
              </button>
            </div>
          </div>

          <div class="isian">
            <label for="sandi-ulang">Ulangi kata sandi baru</label>
            <input
              id="sandi-ulang"
              v-model="ulang"
              :type="lihat ? 'text' : 'password'"
              autocomplete="new-password"
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
            {{ loading ? 'Menyimpan…' : 'Simpan kata sandi' }}
          </button>
        </form>
      </template>
    </div>
  </LayoutAuth>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Eye, EyeOff, CircleAlert, TriangleAlert } from 'lucide-vue-next';
import { supabase } from '@/lib/supabase';
import { useToastStore } from '@/stores/toast';
import LayoutAuth from '@/layouts/LayoutAuth.vue';
import { useSeo } from '@/lib/useSeo';

useSeo({ title: 'Atur kata sandi baru', noindex: true });

const router = useRouter();
const toast = useToastStore();

const memeriksa = ref(true);
const siap = ref(false);
const sandi = ref('');
const ulang = ref('');
const lihat = ref(false);
const loading = ref(false);
const errorMsg = ref('');

// Halaman ini dibuka dari tautan email (sesi pemulihan) atau oleh pengguna yang sudah masuk (ganti sandi).
// supabase-js membaca token di alamat saat dimuat; getSession menunggu proses itu selesai.
onMounted(async () => {
  // Tautan email mengarah ke domain ini membawa token_hash; sesi dibuat dengan memverifikasinya di sini
  // (bukan lewat alamat supabase.co), supaya email tidak dinilai mencurigakan dan token tidak hangus
  // karena dibuka lebih dulu oleh pemindai tautan.
  const parameter = new URLSearchParams(window.location.search);
  const tokenHash = parameter.get('token_hash');
  if (tokenHash && parameter.get('type') === 'recovery') {
    await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' });
    window.history.replaceState(null, '', window.location.pathname);
  }

  const { data: { session } } = await supabase.auth.getSession();
  siap.value = Boolean(session);
  memeriksa.value = false;
});

const simpan = async () => {
  errorMsg.value = '';
  if (sandi.value.length < 8) {
    errorMsg.value = 'Kata sandi minimal 8 karakter.';
    return;
  }
  if (sandi.value !== ulang.value) {
    errorMsg.value = 'Kedua kata sandi belum sama. Ketik ulang dengan teliti.';
    return;
  }

  loading.value = true;
  const { data, error } = await supabase.auth.updateUser({ password: sandi.value });

  if (error) {
    errorMsg.value = /same|different/i.test(error.message ?? '')
      ? 'Kata sandi baru harus berbeda dari yang lama.'
      : 'Kata sandi belum tersimpan. Periksa koneksi internet Anda, lalu coba lagi. Bila tautan sudah lama, minta tautan baru.';
    loading.value = false;
    return;
  }

  const { data: profil } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  toast.success('Kata sandi berhasil diganti.');
  router.replace(
    profil?.role === 'admin' ? '/admin/dashboard' : profil?.role === 'penjual' ? '/toko/dashboard' : '/',
  );
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
  border-radius: 50%;
  cursor: pointer;
  color: var(--ink-2);
}
.sandi-lihat:hover {
  background: var(--sage);
  color: var(--sungai);
}
.kedaluwarsa {
  display: grid;
  justify-items: center;
  gap: 0.6rem;
  margin-top: 1.5rem;
  padding: 1.5rem 1rem;
  text-align: center;
  background: var(--aprikot-muda);
  border-radius: 20px;
  color: #7a4a24;
}
.kedaluwarsa h2 {
  font-family: var(--font-papan);
  font-weight: 600;
  font-size: 1.3rem;
}
.kedaluwarsa p {
  color: var(--ink-2);
  line-height: 1.6;
}
.kedaluwarsa .tombol {
  margin-top: 0.4rem;
}
</style>
