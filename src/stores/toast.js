import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([]);

  const add = (message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();

    toasts.value.push({ id, message, type });

    setTimeout(() => remove(id), duration);

    return id;
  };

  const remove = (id) => {
    const idx = toasts.value.findIndex((t) => t.id === id);
    if (idx !== -1) toasts.value.splice(idx, 1);
  };

  // Shorthand helpers
  const success = (msg, duration) => add(msg, 'success', duration);
  const error = (msg, duration) => add(msg, 'error', duration ?? 5000);
  const info = (msg, duration) => add(msg, 'info', duration);
  const warning = (msg, duration) => add(msg, 'warning', duration);

  return { toasts, add, remove, success, error, info, warning };
});
