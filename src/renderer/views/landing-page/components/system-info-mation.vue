<template>
  <div>
    <div class="title">{{ i18nt.about.system }}</div>
    <div class="items">
      <div class="item" v-for="(item, index) in tips" :key="index">
        <div class="name" v-text="item.name" />
        <div class="value" v-text="item.value" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { i18nt } from '@renderer/i18n';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

const { path, name } = useRoute();
const { systemInfo } = window;

let tips = ref(
  computed(() => [
    {
      name: i18nt.value.about.language,
      value: i18nt.value.about.languageValue,
    },
    { name: i18nt.value.about.currentPagePath, value: path },
    { name: i18nt.value.about.currentPageName, value: name },
    { name: i18nt.value.about.systemPlatform, value: systemInfo.platform },
    { name: i18nt.value.about.systemVersion, value: systemInfo.release },
    { name: i18nt.value.about.systemArch, value: systemInfo.arch },
    {
      name: i18nt.value.about.currentEnvironment,
      value: __CONFIG__.NODE_ENV,
    },
  ])
);
</script>

<style scoped lang="scss">
.title {
  color: #888;
  font-size: 18px;
  font-weight: initial;
  letter-spacing: 0.25px;
  margin-top: 10px;
}

.items {
  margin-top: 8px;
}

.item {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  line-height: 24px;
}

.item .name {
  color: #6a6a6a;
  margin-right: 6px;
}

.item .value {
  color: #35495e;
  font-weight: bold;
}
</style>
