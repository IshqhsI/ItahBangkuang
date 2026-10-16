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
</style>
