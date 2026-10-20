<template>
  <RouterLink :to="urlProduk(produk)" class="kartu-produk">
    <div class="foto">
      <img :src="produk.foto_url" :alt="produk.nama_produk" loading="lazy" />
      <span v-if="punyaVarian(produk)" class="plat">{{ produk.varian.length }} varian</span>
      <div v-if="stok === 0" class="tanda-habis"><span>Habis</span></div>
    </div>
    <div class="isi">
      <h3 class="nama">{{ produk.nama_produk }}</h3>
      <p v-if="tampilToko && produk.toko?.nama_toko" class="toko">
        <Store :size="15" :stroke-width="2.25" />
        {{ produk.toko.nama_toko }}
      </p>
      <div class="kaki">
        <span class="plat-harga">{{ formatHargaProduk(produk) }}</span>
        <span v-if="produk.po && stok > 0" class="stok po">{{ labelPo(produk) }}</span>
        <span v-else-if="stok > 0" class="stok" :class="{ sedikit: stok <= 5 }">{{ labelStok(stok) }}</span>
      </div>
    </div>
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue';
import { Store } from 'lucide-vue-next';
import { punyaVarian, totalStok, formatHargaProduk, labelStok, labelPo } from '@/lib/utils';
import { urlProduk } from '@/lib/tautan';

const props = defineProps({
  produk: { type: Object, required: true },
  tampilToko: { type: Boolean, default: true },
});

const stok = computed(() => totalStok(props.produk));
</script>
