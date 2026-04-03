<template>
  <div class="page">
    <nav class="navbar">
      <RouterLink to="/" class="nav-brand">🛒 ItahBangkuang</RouterLink>
      <div class="nav-links">
        <RouterLink to="/produk">Lihat Toko</RouterLink>
        <RouterLink v-if="statusToko === 'AKTIF'" to="/toko/dashboard">Dashboard</RouterLink>
        <RouterLink v-if="statusToko === 'AKTIF'" to="/toko/produk">Produk Saya</RouterLink>
        <RouterLink v-if="statusToko === 'AKTIF'" to="/toko/order">Order Masuk</RouterLink>
        <RouterLink to="/toko/profil">Profil Toko</RouterLink>
        <button class="btn-nav-outline" @click="authStore.logout(router)">Keluar</button>
      </div>
      <button class="hamburger" @click="menuOpen = !menuOpen">☰</button>
    </nav>

    <div class="mobile-menu" v-if="menuOpen">
      <RouterLink to="/produk" @click="menuOpen = false">Lihat Toko</RouterLink>
      <RouterLink v-if="statusToko === 'AKTIF'" to="/toko/dashboard" @click="menuOpen = false">Dashboard</RouterLink>
      <RouterLink v-if="statusToko === 'AKTIF'" to="/toko/produk" @click="menuOpen = false">Produk Saya</RouterLink>
      <RouterLink v-if="statusToko === 'AKTIF'" to="/toko/order" @click="menuOpen = false">Order Masuk</RouterLink>
      <RouterLink to="/toko/profil" @click="menuOpen = false">Profil Toko</RouterLink>
      <button @click="authStore.logout(router)">Keluar</button>
    </div>

    <slot />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

defineProps({
  statusToko: {
    type: String,
    default: null, // 'AKTIF' | 'PENDING' | 'DITOLAK' | 'DIBLOKIR'
  },
})

const router    = useRouter()
const authStore = useAuthStore()
const menuOpen  = ref(false)
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #fdfaf4;
}
</style>
