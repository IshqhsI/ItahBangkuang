<template>
  <aside class="diagnosis" aria-label="Diagnosis pemasangan">
    <div class="diagnosis-kepala">
      <strong>Diagnosis pasang di HP</strong>
      <button type="button" class="tutup" aria-label="Tutup diagnosis" @click="$emit('tutup')">×</button>
    </div>

    <ul class="daftar">
      <li v-for="c in cek" :key="c.nama" :class="c.ok === true ? 'ok' : c.ok === false ? 'gagal' : 'tunggu'">
        <span class="tanda" aria-hidden="true">{{ c.ok === true ? '✓' : c.ok === false ? '✕' : '…' }}</span>
        <span>
          <strong>{{ c.nama }}</strong>
          <small>{{ c.ket }}</small>
        </span>
      </li>
    </ul>

    <p class="kesimpulan" :class="siap ? 'ok' : 'gagal'">{{ kesimpulan }}</p>
    <p class="ua">{{ ua }}</p>
    <button type="button" class="muat" @click="periksa">Periksa ulang</button>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { statusSinyalPasang, kenaliPerangkat } from '@/lib/usePwa';

defineEmits(['tutup']);

const { sinyalPernahTerbit, promptTertunda, sudahTerpasang } = statusSinyalPasang;

const perangkat = kenaliPerangkat();
const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';

const hasil = ref({
  https: null,
  manifest: null,
  ikon: null,
  sw: null,
  swKontrol: null,
});

const standalone =
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
const dalamAplikasi = perangkat === 'android-aplikasi' || perangkat === 'ios-lain';

const periksa = async () => {
  hasil.value.https = window.isSecureContext;

  try {
    const link = document.querySelector('link[rel="manifest"]');
    if (!link) throw new Error('tidak ada tautan manifest');
    const res = await fetch(link.href, { cache: 'no-store' });
    const m = await res.json();
    hasil.value.manifest = !!(m.name && m.start_url && ['standalone', 'fullscreen', 'minimal-ui'].includes(m.display));
    const ukuran = (m.icons ?? []).map((i) => i.sizes);
    hasil.value.ikon = ukuran.includes('192x192') && ukuran.includes('512x512');
  } catch {
    hasil.value.manifest = false;
    hasil.value.ikon = false;
  }

  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    hasil.value.sw = !!reg?.active;
    hasil.value.swKontrol = !!navigator.serviceWorker?.controller;
  } catch {
    hasil.value.sw = false;
    hasil.value.swKontrol = false;
  }
};

onMounted(periksa);

const cek = computed(() => [
  {
    nama: 'Alamat aman (HTTPS)',
    ok: hasil.value.https,
    ket: hasil.value.https ? 'Aman.' : 'Pemasangan butuh HTTPS.',
  },
  {
    nama: 'Manifest terbaca',
    ok: hasil.value.manifest,
    ket: hasil.value.manifest ? 'Nama, alamat awal, dan mode aplikasi lengkap.' : 'Manifest hilang atau isinya kurang.',
  },
  {
    nama: 'Ikon 192 dan 512',
    ok: hasil.value.ikon,
    ket: hasil.value.ikon ? 'Lengkap.' : 'Salah satu ukuran ikon tidak ada.',
  },
  {
    nama: 'Service worker aktif',
    ok: hasil.value.sw,
    ket: hasil.value.sw ? 'Aktif.' : 'Belum aktif. Tutup tab, lalu buka lagi.',
  },
  {
    nama: 'Halaman dikendalikan service worker',
    ok: hasil.value.swKontrol,
    ket: hasil.value.swKontrol ? 'Ya.' : 'Belum. Muat ulang halaman sekali.',
  },
  {
    nama: 'Dibuka di browser biasa',
    ok: !dalamAplikasi,
    ket: dalamAplikasi
      ? 'Ini browser di dalam aplikasi lain, atau browser iPhone selain Safari. Buka lewat Chrome.'
      : `Terdeteksi: ${perangkat}.`,
  },
  {
    nama: 'Belum dibuka dari layar utama',
    ok: !standalone,
    ket: standalone ? 'Aplikasinya sudah terpasang dan sedang dibuka.' : 'Masih di browser.',
  },
  {
    nama: 'Belum terpasang di perangkat ini',
    ok: !sudahTerpasang.value,
    ket: sudahTerpasang.value ? 'Chrome mencatat sudah terpasang.' : 'Tidak ada catatan terpasang.',
  },
  {
    nama: 'Chrome mengirim sinyal siap pasang',
    ok: promptTertunda.value ? true : sinyalPernahTerbit.value ? false : null,
    ket: promptTertunda.value
      ? 'Sinyal diterima. Tombol Pasang akan langsung memasang.'
      : sinyalPernahTerbit.value
        ? 'Sinyal sudah dipakai atau dibatalkan.'
        : 'Belum ada sinyal. Kalau semua centang di atas hijau, tunggu beberapa detik lalu tekan Periksa ulang. Kalau tetap kosong, Chrome sedang menahan tawaran (mungkin pernah ditolak, atau situs sudah terpasang).',
  },
]);

const siap = computed(() => !!promptTertunda.value);

const kesimpulan = computed(() => {
  if (siap.value) return 'Siap. Satu ketukan di tombol Pasang di HP akan langsung memasang.';
  const gagal = cek.value.filter((c) => c.ok === false && c.nama !== 'Chrome mengirim sinyal siap pasang');
  if (gagal.length) return `Belum siap karena: ${gagal.map((g) => g.nama.toLowerCase()).join(', ')}.`;
  return 'Semua syarat dasar terpenuhi, tapi Chrome belum mengirim sinyal. Lihat keterangan di baris terakhir.';
});
</script>

<style scoped>
.diagnosis {
  position: fixed;
  inset: auto 0.75rem 0.75rem;
  z-index: 9000;
  max-width: 520px;
  margin: 0 auto;
  max-height: 80vh;
  overflow: auto;
  padding: 0.9rem 1rem 1rem;
  background: var(--papan);
  color: var(--tinta);
  border: 1.5px solid var(--garis);
  border-radius: 10px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
  font-size: 0.9rem;
}
.diagnosis-kepala {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.tutup {
  width: 36px;
  height: 36px;
  background: none;
  border: 0;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
}
.daftar {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}
.daftar li {
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
}
.daftar small {
  display: block;
  color: var(--tinta-2);
  line-height: 1.35;
}
.tanda {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border: 1.5px solid var(--garis);
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.8rem;
}
.ok .tanda {
  background: var(--hijau);
  color: #fff;
}
.gagal .tanda {
  background: var(--merah);
  color: #fff;
}
.tunggu .tanda {
  background: var(--kuning);
}
.kesimpulan {
  margin-top: 0.8rem;
  padding: 0.6rem 0.7rem;
  border: 1.5px solid var(--garis);
  border-radius: 6px;
  font-weight: 700;
}
.kesimpulan.ok {
  background: var(--hijau-muda);
}
.kesimpulan.gagal {
  background: var(--kuning-muda);
}
.ua {
  margin-top: 0.6rem;
  color: var(--tinta-3);
  font-size: 0.75rem;
  overflow-wrap: anywhere;
}
.muat {
  margin-top: 0.6rem;
  min-height: 40px;
  padding: 0 0.9rem;
  background: var(--kuning);
  border: 1.5px solid var(--garis);
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
}
</style>
