<template>
  <LayoutPenjual :statusToko="toko?.status" :tokoId="toko?.id">
    <div v-if="loading" class="memuat">
      <div class="spinner"></div>
      <p>Membuka tokomu…</p>
    </div>

    <template v-else>
      <!-- STATUS: PENDING / DITOLAK / DIBLOKIR -->
      <div v-if="statusToko !== 'AKTIF'" class="wadah status-wrap">
        <div class="papan status" :class="`status-${statusToko?.toLowerCase()}`">
          <component :is="statusInfo.icon" :size="44" :stroke-width="2.25" />
          <h1 class="huruf-papan">{{ statusInfo.judul }}</h1>
          <p class="status-teks">{{ statusInfo.teks }}</p>

          <dl class="status-data">
            <div><dt>Nama toko</dt><dd>{{ toko?.nama_toko }}</dd></div>
            <div><dt>Alamat</dt><dd>{{ toko?.alamat }}</dd></div>
            <div>
              <dt>Status</dt>
              <dd><span class="badge" :class="`badge-${statusToko?.toLowerCase()}`">{{ statusInfo.label }}</span></dd>
            </div>
          </dl>

          <div v-if="statusToko === 'DITOLAK' && toko?.alasan_tolak" class="alasan">
            <p class="label">Alasan dari admin</p>
            <p>“{{ toko.alasan_tolak }}”</p>
          </div>

          <div class="status-aksi">
            <RouterLink v-if="statusToko !== 'DIBLOKIR'" to="/toko/profil" class="tombol tombol-kuning tombol-besar">
              {{ statusToko === 'DITOLAK' ? 'Perbaiki profil toko' : 'Lengkapi profil toko' }}
            </RouterLink>
            <a :href="tautanAdmin" target="_blank" rel="noopener" class="tombol tombol-besar">
              <IkonWa :size="20" />
              Hubungi admin
            </a>
          </div>
        </div>
      </div>

      <!-- AKTIF -->
      <template v-else>
        <section class="kepala">
          <div class="wadah kepala-dalam">
            <div>
              <p class="kepala-sapa">Halo, ini tokomu hari ini</p>
              <h1 class="judul-halaman">{{ toko?.nama_toko }}</h1>
            </div>
            <div class="kepala-aksi">
              <RouterLink to="/toko/produk/tambah" class="tombol tombol-merah">
                <Plus :size="20" :stroke-width="2.75" />
                Tambah produk
              </RouterLink>
              <RouterLink :to="`/toko/${toko?.id}`" class="tombol">
                <ExternalLink :size="18" :stroke-width="2.5" />
                Lihat tokoku
              </RouterLink>
            </div>
          </div>
        </section>

        <div class="wadah isi">
          <!-- Yang perlu dikerjakan -->
          <RouterLink
            v-if="stats.orderMenunggu > 0"
            to="/toko/order"
            class="perlu papan papan-kuning papan-bingkai"
          >
            <BellRing :size="30" :stroke-width="2.25" />
            <span class="perlu-teks">
              <strong class="huruf-papan">{{ stats.orderMenunggu }} pesanan menunggu konfirmasimu</strong>
              <span>Balas cepat, biar pembeli tidak batal.</span>
            </span>
            <ArrowRight :size="24" :stroke-width="2.5" />
          </RouterLink>
          <p v-else class="perlu-tenang">
            <CircleCheck :size="20" :stroke-width="2.5" />
            Tidak ada pesanan yang menunggu. Mantap.
          </p>

          <!-- Ringkasan -->
          <dl class="ringkasan papan">
            <div>
              <dt>Produk dipajang</dt>
              <dd>{{ stats.totalProduk }}</dd>
            </div>
            <div>
              <dt>Pesanan selesai</dt>
              <dd>{{ stats.orderSelesai }}</dd>
            </div>
            <div>
              <dt>Total pendapatan</dt>
              <dd>{{ formatRupiah(stats.totalPendapatan) }}</dd>
            </div>
          </dl>

          <div class="kolom">
            <!-- Pesanan terbaru -->
            <section aria-labelledby="judul-pesanan">
              <div class="kepala-bagian">
                <h2 id="judul-pesanan" class="huruf-papan">Pesanan terbaru</h2>
                <RouterLink to="/toko/order" class="lihat">Lihat semua</RouterLink>
              </div>

              <ul v-if="orderTerbaru.length" class="daftar papan">
                <li v-for="o in orderTerbaru" :key="o.id" class="baris">
                  <div class="baris-teks">
                    <p class="baris-nama">{{ o.nama_pemesan }}</p>
                    <p class="baris-ket">{{ o.produk?.nama_produk }} × {{ o.jumlah }}</p>
                    <p class="baris-ket">{{ o.metode === 'COD' ? 'COD' : 'Transfer' }} · {{ formatTanggal(o.created_at) }}</p>
                  </div>
                  <div class="baris-kanan">
                    <p class="baris-harga">{{ formatRupiah(o.total_harga) }}</p>
                    <span class="badge" :class="badgeClass(o.status)">{{ labelStatus(o.status) }}</span>
                  </div>
                </li>
              </ul>
              <div v-else class="kosong">
                <Inbox :size="36" :stroke-width="2" />
                <h3>Belum ada pesanan</h3>
                <p>Bagikan tautan tokomu ke grup WA supaya tetangga tahu.</p>
              </div>
            </section>

            <!-- Produk -->
            <section aria-labelledby="judul-produk">
              <div class="kepala-bagian">
                <h2 id="judul-produk" class="huruf-papan">Produkmu</h2>
                <RouterLink to="/toko/produk" class="lihat">Kelola</RouterLink>
              </div>

              <ul v-if="produkList.length" class="daftar papan">
                <li v-for="p in produkList" :key="p.id">
                  <RouterLink :to="`/toko/produk/${p.id}/edit`" class="baris baris-tautan">
                    <img :src="p.foto_url" :alt="p.nama_produk" class="baris-foto" />
                    <div class="baris-teks">
                      <p class="baris-nama">{{ p.nama_produk }}</p>
                      <p class="baris-ket">{{ formatHargaProduk(p) }}</p>
                    </div>
                    <span class="stok" :class="{ habis: totalStok(p) === 0, sedikit: totalStok(p) > 0 && totalStok(p) <= 5 }">
                      {{ totalStok(p) === 0 ? 'Habis' : `Stok ${totalStok(p)}` }}
                    </span>
                  </RouterLink>
                </li>
              </ul>
              <div v-else class="kosong">
                <PackageOpen :size="36" :stroke-width="2" />
                <h3>Belum ada produk</h3>
                <p>Pajang produk pertamamu supaya bisa dilihat pembeli.</p>
                <RouterLink to="/toko/produk/tambah" class="tombol tombol-merah">Tambah produk pertama</RouterLink>
              </div>
            </section>
          </div>

          <!-- Tautan toko -->
          <div class="bagikan papan papan-bingkai">
            <div class="bagikan-teks">
              <p class="label">Tautan tokomu</p>
              <p class="bagikan-url">{{ baseUrl }}/toko/{{ toko?.id }}</p>
            </div>
            <button type="button" class="tombol" @click="copyLink">
              <Check v-if="copied" :size="20" :stroke-width="2.75" />
              <Copy v-else :size="20" :stroke-width="2.5" />
              {{ copied ? 'Tersalin' : 'Salin tautan' }}
            </button>
          </div>
        </div>
      </template>
    </template>
  </LayoutPenjual>
</template>

<script setup>
import { ref, computed, onMounted, markRaw } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Plus,
  ExternalLink,
  BellRing,
  ArrowRight,
  CircleCheck,
  Inbox,
  PackageOpen,
  Copy,
  Check,
  Hourglass,
  CircleX,
  Ban,
} from 'lucide-vue-next';
import { supabase } from '@/lib/supabase';
import LayoutPenjual from '@/layouts/LayoutPenjual.vue';
import IkonWa from '@/components/IkonWa.vue';
import {
  formatRupiah,
  formatTanggal,
  badgeOrderClass,
  totalStok,
  formatHargaProduk,
  tautanWa,
} from '@/lib/utils';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const toko = ref(null);
const statusToko = ref(null);
const stats = ref({ totalProduk: 0, orderMenunggu: 0, orderSelesai: 0, totalPendapatan: 0 });
const orderTerbaru = ref([]);
const produkList = ref([]);
const copied = ref(false);
const baseUrl = window.location.origin;
const badgeClass = badgeOrderClass;

const labelStatus = (s) =>
  ({ MENUNGGU: 'Menunggu', DIKONFIRMASI: 'Dikonfirmasi', SELESAI: 'Selesai', DIBATALKAN: 'Dibatalkan' })[s] ?? s;

const INFO_STATUS = {
  PENDING: {
    icon: markRaw(Hourglass),
    label: 'Menunggu pemeriksaan',
    judul: 'Tokomu sedang diperiksa',
    teks: 'Terima kasih sudah mendaftar. Admin sedang memeriksa info tokomu, biasanya kurang dari 24 jam. Setelah disetujui, kamu bisa memajang produk.',
  },
  DITOLAK: {
    icon: markRaw(CircleX),
    label: 'Ditolak',
    judul: 'Tokomu belum bisa disetujui',
    teks: 'Info tokomu perlu diperbaiki dulu. Setelah diperbaiki, hubungi admin supaya diperiksa lagi.',
  },
  DIBLOKIR: {
    icon: markRaw(Ban),
    label: 'Diblokir',
    judul: 'Tokomu diblokir',
    teks: 'Admin memblokir tokomu. Hubungi admin untuk tahu penyebabnya dan apa yang bisa dilakukan.',
  },
};
const statusInfo = computed(() => INFO_STATUS[statusToko.value] ?? INFO_STATUS.PENDING);
const tautanAdmin = tautanWa('6282253158560', 'Halo admin, saya penjual di ItahBangkuang dan mau tanya soal status toko saya.');

const copyLink = async () => {
  await navigator.clipboard.writeText(`${baseUrl}/toko/${toko.value?.id}`);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
};

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    router.replace({ path: '/login', query: { redirect: route.fullPath } });
    return;
  }

  const { data: tokoData } = await supabase
    .from('toko')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (!tokoData) {
    router.push('/');
    return;
  }

  toko.value = tokoData;
  statusToko.value = tokoData.status;

  if (tokoData.status !== 'AKTIF') {
    loading.value = false;
    return;
  }

  const idToko = tokoData.id;
  const hitung = (status) =>
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('toko_id', idToko).eq('status', status);

  const [produkRes, orderRes, totalProdukRes, menungguRes, selesaiRes, pendapatanRes] = await Promise.all([
    supabase
      .from('produk')
      .select('id, nama_produk, foto_url, harga, stok, varian')
      .eq('toko_id', idToko)
      .eq('status', 'AKTIF')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('orders')
      .select('*, produk(nama_produk)')
      .eq('toko_id', idToko)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('produk').select('*', { count: 'exact', head: true }).eq('toko_id', idToko).eq('status', 'AKTIF'),
    hitung('MENUNGGU'),
    hitung('SELESAI'),
    supabase.from('orders').select('total_harga').eq('toko_id', idToko).eq('status', 'SELESAI'),
  ]);

  produkList.value = produkRes.data ?? [];
  orderTerbaru.value = orderRes.data ?? [];
  stats.value = {
    totalProduk: totalProdukRes.count ?? 0,
    orderMenunggu: menungguRes.count ?? 0,
    orderSelesai: selesaiRes.count ?? 0,
    totalPendapatan: pendapatanRes.data?.reduce((sum, o) => sum + o.total_harga, 0) ?? 0,
  };

  loading.value = false;
});
</script>

<style scoped>
/* Status non-aktif */
.status-wrap {
  padding-top: 2rem;
  padding-bottom: 3rem;
  max-width: 680px;
}
.status {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.8rem;
  padding: 1.75rem 1.4rem;
}
.status-pending {
  --papan-bg: var(--kuning-muda);
}
.status-ditolak {
  --papan-bg: var(--merah-muda);
}
.status-diblokir {
  --papan-bg: #e8e8e8;
}
.status h1 {
  font-size: clamp(1.5rem, 5vw, 2rem);
}
.status-teks {
  max-width: 54ch;
  color: var(--tinta-2);
}
.status-data {
  width: 100%;
  background: var(--papan);
  border: 2px solid var(--tinta);
  border-radius: var(--sudut);
}
.status-data > div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.65rem 0.9rem;
  border-bottom: 1px solid var(--garis-lembut);
}
.status-data > div:last-child {
  border-bottom: 0;
}
.status-data dt {
  color: var(--tinta-3);
}
.status-data dd {
  font-weight: 700;
  text-align: right;
}
.alasan {
  width: 100%;
  padding: 0.9rem 1rem;
  background: var(--papan);
  border: 2px solid var(--merah);
  border-radius: var(--sudut);
}
.alasan p:last-child {
  margin-top: 0.25rem;
}
.status-aksi {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 0.4rem;
}

/* Aktif */
.kepala {
  background: var(--hijau);
  color: #fff;
  border-bottom: 3px solid var(--tinta);
  padding: 1.75rem 0 2rem;
}
.kepala .judul-halaman {
  color: #fff;
}
.kepala-dalam {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.25rem;
}
.kepala-sapa {
  color: #cfe8d7;
  font-weight: 700;
  margin-bottom: 0.2rem;
}
.kepala-aksi {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.isi {
  padding-top: 1.5rem;
  padding-bottom: 2rem;
}

.perlu {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.1rem 1.25rem;
  color: var(--tinta);
  text-decoration: none;
  transition: transform 0.3s var(--ease-out);
}
.perlu:hover {
  transform: translateY(-2px);
}
.perlu svg {
  flex-shrink: 0;
}
.perlu-teks {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  flex: 1;
}
.perlu-teks strong {
  font-size: 1.1rem;
  line-height: 1.2;
}
.perlu-tenang {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  color: var(--hijau-tua);
}

.ringkasan {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-top: 1.25rem;
}
.ringkasan > div {
  padding: 0.9rem 1rem;
  border-right: 1px solid var(--garis-lembut);
  min-width: 0;
}
.ringkasan > div:last-child {
  border-right: 0;
}
.ringkasan dt {
  font-size: 0.85rem;
  color: var(--tinta-3);
  font-weight: 700;
}
.ringkasan dd {
  margin-top: 0.1rem;
  font-family: var(--font-papan);
  font-size: clamp(1rem, 3.6vw, 1.5rem);
  overflow-wrap: anywhere;
}
@media (max-width: 520px) {
  .ringkasan {
    grid-template-columns: 1fr 1fr;
  }
  .ringkasan > div:last-child {
    grid-column: 1 / -1;
    border-right: 0;
    border-top: 1px solid var(--garis-lembut);
  }
}

.kolom {
  display: grid;
  gap: 1.75rem;
  margin-top: 2rem;
}
@media (min-width: 900px) {
  .kolom {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    align-items: start;
  }
}
.kepala-bagian {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 0.7rem;
}
.kepala-bagian h2 {
  font-size: 1.2rem;
}
.lihat {
  font-weight: 700;
  color: var(--biru);
}

.daftar {
  list-style: none;
}
.baris {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid var(--garis-lembut);
  color: var(--tinta);
  text-decoration: none;
}
.daftar > li:last-child .baris,
.daftar > li:last-child.baris {
  border-bottom: 0;
}
.baris-tautan:hover {
  background: var(--kuning-muda);
}
.baris-foto {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  object-fit: cover;
  border: 2px solid var(--tinta);
  border-radius: 6px;
  background: var(--dinding);
}
.baris-teks {
  flex: 1;
  min-width: 0;
}
.baris-nama {
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.baris-ket {
  font-size: 0.9rem;
  color: var(--tinta-3);
}
.baris-kanan {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.3rem;
}
.baris-harga {
  font-weight: 700;
}
.stok {
  flex-shrink: 0;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--hijau-tua);
}
.stok.sedikit,
.stok.habis {
  color: var(--merah-tua);
}

.bagikan {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.9rem;
  margin-top: 2rem;
  padding: 1rem 1.25rem;
}
.bagikan-teks {
  min-width: 0;
}
.bagikan-url {
  font-weight: 700;
  overflow-wrap: anywhere;
}
</style>
