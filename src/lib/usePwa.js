// Status pemasangan & koneksi untuk PWA.
import { ref, computed, onMounted, onUnmounted } from 'vue';

// Dipasang di level modul: event ini hanya terbit sekali, sebelum komponen mana pun mungkin sudah dirender
const promptTertunda = ref(null);
const sudahTerpasang = ref(false);

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    promptTertunda.value = e;
  });
  window.addEventListener('appinstalled', () => {
    sudahTerpasang.value = true;
    promptTertunda.value = null;
  });
}

const modeStandalone = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true);

export function usePasangAplikasi() {
  const standalone = ref(modeStandalone());

  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const iOS = /iphone|ipad|ipod/i.test(ua);
  const safariIOS = iOS && /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);

  const bisaPasang = computed(() => !!promptTertunda.value && !standalone.value && !sudahTerpasang.value);
  // iPhone tidak punya tombol pasang otomatis; pengguna harus lewat menu Bagikan
  const petunjukIOS = computed(() => safariIOS && !standalone.value && !sudahTerpasang.value);

  const pasang = async () => {
    const p = promptTertunda.value;
    if (!p) return;
    p.prompt();
    await p.userChoice;
    promptTertunda.value = null;
  };

  return { bisaPasang, petunjukIOS, pasang };
}

export function useOnline() {
  const online = ref(typeof navigator === 'undefined' ? true : navigator.onLine);
  const naik = () => (online.value = true);
  const turun = () => (online.value = false);
  onMounted(() => {
    window.addEventListener('online', naik);
    window.addEventListener('offline', turun);
  });
  onUnmounted(() => {
    window.removeEventListener('online', naik);
    window.removeEventListener('offline', turun);
  });
  return online;
}
