<template>
  <LayoutPublic>
    <section class="kepala">
      <div class="wadah sempit">
        <RouterLink :to="`/produk/${route.params.id}`" class="kembali">
          <ArrowLeft :size="18" :stroke-width="2.5" />
          Kembali ke produk
        </RouterLink>
        <h1 class="judul-halaman">Isi pesanan</h1>
      </div>
    </section>

    <div v-if="loadingData" class="memuat">
      <div class="spinner"></div>
      <p>Mengambil produk…</p>
    </div>

    <div v-else-if="!produk" class="wadah sempit tidak-ada">
      <div class="kosong">
        <PackageX :size="48" :stroke-width="2" />
        <h3>Produk ini tidak bisa dipesan</h3>
        <p>Mungkin sudah dihapus penjualnya, atau tokonya sedang tutup.</p>
        <RouterLink to="/produk" class="tombol tombol-merah">Lihat produk lain</RouterLink>
      </div>
    </div>

    <!-- BERHASIL -->
    <div v-else-if="orderSuccess" class="wadah sempit berhasil-wrap">
      <div class="papan papan-hijau papan-bingkai berhasil">
        <CircleCheck :size="48" :stroke-width="2.25" />
        <h2 class="huruf-papan">Pesananmu terkirim!</h2>
        <p>Penjual akan mengonfirmasi lewat WhatsApp. Kamu juga bisa menyapa duluan.</p>

        <dl class="rincian">
          <div><dt>Produk</dt><dd>{{ produk.nama_produk }}<template v-if="varianNama"> ({{ varianNama }})</template></dd></div>
          <div><dt>Jumlah</dt><dd>{{ form.jumlah }}</dd></div>
          <div><dt>Bayar</dt><dd>{{ form.metode === 'COD' ? 'COD (bayar di tempat)' : 'Transfer' }}</dd></div>
          <div class="rincian-total"><dt>Total</dt><dd>{{ formatRupiah(total) }}</dd></div>
        </dl>

        <div class="berhasil-aksi">
          <button type="button" class="tombol tombol-kuning tombol-besar" @click="chatPenjual">
            <IkonWa :size="22" />
            Sapa penjual di WA
          </button>
          <RouterLink to="/riwayat" class="tombol tombol-besar">Lihat Pesanan Saya</RouterLink>
        </div>
      </div>
    </div>

    <!-- FORMULIR -->
    <div v-else class="wadah sempit isi">
      <div class="tata">
        <!-- Ringkasan -->
        <section class="ringkasan papan" aria-labelledby="judul-ringkasan">
          <h2 id="judul-ringkasan" class="label">Yang kamu pesan</h2>
          <div class="produk-baris">
            <img :src="produk.foto_url" :alt="produk.nama_produk" class="produk-foto" />
            <div class="produk-teks">
              <p class="produk-toko"><Store :size="15" :stroke-width="2.25" /> {{ produk.toko?.nama_toko }}</p>
              <h3 class="produk-nama">{{ produk.nama_produk }}</h3>
              <p v-if="varianNama" class="produk-varian">Varian: {{ varianNama }}</p>
              <p class="produk-harga">{{ formatRupiah(currentHarga) }} <span>/ buah</span></p>
            </div>
          </div>

          <div class="jumlah">
            <span class="label" id="label-jumlah">Jumlah</span>
            <div class="jumlah-atur" role="group" aria-labelledby="label-jumlah">
              <button type="button" aria-label="Kurangi jumlah" :disabled="form.jumlah <= 1" @click="kurangi">
                <Minus :size="20" :stroke-width="2.75" />
              </button>
              <input
                v-model.number="form.jumlah"
                type="number"
                inputmode="numeric"
                :min="1"
                :max="currentStok"
                aria-label="Jumlah pesanan"
                @change="clampJumlah"
              />
              <button type="button" aria-label="Tambah jumlah" :disabled="form.jumlah >= currentStok" @click="tambah">
                <Plus :size="20" :stroke-width="2.75" />
              </button>
            </div>
            <span class="jumlah-stok">Stok {{ currentStok }}</span>
          </div>

          <div class="total">
            <span>Total bayar</span>
            <strong>{{ formatRupiah(total) }}</strong>
          </div>
        </section>

        <!-- Data pemesan -->
        <form class="formulir papan" novalidate @submit.prevent="handleOrder">
          <h2 class="label judul-form">Data pemesan</h2>

          <div class="isian">
            <label for="nama">Nama</label>
            <input id="nama" v-model="form.nama_pemesan" type="text" autocomplete="name" :disabled="loading" />
          </div>

          <div class="isian">
            <label for="wa">Nomor WhatsApp</label>
            <div class="awalan">
              <span class="awalan-teks" aria-hidden="true">+62</span>
              <input
                id="wa"
                v-model="form.nomor_wa"
                type="tel"
                inputmode="numeric"
                autocomplete="tel-national"
                placeholder="81234567890"
                maxlength="13"
                aria-describedby="wa-bantuan"
                :aria-invalid="!!nomorWaError"
                :disabled="loading"
                @input="sanitizeNomorWa"
              />
            </div>
            <span id="wa-bantuan" class="bantuan">Penjual menghubungimu lewat nomor ini. Tulis tanpa 0 di depan.</span>
            <span v-if="nomorWaError" class="galat">{{ nomorWaError }}</span>
          </div>

          <div class="isian">
            <label for="alamat">Alamat pengantaran</label>
            <textarea
              id="alamat"
              v-model="form.alamat"
              rows="3"
              autocomplete="street-address"
              placeholder="Contoh: Jl. Mawar RT 02, dekat masjid"
              :disabled="loading"
            ></textarea>
          </div>

          <fieldset class="metode">
            <legend class="label">Mau bayar bagaimana?</legend>
            <div class="metode-pilihan">
              <label class="metode-kartu" :class="{ dipilih: form.metode === 'COD' }">
                <input v-model="form.metode" type="radio" value="COD" class="sr-only" />
                <HandCoins :size="26" :stroke-width="2.25" />
                <span class="metode-nama">COD</span>
                <span class="metode-ket">Bayar saat barang diterima</span>
              </label>
              <label class="metode-kartu" :class="{ dipilih: form.metode === 'TRANSFER' }">
                <input v-model="form.metode" type="radio" value="TRANSFER" class="sr-only" />
                <Landmark :size="26" :stroke-width="2.25" />
                <span class="metode-nama">Transfer</span>
                <span class="metode-ket">Lewat bank atau e-wallet</span>
              </label>
            </div>
          </fieldset>

          <div class="isian">
            <label for="catatan">Catatan <span class="opsional">(boleh dikosongkan)</span></label>
            <textarea
              id="catatan"
              v-model="form.catatan"
              rows="2"
              placeholder="Contoh: jangan terlalu manis, tolong dikemas rapi"
              :disabled="loading"
            ></textarea>
          </div>

          <div v-if="errorMsg" class="pesan pesan-galat" role="alert">
            <CircleAlert :size="20" :stroke-width="2.5" />
            <span>{{ errorMsg }}</span>
          </div>

          <button type="submit" class="tombol tombol-merah tombol-besar tombol-penuh kirim" :disabled="loading || !!nomorWaError || currentStok < 1">
            <span v-if="loading" class="spinner-sm"></span>
            <Send v-else :size="20" :stroke-width="2.5" />
            {{ loading ? 'Mengirim…' : 'Kirim pesanan' }}
          </button>
          <p class="catatan-kaki">Setelah terkirim, kamu dan penjual melanjutkan lewat WhatsApp untuk konfirmasi dan pengantaran.</p>
        </form>
      </div>
    </div>
  </LayoutPublic>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowLeft,
  PackageX,
  CircleCheck,
  CircleAlert,
  Store,
  Minus,
  Plus,
  HandCoins,
  Landmark,
  Send,
} from 'lucide-vue-next';
import { supabase } from '@/lib/supabase';
import LayoutPublic from '@/layouts/LayoutPublic.vue';
import IkonWa from '@/components/IkonWa.vue';
import { formatRupiah, tautanWa } from '@/lib/utils';

const route = useRoute();
const router = useRouter();
const loadingData = ref(true);
const loading = ref(false);
const errorMsg = ref('');
const produk = ref(null);
const orderSuccess = ref(false);
const userId = ref(null);
const nomorWaError = ref('');

const varianNama = ref(route.query.varian || null);

const form = ref({
  nama_pemesan: '',
  nomor_wa: '',
  alamat: '',
  metode: 'COD',
  catatan: '',
  jumlah: 1,
});

const selectedVarian = computed(() => {
  if (!produk.value?.varian || !varianNama.value) return null;
  return produk.value.varian.find((v) => v.nama === varianNama.value);
});

const currentHarga = computed(() =>
  selectedVarian.value ? Number(selectedVarian.value.harga) || 0 : produk.value?.harga || 0,
);

const currentStok = computed(() =>
  selectedVarian.value ? Number(selectedVarian.value.stok) || 0 : Number(produk.value?.stok) || 0,
);

const total = computed(() => currentHarga.value * form.value.jumlah);

// Nomor WA: hanya angka, tanpa awalan 0 / 62
const sanitizeNomorWa = () => {
  const val = form.value.nomor_wa.replace(/\D/g, '').replace(/^(62|0)/, '');
  form.value.nomor_wa = val;

  if (val.length > 0 && val.length < 9) {
    nomorWaError.value = 'Nomor WA terlalu pendek. Minimal 9 angka.';
  } else if (val.length > 13) {
    nomorWaError.value = 'Nomor WA terlalu panjang. Maksimal 13 angka.';
  } else {
    nomorWaError.value = '';
  }
};

const kurangi = () => {
  if (form.value.jumlah > 1) form.value.jumlah--;
};
const tambah = () => {
  if (form.value.jumlah < currentStok.value) form.value.jumlah++;
};
const clampJumlah = () => {
  if (!form.value.jumlah || form.value.jumlah < 1) form.value.jumlah = 1;
  if (currentStok.value > 0 && form.value.jumlah > currentStok.value)
    form.value.jumlah = currentStok.value;
};

const chatPenjual = () => {
  let detail = `*${produk.value.nama_produk}*`;
  if (varianNama.value) detail += ` (varian ${varianNama.value})`;
  const pesan = `Halo, saya baru memesan ${detail} sebanyak ${form.value.jumlah} lewat ItahBangkuang. Mohon dikonfirmasi ya.`;
  window.open(tautanWa(produk.value?.toko?.nomor_wa, pesan), '_blank');
};

const addPhoneNumber = (number) => {
  if (!number) return Promise.resolve();
  return supabase.from('profiles').update({ no_wa: number }).eq('id', userId.value);
};
const addAddressToProfile = (address) => {
  if (!address) return Promise.resolve();
  return supabase.from('profiles').update({ alamat: address }).eq('id', userId.value);
};

const handleOrder = async () => {
  errorMsg.value = '';
  if (!form.value.nama_pemesan.trim() || !form.value.nomor_wa || !form.value.alamat.trim()) {
    errorMsg.value = 'Nama, nomor WhatsApp, dan alamat wajib diisi.';
    return;
  }
  if (nomorWaError.value) return;
  clampJumlah();

  loading.value = true;

  const { error } = await supabase.rpc('handle_create_order_v2', {
    p_produk_id: produk.value.id,
    p_pembeli_id: userId.value,
    p_nama_pemesan: form.value.nama_pemesan.trim(),
    p_nomor_wa_pembeli: form.value.nomor_wa,
    p_alamat: form.value.alamat.trim(),
    p_jumlah: form.value.jumlah,
    p_metode: form.value.metode,
    p_catatan: form.value.catatan ?? '',
    p_varian_pilihan: varianNama.value,
  });

  if (error) {
    console.error('Order Error:', error);
    if (error.message.includes('stok')) {
      errorMsg.value = 'Stoknya tidak cukup untuk jumlah ini. Kurangi jumlahnya, atau tanya penjual kapan ada lagi.';
    } else if (error.message.includes('sendiri')) {
      errorMsg.value = 'Kamu tidak bisa memesan dari tokomu sendiri.';
    } else {
      errorMsg.value = 'Pesananmu belum terkirim. Periksa koneksi internetmu, lalu coba lagi.';
    }
    loading.value = false;
    return;
  }

  await Promise.allSettled([
    addPhoneNumber(form.value.nomor_wa),
    addAddressToProfile(form.value.alamat),
  ]);

  orderSuccess.value = true;
  loading.value = false;
  window.scrollTo({ top: 0 });
};

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    router.replace({ path: '/login', query: { redirect: route.fullPath } });
    return;
  }

  userId.value = session.user.id;

  const { data: profile } = await supabase
    .from('profiles')
    .select('nama_lengkap, no_wa, alamat')
    .eq('id', session.user.id)
    .single();

  if (profile) {
    form.value.nama_pemesan = profile.nama_lengkap || '';
    form.value.nomor_wa = (profile.no_wa || '').replace(/^(\+62|62|0)/, '');
    form.value.alamat = profile.alamat || '';
  }

  const { data: produkData } = await supabase
    .from('produk')
    .select('*, toko(nama_toko, nomor_wa, status, user_id)')
    .eq('id', route.params.id)
    .single();

  if (!produkData || produkData.status !== 'AKTIF' || produkData.toko?.status !== 'AKTIF') {
    loadingData.value = false;
    return;
  }

  if (produkData.toko?.user_id === session.user.id) {
    router.push('/toko/produk');
    return;
  }

  produk.value = produkData;

  // Jumlah awal dari URL, dihitung setelah produk terisi supaya stok sudah benar
  const parsed = parseInt(route.query.jumlah) || 1;
  form.value.jumlah = Math.min(Math.max(parsed, 1), Math.max(currentStok.value, 1));

  loadingData.value = false;
});
</script>

<style scoped>
.sempit {
  max-width: 980px;
}
.kepala {
  background: var(--kuning);
  border-bottom: 3px solid var(--tinta);
  padding: 1rem 0 1.5rem;
}
.kembali {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 40px;
  color: var(--tinta);
  font-weight: 700;
  text-decoration: none;
}
.kembali:hover {
  text-decoration: underline;
}
.tidak-ada {
  padding-top: 3rem;
  padding-bottom: 4rem;
}
.isi {
  padding-top: 1.75rem;
  padding-bottom: 4rem;
}
.tata {
  display: grid;
  gap: 1.25rem;
  align-items: start;
}
@media (min-width: 900px) {
  .tata {
    grid-template-columns: 0.85fr 1.15fr;
    gap: 2rem;
  }
  .ringkasan {
    position: sticky;
    top: calc(var(--nav-h) + 1.25rem);
  }
}

.ringkasan,
.formulir {
  padding: 1.25rem;
}
@media (min-width: 560px) {
  .formulir {
    padding: 1.75rem;
  }
}
.judul-form {
  margin-bottom: 1.1rem;
  font-size: 1.05rem;
}

.produk-baris {
  display: flex;
  gap: 0.9rem;
  margin-top: 0.75rem;
}
.produk-foto {
  flex-shrink: 0;
  width: 92px;
  height: 92px;
  object-fit: cover;
  border: 2.5px solid var(--tinta);
  border-radius: var(--sudut);
  background: var(--dinding);
}
.produk-teks {
  min-width: 0;
}
.produk-toko {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.88rem;
  color: var(--tinta-3);
}
.produk-nama {
  font-size: 1.05rem;
  line-height: 1.25;
  margin-top: 0.1rem;
}
.produk-varian {
  display: inline-block;
  margin-top: 0.3rem;
  padding: 0.05rem 0.5rem;
  background: var(--kuning);
  border: 2px solid var(--tinta);
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 700;
}
.produk-harga {
  margin-top: 0.35rem;
  font-weight: 700;
}
.produk-harga span {
  font-weight: 400;
  color: var(--tinta-3);
}

.jumlah {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
  margin-top: 1.25rem;
  padding-top: 1.1rem;
  border-top: 1px solid var(--garis-lembut);
}
.jumlah-atur {
  display: inline-flex;
  border: 2.5px solid var(--tinta);
  border-radius: var(--sudut);
  overflow: hidden;
}
.jumlah-atur button {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
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
.jumlah-atur input {
  width: 56px;
  text-align: center;
  font-family: var(--font-teks);
  font-size: 1.1rem;
  font-weight: 700;
  border: 0;
  border-left: 2px solid var(--tinta);
  border-right: 2px solid var(--tinta);
  -moz-appearance: textfield;
  appearance: textfield;
}
.jumlah-atur input::-webkit-outer-spin-button,
.jumlah-atur input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.jumlah-atur input:focus {
  outline: none;
  background: var(--biru-muda);
}
.jumlah-stok {
  color: var(--tinta-3);
  font-size: 0.92rem;
}

.total {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.25rem;
  padding: 0.9rem 1rem;
  background: var(--kuning);
  border: 2.5px solid var(--tinta);
  border-radius: var(--sudut);
  font-weight: 700;
}
.total strong {
  font-family: var(--font-papan);
  font-size: 1.45rem;
  font-weight: 400;
}

.awalan {
  display: flex;
  align-items: stretch;
}
.awalan-teks {
  display: grid;
  place-items: center;
  padding: 0 0.8rem;
  background: var(--kuning);
  border: 2px solid var(--tinta);
  border-right: 0;
  border-radius: var(--sudut-kecil) 0 0 var(--sudut-kecil);
  font-weight: 700;
}
.awalan input {
  border-radius: 0 var(--sudut-kecil) var(--sudut-kecil) 0 !important;
}
.opsional {
  font-weight: 400;
  color: var(--tinta-3);
}

.metode {
  border: 0;
  margin: 1.1rem 0;
}
.metode legend {
  margin-bottom: 0.5rem;
}
.metode-pilihan {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
}
.metode-kartu {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.8rem 0.85rem;
  background: var(--papan);
  border: 2.5px solid var(--tinta);
  border-radius: var(--sudut);
  cursor: pointer;
  transition: background-color 0.15s ease;
}
.metode-kartu:hover {
  background: var(--kuning-muda);
}
.metode-kartu.dipilih {
  background: var(--kuning);
  box-shadow:
    inset 0 0 0 3px var(--kuning),
    inset 0 0 0 5px var(--tinta);
}
.metode-kartu:has(input:focus-visible) {
  outline: 3px solid var(--biru);
  outline-offset: 3px;
}
.metode-nama {
  font-family: var(--font-papan);
  font-size: 1.05rem;
}
.metode-ket {
  font-size: 0.86rem;
  color: var(--tinta-2);
  line-height: 1.3;
}

.formulir .pesan {
  margin-top: 1.1rem;
}
.kirim {
  margin-top: 1.4rem;
}
.catatan-kaki {
  margin-top: 0.8rem;
  font-size: 0.88rem;
  color: var(--tinta-3);
  text-align: center;
}

/* Berhasil */
.berhasil-wrap {
  padding-top: 2rem;
  padding-bottom: 4rem;
  max-width: 640px;
}
.berhasil {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 2rem 1.5rem;
}
.berhasil h2 {
  font-size: 1.9rem;
}
.berhasil > p {
  color: #e6f4ea;
}
.rincian {
  width: 100%;
  margin: 0.5rem 0;
  background: var(--papan);
  color: var(--tinta);
  border: 2.5px solid var(--tinta);
  border-radius: var(--sudut);
}
.rincian > div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.7rem 1rem;
  border-bottom: 1px solid var(--garis-lembut);
}
.rincian > div:last-child {
  border-bottom: 0;
}
.rincian dt {
  color: var(--tinta-3);
}
.rincian dd {
  font-weight: 700;
  text-align: right;
}
.rincian-total {
  background: var(--kuning);
}
.rincian-total dt {
  color: var(--tinta);
  font-weight: 700;
}
.berhasil-aksi {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}
</style>
