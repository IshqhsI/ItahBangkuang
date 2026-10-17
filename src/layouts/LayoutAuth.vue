<template>
  <div class="auth">
    <aside class="auth-papan">
      <RouterLink to="/" class="auth-merek" aria-label="ItahBangkuang — Beranda">
        <span class="itah">Itah</span><span>Bangkuang</span>
      </RouterLink>
      <p class="auth-semboyan huruf-papan berbayang">
        <span>Bapapili mangat,</span>
        <span class="kuning">Bajualan mangat kia.</span>
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
  background: var(--dinding);
}
@media (min-width: 960px) {
  .auth {
    grid-template-columns: 0.9fr 1.1fr;
  }
}

.auth-papan {
  background: var(--merah);
  color: #fff;
  border-bottom: 3px solid var(--tinta);
  box-shadow: inset 0 -5px 0 var(--kuning);
  padding: 1.25rem 1.25rem 1.6rem;
}
@media (min-width: 960px) {
  .auth-papan {
    border-bottom: 0;
    box-shadow:
      inset -5px 0 0 var(--kuning),
      3px 0 0 var(--tinta);
    padding: 3rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: sticky;
    top: 0;
    height: 100vh;
  }
}

.auth-merek {
  display: inline-flex;
  align-self: flex-start;
  padding: 0.3rem 0.55rem 0.25rem;
  background: var(--kuning);
  color: var(--tinta);
  border: var(--tebal) solid var(--garis);
  border-radius: 6px;
  font-family: var(--font-papan);
  font-size: 1.05rem;
  line-height: 1;
  text-decoration: none;
  transform: rotate(-1.5deg);
}
.auth-merek .itah {
  color: var(--merah);
}

.auth-semboyan {
  margin-top: 1rem;
  font-size: clamp(1.5rem, 5vw, 3.4rem);
  line-height: 1.05;
}
.auth-semboyan span {
  display: block;
}
.auth-semboyan .kuning {
  color: var(--kuning);
}
.auth-ket {
  margin-top: 0.75rem;
  color: #ffe9ea;
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
  color: var(--tinta-2);
  font-weight: 700;
  text-decoration: none;
}
.auth-kembali:hover {
  color: var(--tinta);
  text-decoration: underline;
}
</style>
