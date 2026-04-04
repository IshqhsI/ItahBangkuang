<template>
  <div class="beranda">
    <nav class="navbar">
      <RouterLink to="/" class="nav-brand">🛒 ItahBangkuang</RouterLink>
      <div class="nav-links">
        <RouterLink to="/produk">Semua Produk</RouterLink>
        <template v-if="!authStore.user">
          <RouterLink to="/login" class="btn-nav-outline">Masuk</RouterLink>
          <RouterLink to="/register" class="btn-nav-solid">Daftar</RouterLink>
        </template>
        <template v-else>
          <RouterLink v-if="authStore.role === 'penjual'" to="/toko/dashboard" class="btn-nav-outline">
            Dashboard Toko
          </RouterLink>
          <RouterLink v-else-if="authStore.role === 'admin'" to="/admin/dashboard" class="btn-nav-outline">
            Panel Admin
          </RouterLink>
          <template v-else>
            <RouterLink to="/riwayat" class="btn-nav-outline">Pesanan Saya</RouterLink>
          </template>
          <button class="btn-nav-outline" @click="authStore.logout(router)">Keluar</button>
        </template>
      </div>
      <button class="hamburger" @click="menuOpen = !menuOpen">☰</button>
    </nav>

    <div class="mobile-menu" v-if="menuOpen">
      <RouterLink to="/produk" @click="menuOpen = false">Semua Produk</RouterLink>
      <template v-if="!authStore.user">
        <RouterLink to="/login" @click="menuOpen = false">Masuk</RouterLink>
        <RouterLink to="/register" @click="menuOpen = false">Daftar</RouterLink>
      </template>
      <template v-else>
        <RouterLink v-if="authStore.role === 'penjual'" to="/toko/dashboard" @click="menuOpen = false">
          Dashboard Toko
        </RouterLink>
        <RouterLink v-else-if="authStore.role === 'admin'" to="/admin/dashboard" @click="menuOpen = false">
          Panel Admin
        </RouterLink>
        <RouterLink v-else to="/riwayat" @click="menuOpen = false">Pesanan Saya</RouterLink>
        <button @click="authStore.logout(router)">Keluar</button>
      </template>
    </div>

    <slot />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router   = useRouter()
const authStore = useAuthStore()
const menuOpen = ref(false)
</script>

<style scoped>
.page {
  min-height: 100vh;
}
</style>
