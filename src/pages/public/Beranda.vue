<template>
  <LayoutPublic>
    <!--
      THESIS: Beranda yang tenang dan resmi tapi hangat: lengkung pintu, hijau sungai, ruang napas. Menolak papan warung bersudut keras.
      OWN-WORLD: kabut sage #F4F6F2, hijau sungai #1F4D42, aprikot #F4B98A hanya untuk sorotan kecil, huruf Young Serif + Figtree, bingkai foto berbentuk lengkung, kartu putih bersudut 24-28px, bayangan sangat tipis.
      STORY: pembeli paham ini etalase tetangga satu kelurahan, lalu memilih belanja atau jualan.
      FIRST VIEWPORT: kiri tagline serif besar + dua tombol pil + hitungan nyata; kanan tiga lengkung foto produk asli terbaru.
      FORM: lengkung pintu / etalase lembut.
      FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
    -->
    <div class="beranda">
      <!-- DEPAN -->
      <section class="depan">
        <div class="wadah depan-dalam">
          <div class="depan-teks">
            <p class="sapa">Uluh Itah Kia</p>

            <h1 class="depan-judul">
              Bapapili mangat,
              <span class="depan-judul-2">Bajualan mangat kia.</span>
            </h1>

            <p class="depan-sub">
              Tempat warga <strong>Kelurahan Bangkuang</strong> berjualan dan berbelanja.
              Pesan di sini, selesaikan lewat WhatsApp.
            </p>

            <div class="depan-aksi">
              <RouterLink to="/produk" class="btn btn-utama">
                <ShoppingBasket :size="22" :stroke-width="2" />
                Mau belanja
                <ArrowRight :size="20" :stroke-width="2" />
              </RouterLink>
              <RouterLink :to="bukaTokoDest" class="btn btn-lembut">
                <Store :size="22" :stroke-width="2" />
                Mau jualan
              </RouterLink>
            </div>

            <p v-if="statsSiap" class="depan-hitung">
              Sudah ada <strong>{{ stats.produk }}</strong> produk dari
              <strong>{{ stats.toko }}</strong> toko tetangga.
            </p>
          </div>

          <!-- Etalase: produk asli terbaru -->
          <div v-if="loadingProduk || etalase.length" class="etalase" aria-label="Baru dipajang">
            <template v-if="loadingProduk">
              <div v-for="n in 3" :key="n" class="lengkung-kerangka"></div>
            </template>
            <RouterLink
              v-for="p in etalase"
              v-else
              :key="p.id"
              :to="`/produk/${p.id}`"
              class="lengkung"
            >
              <img :src="p.foto_url" :alt="p.nama_produk" class="lengkung-foto" />
              <span class="lengkung-nama">{{ p.nama_produk }}</span>
              <span class="lengkung-harga">{{ formatHargaProduk(p) }}</span>
            </RouterLink>
          </div>
        </div>
      </section>

      <!-- KATEGORI: deret pil yang bisa digeser -->
      <section class="bagian bagian-rapat">
        <div class="wadah">
          <h2 class="judul-bagian">Mau cari apa?</h2>
          <div class="rel" role="list">
            <RouterLink
              v-for="kat in kategori"
              :key="kat.slug"
              :to="`/produk?kategori=${kat.slug}`"
              class="pil"
              role="listitem"
            >
              <span class="pil-ikon"><component :is="kat.icon" :size="20" :stroke-width="1.75" /></span>
              {{ kat.label }}
            </RouterLink>
          </div>
        </div>
      </section>

      <!-- PRODUK TERBARU: satu sorotan besar + kartu kecil -->
      <section class="bagian bagian-sage">
        <div class="wadah">
          <div class="kepala-bagian">
            <div>
              <h2 class="judul-bagian">Baru dipajang</h2>
              <p class="sub-bagian">Yang paling baru dari tetangga.</p>
            </div>
            <RouterLink to="/produk" class="btn btn-garis">
              Lihat semua
              <ArrowRight :size="20" :stroke-width="2" />
            </RouterLink>
          </div>

          <div v-if="loadingProduk" class="bento">
            <div class="kerangka" style="border-radius: 28px; min-height: 280px"></div>
            <div v-for="n in 4" :key="n" class="kerangka" style="aspect-ratio: 3 / 4; border-radius: 24px"></div>
          </div>
          <div v-else-if="sisaProduk.length" class="bento">
            <RouterLink
              v-for="(p, i) in sisaProduk"
              :key="p.id"
              :to="`/produk/${p.id}`"
              class="kartu"
              :class="{ 'kartu-besar': i === 0 }"
            >
              <span class="kartu-foto">
                <img v-if="p.foto_url" :src="p.foto_url" :alt="p.nama_produk" loading="lazy" />
                <Store v-else :size="36" :stroke-width="1.5" />
              </span>
              <span class="kartu-isi">
                <span class="kartu-nama">{{ p.nama_produk }}</span>
                <span class="kartu-toko">{{ p.toko?.nama_toko }}</span>
                <span class="kartu-harga">{{ formatHargaProduk(p) }}</span>
              </span>
            </RouterLink>
          </div>
          <div v-else class="kosong-lembut">
            <Store :size="40" :stroke-width="1.5" />
            <h3>Etalase masih kosong</h3>
            <p>Belum ada yang jualan. Jadi yang pertama?</p>
            <RouterLink :to="bukaTokoDest" class="btn btn-utama">Buka toko gratis</RouterLink>
          </div>
        </div>
      </section>

      <!-- TETANGGA: toko aktif yang asli -->
      <section v-if="tokoAktif.length" class="bagian">
        <div class="wadah">
          <h2 class="judul-bagian">Kenalan sama tetangga</h2>
          <p class="sub-bagian">Toko yang sudah buka di Bangkuang.</p>
          <div class="tetangga">
            <RouterLink v-for="t in tokoAktif" :key="t.id" :to="`/toko/${t.id}`" class="tetangga-kartu">
              <span class="tetangga-foto">
                <img v-if="t.foto_toko" :src="t.foto_toko" :alt="`Foto ${t.nama_toko}`" loading="lazy" />
                <Store v-else :size="26" :stroke-width="1.75" />
              </span>
              <span class="tetangga-teks">
                <span class="tetangga-nama">{{ t.nama_toko }}</span>
                <span v-if="t.alamat" class="tetangga-alamat">
                  <MapPin :size="14" :stroke-width="2" />
                  {{ t.alamat }}
                </span>
              </span>
              <ArrowRight class="tetangga-panah" :size="20" :stroke-width="2" />
            </RouterLink>
          </div>
        </div>
      </section>

      <!-- CARA KERJA: pilih peran, tiga langkah mendatar -->
      <section class="bagian bagian-rapat">
        <div class="wadah">
          <h2 class="judul-bagian">Caranya gampang</h2>
          <p class="sub-bagian">Tiga langkah. Cukup pakai HP.</p>

          <div class="peran" role="tablist" aria-label="Pilih peran">
            <button
              v-for="(c, i) in caraKerja"
              :key="c.peran"
              type="button"
              role="tab"
              class="peran-tombol"
              :class="{ aktif: peranAktif === i }"
              :aria-selected="peranAktif === i"
              @click="peranAktif = i"
            >
              <component :is="c.icon" :size="20" :stroke-width="1.75" />
              {{ c.peran }}
            </button>
          </div>

          <ol :key="peranAktif" class="langkah">
            <li v-for="(l, i) in caraKerja[peranAktif].langkah" :key="l.judul" class="langkah-kotak">
              <span class="langkah-no">{{ i + 1 }}</span>
              <span class="langkah-judul">{{ l.judul }}</span>
              <span class="langkah-ket">{{ l.ket }}</span>
            </li>
          </ol>
        </div>
      </section>

      <!-- AJAKAN PENJUAL -->
      <section class="ajakan-bagian">
        <div class="wadah">
          <div class="ajakan">
            <div class="ajakan-teks">
              <h2 class="ajakan-judul">Punya dagangan andalan?</h2>
              <p class="ajakan-ket">
                Biasa jualan lewat status WA atau grup Facebook? Pajang juga di sini,
                biar tetangga gampang nemu dan pesan. Gratis.
              </p>
              <RouterLink :to="bukaTokoDest" class="btn btn-terang">
                Buka toko gratis
                <ArrowRight :size="20" :stroke-width="2" />
              </RouterLink>
            </div>
            <ul class="ajakan-daftar">
              <li v-for="u in untung" :key="u">
                <span class="cek"><Check :size="18" :stroke-width="2.5" /></span>
                {{ u }}
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  </LayoutPublic>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  ShoppingBasket,
  Store,
  ArrowRight,
  Check,
  MapPin,
} from 'lucide-vue-next';
import { supabase } from '@/lib/supabase';
import { formatHargaProduk } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import LayoutPublic from '@/layouts/LayoutPublic.vue';
import { KATEGORI } from '@/lib/kategori';

const authStore = useAuthStore();
const loadingProduk = ref(true);
const produkTerbaru = ref([]);
const stats = ref({ produk: 0, toko: 0, alamat: 0 });
const statsSiap = ref(false);
const tokoAktif = ref([]);
const peranAktif = ref(0);
const kategori = KATEGORI;

// Tiga produk terbaru yang punya foto, untuk etalase di bagian depan
const etalase = computed(() => produkTerbaru.value.filter((p) => p.foto_url).slice(0, 3));

// Produk di bagian "Baru dipajang": yang belum tampil di lengkung hero
const sisaProduk = computed(() =>
  produkTerbaru.value.filter((p) => !etalase.value.includes(p)).slice(0, 5),
);

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
      supabase
        .from('toko')
        .select('id, nama_toko, alamat, foto_toko')
        .eq('status', 'AKTIF')
        .order('created_at', { ascending: false })
        .limit(6),
    ]);

  tokoAktif.value = alamatData ?? [];
  stats.value = {
    produk: jProduk ?? 0,
    toko: jToko ?? 0,
    alamat: new Set(alamatData?.map((t) => t.alamat).filter(Boolean)).size,
  };
  statsSiap.value = true;
});
</script>

<style scoped>
.beranda {
  --kabut: #f4f6f2;
  --sage: #e5ece6;
  --sage-2: #cfdcd2;
  --sungai: #1f4d42;
  --sungai-dalam: #163a32;
  --aprikot: #f4b98a;
  --aprikot-muda: #fbe8d8;
  --langit-muda: #e3edf2;
  --mawar-muda: #f6e6e1;
  --ink: #1d2a26;
  --ink-2: #4a5a54;
  --bayang: 0 1px 2px rgba(29, 42, 38, 0.05), 0 8px 24px rgba(29, 42, 38, 0.06);
  --bayang-naik: 0 2px 4px rgba(29, 42, 38, 0.06), 0 16px 36px rgba(29, 42, 38, 0.1);
  --font-judul: 'Young Serif', Georgia, serif;
  --font-badan: 'Figtree', 'Atkinson Hyperlegible Next', system-ui, sans-serif;
  font-family: var(--font-badan);
  color: var(--ink);
  background: var(--kabut);
}

/* ── Tombol ────────────────────────────────────────────────── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  min-height: 52px;
  padding: 0 1.5rem;
  border-radius: 999px;
  border: 1.5px solid transparent;
  font-family: var(--font-badan);
  font-size: 1.02rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color 0.25s ease,
    box-shadow 0.25s ease,
    transform 0.25s var(--ease-out);
}
.btn:hover {
  transform: translateY(-2px);
}
.btn:active {
  transform: translateY(0);
}
.btn-utama {
  background: var(--sungai);
  color: #fff;
  box-shadow: 0 6px 18px rgba(31, 77, 66, 0.22);
}
.btn-utama:hover {
  background: var(--sungai-dalam);
  box-shadow: 0 10px 24px rgba(31, 77, 66, 0.28);
}
.btn-lembut {
  background: #fff;
  color: var(--sungai);
  border-color: var(--sage-2);
}
.btn-lembut:hover {
  background: var(--sage);
}
.btn-garis {
  background: transparent;
  color: var(--sungai);
  border-color: var(--sungai);
}
.btn-garis:hover {
  background: #fff;
}
.btn-terang {
  background: var(--aprikot);
  color: var(--sungai-dalam);
}
.btn-terang:hover {
  background: #f7c6a0;
}

/* ── Depan ─────────────────────────────────────────────────── */
.depan {
  padding: 2.5rem 0 3.5rem;
  background:
    radial-gradient(900px 420px at 88% -10%, var(--sage) 0%, transparent 70%),
    var(--kabut);
}
.depan-dalam {
  display: grid;
  gap: 2.75rem;
  align-items: center;
}
@media (min-width: 980px) {
  .depan {
    padding: 4rem 0 5.5rem;
  }
  .depan-dalam {
    grid-template-columns: 1.1fr 0.9fr;
    gap: 4rem;
  }
}
.sapa {
  display: inline-block;
  padding: 0.4rem 1rem;
  background: var(--aprikot-muda);
  color: #7a4a24;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}
.depan-judul {
  margin-top: 1.25rem;
  font-family: var(--font-judul);
  font-weight: 400;
  font-size: clamp(2.3rem, 7vw, 4.1rem);
  line-height: 1.08;
  letter-spacing: -0.01em;
  color: var(--sungai);
  text-wrap: balance;
}
.depan-judul-2 {
  display: block;
  color: var(--ink);
}
.depan-sub {
  margin-top: 1.4rem;
  max-width: 48ch;
  font-size: 1.14rem;
  line-height: 1.65;
  color: var(--ink-2);
}
.depan-sub strong {
  color: var(--ink);
}
.depan-aksi {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  margin-top: 2rem;
}
.depan-hitung {
  margin-top: 1.5rem;
  color: var(--ink-2);
  font-size: 1rem;
}
.depan-hitung strong {
  color: var(--sungai);
  font-size: 1.1rem;
}

/* Lengkung pintu: foto produk asli */
.etalase {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  align-items: end;
}
@media (min-width: 980px) {
  .etalase {
    gap: 1rem;
  }
}
.lengkung {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  text-decoration: none;
  color: var(--ink);
  transition: transform 0.4s var(--ease-out);
}
.lengkung:nth-child(1) .lengkung-foto {
  aspect-ratio: 3 / 5.2;
}
.lengkung:nth-child(2) .lengkung-foto {
  aspect-ratio: 3 / 4.2;
}
.lengkung:nth-child(3) .lengkung-foto {
  aspect-ratio: 3 / 4.7;
}
.lengkung:hover {
  transform: translateY(-6px);
}
.lengkung-foto {
  width: 100%;
  object-fit: cover;
  border-radius: 999px 999px 22px 22px;
  background: var(--sage);
  box-shadow: var(--bayang);
  margin-bottom: 0.4rem;
}
.lengkung-nama {
  font-weight: 700;
  font-size: 0.95rem;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.lengkung-harga {
  font-size: 0.9rem;
  color: var(--sungai);
  font-weight: 700;
}
.lengkung-kerangka {
  aspect-ratio: 3 / 4.6;
  border-radius: 999px 999px 22px 22px;
  background: linear-gradient(100deg, var(--sage) 30%, #f0f4f0 50%, var(--sage) 70%);
  background-size: 200% 100%;
  animation: kilau 1.6s ease-in-out infinite;
}
@keyframes kilau {
  to {
    background-position: -200% 0;
  }
}
@media (max-width: 560px) {
  .lengkung-nama {
    font-size: 0.8rem;
  }
  .lengkung-harga {
    font-size: 0.78rem;
  }
}

/* ── Bagian umum ───────────────────────────────────────────── */
.bagian {
  padding: 3.5rem 0;
  background: var(--kabut);
}
.bagian-sage {
  background: var(--sage);
  border-radius: 36px;
}
@media (min-width: 768px) {
  .bagian {
    padding: 5rem 0;
  }
  .bagian-sage {
    border-radius: 56px;
  }
}
.judul-bagian {
  font-family: var(--font-judul);
  font-weight: 400;
  font-size: clamp(1.7rem, 4.4vw, 2.5rem);
  line-height: 1.15;
  color: var(--sungai);
}
.sub-bagian {
  margin-top: 0.5rem;
  color: var(--ink-2);
  font-size: 1.06rem;
}
.kepala-bagian {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

/* ── Kategori: deret pil ───────────────────────────────────── */
.bagian-rapat {
  padding: 2.5rem 0;
}
.rel {
  display: flex;
  gap: 0.65rem;
  margin: 1.25rem -1.25rem 0;
  padding: 0.25rem 1.25rem 0.75rem;
  overflow-x: auto;
  scroll-snap-type: x proximity;
  scrollbar-width: none;
}
.rel::-webkit-scrollbar {
  display: none;
}
@media (min-width: 1200px) {
  .rel {
    flex-wrap: wrap;
    margin: 1.25rem 0 0;
    padding: 0.25rem 0;
    overflow: visible;
  }
}
.pil {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  min-height: 52px;
  padding: 0.35rem 1.25rem 0.35rem 0.4rem;
  background: #fff;
  border-radius: 999px;
  box-shadow: var(--bayang);
  color: var(--ink);
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  scroll-snap-align: start;
  transition:
    transform 0.25s var(--ease-out),
    box-shadow 0.25s ease;
}
.pil:hover {
  transform: translateY(-3px);
  box-shadow: var(--bayang-naik);
}
.pil-ikon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--sage);
  color: var(--sungai);
}
.pil:nth-child(4n + 2) .pil-ikon {
  background: var(--langit-muda);
}
.pil:nth-child(4n + 3) .pil-ikon {
  background: var(--aprikot-muda);
  color: #8a4f22;
}
.pil:nth-child(4n) .pil-ikon {
  background: var(--mawar-muda);
  color: #8a3b30;
}

/* ── Kartu produk terbaru ──────────────────────────────────── */
.bento {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}
.bento > :first-child {
  grid-column: 1 / -1;
}
@media (min-width: 900px) {
  .bento {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1.25rem;
  }
  .bento > :first-child {
    grid-column: span 2;
    grid-row: span 2;
  }
}
.kartu-besar .kartu-foto {
  aspect-ratio: auto;
  flex: 1;
  min-height: 260px;
}
.kartu-besar .kartu-isi {
  padding: 1.25rem 1.5rem 1.5rem;
}
.kartu-besar .kartu-nama {
  font-family: var(--font-judul);
  font-weight: 400;
  font-size: 1.5rem;
  line-height: 1.2;
  color: var(--sungai);
}
.kartu-besar .kartu-harga {
  font-size: 1.2rem;
}
.kartu {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: var(--bayang);
  text-decoration: none;
  color: var(--ink);
  transition:
    transform 0.3s var(--ease-out),
    box-shadow 0.3s ease;
}
.kartu:hover {
  transform: translateY(-4px);
  box-shadow: var(--bayang-naik);
}
.kartu-foto {
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  background: var(--sage);
  color: var(--sungai);
  overflow: hidden;
}
.kartu-foto img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s var(--ease-out);
}
.kartu:hover .kartu-foto img {
  transform: scale(1.04);
}
.kartu-isi {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.9rem 1rem 1.1rem;
}
.kartu-nama {
  font-weight: 700;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.kartu-toko {
  font-size: 0.88rem;
  color: var(--ink-2);
}
.kartu-harga {
  margin-top: 0.35rem;
  font-weight: 800;
  color: var(--sungai);
  font-size: 1.05rem;
}
.kosong-lembut {
  display: grid;
  justify-items: center;
  gap: 0.6rem;
  padding: 3rem 1rem;
  text-align: center;
  background: #fff;
  border-radius: 28px;
  color: var(--sungai);
}
.kosong-lembut p {
  color: var(--ink-2);
  margin-bottom: 0.6rem;
}

/* ── Tetangga ──────────────────────────────────────────────── */
.tetangga {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 0.85rem;
  margin-top: 1.75rem;
}
.tetangga-kartu {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 1.1rem 0.9rem 0.9rem;
  background: #fff;
  border-radius: 999px;
  box-shadow: var(--bayang);
  text-decoration: none;
  color: var(--ink);
  transition:
    transform 0.3s var(--ease-out),
    box-shadow 0.3s ease;
}
.tetangga-kartu:hover {
  transform: translateY(-3px);
  box-shadow: var(--bayang-naik);
}
.tetangga-foto {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--sage);
  color: var(--sungai);
  overflow: hidden;
}
.tetangga-foto img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.tetangga-teks {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.tetangga-nama {
  font-weight: 700;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tetangga-alamat {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.88rem;
  color: var(--ink-2);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.tetangga-panah {
  flex-shrink: 0;
  color: var(--sungai);
  transition: transform 0.3s var(--ease-out);
}
.tetangga-kartu:hover .tetangga-panah {
  transform: translateX(4px);
}

/* ── Cara kerja ────────────────────────────────────────────── */
.peran {
  display: inline-flex;
  gap: 0.25rem;
  margin-top: 1.5rem;
  padding: 0.3rem;
  background: var(--sage);
  border-radius: 999px;
}
.peran-tombol {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 48px;
  padding: 0 1.4rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--ink-2);
  font-family: var(--font-badan);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 0.25s ease,
    color 0.25s ease,
    box-shadow 0.25s ease;
}
.peran-tombol.aktif {
  background: #fff;
  color: var(--sungai);
  box-shadow: var(--bayang);
}
.langkah {
  list-style: none;
  display: grid;
  gap: 0.85rem;
  margin-top: 1.5rem;
}
@media (min-width: 820px) {
  .langkah {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.25rem;
  }
}
.langkah-kotak {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 1.5rem;
  background: #fff;
  border-radius: 28px;
  box-shadow: var(--bayang);
  animation: muncul 0.5s var(--ease-out) both;
}
.langkah-kotak:nth-child(2) {
  animation-delay: 0.07s;
}
.langkah-kotak:nth-child(3) {
  animation-delay: 0.14s;
}
.langkah-no {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  margin-bottom: 0.6rem;
  border-radius: 50%;
  background: var(--aprikot-muda);
  color: #7a4a24;
  font-family: var(--font-judul);
  font-size: 1.15rem;
}
.langkah-judul {
  font-weight: 800;
  font-size: 1.1rem;
}
.langkah-ket {
  color: var(--ink-2);
  line-height: 1.55;
}

/* ── Ajakan penjual ────────────────────────────────────────── */
.ajakan-bagian {
  padding: 1rem 0 4rem;
  background: var(--kabut);
}
.ajakan {
  display: grid;
  gap: 2rem;
  align-items: center;
  padding: 2.25rem 1.5rem;
  background: var(--sungai);
  color: #fff;
  border-radius: 36px;
}
@media (min-width: 900px) {
  .ajakan {
    grid-template-columns: 1.2fr 0.8fr;
    gap: 3rem;
    padding: 3.5rem;
    border-radius: 48px;
  }
}
.ajakan-judul {
  font-family: var(--font-judul);
  font-weight: 400;
  font-size: clamp(1.8rem, 4.6vw, 2.6rem);
  line-height: 1.15;
  max-width: 16ch;
}
.ajakan-ket {
  margin: 1rem 0 1.75rem;
  max-width: 50ch;
  font-size: 1.08rem;
  line-height: 1.65;
  color: #d5e5dc;
}
.ajakan-daftar {
  list-style: none;
  display: grid;
  gap: 0.6rem;
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 24px;
}
.ajakan-daftar li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.35rem 0;
  font-weight: 600;
  font-size: 1.03rem;
}
.cek {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--aprikot);
  color: var(--sungai-dalam);
}

/* ── Gerak halus saat muncul ───────────────────────────────── */
@media (prefers-reduced-motion: no-preference) {
  .depan-teks > *,
  .etalase {
    animation: muncul 0.8s var(--ease-out) both;
  }
  .depan-teks > :nth-child(2) {
    animation-delay: 0.06s;
  }
  .depan-teks > :nth-child(3) {
    animation-delay: 0.12s;
  }
  .depan-teks > :nth-child(4) {
    animation-delay: 0.18s;
  }
  .depan-teks > :nth-child(5) {
    animation-delay: 0.24s;
  }
  .etalase {
    animation-delay: 0.2s;
  }
}
@keyframes muncul {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
</style>
