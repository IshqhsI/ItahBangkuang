<template>
  <nav
    class="navbar"
    :class="{ 'nav-admin': isAdminArea, 'nav-toko': isTokoArea }"
  >
    <div class="nav-container">
      <!-- LOGO -->
      <RouterLink to="/" class="nav-brand" @click="menuOpen = false">
        🛒 ItahBangkuang
      </RouterLink>

      <!-- DESKTOP MENU -->
      <div class="nav-links">
        <!-- 1. AREA ADMIN -->
        <template v-if="isAdminArea">
          <RouterLink to="/admin/dashboard">Dashboard</RouterLink>
          <RouterLink to="/admin/toko">Kelola Toko</RouterLink>
          <RouterLink to="/admin/produk">Kelola Produk</RouterLink>
          <RouterLink to="/admin/users">Kelola Users</RouterLink>
        </template>

        <!-- 2. AREA TOKO (PENJUAL) -->
        <template v-else-if="isTokoArea">
          <RouterLink :to="`/toko/${authStore.tokoId}`">Lihat Toko</RouterLink>
          <template v-if="authStore.statusToko === 'AKTIF'">
            <RouterLink to="/toko/dashboard">Dashboard</RouterLink>
            <RouterLink to="/toko/produk">Produk Saya</RouterLink>
            <RouterLink to="/toko/order">Order Masuk</RouterLink>
          </template>
          <RouterLink to="/toko/profil">Profil Toko</RouterLink>
        </template>

        <!-- 3. AREA PUBLIK (PEMBELI) -->
        <template v-else>
          <RouterLink to="/produk">Semua Produk</RouterLink>
          <template v-if="!authStore.user">
            <RouterLink to="/login" class="btn-nav-outline">Masuk</RouterLink>
            <RouterLink to="/register" class="btn-nav-solid">Daftar</RouterLink>
          </template>
          <template v-else>
            <RouterLink
              v-if="authStore.role === 'penjual'"
              to="/toko/dashboard"
              class="btn-nav-outline"
              >Dashboard Toko</RouterLink
            >
            <RouterLink
              v-else-if="authStore.role === 'admin'"
              to="/admin/dashboard"
              class="btn-nav-outline"
              >Panel Admin</RouterLink
            >
            <RouterLink v-else to="/riwayat" class="btn-nav-outline"
              >Pesanan Saya</RouterLink
            >
          </template>
        </template>

        <!-- Tombol Logout (Jika Login) -->
        <button
          v-if="authStore.user"
          class="btn-logout-desktop"
          @click="handleLogout"
        >
          Logout
        </button>
      </div>

      <!-- HAMBURGER (Mobile Only) -->
      <button
        class="hamburger"
        @click="menuOpen = !menuOpen"
        :aria-label="menuOpen ? 'Tutup menu' : 'Buka menu'"
      >
        <span class="hamburger-icon">{{ menuOpen ? '✕' : '☰' }}</span>
      </button>
    </div>

    <!-- MOBILE OVERLAY (Darkens background) -->
    <Transition name="fade">
      <div v-if="menuOpen" class="menu-overlay" @click="menuOpen = false"></div>
    </Transition>

    <!-- MOBILE MENU SIDEBAR -->
    <Transition name="slide">
      <div class="mobile-menu" v-if="menuOpen">
        <p class="menu-label">{{ menuTitle }}</p>

        <div class="mobile-links">
          <!-- Area Admin Mobile -->
          <template v-if="isAdminArea">
            <RouterLink to="/admin/dashboard">Dashboard</RouterLink>
            <RouterLink to="/admin/toko">Kelola Toko</RouterLink>
            <RouterLink to="/admin/produk">Produk</RouterLink>
            <RouterLink to="/admin/users">Users</RouterLink>
          </template>

          <!-- Area Toko Mobile -->
          <template v-else-if="isTokoArea">
            <RouterLink :to="`/toko/${authStore.tokoId}`"
              >Lihat Toko</RouterLink
            >
            <template v-if="authStore.statusToko === 'AKTIF'">
              <RouterLink to="/toko/dashboard">Dashboard</RouterLink>
              <RouterLink to="/toko/produk">Produk Saya</RouterLink>
              <RouterLink to="/toko/order">Order Masuk</RouterLink>
            </template>
            <RouterLink to="/toko/profil">Profil Toko</RouterLink>
          </template>

          <!-- Area Publik Mobile -->
          <template v-else>
            <RouterLink to="/produk">Semua Produk</RouterLink>
            <template v-if="!authStore.user">
              <RouterLink to="/login">Masuk</RouterLink>
              <RouterLink to="/register">Daftar Akun</RouterLink>
            </template>
            <template v-else>
              <RouterLink
                v-if="authStore.role === 'penjual'"
                to="/toko/dashboard"
                >Dashboard Toko</RouterLink
              >
              <RouterLink
                v-else-if="authStore.role === 'admin'"
                to="/admin/dashboard"
                >Panel Admin</RouterLink
              >
              <RouterLink v-else to="/riwayat">Pesanan Saya</RouterLink>
            </template>
          </template>
        </div>

        <hr v-if="authStore.user" class="menu-divider" />
        <button
          v-if="authStore.user"
          class="btn-logout-mobile"
          @click="handleLogout"
        >
          Logout
        </button>
      </div>
    </Transition>
  </nav>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const menuOpen = ref(false);

// 1. Deteksi Area Secara Otomatis
const isAdminArea = computed(() => route.path.startsWith('/admin'));
const isTokoArea = computed(() => route.path.startsWith('/toko')) && authStore.role === 'penjual';

const menuTitle = computed(() => {
  if (isAdminArea.value) return 'Menu Admin';
  if (isTokoArea.value) return 'Menu Penjual';
  return 'Navigasi';
});

// 2. Logika Auto-Close & Clean Up
const handleResize = () => {
  if (window.innerWidth > 768 && menuOpen.value) {
    menuOpen.value = false;
  }
};

// 3. Kunci Scroll Body saat Menu Terbuka (UX Pro)
watch(menuOpen, (val) => {
  document.body.style.overflow = val ? 'hidden' : '';
});

// 4. Tutup menu setiap kali pindah halaman
watch(
  () => route.path,
  () => {
    menuOpen.value = false;
  },
);

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  document.body.style.overflow = '';
});

const handleLogout = () => {
  menuOpen.value = false;
  authStore.logout(router);
};
</script>

<style scoped>
.navbar {
  position: fixed;
  /* display: block; */
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: rgba(253, 250, 244, 0.98);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
  z-index: 1000;
  transition: border-color 0.3s;
  width: 100% !important;
}

/* Tema Warna Area khusus */
.nav-admin {
  border-bottom: 2px solid #ef4444;
} /* Merah untuk Admin */
.nav-toko {
  border-bottom: 2px solid var(--brand);
} /* Hijau untuk Penjual */

.nav-container {
  /* max-width: 1200px; */
  margin: 0 auto;
  height: 100%;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between !important;
  width: 85%;
}

.nav-brand {
  font-family: var(--font-serif);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--brand);
  text-decoration: none;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.nav-links a {
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: var(--brand);
}

/* Hamburger */
.hamburger {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--brand);
  padding: 0.5rem;
}

/* Mobile Menu & Overlay */
.menu-overlay {
  position: fixed;
  top: 64px;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  z-index: 998;
}

.mobile-menu {
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  background: white;
  padding: 1.5rem 2rem;
  z-index: 999;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  max-height: calc(100vh - 64px);
  overflow-y: auto;
}

.mobile-links {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mobile-links a {
  text-decoration: none;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 500;
  padding: 0.5rem 0;
}

.menu-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-muted);
  font-weight: 800;
}

.btn-logout-desktop {
  background: none;
  border: 2px solid #dc2626;
  color: #dc2626;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.45rem 1rem;
  border-radius: 8px;
  margin-left: 1.5rem;
}

.btn-logout-desktop:hover {
  background: #dc2626;
  color: white;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.btn-logout-mobile {
  background: #dc2626;
  border: none;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  width: 100%;
}

.btn-logout-mobile:hover {
  background: #b91c1c;
  transition: background-color 0.2s;
}

.menu-divider {
  border: 0;
  border-top: 1px solid var(--border);
  margin: 0.5rem 0;
}

@media (max-width: 768px) {
  .navbar {
    width: 100%;
    padding: 0 1rem;
  }

  .nav-container {
    justify-content: space-between !important;
    width: 100%;
    padding: 0;
  }

  .nav-links {
    display: none;
  }
  .hamburger {
    display: block;
  }
}

/* Animations */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
