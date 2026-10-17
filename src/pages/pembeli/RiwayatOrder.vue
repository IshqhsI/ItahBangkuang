<template>
  <LayoutPublic>
    <section class="kepala">
      <div class="wadah">
        <h1 class="judul-halaman">Pesanan saya</h1>
        <p class="sub-halaman">Semua pesananmu dan statusnya.</p>
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
        <p>Mengambil pesananmu…</p>
      </div>

      <ul v-else-if="orderFiltered.length" class="daftar">
        <li v-for="o in orderFiltered" :key="o.id" class="nota papan">
          <div class="nota-kepala">
            <span class="badge" :class="badgeClass(o.status)">{{ labelStatus(o.status) }}</span>
            <time class="nota-tanggal" :datetime="o.created_at">{{ formatTanggal(o.created_at) }}</time>
          </div>

          <RouterLink :to="`/produk/${o.produk_id}`" class="nota-produk">
            <img :src="o.produk?.foto_url" :alt="o.produk?.nama_produk" class="nota-foto" />
            <span class="nota-teks">
              <span class="nota-toko"><Store :size="15" :stroke-width="2.25" /> {{ o.toko?.nama_toko }}</span>
              <span class="nota-nama">{{ o.produk?.nama_produk }}</span>
              <span v-if="o.varian_terpilih" class="nota-varian">{{ o.varian_terpilih }}</span>
              <span class="nota-jumlah">{{ o.jumlah }} × {{ formatRupiah(o.total_harga / o.jumlah) }}</span>
            </span>
          </RouterLink>

          <dl class="nota-rincian">
            <div>
              <dt>Bayar</dt>
              <dd>{{ o.metode === 'COD' ? 'COD' : 'Transfer' }}</dd>
            </div>
            <div v-if="o.catatan">
              <dt>Catatan</dt>
              <dd class="catatan">{{ o.catatan }}</dd>
            </div>
            <div class="total">
              <dt>Total</dt>
              <dd>{{ formatRupiah(o.total_harga) }}</dd>
            </div>
          </dl>

          <div class="nota-aksi">
            <button type="button" class="tombol tombol-hijau tombol-kecil" @click="chatPenjual(o)">
              <IkonWa :size="18" />
              Tanya penjual
            </button>
            <RouterLink :to="`/produk/${o.produk_id}`" class="tombol tombol-kecil">
              <RotateCw :size="18" :stroke-width="2.5" />
              Pesan lagi
            </RouterLink>
          </div>
        </li>
      </ul>

      <div v-else class="kosong">
        <ReceiptText :size="44" :stroke-width="2" />
        <h3>{{ filterAktif === 'semua' ? 'Belum ada pesanan' : `Tidak ada pesanan yang ${labelStatus(filterAktif).toLowerCase()}` }}</h3>
        <p v-if="filterAktif === 'semua'">Pesananmu muncul di sini.</p>
        <p v-else>Coba lihat status lainnya.</p>
        <RouterLink v-if="filterAktif === 'semua'" to="/produk" class="tombol tombol-merah">Lihat produk</RouterLink>
        <button v-else type="button" class="tombol" @click="filterAktif = 'semua'">Lihat semua pesanan</button>
      </div>
    </div>
  </LayoutPublic>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Store, RotateCw, ReceiptText } from 'lucide-vue-next';
import { supabase } from '@/lib/supabase';
import LayoutPublic from '@/layouts/LayoutPublic.vue';
import IkonWa from '@/components/IkonWa.vue';
import { formatRupiah, formatTanggal, badgeOrderClass, tautanWa } from '@/lib/utils';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const orderList = ref([]);
const filterAktif = ref('semua');

const filterList = [
  { val: 'semua', label: 'Semua' },
  { val: 'MENUNGGU', label: 'Menunggu' },
  { val: 'DIKONFIRMASI', label: 'Dikonfirmasi' },
  { val: 'SELESAI', label: 'Selesai' },
  { val: 'DIBATALKAN', label: 'Dibatalkan' },
];

const labelStatus = (s) =>
  ({
    MENUNGGU: 'Menunggu',
    DIKONFIRMASI: 'Dikonfirmasi',
    SELESAI: 'Selesai',
    DIBATALKAN: 'Dibatalkan',
  })[s] ?? s;

const badgeClass = badgeOrderClass;

const orderFiltered = computed(() =>
  filterAktif.value === 'semua'
    ? orderList.value
    : orderList.value.filter((o) => o.status === filterAktif.value),
);

const hitungFilter = (val) =>
  val === 'semua' ? orderList.value.length : orderList.value.filter((o) => o.status === val).length;

const chatPenjual = (o) => {
  let detail = `*${o.produk?.nama_produk}*`;
  if (o.varian_terpilih) detail += ` (varian ${o.varian_terpilih})`;
  const pesan = `Halo, saya mau tanya soal pesanan ${detail} sebanyak ${o.jumlah} yang saya buat lewat ItahBangkuang.`;
  window.open(tautanWa(o.toko?.nomor_wa, pesan), '_blank');
};

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    router.replace({ path: '/login', query: { redirect: route.fullPath } });
    return;
  }

  const { data } = await supabase
    .from('orders')
    .select('*, varian_terpilih, produk(nama_produk, foto_url, harga), toko(nama_toko, nomor_wa)')
    .eq('pembeli_id', session.user.id)
    .order('created_at', { ascending: false });

  orderList.value = data ?? [];
  loading.value = false;
});
</script>

<style scoped>
.kepala {
  background: var(--kuning);
  border-bottom: 3px solid var(--tinta);
  padding: 1.75rem 0 2rem;
}
.kepala .sub-halaman {
  color: #3a2f00;
}
.isi {
  padding-top: 1.25rem;
  padding-bottom: 4rem;
  max-width: 860px;
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
.nota-kepala {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px dashed var(--garis-lembut);
}
.nota-tanggal {
  font-size: 0.9rem;
  color: var(--tinta-3);
}

.nota-produk {
  display: flex;
  gap: 0.9rem;
  margin-top: 0.9rem;
  color: var(--tinta);
  text-decoration: none;
}
.nota-foto {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  object-fit: cover;
  border: var(--tebal) solid var(--garis);
  border-radius: var(--sudut);
  background: var(--dinding);
}
.nota-teks {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}
.nota-toko {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.88rem;
  color: var(--tinta-3);
}
.nota-nama {
  font-weight: 700;
  font-size: 1.05rem;
  line-height: 1.25;
}
.nota-produk:hover .nota-nama {
  text-decoration: underline;
}
.nota-varian {
  align-self: flex-start;
  padding: 0 0.45rem;
  background: var(--kuning);
  border: 2px solid var(--tinta);
  border-radius: 4px;
  font-size: 0.82rem;
  font-weight: 700;
}
.nota-jumlah {
  color: var(--tinta-2);
  font-size: 0.95rem;
}

.nota-rincian {
  margin-top: 0.9rem;
  border-top: 1px solid var(--garis-lembut);
}
.nota-rincian > div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--garis-lembut);
}
.nota-rincian dt {
  color: var(--tinta-3);
}
.nota-rincian dd {
  font-weight: 700;
  text-align: right;
}
.nota-rincian dd.catatan {
  font-weight: 400;
  max-width: 34ch;
  overflow-wrap: anywhere;
}
.nota-rincian .total {
  border-bottom: 0;
}
.nota-rincian .total dd {
  font-family: var(--font-papan);
  font-weight: 400;
  font-size: 1.25rem;
}

.nota-aksi {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.4rem;
}
</style>
