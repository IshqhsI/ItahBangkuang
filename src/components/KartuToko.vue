<template>
  <article class="toko-kartu">
    <!-- Sampul: kolase foto produk -->
    <div class="sampul">
      <div class="kolase" :class="`kolase-${Math.min(t.foto.length, 3)}`" aria-hidden="true">
        <img v-for="(f, i) in t.foto.slice(0, 3)" :key="i" :src="f" alt="" loading="lazy" />
        <span v-if="!t.foto.length" class="kolase-kosong"><Store :size="36" :stroke-width="1.5" /></span>
      </div>
      <span v-if="t.terverifikasi" class="lencana lencana-verif">
        <BadgeCheck :size="15" :stroke-width="2.25" />
        Terverifikasi
      </span>
      <span v-if="t.status_buka" class="lencana lencana-buka" :class="{ tutup: !t.status_buka.buka }">
        <span class="titik" aria-hidden="true"></span>
        {{ t.status_buka.teks }}
      </span>
    </div>

    <div class="isi">
      <div class="toko-kepala">
        <span class="toko-foto">
          <img v-if="t.foto_toko" :src="t.foto_toko" :alt="`Foto ${t.nama_toko}`" loading="lazy" />
          <Store v-else :size="24" :stroke-width="1.75" />
        </span>
        <div class="toko-teks">
          <component :is="`h${tingkatJudul}`" class="toko-nama">
            <RouterLink :to="urlToko(t)" class="toko-tautan">{{ t.nama_toko }}</RouterLink>
          </component>
          <p v-if="t.alamat" class="toko-alamat">
            <MapPin :size="14" :stroke-width="2" />
            <span>{{ t.alamat }}</span>
          </p>
        </div>
      </div>

      <p v-if="t.kategori.length" class="toko-kategori">{{ t.kategori.join(' · ') }}</p>

      <ul class="toko-meta">
        <li><LayoutGrid :size="15" :stroke-width="2" /> {{ t.jumlahProduk }} produk</li>
        <li v-if="t.layanan_pesan === false" class="etalase"><Eye :size="15" :stroke-width="2" /> Etalase</li>
        <li v-if="t.layanan_antar !== false"><Truck :size="15" :stroke-width="2" /> Bisa diantar</li>
        <li v-if="t.layanan_ambil === true"><Store :size="15" :stroke-width="2" /> Ambil di tempat</li>
      </ul>

      <div class="toko-aksi">
        <span class="toko-lihat">
          Lihat toko
          <ArrowRight :size="18" :stroke-width="2" />
        </span>
        <a
          v-if="t.nomor_wa"
          :href="tautanWa(t.nomor_wa, `Halo ${t.nama_toko}, saya melihat toko Anda di ItahBangkuang. Boleh saya bertanya?`)"
          target="_blank"
          rel="noopener"
          class="toko-wa"
          :aria-label="`Chat ${t.nama_toko} di WhatsApp`"
        >
          <IkonWa :size="20" />
        </a>
      </div>
    </div>
  </article>
</template>

<script setup>
import { Store, MapPin, ArrowRight, BadgeCheck, LayoutGrid, Truck, Eye } from 'lucide-vue-next';
import IkonWa from '@/components/IkonWa.vue';
import { urlToko } from '@/lib/tautan';
import { tautanWa } from '@/lib/utils';

/** Toko yang sudah dilengkapi lewat lengkapiToko() di src/lib/dataToko.js */
defineProps({
  t: { type: Object, required: true },
  /** Tingkat judul nama toko (2 = h2), menyesuaikan susunan judul halaman */
  tingkatJudul: { type: Number, default: 3 },
});
</script>

<style scoped>
.toko-kartu {
  position: relative; /* tautan nama meliputi seluruh kartu */
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: var(--bayang);
  color: var(--ink);
  transition:
    transform 0.3s var(--ease-out),
    box-shadow 0.3s ease;
}
.toko-kartu:hover {
  transform: translateY(-4px);
  box-shadow: var(--bayang-naik);
}

/* Sampul */
.sampul {
  position: relative;
}
.kolase {
  display: grid;
  gap: 3px;
  height: 160px;
  background: var(--sage);
  overflow: hidden;
}
.kolase img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s var(--ease-out);
}
.toko-kartu:hover .kolase img {
  transform: scale(1.04);
}
.kolase-0,
.kolase-1 {
  grid-template-columns: 1fr;
}
.kolase-2 {
  grid-template-columns: 1fr 1fr;
}
.kolase-3 {
  grid-template-columns: 1.4fr 1fr;
  grid-template-rows: 1fr 1fr;
}
.kolase-3 img:first-child {
  grid-row: span 2;
}
.kolase-kosong {
  display: grid;
  place-items: center;
  color: var(--sungai);
}
.lencana {
  position: absolute;
  top: 0.7rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.7rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 999px;
  box-shadow: 0 2px 8px rgba(29, 42, 38, 0.15);
  font-size: 0.76rem;
  font-weight: 800;
  line-height: 1.2;
}
.lencana-verif {
  left: 0.7rem;
  color: var(--sungai);
}
.lencana-buka {
  right: 0.7rem;
  color: var(--sungai);
}
.lencana-buka .titik {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2f9e62;
  box-shadow: 0 0 0 3px rgba(47, 158, 98, 0.2);
}
.lencana-buka.tutup {
  color: var(--ink-2);
}
.lencana-buka.tutup .titik {
  background: #a3aea9;
  box-shadow: 0 0 0 3px rgba(163, 174, 169, 0.25);
}

/* Isi */
.isi {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 0 1.15rem 1.1rem;
}
.toko-kepala {
  position: relative;
  z-index: 1; /* di atas sampul supaya foto toko tidak terpotong */
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  margin-top: -1.6rem; /* foto toko menumpuk di tepi sampul */
  pointer-events: none; /* klik tetap jatuh ke tautan yang meliputi kartu */
}
.toko-kepala .toko-tautan {
  pointer-events: auto;
}
.toko-foto {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--sage);
  color: var(--sungai);
  border: 3px solid #fff;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(29, 42, 38, 0.12);
}
.toko-foto img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.toko-teks {
  flex: 1;
  min-width: 0;
  padding-top: 1.85rem;
}
.toko-nama {
  font-family: var(--font-papan);
  font-weight: 600;
  font-size: 1.2rem;
  line-height: 1.25;
}
.toko-tautan {
  color: inherit;
  text-decoration: none;
}
.toko-tautan::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
}
.toko-tautan:focus-visible {
  outline: none;
}
.toko-kartu:has(.toko-tautan:focus-visible) {
  outline: 3px solid var(--sungai-sedang);
  outline-offset: 3px;
}
.toko-alamat {
  display: flex;
  align-items: flex-start;
  gap: 0.3rem;
  margin-top: 0.2rem;
  font-size: 0.88rem;
  line-height: 1.4;
  color: var(--ink-2);
}
.toko-alamat svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.toko-kategori {
  margin-top: 0.9rem;
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--sungai-sedang);
}
.toko-meta {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 1rem;
  margin-top: 0.6rem;
  color: var(--ink-2);
  font-size: 0.86rem;
}
.toko-meta li {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
.toko-meta svg {
  color: var(--sungai);
}
.toko-meta .etalase {
  color: #7a4a24;
  font-weight: 700;
}
.toko-meta .etalase svg {
  color: #7a4a24;
}

.toko-aksi {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: auto;
  padding-top: 1rem;
}
.toko-lihat {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--sungai);
  font-weight: 800;
  font-size: 0.95rem;
}
.toko-lihat svg {
  transition: transform 0.3s var(--ease-out);
}
.toko-kartu:hover .toko-lihat svg {
  transform: translateX(4px);
}
.toko-wa {
  position: relative;
  z-index: 2; /* di atas tautan yang meliputi kartu */
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--sage);
  color: var(--sungai);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}
.toko-wa:hover {
  background: var(--sungai);
  color: #fff;
}
</style>
