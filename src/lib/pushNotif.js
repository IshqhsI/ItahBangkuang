import { supabase } from '@/lib/supabase';

const KUNCI_PUBLIK = import.meta.env.VITE_VAPID_PUBLIC_KEY;

const keBytes = (base64Url) => {
  const isi = (base64Url + '='.repeat((4 - (base64Url.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(isi), (c) => c.charCodeAt(0));
};

export const pushDidukung = () =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

/** 'belum-dikonfigurasi' | 'tidak-didukung' | 'ditolak' | 'belum' | 'aktif' */
export async function statusPush() {
  if (!KUNCI_PUBLIK) return 'belum-dikonfigurasi';
  if (!pushDidukung()) return 'tidak-didukung';
  if (Notification.permission === 'denied') return 'ditolak';
  const reg = await navigator.serviceWorker.ready;
  const langganan = await reg.pushManager.getSubscription();
  return langganan ? 'aktif' : 'belum';
}

/** Meminta izin, berlangganan, lalu menyimpan alamat langganan milik pengguna. */
export async function aktifkanPush(userId) {
  const izin = await Notification.requestPermission();
  if (izin !== 'granted') return { ok: false, alasan: 'izin' };

  const reg = await navigator.serviceWorker.ready;
  let langganan = await reg.pushManager.getSubscription();
  if (!langganan) {
    langganan = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: keBytes(KUNCI_PUBLIK),
    });
  }

  const j = langganan.toJSON();
  const { error } = await supabase.from('push_langganan').insert({
    user_id: userId,
    endpoint: j.endpoint,
    p256dh: j.keys.p256dh,
    auth: j.keys.auth,
    user_agent: navigator.userAgent.slice(0, 200),
  });

  // 23505 = alamat itu sudah tersimpan sebelumnya; itu bukan galat
  if (error && error.code !== '23505') {
    await langganan.unsubscribe().catch(() => {});
    return { ok: false, alasan: 'simpan' };
  }
  return { ok: true };
}

export async function matikanPush() {
  const reg = await navigator.serviceWorker.ready;
  const langganan = await reg.pushManager.getSubscription();
  if (!langganan) return;
  await supabase.from('push_langganan').delete().eq('endpoint', langganan.endpoint);
  await langganan.unsubscribe();
}
