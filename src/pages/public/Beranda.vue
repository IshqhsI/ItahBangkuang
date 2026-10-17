<template>
  <LayoutPublic>
    <!--
      THESIS: Beranda yang tenang dan resmi tapi hangat: lengkung pintu, hijau sungai, ruang napas. Menolak papan warung bersudut keras.
      OWN-WORLD: kabut sage #F4F6F2, hijau sungai #1F4D42, aprikot #F4B98A hanya untuk sorotan kecil, huruf Besley + Schibsted Grotesk, bingkai foto berbentuk lengkung, kartu putih bersudut 24-28px, bayangan sangat tipis.
      STORY: pembeli paham ini etalase tetangga satu kelurahan, lalu memilih belanja atau jualan.
      FIRST VIEWPORT: kiri tagline serif besar + dua tombol pil; kanan kartu pencarian hijau sage (cari, kategori, hitungan nyata).
      FORM: beranda marketplace yang tenang, pencarian di depan.
      FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
    -->
    <div class="beranda">
      <!-- DEPAN -->
      <section class="depan">
        <div class="wadah depan-dalam">
          <div class="depan-teks">
            <p class="sapa">Marketplace Kelurahan Bangkuang</p>

            <h1 class="depan-judul">
              Belanja produk lokal,
              <span class="depan-judul-2">langsung dari warga.</span>
            </h1>

            <p class="depan-sub">
              Telusuri produk dan jasa dari warga <strong>Kelurahan Bangkuang</strong>. Pilih produk,
              pesan di sini, lalu selesaikan transaksi melalui WhatsApp.
            </p>

            <div class="depan-aksi">
              <RouterLink to="/produk" class="btn btn-utama">
                <ShoppingBasket :size="22" :stroke-width="2" />
                Lihat produk
                <ArrowRight :size="20" :stroke-width="2" />
              </RouterLink>
              <RouterLink :to="bukaTokoDest" class="btn btn-lembut">
                <Store :size="22" :stroke-width="2" />
                Buka toko gratis
              </RouterLink>
            </div>
          </div>

          <!-- Kartu pencarian -->
          <div class="cari-kartu">
            <p class="cari-judul">Cari produk</p>

            <form class="cari-form" role="search" @submit.prevent="cariProduk">
              <label for="cari-beranda" class="sr-only">Cari produk</label>
              <Search class="cari-ikon" :size="22" :stroke-width="2" aria-hidden="true" />
              <input
                id="cari-beranda"
                v-model="kataCari"
                type="search"
                class="cari-input"
                placeholder="Cari produk atau jasa"
                enterkeyhint="search"
                autocomplete="off"
              />
              <button type="submit" class="cari-tombol">Cari</button>
            </form>

            <p class="cari-label">Atau telusuri kategori</p>
            <div class="cari-chip-deret">
              <RouterLink
                v-for="kat in kategori"
                :key="kat.slug"
                :to="`/produk?kategori=${kat.slug}`"
                class="cari-chip"
              >
                <component :is="kat.icon" :size="16" :stroke-width="2" />
                {{ kat.label }}
              </RouterLink>
            </div>

            <dl v-if="statsSiap" class="cari-hitung">
              <div>
                <dt>Produk</dt>
                <dd>{{ stats.produk }}</dd>
              </div>
              <div>
                <dt>Toko aktif</dt>
                <dd>{{ stats.toko }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <!-- PRODUK TERBARU: satu sorotan besar + kartu kecil -->
      <section class="bagian bagian-sage">
        <div class="wadah">
          <div class="kepala-bagian">
            <div>
              <p class="kicker"><span>01</span>Produk</p>
          <h2 class="judul-bagian">Produk terbaru</h2>
              <p class="sub-bagian">Produk yang baru ditambahkan penjual.</p>
            </div>
            <RouterLink to="/produk" class="btn btn-garis">
              Lihat semua produk
              <ArrowRight :size="20" :stroke-width="2" />
            </RouterLink>
          </div>

          <div v-if="loadingProduk" class="grid-produk">
            <div v-for="n in 8" :key="n" class="kerangka" style="aspect-ratio: 4 / 5.6; border-radius: 20px"></div>
          </div>
          <div v-else-if="sisaProduk.length" class="grid-produk">
            <RouterLink
              v-for="p in sisaProduk"
              :key="p.id"
              :to="`/produk/${p.id}`"
              class="kartu"
              :class="{ 'kartu-habis': totalStok(p) === 0 }"
            >
              <span class="kartu-foto">
                <img v-if="p.foto_url" :src="p.foto_url" :alt="p.nama_produk" loading="lazy" />
                <Store v-else :size="36" :stroke-width="1.5" />
                <span v-if="totalStok(p) === 0" class="habis">Habis</span>
                <span v-else-if="totalStok(p) <= 5" class="tag-sisa">Sisa {{ totalStok(p) }}</span>
              </span>
              <span class="kartu-isi">
                <span class="kartu-nama">{{ p.nama_produk }}</span>
                <span class="kartu-harga">{{ formatHargaProduk(p) }}</span>
                <span class="kartu-toko">
                  <Store :size="14" :stroke-width="2" />
                  <span class="kartu-toko-nama">{{ p.toko?.nama_toko }}</span>
                </span>
              </span>
            </RouterLink>
          </div>
          <div v-else class="kosong-lembut">
            <Store :size="40" :stroke-width="1.5" />
            <h3>Belum ada produk</h3>
            <p>Belum ada penjual yang menambahkan produk. Daftarkan toko Anda sekarang.</p>
            <RouterLink :to="bukaTokoDest" class="btn btn-utama">Buka toko gratis</RouterLink>
          </div>
        </div>
      </section>

      <!-- TETANGGA: toko aktif yang asli -->
      <section v-if="tokoAktif.length" class="bagian">
        <div class="wadah">
          <p class="kicker"><span>02</span>Toko</p>
          <h2 class="judul-bagian">Toko di Bangkuang</h2>
          <p class="sub-bagian">Toko yang sudah terdaftar dan aktif.</p>
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
          <p class="kicker"><span>03</span>Cara pakai</p>
          <h2 class="judul-bagian">Cara menggunakan</h2>
          <p class="sub-bagian">Tiga langkah, dapat dilakukan dari HP.</p>

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
              <h2 class="ajakan-judul">Jual produk Anda di sini.</h2>
              <p class="ajakan-ket">
                Buka toko gratis dan jangkau pembeli di Kelurahan Bangkuang.
                Pembeli menghubungi Anda langsung lewat WhatsApp.
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
import { useRouter } from 'vue-router';
import {
  ShoppingBasket,
  Store,
  ArrowRight,
  Check,
  MapPin,
  Search,
} from 'lucide-vue-next';
import { supabase } from '@/lib/supabase';
import { formatHargaProduk, totalStok } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import LayoutPublic from '@/layouts/LayoutPublic.vue';
import { KATEGORI } from '@/lib/kategori';

const authStore = useAuthStore();
const router = useRouter();
const kataCari = ref('');

const cariProduk = () => {
  const q = kataCari.value.trim();
  router.push(q ? { path: '/produk', query: { q } } : '/produk');
};
const loadingProduk = ref(true);
const produkTerbaru = ref([]);
const stats = ref({ produk: 0, toko: 0, alamat: 0 });
const statsSiap = ref(false);
const tokoAktif = ref([]);
const peranAktif = ref(0);
const kategori = KATEGORI;

// Produk di bagian "Produk terbaru": yang masih ada stok tampil duluan, yang habis di belakang
const sisaProduk = computed(() =>
  [...produkTerbaru.value]
    .sort((a, b) => Number(totalStok(a) === 0) - Number(totalStok(b) === 0))
    .slice(0, 8),
);

const caraKerja = [
  {
    peran: 'Saya pembeli',
    icon: ShoppingBasket,
    langkah: [
      { judul: 'Pilih produk', ket: 'Telusuri kategori atau cari berdasarkan nama produk.' },
      { judul: 'Isi pesanan', ket: 'Lengkapi nama dan alamat, lalu pilih COD atau transfer.' },
      { judul: 'Lanjut di WhatsApp', ket: 'Penjual mengonfirmasi, lalu pengantaran diatur langsung dengan penjual.' },
    ],
  },
  {
    peran: 'Saya penjual',
    icon: Store,
    langkah: [
      { judul: 'Daftarkan toko', ket: 'Gratis. Admin memeriksa toko sebelum ditampilkan.' },
      { judul: 'Tambah produk', ket: 'Isi foto, nama, harga, dan stok. Gunakan varian untuk ukuran atau rasa berbeda.' },
      { judul: 'Terima pesanan', ket: 'Pesanan baru tampil di halaman Pesanan. Konfirmasi, lalu atur pengantaran.' },
    ],
  },
];

const untung = [
  'Tambah produk tanpa batas',
  'Pesanan tercatat di halaman Pesanan',
  'COD atau transfer, sesuai pilihan Anda',
  'Cukup menggunakan HP',
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
  --font-judul: 'Besley', Georgia, serif;
  --font-badan: 'Schibsted Grotesk', 'Atkinson Hyperlegible Next', system-ui, sans-serif;
  font-family: var(--font-badan);
  font-variant-numeric: normal;
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
  grid-template-columns: minmax(0, 1fr);
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
.depan-teks,
.cari-kartu {
  min-width: 0;
}
.sapa {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--sungai);
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.sapa::before {
  content: '';
  width: 2.5rem;
  height: 1.5px;
  background: var(--sungai);
}
.depan-judul {
  margin-top: 1.25rem;
  font-family: var(--font-judul);
  font-weight: 600;
  font-size: clamp(2.3rem, 6vw, 3.9rem);
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: var(--sungai);
  text-wrap: balance;
}
.depan-judul-2 {
  display: block;
  font-style: italic;
  color: #3f7f6c;
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

/* Hiasan latar hero */
.depan {
  position: relative;
  overflow: hidden;
}
.depan::before {
  content: '';
  position: absolute;
  right: -6%;
  bottom: -30%;
  width: min(620px, 80vw);
  aspect-ratio: 1;
  border-radius: 50%;
  border: 1.5px solid var(--sage-2);
  box-shadow: 0 0 0 36px rgba(207, 220, 210, 0.22), 0 0 0 72px rgba(207, 220, 210, 0.12);
  pointer-events: none;
}
.depan::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 280px;
  height: 200px;
  background-image: radial-gradient(var(--sage-2) 1.5px, transparent 1.5px);
  background-size: 18px 18px;
  opacity: 0.7;
  pointer-events: none;
  mask-image: linear-gradient(135deg, #000, transparent 70%);
}
.depan-dalam {
  position: relative;
  z-index: 1;
}

/* Kartu pencarian hero */
.cari-kartu {
  position: relative;
  padding: 1.5rem 1.25rem 1.25rem;
  background: linear-gradient(160deg, #7db5a0 0%, #5f9d86 100%);
  border-radius: 32px;
  color: var(--sungai-dalam);
  box-shadow: 0 14px 32px rgba(63, 127, 108, 0.22);
}
@media (min-width: 980px) {
  .cari-kartu {
    padding: 2rem 1.9rem 1.6rem;
    border-radius: 36px;
  }
}
.cari-judul {
  font-family: var(--font-judul);
  font-size: clamp(1.5rem, 3vw, 2rem);
  line-height: 1.1;
  letter-spacing: -0.01em;
}
.cari-form {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.1rem;
  padding: 0.4rem 0.4rem 0.4rem 1rem;
  background: #fff;
  border-radius: 999px;
  box-shadow: 0 6px 18px rgba(22, 58, 50, 0.16);
  transition: box-shadow 0.25s ease;
}
.cari-form:focus-within {
  box-shadow:
    0 0 0 3px #fff,
    0 0 0 6px var(--sungai),
    0 6px 18px rgba(22, 58, 50, 0.16);
}
.cari-ikon {
  flex-shrink: 0;
  color: var(--ink-2);
}
.cari-input {
  flex: 1;
  min-width: 0;
  height: 48px;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--ink);
  font-family: var(--font-badan);
  font-size: 1.02rem;
}
.cari-input::placeholder {
  color: #6b7a74;
}
.cari-input::-webkit-search-cancel-button {
  appearance: none;
}
.cari-tombol {
  flex-shrink: 0;
  min-height: 48px;
  padding: 0 1.4rem;
  border: 0;
  border-radius: 999px;
  background: var(--sungai);
  color: #fff;
  font-family: var(--font-badan);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 0.25s ease,
    transform 0.2s var(--ease-out);
}
.cari-tombol:hover {
  background: var(--sungai-dalam);
}
.cari-tombol:active {
  transform: scale(0.97);
}
.cari-label {
  margin-top: 1.4rem;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--sungai-dalam);
}
.cari-chip-deret {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.7rem;
}
.cari-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 40px;
  padding: 0 0.95rem;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 999px;
  color: var(--sungai-dalam);
  font-size: 0.88rem;
  font-weight: 700;
  text-decoration: none;
  transition:
    background-color 0.2s ease,
    transform 0.25s var(--ease-out);
}
.cari-chip:hover {
  background: #fff;
  transform: translateY(-2px);
}
.cari-hitung {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 0.75rem;
  margin-top: 1.4rem;
  padding-top: 1.1rem;
  border-top: 1.5px solid rgba(22, 58, 50, 0.18);
}
.cari-hitung dt {
  font-size: 0.82rem;
  font-weight: 700;
  opacity: 0.85;
}
.cari-hitung dd {
  font-family: var(--font-judul);
  font-size: 2.2rem;
  line-height: 1.05;
}
@media (max-width: 560px) {
  .cari-chip {
    min-height: 44px;
  }
}
@media (max-width: 420px) {
  .cari-kartu {
    padding: 1.25rem 1rem 1.1rem;
    border-radius: 28px;
  }
  .cari-form {
    padding-left: 0.85rem;
  }
  .cari-tombol {
    padding: 0 1.05rem;
  }
}

/* ── Kicker bernomor ───────────────────────────────────────── */
.kicker {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.6rem;
  color: var(--ink-2);
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.kicker span {
  color: #b5683a;
}
.kicker::after {
  content: '';
  width: 3rem;
  height: 1.5px;
  background: var(--sage-2);
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
  font-weight: 600;
  font-size: clamp(2.2rem, 5.6vw, 3.4rem);
  line-height: 1.05;
  letter-spacing: -0.01em;
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

/* ── Bagian rapat ─────────────────────────────────────────── */
.bagian-rapat {
  padding: 2.5rem 0;
}
/* ── Kartu produk: pola marketplace (foto, nama, harga, toko) ── */
.grid-produk {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}
@media (min-width: 720px) {
  .grid-produk {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.1rem;
  }
}
@media (min-width: 1024px) {
  .grid-produk {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1.25rem;
  }
}
/* Tablet: 3 kolom, tampilkan 6 supaya baris terakhir tidak bolong */
@media (min-width: 720px) and (max-width: 1023px) {
  .grid-produk > :nth-child(n + 7) {
    display: none;
  }
}
.kartu {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  text-decoration: none;
  color: var(--ink);
  box-shadow: 0 1px 2px rgba(29, 42, 38, 0.06);
  transition:
    transform 0.3s var(--ease-out),
    box-shadow 0.3s ease;
}
.kartu:hover {
  transform: translateY(-3px);
  box-shadow: var(--bayang-naik);
}
.kartu-foto {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  background: var(--sage);
  color: var(--sungai);
  overflow: hidden;
}
.kartu-foto img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s var(--ease-out);
}
.kartu:hover .kartu-foto img {
  transform: scale(1.04);
}
/* Satu sinyal saja, hanya bila berarti: stok tinggal sedikit */
.tag-sisa {
  position: absolute;
  left: 0.6rem;
  bottom: 0.6rem;
  padding: 0.2rem 0.6rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 999px;
  color: #a8481f;
  font-size: 0.74rem;
  font-weight: 800;
}
.habis {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(244, 246, 242, 0.75);
  color: var(--ink);
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.kartu-habis .kartu-harga {
  color: var(--ink-2);
}
.kartu-isi {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.75rem 0.85rem 0.9rem;
}
.kartu-nama {
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.35;
  color: var(--ink);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.7em;
}
.kartu-harga {
  margin-top: 0.15rem;
  font-size: 1.08rem;
  font-weight: 800;
  color: var(--sungai);
}
.kartu-toko {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.15rem;
  font-size: 0.82rem;
  color: var(--ink-2);
  min-width: 0;
}
.kartu-toko svg {
  flex-shrink: 0;
}
.kartu-toko-nama {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
@media (max-width: 560px) {
  .kartu-isi {
    padding: 0.65rem 0.7rem 0.8rem;
  }
  .kartu-nama {
    font-size: 0.88rem;
  }
  .kartu-harga {
    font-size: 1rem;
  }
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
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr));
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
  grid-template-columns: minmax(0, 1fr);
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
  font-size: 1.3rem;
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
  grid-template-columns: minmax(0, 1fr);
  gap: 2rem;
  align-items: center;
  padding: 2.25rem 1.5rem;
  background: #3f7f6c;
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
  font-weight: 600;
  font-size: clamp(2.4rem, 6vw, 3.6rem);
  line-height: 1.02;
  max-width: 14ch;
}
.ajakan-ket {
  margin: 1rem 0 1.75rem;
  max-width: 50ch;
  font-size: 1.08rem;
  line-height: 1.65;
  color: #ecf5ef;
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
  .cari-kartu {
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
  .cari-kartu {
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
