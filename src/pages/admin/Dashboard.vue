<template>
  <LayoutAdmin>
    <section class="kepala">
      <div class="wadah">
        <p class="kepala-sapa">Panel admin</p>
        <h1 class="judul-halaman">Ringkasan ItahBangkuang</h1>
      </div>
    </section>

    <div class="wadah isi">
      <dl class="ringkasan papan">
        <div>
          <dt>Toko aktif</dt>
          <dd>{{ stats.tokoAktif }}</dd>
        </div>
        <div :class="{ perlu: stats.tokoPending > 0 }">
          <dt>Menunggu diperiksa</dt>
          <dd>{{ stats.tokoPending }}</dd>
        </div>
        <div>
          <dt>Produk tampil</dt>
          <dd>{{ stats.totalProduk }}</dd>
        </div>
        <div>
          <dt>Total pesanan</dt>
          <dd>{{ stats.totalOrder }}</dd>
        </div>
      </dl>

      <div class="kolom">
        <!-- Toko menunggu -->
        <section aria-labelledby="h-toko">
          <div class="kepala-bagian">
            <h2 id="h-toko" class="huruf-papan">Toko menunggu diperiksa</h2>
            <RouterLink to="/admin/toko" class="lihat">Semua toko</RouterLink>
          </div>

          <div v-if="loadingToko" class="memuat kecil"><div class="spinner"></div></div>

          <ul v-else-if="tokoPending.length" class="daftar papan">
            <li v-for="t in tokoPending" :key="t.id" class="baris baris-toko">
              <div class="baris-teks">
                <p class="baris-nama">{{ t.nama_toko }}</p>
                <p class="baris-ket"><MapPin :size="14" :stroke-width="2.5" /> {{ t.alamat }}</p>
                <p class="baris-ket"><Phone :size="14" :stroke-width="2.5" /> +62{{ t.nomor_wa }}</p>
                <p class="baris-ket">Daftar {{ formatTanggal(t.created_at) }}</p>
              </div>
              <div class="baris-aksi">
                <button type="button" class="tombol tombol-kecil tombol-hijau" :disabled="prosesId === t.id" @click="accToko(t.id)">
                  <Check :size="16" :stroke-width="3" />
                  {{ prosesId === t.id ? 'Menyimpan…' : 'Setujui' }}
                </button>
                <button type="button" class="tombol tombol-kecil tombol-bahaya" :disabled="prosesId === t.id" @click="bukaTolak(t)">
                  Tolak
                </button>
              </div>
            </li>
          </ul>

          <p v-else class="tenang"><CircleCheck :size="20" :stroke-width="2.5" /> Tidak ada toko yang menunggu.</p>
        </section>

        <!-- Pesanan terbaru -->
        <section aria-labelledby="h-order">
          <div class="kepala-bagian">
            <h2 id="h-order" class="huruf-papan">Pesanan terbaru</h2>
          </div>

          <div v-if="loadingOrder" class="memuat kecil"><div class="spinner"></div></div>

          <ul v-else-if="orderTerbaru.length" class="daftar papan">
            <li v-for="o in orderTerbaru" :key="o.id" class="baris">
              <div class="baris-teks">
                <p class="baris-nama">{{ o.nama_pemesan }}</p>
                <p class="baris-ket">{{ o.produk?.nama_produk }} · {{ o.toko?.nama_toko }}</p>
                <p class="baris-ket">{{ formatTanggal(o.created_at) }}</p>
              </div>
              <div class="baris-kanan">
                <p class="baris-harga">{{ formatRupiah(o.total_harga) }}</p>
                <span class="badge" :class="badgeClass(o.status)">{{ labelStatus(o.status) }}</span>
              </div>
            </li>
          </ul>

          <p v-else class="tenang"><Inbox :size="20" :stroke-width="2.5" /> Belum ada pesanan.</p>
        </section>
      </div>

      <!-- Saran & keluhan -->
      <section class="masukan" aria-labelledby="h-masukan">
        <div class="kepala-bagian">
          <h2 id="h-masukan" class="huruf-papan">
            Saran &amp; keluhan baru
            <span v-if="feedbackBaru.length" class="plat plat-merah">{{ feedbackBaru.length }}</span>
          </h2>
          <button v-if="feedbackBaru.length" type="button" class="tombol tombol-kecil" @click="tandaiSemuaDibaca">
            Tandai semua sudah dibaca
          </button>
        </div>

        <div v-if="loadingFeedback" class="memuat kecil"><div class="spinner"></div></div>

        <ul v-else-if="feedbackBaru.length" class="daftar papan">
          <li v-for="f in feedbackBaru" :key="f.id" class="baris baris-masukan">
            <div class="baris-teks">
              <span class="plat" :class="platMasukan[f.kategori] ?? ''">{{ labelMasukan(f.kategori) }}</span>
              <p class="masukan-isi">{{ f.isi }}</p>
              <p class="baris-ket">{{ f.profiles?.nama_lengkap ?? 'Pengguna' }} · {{ formatTanggal(f.created_at) }}</p>
            </div>
            <button type="button" class="tombol tombol-kecil" :disabled="prosesFeedbackId === f.id" @click="tandaiDibaca(f.id)">
              <Check :size="16" :stroke-width="3" />
              Sudah dibaca
            </button>
          </li>
        </ul>

        <p v-else class="tenang"><CircleCheck :size="20" :stroke-width="2.5" /> Tidak ada masukan baru.</p>
      </section>
    </div>

    <!-- Tolak toko -->
    <dialog ref="dialogTolak" class="dialog" @close="tolakTarget = null">
      <div class="dialog-isi">
        <h2 class="huruf-papan">Tolak {{ tolakTarget?.nama_toko }}?</h2>
        <div class="isian">
          <label for="alasan">Alasan penolakan</label>
          <textarea
            id="alasan"
            v-model="alasanTolak"
            rows="3"
            aria-describedby="alasan-bantuan"
            placeholder="Contoh: Nomor WhatsApp tidak aktif. Mohon perbaiki lalu hubungi admin."
          ></textarea>
          <span id="alasan-bantuan" class="bantuan">Penjual akan membaca alasan ini, jadi tulis supaya mereka tahu apa yang perlu diperbaiki.</span>
        </div>
        <div class="dialog-aksi">
          <button type="button" class="tombol" @click="dialogTolak.close()">Batal</button>
          <button type="button" class="tombol tombol-merah" :disabled="!alasanTolak.trim() || !!prosesId" @click="konfirmasiTolak">
            Tolak toko
          </button>
        </div>
      </div>
    </dialog>
  </LayoutAdmin>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MapPin, Phone, Check, CircleCheck, Inbox } from 'lucide-vue-next';
import { supabase } from '@/lib/supabase';
import { useToastStore } from '@/stores/toast';
import LayoutAdmin from '@/layouts/LayoutAdmin.vue';
import { formatRupiah, formatTanggal, badgeOrderClass } from '@/lib/utils';

const route = useRoute();
const router = useRouter();
const toast = useToastStore();

const loadingToko = ref(true);
const loadingOrder = ref(true);
const loadingFeedback = ref(true);
const tokoPending = ref([]);
const orderTerbaru = ref([]);
const feedbackBaru = ref([]);
const prosesId = ref(null);
const prosesFeedbackId = ref(null);
const dialogTolak = ref(null);
const tolakTarget = ref(null);
const alasanTolak = ref('');
const stats = ref({ tokoAktif: 0, tokoPending: 0, totalProduk: 0, totalOrder: 0 });

const badgeClass = badgeOrderClass;
const labelStatus = (s) =>
  ({ MENUNGGU: 'Menunggu', DIKONFIRMASI: 'Dikonfirmasi', SELESAI: 'Selesai', DIBATALKAN: 'Dibatalkan' })[s] ?? s;

const labelMasukan = (kat) => ({ saran: 'Saran', keluhan: 'Keluhan', fitur: 'Minta fitur' })[kat] ?? kat;
const platMasukan = { saran: 'plat-kuning', keluhan: 'plat-merah', fitur: 'plat-biru' };

const tandaiDibaca = async (id) => {
  prosesFeedbackId.value = id;
  const { error } = await supabase.from('feedback').update({ status: 'DIBACA' }).eq('id', id);
  if (error) {
    toast.error('Belum berhasil ditandai. Coba lagi.');
  } else {
    feedbackBaru.value = feedbackBaru.value.filter((f) => f.id !== id);
  }
  prosesFeedbackId.value = null;
};

const tandaiSemuaDibaca = async () => {
  const ids = feedbackBaru.value.map((f) => f.id);
  const { error } = await supabase.from('feedback').update({ status: 'DIBACA' }).in('id', ids);
  if (error) {
    toast.error('Belum berhasil ditandai. Coba lagi.');
    return;
  }
  feedbackBaru.value = [];
};

const accToko = async (id) => {
  prosesId.value = id;
  const { error } = await supabase.from('toko').update({ status: 'AKTIF' }).eq('id', id);
  if (error) {
    toast.error('Toko belum berhasil disetujui. Coba lagi.');
  } else {
    const t = tokoPending.value.find((x) => x.id === id);
    tokoPending.value = tokoPending.value.filter((x) => x.id !== id);
    stats.value.tokoPending--;
    stats.value.tokoAktif++;
    toast.success(`${t?.nama_toko ?? 'Toko'} disetujui.`);
  }
  prosesId.value = null;
};

const bukaTolak = (toko) => {
  tolakTarget.value = toko;
  alasanTolak.value = '';
  dialogTolak.value?.showModal();
};

const konfirmasiTolak = async () => {
  const target = tolakTarget.value;
  if (!target || !alasanTolak.value.trim()) return;
  prosesId.value = target.id;
  const { error } = await supabase
    .from('toko')
    .update({ status: 'DITOLAK', alasan_tolak: alasanTolak.value.trim() })
    .eq('id', target.id);
  if (error) {
    toast.error('Toko belum berhasil ditolak. Coba lagi.');
  } else {
    tokoPending.value = tokoPending.value.filter((t) => t.id !== target.id);
    stats.value.tokoPending--;
    toast.success(`${target.nama_toko} ditolak.`);
    dialogTolak.value?.close();
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

  const hitung = (tabel, status) => {
    let q = supabase.from(tabel).select('*', { count: 'exact', head: true });
    return status ? q.eq('status', status) : q;
  };

  const [tokoRes, orderRes, a, b, c, d, feedbackRes] = await Promise.all([
    supabase.from('toko').select('*').eq('status', 'PENDING').order('created_at', { ascending: true }).limit(10),
    supabase.from('orders').select('*, produk(nama_produk), toko(nama_toko)').order('created_at', { ascending: false }).limit(8),
    hitung('toko', 'AKTIF'),
    hitung('toko', 'PENDING'),
    hitung('produk', 'AKTIF'),
    hitung('orders'),
    supabase.from('feedback').select('*, profiles(nama_lengkap)').eq('status', 'BARU').order('created_at', { ascending: false }).limit(20),
  ]);

  tokoPending.value = tokoRes.data ?? [];
  orderTerbaru.value = orderRes.data ?? [];
  feedbackBaru.value = feedbackRes.data ?? [];
  stats.value = {
    tokoAktif: a.count ?? 0,
    tokoPending: b.count ?? 0,
    totalProduk: c.count ?? 0,
    totalOrder: d.count ?? 0,
  };
  loadingToko.value = false;
  loadingOrder.value = false;
  loadingFeedback.value = false;
});
</script>

<style scoped>
.kepala {
  background: var(--biru);
  color: #fff;
  border-bottom: 3px solid var(--tinta);
  padding: 1.5rem 0 1.75rem;
}
.kepala .judul-halaman {
  color: #fff;
}
.kepala-sapa {
  color: #c9d8f2;
  font-weight: 700;
  margin-bottom: 0.2rem;
}
.isi {
  padding-top: 1.5rem;
  padding-bottom: 2rem;
}

.ringkasan {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}
@media (min-width: 720px) {
  .ringkasan {
    grid-template-columns: repeat(4, 1fr);
  }
}
.ringkasan > div {
  padding: 0.9rem 1.1rem;
  border-right: 1px solid var(--garis-lembut);
  border-bottom: 1px solid var(--garis-lembut);
}
.ringkasan > div.perlu {
  background: var(--kuning);
}
.ringkasan dt {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--tinta-3);
}
.ringkasan .perlu dt {
  color: var(--tinta);
}
.ringkasan dd {
  font-family: var(--font-papan);
  font-size: 1.7rem;
}

.kolom {
  display: grid;
  gap: 1.75rem;
  margin-top: 2rem;
}
@media (min-width: 960px) {
  .kolom {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    align-items: start;
  }
}
.masukan {
  margin-top: 2rem;
}
.kepala-bagian {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 0.7rem;
}
.kepala-bagian h2 {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.2rem;
}
.lihat {
  font-weight: 700;
}

.memuat.kecil {
  padding: 2rem 0;
}
.tenang {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 0;
  font-weight: 700;
  color: var(--tinta-2);
}

.daftar {
  list-style: none;
}
.baris {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.9rem;
  padding: 0.9rem 1rem;
  border-bottom: 1px solid var(--garis-lembut);
}
.daftar > li:last-child {
  border-bottom: 0;
}
.baris-teks {
  flex: 1;
  min-width: 0;
}
.baris-nama {
  font-weight: 700;
}
.baris-ket {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.9rem;
  color: var(--tinta-3);
  overflow-wrap: anywhere;
}
.baris-aksi {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.baris-kanan {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.3rem;
}
.baris-harga {
  font-weight: 700;
}
@media (max-width: 480px) {
  .baris-toko {
    flex-direction: column;
  }
  .baris-aksi {
    flex-direction: row;
  }
}
.masukan-isi {
  margin: 0.35rem 0;
  white-space: pre-line;
  overflow-wrap: anywhere;
  max-width: 70ch;
}

.dialog {
  margin: auto;
  width: min(480px, calc(100vw - 2rem));
  padding: 0;
  background: var(--papan);
  color: var(--tinta);
  border: 3px solid var(--tinta);
  border-radius: 10px;
}
.dialog::backdrop {
  background: rgba(20, 20, 20, 0.55);
}
.dialog-isi {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1.5rem;
}
.dialog-isi h2 {
  font-size: 1.25rem;
  overflow-wrap: anywhere;
}
.dialog-aksi {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
