<template>
  <div class="">
    <NavBar />

    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import NavBar from '@/components/NavBar.vue';

defineProps({
  statusToko: {
    type: String,
    default: null, // 'AKTIF' | 'PENDING' | 'DITOLAK' | 'DIBLOKIR'
  },
  tokoId: {
    type: String,
    default: null,
  },
});

const router = useRouter();
const authStore = useAuthStore();
const menuOpen = ref(false);

</script>

<style scoped>

.page {
  min-height: 100vh;
}

.main-content {
  padding-top: 64px; /* Harus sama dengan tinggi navbar */
  min-height: 100vh;
}
</style>
