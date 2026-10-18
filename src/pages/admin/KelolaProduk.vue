<template>
  <LayoutAdmin>
    <section class="kepala">
      <div class="wadah">
        <h1 class="judul-halaman">Kelola produk</h1>
        <p class="sub-halaman">Semua produk dari semua toko. Sembunyikan yang tidak pantas.</p>
      </div>
    </section>

    <div class="wadah isi">
      <div class="alat">
        <form class="cari" role="search" @submit.prevent="fetchProduk">
          <Search class="cari-ikon" :size="20" :stroke-width="2.5" aria-hidden="true" />
          <label for="cari-produk" class="sr-only">Cari produk</label>
          <input id="cari-produk" v-model="keyword" type="search" placeholder="Cari nama produk…" class="cari-input" @input="onSearch" />
          <button v-if="keyword" type="button" class="cari-hapus" aria-label="Hapus pencarian" @click="clearSearch">
            <X :size="18" :stroke-width="2.5" />
          </button>
        </form>

        <div class="isian saring">
          <label for="f-kategori" class="sr-only">Kategori</label>
          <select id="f-kategori" v-model="filterKategori" @change="fetchProduk">
            <option value="">Semua kategori</option>
            <option v-for="k in KATEGORI" :key="k.slug" :value="k.slug">{{ k.label }}</option>
          </select>
        </div>
        <div class="isian saring">
          <label for="f-status" class="sr-only">Status</label>
          <select id="f-status" v-model="filterStatus" @change="fetchProduk">
            <option value="">Semua status</option>
            <option value="AKTIF">Tampil</option>
            <option value="HABIS">Ditandai habis</option>
            <option value="DISEMBUNYIKAN">Disembunyikan</option>
          </select>
        </div>
      </div>

      <p v-if="!loading" class="hasil-info" aria-live="polite">
        <strong>{{ produkList.length }}</strong> produk
      </p>

      <div v-if="loading" class="memuat">
        <div class="spinner"></div>
        <p>Mengambil produk…</p>
      </div>

      <div v-else-if="produkList.length" class="bungkus-tabel">
        <table class="tabel">
          <thead>
            <tr>
              <th scope="col">Produk</th>
              <th scope="col">Toko</th>
              <th scope="col">Kategori</th>
              <th scope="col" class="angka">Harga</th>
              <th scope="col" class="angka">Stok</th>
              <th scope="col">Status</th>
              <th scope="col"><span class="sr-only">Aksi</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in produkList" :key="p.id">
              <td>
                <div class="produk-sel">
                  <img :src="p.foto_url" :alt="p.nama_produk" class="thumb" />
                  <span class="produk-nama">{{ p.nama_produk }}</span>
                  <span v-if="kembarDengan(p)" class="plat plat-kuning" :title="`Sama dengan produk toko ${kembarDengan(p)}`">
                    Kembar: {{ kembarDengan(p) }}
                  </span>
                </div>
              </td>
              <td>
                <RouterLink :to="`/toko/${p.toko?.id}`" target="_blank" class="toko-link">{{ p.toko?.nama_toko }}</RouterLink>
              </td>
              <td>{{ labelKategori(p.kategori) }}</td>
              <td class="angka">{{ formatHargaProduk(p) }}</td>
              <td class="angka" :class="{ merah: totalStok(p) <= 5 }">{{ totalStok(p) }}</td>
              <td>
                <span class="plat" :class="platStatus[p.status]">{{ labelStatus(p.status) }}</span>
              </td>
              <td>
                <div class="aksi">
                  <button
                    type="button"
                    class="tombol tombol-kecil"
                    :disabled="prosesId === p.id"
                    @click="toggleSembunyikan(p)"
                  >
                    <Eye v-if="p.status === 'DISEMBUNYIKAN'" :size="16" :stroke-width="2.5" />
                    <EyeOff v-else :size="16" :stroke-width="2.5" />
                    {{ p.status === 'DISEMBUNYIKAN' ? 'Tampilkan' : 'Sembunyikan' }}
                  </button>
                  <RouterLink :to="`/produk/${p.id}`" target="_blank" class="tombol tombol-kecil" :aria-label="`Lihat ${p.nama_produk}`">
                    <ExternalLink :size="16" :stroke-width="2.5" />
                  </RouterLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="kosong">
        <PackageSearch :size="44" :stroke-width="2" />
        <h3>Tidak ada produk yang cocok</h3>
        <p>Coba ubah kategori, status, atau kata kuncinya.</p>
      </div>
    </div>
  </LayoutAdmin>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Search, X, Eye, EyeOff, ExternalLink, PackageSearch } from 'lucide-vue-next';
import { supabase } from '@/lib/supabase';
import { useToastStore } from '@/stores/toast';
import LayoutAdmin from '@/layouts/LayoutAdmin.vue';
import { totalStok, formatHargaProduk } from '@/lib/utils';
import { KATEGORI, labelKategori } from '@/lib/kategori';

const route = useRoute();
const router = useRouter();
const toast = useToastStore();

const loading = ref(true);
const produkList = ref([]);
const keyword = ref('');
const filterKategori = ref('');
const filterStatus = ref('');
const prosesId = ref(null);
let searchTimeout = null;

// Penanda produk kembar: nama dan deskripsi sama persis di toko yang berbeda
const normal = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
const kembarDengan = (p) => {
  const nama = normal(p.nama_produk);
  const desk = normal(p.deskripsi);
  if (!nama || desk.length < 15) return '';
  const lain = produkList.value.find(
    (x) => x.id !== p.id && x.toko_id !== p.toko_id && normal(x.nama_produk) === nama && normal(x.deskripsi) === desk,
  );
  return lain?.toko?.nama_toko ?? '';
};

const labelStatus = (s) => ({ AKTIF: 'Tampil', HABIS: 'Habis', DISEMBUNYIKAN: 'Disembunyikan' })[s] ?? s;
const platStatus = { AKTIF: 'plat-hijau', HABIS: 'plat-kuning', DISEMBUNYIKAN: 'plat-tinta' };

const fetchProduk = async () => {
  loading.value = true;
  let query = supabase
    .from('produk')
    .select('*, toko(id, nama_toko)')
    .order('created_at', { ascending: false });

  if (filterKategori.value) query = query.eq('kategori', filterKategori.value);
  if (filterStatus.value) query = query.eq('status', filterStatus.value);
  if (keyword.value.trim()) query = query.ilike('nama_produk', `%${keyword.value.trim()}%`);

  const { data } = await query;
  produkList.value = data ?? [];
  loading.value = false;
};

const onSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(fetchProduk, 400);
};
const clearSearch = () => {
  keyword.value = '';
  fetchProduk();
};

const toggleSembunyikan = async (p) => {
  prosesId.value = p.id;
  const statusBaru = p.status === 'DISEMBUNYIKAN' ? 'AKTIF' : 'DISEMBUNYIKAN';
  const { error } = await supabase.from('produk').update({ status: statusBaru }).eq('id', p.id);
  if (error) {
    toast.error('Statusnya belum berubah. Periksa koneksi internet Anda, lalu coba lagi.');
  } else {
    p.status = statusBaru;
    toast.success(statusBaru === 'AKTIF' ? `“${p.nama_produk}” tampil lagi.` : `“${p.nama_produk}” disembunyikan.`);
  }
  prosesId.value = null;
};

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    router.replace({ path: '/login', query: { redirect: route.fullPath } });
    return;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (profile?.role !== 'admin') {
    router.push('/');
    return;
  }

  fetchProduk();
});
</script>

<style scoped>
.kepala {
  background: var(--sage);
  color: var(--sungai-dalam);
  border-radius: 0 0 32px 32px;
  padding: 1.5rem 0 1.75rem;
}
.kepala .judul-halaman {
  color: var(--sungai-dalam);
}
.kepala .sub-halaman {
  color: var(--ink-2);
}
.isi {
  padding-top: 1.25rem;
  padding-bottom: 2rem;
}

.alat {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}
.cari {
  position: relative;
  flex: 1 1 280px;
}
.cari-ikon {
  position: absolute;
  left: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}
.cari-input {
  width: 100%;
  min-height: 48px;
  padding: 0 2.9rem;
  background: var(--papan);
  color: var(--tinta);
  border: 1.5px solid var(--garis);
  border-radius: var(--sudut-kecil);
  font-family: var(--font-teks);
  font-size: 1rem;
  -webkit-appearance: none;
  appearance: none;
}
.cari-input::-webkit-search-cancel-button {
  display: none;
}
.cari-input:focus {
  outline: none;
  border-color: var(--biru);
  box-shadow: 0 0 0 3px var(--biru-muda);
}
.cari-hapus {
  position: absolute;
  right: 0.35rem;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  background: none;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}
.cari-hapus:hover {
  background: var(--dinding);
}
.saring {
  flex: 0 1 200px;
}
.saring + .saring {
  margin-top: 0;
}

.hasil-info {
  margin: 1rem 0 0.6rem;
  color: var(--tinta-2);
}
.hasil-info strong {
  color: var(--tinta);
}

.produk-sel {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 220px;
}
.thumb {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  object-fit: cover;
  border: 1.5px solid var(--garis);
  border-radius: 6px;
  background: var(--dinding);
}
.produk-nama {
  font-weight: 700;
}
.toko-link {
  font-weight: 700;
}
td.merah {
  color: var(--merah-tua);
  font-weight: 700;
}
.aksi {
  display: flex;
  gap: 0.4rem;
}
</style>
