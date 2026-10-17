<template>
  <div class="auth">
    <aside class="auth-papan">
      <RouterLink to="/" class="auth-merek" aria-label="ItahBangkuang — Beranda">
        <span class="itah">Itah</span><span>Bangkuang</span>
      </RouterLink>
      <p class="auth-semboyan huruf-papan">
        <span>Belanja dari tetangga,</span>
        <span class="kuning">Jualan untuk tetangga.</span>
      </p>
      <p class="auth-ket">Pasar online warga Kelurahan Bangkuang.</p>
    </aside>

    <main class="auth-isi">
      <div class="auth-kartu">
        <RouterLink to="/" class="auth-kembali">
          <ArrowLeft :size="18" :stroke-width="2.5" />
          Kembali ke beranda
        </RouterLink>
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ArrowLeft } from 'lucide-vue-next';
</script>

<style scoped>
.auth {
  min-height: 100vh;
  display: grid;
  background: var(--kabut);
}
@media (min-width: 960px) {
  .auth {
    grid-template-columns: 0.9fr 1.1fr;
  }
}

.auth-papan {
  position: relative;
  overflow: hidden;
  background: var(--sage);
  color: var(--ink);
  border-radius: 0 0 32px 32px;
  padding: 1.25rem 1.25rem 1.6rem;
}
.auth-papan::after {
  content: '';
  position: absolute;
  right: -80px;
  bottom: -120px;
  width: 320px;
  aspect-ratio: 1;
  border-radius: 50%;
  border: 1.5px solid var(--sage-2);
  box-shadow: 0 0 0 30px rgba(207, 220, 210, 0.3), 0 0 0 60px rgba(207, 220, 210, 0.16);
  pointer-events: none;
}
@media (min-width: 960px) {
  .auth-papan {
    margin: 1rem 0 1rem 1rem;
    border-radius: 36px;
    padding: 3rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: sticky;
    top: 1rem;
    height: calc(100vh - 2rem);
  }
}

.auth-merek {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-self: flex-start;
  font-family: var(--font-papan);
  font-weight: 700;
  font-size: 1.35rem;
  letter-spacing: -0.015em;
  line-height: 1;
  color: var(--sungai-dalam);
  text-decoration: none;
}
.auth-merek .itah {
  color: var(--sungai-sedang);
}

.auth-semboyan {
  position: relative;
  z-index: 1;
  margin-top: 1rem;
  font-size: clamp(1.5rem, 5vw, 3.2rem);
  line-height: 1.08;
  letter-spacing: -0.02em;
  color: var(--sungai);
}
.auth-semboyan span {
  display: block;
}
.auth-semboyan .kuning {
  color: var(--sungai-sedang);
  font-style: italic;
}
.auth-ket {
  position: relative;
  z-index: 1;
  margin-top: 0.75rem;
  color: var(--ink-2);
}
@media (max-width: 959px) {
  .auth-ket {
    display: none;
  }
}

.auth-isi {
  display: flex;
  justify-content: center;
  padding: 1.5rem 1.25rem 3rem;
}
@media (min-width: 960px) {
  .auth-isi {
    align-items: center;
    padding: 3rem;
  }
}
.auth-kartu {
  width: 100%;
  max-width: 460px;
}
.auth-kembali {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 40px;
  margin-bottom: 0.75rem;
  color: var(--ink-2);
  font-weight: 700;
  text-decoration: none;
}
.auth-kembali:hover {
  color: var(--sungai);
  text-decoration: underline;
  text-underline-offset: 0.25em;
}
</style>
