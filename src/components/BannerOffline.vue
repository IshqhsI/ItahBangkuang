<template>
  <Transition name="turun">
    <div v-if="!online" class="offline" role="status">
      <WifiOff :size="18" :stroke-width="2.5" />
      <span>Kamu sedang offline. Produk dan pesanan baru muncul setelah internetnya kembali.</span>
    </div>
  </Transition>
</template>

<script setup>
import { WifiOff } from 'lucide-vue-next';
import { useOnline } from '@/lib/usePwa';

const online = useOnline();
</script>

<style scoped>
.offline {
  position: fixed;
  inset: 0 0 auto;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.55rem 1rem;
  background: var(--tinta);
  color: #fff;
  font-size: 0.92rem;
  font-weight: 700;
  text-align: center;
}
.turun-enter-active,
.turun-leave-active {
  transition: transform 0.3s var(--ease-out);
}
.turun-enter-from,
.turun-leave-to {
  transform: translateY(-100%);
}
</style>
