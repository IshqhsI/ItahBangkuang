<template>
  <nav v-if="jumlahHalaman > 1" class="paginasi" aria-label="Halaman">
    <RouterLink
      v-if="halaman > 1"
      :to="tautan(halaman - 1)"
      class="pag pag-sisi"
      rel="prev"
    >
      <ChevronLeft :size="18" :stroke-width="2.25" />
      <span>Sebelumnya</span>
    </RouterLink>

    <template v-for="(item, i) in daftar" :key="i">
      <span v-if="item === '…'" class="pag-titik" aria-hidden="true">…</span>
      <RouterLink
        v-else
        :to="tautan(item)"
        class="pag"
        :class="{ aktif: item === halaman }"
        :aria-current="item === halaman ? 'page' : undefined"
        :aria-label="`Halaman ${item}`"
      >
        {{ item }}
      </RouterLink>
    </template>

    <RouterLink
      v-if="halaman < jumlahHalaman"
      :to="tautan(halaman + 1)"
      class="pag pag-sisi"
      rel="next"
    >
      <span>Berikutnya</span>
      <ChevronRight :size="18" :stroke-width="2.25" />
    </RouterLink>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

const props = defineProps({
  halaman: { type: Number, required: true },
  total: { type: Number, required: true },
  perHalaman: { type: Number, default: 24 },
});

const route = useRoute();
const jumlahHalaman = computed(() => Math.max(1, Math.ceil(props.total / props.perHalaman)));

// Tautan nyata (bukan tombol) agar bisa diikuti crawler dan dibuka di tab baru
const tautan = (n) => ({
  path: route.path,
  query: { ...route.query, halaman: n > 1 ? String(n) : undefined },
});

// 1 … 4 [5] 6 … 20
const daftar = computed(() => {
  const akhir = jumlahHalaman.value;
  const sekarang = props.halaman;
  const set = new Set([1, akhir, sekarang, sekarang - 1, sekarang + 1]);
  const urut = [...set].filter((n) => n >= 1 && n <= akhir).sort((a, b) => a - b);
  const hasil = [];
  urut.forEach((n, i) => {
    if (i > 0 && n - urut[i - 1] > 1) hasil.push('…');
    hasil.push(n);
  });
  return hasil;
});
</script>

<style scoped>
.paginasi {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  margin-top: 2rem;
}
.pag {
  display: inline-grid;
  place-items: center;
  min-width: 44px;
  min-height: 44px;
  padding: 0 0.6rem;
  border-radius: 999px;
  background: #fff;
  border: 1.5px solid var(--garis-lembut);
  color: var(--ink);
  font-weight: 700;
  text-decoration: none;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}
.pag:hover {
  background: var(--sage);
}
.pag.aktif {
  background: var(--sungai);
  border-color: var(--sungai);
  color: #fff;
}
.pag-sisi {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0 1rem;
}
.pag-titik {
  padding: 0 0.15rem;
  color: var(--ink-2);
}
@media (max-width: 520px) {
  .pag-sisi span {
    display: none;
  }
  .pag-sisi {
    padding: 0 0.7rem;
  }
}
</style>
