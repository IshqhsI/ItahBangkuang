<template>
  <LayoutPublic>
    <section class="kepala">
      <div class="wadah sempit">
        <h1 class="judul-halaman kepala-judul">Cara pakai ItahBangkuang</h1>
        <p class="kepala-sub">Panduan langkah demi langkah sesuai peran Anda.</p>

        <div class="tab" role="tablist" aria-label="Panduan untuk">
          <button
            v-for="t in tabList"
            :id="`tab-${t.id}`"
            :key="t.id"
            type="button"
            role="tab"
            class="tab-tombol"
            :class="{ aktif: tab === t.id }"
            :aria-selected="tab === t.id"
            :aria-controls="`panel-${t.id}`"
            @click="tab = t.id"
          >
            <component :is="t.icon" :size="22" :stroke-width="2.25" />
            {{ t.label }}
          </button>
        </div>
      </div>
    </section>

    <div
      :id="`panel-${tab}`"
      class="wadah sempit isi"
      role="tabpanel"
      :aria-labelledby="`tab-${tab}`"
    >
      <ol class="daftar-langkah">
        <li v-for="(l, i) in panduan.langkah" :key="l.judul" class="langkah papan">
          <div class="langkah-kepala">
            <span class="langkah-no huruf-papan" :class="`no-${tab}`">{{ i + 1 }}</span>
            <div>
              <h2 class="langkah-judul">{{ l.judul }}</h2>
              <p v-if="l.ket" class="langkah-ket">{{ l.ket }}</p>
            </div>
          </div>

          <ul v-if="l.butir" class="butir">
            <li v-for="b in l.butir" :key="b">
              <Check :size="18" :stroke-width="3" />
              <span v-html="b"></span>
            </li>
          </ul>

          <div v-if="l.catatan" class="pesan" :class="`pesan-${l.catatan.jenis}`">
            <component :is="ikonCatatan[l.catatan.jenis]" :size="20" :stroke-width="2.5" />
            <span v-html="l.catatan.teks"></span>
          </div>
        </li>
      </ol>

      <!-- Tips (penjual) -->
      <section v-if="panduan.tips" class="tips papan papan-kuning papan-bingkai">
        <h2 class="huruf-papan">{{ panduan.tips.judul }}</h2>
        <ul>
          <li v-for="t in panduan.tips.daftar" :key="t">{{ t }}</li>
        </ul>
      </section>

      <!-- Tanya jawab -->
      <section class="tanya" aria-labelledby="judul-tanya">
        <h2 id="judul-tanya" class="huruf-papan">Pertanyaan yang sering muncul</h2>
        <details v-for="q in panduan.tanya" :key="q.t" class="tanya-item">
          <summary>
            {{ q.t }}
            <ChevronDown :size="22" :stroke-width="2.5" class="panah" />
          </summary>
          <p>{{ q.j }}</p>
        </details>
      </section>

      <div class="penutup papan papan-bingkai" :class="tab === 'penjual' ? 'papan-hijau' : 'papan-merah'">
        <p class="huruf-papan">{{ panduan.penutup.teks }}</p>
        <RouterLink :to="panduan.penutup.ke" class="tombol tombol-kuning tombol-besar">
          {{ panduan.penutup.tombol }}
          <ArrowRight :size="20" :stroke-width="2.5" />
        </RouterLink>
      </div>
    </div>

    <section class="bantuan">
      <div class="wadah sempit bantuan-dalam">
        <div>
          <h2 class="huruf-papan">Masih bingung?</h2>
          <p>Tanya saja ke admin lewat WhatsApp.</p>
        </div>
        <a :href="tautanBantuan" target="_blank" rel="noopener" class="tombol tombol-hijau tombol-besar">
          <IkonWa :size="22" />
          Tanya admin di WA
        </a>
      </div>
    </section>
  </LayoutPublic>
</template>

<script setup>
import { ref, computed, markRaw } from 'vue';
import { useRoute } from 'vue-router';
import {
  ShoppingBasket,
  Store,
  Check,
  Info,
  TriangleAlert,
  CircleCheck,
  ChevronDown,
  ArrowRight,
} from 'lucide-vue-next';
import LayoutPublic from '@/layouts/LayoutPublic.vue';
import IkonWa from '@/components/IkonWa.vue';
import { useSeo, pasangFaq } from '@/lib/useSeo';
import { tautanWa } from '@/lib/utils';

useSeo({
  title: 'Cara Pakai',
  description:
    'Panduan belanja dan berjualan di ItahBangkuang, langkah demi langkah dan mudah diikuti semua orang.',
});

const route = useRoute();
const tab = ref(route.query.untuk === 'penjual' ? 'penjual' : 'pembeli');

const tabList = [
  { id: 'pembeli', label: 'Sebagai pembeli', icon: markRaw(ShoppingBasket) },
  { id: 'penjual', label: 'Sebagai penjual', icon: markRaw(Store) },
];

const ikonCatatan = {
  info: markRaw(Info),
  awas: markRaw(TriangleAlert),
  sukses: markRaw(CircleCheck),
};

const tautanBantuan = tautanWa('6282253158560', 'Halo, saya butuh bantuan memakai ItahBangkuang.');

const pembeli = {
  langkah: [
    {
      judul: 'Buka ItahBangkuang di HP',
      ket: 'Tidak perlu pasang aplikasi. Cukup buka lewat Chrome atau browser bawaan HP.',
    },
    {
      judul: 'Buat akun (cukup sekali)',
      ket: 'Akun dibutuhkan agar Anda dapat memesan. Melihat produk tidak memerlukan akun.',
      butir: [
        'Tekan <strong>Daftar</strong> di pojok kanan atas.',
        'Pilih <strong>Belanja</strong>, lalu isi nama, email, dan kata sandi (minimal 8 karakter).',
        'Tekan <strong>Buat akun</strong>. Selesai.',
      ],
      catatan: { jenis: 'awas', teks: 'Catat email dan kata sandi Anda di tempat yang aman supaya tidak lupa.' },
    },
    {
      judul: 'Cari produk',
      butir: [
        'Pilih <strong>kategori</strong>, misalnya Makanan &amp; Jajanan atau Aneka Minuman.',
        'Atau ketik nama produk di kotak <strong>pencarian</strong>, contoh: “klepon”.',
        'Tekan nama toko untuk melihat semua produk toko tersebut.',
      ],
    },
    {
      judul: 'Periksa dulu sebelum memesan',
      butir: [
        'Lihat <strong>foto</strong> dan baca <strong>deskripsi</strong>: bahan, rasa, minimal pesan.',
        'Cek <strong>harga</strong> dan <strong>stok</strong>. Kalau ada pilihan <strong>varian</strong> (ukuran atau rasa), pilih salah satu.',
        'Ragu? Tekan <strong>Tanya penjual di WA</strong> untuk bertanya dulu.',
      ],
    },
    {
      judul: 'Isi pesanan',
      ket: 'Tekan Pesan sekarang, lalu lengkapi data berikut.',
      butir: [
        '<strong>Nama</strong> dan <strong>nomor WhatsApp</strong> yang aktif.',
        '<strong>Alamat</strong> pengantaran, misalnya “Jl. Mawar RT 02, dekat masjid”.',
        '<strong>Jumlah</strong> dan cara bayar: <strong>COD</strong> (bayar di tempat) atau <strong>transfer</strong>.',
        '<strong>Catatan</strong> kalau perlu, misalnya “jangan terlalu manis”.',
      ],
      catatan: { jenis: 'sukses', teks: 'Tekan <strong>Kirim pesanan</strong>. Pesanan Anda langsung masuk ke penjual.' },
    },
    {
      judul: 'Lanjut ngobrol di WhatsApp',
      butir: [
        'Penjual mengonfirmasi pesanan Anda lewat WhatsApp.',
        'Atur waktu pengantaran atau tempat COD bersama penjual.',
        'Kalau transfer, penjual mengirim nomor rekeningnya.',
        'Barang sampai, selesai.',
      ],
      catatan: { jenis: 'info', teks: 'Status pesanan Anda bisa dilihat kapan saja di menu <strong>Pesanan Saya</strong>.' },
    },
  ],
  tanya: [
    {
      t: 'Harus daftar dulu untuk melihat produk?',
      j: 'Tidak. Semua produk bisa dilihat tanpa akun. Akun baru dibutuhkan saat memesan.',
    },
    {
      t: 'Bayarnya bagaimana?',
      j: 'Ada dua pilihan: COD (bayar langsung ke penjual saat barang diterima) atau transfer bank/e-wallet. Anda memilihnya di formulir pesanan.',
    },
    {
      t: 'Berapa lama barangnya sampai?',
      j: 'Tergantung kesepakatan dengan penjual. Biasanya diatur lewat WhatsApp setelah pesanan Anda dikonfirmasi.',
    },
    {
      t: 'Pesananku belum dikonfirmasi penjual. Bagaimana?',
      j: 'Hubungi penjualnya langsung lewat tombol WhatsApp di halaman produk atau di Pesanan Saya.',
    },
    {
      t: 'Bisa membatalkan pesanan?',
      j: 'Bisa, selama penjual belum mengonfirmasi. Kabari penjualnya lewat WhatsApp.',
    },
  ],
  penutup: { teks: 'Sudah paham? Mulai lihat produk.', tombol: 'Lihat produk', ke: '/produk' },
};

const penjual = {
  langkah: [
    {
      judul: 'Daftar sebagai penjual',
      ket: 'Gratis, tanpa biaya apa pun.',
      butir: [
        'Tekan <strong>Daftar</strong>, lalu pilih <strong>Jualan</strong>.',
        'Isi nama, email, dan kata sandi, lalu lanjut ke info toko.',
        'Isi <strong>nama toko</strong>, <strong>nomor WhatsApp</strong>, dan <strong>alamat</strong>.',
      ],
      catatan: { jenis: 'awas', teks: 'Pastikan <strong>nomor WhatsApp benar</strong>. Pembeli menghubungi Anda lewat nomor ini. Pesanan baru juga tampil di halaman Pesanan, sehingga perlu dicek secara rutin.' },
    },
    {
      judul: 'Toko langsung tampil',
      ket: 'Toko Anda aktif begitu pendaftaran selesai.',
      butir: [
        'Setelah daftar, toko Anda langsung <strong>Aktif</strong> dan dapat menerima pesanan.',
        'Admin memeriksa toko secara berkala. Toko yang sesuai mendapat lencana <strong>Terverifikasi</strong>.',
      ],
      catatan: { jenis: 'info', teks: 'Sebelum terverifikasi, toko dapat menambahkan maksimal 5 produk. Toko yang melanggar ketentuan dapat diblokir admin.' },
    },
    {
      judul: 'Lengkapi profil toko Anda',
      ket: 'Toko yang lengkap lebih dipercaya pembeli.',
      butir: [
        'Pasang <strong>foto toko</strong>: logo, atau foto produk andalan Anda.',
        'Tulis <strong>cerita singkat</strong>, misalnya “Terima pesanan kue basah, pesan H-1. Bisa antar area Bangkuang.”',
        'Pastikan <strong>alamat</strong> jelas.',
      ],
    },
    {
      judul: 'Tambahkan produk pertama',
      ket: 'Foto yang jelas membantu pembeli memilih produk.',
      butir: [
        'Buka <strong>Produk</strong>, lalu tekan <strong>Tambah produk</strong>.',
        'Unggah <strong>foto</strong>, tulis <strong>nama</strong> yang jelas (contoh: “Kue Lapis Pandan isi 10”), dan pilih <strong>kategori</strong>.',
        'Isi <strong>harga</strong> dan <strong>stok</strong>. Kalau ukuran atau rasanya beda-beda, pakai <strong>varian</strong> supaya tiap pilihan punya harga dan stok sendiri.',
        'Tulis <strong>deskripsi</strong>: bahan, rasa, cara simpan, minimal pesan.',
      ],
      catatan: { jenis: 'info', teks: 'Foto paling bagus diambil dekat jendela saat siang, di atas alas yang bersih. Lap dulu lensa HP-nya.' },
    },
    {
      judul: 'Terima dan urus pesanan',
      ket: 'Pesanan baru muncul di menu Pesanan, dan pembeli juga menghubungi Anda lewat WhatsApp.',
      butir: [
        'Buka <strong>Pesanan</strong> dan lihat detailnya.',
        'Tekan <strong>Konfirmasi</strong> kalau Anda bisa memenuhinya.',
        'Tekan <strong>Chat pembeli</strong> untuk mengatur pengantaran atau COD.',
        'Barang sudah diterima? Tekan <strong>Tandai selesai</strong>.',
      ],
      catatan: { jenis: 'awas', teks: 'Konfirmasi secepatnya. Pembeli yang menunggu lama bisa membatalkan pesanan.' },
    },
    {
      judul: 'Jaga stok tetap benar',
      butir: [
        'Produk habis? Ubah stoknya jadi 0, atau <strong>sembunyikan</strong> produknya. Datanya tidak hilang.',
        'Harga, foto, atau deskripsi bisa diubah kapan saja lewat <strong>Edit</strong>.',
      ],
    },
  ],
  tips: {
    judul: 'Tips agar produk lebih diminati',
    daftar: [
      'Balas pesanan dalam 1–2 jam.',
      'Foto terang dan rapi, sesuai barang aslinya.',
      'Balas WhatsApp dengan sopan dan jelas.',
      'Tambahkan produk baru secara berkala.',
      'Bagikan tautan toko Anda ke grup WA dan Facebook.',
    ],
  },
  tanya: [
    {
      t: 'Bagaimana kalau saya tidak melayani pesanan online?',
      j: 'Buka Profil Toko, lalu matikan "Terima pesanan online". Produk Anda tetap tampil sebagai etalase, dan pembeli melihat alamat, jam buka, dan tombol WhatsApp untuk datang atau bertanya langsung.',
    },
    {
      t: 'Apa arti lencana Terverifikasi?',
      j: 'Artinya admin sudah memeriksa toko Anda dan informasinya sesuai. Toko baru langsung tampil tanpa lencana, dan lencana diberikan setelah admin memeriksanya.',
    },
    {
      t: 'Tokoku ditolak. Apa yang harus dilakukan?',
      j: 'Admin akan menyebutkan alasannya. Perbaiki info toko Anda, lalu hubungi admin untuk diperiksa ulang.',
    },
    {
      t: 'Berapa banyak produk yang boleh ditambahkan?',
      j: 'Tidak dibatasi. Tambahkan sebanyak produk yang Anda jual.',
    },
    {
      t: 'Bagaimana menerima pembayaran transfer?',
      j: 'Anda atur sendiri dengan pembeli lewat WhatsApp. Kirim nomor rekening atau e-wallet Anda setelah pesanan dikonfirmasi.',
    },
    {
      t: 'Boleh menjual barang titipan orang lain?',
      j: 'Boleh, selama Anda yang bertanggung jawab atas tokonya dan bisa dihubungi pembeli.',
    },
  ],
  penutup: { teks: 'Siap buka toko? Mulai sekarang, gratis.', tombol: 'Buka toko gratis', ke: '/register?peran=penjual' },
};

const panduan = computed(() => (tab.value === 'penjual' ? penjual : pembeli));

// Pertanyaan dua peran digabung untuk data terstruktur FAQ
pasangFaq([...(pembeli.tanya ?? []), ...(penjual.tanya ?? [])]);
</script>

<style scoped>
.sempit {
  max-width: 800px;
}

.kepala {
  background: var(--sage);
  color: var(--sungai-dalam);
  border-radius: 0 0 32px 32px;
  padding: 2rem 0 0;
}
.kepala-sub {
  margin-top: 0.5rem;
  color: var(--ink-2);
  font-size: 1.05rem;
}
.tab {
  display: flex;
  gap: 0.5rem;
  margin-top: 1.5rem;
}
.tab-tombol {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 52px;
  padding: 0 1.2rem;
  background: #f7de7b;
  color: var(--tinta);
  border: var(--tebal) solid var(--garis);
  border-bottom: 0;
  border-radius: var(--sudut) var(--sudut) 0 0;
  font-family: var(--font-teks);
  font-size: 1.02rem;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: -3px;
}
.tab-tombol:hover {
  background: var(--papan);
}
.tab-tombol.aktif {
  background: var(--papan);
  padding-bottom: 3px;
}

.isi {
  padding-top: 2rem;
  padding-bottom: 2.5rem;
}

.daftar-langkah {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.langkah {
  padding: 1.25rem 1.25rem 1.4rem;
}
.langkah-kepala {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}
.langkah-no {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  color: #fff;
  border: var(--tebal) solid var(--garis);
  border-radius: 50%;
  font-size: 1.15rem;
}
.no-pembeli {
  background: var(--merah);
}
.no-penjual {
  background: var(--hijau);
}
.langkah-judul {
  font-size: 1.2rem;
  line-height: 1.25;
  padding-top: 0.5rem;
}
.langkah-ket {
  margin-top: 0.25rem;
  color: var(--tinta-2);
}
.butir {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin: 1rem 0 0 calc(44px + 1rem);
}
.butir li {
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
  line-height: 1.5;
}
.butir svg {
  flex-shrink: 0;
  margin-top: 0.2rem;
  color: var(--hijau);
}
.langkah .pesan {
  margin: 1rem 0 0 calc(44px + 1rem);
  font-weight: 400;
}
.langkah .pesan :deep(strong) {
  font-weight: 700;
}
@media (max-width: 520px) {
  .butir,
  .langkah .pesan {
    margin-left: 0;
  }
}

.tips {
  margin-top: 1.5rem;
  padding: 1.5rem 1.4rem;
}
.tips h2 {
  font-size: 1.3rem;
}
.tips ul {
  margin: 0.9rem 0 0 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.tanya {
  margin-top: 2.5rem;
}
.tanya h2 {
  font-size: 1.4rem;
  margin-bottom: 0.9rem;
}
.tanya-item {
  background: var(--papan);
  border: var(--tebal) solid var(--garis);
  border-radius: var(--sudut);
  margin-bottom: 0.6rem;
}
.tanya-item summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 56px;
  padding: 0.5rem 1rem;
  font-weight: 700;
  cursor: pointer;
  list-style: none;
}
.tanya-item summary::-webkit-details-marker {
  display: none;
}
.tanya-item .panah {
  flex-shrink: 0;
  transition: transform 0.25s var(--ease-out);
}
.tanya-item[open] .panah {
  transform: rotate(180deg);
}
.tanya-item p {
  padding: 0 1rem 1rem;
  color: var(--tinta-2);
  max-width: 62ch;
}

.penutup {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1.5rem 1.4rem;
}
.penutup p {
  font-size: 1.2rem;
  max-width: 24ch;
}

.bantuan {
  background: var(--dinding);
  border-top: 1px solid var(--sage-2);
  padding: 2.5rem 0 3rem;
}
.bantuan-dalam {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
}
.bantuan h2 {
  font-size: 1.4rem;
}
.bantuan p {
  margin-top: 0.3rem;
  color: var(--tinta-2);
  max-width: 44ch;
}
</style>
