<template>
  <LayoutPublic>
    <div v-if="loading" class="memuat">
      <div class="spinner"></div>
      <p>Mengambil produk…</p>
    </div>

    <div v-else-if="!produk" class="wadah tidak-ada">
      <div class="kosong">
        <PackageX :size="48" :stroke-width="2" />
        <h3>Produk ini sudah tidak ada</h3>
        <p>Produk mungkin telah dihapus penjual, atau toko sedang tidak aktif.</p>
        <RouterLink to="/produk" class="tombol tombol-merah">Lihat produk lain</RouterLink>
      </div>
    </div>

    <template v-else>
      <div class="detail">
        <div class="wadah">
          <nav class="remah" aria-label="Lokasi halaman">
            <RouterLink to="/">Beranda</RouterLink>
            <ChevronRight :size="16" :stroke-width="2.5" aria-hidden="true" />
            <RouterLink to="/produk">Produk</RouterLink>
            <ChevronRight :size="16" :stroke-width="2.5" aria-hidden="true" />
            <span aria-current="page">{{ produk.nama_produk }}</span>
          </nav>

          <div class="detail-grid">
            <!-- FOTO -->
            <div class="foto-papan">
              <img :src="produk.foto_url" :alt="produk.nama_produk" class="foto-utama" />
              <RouterLink
                :to="`/produk?kategori=${produk.kategori}`"
                class="plat foto-kategori"
              >
                <component :is="iconKategori(produk.kategori)" :size="14" :stroke-width="2.5" />
                {{ labelKategori(produk.kategori) }}
              </RouterLink>
              <div v-if="isHabis" class="foto-habis"><span>Habis</span></div>
            </div>

            <!-- INFO -->
            <div class="info">
              <h1 class="nama">{{ produk.nama_produk }}</h1>

              <div class="harga-baris">
                <div class="harga-blok">
                  <span v-if="adaRentang" class="harga-awalan">Mulai dari</span>
                  <span class="plat-harga harga">{{ teksHarga }}</span>
                </div>
                <span class="stok" :class="kelasStok">
                  <template v-if="currentStok === 0">Stok habis</template>
                  <template v-else-if="currentStok <= 5">Tinggal {{ currentStok }}</template>
                  <template v-else>{{ labelStok(currentStok) }}</template>
                </span>
              </div>

              <!-- TOKO: dinaikkan agar kepercayaan terlihat sebelum memesan -->
              <RouterLink :to="urlToko(toko)" class="papan-toko">
                <span class="toko-foto">
                  <img v-if="toko?.foto_toko" :src="toko.foto_toko" :alt="toko.nama_toko" />
                  <Store v-else :size="24" :stroke-width="2" />
                </span>
                <span class="toko-teks">
                  <span class="toko-label">Dijual oleh</span>
                  <span class="toko-nama">{{ toko?.nama_toko }}</span>
                  <span v-if="toko?.alamat" class="toko-alamat">
                    <MapPin :size="14" :stroke-width="2" />
                    {{ toko.alamat }}
                  </span>
                </span>
                <span v-if="toko?.terverifikasi" class="toko-terverifikasi">
                  <BadgeCheck :size="16" :stroke-width="2" />
                  Terverifikasi admin
                </span>
                <span v-else class="toko-terverifikasi toko-baru">Toko baru</span>
                <ChevronRight :size="20" :stroke-width="2" class="toko-panah" />
              </RouterLink>

              <!-- VARIAN -->
              <fieldset v-if="punyaVarian(produk)" class="varian">
                <legend class="label">
                  Pilih varian
                  <span v-if="terimaPesanan && !varianTerpilih" class="varian-wajib">— wajib dipilih</span>
                </legend>
                <div class="varian-daftar">
                  <button
                    v-for="(v, index) in produk.varian"
                    :key="index"
                    type="button"
                    class="varian-pilihan"
                    :class="{ aktif: varianTerpilih?.nama === v.nama }"
                    :aria-pressed="varianTerpilih?.nama === v.nama"
                    :disabled="Number(v.stok) <= 0"
                    @click="pilihVarian(v)"
                  >
                    <span class="varian-nama">{{ v.nama }}</span>
                    <span class="varian-ket">
                      {{ Number(v.stok) <= 0 ? 'Habis' : formatRupiah(v.harga) }}
                    </span>
                  </button>
                </div>
              </fieldset>

              <!-- JUMLAH -->
              <div v-if="terimaPesanan && currentStok > 0" class="jumlah">
                <span class="label" id="label-jumlah">Jumlah</span>
                <div class="jumlah-atur" role="group" aria-labelledby="label-jumlah">
                  <button
                    type="button"
                    aria-label="Kurangi jumlah"
                    :disabled="jumlah <= 1"
                    @click="kurangiJumlah"
                  >
                    <Minus :size="20" :stroke-width="2.75" />
                  </button>
                  <output aria-live="polite">{{ jumlah }}</output>
                  <button
                    type="button"
                    aria-label="Tambah jumlah"
                    :disabled="jumlah >= currentStok"
                    @click="tambahJumlah"
                  >
                    <Plus :size="20" :stroke-width="2.75" />
                  </button>
                </div>
              </div>

              <!-- AKSI -->
              <div class="aksi">
                <div v-if="terimaPesanan && currentStok > 0" class="aksi-lekat">
                  <div class="aksi-total">
                    <span>Total</span>
                    <strong>{{ formatRupiah(currentHarga * jumlah) }}</strong>
                  </div>
                  <button
                    type="button"
                    class="tombol tombol-merah tombol-besar aksi-pesan"
                    :disabled="perluVarian"
                    @click="handlePesan"
                  >
                    <ShoppingBasket :size="22" :stroke-width="2.25" />
                    {{ perluVarian ? 'Pilih varian dulu' : 'Pesan sekarang' }}
                  </button>
                </div>
                <p v-if="terimaPesanan && currentStok > 0 && !authStore.user" class="aksi-catatan">
                  Masuk dulu untuk memesan.
                </p>

                <div v-if="currentStok === 0" class="pesan pesan-awas">
                  <TriangleAlert :size="20" :stroke-width="2.5" />
                  <span>
                    {{ varianTerpilih ? 'Varian ini sedang habis.' : 'Stok sedang habis.' }}
                    Tanya penjualnya kapan ada lagi.
                  </span>
                </div>

                <a
                  :href="tautanChat"
                  target="_blank"
                  rel="noopener"
                  class="tombol tombol-besar tombol-penuh"
                  :class="{ 'tombol-merah': currentStok === 0 || !terimaPesanan }"
                >
                  <IkonWa :size="22" />
                  {{ currentStok === 0 ? 'Tanya ketersediaan di WhatsApp' : 'Tanya penjual di WhatsApp' }}
                </a>
              </div>

              <!-- LOKASI: toko etalase atau yang melayani ambil di tempat -->
              <section v-if="!terimaPesanan || bisaAmbil" class="lokasi" aria-labelledby="judul-lokasi">
                <h2 id="judul-lokasi" class="label">{{ terimaPesanan ? 'Ambil di tempat' : 'Tersedia di toko' }}</h2>
                <p v-if="!terimaPesanan" class="lokasi-ket">
                  Toko ini memajang produknya dan tidak menerima pesanan lewat aplikasi. Hubungi penjual atau datang langsung.
                </p>
                <ul class="lokasi-daftar">
                  <li v-if="toko?.alamat"><MapPin :size="18" :stroke-width="2" /> {{ toko.alamat }}</li>
                  <li v-if="toko?.jam_buka"><Clock :size="18" :stroke-width="2" /> {{ toko.jam_buka }}</li>
                </ul>
                <a v-if="toko?.tautan_peta" :href="toko.tautan_peta" target="_blank" rel="noopener" class="tombol tombol-kecil">
                  <Navigation :size="16" :stroke-width="2" />
                  Lihat di peta
                </a>
              </section>

              <!-- INFO PENTING -->
              <ul v-if="terimaPesanan" class="info-penting" aria-label="Informasi pemesanan">
                <li>
                  <Wallet :size="20" :stroke-width="2" />
                  <span><strong>Pembayaran</strong> COD atau transfer, dipilih saat memesan.</span>
                </li>
                <li>
                  <Truck :size="20" :stroke-width="2" />
                  <span><strong>Penerimaan</strong> {{ teksPenerimaan }}</span>
                </li>
                <li>
                  <MessageCircle :size="20" :stroke-width="2" />
                  <span><strong>Konfirmasi</strong> Penjual mengonfirmasi pesanan melalui WhatsApp.</span>
                </li>
              </ul>

              <!-- DESKRIPSI -->
              <section v-if="produk.deskripsi" class="deskripsi">
                <h2 class="label">Tentang produk</h2>
                <p>{{ produk.deskripsi }}</p>
              </section>

              <!-- BAGIKAN -->
              <div class="bagikan">
                <button type="button" class="tombol tombol-kecil" @click="bagikan">
                  <Share2 :size="18" :stroke-width="2" />
                  Bagikan
                </button>
                <button type="button" class="tombol tombol-kecil" @click="copyLink">
                  <Check v-if="copied" :size="18" :stroke-width="2.5" />
                  <Link2 v-else :size="18" :stroke-width="2" />
                  {{ copied ? 'Tautan disalin' : 'Salin tautan' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section v-if="produkLain.length" class="lain">
        <div class="wadah">
          <h2 class="lain-judul huruf-papan">Produk lain dari {{ toko?.nama_toko }}</h2>
          <div class="grid-produk">
            <KartuProduk v-for="p in produkLain" :key="p.id" :produk="p" :tampil-toko="false" />
          </div>
        </div>
      </section>
    </template>
  </LayoutPublic>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ChevronRight,
  PackageX,
  Minus,
  Plus,
  ShoppingBasket,
  Store,
  MapPin,
  Check,
  Link2,
  TriangleAlert,
  BadgeCheck,
  Wallet,
  Truck,
  MessageCircle,
  Share2,
  Clock,
  Navigation,
} from 'lucide-vue-next';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';
import LayoutPublic from '@/layouts/LayoutPublic.vue';
import KartuProduk from '@/components/KartuProduk.vue';
import IkonWa from '@/components/IkonWa.vue';
import {
  formatRupiah,
  formatHargaProduk,
  punyaVarian,
  labelStok,
  tautanWa,
} from '@/lib/utils';
import { useProductSeo, useSeo } from '@/lib/useSeo';
import { urlToko, adalahUuid } from '@/lib/tautan';
import { labelKategori, iconKategori } from '@/lib/kategori';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(true);
const produk = ref(null);
const toko = ref(null);
const produkLain = ref([]);
const jumlah = ref(1);
const copied = ref(false);
const varianTerpilih = ref(null);

// Harga yang sedang aktif (varian terpilih, atau harga produk)
const currentHarga = computed(() =>
  varianTerpilih.value ? Number(varianTerpilih.value.harga) || 0 : produk.value?.harga || 0,
);

// Harga termurah dan termahal dari varian (bila ada)
const hargaMin = computed(() =>
  punyaVarian(produk.value) ? Math.min(...produk.value.varian.map((v) => Number(v.harga) || 0)) : 0,
);
const hargaMaks = computed(() =>
  punyaVarian(produk.value) ? Math.max(...produk.value.varian.map((v) => Number(v.harga) || 0)) : 0,
);
// Sebelum varian dipilih dan harganya berbeda, tampilkan "Mulai dari"
const adaRentang = computed(
  () => punyaVarian(produk.value) && !varianTerpilih.value && hargaMin.value !== hargaMaks.value,
);

const teksHarga = computed(() => {
  if (varianTerpilih.value) return formatRupiah(currentHarga.value);
  if (adaRentang.value) return formatRupiah(hargaMin.value);
  return formatHargaProduk(produk.value);
});

// Stok aktif: varian terpilih, total semua varian, atau stok produk
const currentStok = computed(() => {
  if (varianTerpilih.value) {
    return Number(varianTerpilih.value.stok) || 0;
  }
  if (punyaVarian(produk.value)) {
    return produk.value.varian.reduce((acc, curr) => acc + (Number(curr.stok) || 0), 0);
  }
  return Number(produk.value?.stok) || 0;
});

const isHabis = computed(() => currentStok.value === 0);

// Cara layanan toko (kolom kosong dianggap: terima pesanan, bisa diantar)
const terimaPesanan = computed(() => toko.value?.layanan_pesan !== false);
const bisaAntar = computed(() => toko.value?.layanan_antar !== false);
const bisaAmbil = computed(() => toko.value?.layanan_ambil === true);
const teksPenerimaan = computed(() => {
  if (bisaAntar.value && bisaAmbil.value)
    return 'Bisa diantar atau diambil di tempat. Diatur langsung dengan penjual lewat WhatsApp.';
  if (bisaAmbil.value) return 'Ambil di tempat penjual. Alamat dan jam buka tertera di bawah.';
  return 'Diatur langsung dengan penjual lewat WhatsApp setelah pesanan dikonfirmasi.';
});
const perluVarian = computed(() => punyaVarian(produk.value) && !varianTerpilih.value);
const kelasStok = computed(() => ({
  habis: currentStok.value === 0,
  sedikit: currentStok.value > 0 && currentStok.value <= 5,
}));

const pilihVarian = (v) => {
  varianTerpilih.value = v;
  jumlah.value = 1;
};

const kurangiJumlah = () => {
  if (jumlah.value > 1) jumlah.value--;
};
const tambahJumlah = () => {
  if (jumlah.value < currentStok.value) jumlah.value++;
};

const handlePesan = () => {
  if (perluVarian.value) return;

  let urlPesanan = `/pesan/${produk.value.id}?jumlah=${jumlah.value}`;
  if (varianTerpilih.value) {
    urlPesanan += `&varian=${encodeURIComponent(varianTerpilih.value.nama)}`;
  }

  if (!authStore.user) {
    router.push({ path: '/login', query: { redirect: urlPesanan } });
    return;
  }
  router.push(urlPesanan);
};

const tautanChat = computed(() => {
  if (!produk.value) return '#';
  let spek = `*${produk.value.nama_produk}*`;
  if (varianTerpilih.value) spek += ` (varian ${varianTerpilih.value.nama})`;
  const pesan = `Halo, saya lihat ${spek} di toko ${toko.value?.nama_toko} lewat ItahBangkuang. Masih ada?`;
  return tautanWa(toko.value?.nomor_wa, pesan);
});

// Di HP memakai lembar berbagi bawaan; di desktop jatuh ke WhatsApp Web
const bagikan = async () => {
  const url = window.location.href;
  const judul = produk.value.nama_produk;
  if (navigator.share) {
    try {
      await navigator.share({ title: judul, text: `${judul} di ItahBangkuang`, url });
    } catch {
      /* dibatalkan pengguna */
    }
    return;
  }
  const teks = `${judul} di ItahBangkuang\n${url}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(teks)}`, '_blank');
};

const copyLink = async () => {
  await navigator.clipboard.writeText(window.location.href);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2500);
};

const fetchData = async () => {
  loading.value = true;
  jumlah.value = 1;
  varianTerpilih.value = null; // Reset varian saat pindah produk

  // Alamat bisa berupa slug (ramah) atau UUID lama
  const kunci = String(route.params.id);
  const { data: p } = await supabase
    .from('produk')
    .select('*, toko(*)')
    .eq(adalahUuid(kunci) ? 'id' : 'slug', kunci)
    .single();

  // Dibuka lewat UUID lama: alihkan ke alamat ramah (pemuatan diulang oleh watcher rute)
  if (p && adalahUuid(kunci) && p.slug) {
    await router.replace({ path: `/produk/${p.slug}`, query: route.query, hash: route.hash });
    return;
  }

  if (!p || p.status !== 'AKTIF' || p.toko?.status !== 'AKTIF') {
    produk.value = null;
    useSeo({ title: 'Produk tidak ditemukan', noindex: true });
    loading.value = false;
    return;
  }

  produk.value = p;
  toko.value = p.toko;

  useProductSeo({
    nama: p.nama_produk,
    deskripsi: p.deskripsi,
    harga: hargaMin.value || p.harga,
    hargaMaks: hargaMaks.value || undefined,
    stok: currentStok.value,
    foto: p.foto_url,
    tokoNama: p.toko.nama_toko,
    produkId: p.slug || p.id,
  });

  const { data: lain } = await supabase
    .from('produk')
    .select('id, slug, nama_produk, foto_url, harga, stok, varian')
    .eq('toko_id', p.toko_id)
    .eq('status', 'AKTIF')
    .neq('id', p.id)
    .limit(4);

  produkLain.value = lain ?? [];
  loading.value = false;
};

onMounted(fetchData);
watch(() => route.params.id, fetchData);
</script>

<style scoped>
.tidak-ada {
  padding-top: 3rem;
  padding-bottom: 4rem;
}

.detail {
  background: var(--kabut);
  padding: 1.25rem 0 3rem;
}

.remah {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
  font-size: 0.92rem;
  color: var(--tinta-3);
  margin-bottom: 1.25rem;
}
.remah a {
  color: var(--tinta-2);
  font-weight: 700;
}
.remah span {
  color: var(--tinta-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 24ch;
}

.detail-grid {
  display: grid;
  gap: 1.75rem;
}
@media (min-width: 900px) {
  .detail-grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 3rem;
    align-items: start;
  }
  .foto-papan {
    position: sticky;
    top: calc(var(--nav-h) + 1.5rem);
  }
}

/* Foto */
.foto-papan {
  position: relative;
  background: var(--dinding);
  border-radius: 28px;
  overflow: hidden;
  box-shadow: var(--bayang);
}
.foto-utama {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
}
.foto-kategori {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  text-decoration: none;
  background: var(--papan);
}
.foto-habis {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(244, 246, 242, 0.78);
}
.foto-habis span {
  font-family: var(--font-papan);
  font-weight: 600;
  font-size: 1.6rem;
  color: var(--ink);
  background: #fff;
  border-radius: 999px;
  padding: 0.35rem 1.4rem;
  box-shadow: var(--bayang);
}

/* Info */
.nama {
  font-size: clamp(1.6rem, 4.6vw, 2.25rem);
  font-weight: 700;
  line-height: 1.15;
  text-wrap: balance;
}
.harga-baris {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.6rem 1rem;
  margin-top: 1rem;
}
.harga-blok {
  display: flex;
  flex-direction: column;
}
.harga-awalan {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--ink-2);
}
.harga {
  font-size: clamp(1.7rem, 5vw, 2.1rem);
  font-weight: 800;
  letter-spacing: -0.01em;
}
.stok {
  padding: 0.3rem 0.8rem;
  background: var(--sage);
  border-radius: 999px;
  color: var(--sungai);
  font-size: 0.85rem;
  font-weight: 800;
}
.stok.sedikit {
  background: var(--aprikot-muda);
  color: #8a4a1f;
}
.stok.habis {
  background: var(--merah-muda);
  color: var(--merah-tua);
}

/* Varian */
.varian {
  border: 0;
  margin-top: 1.75rem;
}
.varian legend {
  margin-bottom: 0.6rem;
}
.varian-wajib {
  font-weight: 400;
  color: var(--merah-tua);
}
.varian-daftar {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.6rem;
}
.varian-pilihan {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.1rem;
  min-height: 60px;
  padding: 0.6rem 0.9rem;
  background: #fff;
  border: 1.5px solid var(--garis-lembut);
  border-radius: 16px;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}
.varian-pilihan:hover:not(:disabled) {
  background: var(--sage);
}
.varian-pilihan.aktif {
  background: var(--sage);
  border-color: var(--sungai-sedang);
  box-shadow: 0 0 0 3px rgba(63, 127, 108, 0.22);
}
.varian-pilihan:disabled {
  cursor: not-allowed;
  border-style: dashed;
  color: var(--tinta-3);
}
.varian-nama {
  font-weight: 700;
  font-size: 1rem;
  line-height: 1.25;
}
.varian-ket {
  font-size: 0.88rem;
  color: var(--tinta-2);
}
.varian-pilihan:disabled .varian-ket {
  color: var(--merah-tua);
  font-weight: 700;
}

/* Jumlah */
.jumlah {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}
.jumlah-atur {
  display: inline-flex;
  align-items: stretch;
  border: 1.5px solid var(--garis);
  border-radius: 999px;
  overflow: hidden;
  background: #fff;
}
.jumlah-atur button {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  background: var(--papan);
  border: 0;
  cursor: pointer;
}
.jumlah-atur button:hover:not(:disabled) {
  background: var(--sage);
}
.jumlah-atur button:disabled {
  color: #b5b5b5;
  cursor: not-allowed;
}
.jumlah-atur output {
  display: grid;
  place-items: center;
  min-width: 56px;
  font-weight: 700;
  font-size: 1.15rem;
  border-left: 1.5px solid var(--garis);
  border-right: 1.5px solid var(--garis);
}

/* Aksi */
.aksi {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  margin-top: 1.75rem;
}
.aksi-lekat {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.aksi-total {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  flex-shrink: 0;
}
.aksi-total span {
  font-size: 0.85rem;
  color: var(--tinta-3);
  font-weight: 700;
}
.aksi-total strong {
  font-size: 1.25rem;
}
.aksi-pesan {
  flex: 1;
}
.aksi-catatan {
  font-size: 0.9rem;
  color: var(--tinta-3);
}
@media (max-width: 899px) {
  .aksi-lekat {
    position: fixed;
    inset: auto 0 0;
    z-index: 80;
    padding: 0.8rem 1.25rem calc(0.8rem + env(safe-area-inset-bottom));
    background: rgba(255, 255, 255, 0.94);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-top: 1px solid var(--sage-2);
    border-radius: 22px 22px 0 0;
    box-shadow: 0 -8px 28px rgba(29, 42, 38, 0.1);
  }
  .detail {
    padding-bottom: 6rem;
  }
}

.deskripsi {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--sage-2);
}
.deskripsi p {
  margin-top: 0.5rem;
  white-space: pre-line;
  line-height: 1.65;
  color: var(--tinta-2);
  max-width: 65ch;
}

/* Kartu toko (dinaikkan, di bawah harga) */
.papan-toko {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-top: 1.25rem;
  padding: 0.8rem 1rem;
  background: #fff;
  border: 1.5px solid var(--garis-lembut);
  border-radius: 20px;
  color: var(--ink);
  text-decoration: none;
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}
.papan-toko:hover {
  background: var(--sage);
}
.toko-foto {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  background: var(--sage);
  color: var(--sungai);
  border-radius: 50%;
  overflow: hidden;
}
.toko-foto img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.toko-teks {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}
.toko-label {
  font-size: 0.78rem;
  color: var(--ink-2);
  font-weight: 700;
}
.toko-nama {
  font-weight: 800;
  font-size: 1.02rem;
  line-height: 1.25;
}
.toko-alamat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: var(--ink-2);
  margin-top: 0.1rem;
}
.toko-terverifikasi {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.65rem;
  background: var(--sage);
  border-radius: 999px;
  color: var(--sungai);
  font-size: 0.76rem;
  font-weight: 800;
}
.toko-baru {
  background: var(--aprikot-muda);
  color: #7a4a24;
}
.papan-toko:hover .toko-terverifikasi {
  background: #fff;
}
.toko-panah {
  flex-shrink: 0;
  color: var(--ink-2);
}
@media (max-width: 520px) {
  .toko-terverifikasi {
    display: none;
  }
}

/* Lokasi / etalase */
.lokasi {
  margin-top: 1.5rem;
  padding: 1rem 1.1rem;
  background: #fff;
  border: 1.5px solid var(--garis-lembut);
  border-radius: 20px;
}
.lokasi-ket {
  margin-top: 0.4rem;
  color: var(--ink-2);
  line-height: 1.55;
}
.lokasi-daftar {
  list-style: none;
  display: grid;
  gap: 0.5rem;
  margin: 0.7rem 0;
}
.lokasi-daftar li {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  color: var(--ink);
}
.lokasi-daftar svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--sungai);
}

/* Info pemesanan */
.info-penting {
  list-style: none;
  display: grid;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding: 1rem 1.1rem;
  background: var(--sage);
  border-radius: 20px;
}
.info-penting li {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  font-size: 0.92rem;
  line-height: 1.5;
  color: var(--ink-2);
}
.info-penting svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--sungai);
}
.info-penting strong {
  display: block;
  color: var(--ink);
}

.bagikan {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

/* Produk lain */
.lain {
  background: var(--dinding);
  border-top: 1px solid var(--sage-2);
  padding: 2.5rem 0 3.5rem;
}
.lain-judul {
  font-size: clamp(1.3rem, 3.6vw, 1.75rem);
  margin-bottom: 1.25rem;
}
</style>
