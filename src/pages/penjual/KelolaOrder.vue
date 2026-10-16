<template>
  <LayoutPenjual :statusToko="statusToko" :tokoId="toko?.id">
    <section class="kepala">
      <div class="wadah">
        <h1 class="judul-halaman">Pesanan masuk</h1>
        <p class="sub-halaman">Konfirmasi, hubungi pembeli, lalu tandai selesai kalau barang sudah sampai.</p>
      </div>
    </section>

    <div class="wadah isi">
      <div class="deret-chip" role="group" aria-label="Saring menurut status">
        <button
          v-for="f in filterList"
          :key="f.val"
          type="button"
          class="chip"
          :aria-pressed="filterAktif === f.val"
          @click="filterAktif = f.val"
        >
          {{ f.label }}
          <span v-if="hitungFilter(f.val) > 0" class="hitung">{{ hitungFilter(f.val) }}</span>
        </button>
      </div>

      <div v-if="loading" class="memuat">
        <div class="spinner"></div>
        <p>Mengambil pesanan…</p>
      </div>

      <ul v-else-if="orderFiltered.length" class="daftar">
        <li v-for="o in orderFiltered" :key="o.id" class="nota papan" :class="{ baru: o.status === 'MENUNGGU' }">
          <div class="nota-kepala">
            <div class="nota-status">
              <span class="badge" :class="badgeClass(o.status)">{{ labelStatus(o.status) }}</span>
              <time :datetime="o.created_at">{{ formatTanggal(o.created_at) }}</time>
            </div>
            <span class="plat" :class="o.metode === 'COD' ? 'plat-kuning' : 'plat-biru'">
              {{ o.metode === 'COD' ? 'COD' : 'Transfer' }}
            </span>
          </div>

          <div class="nota-produk">
            <img :src="o.produk?.foto_url" :alt="o.produk?.nama_produk" class="nota-foto" />
            <div class="nota-teks">
              <p class="nota-nama">{{ o.produk?.nama_produk }}</p>
              <p v-if="o.varian_terpilih" class="nota-varian">Varian: {{ o.varian_terpilih }}</p>
              <p class="nota-jumlah">{{ o.jumlah }} × {{ formatRupiah(o.total_harga / o.jumlah) }}</p>
            </div>
            <p class="nota-total">{{ formatRupiah(o.total_harga) }}</p>
          </div>

          <dl class="nota-pembeli">
            <div>
              <dt><User :size="16" :stroke-width="2.5" /> Pemesan</dt>
              <dd>{{ o.nama_pemesan }}</dd>
            </div>
            <div>
              <dt><MapPin :size="16" :stroke-width="2.5" /> Antar ke</dt>
              <dd>{{ o.alamat }}</dd>
            </div>
            <div v-if="o.catatan">
              <dt><StickyNote :size="16" :stroke-width="2.5" /> Catatan</dt>
              <dd>{{ o.catatan }}</dd>
            </div>
          </dl>

          <div class="nota-aksi">
            <button type="button" class="tombol tombol-hijau" @click="chatPembeli(o)">
              <IkonWa :size="18" />
              Chat pembeli
            </button>
            <template v-if="o.status === 'MENUNGGU'">
              <button type="button" class="tombol tombol-biru" :disabled="prosesId === o.id" @click="updateStatus(o, 'DIKONFIRMASI')">
                <Check :size="18" :stroke-width="3" />
                {{ prosesId === o.id ? 'Menyimpan…' : 'Konfirmasi' }}
              </button>
              <button type="button" class="tombol tombol-bahaya" :disabled="prosesId === o.id" @click="mintaBatal(o)">
                Batalkan
              </button>
            </template>
            <button
              v-else-if="o.status === 'DIKONFIRMASI'"
              type="button"
              class="tombol tombol-merah"
              :disabled="prosesId === o.id"
              @click="updateStatus(o, 'SELESAI')"
            >
              <PackageCheck :size="18" :stroke-width="2.5" />
              {{ prosesId === o.id ? 'Menyimpan…' : 'Tandai selesai' }}
            </button>
          </div>
        </li>
      </ul>

      <div v-else class="kosong">
        <Inbox :size="44" :stroke-width="2" />
        <h3>{{ filterAktif === 'semua' ? 'Belum ada pesanan' : `Tidak ada pesanan yang ${labelStatus(filterAktif).toLowerCase()}` }}</h3>
        <p v-if="filterAktif === 'semua'">Bagikan tautan tokomu ke grup WA supaya tetangga tahu.</p>
        <p v-else>Coba lihat status lainnya.</p>
        <button v-if="filterAktif !== 'semua'" type="button" class="tombol" @click="filterAktif = 'semua'">Lihat semua pesanan</button>
      </div>
    </div>

    <!-- Konfirmasi batal -->
    <dialog ref="dialogBatal" class="dialog" @close="batalTarget = null">
      <div class="dialog-isi">
        <h2 class="huruf-papan">Batalkan pesanan ini?</h2>
        <p>
          Pesanan <strong>{{ batalTarget?.produk?.nama_produk }}</strong> dari
          <strong>{{ batalTarget?.nama_pemesan }}</strong> akan dibatalkan dan tidak bisa dipulihkan.
          Sebaiknya kabari pembelinya lewat WhatsApp.
        </p>
        <div class="dialog-aksi">
          <button type="button" class="tombol" @click="dialogBatal.close()">Jangan batalkan</button>
          <button type="button" class="tombol tombol-merah" @click="konfirmasiBatal">Ya, batalkan</button>
        </div>
      </div>
    </dialog>
  </LayoutPenjual>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { User, MapPin, StickyNote, Check, PackageCheck, Inbox } from 'lucide-vue-next';
import { supabase } from '@/lib/supabase';
import { useToastStore } from '@/stores/toast';
import LayoutPenjual from '@/layouts/LayoutPenjual.vue';
import IkonWa from '@/components/IkonWa.vue';
import { formatRupiah, formatTanggal, badgeOrderClass, tautanWa } from '@/lib/utils';

const route = useRoute();
const router = useRouter();
const toast = useToastStore();
const loading = ref(true);
const orderList = ref([]);
const filterAktif = ref('semua');
const prosesId = ref(null);
const statusToko = ref(null);
const toko = ref(null);
const dialogBatal = ref(null);
const batalTarget = ref(null);

const filterList = [
  { val: 'semua', label: 'Semua' },
  { val: 'MENUNGGU', label: 'Menunggu' },
  { val: 'DIKONFIRMASI', label: 'Dikonfirmasi' },
  { val: 'SELESAI', label: 'Selesai' },
  { val: 'DIBATALKAN', label: 'Dibatalkan' },
];

const labelStatus = (s) =>
  ({ MENUNGGU: 'Menunggu', DIKONFIRMASI: 'Dikonfirmasi', SELESAI: 'Selesai', DIBATALKAN: 'Dibatalkan' })[s] ?? s;
const badgeClass = badgeOrderClass;

const orderFiltered = computed(() =>
  filterAktif.value === 'semua'
    ? orderList.value
    : orderList.value.filter((o) => o.status === filterAktif.value),
);
const hitungFilter = (val) =>
  val === 'semua' ? orderList.value.length : orderList.value.filter((o) => o.status === val).length;

const updateStatus = async (order, statusBaru) => {
  prosesId.value = order.id;
  const { error } = await supabase.from('orders').update({ status: statusBaru }).eq('id', order.id);
  if (error) {
    toast.error('Statusnya belum berubah. Periksa koneksi internetmu, lalu coba lagi.');
  } else {
    order.status = statusBaru;
    toast.success(
      { DIKONFIRMASI: 'Pesanan dikonfirmasi. Lanjut atur pengantaran lewat WA.', SELESAI: 'Pesanan selesai.', DIBATALKAN: 'Pesanan dibatalkan.' }[statusBaru],
    );
  }
  prosesId.value = null;
};

const mintaBatal = (o) => {
  batalTarget.value = o;
  dialogBatal.value?.showModal();
};
const konfirmasiBatal = async () => {
  const o = batalTarget.value;
  dialogBatal.value?.close();
  if (o) await updateStatus(o, 'DIBATALKAN');
};

const chatPembeli = (o) => {
  let detail = `*${o.produk?.nama_produk}*`;
  if (o.varian_terpilih) detail += ` (varian ${o.varian_terpilih})`;
  const pesan = `Halo ${o.nama_pemesan}, saya dari ${toko.value?.nama_toko ?? 'toko'} soal pesanan ${detail} sebanyak ${o.jumlah}. `;
  window.open(tautanWa(o.nomor_wa_pembeli, pesan), '_blank');
};

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    router.replace({ path: '/login', query: { redirect: route.fullPath } });
    return;
  }

  const { data: tokoData } = await supabase
    .from('toko')
    .select('id, nama_toko, status')
    .eq('user_id', session.user.id)
    .single();

  if (!tokoData || tokoData.status !== 'AKTIF') {
    router.push('/toko/dashboard');
    return;
  }
  statusToko.value = tokoData.status;
  toko.value = tokoData;

  const { data } = await supabase
    .from('orders')
    .select('*, varian_terpilih, produk(nama_produk, foto_url, harga)')
    .eq('toko_id', tokoData.id)
    .order('created_at', { ascending: false });

  orderList.value = data ?? [];
  // Yang paling perlu dikerjakan lebih dulu: kalau ada yang menunggu, tampilkan itu dulu
  if (orderList.value.some((o) => o.status === 'MENUNGGU')) filterAktif.value = 'MENUNGGU';
  loading.value = false;
});
</script>

<style scoped>
.kepala {
  background: var(--hijau);
  color: #fff;
  border-bottom: 3px solid var(--tinta);
  padding: 1.5rem 0 1.75rem;
}
.kepala .judul-halaman {
  color: #fff;
}
.kepala .sub-halaman {
  color: #cfe8d7;
}
.isi {
  padding-top: 1.25rem;
  padding-bottom: 2rem;
  max-width: 900px;
}

.daftar {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.75rem;
}
.nota {
  padding: 1rem 1.1rem 1.1rem;
}
.nota.baru {
  --papan-bg: var(--kuning-muda);
}
.nota-kepala {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px dashed var(--tinta-3);
}
.nota-status {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.3rem 0.7rem;
}
.nota-status time {
  font-size: 0.9rem;
  color: var(--tinta-3);
}

.nota-produk {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-top: 0.9rem;
}
.nota-foto {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  object-fit: cover;
  border: 2.5px solid var(--tinta);
  border-radius: var(--sudut);
  background: var(--dinding);
}
.nota-teks {
  flex: 1;
  min-width: 0;
}
.nota-nama {
  font-weight: 700;
  line-height: 1.25;
}
.nota-varian {
  display: inline-block;
  margin-top: 0.15rem;
  padding: 0 0.45rem;
  background: var(--kuning);
  border: 2px solid var(--tinta);
  border-radius: 4px;
  font-size: 0.82rem;
  font-weight: 700;
}
.nota-jumlah {
  font-size: 0.92rem;
  color: var(--tinta-2);
}
.nota-total {
  font-family: var(--font-papan);
  font-size: 1.15rem;
  white-space: nowrap;
}

.nota-pembeli {
  margin-top: 0.9rem;
  padding: 0.7rem 0.9rem;
  background: var(--papan);
  border: 2px solid var(--garis-lembut);
  border-radius: var(--sudut);
}
.nota-pembeli > div {
  display: grid;
  grid-template-columns: 8.5rem 1fr;
  gap: 0.75rem;
  padding: 0.3rem 0;
}
.nota-pembeli dt {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--tinta-3);
  font-size: 0.92rem;
}
.nota-pembeli dd {
  font-weight: 700;
  overflow-wrap: anywhere;
}
@media (max-width: 520px) {
  .nota-pembeli > div {
    grid-template-columns: 1fr;
    gap: 0;
  }
}

.nota-aksi {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

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
  gap: 0.7rem;
  padding: 1.5rem;
}
.dialog-isi h2 {
  font-size: 1.25rem;
}
.dialog-isi p {
  color: var(--tinta-2);
}
.dialog-aksi {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.6rem;
}
</style>
