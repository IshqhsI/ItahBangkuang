<template>
  <Teleport to="body">
    <div class="toast-wrap" role="status" aria-live="polite">
      <TransitionGroup name="toast">
        <div
          v-for="t in toastStore.toasts"
          :key="t.id"
          class="toast"
          :class="`toast-${t.type}`"
          @click="toastStore.remove(t.id)"
        >
          <component :is="ikon(t.type)" class="toast-icon" :size="22" :stroke-width="2.5" />
          <span class="toast-msg">{{ t.message }}</span>
          <button
            class="toast-close"
            aria-label="Tutup pemberitahuan"
            @click.stop="toastStore.remove(t.id)"
          >
            <X :size="18" :stroke-width="2.5" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { CircleCheck, CircleX, Info, TriangleAlert, X } from 'lucide-vue-next';
import { useToastStore } from '@/stores/toast';

const toastStore = useToastStore();

const ikon = (type) =>
  ({
    success: CircleCheck,
    error: CircleX,
    info: Info,
    warning: TriangleAlert,
  })[type] ?? Info;
</script>

<style scoped>
.toast-wrap {
  position: fixed;
  left: 50%;
  bottom: calc(1rem + env(safe-area-inset-bottom));
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  width: min(420px, calc(100vw - 2rem));
}

.toast {
  --t-bg: var(--papan);
  --t-list: var(--tinta);
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  padding: 0.85rem 0.9rem;
  background: var(--t-bg);
  border: 2.5px solid var(--tinta);
  border-radius: var(--sudut);
  box-shadow:
    inset 0 0 0 4px var(--t-bg),
    inset 0 0 0 6px var(--t-list),
    0 10px 28px rgba(20, 20, 20, 0.22);
  font-size: 0.98rem;
  font-weight: 700;
  line-height: 1.45;
  cursor: pointer;
}
.toast-success {
  --t-bg: var(--hijau);
  --t-list: var(--kuning);
  color: #fff;
}
.toast-error {
  --t-bg: var(--merah);
  --t-list: var(--kuning);
  color: #fff;
}
.toast-info {
  --t-bg: var(--biru);
  --t-list: #fff;
  color: #fff;
}
.toast-warning {
  --t-bg: var(--kuning);
  --t-list: var(--tinta);
  color: var(--tinta);
}

.toast-icon {
  flex-shrink: 0;
}
.toast-msg {
  flex: 1;
}
.toast-close {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  margin: -2px -2px 0 0;
  background: none;
  border: none;
  border-radius: 4px;
  color: inherit;
  cursor: pointer;
}
.toast-close:hover {
  background: rgba(0, 0, 0, 0.15);
}

.toast-enter-active {
  transition:
    transform 0.4s var(--ease-out),
    opacity 0.25s ease;
}
.toast-leave-active {
  transition:
    transform 0.2s ease-in,
    opacity 0.2s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(16px) rotate(-2deg);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
