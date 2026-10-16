<template>
  <div class="tata-letak">
    <NavBar />
    <main class="isi-utama">
      <slot />
    </main>
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue';

defineProps({
  statusToko: {
    type: String,
    default: null, // 'AKTIF' | 'PENDING' | 'DITOLAK' | 'DIBLOKIR'
  },
  tokoId: {
    type: String,
    default: null,
  },
});
</script>

<style scoped>
.tata-letak {
  min-height: 100vh;
  background: var(--dinding);
}
.isi-utama {
  padding-top: var(--nav-h);
  padding-bottom: 3rem;
}
@media (max-width: 900px) {
  .isi-utama {
    padding-bottom: calc(62px + 2rem + env(safe-area-inset-bottom));
  }
}
</style>
