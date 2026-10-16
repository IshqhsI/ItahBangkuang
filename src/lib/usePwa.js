// Status pemasangan & koneksi untuk PWA.
import { ref, computed, onMounted, onUnmounted } from 'vue';

// Dipasang di level modul: event ini hanya terbit sekali, sebelum komponen mana pun mungkin sudah dirender
const promptTertunda = ref(null);
const sudahTerpasang = ref(false);
const sinyalPernahTerbit = ref(false);

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    promptTertunda.value = e;
    sinyalPernahTerbit.value = true;
  });
  window.addEventListener('appinstalled', () => {
    sudahTerpasang.value = true;
    promptTertunda.value = null;
  });
}

// Untuk panel diagnosis (?pwa=debug)
export const statusSinyalPasang = { sinyalPernahTerbit, promptTertunda, sudahTerpasang };

const modeStandalone = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true);

// Kenali perangkat untuk memilih petunjuk pemasangan yang tepat
export const kenaliPerangkat = () => {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const iOS = /iphone|ipad|ipod/i.test(ua);
  const android = /android/i.test(ua);
  // Browser di dalam aplikasi (Facebook, Instagram, WebView Android) tidak bisa memasang PWA
  const dalamAplikasi = /FBAN|FBAV|Instagram|Line\/|; wv\)|WhatsApp/i.test(ua);
  const safariIOS = iOS && /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
  const samsung = /SamsungBrowser/i.test(ua);
  const firefox = /firefox|fxios/i.test(ua);
  if (iOS) return safariIOS && !dalamAplikasi ? 'ios-safari' : 'ios-lain';
  if (android) {
    if (dalamAplikasi) return 'android-aplikasi';
    if (samsung) return 'android-samsung';
    if (firefox) return 'android-firefox';
    return 'android-chrome';
  }
  return 'desktop';
};

export function usePasangAplikasi() {
  const standalone = ref(modeStandalone());
  const perangkat = kenaliPerangkat();

  // Sembunyikan hanya kalau aplikasi sedang dibuka dari layar utama
  const tampil = computed(() => !standalone.value && !sudahTerpasang.value);
  const bisaLangsung = computed(() => !!promptTertunda.value);

  const pasangLangsung = async () => {
    const p = promptTertunda.value;
    if (!p) return false;
    p.prompt();
    await p.userChoice;
    promptTertunda.value = null;
    return true;
  };

  return { tampil, bisaLangsung, perangkat, pasangLangsung };
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
