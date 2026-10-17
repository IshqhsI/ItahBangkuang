<template>
  <LayoutAuth>
    <div class="papan formulir">
      <h1 class="judul-halaman">Masuk</h1>
      <p class="sub-halaman">
        Belum punya akun?
        <RouterLink :to="{ path: '/register', query: route.query }">Daftar dulu, gratis</RouterLink>
      </p>

      <p v-if="route.query.redirect" class="pesan pesan-info catatan-masuk">
        <Info :size="20" :stroke-width="2.5" />
        <span>Masuk dulu supaya pesananmu bisa dikirim ke penjual.</span>
      </p>

      <form class="isi-form" novalidate @submit.prevent="handleLogin">
        <div class="isian">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            inputmode="email"
            placeholder="nama@email.com"
            required
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
              autocomplete="current-password"
              required
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
        </div>

        <div v-if="errorMsg" class="pesan pesan-galat" role="alert">
          <CircleAlert :size="20" :stroke-width="2.5" />
          <span>{{ errorMsg }}</span>
        </div>

        <button type="submit" class="tombol tombol-merah tombol-besar tombol-penuh" :disabled="loading">
          <span v-if="loading" class="spinner-sm"></span>
          {{ loading ? 'Sedang masuk…' : 'Masuk' }}
        </button>
      </form>
    </div>
  </LayoutAuth>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Eye, EyeOff, CircleAlert, Info } from 'lucide-vue-next';
import { supabase } from '@/lib/supabase';
import { useToastStore } from '@/stores/toast';
import LayoutAuth from '@/layouts/LayoutAuth.vue';
import { tujuanAman } from '@/lib/utils';

const route = useRoute();
const router = useRouter();
const toast = useToastStore();

const form = ref({ email: '', password: '' });
const loading = ref(false);
const showPass = ref(false);
const errorMsg = ref('');

const handleLogin = async () => {
  errorMsg.value = '';
  if (!form.value.email.trim() || !form.value.password) {
    errorMsg.value = 'Isi email dan kata sandimu dulu.';
    return;
  }

  loading.value = true;
  const { data, error } = await supabase.auth.signInWithPassword({
    email: form.value.email.trim(),
    password: form.value.password,
  });

  if (error) {
    errorMsg.value =
      'Email atau kata sandi salah. Coba lagi, atau daftar kalau belum punya akun.';
    loading.value = false;
    return;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  const tujuan = tujuanAman(route.query.redirect);

  if (profile?.role === 'admin') {
    toast.success('Selamat datang, Admin!');
    router.push(tujuan ?? '/admin/dashboard');
  } else if (profile?.role === 'penjual') {
    toast.success('Selamat datang lagi!');
    router.push(tujuan ?? '/toko/dashboard');
  } else {
    toast.success('Selamat datang lagi!');
    router.push(tujuan ?? '/');
  }
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
.catatan-masuk {
  margin-top: 1.25rem;
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
  border-radius: 6px;
  cursor: pointer;
  color: var(--tinta-2);
}
.sandi-lihat:hover {
  background: var(--dinding);
  color: var(--tinta);
}
</style>
