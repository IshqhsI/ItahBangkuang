<template>
  <div v-if="bisaPasang || petunjukIOS" class="pasang">
    <button v-if="bisaPasang" type="button" class="tombol tombol-kuning" @click="pasang">
      <Download :size="20" :stroke-width="2.5" />
      Pasang di HP
    </button>
    <p v-else class="pasang-ios">
      <Share :size="18" :stroke-width="2.5" />
      <span>Mau dipasang di HP? Tekan <strong>Bagikan</strong>, lalu <strong>Tambah ke Layar Utama</strong>.</span>
    </p>
  </div>
</template>

<script setup>
import { Download, Share } from 'lucide-vue-next';
import { usePasangAplikasi } from '@/lib/usePwa';

const { bisaPasang, petunjukIOS, pasang } = usePasangAplikasi();
</script>

<style scoped>
.pasang-ios {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  font-size: 0.92rem;
  line-height: 1.45;
  color: #dbe4f3;
  max-width: 34ch;
}
.pasang-ios svg {
  flex-shrink: 0;
  margin-top: 0.15rem;
}
.pasang-ios strong {
  color: #fff;
}
</style>
