<template>
  <div class="page">
    <nav class="navbar">
      <RouterLink to="/" class="nav-brand">🛒 ItahBangkuang</RouterLink>
      <div class="nav-links">
        <RouterLink to="/admin/dashboard">Dashboard</RouterLink>
        <RouterLink to="/admin/toko">Kelola Toko</RouterLink>
        <RouterLink to="/admin/produk">Produk</RouterLink>
        <RouterLink to="/admin/users">Users</RouterLink>
        <button class="btn-nav-outline" @click="authStore.logout(router)">Keluar</button>
      </div>
      <button class="hamburger" @click="menuOpen = !menuOpen">☰</button>
    </nav>

    <div class="mobile-menu" v-if="menuOpen">
      <RouterLink to="/admin/dashboard" @click="menuOpen = false">Dashboard</RouterLink>
      <button @click="authStore.logout(router)">Keluar</button>
    </div>

    <slot />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

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
