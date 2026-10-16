<template>
  <footer class="kaki">
    <div class="wadah kaki-dalam">
      <div class="kaki-merek">
        <RouterLink to="/" class="kaki-papan" aria-label="ItahBangkuang — Beranda">
          <span class="itah">Itah</span><span>Bangkuang</span>
        </RouterLink>
        <p class="kaki-semboyan huruf-papan">Bapapili mangat, Bajualan mangat kia.</p>
        <p class="kaki-ket">Pasar online warga Kelurahan Bangkuang. Uluh Itah Kia.</p>
      </div>

      <nav class="kaki-tautan" aria-label="Tautan kaki">
        <RouterLink to="/">Beranda</RouterLink>
        <RouterLink to="/produk">Semua Produk</RouterLink>
        <RouterLink to="/tutorial">Cara Pakai</RouterLink>
        <RouterLink v-if="authStore.user" to="/riwayat">Pesanan Saya</RouterLink>
      </nav>

      <div class="kaki-saran">
        <p>Ada saran atau keluhan?</p>
        <RouterLink to="/feedback" class="tombol tombol-kuning">
          <MessageSquareText :size="20" :stroke-width="2.25" />
          Sampaikan di sini
        </RouterLink>
        <PasangAplikasi class="kaki-pasang" />
      </div>
    </div>
    <div class="kaki-bawah">
      <div class="wadah">© {{ tahun }} ItahBangkuang · Platform UMKM lokal</div>
    </div>
  </footer>
</template>

<script setup>
import { MessageSquareText } from 'lucide-vue-next';
import PasangAplikasi from '@/components/PasangAplikasi.vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const tahun = new Date().getFullYear();
</script>

<style scoped>
.kaki {
  background: var(--biru);
  color: #fff;
  border-top: 3px solid var(--tinta);
  box-shadow: inset 0 5px 0 var(--kuning);
}
.kaki-dalam {
  display: grid;
  gap: 2.25rem;
  padding-top: 3rem;
  padding-bottom: 2.5rem;
}
@media (min-width: 820px) {
  .kaki-dalam {
    grid-template-columns: 1.6fr 1fr 1fr;
    gap: 3rem;
  }
}
.kaki-papan {
  display: inline-flex;
  padding: 0.35rem 0.6rem 0.3rem;
  background: var(--kuning);
  color: var(--tinta);
  border: 2.5px solid var(--tinta);
  border-radius: 6px;
  font-family: var(--font-papan);
  font-size: 1.1rem;
  line-height: 1;
  text-decoration: none;
  transform: rotate(-1.5deg);
}
.kaki-papan .itah {
  color: var(--merah);
}
.kaki-semboyan {
  margin-top: 1.1rem;
  font-size: clamp(1.25rem, 3.4vw, 1.6rem);
  color: var(--kuning);
  max-width: 18ch;
}
.kaki-ket {
  margin-top: 0.7rem;
  color: #dbe4f3;
  max-width: 40ch;
}
.kaki-tautan {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.kaki-tautan a {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  color: #fff;
  font-weight: 700;
  text-decoration: none;
}
.kaki-tautan a:hover {
  text-decoration: underline;
}
.kaki-saran p {
  font-weight: 700;
  margin-bottom: 0.75rem;
}
.kaki-pasang {
  margin-top: 1rem;
}
.kaki-bawah {
  border-top: 2px solid rgba(255, 255, 255, 0.25);
  padding: 1rem 0;
  font-size: 0.88rem;
  color: #dbe4f3;
}
</style>
