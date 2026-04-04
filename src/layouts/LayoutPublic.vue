<template>
  <div class="beranda">
    <NavBar/>

    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import NavBar from '@/components/NavBar.vue'

const router   = useRouter()
const authStore = useAuthStore()
const menuOpen = ref(false)
</script>

<style scoped>
.page {
  min-height: 100vh;
}

.main-content {
  padding-top: 64px; /* Harus sama dengan tinggi navbar */
  min-height: 100vh;
}
</style>
