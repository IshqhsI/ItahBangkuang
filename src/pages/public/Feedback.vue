<template>
  <LayoutPublic>
    <section class="kepala">
      <div class="wadah sempit">
        <h1 class="judul-halaman kepala-judul">Saran &amp; keluhan</h1>
        <p class="kepala-sub">
          Ada yang bikin bingung, rusak, atau kurang? Ceritakan saja. Semua pesan
          dibaca langsung oleh pengelola ItahBangkuang.
        </p>
      </div>
    </section>

    <div class="wadah sempit isi">
      <!-- Belum masuk -->
      <div v-if="!authStore.user" class="kosong">
        <LogIn :size="44" :stroke-width="2" />
        <h3>Masuk dulu, ya</h3>
        <p>Supaya kami bisa membalas kalau perlu, kirim pesan setelah masuk ke akunmu.</p>
        <RouterLink :to="{ path: '/login', query: { redirect: '/feedback' } }" class="tombol tombol-merah">
          Masuk
        </RouterLink>
      </div>

      <!-- Terkirim -->
      <div v-else-if="success" class="papan papan-hijau papan-bingkai terkirim">
        <CircleCheck :size="44" :stroke-width="2.25" />
        <h2 class="huruf-papan">Terima kasih!</h2>
        <p>Pesanmu sudah sampai. Kami pakai masukan seperti ini untuk memperbaiki ItahBangkuang.</p>
        <div class="terkirim-aksi">
          <button type="button" class="tombol tombol-kuning" @click="kirimLagi">Kirim pesan lain</button>
          <RouterLink to="/" class="tombol">Ke beranda</RouterLink>
        </div>
      </div>

      <!-- Formulir -->
      <form v-else class="papan formulir" novalidate @submit.prevent="handleSubmit">
        <fieldset class="jenis">
          <legend class="label">Pesanmu tentang apa?</legend>
          <div class="jenis-pilihan">
            <label
              v-for="k in kategoriList"
              :key="k.slug"
              class="jenis-kartu"
              :class="{ dipilih: form.kategori === k.slug }"
            >
              <input v-model="form.kategori" type="radio" :value="k.slug" class="sr-only" />
              <component :is="k.icon" :size="24" :stroke-width="2.25" />
              <span class="jenis-nama">{{ k.label }}</span>
              <span class="jenis-ket">{{ k.desc }}</span>
            </label>
          </div>
        </fieldset>

        <div class="isian">
          <label for="isi-pesan">Ceritakan di sini</label>
          <textarea
            id="isi-pesan"
            v-model="form.isi"
            :placeholder="placeholder"
            rows="6"
            maxlength="1000"
            aria-describedby="hitung-karakter"
            :disabled="loading"
          ></textarea>
          <span id="hitung-karakter" class="bantuan">{{ form.isi.length }} dari 1000 karakter</span>
        </div>

        <div v-if="errorMsg" class="pesan pesan-galat" role="alert">
          <CircleAlert :size="20" :stroke-width="2.5" />
          <span>{{ errorMsg }}</span>
        </div>

        <button
          type="submit"
          class="tombol tombol-merah tombol-besar tombol-penuh kirim"
          :disabled="loading || !form.isi.trim()"
        >
          <span v-if="loading" class="spinner-sm"></span>
          <Send v-else :size="20" :stroke-width="2.5" />
          {{ loading ? 'Mengirim…' : 'Kirim pesan' }}
        </button>
      </form>
    </div>
  </LayoutPublic>
</template>

<script setup>
import { ref, computed, markRaw } from 'vue';
import {
  Lightbulb,
  TriangleAlert,
  Wrench,
  LogIn,
  CircleCheck,
  CircleAlert,
  Send,
} from 'lucide-vue-next';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';
import LayoutPublic from '@/layouts/LayoutPublic.vue';

const authStore = useAuthStore();
const loading = ref(false);
const success = ref(false);
const errorMsg = ref('');

const form = ref({ kategori: 'saran', isi: '' });

const kategoriList = [
  {
    slug: 'saran',
    label: 'Saran',
    icon: markRaw(Lightbulb),
    desc: 'Ide supaya lebih enak dipakai',
    placeholder: 'Contoh: Akan lebih gampang kalau di halaman produk ada…',
  },
  {
    slug: 'keluhan',
    label: 'Keluhan',
    icon: markRaw(TriangleAlert),
    desc: 'Ada yang error atau tidak beres',
    placeholder: 'Contoh: Waktu saya menekan "Kirim pesanan", muncul tulisan…',
  },
  {
    slug: 'fitur',
    label: 'Minta fitur',
    icon: markRaw(Wrench),
    desc: 'Fitur baru yang kamu butuhkan',
    placeholder: 'Contoh: Saya butuh fitur … supaya bisa …',
  },
];

const placeholder = computed(
  () => kategoriList.find((k) => k.slug === form.value.kategori)?.placeholder ?? '',
);

const handleSubmit = async () => {
  if (!form.value.isi.trim()) {
    errorMsg.value = 'Tulis dulu pesanmu sebelum dikirim.';
    return;
  }
  loading.value = true;
  errorMsg.value = '';

  const { error } = await supabase.from('feedback').insert({
    user_id: authStore.user.id,
    kategori: form.value.kategori,
    isi: form.value.isi.trim(),
    status: 'BARU',
  });

  if (error) {
    errorMsg.value = 'Pesanmu belum terkirim. Periksa koneksi internetmu, lalu coba lagi.';
    loading.value = false;
    return;
  }

  success.value = true;
  loading.value = false;
};

const kirimLagi = () => {
  success.value = false;
  form.value = { kategori: 'saran', isi: '' };
  errorMsg.value = '';
};
</script>

<style scoped>
.sempit {
  max-width: 760px;
}
.kepala {
  background: var(--kuning);
  border-bottom: 3px solid var(--tinta);
  padding: 2rem 0 2.25rem;
}
.kepala-sub {
  margin-top: 0.5rem;
  color: #3a2f00;
  font-size: 1.05rem;
  max-width: 56ch;
}
.isi {
  padding-top: 2rem;
  padding-bottom: 4rem;
}

.formulir {
  padding: 1.5rem 1.25rem;
}
@media (min-width: 560px) {
  .formulir {
    padding: 2rem;
  }
}
.jenis {
  border: 0;
  margin-bottom: 1.5rem;
}
.jenis legend {
  margin-bottom: 0.6rem;
}
.jenis-pilihan {
  display: grid;
  gap: 0.6rem;
}
@media (min-width: 560px) {
  .jenis-pilihan {
    grid-template-columns: repeat(3, 1fr);
  }
}
.jenis-kartu {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 0.65rem;
  align-items: center;
  padding: 0.8rem 0.9rem;
  background: var(--papan);
  border: 2.5px solid var(--tinta);
  border-radius: var(--sudut);
  cursor: pointer;
  transition: background-color 0.15s ease;
}
@media (min-width: 560px) {
  .jenis-kartu {
    grid-template-columns: 1fr;
    row-gap: 0.3rem;
    align-items: start;
  }
}
.jenis-kartu svg {
  grid-row: span 2;
}
@media (min-width: 560px) {
  .jenis-kartu svg {
    grid-row: auto;
  }
}
.jenis-kartu:hover {
  background: var(--kuning-muda);
}
.jenis-kartu.dipilih {
  background: var(--kuning);
  box-shadow:
    inset 0 0 0 3px var(--kuning),
    inset 0 0 0 5px var(--tinta);
}
.jenis-kartu:has(input:focus-visible) {
  outline: 3px solid var(--biru);
  outline-offset: 3px;
}
.jenis-nama {
  font-family: var(--font-papan);
  font-size: 1rem;
}
.jenis-ket {
  font-size: 0.88rem;
  color: var(--tinta-2);
  line-height: 1.35;
}

.formulir .pesan {
  margin-top: 1.1rem;
}
.kirim {
  margin-top: 1.5rem;
}

.terkirim {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 2rem 1.75rem;
}
.terkirim h2 {
  font-size: 1.75rem;
}
.terkirim p {
  color: #e6f4ea;
  max-width: 48ch;
}
.terkirim-aksi {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 0.5rem;
}
</style>
