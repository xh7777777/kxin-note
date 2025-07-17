<template>
  <div class="p-6 space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">AI模型配置</h2>
      <p class="text-sm text-gray-600">配置用于智能写作和对话的AI模型</p>
    </div>

    <!-- OpenAI配置 -->
    <div class="bg-white border border-gray-200 rounded-lg p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900">OpenAI</h3>
        <div class="flex items-center">
          <input
            type="checkbox"
            v-model="openaiConfig.enabled"
            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label class="ml-2 text-sm text-gray-700">启用</label>
        </div>
      </div>

      <div class="space-y-4" :class="{ 'opacity-50': !openaiConfig.enabled }">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            API Key
          </label>
          <div class="relative">
            <input
              :type="showApiKey ? 'text' : 'password'"
              v-model="openaiConfig.apiKey"
              :disabled="!openaiConfig.enabled"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50"
              placeholder="sk-..."
            />
            <button
              @click="showApiKey = !showApiKey"
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
              type="button"
            >
              <svg
                class="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  v-if="!showApiKey"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  v-if="!showApiKey"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
                <path
                  v-else
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                />
              </svg>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              模型
            </label>
            <select
              v-model="openaiConfig.model"
              :disabled="!openaiConfig.enabled"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50"
            >
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              API地址
            </label>
            <input
              type="url"
              v-model="openaiConfig.baseUrl"
              :disabled="!openaiConfig.enabled"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50"
              placeholder="https://api.openai.com/v1"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Claude配置 -->
    <div class="bg-white border border-gray-200 rounded-lg p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900">Claude (Anthropic)</h3>
        <div class="flex items-center">
          <input
            type="checkbox"
            v-model="claudeConfig.enabled"
            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label class="ml-2 text-sm text-gray-700">启用</label>
        </div>
      </div>

      <div class="space-y-4" :class="{ 'opacity-50': !claudeConfig.enabled }">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            API Key
          </label>
          <input
            type="password"
            v-model="claudeConfig.apiKey"
            :disabled="!claudeConfig.enabled"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50"
            placeholder="sk-ant-..."
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            模型
          </label>
          <select
            v-model="claudeConfig.model"
            :disabled="!claudeConfig.enabled"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50"
          >
            <option value="claude-3-sonnet">Claude 3 Sonnet</option>
            <option value="claude-3-opus">Claude 3 Opus</option>
            <option value="claude-3-haiku">Claude 3 Haiku</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 通用AI设置 -->
    <div class="bg-white border border-gray-200 rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">通用设置</h3>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            默认模型
          </label>
          <select
            v-model="generalConfig.defaultModel"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="openai">OpenAI</option>
            <option value="claude">Claude</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            温度 ({{ generalConfig.temperature }})
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            v-model="generalConfig.temperature"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>更保守</span>
            <span>更创造性</span>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            最大token数
          </label>
          <input
            type="number"
            v-model="generalConfig.maxTokens"
            min="100"
            max="4000"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
    </div>

    <!-- 保存按钮 -->
    <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
      <button
        @click="resetConfig"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
      >
        重置
      </button>
      <button
        @click="saveConfig"
        class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
      >
        保存配置
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

const showApiKey = ref(false);

const openaiConfig = reactive({
  enabled: false,
  apiKey: '',
  model: 'gpt-4',
  baseUrl: 'https://api.openai.com/v1',
});

const claudeConfig = reactive({
  enabled: false,
  apiKey: '',
  model: 'claude-3-sonnet',
});

const generalConfig = reactive({
  defaultModel: 'openai',
  temperature: 0.7,
  maxTokens: 2000,
});

const saveConfig = () => {
  // TODO: 实现保存配置逻辑
  console.log('保存AI模型配置', {
    openai: openaiConfig,
    claude: claudeConfig,
    general: generalConfig,
  });
};

const resetConfig = () => {
  // TODO: 实现重置配置逻辑
  console.log('重置AI模型配置');
};
</script>

<style lang="scss" scoped>
/* 自定义滑块样式 */
input[type='range']::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #4f46e5;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}

input[type='range']::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #4f46e5;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}
</style>
