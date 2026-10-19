<template>
  <section v-if="status && status !== 'belum-dikonfigurasi'" class="notif papan" aria-labelledby="judul-notif">
    <span class="notif-ikon" :class="{ aktif: status === 'aktif' }">
      <BellRing v-if="status === 'aktif'" :size="24" :stroke-width="2" />
      <Bell v-else :size="24" :stroke-width="2" />
    </span>

    <div class="notif-teks">
      <h2 id="judul-notif">Notifikasi pesanan</h2>

      <p v-if="status === 'aktif'">
        Aktif di perangkat ini. Anda akan diberi tahu saat ada pesanan baru, walau aplikasi sedang tertutup.
      </p>
      <p v-else-if="status === 'ditolak'">
        Notifikasi diblokir di browser ini. Buka pengaturan situs di browser, ubah izin Notifikasi menjadi
        Izinkan, lalu muat ulang halaman.
      </p>
      <p v-else-if="status === 'tidak-didukung'">
        Browser ini belum mendukung notifikasi. Di iPhone, pasang ItahBangkuang ke layar utama terlebih dahulu
        (Bagikan → Tambah ke Layar Utama), lalu buka dari ikonnya.
      </p>
      <p v-else>Dapatkan pemberitahuan di HP setiap ada pesanan baru, walau aplikasi sedang tertutup.</p>

      <p v-if="galat" class="notif-galat" role="alert">{{ galat }}</p>
    </div>

    <button
      v-if="status === 'belum'"
      type="button"
      class="tombol tombol-merah"
      :disabled="proses"
      @click="aktifkan"
    >
      {{ proses ? 'Mengaktifkan…' : 'Aktifkan' }}
    </button>
    <button v-else-if="status === 'aktif'" type="button" class="tombol tombol-kecil" :disabled="proses" @click="matikan">
      Matikan
    </button>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Bell, BellRing } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { statusPush, aktifkanPush, matikanPush } from '@/lib/pushNotif';

const authStore = useAuthStore();
const status = ref('');
const proses = ref(false);
const galat = ref('');

const muat = async () => {
  try {
    status.value = await statusPush();
  } catch {
    status.value = 'tidak-didukung';
  }
};

const aktifkan = async () => {
  galat.value = '';
  proses.value = true;
  try {
    const hasil = await aktifkanPush(authStore.user?.id);
    if (!hasil.ok) {
      galat.value =
        hasil.alasan === 'izin'
          ? 'Izin notifikasi belum diberikan. Ketuk Aktifkan lagi, lalu pilih Izinkan.'
          : 'Notifikasi belum dapat diaktifkan. Periksa koneksi internet Anda, lalu coba lagi.';
    }
  } catch {
    galat.value = 'Notifikasi belum dapat diaktifkan di browser ini.';
  }
  proses.value = false;
  await muat();
};

const matikan = async () => {
  galat.value = '';
  proses.value = true;
  try {
    await matikanPush();
  } catch {
    galat.value = 'Notifikasi belum dapat dimatikan. Coba lagi.';
  }
  proses.value = false;
  await muat();
};

onMounted(muat);
</script>

<style scoped>
.notif {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.15rem;
}
.notif-ikon {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: var(--sage);
  color: var(--sungai);
}
.notif-ikon.aktif {
  background: var(--sungai);
  color: #fff;
}
.notif-teks {
  flex: 1;
  min-width: 0;
}
.notif-teks h2 {
  font-size: 1.02rem;
  font-weight: 800;
}
.notif-teks p {
  margin-top: 0.15rem;
  color: var(--ink-2);
  font-size: 0.92rem;
  line-height: 1.5;
}
.notif-galat {
  color: var(--merah-tua) !important;
  font-weight: 700;
}
@media (max-width: 560px) {
  .notif {
    flex-wrap: wrap;
  }
  .notif > .tombol {
    width: 100%;
  }
}
</style>
