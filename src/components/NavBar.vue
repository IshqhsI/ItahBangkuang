<template>
  <header class="bilah" :class="`bilah-${area}`">
    <div class="bilah-dalam wadah">
      <RouterLink to="/" class="merek" aria-label="ItahBangkuang — Beranda">
        <span class="merek-tanda" aria-hidden="true"><Store :size="16" :stroke-width="2.25" /></span>
        <span class="merek-teks">
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
          <RouterLink to="/register" class="tombol tombol-kecil tombol-merah">Daftar</RouterLink>
        </template>
        <template v-else>
          <RouterLink
            v-if="tautanPeran"
            :to="tautanPeran.to"
            class="tombol tombol-kecil aksi-peran"
          >
            <component :is="tautanPeran.icon" :size="18" :stroke-width="2" />
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
  toast.success('Anda telah keluar.');
};
</script>

<style scoped>
.bilah {
  position: fixed;
  inset: 0 0 auto;
  z-index: 100;
  height: var(--nav-h);
  background: rgba(244, 246, 242, 0.88);
  backdrop-filter: blur(14px) saturate(1.2);
  -webkit-backdrop-filter: blur(14px) saturate(1.2);
  border-bottom: 1px solid var(--sage-2);
  color: var(--ink);
}
.bilah-dalam {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

/* Merek: lengkung hijau + nama */
.merek {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  flex-shrink: 0;
}
.merek-tanda {
  display: grid;
  place-items: center;
  width: 30px;
  height: 36px;
  background: var(--sungai);
  color: #fff;
  border-radius: 999px 999px 9px 9px;
  transition: transform 0.4s var(--ease-out);
}
.merek:hover .merek-tanda {
  transform: translateY(-2px);
}
.merek-teks {
  font-family: var(--font-papan);
  font-weight: 700;
  font-size: 1.3rem;
  letter-spacing: -0.015em;
  line-height: 1;
}
.merek-itah {
  color: var(--sungai-sedang);
}
.merek-bangkuang {
  color: var(--sungai-dalam);
}
.merek-area {
  padding: 0.22rem 0.7rem;
  background: var(--sage);
  border-radius: 999px;
  color: var(--sungai);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}
.bilah-admin .merek-area {
  background: var(--langit-muda);
  color: var(--biru-tua);
}

/* Tautan desktop */
.tautan {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  margin-left: 0.5rem;
}
.tautan a {
  padding: 0.55rem 1rem;
  color: var(--ink-2);
  font-weight: 600;
  font-size: 0.97rem;
  text-decoration: none;
  border-radius: 999px;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}
.tautan a:hover {
  background: var(--sage);
  color: var(--sungai);
}
.tautan a.router-link-exact-active,
.tautan a.router-link-active {
  background: var(--sage);
  color: var(--sungai);
  font-weight: 700;
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
  --t-bg-hover: var(--sage);
  --t-fg: var(--sungai);
}
.aksi-peran {
  --t-bg: var(--sage);
  --t-bg-hover: var(--sage-2);
  --t-fg: var(--sungai);
  border-color: transparent;
}

.tombol-menu {
  display: none;
  margin-left: auto;
  width: 46px;
  height: 46px;
  align-items: center;
  justify-content: center;
  background: #fff;
  color: var(--sungai);
  border: 1.5px solid var(--sage-2);
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.tombol-menu:hover {
  background: var(--sage);
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
  background: rgba(22, 40, 35, 0.4);
  backdrop-filter: blur(3px);
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
  background: var(--kabut);
  border-radius: 28px 0 0 28px;
  box-shadow: -16px 0 48px rgba(29, 42, 38, 0.2);
  padding: 1.4rem 1rem 1.25rem;
  overflow-y: auto;
}
.laci-judul {
  font-family: var(--font-papan);
  font-weight: 700;
  font-size: 1.5rem;
  color: var(--sungai);
  padding: 0.25rem 0.6rem 1rem;
  margin-bottom: 0.6rem;
  border-bottom: 1px solid var(--sage-2);
}
.laci-tautan {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.laci-tautan a {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-height: 54px;
  padding: 0 0.9rem;
  color: var(--ink);
  font-weight: 600;
  font-size: 1.05rem;
  text-decoration: none;
  border-radius: 16px;
  transition: background-color 0.2s ease;
}
.laci-tautan a svg {
  color: var(--ink-2);
}
.laci-tautan a:hover {
  background: var(--sage);
}
.laci-tautan a.router-link-exact-active {
  background: var(--sage);
  color: var(--sungai);
  font-weight: 700;
}
.laci-tautan a.router-link-exact-active svg {
  color: var(--sungai);
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
  transition: transform 0.35s var(--ease-out);
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
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border-top: 1px solid var(--sage-2);
    border-radius: 22px 22px 0 0;
    box-shadow: 0 -8px 28px rgba(29, 42, 38, 0.08);
    padding-bottom: env(safe-area-inset-bottom);
  }
  .tab-bawah a {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.2rem;
    min-height: 64px;
    color: var(--ink-2);
    font-size: 0.76rem;
    font-weight: 700;
    text-decoration: none;
  }
  .tab-bawah a.router-link-active {
    color: var(--sungai);
  }
  .tab-bawah a.router-link-active::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    width: 28px;
    height: 3px;
    transform: translateX(-50%);
    background: var(--sungai);
    border-radius: 0 0 3px 3px;
  }
}
</style>
