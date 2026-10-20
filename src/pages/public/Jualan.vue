<template>
  <LayoutPublic>
    <!-- PEMBUKA -->
    <section class="pembuka">
      <div class="wadah pembuka-dalam">
        <div class="pembuka-teks">
          <p class="kicker">Untuk penjual</p>
          <h1 class="pembuka-judul huruf-papan">Jualan Anda lebih mudah ditemukan warga Bangkuang</h1>
          <p class="pembuka-sub">
            Buka toko gratis di ItahBangkuang. Pembeli melihat produk Anda, memesan, lalu Anda dan pembeli
            menyelesaikannya lewat WhatsApp.
          </p>
          <div class="pembuka-aksi">
            <RouterLink :to="tujuanDaftar" class="tombol tombol-merah tombol-besar">
              <Store :size="20" :stroke-width="2.25" />
              Buka toko gratis
            </RouterLink>
            <a :href="tautanTanya" target="_blank" rel="noopener" class="tombol tombol-besar">
              <IkonWa :size="20" />
              Tanya dulu lewat WhatsApp
            </a>
          </div>
          <ul class="jaminan">
            <li><Check :size="18" :stroke-width="3" /> Gratis, tanpa potongan dari penjualan</li>
            <li><Check :size="18" :stroke-width="3" /> Toko langsung tampil setelah mendaftar</li>
            <li><Check :size="18" :stroke-width="3" /> Cukup dengan HP</li>
          </ul>
        </div>

        <!-- Gambaran alur pesanan -->
        <div class="gambaran" aria-hidden="true">
          <div class="gb-kartu gb-pesanan">
            <span class="gb-ikon"><BellRing :size="22" :stroke-width="2" /></span>
            <div>
              <p class="gb-judul">Pesanan baru di toko Anda</p>
              <p class="gb-isi">Siti memesan Kue Lapis ×2 (Rp 40.000)</p>
            </div>
          </div>
          <div class="gb-kartu gb-aksi">
            <span class="gb-tombol">Konfirmasi</span>
            <span class="gb-tombol gb-wa"><IkonWa :size="16" /> Balas lewat WhatsApp</span>
          </div>
          <p class="gb-ket">Pesanan masuk ke HP Anda sebagai notifikasi.</p>
        </div>
      </div>
    </section>

    <!-- KEUNTUNGAN -->
    <section class="bagian">
      <div class="wadah">
        <h2 class="judul-bagian huruf-papan">Yang Anda dapat</h2>
        <div class="keuntungan">
          <article v-for="k in KEUNTUNGAN" :key="k.judul" class="untung">
            <span class="untung-ikon"><component :is="k.ikon" :size="26" :stroke-width="1.9" /></span>
            <h3>{{ k.judul }}</h3>
            <p>{{ k.isi }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- LANGKAH -->
    <section class="bagian bagian-sage">
      <div class="wadah">
        <h2 class="judul-bagian huruf-papan">Mulai dalam tiga langkah</h2>
        <ol class="langkah">
          <li v-for="(l, i) in LANGKAH" :key="l.judul">
            <span class="langkah-no huruf-papan">{{ i + 1 }}</span>
            <div>
              <h3>{{ l.judul }}</h3>
              <p>{{ l.isi }}</p>
            </div>
          </li>
        </ol>
        <div class="tengah">
          <RouterLink :to="tujuanDaftar" class="tombol tombol-merah tombol-besar">
            Buka toko gratis
            <ArrowRight :size="20" :stroke-width="2.25" />
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- COCOK UNTUK -->
    <section class="bagian">
      <div class="wadah">
        <h2 class="judul-bagian huruf-papan">Cocok untuk siapa saja</h2>
        <p class="sub-bagian">
          Warga {{ LOKASI_PENDEK }} yang menjual barang atau jasa, dari rumah maupun dari warung.
        </p>
        <ul class="cocok">
          <li v-for="k in kategoriContoh" :key="k.slug">
            <component :is="k.icon" :size="18" :stroke-width="2" />
            {{ k.label }}
          </li>
        </ul>
        <p class="catatan-po">
          Barang dibuat sesuai pesanan? Tandai sebagai <strong>pre-order</strong> dan tulis lama pengerjaannya.
          Pembeli melihatnya sebelum memesan.
        </p>
      </div>
    </section>

    <!-- PERTANYAAN -->
    <section class="bagian bagian-sage">
      <div class="wadah sempit">
        <h2 class="judul-bagian huruf-papan">Pertanyaan yang sering diajukan</h2>
        <div class="tanya">
          <details v-for="t in TANYA" :key="t.q" class="tanya-butir">
            <summary>
              {{ t.q }}
              <ChevronDown :size="20" :stroke-width="2.25" class="tanya-panah" />
            </summary>
            <p>{{ t.a }}</p>
          </details>
        </div>
      </div>
    </section>

    <!-- PENUTUP -->
    <section class="penutup">
      <div class="wadah penutup-dalam">
        <h2 class="huruf-papan">Siap menjual di ItahBangkuang?</h2>
        <p>Daftar, isi satu produk, dan tokonya langsung bisa dilihat warga.</p>
        <div class="pembuka-aksi tengah">
          <RouterLink :to="tujuanDaftar" class="tombol tombol-kuning tombol-besar">Buka toko gratis</RouterLink>
          <a :href="tautanTanya" target="_blank" rel="noopener" class="tombol tombol-besar tombol-terang">
            <IkonWa :size="20" />
            Tanya admin
          </a>
        </div>
      </div>
    </section>
  </LayoutPublic>
</template>

<script setup>
import { computed } from 'vue';
import {
  Store, Check, ArrowRight, BellRing, ChevronDown, Search, Smartphone, Zap, ShieldCheck,
} from 'lucide-vue-next';
import LayoutPublic from '@/layouts/LayoutPublic.vue';
import IkonWa from '@/components/IkonWa.vue';
import { useAuthStore } from '@/stores/auth';
import { useSeo, pasangBreadcrumb, BASE_URL } from '@/lib/useSeo';
import { KATEGORI } from '@/lib/kategori';
import { tautanWa } from '@/lib/utils';
import { LOKASI, LOKASI_PENDEK } from '../../../api/_kategori.js';

const authStore = useAuthStore();

useSeo({
  title: `Jualan Online di ${LOKASI_PENDEK} — Buka Toko Gratis`,
  description: `Buka toko gratis di ItahBangkuang untuk warga ${LOKASI}. Produk Anda mudah ditemukan pembeli, pesanan masuk ke HP, dan transaksi selesai lewat WhatsApp.`,
  url: `${BASE_URL}/jualan`,
});
pasangBreadcrumb([
  { name: 'Beranda', url: `${BASE_URL}/` },
  { name: 'Jualan di ItahBangkuang', url: `${BASE_URL}/jualan` },
]);

const tujuanDaftar = computed(() => {
  if (authStore.role === 'penjual') return '/toko/dashboard';
  if (authStore.user) return '/buka-toko';
  return '/register?peran=penjual';
});

const tautanTanya = tautanWa(
  '6282253158560',
  'Halo admin, saya ingin bertanya tentang berjualan di ItahBangkuang.',
);

const KEUNTUNGAN = [
  {
    ikon: Zap,
    judul: 'Toko langsung tampil',
    isi: 'Setelah mendaftar, toko Anda langsung bisa dilihat warga. Tidak perlu menunggu persetujuan.',
  },
  {
    ikon: BellRing,
    judul: 'Pesanan masuk ke HP',
    isi: 'Setiap pesanan baru datang sebagai notifikasi. Konfirmasi dengan satu ketukan, lalu lanjut ke WhatsApp pembeli.',
  },
  {
    ikon: Search,
    judul: 'Mudah ditemukan',
    isi: 'Produk dan toko Anda tampil di katalog ItahBangkuang dan bisa muncul di pencarian Google.',
  },
  {
    ikon: Smartphone,
    judul: 'Cukup dengan HP',
    isi: 'Foto produk dari kamera HP langsung dipakai. Tidak perlu aplikasi khusus; ItahBangkuang bisa dipasang seperti aplikasi.',
  },
];

const LANGKAH = [
  { judul: 'Daftar', isi: 'Isi nama, email, dan kata sandi. Tidak sampai satu menit.' },
  {
    judul: 'Isi toko dan tambah produk',
    isi: 'Tulis nama toko, nomor WhatsApp, dan alamat. Lalu unggah foto, nama, harga, dan stok produk pertama Anda.',
  },
  {
    judul: 'Terima pesanan',
    isi: 'Pembeli memesan, Anda mendapat notifikasi, mengonfirmasi, lalu mengatur pengiriman atau pengambilan lewat WhatsApp.',
  },
];

const kategoriContoh = computed(() =>
  KATEGORI.filter((k) => k.slug !== 'lainnya').slice(0, 8),
);

const TANYA = [
  {
    q: 'Apakah berjualan di sini berbayar?',
    a: 'Tidak. Mendaftar dan membuka toko gratis, dan tidak ada potongan dari penjualan Anda.',
  },
  {
    q: 'Bagaimana pembayarannya?',
    a: 'Pembayaran disepakati langsung antara Anda dan pembeli, bisa bayar di tempat (COD) atau transfer. ItahBangkuang tidak memegang uang Anda.',
  },
  {
    q: 'Apakah saya perlu menunggu persetujuan admin?',
    a: 'Tidak. Toko langsung tampil setelah Anda mendaftar. Admin memeriksa toko belakangan dan memberi tanda Terverifikasi. Sebelum terverifikasi, toko dapat menampilkan sampai 5 produk.',
  },
  {
    q: 'Bagaimana kalau barang saya dibuat sesuai pesanan?',
    a: 'Tandai produk sebagai pre-order dan isi lama pengerjaannya, misalnya “2 hari”. Pembeli melihat keterangan itu sebelum memesan.',
  },
  {
    q: 'Saya kurang paham teknologi. Apakah ada yang membantu?',
    a: 'Ada. Hubungi admin lewat WhatsApp. Kami bantu mulai dari mendaftar sampai menambahkan produk pertama.',
  },
  {
    q: 'Apa yang harus saya siapkan?',
    a: 'Sebuah HP dengan internet, nomor WhatsApp aktif, dan foto produk. Foto langsung dari kamera sudah cukup; ukurannya dikecilkan otomatis.',
  },
];
</script>

<style scoped>
.sempit {
  max-width: 760px;
}
.tengah {
  display: flex;
  justify-content: center;
  margin-top: 1.75rem;
}

/* Pembuka */
.pembuka {
  background: var(--sage);
  color: var(--sungai-dalam);
  border-radius: 0 0 36px 36px;
  padding: 2rem 0 2.5rem;
}
.pembuka-dalam {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2rem;
  align-items: center;
}
@media (min-width: 900px) {
  .pembuka {
    padding: 3.25rem 0 3.5rem;
  }
  .pembuka-dalam {
    grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
    gap: 3rem;
  }
}
.kicker {
  display: inline-block;
  padding: 0.25rem 0.8rem;
  background: #fff;
  color: var(--sungai);
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.02em;
}
.pembuka-judul {
  margin-top: 0.9rem;
  font-size: clamp(1.9rem, 5.4vw, 3rem);
  line-height: 1.1;
  color: var(--sungai-dalam);
}
.pembuka-sub {
  margin-top: 0.9rem;
  max-width: 54ch;
  font-size: 1.08rem;
  line-height: 1.65;
  color: var(--ink-2);
}
.pembuka-aksi {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  margin-top: 1.5rem;
}
.pembuka-aksi.tengah {
  justify-content: center;
}
.jaminan {
  list-style: none;
  display: grid;
  gap: 0.4rem;
  margin-top: 1.4rem;
  color: var(--ink);
  font-weight: 600;
}
.jaminan li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.jaminan svg {
  flex-shrink: 0;
  padding: 3px;
  background: var(--sungai);
  color: #fff;
  border-radius: 50%;
}

/* Gambaran alur pesanan */
.gambaran {
  display: grid;
  gap: 0.8rem;
  max-width: 420px;
  width: 100%;
  margin: 0 auto;
}
.gb-kartu {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 1.1rem;
  background: #fff;
  border-radius: 22px;
  box-shadow: var(--bayang-naik);
}
.gb-pesanan {
  transform: rotate(-1.5deg);
}
.gb-aksi {
  flex-wrap: wrap;
  margin-left: 1.5rem;
  transform: rotate(1deg);
}
.gb-ikon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 46px;
  height: 46px;
  background: var(--aprikot-muda);
  color: #7a4a24;
  border-radius: 50%;
}
.gb-judul {
  font-weight: 800;
  line-height: 1.3;
}
.gb-isi {
  margin-top: 0.15rem;
  font-size: 0.92rem;
  color: var(--ink-2);
}
.gb-tombol {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  background: var(--aprikot);
  color: var(--sungai-dalam);
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 800;
}
.gb-wa {
  background: var(--sage);
  color: var(--sungai);
}
.gb-ket {
  text-align: center;
  font-size: 0.9rem;
  color: var(--ink-2);
}

/* Bagian umum */
.bagian {
  padding: 3rem 0;
}
.bagian-sage {
  background: var(--sage);
}
.judul-bagian {
  font-size: clamp(1.5rem, 3.6vw, 2.1rem);
  line-height: 1.2;
  color: var(--sungai-dalam);
}
.sub-bagian {
  margin-top: 0.5rem;
  max-width: 60ch;
  color: var(--ink-2);
  line-height: 1.6;
}

/* Keuntungan */
.keuntungan {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
  margin-top: 1.5rem;
}
@media (min-width: 640px) {
  .keuntungan {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (min-width: 1000px) {
  .keuntungan {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
.untung {
  padding: 1.35rem 1.2rem 1.4rem;
  background: #fff;
  border-radius: 24px;
  box-shadow: var(--bayang);
}
.untung-ikon {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  background: var(--sage);
  color: var(--sungai);
  border-radius: 18px;
}
.untung h3 {
  margin-top: 0.9rem;
  font-family: var(--font-papan);
  font-weight: 600;
  font-size: 1.12rem;
}
.untung p {
  margin-top: 0.4rem;
  color: var(--ink-2);
  line-height: 1.6;
}

/* Langkah */
.langkah {
  list-style: none;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
  margin-top: 1.5rem;
}
@media (min-width: 860px) {
  .langkah {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
.langkah li {
  display: flex;
  gap: 1rem;
  padding: 1.3rem 1.2rem;
  background: #fff;
  border-radius: 24px;
  box-shadow: var(--bayang);
}
.langkah-no {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  background: var(--aprikot);
  color: var(--sungai-dalam);
  border-radius: 50%;
  font-size: 1.25rem;
}
.langkah h3 {
  font-family: var(--font-papan);
  font-weight: 600;
  font-size: 1.12rem;
}
.langkah p {
  margin-top: 0.3rem;
  color: var(--ink-2);
  line-height: 1.6;
}

/* Cocok untuk */
.cocok {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 1.4rem;
}
.cocok li {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1rem;
  background: #fff;
  color: var(--sungai-dalam);
  border-radius: 999px;
  box-shadow: var(--bayang);
  font-weight: 700;
}
.cocok svg {
  color: var(--sungai-sedang);
}
.catatan-po {
  max-width: 62ch;
  margin-top: 1.4rem;
  padding: 0.9rem 1.1rem;
  background: var(--aprikot-muda);
  color: #7a4a24;
  border-radius: 16px;
  line-height: 1.6;
}

/* Pertanyaan */
.tanya {
  display: grid;
  gap: 0.7rem;
  margin-top: 1.4rem;
}
.tanya-butir {
  background: #fff;
  border-radius: 20px;
  box-shadow: var(--bayang);
}
.tanya-butir summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 56px;
  padding: 0.9rem 1.2rem;
  font-weight: 800;
  line-height: 1.35;
  cursor: pointer;
  list-style: none;
}
.tanya-butir summary::-webkit-details-marker {
  display: none;
}
.tanya-panah {
  flex-shrink: 0;
  color: var(--sungai);
  transition: transform 0.25s var(--ease-out);
}
.tanya-butir[open] .tanya-panah {
  transform: rotate(180deg);
}
.tanya-butir p {
  padding: 0 1.2rem 1.15rem;
  color: var(--ink-2);
  line-height: 1.65;
}

/* Penutup */
.penutup {
  background: var(--sungai-dalam);
  color: #fff;
  padding: 3rem 0;
  text-align: center;
}
.penutup h2 {
  font-size: clamp(1.5rem, 4vw, 2.2rem);
}
.penutup p {
  margin-top: 0.6rem;
  color: rgba(255, 255, 255, 0.85);
}
.tombol-terang {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.35);
}
.tombol-terang:hover {
  background: rgba(255, 255, 255, 0.22);
}
</style>
