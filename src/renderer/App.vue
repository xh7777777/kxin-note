<template>
  <!-- <title-bar /> -->
  <div class="main">
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
  </div>
</template>

<script setup lang="ts">
import TitleBar from '@renderer/components/titleBar/TitleBar.vue';
</script>

<style scoped>
.main {
  /* padding-top: 30px; */
  box-sizing: border-box;
}
</style>
