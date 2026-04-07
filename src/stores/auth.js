import { defineStore } from 'pinia';
import { ref } from 'vue';
import { supabase } from '@/lib/supabase';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const role = ref(null);
  const tokoId = ref(null);
  const statusToko = ref(null);
  const ready = ref(false);
  let authListener = null;
  let visibilityHandler = null; // FIX: simpan referensi handler supaya bisa di-cleanup

  const fetchRole = async (userId) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      role.value = profile?.role ?? null;

      if (role.value === 'penjual') {
        await fetchToko(userId);
      }
    } catch (e) {
      role.value = null;
    }
  };

  const fetchToko = async (userId) => {
    try {
      const { data: toko } = await supabase
        .from('toko')
        .select('id, status')
        .eq('user_id', userId)
        .single();

      if (toko) {
        tokoId.value = toko.id;
        statusToko.value = toko.status;
      }
    } catch (e) {
      tokoId.value = null;
      statusToko.value = null;
    }
  };

  const refreshSessionIfNeeded = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      // Jika ada error network saat wake up, jangan langsung reset state
      if (error) {
        console.warn('Gagal ambil session saat wake up (network error?)');
        return;
      }

      if (session) {
        user.value = session.user;
        if (!role.value) await fetchRole(session.user.id);
      }
    } catch (e) {
      console.error('Session refresh error:', e);
    }
  };

  const init = async () => {
    if (authListener || visibilityHandler) return;

    // 1. Ambil session awal
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      user.value = session.user;
      await fetchRole(session.user.id);
    }
    ready.value = true;

    // 2. Listener Auth (Satu-satunya tempat untuk resetState)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // console.log('Auth Event:', event);
      // console.log('Session di Auth Listener:', session);

      if (session) {
        user.value = session.user;
        fetchRole(session.user.id)
          .then(() => {
            // console.log('User updated via auth listener:', user.value);
          })
          .catch((err) => console.error('Gagal fetch role saat wake up:', err));
      } else if (event === 'SIGNED_OUT') {
        resetState();
      }
    });
    authListener = subscription;

    // 3. Fix Visibility Handler (Cek apakah masih ada user sebelum refresh)
    visibilityHandler = () => {
      if (document.visibilityState === 'visible' && !user.value) {
        console.log('Tab aktif & user kosong, mencoba refresh...');
        refreshSessionIfNeeded();
      }
    };
    document.addEventListener('visibilitychange', visibilityHandler);
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

    // Cleanup listener saat logout
    if (visibilityHandler) {
      document.removeEventListener('visibilitychange', visibilityHandler);
      visibilityHandler = null;
    }
    if (authListener) {
      authListener.unsubscribe();
      authListener = null;
    }

    if (router) router.push('/');
  };

  return { user, role, tokoId, statusToko, ready, init, logout };
});
