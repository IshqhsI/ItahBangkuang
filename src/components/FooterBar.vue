<template>
  <footer class="kaki">
    <div class="wadah kaki-dalam">
      <div class="kaki-merek">
        <RouterLink to="/" class="kaki-merek-tautan" aria-label="ItahBangkuang — Beranda">
          <span class="kaki-tanda" aria-hidden="true"><Store :size="16" :stroke-width="2.25" /></span>
          <span class="kaki-nama"><span class="itah">Itah</span>Bangkuang</span>
        </RouterLink>
        <p class="kaki-semboyan">Marketplace produk lokal Kelurahan Bangkuang.</p>
        <p class="kaki-ket">Belanja dan berjualan produk lokal secara daring.</p>
      </div>

      <nav class="kaki-tautan" aria-label="Tautan kaki">
        <RouterLink to="/">Beranda</RouterLink>
        <RouterLink to="/produk">Semua Produk</RouterLink>
        <RouterLink to="/toko">Toko</RouterLink>
        <RouterLink to="/tutorial">Cara Pakai</RouterLink>
        <RouterLink v-if="authStore.user" to="/riwayat">Pesanan Saya</RouterLink>
      </nav>

      <div class="kaki-saran">
        <p class="kaki-saran-judul">Ada saran atau keluhan?</p>
        <RouterLink to="/feedback" class="tombol tombol-merah">
          <MessageSquareText :size="20" :stroke-width="2" />
          Sampaikan di sini
        </RouterLink>
        <PasangAplikasi class="kaki-pasang" kelas="" />
      </div>
    </div>
    <div class="kaki-bawah">
      <div class="wadah">© {{ tahun }} ItahBangkuang. Platform UMKM lokal.</div>
    </div>
  </footer>
</template>

<script setup>
import { MessageSquareText, Store } from 'lucide-vue-next';
import PasangAplikasi from '@/components/PasangAplikasi.vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const tahun = new Date().getFullYear();
</script>

<style scoped>
.kaki {
  margin-top: 1rem;
  background: var(--sage);
  color: var(--ink);
  border-radius: 36px 36px 0 0;
}
@media (min-width: 768px) {
  .kaki {
    border-radius: 56px 56px 0 0;
  }
}
.kaki-dalam {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2.25rem;
  padding-top: 3.25rem;
  padding-bottom: 2.5rem;
}
@media (min-width: 820px) {
  .kaki-dalam {
    grid-template-columns: 1.5fr 0.8fr 1fr;
    gap: 3rem;
  }
}
.kaki-merek-tautan {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
}
.kaki-tanda {
  display: grid;
  place-items: center;
  width: 30px;
  height: 36px;
  background: var(--sungai);
  color: #fff;
  border-radius: 999px 999px 9px 9px;
}
.kaki-nama {
  font-family: var(--font-papan);
  font-weight: 700;
  font-size: 1.35rem;
  letter-spacing: -0.015em;
  color: var(--sungai-dalam);
}
.kaki-nama .itah {
  color: var(--sungai-sedang);
}
.kaki-semboyan {
  margin-top: 1.1rem;
  font-family: var(--font-papan);
  font-weight: 600;
  font-size: clamp(1.4rem, 3.4vw, 1.9rem);
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: var(--sungai);
  max-width: 20ch;
}
.kaki-ket {
  margin-top: 0.7rem;
  color: var(--ink-2);
  max-width: 40ch;
}
.kaki-tautan {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}
.kaki-tautan a {
  display: inline-flex;
  align-items: center;
  min-height: 42px;
  color: var(--ink);
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease;
}
.kaki-tautan a:hover {
  color: var(--sungai-sedang);
  text-decoration: underline;
  text-underline-offset: 0.25em;
}
.kaki-saran {
  padding: 1.4rem;
  background: #fff;
  border-radius: 28px;
  box-shadow: var(--bayang);
}
.kaki-saran-judul {
  font-weight: 700;
  margin-bottom: 0.9rem;
}
.kaki-saran :deep(.tombol) {
  width: 100%;
}
.kaki-pasang {
  margin-top: 0.7rem;
}
.kaki-bawah {
  border-top: 1px solid var(--sage-2);
  padding: 1.1rem 0 1.4rem;
  font-size: 0.88rem;
  color: var(--ink-2);
}
</style>
