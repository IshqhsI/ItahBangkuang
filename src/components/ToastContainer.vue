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
  --t-bg: #fff;
  --t-fg: var(--ink);
  --t-aksen: var(--sungai-sedang);
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  padding: 0.9rem 0.9rem 0.9rem 1rem;
  background: var(--t-bg);
  color: var(--t-fg);
  border-left: 5px solid var(--t-aksen);
  border-radius: 18px;
  box-shadow: 0 2px 6px rgba(29, 42, 38, 0.08), 0 16px 36px rgba(29, 42, 38, 0.16);
  font-size: 0.98rem;
  font-weight: 600;
  line-height: 1.45;
  cursor: pointer;
}
.toast-success {
  --t-bg: #eef5f0;
  --t-fg: var(--sungai);
  --t-aksen: var(--sungai-sedang);
}
.toast-error {
  --t-bg: #fbeceb;
  --t-fg: var(--merah-tua);
  --t-aksen: var(--merah);
}
.toast-info {
  --t-bg: var(--langit-muda);
  --t-fg: var(--biru-tua);
  --t-aksen: var(--biru);
}
.toast-warning {
  --t-bg: var(--aprikot-muda);
  --t-fg: #7a4a24;
  --t-aksen: #e0884e;
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
  border-radius: 50%;
  color: inherit;
  cursor: pointer;
}
.toast-close:hover {
  background: rgba(29, 42, 38, 0.08);
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
  transform: translateY(16px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
