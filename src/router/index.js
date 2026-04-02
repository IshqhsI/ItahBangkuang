import { createRouter, createWebHistory } from 'vue-router';
import { supabase } from '@/lib/supabase';

const routes = [
  // Public Access
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/public/Beranda.vue'),
  },
  {
    path: '/produk',
    name: 'Produk',
    component: () => import('@/pages/public/BrowseProduk.vue'),
  },
  {
    path: '/produk/:id',
    name: 'DetailProduk',
    component: () => import('@/pages/public/DetailProduk.vue'),
  },
  {
    path: '/toko/:id',
    name: 'ProfilTokoPublic',
    component: () => import('@/pages/public/ProfilToko.vue'),
  },

  // Auth
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/auth/Login.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/pages/auth/Register.vue'),
  },

  // Pembeli
  {
    path: '/pesan/:id',
    name: 'Pesan',
    component: () => import('@/pages/pembeli/FormOrder.vue'),
  },
  {
    path: '/riwayat',
    name: 'RiwayatOrder',
    component: () => import('@/pages/pembeli/RiwayatOrder.vue'),
  },

  // Penjual
  {
    path: '/toko/dashboard',
    name: 'Dashboard',
    component: () => import('@/pages/penjual/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/toko/produk',
    name: 'KelolaProduk',
    component: () => import('@/pages/penjual/KelolaProduk.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/toko/produk/tambah',
    name: 'TambahProduk',
    component: () => import('@/pages/penjual/FormProduk.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/toko/produk/:id/edit',
    name: 'EditProduk',
    component: () => import('@/pages/penjual/FormProduk.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/toko/order',
    name: 'OrderMasuk',
    component: () => import('@/pages/penjual/KelolaOrder.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/toko/profil',
    name: 'ProfilToko',
    component: () => import('@/pages/penjual/ProfilToko.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/toko/profil/edit',
    name: 'ProfilTokoEdit',
    component: () => import('@/pages/penjual/EditProfil.vue'),
    meta: { requiresAuth: true },
  },

  // Admin
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('@/pages/admin/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guard
router.beforeEach(async (to) => {
  if (to.meta.requiresAuth) {

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return '/login';

    
    if (to.meta.role) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role !== to.meta.role) return '/';
    }
  }
});

export default router;
