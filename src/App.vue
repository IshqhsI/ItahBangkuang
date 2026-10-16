<template>
  <BannerOffline />
  <RouterView />
  <ToastContainer />
</template>

<script setup>
import ToastContainer from '@/components/ToastContainer.vue';
import BannerOffline from '@/components/BannerOffline.vue';
</script>
