import { defineStore } from 'pinia';
import { ref } from 'vue';
import { supabase } from '@/lib/supabase';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const role = ref(null);
  const tokoId = ref(null); // Tambah state tokoId
  const statusToko = ref(null); // Tambah state statusToko
  const ready = ref(false);
  let authListener = null;

  // 1. Ambil Role dari Profile
  const fetchRole = async (userId) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      role.value = profile?.role ?? null;

      // Jika dia penjual, langsung tarik data tokonya
      if (role.value === 'penjual') {
        await fetchToko(userId);
      }
    } catch (e) {
      role.value = null;
    }
  };

  // 2. Ambil Data Toko (PENTING untuk Navbar)
  const fetchToko = async (userId) => {
    try {
      const { data: toko } = await supabase
        .from('toko')
        .select('id, status')
        .eq('user_id', userId)
        .single();

      if (toko) {
        tokoId.value = toko.id;
        statusToko.value = toko.status; // Misalnya: 'AKTIF', 'PENDING', atau 'DITOLAK'
      }
    } catch (e) {
      tokoId.value = null;
      statusToko.value = null;
    }
  };

  const init = async () => {
    if (authListener) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      user.value = session.user;
      await fetchRole(session.user.id);
    }
    ready.value = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        user.value = session.user;
        await fetchRole(session.user.id);
      } else {
        resetState();
      }
    });

    authListener = subscription;
  };

  const resetState = () => {
    user.value = null;
    role.value = null;
    tokoId.value = null;
    statusToko.value = null;
  };

  const logout = async (router) => {
    await supabase.auth.signOut();
    resetState();
    if (router) router.push('/');
  };

  return { user, role, tokoId, statusToko, ready, init, logout };
});
