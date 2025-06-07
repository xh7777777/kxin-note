<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
    <div class="max-w-4xl mx-auto">
      <!-- 标题 -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">
          Tailwind CSS 测试页面
        </h1>
        <p class="text-lg text-gray-600">
          验证 Tailwind CSS 是否正确安装和配置
        </p>
      </div>

      <!-- 卡片网格 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <!-- 卡片 1 -->
        <div
          class="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200"
        >
          <div
            class="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4"
          >
            <svg
              class="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">快速响应</h3>
          <p class="text-gray-600">
            Tailwind CSS 提供快速的开发体验和优秀的性能。
          </p>
        </div>

        <!-- 卡片 2 -->
        <div
          class="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200"
        >
          <div
            class="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4"
          >
            <svg
              class="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">易于定制</h3>
          <p class="text-gray-600">通过实用类轻松构建复杂的用户界面。</p>
        </div>

        <!-- 卡片 3 -->
        <div
          class="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200"
        >
          <div
            class="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4"
          >
            <svg
              class="w-6 h-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
              />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">响应式设计</h3>
          <p class="text-gray-600">内置响应式设计支持，适配各种屏幕尺寸。</p>
        </div>
      </div>

      <!-- 按钮示例 -->
      <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">按钮样式示例</h2>
        <div class="flex flex-wrap gap-4">
          <button class="btn btn-primary">主要按钮</button>
          <button class="btn btn-secondary">次要按钮</button>
          <button
            class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            危险按钮
          </button>
          <button
            class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            成功按钮
          </button>
          <button
            class="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            边框按钮
          </button>
        </div>
      </div>

      <!-- 表单示例 -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">表单样式示例</h2>
        <form class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              姓名
            </label>
            <input
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入您的姓名"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              邮箱
            </label>
            <input
              type="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入您的邮箱"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              消息
            </label>
            <textarea
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入您的消息"
            ></textarea>
          </div>
          <button type="submit" class="btn btn-primary">提交表单</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 这是一个简单的测试页面，用于验证 Tailwind CSS 是否正常工作
</script>
