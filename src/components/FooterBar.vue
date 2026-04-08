<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <span class="brand-logo">🛒</span>
        <span class="brand-name">ItahBangkuang</span>
        <p class="brand-tagline"> Bapapili mangat, Bajualan mangat kia. </p>
      </div>

      <div class="footer-links">
        <RouterLink to="/">Beranda</RouterLink>
        <RouterLink to="/produk">Semua Produk</RouterLink>
        <RouterLink v-if="authStore.user" to="/riwayat"
          >Pesanan Saya</RouterLink
        >
      </div>

      <div class="footer-feedback">
        <p class="feedback-label">Ada saran atau keluhan?</p>
        <RouterLink to="/feedback" class="btn-feedback">
          💬 Sampaikan di Sini
        </RouterLink>
      </div>
    </div>

    <div class="footer-bottom">
      <p>© {{ tahun }} ItahBangkuang — Platform UMKM Lokal</p>
    </div>
  </footer>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const tahun = new Date().getFullYear();
</script>

<style scoped>
.footer {
  background: #1a2e0a;
  color: #a8c97f;
  margin-top: auto;
}

.footer-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2.5rem 2rem;
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.brand-logo {
  font-size: 1.5rem;
}
.brand-name {
  font-family: 'Lora', serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: #f5edd6;
}
.brand-tagline {
  font-size: 0.82rem;
  color: #a8c97f;
  line-height: 1.5;
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.footer-links a {
  color: #a8c97f;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s;
}
.footer-links a:hover {
  color: #f5edd6;
}

.footer-feedback {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.feedback-label {
  font-size: 0.82rem;
  color: #a8c97f;
}

.btn-feedback {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #2d5016;
  color: #f5edd6;
  border: 1.5px solid #3a6b1e;
  padding: 0.6rem 1.1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  width: fit-content;
}
.btn-feedback:hover {
  background: #3a6b1e;
  border-color: #a8c97f;
}

.footer-bottom {
  border-top: 1px solid rgba(168, 201, 127, 0.15);
  padding: 1rem 2rem;
  text-align: center;
}
.footer-bottom p {
  font-size: 0.78rem;
  color: rgba(168, 201, 127, 0.6);
}

@media (max-width: 768px) {
  .footer-inner {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>
