<template>
  <LayoutPublic>
    <!-- PAPAN DEPAN -->
    <section class="depan">
      <div class="wadah depan-dalam">
        <div class="depan-teks">
          <div class="gantung gantung-kecil ayun">
            <svg class="tali" viewBox="0 0 100 26" preserveAspectRatio="none" aria-hidden="true">
              <path d="M14 26 L50 3 L86 26" />
              <circle cx="50" cy="3" r="3" />
            </svg>
            <span class="papan-sapa">Uluh Itah Kia</span>
          </div>

          <h1 class="depan-judul huruf-papan">
            <span class="baris-1 berbayang">Bapapili mangat,</span>
            <span class="baris-2 berbayang">Bajualan mangat kia.</span>
          </h1>

          <p class="depan-sub">
            Tempat warga <strong>Kelurahan Bangkuang</strong> berjualan dan
            berbelanja. Pesan di sini, selesaikan lewat WhatsApp.
          </p>

          <div class="depan-pintu">
            <RouterLink to="/produk" class="pintu papan papan-kuning papan-bingkai">
              <ShoppingBasket class="pintu-ikon" :size="30" :stroke-width="2.25" />
              <span class="pintu-teks">
                <span class="pintu-judul">Mau belanja</span>
                <span class="pintu-ket">Lihat dagangan tetangga</span>
              </span>
              <ArrowRight class="pintu-panah" :size="24" :stroke-width="2.5" />
            </RouterLink>
            <RouterLink :to="bukaTokoDest" class="pintu papan papan-bingkai">
              <Store class="pintu-ikon" :size="30" :stroke-width="2.25" />
              <span class="pintu-teks">
                <span class="pintu-judul">Mau jualan</span>
                <span class="pintu-ket">Buka toko, gratis</span>
              </span>
              <ArrowRight class="pintu-panah" :size="24" :stroke-width="2.5" />
            </RouterLink>
          </div>

          <p v-if="statsSiap" class="depan-hitung">
            Sudah ada <strong>{{ stats.produk }}</strong> produk dari
            <strong>{{ stats.toko }}</strong> toko tetangga.
          </p>
        </div>

        <!-- Etalase: produk asli terbaru -->
        <div v-if="loadingProduk || etalase.length" class="etalase" aria-label="Baru dipajang">
          <p class="etalase-judul">Baru dipajang</p>
          <div class="etalase-deret">
            <template v-if="loadingProduk">
              <div v-for="n in 3" :key="n" class="etalase-papan kerangka-papan">
                <div class="kerangka etalase-foto"></div>
                <div class="kerangka" style="height: 1rem; width: 70%"></div>
              </div>
            </template>
            <RouterLink
              v-for="(p, i) in etalase"
              v-else
              :key="p.id"
              :to="`/produk/${p.id}`"
              class="etalase-papan"
              :style="{ '--miring': ['-2deg', '1.5deg', '-1deg'][i] }"
            >
              <img :src="p.foto_url" :alt="p.nama_produk" class="etalase-foto" />
              <span class="etalase-nama">{{ p.nama_produk }}</span>
              <span class="plat-harga">{{ formatHargaProduk(p) }}</span>
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- KATEGORI -->
    <section class="bagian">
      <div class="wadah">
        <h2 class="judul-bagian huruf-papan">Mau cari apa?</h2>
        <p class="sub-bagian">Tinggal pilih papannya.</p>
        <div class="kategori-grid">
          <RouterLink
            v-for="kat in kategori"
            :key="kat.slug"
            :to="`/produk?kategori=${kat.slug}`"
            class="papan-kategori papan papan-bingkai"
            :class="`papan-${kat.warna}`"
          >
            <span class="kat-ikon"><component :is="kat.icon" :size="26" :stroke-width="2.25" /></span>
            <span class="kat-nama">{{ kat.label }}</span>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- PRODUK TERBARU -->
    <section class="bagian bagian-dinding">
      <div class="wadah">
        <div class="kepala-bagian">
          <div>
            <h2 class="judul-bagian huruf-papan">Baru dipajang</h2>
            <p class="sub-bagian">Yang paling baru dari tetangga.</p>
          </div>
          <RouterLink to="/produk" class="tombol">
            Lihat semua
            <ArrowRight :size="20" :stroke-width="2.5" />
          </RouterLink>
        </div>

        <div v-if="loadingProduk" class="grid-produk">
          <div v-for="n in 8" :key="n" class="kerangka" style="aspect-ratio: 3 / 4"></div>
        </div>
        <div v-else-if="produkTerbaru.length" class="grid-produk">
          <KartuProduk v-for="p in produkTerbaru" :key="p.id" :produk="p" />
        </div>
        <div v-else class="kosong">
          <Store :size="40" :stroke-width="2" />
          <h3>Etalase masih kosong</h3>
          <p>Belum ada yang jualan. Jadi yang pertama?</p>
          <RouterLink :to="bukaTokoDest" class="tombol tombol-merah">Buka toko gratis</RouterLink>
        </div>
      </div>
    </section>

    <!-- CARA KERJA -->
    <section class="bagian bagian-kuning">
      <div class="wadah">
        <h2 class="judul-bagian huruf-papan">Caranya gampang</h2>
        <p class="sub-bagian">Tiga langkah. Cukup pakai HP.</p>
        <div class="cara-grid">
          <div v-for="c in caraKerja" :key="c.peran" class="papan cara-papan">
            <h3 class="cara-peran">
              <component :is="c.icon" :size="24" :stroke-width="2.25" />
              {{ c.peran }}
            </h3>
            <ol class="cara-langkah">
              <li v-for="(l, i) in c.langkah" :key="l.judul">
                <span class="langkah-no huruf-papan">{{ i + 1 }}</span>
                <span>
                  <span class="langkah-judul">{{ l.judul }}</span>
                  <span class="langkah-ket">{{ l.ket }}</span>
                </span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>

    <!-- AJAKAN PENJUAL -->
    <section class="bagian bagian-hijau">
      <div class="wadah ajakan">
        <div class="ajakan-teks">
          <h2 class="judul-bagian huruf-papan ajakan-judul berbayang">
            Punya dagangan andalan?
          </h2>
          <p class="ajakan-ket">
            Biasa jualan lewat status WA atau grup Facebook? Pajang juga di
            sini, biar tetangga gampang nemu dan pesan. Gratis.
          </p>
          <ul class="ajakan-daftar">
            <li v-for="u in untung" :key="u">
              <Check :size="22" :stroke-width="3" />
              {{ u }}
            </li>
          </ul>
          <RouterLink :to="bukaTokoDest" class="tombol tombol-kuning tombol-besar">
            Buka toko gratis
            <ArrowRight :size="22" :stroke-width="2.5" />
          </RouterLink>
        </div>

        <div class="ajakan-papan" aria-hidden="true">
          <div class="gantung ayun ayun-lambat">
            <svg class="tali" viewBox="0 0 100 40" preserveAspectRatio="none">
              <path d="M12 40 L50 4 L88 40" />
              <circle cx="50" cy="4" r="3.5" />
            </svg>
            <div class="papan-buka">
              <span class="buka-kata huruf-papan">BUKA</span>
              <span class="buka-ket">Ayo mampir</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </LayoutPublic>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  ShoppingBasket,
  Store,
  ArrowRight,
  Check,
} from 'lucide-vue-next';
import { supabase } from '@/lib/supabase';
import { formatHargaProduk } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import LayoutPublic from '@/layouts/LayoutPublic.vue';
import KartuProduk from '@/components/KartuProduk.vue';
import { KATEGORI } from '@/lib/kategori';

const authStore = useAuthStore();
const loadingProduk = ref(true);
const produkTerbaru = ref([]);
const stats = ref({ produk: 0, toko: 0, alamat: 0 });
const statsSiap = ref(false);
const kategori = KATEGORI;

// Tiga produk terbaru yang punya foto, untuk etalase di papan depan
const etalase = computed(() => produkTerbaru.value.filter((p) => p.foto_url).slice(0, 3));

const caraKerja = [
  {
    peran: 'Belanja',
    icon: ShoppingBasket,
    langkah: [
      { judul: 'Cari', ket: 'Pilih kategori, atau ketik nama produknya.' },
      { judul: 'Isi pesanan', ket: 'Nama, alamat, lalu pilih COD atau transfer.' },
      { judul: 'Lanjut di WhatsApp', ket: 'Penjual konfirmasi, lalu kalian atur pengantarannya di WA.' },
    ],
  },
  {
    peran: 'Jualan',
    icon: Store,
    langkah: [
      { judul: 'Daftar toko', ket: 'Gratis. Admin cek dulu sebelum tokomu tampil.' },
      { judul: 'Pajang produk', ket: 'Foto, nama, harga, stok. Ukuran atau rasa beda? Pakai varian.' },
      { judul: 'Terima pesanan', ket: 'Pesanan baru masuk ke WA-mu. Konfirmasi, lalu atur pengantarannya.' },
    ],
  },
];

const untung = [
  'Pajang sebanyak yang kamu mau',
  'Pembeli langsung chat kamu di WA',
  'COD atau transfer, terserah kamu',
  'Cukup bisa pakai HP',
];

const bukaTokoDest = computed(() => {
  if (authStore.role === 'penjual') return '/toko/dashboard';
  if (authStore.user) return '/buka-toko';
  return '/register?peran=penjual';
});

onMounted(async () => {
  const { data: produk } = await supabase
    .from('produk')
    .select('*, toko(nama_toko, alamat, status)')
    .eq('status', 'AKTIF')
    .order('created_at', { ascending: false })
    .limit(8);

  produkTerbaru.value = produk?.filter((p) => p.toko?.status === 'AKTIF') ?? [];
  loadingProduk.value = false;

  const [{ count: jProduk }, { count: jToko }, { data: alamatData }] =
    await Promise.all([
      supabase
        .from('produk')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'AKTIF'),
      supabase
        .from('toko')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'AKTIF'),
      supabase.from('toko').select('alamat').eq('status', 'AKTIF'),
    ]);

  stats.value = {
    produk: jProduk ?? 0,
    toko: jToko ?? 0,
    alamat: new Set(alamatData?.map((t) => t.alamat).filter(Boolean)).size,
  };
  statsSiap.value = true;
});
</script>

<style scoped>
/* ── Papan gantung (tanda tangan visual) ───────────────────── */
.gantung {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  transform-origin: 50% 0;
}
.tali {
  width: 100%;
  height: 26px;
  overflow: visible;
}
.tali path {
  fill: none;
  stroke: var(--tinta);
  stroke-width: 2.5;
  vector-effect: non-scaling-stroke;
}
.tali circle {
  fill: var(--tinta);
}
.ayun {
  animation: ayun 2.2s var(--ease-out) 0.25s both;
}
.ayun-lambat {
  animation-duration: 3s;
}
.gantung:hover {
  animation: ayun-kecil 1.4s var(--ease-out);
}
@keyframes ayun {
  0% { transform: rotate(9deg); }
  22% { transform: rotate(-6deg); }
  44% { transform: rotate(3.5deg); }
  64% { transform: rotate(-1.8deg); }
  82% { transform: rotate(0.8deg); }
  100% { transform: rotate(0deg); }
}
@keyframes ayun-kecil {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(4deg); }
  55% { transform: rotate(-2.5deg); }
  80% { transform: rotate(1deg); }
  100% { transform: rotate(0deg); }
}

/* ── Papan depan ───────────────────────────────────────────── */
.depan {
  background: var(--merah);
  color: #fff;
  border-bottom: 3px solid var(--tinta);
  padding: 1.5rem 0 3.25rem;
  overflow: hidden;
}
.depan-dalam {
  display: grid;
  gap: 2.5rem;
  align-items: center;
}
@media (min-width: 980px) {
  .depan {
    padding: 2rem 0 4.5rem;
  }
  .depan-dalam {
    grid-template-columns: 1.25fr 0.75fr;
    gap: 3rem;
  }
}

.gantung-kecil .tali {
  width: 120px;
}
.papan-sapa {
  display: inline-block;
  padding: 0.45rem 0.85rem 0.4rem;
  background: var(--kuning);
  color: var(--tinta);
  border: var(--tebal) solid var(--garis);
  border-radius: 6px;
  font-family: var(--font-papan);
  font-size: 0.95rem;
  line-height: 1;
}

.depan-judul {
  margin-top: 1.25rem;
  font-size: clamp(2.35rem, 8.4vw, 5rem);
  line-height: 1.02;
}
.depan-judul span {
  display: block;
}
.baris-1 {
  color: #fff;
}
.baris-2 {
  color: var(--kuning);
}
.depan-sub {
  margin-top: 1.4rem;
  font-size: 1.12rem;
  line-height: 1.6;
  max-width: 50ch;
  color: #fff;
}

.depan-pintu {
  display: grid;
  gap: 0.85rem;
  margin-top: 1.9rem;
  max-width: 640px;
}
@media (min-width: 620px) {
  .depan-pintu {
    grid-template-columns: 1fr 1fr;
  }
}
.pintu {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1.05rem 1.1rem;
  color: var(--tinta);
  text-decoration: none;
  transition: transform 0.3s var(--ease-out);
}
.pintu:hover {
  transform: translateY(-3px) rotate(-0.6deg);
}
.pintu-ikon {
  flex-shrink: 0;
}
.pintu-teks {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  flex: 1;
  min-width: 0;
}
.pintu-judul {
  font-family: var(--font-papan);
  font-size: 1.08rem;
  line-height: 1.1;
}
.pintu-ket {
  font-size: 0.9rem;
  color: var(--tinta-2);
  line-height: 1.35;
}
.papan-kuning .pintu-ket {
  color: #3a2f00;
}
.pintu-panah {
  flex-shrink: 0;
  transition: transform 0.3s var(--ease-out);
}
.pintu:hover .pintu-panah {
  transform: translateX(4px);
}

.depan-hitung {
  margin-top: 1.4rem;
  font-size: 1rem;
  color: #ffe9ea;
}
.depan-hitung strong {
  color: #fff;
  font-size: 1.08rem;
}

/* Etalase */
.etalase-judul {
  font-family: var(--font-papan);
  font-size: 1rem;
  color: var(--kuning);
  margin-bottom: 0.9rem;
}
.etalase-deret {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}
@media (min-width: 980px) {
  .etalase-deret {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  .etalase-papan:first-child {
    grid-column: 1 / -1;
  }
}
.etalase-papan {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem 0.5rem 0.75rem;
  background: var(--papan);
  color: var(--tinta);
  border: var(--tebal) solid var(--garis);
  border-radius: var(--sudut);
  text-decoration: none;
  transform: rotate(var(--miring, 0deg));
  transition: transform 0.35s var(--ease-out);
}
.etalase-papan:hover {
  transform: rotate(0deg) translateY(-4px);
}
.etalase-foto {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border: 2px solid var(--tinta);
  border-radius: 4px;
  background: var(--dinding);
}
.etalase-papan:first-child .etalase-foto {
  aspect-ratio: 16 / 10;
}
.etalase-nama {
  font-weight: 700;
  font-size: 0.92rem;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.etalase-papan .plat-harga {
  align-self: flex-start;
  font-size: 0.85rem;
}
@media (max-width: 560px) {
  .etalase-papan {
    padding: 0.35rem 0.35rem 0.55rem;
  }
  .etalase-nama {
    font-size: 0.8rem;
  }
  .etalase-papan .plat-harga {
    font-size: 0.72rem;
  }
}
.kerangka-papan {
  transform: none;
}

/* ── Bagian umum ───────────────────────────────────────────── */
.bagian {
  padding: 3.5rem 0;
  background: var(--papan);
}
@media (min-width: 768px) {
  .bagian {
    padding: 5rem 0;
  }
}
.bagian-dinding {
  background: var(--dinding);
  border-top: 3px solid var(--tinta);
}
.bagian-kuning {
  background: var(--kuning);
  border-top: 3px solid var(--tinta);
}
.bagian-hijau {
  background: var(--hijau);
  color: #fff;
  border-top: 3px solid var(--tinta);
}
.judul-bagian {
  font-size: clamp(1.6rem, 4.6vw, 2.5rem);
}
.sub-bagian {
  margin-top: 0.45rem;
  color: var(--tinta-2);
  font-size: 1.05rem;
}
.bagian-kuning .sub-bagian {
  color: #3a2f00;
}
.kepala-bagian {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.75rem;
}

/* Kategori */
.kategori-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
  margin-top: 1.75rem;
}
@media (min-width: 720px) {
  .kategori-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1rem;
  }
}
.papan-kategori {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  min-height: 128px;
  padding: 1.1rem 1rem 1rem;
  text-decoration: none;
  transform-origin: 50% 0;
  transition: transform 0.4s var(--ease-out);
}
.papan-kategori:nth-child(odd) {
  transform: rotate(-0.8deg);
}
.papan-kategori:nth-child(even) {
  transform: rotate(0.6deg);
}
.papan-kategori:hover {
  transform: rotate(0deg) translateY(-3px);
}
.kat-ikon {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  background: var(--papan);
  color: var(--tinta);
  border: var(--tebal) solid var(--garis);
  border-radius: 50%;
}
.kat-nama {
  font-family: var(--font-papan);
  font-size: 1rem;
  line-height: 1.15;
  margin-top: auto;
}

/* Cara kerja */
.cara-grid {
  display: grid;
  gap: 1rem;
  margin-top: 1.75rem;
}
@media (min-width: 820px) {
  .cara-grid {
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
}
.cara-papan {
  padding: 1.5rem 1.4rem;
}
.cara-peran {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-family: var(--font-papan);
  font-weight: 400;
  font-size: 1.2rem;
  padding-bottom: 1rem;
  border-bottom: var(--tebal) solid var(--garis);
}
.cara-langkah {
  list-style: none;
  display: flex;
  flex-direction: column;
}
.cara-langkah li {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--garis-lembut);
}
.cara-langkah li:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}
.langkah-no {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  background: var(--merah);
  color: #fff;
  border: var(--tebal) solid var(--garis);
  border-radius: 50%;
  font-size: 1.05rem;
}
.langkah-judul {
  display: block;
  font-weight: 700;
  font-size: 1.05rem;
}
.langkah-ket {
  display: block;
  color: var(--tinta-2);
  margin-top: 0.1rem;
}

/* Ajakan penjual */
.ajakan {
  display: grid;
  gap: 2.5rem;
  align-items: center;
}
@media (min-width: 900px) {
  .ajakan {
    grid-template-columns: 1.3fr 0.7fr;
  }
}
.ajakan-judul {
  color: #fff;
  max-width: 16ch;
}
.ajakan-ket {
  margin-top: 1rem;
  font-size: 1.08rem;
  max-width: 52ch;
  color: #e6f4ea;
}
.ajakan-daftar {
  list-style: none;
  margin: 1.5rem 0 2rem;
  display: grid;
  gap: 0.65rem;
}
.ajakan-daftar li {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-weight: 700;
  font-size: 1.05rem;
}
.ajakan-daftar svg {
  flex-shrink: 0;
  color: var(--kuning);
}

.ajakan-papan {
  display: flex;
  justify-content: center;
}
.ajakan-papan .gantung {
  width: min(300px, 80vw);
}
.ajakan-papan .tali {
  height: 44px;
  width: 70%;
}
.papan-buka {
  width: 100%;
  padding: 1.5rem 1rem 1.25rem;
  background: var(--papan);
  color: var(--merah);
  border: 3px solid var(--tinta);
  border-radius: 10px;
  box-shadow:
    inset 0 0 0 6px var(--papan),
    inset 0 0 0 9px var(--merah),
    0 18px 30px rgba(0, 0, 0, 0.25);
  text-align: center;
}
.buka-kata {
  display: block;
  font-size: clamp(3.2rem, 9vw, 4.6rem);
  line-height: 1;
}
.buka-ket {
  display: block;
  margin-top: 0.5rem;
  color: var(--tinta);
  font-weight: 700;
  font-size: 1rem;
}
@media (max-width: 899px) {
  .ajakan-papan {
    order: -1;
  }
  .ajakan-papan .gantung {
    width: 220px;
  }
}
</style>
