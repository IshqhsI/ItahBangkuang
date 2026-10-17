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
        <p>Mungkin dihapus penjualnya, atau tokonya lagi tutup.</p>
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
                <span class="plat-harga harga">{{ teksHarga }}</span>
                <span class="stok" :class="kelasStok">
                  <template v-if="currentStok === 0">Stok habis</template>
                  <template v-else-if="currentStok <= 5">Tinggal {{ currentStok }}</template>
                  <template v-else>Stok {{ currentStok }}</template>
                </span>
              </div>

              <!-- VARIAN -->
              <fieldset v-if="punyaVarian(produk)" class="varian">
                <legend class="label">
                  Pilih varian
                  <span v-if="!varianTerpilih" class="varian-wajib">— wajib dipilih</span>
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
              <div v-if="currentStok > 0" class="jumlah">
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
                <div v-if="currentStok > 0" class="aksi-lekat">
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
                <p v-if="currentStok > 0 && !authStore.user" class="aksi-catatan">
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
                  class="tombol tombol-hijau tombol-besar tombol-penuh"
                >
                  <IkonWa :size="22" />
                  Tanya penjual di WA
                </a>
              </div>

              <!-- DESKRIPSI -->
              <section v-if="produk.deskripsi" class="deskripsi">
                <h2 class="label">Tentang produk</h2>
                <p>{{ produk.deskripsi }}</p>
              </section>

              <!-- TOKO -->
              <RouterLink :to="`/toko/${toko?.id}`" class="papan-toko papan">
                <span class="toko-foto">
                  <img v-if="toko?.foto_toko" :src="toko.foto_toko" :alt="toko.nama_toko" />
                  <Store v-else :size="28" :stroke-width="2.25" />
                </span>
                <span class="toko-teks">
                  <span class="toko-label">Dijual oleh</span>
                  <span class="toko-nama">{{ toko?.nama_toko }}</span>
                  <span v-if="toko?.alamat" class="toko-alamat">
                    <MapPin :size="15" :stroke-width="2.25" />
                    {{ toko.alamat }}
                  </span>
                </span>
                <ChevronRight :size="24" :stroke-width="2.5" class="toko-panah" />
              </RouterLink>

              <!-- BAGIKAN -->
              <div class="bagikan">
                <span class="label">Bagikan ke teman</span>
                <div class="bagikan-tombol">
                  <button type="button" class="tombol tombol-kecil" @click="shareWA">
                    <IkonWa :size="18" />
                    WhatsApp
                  </button>
                  <button type="button" class="tombol tombol-kecil" @click="shareFB">
                    <IkonFb :size="18" />
                    Facebook
                  </button>
                  <button type="button" class="tombol tombol-kecil" @click="copyLink">
                    <Check v-if="copied" :size="18" :stroke-width="2.75" />
                    <Link2 v-else :size="18" :stroke-width="2.5" />
                    {{ copied ? 'Tautan disalin' : 'Salin tautan' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section v-if="produkLain.length" class="lain">
        <div class="wadah">
          <h2 class="lain-judul huruf-papan">Dagangan lain dari {{ toko?.nama_toko }}</h2>
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
} from 'lucide-vue-next';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';
import LayoutPublic from '@/layouts/LayoutPublic.vue';
import KartuProduk from '@/components/KartuProduk.vue';
import IkonWa from '@/components/IkonWa.vue';
import IkonFb from '@/components/IkonFb.vue';
import {
  formatRupiah,
  formatHargaProduk,
  punyaVarian,
  tautanWa,
} from '@/lib/utils';
import { useProductSeo } from '@/lib/useSeo';
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

// Sebelum memilih varian, tampilkan rentang harga
const teksHarga = computed(() =>
  varianTerpilih.value ? formatRupiah(currentHarga.value) : formatHargaProduk(produk.value),
);

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

const shareWA = () => {
  const url = window.location.href;
  const hargaSensor = formatRupiah(currentHarga.value).replace(/\d/g, '?');
  const teks = `Coba lihat ini:\n\n*${produk.value.nama_produk}*\n${hargaSensor}\n\nHarganya ada di sini:\n${url}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(teks)}`, '_blank');
};

const shareFB = () => {
  const url = encodeURIComponent(window.location.href);
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    '_blank',
    'width=600,height=400',
  );
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

  const { data: p } = await supabase
    .from('produk')
    .select('*, toko(*)')
    .eq('id', route.params.id)
    .single();

  if (!p || p.status !== 'AKTIF' || p.toko?.status !== 'AKTIF') {
    produk.value = null;
    loading.value = false;
    return;
  }

  produk.value = p;
  toko.value = p.toko;

  useProductSeo({
    nama: p.nama_produk,
    deskripsi: p.deskripsi,
    harga: p.harga,
    foto: p.foto_url,
    tokoNama: p.toko.nama_toko,
    produkId: p.id,
  });

  const { data: lain } = await supabase
    .from('produk')
    .select('id, nama_produk, foto_url, harga, stok, varian')
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
  background: var(--papan);
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
  align-items: center;
  flex-wrap: wrap;
  gap: 0.9rem;
  margin-top: 1rem;
}
.harga {
  font-size: clamp(1.35rem, 4vw, 1.7rem);
  padding: 0.35rem 0.75rem 0.3rem;
}
.stok {
  font-weight: 700;
  color: var(--hijau);
}
.stok.sedikit {
  color: var(--merah-tua);
}
.stok.habis {
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
  padding: 0.55rem 0.8rem;
  background: var(--papan);
  border: 1.5px solid var(--garis);
  border-radius: var(--sudut);
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s ease;
}
.varian-pilihan:hover:not(:disabled) {
  background: var(--kuning-muda);
}
.varian-pilihan.aktif {
  background: var(--kuning);
  box-shadow:
    0 0 0 4px rgba(63, 127, 108, 0.22);
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
  border: var(--tebal) solid var(--garis);
  border-radius: var(--sudut);
  overflow: hidden;
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
  background: var(--kuning-muda);
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
    padding: 0.7rem 1.25rem calc(0.7rem + env(safe-area-inset-bottom));
    background: var(--papan);
    border-top: 1px solid var(--sage-2);
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

/* Papan toko */
.papan-toko {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin-top: 1.75rem;
  padding: 0.85rem 1rem;
  color: var(--tinta);
  text-decoration: none;
  transition: background-color 0.15s ease;
}
.papan-toko:hover {
  background: var(--kuning-muda);
}
.toko-foto {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  background: var(--hijau);
  color: #fff;
  border: 1.5px solid var(--garis);
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
  font-size: 0.82rem;
  color: var(--tinta-3);
  font-weight: 700;
}
.toko-nama {
  font-family: var(--font-papan);
  font-weight: 600;
  font-size: 1.05rem;
  line-height: 1.2;
}
.toko-alamat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.88rem;
  color: var(--tinta-2);
  margin-top: 0.15rem;
}
.toko-panah {
  flex-shrink: 0;
}

.bagikan {
  margin-top: 1.5rem;
}
.bagikan-tombol {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
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
