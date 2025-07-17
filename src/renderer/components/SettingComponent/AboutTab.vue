<template>
  <div class="p-6 space-y-6">
    <div class="text-center">
      <div class="flex items-center justify-center mb-4">
        <!-- <img
          src="/src/renderer/assets/logo.png"
          alt="App Logo"
          class="w-16 h-16 rounded-lg shadow-sm"
        /> -->
      </div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Kxin Note</h2>
      <p class="text-gray-600 mb-4">智能笔记应用</p>
      <div
        class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
      >
        版本 1.0.0
      </div>
    </div>

    <div class="border-t border-gray-200 pt-6">
      <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="bg-gray-50 px-4 py-3 rounded-lg">
          <dt class="text-sm font-medium text-gray-500">开发者</dt>
          <dd class="mt-1 text-sm text-gray-900">Kxin Team</dd>
        </div>
        <div class="bg-gray-50 px-4 py-3 rounded-lg">
          <dt class="text-sm font-medium text-gray-500">构建时间</dt>
          <dd class="mt-1 text-sm text-gray-900">{{ buildTime }}</dd>
        </div>
        <div class="bg-gray-50 px-4 py-3 rounded-lg">
          <dt class="text-sm font-medium text-gray-500">Electron版本</dt>
          <dd class="mt-1 text-sm text-gray-900">{{ electronVersion }}</dd>
        </div>
        <div class="bg-gray-50 px-4 py-3 rounded-lg">
          <dt class="text-sm font-medium text-gray-500">Node版本</dt>
          <dd class="mt-1 text-sm text-gray-900">{{ nodeVersion }}</dd>
        </div>
      </dl>
    </div>

    <div class="border-t border-gray-200 pt-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">开源许可</h3>
      <div class="bg-gray-50 p-4 rounded-lg">
        <p class="text-sm text-gray-700 leading-relaxed">
          本应用基于 MIT
          许可证开源发布。您可以自由使用、修改和分发，但请保留原始许可证声明。
        </p>
      </div>
    </div>

    <div class="border-t border-gray-200 pt-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">联系我们</h3>
      <div class="space-y-3">
        <div class="flex items-center space-x-3">
          <svg
            class="w-5 h-5 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"
            ></path>
            <path
              d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"
            ></path>
          </svg>
          <span class="text-sm text-gray-700">support@kxinnote.com</span>
        </div>
        <div class="flex items-center space-x-3">
          <svg
            class="w-5 h-5 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z"
              clip-rule="evenodd"
            ></path>
          </svg>
          <span class="text-sm text-gray-700">https://kxinnote.com</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const buildTime = ref('2024-01-01');
const electronVersion = ref('Unknown');
const nodeVersion = ref('Unknown');

onMounted(() => {
  // 获取版本信息
  if (process && process.versions) {
    electronVersion.value = process.versions.electron || 'Unknown';
    nodeVersion.value = process.versions.node || 'Unknown';
  }

  // 设置构建时间（实际应用中可以从环境变量或构建时注入）
  buildTime.value = new Date().toLocaleDateString('zh-CN');
});
</script>

<style lang="scss" scoped></style>
