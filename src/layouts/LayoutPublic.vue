<template>
  <div class="tata-letak">
    <NavBar />
    <main class="isi-utama">
      <slot />
    </main>
    <FooterBar />
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue';
import FooterBar from '@/components/FooterBar.vue';
</script>

<style scoped>
.tata-letak {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--kabut);
}
.isi-utama {
  flex: 1;
  padding-top: var(--nav-h);
}
</style>
