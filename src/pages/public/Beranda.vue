<template>
  <LayoutPublic>
    <!--
      THESIS: Beranda yang tenang dan resmi tapi hangat: lengkung pintu, hijau sungai, ruang napas. Menolak papan warung bersudut keras.
      OWN-WORLD: kabut sage #F4F6F2, hijau sungai #1F4D42, aprikot #F4B98A hanya untuk sorotan kecil, huruf Instrument Serif + Hanken Grotesk, bingkai foto berbentuk lengkung, kartu putih bersudut 24-28px, bayangan sangat tipis.
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
            <p class="sapa">Dari warga, untuk warga</p>

            <h1 class="depan-judul">
              Belanja dari tetangga,
              <span class="depan-judul-2">Jualan untuk tetangga.</span>
            </h1>

            <p class="depan-sub">
              Etalase online warga <strong>Kelurahan Bangkuang</strong>. Pilih dagangan
              tetangga, pesan di sini, lalu urus pengantarannya lewat WhatsApp.
            </p>

            <div class="depan-aksi">
              <RouterLink to="/produk" class="btn btn-utama">
                <ShoppingBasket :size="22" :stroke-width="2" />
                Lihat dagangan
                <ArrowRight :size="20" :stroke-width="2" />
              </RouterLink>
              <RouterLink :to="bukaTokoDest" class="btn btn-lembut">
                <Store :size="22" :stroke-width="2" />
                Buka toko gratis
              </RouterLink>
            </div>

            <p v-if="statsSiap" class="depan-hitung">
              Sekarang ada <strong>{{ stats.produk }}</strong> produk dari
              <strong>{{ stats.toko }}</strong> toko tetangga.
            </p>
          </div>

          <!-- Etalase: produk asli terbaru -->
          <div v-if="loadingProduk || etalase.length" class="etalase" aria-label="Baru dipajang">
            <span class="etalase-lencana">
              <span class="titik"></span>
              Baru dipajang
            </span>
            <template v-if="loadingProduk">
              <div v-for="n in 3" :key="n" class="lengkung lengkung-kerangka"></div>
            </template>
            <RouterLink
              v-for="p in etalase"
              v-else
              :key="p.id"
              :to="`/produk/${p.id}`"
              class="lengkung"
            >
              <img :src="p.foto_url" :alt="p.nama_produk" class="lengkung-foto" />
              <span class="lengkung-info">
                <span class="lengkung-nama">{{ p.nama_produk }}</span>
                <span class="lengkung-harga">{{ formatHargaProduk(p) }}</span>
              </span>
            </RouterLink>
          </div>
        </div>
      </section>

      <!-- KATEGORI: deret pil yang bisa digeser -->
      <section class="bagian bagian-rapat">
        <div class="wadah">
          <p class="kicker"><span>01</span>Kategori</p>
          <h2 class="judul-bagian">Lagi cari apa hari ini?</h2>
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
              <p class="kicker"><span>02</span>Etalase</p>
          <h2 class="judul-bagian">Baru dipajang</h2>
              <p class="sub-bagian">Dagangan yang baru masuk etalase.</p>
            </div>
            <RouterLink to="/produk" class="btn btn-garis">
              Lihat semua produk
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
          <p class="kicker"><span>03</span>Toko</p>
          <h2 class="judul-bagian">Kenalan sama tetangga</h2>
          <p class="sub-bagian">Mereka yang sudah buka toko di sini.</p>
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
          <p class="kicker"><span>04</span>Cara pakai</p>
          <h2 class="judul-bagian">Alurnya sederhana</h2>
          <p class="sub-bagian">Tiga langkah, cukup dari HP.</p>

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
              <h2 class="ajakan-judul">Dagangan kamu layak dipajang.</h2>
              <p class="ajakan-ket">
                Selama ini jualan lewat status WA atau grup Facebook? Pajang juga di sini
                supaya lebih mudah ditemukan tetangga. Gratis.
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
    peran: 'Saya pembeli',
    icon: ShoppingBasket,
    langkah: [
      { judul: 'Pilih produk', ket: 'Telusuri kategori, atau cari langsung nama produknya.' },
      { judul: 'Isi pesanan', ket: 'Tulis nama dan alamat, lalu pilih COD atau transfer.' },
      { judul: 'Lanjut di WhatsApp', ket: 'Penjual mengonfirmasi, lalu kalian atur pengantarannya langsung.' },
    ],
  },
  {
    peran: 'Saya penjual',
    icon: Store,
    langkah: [
      { judul: 'Daftarkan toko', ket: 'Gratis. Admin memeriksa dulu sebelum tokomu tampil.' },
      { judul: 'Pajang produk', ket: 'Foto, nama, harga, stok. Beda ukuran atau rasa? Pakai varian.' },
      { judul: 'Terima pesanan', ket: 'Pesanan baru masuk ke WA-mu. Konfirmasi, lalu atur pengantarannya.' },
    ],
  },
];

const untung = [
  'Pajang produk sebanyak yang kamu mau',
  'Pesanan langsung masuk ke WA-mu',
  'COD atau transfer, kamu yang atur',
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
  --font-judul: 'Instrument Serif', Georgia, serif;
  --font-badan: 'Hanken Grotesk', 'Atkinson Hyperlegible Next', system-ui, sans-serif;
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
  font-weight: 400;
  font-size: clamp(2.6rem, 7.4vw, 4.6rem);
  line-height: 0.98;
  letter-spacing: -0.015em;
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
.depan-hitung {
  margin-top: 1.5rem;
  color: var(--ink-2);
  font-size: 1rem;
}
.depan-hitung strong {
  color: var(--sungai);
  font-size: 1.1rem;
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

/* Etalase hero: satu lengkung tinggi + dua lengkung pendek, keterangan menempel di foto */
.etalase {
  position: relative;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  grid-template-rows: auto 1fr 1fr;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.55);
  border: 1.5px solid #fff;
  border-radius: 40px 40px 28px 28px;
  box-shadow: var(--bayang);
  backdrop-filter: blur(6px);
}
@media (min-width: 980px) {
  .etalase {
    gap: 1rem;
    padding: 1.25rem;
    border-radius: 56px 56px 32px 32px;
  }
}
.etalase-lencana {
  grid-column: 1 / -1;
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.35rem 0.9rem;
  background: #fff;
  border-radius: 999px;
  color: var(--sungai);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.titik {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e0884e;
  box-shadow: 0 0 0 4px rgba(224, 136, 78, 0.2);
}
.lengkung {
  position: relative;
  display: block;
  min-height: 150px;
  overflow: hidden;
  text-decoration: none;
  color: var(--ink);
  background: var(--sage);
  border-radius: 999px 999px 22px 22px;
  transition: transform 0.4s var(--ease-out);
}
.lengkung:nth-of-type(1) {
  grid-row: 2 / 4;
  min-height: 340px;
}
@media (min-width: 980px) {
  .lengkung:nth-of-type(1) {
    min-height: 420px;
  }
}
.lengkung:nth-of-type(2) {
  border-radius: 28px 28px 22px 22px;
}
.lengkung:nth-of-type(3) {
  border-radius: 28px 28px 22px 22px;
}
.lengkung:hover {
  transform: translateY(-4px);
}
.lengkung-foto {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s var(--ease-out);
}
.lengkung:hover .lengkung-foto {
  transform: scale(1.05);
}
.lengkung-info {
  position: absolute;
  left: 0.55rem;
  right: 0.55rem;
  bottom: 0.55rem;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  padding: 0.55rem 0.8rem;
  background: rgba(255, 255, 255, 0.93);
  border-radius: 16px;
  backdrop-filter: blur(4px);
}
.lengkung-nama {
  font-weight: 700;
  font-size: 0.9rem;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.lengkung-harga {
  font-size: 0.85rem;
  color: var(--sungai);
  font-weight: 800;
}
.lengkung-kerangka {
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
  .etalase {
    padding: 0.75rem;
    border-radius: 32px 32px 24px 24px;
  }
  .lengkung:nth-of-type(1) {
    min-height: 300px;
  }
  .lengkung-info {
    left: 0.4rem;
    right: 0.4rem;
    bottom: 0.4rem;
    padding: 0.4rem 0.6rem;
  }
  .lengkung-nama {
    font-size: 0.78rem;
  }
  .lengkung-harga {
    font-size: 0.76rem;
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
  font-weight: 400;
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
  font-size: 2rem;
  line-height: 1.1;
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
  font-size: clamp(2.4rem, 6vw, 3.6rem);
  line-height: 1.02;
  max-width: 14ch;
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
