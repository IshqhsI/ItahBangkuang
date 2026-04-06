<template>
  <Teleport to="body">
    <div class="toast-wrap">
      <TransitionGroup name="toast">
        <div
          v-for="t in toastStore.toasts"
          :key="t.id"
          class="toast"
          :class="`toast-${t.type}`"
          @click="toastStore.remove(t.id)"
        >
          <span class="toast-icon">{{ icon(t.type) }}</span>
          <span class="toast-msg">{{ t.message }}</span>
          <button class="toast-close" @click.stop="toastStore.remove(t.id)">
            ✕
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToastStore } from '@/stores/toast';

const toastStore = useToastStore();

const icon = (type) =>
  ({
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  })[type] ?? 'ℹ️';
</script>

<style scoped>
.toast-wrap {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  max-width: 360px;
  width: calc(100vw - 3rem);
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  border-radius: 12px;
  border: 1px solid transparent;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.5;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.toast-success {
  background: #f0fdf4;
  border-color: #bbf7d0;
  color: #166534;
}
.toast-error {
  background: #fef2f2;
  border-color: #fecaca;
  color: #991b1b;
}
.toast-info {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1e40af;
}
.toast-warning {
  background: #fffbeb;
  border-color: #fde68a;
  color: #92400e;
}

.toast-icon {
  font-size: 1rem;
  flex-shrink: 0;
  margin-top: 0.05rem;
}
.toast-msg {
  flex: 1;
}

.toast-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.75rem;
  opacity: 0.5;
  padding: 0;
  flex-shrink: 0;
  color: inherit;
  transition: opacity 0.2s;
}
.toast-close:hover {
  opacity: 1;
}

/* Animasi masuk & keluar */
.toast-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-leave-active {
  transition: all 0.25s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(60px) scale(0.9);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(60px);
}
.toast-move {
  transition: transform 0.3s ease;
}
</style>
