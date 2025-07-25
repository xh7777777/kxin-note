<template>
  <div class="flex flex-col h-full">
    <!-- 聊天头部 -->
    <div class="flex-shrink-0 border-b border-gray-200 px-4 py-3">
      <div class="flex items-center justify-between">
        <!-- AI状态和模型选择 -->
        <div class="flex items-center gap-3 flex-1 ai-model-dropdown">
          <div class="flex items-center gap-2">
            <div
              class="w-2 h-2 rounded-full"
              :class="aiEnabled ? 'bg-green-500' : 'bg-gray-400'"
            ></div>
            <h3 class="text-sm font-medium text-gray-900">AI Assistant</h3>
          </div>

          <!-- 模型配置选择器 -->
          <div
            v-if="aiConfig && availableModelConfigs.length > 0"
            class="relative"
          >
            <button
              @click="showModelDropdown = !showModelDropdown"
              class="flex items-center gap-2 px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
              :disabled="modelSwitching"
            >
              <span
                class="text-gray-700 max-w-[100px] truncate"
                :title="defaultModelConfig?.name"
              >
                {{ defaultModelConfig?.name || '无模型' }}
              </span>
              <svg
                class="w-3 h-3 text-gray-500 transition-transform duration-200"
                :class="{ 'rotate-180': showModelDropdown }"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <polyline points="6,9 12,15 18,9"></polyline>
              </svg>
            </button>

            <!-- 模型配置下拉菜单 -->
            <div
              v-if="showModelDropdown"
              class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 w-44 max-h-64 overflow-y-auto"
            >
              <div class="py-1">
                <!-- 标题栏 -->
                <div
                  class="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 bg-gray-50"
                >
                  {{
                    availableModelConfigs.length > 1
                      ? '选择AI模型'
                      : '当前AI模型'
                  }}
                  ({{ availableModelConfigs.length }}个配置)
                </div>

                <!-- 模型配置列表 -->
                <div
                  v-for="config in availableModelConfigs"
                  :key="config.id"
                  class="px-3 py-2.5 text-xs transition-colors"
                  :class="{
                    'bg-indigo-50 text-indigo-700':
                      config.id === defaultModelConfig?.id,
                    'text-gray-700': config.id !== defaultModelConfig?.id,
                    'cursor-pointer hover:bg-gray-50':
                      !modelSwitching && config.id !== defaultModelConfig?.id,
                    'opacity-50 cursor-not-allowed': modelSwitching,
                    'cursor-default': config.id === defaultModelConfig?.id,
                  }"
                  @click="
                    config.id !== defaultModelConfig?.id
                      ? switchModelConfig(config.id)
                      : null
                  "
                >
                  <div class="flex items-center justify-between">
                    <div class="flex-1 min-w-0">
                      <div class="font-medium truncate">{{ config.name }}</div>
                      <div class="text-gray-500 truncate">
                        {{ getProviderName(config.providerId) }} •
                        {{ config.modelId }}
                      </div>
                    </div>
                    <div class="ml-2 flex items-center gap-1 flex-shrink-0">
                      <!-- 切换中的加载指示器 -->
                      <div
                        v-if="
                          modelSwitching && config.id !== defaultModelConfig?.id
                        "
                        class="w-3 h-3 border border-gray-300 border-t-indigo-600 rounded-full animate-spin"
                      ></div>
                      <!-- 当前激活状态指示器 -->
                      <div
                        v-if="config.id === defaultModelConfig?.id"
                        class="w-2 h-2 bg-indigo-600 rounded-full"
                        title="当前模型"
                      ></div>
                    </div>
                  </div>
                </div>

                <!-- 底部提示 -->
                <div
                  v-if="availableModelConfigs.length === 1"
                  class="px-3 py-2 text-xxs text-gray-400 border-t border-gray-100"
                >
                  在设置中可以添加更多AI模型配置
                </div>
              </div>
            </div>
          </div>

          <!-- 配置状态提示 -->
          <div v-else-if="aiLoading" class="text-xs text-gray-500">
            加载配置中...
          </div>
          <div v-else class="text-xs text-orange-500">未配置AI模型</div>
        </div>

        <!-- 关闭按钮 -->
        <button
          @click="$emit('close')"
          class="flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-200 transition-all duration-200"
          title="Close Chat (Ctrl+L)"
        >
          <svg
            class="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>

    <!-- 消息列表 -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
    >
      <!-- 欢迎消息 -->
      <div
        v-if="messages.length === 0"
        class="text-center text-gray-500 text-sm py-8"
      >
        <div class="mb-4">
          <svg
            class="w-12 h-12 mx-auto text-gray-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            ></path>
          </svg>
        </div>
        <p class="mb-2">你好！我是你的AI助手</p>
        <p class="text-xs">有什么可以帮助你的吗？</p>
      </div>

      <!-- 消息项 -->
      <div
        v-for="(message, index) in messages"
        :key="index"
        class="flex gap-3"
        :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <!-- AI头像 -->
        <div
          v-if="message.role === 'assistant'"
          class="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center"
        >
          <svg
            class="w-4 h-4 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
          </svg>
        </div>

        <!-- 消息内容 -->
        <div
          class="max-w-[80%] px-3 py-2 rounded-lg text-sm"
          :class="
            message.role === 'user'
              ? 'bg-indigo-600 text-white rounded-br-none'
              : 'bg-gray-100 text-gray-800 rounded-bl-none'
          "
        >
          <div class="whitespace-pre-wrap">{{ message.content }}</div>
          <div class="text-xs mt-1 opacity-70">
            {{ formatTime(message.timestamp) }}
          </div>
        </div>

        <!-- 用户头像 -->
        <div
          v-if="message.role === 'user'"
          class="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center"
        >
          <svg
            class="w-4 h-4 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="flex gap-3">
        <div
          class="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center"
        >
          <svg
            class="w-4 h-4 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
          </svg>
        </div>
        <div
          class="max-w-[80%] px-3 py-2 rounded-lg rounded-bl-none bg-gray-100"
        >
          <div class="flex space-x-1">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div
              class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style="animation-delay: 0.1s"
            ></div>
            <div
              class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style="animation-delay: 0.2s"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="flex-shrink-0 border-t border-gray-200 p-4">
      <div class="flex gap-2">
        <div class="flex-1 relative">
          <textarea
            ref="inputRef"
            v-model="inputMessage"
            @keydown="handleInputKeydown"
            placeholder="输入你的问题..."
            rows="1"
            class="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all duration-200 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
            style="max-height: 120px; min-height: 36px"
          ></textarea>
        </div>
        <button
          @click="sendMessage"
          :disabled="!inputMessage.trim() || isLoading"
          class="flex-shrink-0 w-9 h-9 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 flex items-center justify-center"
        >
          <svg
            v-if="!isLoading"
            class="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
          </svg>
          <svg
            v-else
            class="w-4 h-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 12a9 9 0 11-6.219-8.56"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted, computed } from 'vue';
import type {
  AIConfig,
  AIModelConfig,
} from '../../../customTypes/models/config.types';

// 消息类型定义
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Emits
const emit = defineEmits<{
  close: [];
}>();

// 响应式数据
const messages = ref<Message[]>([]);
const inputMessage = ref('');
const isLoading = ref(false);

// AI配置状态
const aiConfig = ref<AIConfig | null>(null);
const defaultModelConfig = ref<AIModelConfig | null>(null);
const aiEnabled = ref(false);
const aiLoading = ref(false);
const modelSwitching = ref(false);
const showModelDropdown = ref(false);

// DOM引用
const messagesContainer = ref<any>(null);
const inputRef = ref<any>(null);

// 自动调整textarea高度
const adjustTextareaHeight = () => {
  if (inputRef.value) {
    inputRef.value.style.height = 'auto';
    inputRef.value.style.height =
      Math.min(inputRef.value.scrollHeight, 120) + 'px';
  }
};

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// 处理输入框按键
const handleInputKeydown = (event: any) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }

  // 调整高度
  setTimeout(adjustTextareaHeight, 0);
};

// 发送消息
const sendMessage = async () => {
  const message = inputMessage.value.trim();
  if (!message || isLoading.value) return;

  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: message,
    timestamp: new Date(),
  });

  // 清空输入
  inputMessage.value = '';
  adjustTextareaHeight();
  scrollToBottom();

  // 开始加载
  isLoading.value = true;

  try {
    // 模拟AI回复（这里可以替换为真实的AI API调用）
    await new Promise(resolve =>
      setTimeout(resolve, 1000 + Math.random() * 2000)
    );

    const aiResponse = generateMockAIResponse(message);

    messages.value.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
    });

    scrollToBottom();
  } catch (error) {
    console.error('发送消息失败:', error);
    messages.value.push({
      role: 'assistant',
      content: '抱歉，我遇到了一些问题，请稍后再试。',
      timestamp: new Date(),
    });
  } finally {
    isLoading.value = false;
  }
};

// 生成模拟AI回复
const generateMockAIResponse = (userMessage: string): string => {
  const responses = [
    '这是一个很有趣的问题！让我来帮你分析一下...',
    '根据你的描述，我建议你可以考虑以下几个方面：\n\n1. 首先确认问题的根本原因\n2. 制定具体的解决方案\n3. 逐步实施并观察效果',
    '我理解你的需求。这种情况下，通常有几种不同的处理方式，每种都有其优缺点。',
    '基于你提供的信息，我认为最佳的方法是...\n\n这样可以确保既满足你的需求，又能保持系统的稳定性。',
    '让我为你总结一下关键要点：\n\n• 这个问题确实需要仔细考虑\n• 有多种解决方案可供选择\n• 建议先从简单的方案开始尝试',
  ];

  return responses[Math.floor(Math.random() * responses.length)];
};

// 可用的模型配置列表
const availableModelConfigs = computed(() => {
  if (!aiConfig.value?.modelConfigs) return [];
  return aiConfig.value.modelConfigs.filter(config => config.enabled);
});

// 加载AI配置信息
const loadAIConfig = async () => {
  try {
    aiLoading.value = true;

    // 并行获取AI配置和默认模型配置
    const [config, defaultModel] = await Promise.all([
      window.aiConfig.getConfig(),
      window.aiConfig.getDefaultModelConfig(),
    ]);

    aiConfig.value = config;
    defaultModelConfig.value = defaultModel;
    aiEnabled.value = config.globalSettings.enabled && !!defaultModel;

    console.log('AI配置加载成功:', {
      enabled: aiEnabled.value,
      defaultModel: defaultModel?.name,
      provider: defaultModel?.providerId,
    });
  } catch (error) {
    console.error('加载AI配置失败:', error);
    aiEnabled.value = false;
  } finally {
    aiLoading.value = false;
  }
};

// 切换模型配置
const switchModelConfig = async (configId: string) => {
  if (
    modelSwitching.value ||
    !configId ||
    configId === defaultModelConfig.value?.id
  ) {
    showModelDropdown.value = false;
    return;
  }

  try {
    modelSwitching.value = true;

    // 立即关闭下拉框
    showModelDropdown.value = false;

    // 设置为默认配置
    await window.aiConfig.setDefaultModelConfig(configId);

    // 重新加载配置
    await loadAIConfig();

    console.log('模型配置切换成功:', configId);
  } catch (error) {
    console.error('切换模型配置失败:', error);
    // 出错时也关闭下拉框
    showModelDropdown.value = false;
  } finally {
    modelSwitching.value = false;
  }
};

// 获取提供商名称
const getProviderName = (providerId: string): string => {
  const provider = aiConfig.value?.providers.find(p => p.id === providerId);
  return provider?.name || providerId;
};

// 点击外部关闭下拉框
const handleClickOutside = (event: Event) => {
  const target = event.target as Element;
  if (!target.closest('.ai-model-dropdown')) {
    showModelDropdown.value = false;
  }
};

// 格式化时间
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 快捷键处理
const handleKeydown = (event: any) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
    event.preventDefault();
    emit('close');
  }
};

// 组件挂载
onMounted(async () => {
  // 聚焦输入框
  if (inputRef.value) {
    inputRef.value.focus();
  }

  // 加载AI配置
  await loadAIConfig();

  // 添加全局键盘事件监听
  document.addEventListener('keydown', handleKeydown);

  // 添加点击外部关闭下拉框的事件监听
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  // 移除键盘事件监听
  document.removeEventListener('keydown', handleKeydown);

  // 移除点击外部事件监听
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* 自定义滚动条样式 */
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}

.scrollbar-track-transparent::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

/* 加载动画 */
@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.animate-bounce {
  animation: bounce 1.4s infinite ease-in-out both;
}

/* 确保按钮不会因为聚焦而产生额外的样式 */
button:focus {
  outline: none;
}

button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* textarea 样式优化 */
textarea {
  field-sizing: content;
}

/* AI模型下拉框样式 */
.ai-model-dropdown {
  position: relative;
}

.ai-model-dropdown .absolute {
  z-index: 60;
}

/* 旋转动画 */
.rotate-180 {
  transform: rotate(180deg);
}

/* 超小字体样式 */
.text-xxs {
  font-size: 0.625rem; /* 10px */
  line-height: 0.75rem;
}
</style>
