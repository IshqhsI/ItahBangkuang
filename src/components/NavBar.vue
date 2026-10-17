<template>
  <header class="bilah" :class="`bilah-${area}`">
    <div class="bilah-dalam wadah">
      <RouterLink to="/" class="merek" aria-label="ItahBangkuang — Beranda">
        <span class="merek-papan">
          <span class="merek-itah">Itah</span><span class="merek-bangkuang">Bangkuang</span>
        </span>
        <span v-if="area !== 'publik'" class="merek-area">{{ judulArea }}</span>
      </RouterLink>

      <nav class="tautan" aria-label="Navigasi utama">
        <RouterLink v-for="t in tautan" :key="t.to" :to="t.to">
          {{ t.label }}
        </RouterLink>
      </nav>

      <div class="aksi">
        <template v-if="!authStore.user">
          <RouterLink to="/login" class="tombol tombol-kecil aksi-masuk">Masuk</RouterLink>
          <RouterLink to="/register" class="tombol tombol-kecil tombol-kuning">Daftar</RouterLink>
        </template>
        <template v-else>
          <RouterLink
            v-if="tautanPeran"
            :to="tautanPeran.to"
            class="tombol tombol-kecil tombol-kuning aksi-peran"
          >
            <component :is="tautanPeran.icon" :size="18" :stroke-width="2.25" />
            {{ tautanPeran.label }}
          </RouterLink>
          <button class="tombol tombol-kecil aksi-keluar" @click="handleLogout">
            <LogOut :size="18" :stroke-width="2.25" />
            <span>Keluar</span>
          </button>
        </template>
      </div>

      <button
        class="tombol-menu"
        :aria-expanded="menuOpen"
        aria-controls="menu-hp"
        :aria-label="menuOpen ? 'Tutup menu' : 'Buka menu'"
        @click="menuOpen = !menuOpen"
      >
        <X v-if="menuOpen" :size="26" :stroke-width="2.5" />
        <Menu v-else :size="26" :stroke-width="2.5" />
      </button>
    </div>
  </header>

  <!-- MENU HP -->
  <Transition name="fade">
    <div v-if="menuOpen" class="tirai" @click="menuOpen = false"></div>
  </Transition>
  <Transition name="laci">
    <div v-if="menuOpen" id="menu-hp" class="laci" role="dialog" aria-label="Menu">
      <p class="laci-judul">{{ judulArea }}</p>
      <nav class="laci-tautan">
        <RouterLink v-for="t in tautanLengkap" :key="t.to" :to="t.to">
          <component :is="t.icon" :size="22" :stroke-width="2.25" />
          {{ t.label }}
        </RouterLink>
      </nav>
      <div class="laci-kaki">
        <PasangAplikasi class="laci-pasang" kelas="tombol-kuning tombol-penuh" />
        <template v-if="!authStore.user">
          <RouterLink to="/login" class="tombol tombol-penuh">Masuk</RouterLink>
          <RouterLink to="/register" class="tombol tombol-merah tombol-penuh">Daftar Akun</RouterLink>
        </template>
        <button v-else class="tombol tombol-bahaya tombol-penuh" @click="handleLogout">
          <LogOut :size="20" :stroke-width="2.25" />
          Keluar
        </button>
      </div>
    </div>
  </Transition>

  <!-- TAB BAWAH PENJUAL (HP) -->
  <nav
    v-if="area === 'toko' && authStore.statusToko === 'AKTIF'"
    class="tab-bawah"
    aria-label="Menu toko"
  >
    <RouterLink v-for="t in tabToko" :key="t.to" :to="t.to">
      <component :is="t.icon" :size="22" :stroke-width="2.25" />
      <span>{{ t.label }}</span>
    </RouterLink>
  </nav>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import PasangAplikasi from '@/components/PasangAplikasi.vue';
import {
  Menu,
  X,
  LogOut,
  Store,
  ShoppingBasket,
  BookOpen,
  ReceiptText,
  LayoutDashboard,
  Package,
  ClipboardList,
  UserRound,
  Shield,
  Users,
  House,
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const toast = useToastStore();
const menuOpen = ref(false);

// Area ditentukan dari rute + peran (reaktif)
const RUTE_TOKO = /^\/toko\/(dashboard|produk|order|profil)(\/|$)/;
const area = computed(() => {
  if (route.path.startsWith('/admin')) return 'admin';
  if (authStore.role === 'penjual' && RUTE_TOKO.test(route.path)) return 'toko';
  return 'publik';
});

const judulArea = computed(
  () => ({ admin: 'Panel Admin', toko: 'Toko Saya', publik: 'Menu' })[area.value],
);

const tautanAdmin = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/toko', label: 'Kelola Toko', icon: Store },
  { to: '/admin/produk', label: 'Kelola Produk', icon: Package },
  { to: '/admin/users', label: 'Kelola Pengguna', icon: Users },
];

const tabToko = [
  { to: '/toko/dashboard', label: 'Ringkasan', icon: LayoutDashboard },
  { to: '/toko/produk', label: 'Produk', icon: Package },
  { to: '/toko/order', label: 'Pesanan', icon: ClipboardList },
  { to: '/toko/profil', label: 'Profil', icon: UserRound },
];

const tautanToko = computed(() => {
  const list = [];
  if (authStore.statusToko === 'AKTIF') list.push(...tabToko.slice(0, 3));
  list.push(tabToko[3]);
  if (authStore.tokoId)
    list.push({ to: `/toko/${authStore.tokoId}`, label: 'Lihat Toko', icon: Store });
  return list;
});

const tautanPublik = [
  { to: '/produk', label: 'Semua Produk', icon: ShoppingBasket },
  { to: '/tutorial', label: 'Cara Pakai', icon: BookOpen },
];

const tautan = computed(() => {
  if (area.value === 'admin') return tautanAdmin;
  if (area.value === 'toko') return tautanToko.value;
  return tautanPublik;
});

// Tombol pintas sesuai peran (hanya di area publik)
const tautanPeran = computed(() => {
  if (area.value !== 'publik') {
    return { to: '/', label: 'Beranda', icon: House };
  }
  if (authStore.role === 'penjual')
    return { to: '/toko/dashboard', label: 'Toko Saya', icon: Store };
  if (authStore.role === 'admin')
    return { to: '/admin/dashboard', label: 'Panel Admin', icon: Shield };
  return { to: '/riwayat', label: 'Pesanan Saya', icon: ReceiptText };
});

const tautanLengkap = computed(() => {
  const list = [{ to: '/', label: 'Beranda', icon: House }, ...tautan.value];
  if (area.value === 'publik') {
    if (!authStore.user) {
      return list;
    }
    if (tautanPeran.value) list.push(tautanPeran.value);
  }
  return list.filter((t, i, arr) => arr.findIndex((x) => x.to === t.to) === i);
});

watch(menuOpen, (val) => {
  document.body.style.overflow = val ? 'hidden' : '';
});
watch(
  () => route.path,
  () => {
    menuOpen.value = false;
  },
);

const tutupDenganEsc = (e) => {
  if (e.key === 'Escape') menuOpen.value = false;
};
const handleResize = () => {
  if (window.innerWidth > 900 && menuOpen.value) menuOpen.value = false;
};
onMounted(() => {
  window.addEventListener('resize', handleResize);
  window.addEventListener('keydown', tutupDenganEsc);
});
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('keydown', tutupDenganEsc);
  document.body.style.overflow = '';
});

const handleLogout = () => {
  menuOpen.value = false;
  authStore.logout(router);
  toast.success('Sudah keluar. Sampai ketemu lagi!');
};
</script>

<style scoped>
.bilah {
  --bilah-bg: var(--merah);
  --bilah-list: var(--kuning);
  position: fixed;
  inset: 0 0 auto;
  z-index: 100;
  height: var(--nav-h);
  background: var(--bilah-bg);
  border-bottom: 3px solid var(--tinta);
  box-shadow: inset 0 -5px 0 var(--bilah-list);
  color: #fff;
}
.bilah-toko {
  --bilah-bg: var(--hijau);
}
.bilah-admin {
  --bilah-bg: var(--biru);
  --bilah-list: #fff;
}

.bilah-dalam {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding-bottom: 5px;
}

/* Papan merek */
.merek {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  flex-shrink: 0;
}
.merek-papan {
  display: inline-flex;
  align-items: baseline;
  padding: 0.3rem 0.55rem 0.25rem;
  background: var(--kuning);
  border: var(--tebal) solid var(--garis);
  border-radius: 6px;
  font-family: var(--font-papan);
  font-size: 1.05rem;
  line-height: 1;
  transform: rotate(-1.5deg);
  transform-origin: left center;
  transition: transform 0.4s var(--ease-out);
}
.merek:hover .merek-papan {
  transform: rotate(0deg);
}
.merek-itah {
  color: var(--merah);
}
.merek-bangkuang {
  color: var(--tinta);
}
.merek-area {
  font-weight: 700;
  font-size: 0.9rem;
  color: #fff;
  opacity: 0.92;
}

/* Tautan desktop */
.tautan {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: 0.5rem;
}
.tautan a {
  position: relative;
  padding: 0.55rem 0.7rem;
  color: #fff;
  font-weight: 700;
  font-size: 0.97rem;
  text-decoration: none;
  border-radius: 6px;
  transition: background-color 0.15s ease;
}
.tautan a:hover {
  background: rgba(0, 0, 0, 0.16);
}
.tautan a.router-link-exact-active::after,
.tautan a.router-link-active::after {
  content: '';
  position: absolute;
  left: 0.7rem;
  right: 0.7rem;
  bottom: 0.15rem;
  height: 4px;
  background: var(--bilah-list);
  border-radius: 2px;
}

.aksi {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.aksi-masuk,
.aksi-keluar {
  --t-bg: transparent;
  --t-bg-hover: rgba(0, 0, 0, 0.18);
  --t-fg: #fff;
  border-color: #fff;
}

.tombol-menu {
  display: none;
  margin-left: auto;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  background: var(--kuning);
  color: var(--tinta);
  border: var(--tebal) solid var(--garis);
  border-radius: 8px;
  cursor: pointer;
}

@media (max-width: 900px) {
  .tautan,
  .aksi {
    display: none;
  }
  .tombol-menu {
    display: inline-flex;
  }
}

/* Laci menu HP */
.tirai {
  position: fixed;
  inset: 0;
  z-index: 150;
  background: rgba(20, 20, 20, 0.5);
}
.laci {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 160;
  width: min(86vw, 340px);
  display: flex;
  flex-direction: column;
  background: var(--papan);
  box-shadow: -3px 0 0 var(--tinta);
  padding: 1.25rem 1rem 1.25rem;
  overflow-y: auto;
}
.laci-judul {
  font-family: var(--font-papan);
  font-size: 1.2rem;
  padding: 0.25rem 0.5rem 1rem;
  border-bottom: var(--tebal) solid var(--garis);
  margin-bottom: 0.5rem;
}
.laci-tautan {
  display: flex;
  flex-direction: column;
}
.laci-tautan a {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-height: 56px;
  padding: 0 0.6rem;
  color: var(--tinta);
  font-weight: 700;
  font-size: 1.08rem;
  text-decoration: none;
  border-bottom: 1px solid var(--garis-lembut);
}
.laci-tautan a.router-link-exact-active {
  color: var(--merah);
}
.laci-tautan a.router-link-exact-active svg {
  color: var(--merah);
}
.laci-kaki {
  margin-top: auto;
  padding-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.laci-pasang :deep(.tombol) {
  width: 100%;
}

.laci-enter-active,
.laci-leave-active {
  transition: transform 0.32s var(--ease-out);
}
.laci-enter-from,
.laci-leave-to {
  transform: translateX(100%);
}

/* Tab bawah penjual */
.tab-bawah {
  display: none;
}
@media (max-width: 900px) {
  .tab-bawah {
    position: fixed;
    inset: auto 0 0;
    z-index: 90;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    background: var(--papan);
    border-top: 3px solid var(--tinta);
    padding-bottom: env(safe-area-inset-bottom);
  }
  .tab-bawah a {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.15rem;
    min-height: 62px;
    color: var(--tinta-3);
    font-size: 0.78rem;
    font-weight: 700;
    text-decoration: none;
  }
  .tab-bawah a.router-link-active {
    color: var(--hijau);
    box-shadow: inset 0 4px 0 var(--hijau);
  }
}
</style>
