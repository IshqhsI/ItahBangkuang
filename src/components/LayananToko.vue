<template>
  <div class="layanan-toko">
    <fieldset class="isian layanan">
      <legend class="label">Cara layanan</legend>
      <label class="centang">
        <input v-model="data.layanan_pesan" type="checkbox" :disabled="disabled" />
        <span>
          <strong>Terima pesanan online</strong>
          <small>Pembeli dapat memesan lewat aplikasi. Matikan bila toko hanya memajang produk dan pembeli datang langsung.</small>
        </span>
      </label>
      <label class="centang">
        <input v-model="data.layanan_antar" type="checkbox" :disabled="disabled" />
        <span><strong>Bisa diantar</strong></span>
      </label>
      <label class="centang">
        <input v-model="data.layanan_ambil" type="checkbox" :disabled="disabled" />
        <span><strong>Ambil di tempat</strong></span>
      </label>
    </fieldset>

    <div class="isian">
      <label :for="`${id}-jam`">Jam buka <span class="opsional">(boleh dikosongkan)</span></label>
      <input
        :id="`${id}-jam`"
        v-model="data.jam_buka"
        type="text"
        maxlength="120"
        placeholder="Contoh: Setiap hari 07.00–17.00"
        :disabled="disabled"
      />
    </div>

    <div class="isian">
      <label :for="`${id}-peta`">Tautan peta <span class="opsional">(boleh dikosongkan)</span></label>
      <input
        :id="`${id}-peta`"
        v-model="data.tautan_peta"
        type="url"
        inputmode="url"
        placeholder="https://maps.app.goo.gl/…"
        :aria-describedby="`${id}-peta-bantuan`"
        :disabled="disabled"
      />
      <span :id="`${id}-peta-bantuan`" class="bantuan">Buka Google Maps, tekan Bagikan, lalu salin tautannya.</span>
    </div>
  </div>
</template>

<script setup>
// Kolom yang dikelola komponen ini ada di objek `data` milik formulir induk:
// layanan_pesan, layanan_antar, layanan_ambil, jam_buka, tautan_peta
defineProps({
  data: { type: Object, required: true },
  disabled: { type: Boolean, default: false },
});

const id = `layanan-${Math.random().toString(36).slice(2, 8)}`;
</script>

<script>
/** Validasi bersama untuk formulir pendaftaran dan buka toko. Mengembalikan pesan galat atau ''. */
export const periksaLayanan = (f) => {
  if (!f.layanan_antar && !f.layanan_ambil) {
    return 'Pilih minimal satu: bisa diantar atau ambil di tempat.';
  }
  const peta = (f.tautan_peta ?? '').trim();
  if (peta && !/^https?:\/\//i.test(peta)) {
    return 'Tautan peta harus diawali https://. Salin dari tombol Bagikan di Google Maps.';
  }
  return '';
};

/** Nilai awal yang sama dengan pengaturan standar di database. */
export const layananAwal = () => ({
  layanan_pesan: true,
  layanan_antar: true,
  layanan_ambil: false,
  jam_buka: '',
  tautan_peta: '',
});

/** Kolom untuk dikirim ke tabel toko. */
export const kolomLayanan = (f) => ({
  layanan_pesan: f.layanan_pesan,
  layanan_antar: f.layanan_antar,
  layanan_ambil: f.layanan_ambil,
  jam_buka: (f.jam_buka ?? '').trim() || null,
  tautan_peta: (f.tautan_peta ?? '').trim() || null,
});
</script>

<style scoped>
.layanan {
  border: 0;
  padding: 0;
}
.centang {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  min-height: 48px;
  padding: 0.7rem 0.9rem;
  margin-top: 0.5rem;
  background: #fff;
  border: 1.5px solid var(--garis-lembut);
  border-radius: 16px;
  cursor: pointer;
}
.centang input {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-top: 2px;
  accent-color: var(--sungai-sedang);
}
.centang span {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.centang small {
  color: var(--ink-2);
  font-size: 0.86rem;
  line-height: 1.45;
}
.layanan-toko .isian {
  margin-top: 1.1rem;
}
</style>
