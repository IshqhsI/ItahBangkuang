<template>
  <RouterView />
  <ToastContainer />
</template>

<script setup>
import ToastContainer from '@/components/ToastContainer.vue';
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: #FDFAF4;
}
</style>