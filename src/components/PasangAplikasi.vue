<template>
  <div v-if="tampil" class="pasang">
    <button type="button" class="tombol" :class="kelas" @click="klik">
      <Download :size="20" :stroke-width="2.5" />
      Pasang di HP
    </button>

    <dialog ref="dialog" class="dialog" aria-labelledby="judul-pasang">
      <div class="dialog-isi">
        <h2 id="judul-pasang" class="huruf-papan">Pasang di HP-mu</h2>
        <p class="manfaat">Ikonnya muncul di layar utama dan terbuka seperti aplikasi biasa. Tanpa unduh dari Play Store.</p>

        <ol class="langkah">
          <li v-for="(l, i) in petunjuk.langkah" :key="i">
            <span class="no huruf-papan">{{ i + 1 }}</span>
            <span v-html="l"></span>
          </li>
        </ol>

        <p v-if="petunjuk.catatan" class="pesan pesan-info">
          <Info :size="18" :stroke-width="2.5" />
          <span>{{ petunjuk.catatan }}</span>
        </p>

        <div class="dialog-aksi">
          <button v-if="petunjuk.salin" type="button" class="tombol" @click="salinTautan">
            <Check v-if="tersalin" :size="18" :stroke-width="2.75" />
            <Copy v-else :size="18" :stroke-width="2.5" />
            {{ tersalin ? 'Tautan disalin' : 'Salin tautan' }}
          </button>
          <button type="button" class="tombol tombol-merah" @click="dialog.close()">Mengerti</button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Download, Info, Copy, Check } from 'lucide-vue-next';
import { usePasangAplikasi } from '@/lib/usePwa';

defineProps({ kelas: { type: String, default: 'tombol-kuning' } });

const { tampil, bisaLangsung, perangkat, pasangLangsung } = usePasangAplikasi();
const dialog = ref(null);
const tersalin = ref(false);

const PETUNJUK = {
  'android-chrome': {
    langkah: [
      'Tekan ikon <strong>titik tiga</strong> di pojok kanan atas Chrome.',
      'Pilih <strong>Instal aplikasi</strong> atau <strong>Tambahkan ke layar utama</strong>.',
      'Tekan <strong>Instal</strong>.',
    ],
    catatan: 'Kalau pilihannya tidak ada, tutup tab ini lalu buka lagi. Pemasangan baru tersedia pada kunjungan kedua.',
  },
  'android-aplikasi': {
    langkah: [
      'Kamu sedang membuka lewat aplikasi lain (WhatsApp, Facebook, dan sejenisnya), yang tidak bisa memasang.',
      'Tekan <strong>Salin tautan</strong> di bawah.',
      'Buka <strong>Chrome</strong>, tempel tautannya, lalu tekan tombol Pasang di HP lagi.',
    ],
    salin: true,
  },
  'android-samsung': {
    langkah: [
      'Tekan ikon <strong>menu</strong> (tiga garis) di Samsung Internet.',
      'Pilih <strong>Tambah halaman ke</strong>, lalu <strong>Layar utama</strong>.',
    ],
  },
  'android-firefox': {
    langkah: [
      'Tekan ikon <strong>titik tiga</strong> di Firefox.',
      'Pilih <strong>Instal</strong> atau <strong>Tambahkan ke layar utama</strong>.',
    ],
  },
  'ios-safari': {
    langkah: [
      'Tekan tombol <strong>Bagikan</strong> (kotak dengan panah ke atas) di bawah layar.',
      'Gulir, lalu pilih <strong>Tambah ke Layar Utama</strong>.',
      'Tekan <strong>Tambah</strong>.',
    ],
  },
  'ios-lain': {
    langkah: [
      'Di iPhone, pemasangan hanya bisa lewat <strong>Safari</strong>.',
      'Tekan <strong>Salin tautan</strong> di bawah, lalu buka di Safari.',
      'Di Safari, tekan <strong>Bagikan</strong>, lalu <strong>Tambah ke Layar Utama</strong>.',
    ],
    salin: true,
  },
  desktop: {
    langkah: [
      'Cari ikon <strong>pasang</strong> di sebelah kanan kolom alamat Chrome atau Edge.',
      'Tekan ikon itu, lalu <strong>Instal</strong>.',
    ],
    catatan: 'Firefox di komputer belum mendukung pemasangan.',
  },
};

const petunjuk = computed(() => PETUNJUK[perangkat] ?? PETUNJUK['android-chrome']);

const klik = async () => {
  // Chrome sudah siap: langsung tampilkan jendela pasang bawaan
  if (bisaLangsung.value && (await pasangLangsung())) return;
  dialog.value?.showModal();
};

const salinTautan = async () => {
  try {
    await navigator.clipboard.writeText(window.location.origin);
    tersalin.value = true;
    setTimeout(() => (tersalin.value = false), 2500);
  } catch {
    /* Clipboard bisa ditolak di browser dalam aplikasi; petunjuknya tetap terbaca */
  }
};
</script>

<style scoped>
.dialog {
  margin: auto;
  width: min(460px, calc(100vw - 2rem));
  padding: 0;
  background: var(--papan);
  color: var(--tinta);
  border: 3px solid var(--tinta);
  border-radius: 10px;
}
.dialog::backdrop {
  background: rgba(20, 20, 20, 0.55);
}
.dialog-isi {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1.5rem;
}
.dialog-isi h2 {
  font-size: 1.3rem;
}
.manfaat {
  color: var(--tinta-2);
}
.langkah {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.langkah li {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  line-height: 1.45;
}
.no {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  background: var(--merah);
  color: #fff;
  border: 2px solid var(--tinta);
  border-radius: 50%;
  font-size: 0.9rem;
}
.dialog-aksi {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.3rem;
}
</style>
