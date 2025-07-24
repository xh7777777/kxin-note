<template>
  <div class="p-6">
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-2">AI模型配置</h2>
      <p class="text-sm text-gray-600">
        配置用于智能写作和对话的AI模型。使用新的配置管理界面来管理您的AI模型设置。
      </p>
    </div>

    <!-- 使用新的AI配置组件 -->
    <AIConfigTab />
  </div>
</template>

<script setup lang="ts">
import AIConfigTab from './AIConfigTab.vue';
</script>
