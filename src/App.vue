<template>
  <BannerOffline />
  <RouterView />
  <ToastContainer />
  <PanelDiagnosisPwa v-if="tampilDiagnosis" @tutup="tutupDiagnosis" />
</template>

<script setup>
import { ref } from 'vue';
import ToastContainer from '@/components/ToastContainer.vue';
import BannerOffline from '@/components/BannerOffline.vue';
import PanelDiagnosisPwa from '@/components/PanelDiagnosisPwa.vue';

// Panel diagnosis pemasangan, hanya muncul kalau alamatnya diberi ?pwa=debug
const tampilDiagnosis = ref(new URLSearchParams(window.location.search).get('pwa') === 'debug');
const tutupDiagnosis = () => {
  tampilDiagnosis.value = false;
};
</script>
