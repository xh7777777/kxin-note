<template>
  <div class="ai-config-tab p-6 bg-gray-50 min-h-screen">
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- 标题 -->
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-900">AI 配置管理</h2>
        <button
          @click="addNewConfig"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          添加配置
        </button>
      </div>

      <!-- 全局设置 -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">全局设置</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              启用AI功能
            </label>
            <input
              v-model="globalSettings.enabled"
              type="checkbox"
              class="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              调试模式
            </label>
            <input
              v-model="globalSettings.debugMode"
              type="checkbox"
              class="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
            />
          </div>
        </div>
        <button
          @click="saveGlobalSettings"
          class="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          保存全局设置
        </button>
      </div>

      <!-- 模型配置列表 -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">模型配置</h3>

        <div v-if="loading" class="text-center py-8">
          <div
            class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"
          ></div>
          <p class="mt-2 text-gray-600">加载中...</p>
        </div>

        <div
          v-else-if="modelConfigs.length === 0"
          class="text-center py-8 text-gray-500"
        >
          暂无配置，点击"添加配置"创建第一个AI模型配置
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="config in modelConfigs"
            :key="config.id"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-3">
                  <h4 class="text-lg font-medium text-gray-900">
                    {{ config.name }}
                  </h4>
                  <span
                    v-if="config.isDefault"
                    class="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full"
                  >
                    默认
                  </span>
                  <span
                    :class="
                      config.enabled
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    "
                    class="px-2 py-1 text-xs font-medium rounded-full"
                  >
                    {{ config.enabled ? '启用' : '禁用' }}
                  </span>
                </div>
                <p class="text-sm text-gray-600 mt-1">
                  {{ getProviderName(config.providerId) }} -
                  {{ config.modelId }}
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  更新时间: {{ formatDate(config.updatedAt) }}
                </p>
              </div>
              <div class="flex items-center space-x-2">
                <button
                  v-if="!config.isDefault"
                  @click="setAsDefault(config.id)"
                  class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  设为默认
                </button>
                <button
                  @click="editConfig(config)"
                  class="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
                >
                  编辑
                </button>
                <button
                  @click="deleteConfig(config.id)"
                  class="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 编辑配置对话框 -->
      <div
        v-if="showEditDialog"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div
          class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        >
          <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              {{ editingConfig?.id ? '编辑配置' : '添加配置' }}
            </h3>

            <form @submit.prevent="saveConfig" class="space-y-4">
              <!-- 基础信息 -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    配置名称 *
                  </label>
                  <input
                    v-model="editingConfig.name"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    提供商 *
                  </label>
                  <select
                    v-model="editingConfig.providerId"
                    required
                    @change="onProviderChange"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">请选择提供商</option>
                    <option
                      v-for="provider in providers"
                      :key="provider.id"
                      :value="provider.id"
                    >
                      {{ provider.name }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    模型 *
                  </label>
                  <select
                    v-model="editingConfig.modelId"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">请选择模型</option>
                    <option
                      v-for="model in availableModels"
                      :key="model.id"
                      :value="model.id"
                    >
                      {{ model.name }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    API端点 *
                  </label>
                  <input
                    v-model="editingConfig.endpoint"
                    type="url"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  v-model="editingConfig.apiKey"
                  type="password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="输入您的API Key"
                />
              </div>

              <!-- 模型参数 -->
              <div class="border-t pt-4">
                <h4 class="text-md font-medium text-gray-900 mb-3">模型参数</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      温度 (0-2)
                    </label>
                    <input
                      v-model.number="editingConfig.parameters.temperature"
                      type="number"
                      min="0"
                      max="2"
                      step="0.1"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Top-p (0-1)
                    </label>
                    <input
                      v-model.number="editingConfig.parameters.topP"
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      最大Tokens
                    </label>
                    <input
                      v-model.number="editingConfig.parameters.maxTokens"
                      type="number"
                      min="1"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <!-- 验证错误 -->
              <div
                v-if="validationErrors.length > 0"
                class="bg-red-50 border border-red-200 rounded-lg p-3"
              >
                <h5 class="text-sm font-medium text-red-800 mb-2">
                  配置验证失败:
                </h5>
                <ul class="text-sm text-red-700 space-y-1">
                  <li v-for="error in validationErrors" :key="error">
                    • {{ error }}
                  </li>
                </ul>
              </div>

              <!-- 对话框按钮 -->
              <div class="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  @click="cancelEdit"
                  class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type {
  AIConfig,
  AIModelConfig,
  AIProvider,
  AIModel,
} from '../../../../customTypes/models/config.types';

// 响应式数据
const loading = ref(true);
const aiConfig = ref<AIConfig | null>(null);
const modelConfigs = ref<AIModelConfig[]>([]);
const providers = ref<AIProvider[]>([]);
const showEditDialog = ref(false);
const editingConfig = ref<AIModelConfig | null>(null);
const validationErrors = ref<string[]>([]);

// 全局设置
const globalSettings = ref({
  enabled: true,
  debugMode: false,
});

// 计算属性
const availableModels = computed<AIModel[]>(() => {
  if (!editingConfig.value?.providerId) return [];
  const provider = providers.value.find(
    p => p.id === editingConfig.value?.providerId
  );
  return provider?.supportedModels || [];
});

// 方法
function getProviderName(providerId: string): string {
  const provider = providers.value.find(p => p.id === providerId);
  return provider?.name || providerId;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('zh-CN');
}

async function loadConfig(): Promise<void> {
  try {
    loading.value = true;

    // 并行加载数据
    const [config, providersList] = await Promise.all([
      window.aiConfig.getConfig(),
      window.aiConfig.getProviders(),
    ]);

    aiConfig.value = config;
    modelConfigs.value = config.modelConfigs;
    providers.value = providersList;
    globalSettings.value = {
      enabled: config.globalSettings.enabled,
      debugMode: config.globalSettings.debugMode,
    };
  } catch (error) {
    console.error('加载AI配置失败:', error);
    // 这里可以添加用户友好的错误提示
  } finally {
    loading.value = false;
  }
}

async function saveGlobalSettings(): Promise<void> {
  if (!aiConfig.value) return;

  try {
    // 创建一个干净的配置对象，确保所有属性都是可序列化的
    const cleanConfig = JSON.parse(JSON.stringify(aiConfig.value));

    const updatedConfig = {
      ...cleanConfig,
      globalSettings: {
        ...cleanConfig.globalSettings,
        enabled: globalSettings.value.enabled,
        debugMode: globalSettings.value.debugMode,
      },
      updatedAt: new Date().toISOString(),
    };

    await window.aiConfig.setConfig(updatedConfig);

    // 重新加载配置以确保同步
    await loadConfig();

    // 显示成功提示
    console.log('全局设置保存成功');
  } catch (error) {
    console.error('保存全局设置失败:', error);
  }
}

async function addNewConfig(): Promise<void> {
  try {
    const sampleConfig = await window.aiConfig.createSampleModelConfig();
    // 确保配置对象是干净的，可以被正确处理
    editingConfig.value = JSON.parse(JSON.stringify(sampleConfig));
    showEditDialog.value = true;
    validationErrors.value = [];
  } catch (error) {
    console.error('创建示例配置失败:', error);
  }
}

function editConfig(config: AIModelConfig): void {
  editingConfig.value = JSON.parse(JSON.stringify(config)); // 深拷贝
  showEditDialog.value = true;
  validationErrors.value = [];
}

function cancelEdit(): void {
  editingConfig.value = null;
  showEditDialog.value = false;
  validationErrors.value = [];
}

function onProviderChange(): void {
  if (editingConfig.value) {
    // 重置模型选择
    editingConfig.value.modelId = '';

    // 更新端点
    const provider = providers.value.find(
      p => p.id === editingConfig.value?.providerId
    );
    if (provider) {
      editingConfig.value.endpoint = provider.defaultEndpoint;
    }
  }
}

async function saveConfig(): Promise<void> {
  if (!editingConfig.value) return;

  try {
    // 创建一个干净的配置对象，确保所有属性都是可序列化的
    const cleanModelConfig = JSON.parse(JSON.stringify(editingConfig.value));

    // 验证配置
    const validation =
      await window.aiConfig.validateModelConfig(cleanModelConfig);
    if (!validation.valid) {
      validationErrors.value = validation.errors;
      return;
    }

    // 保存配置
    await window.aiConfig.setModelConfig(cleanModelConfig);

    // 重新加载配置列表
    await loadConfig();

    // 关闭对话框
    cancelEdit();

    console.log('配置保存成功');
  } catch (error) {
    console.error('保存配置失败:', error);
  }
}

async function setAsDefault(configId: string): Promise<void> {
  try {
    await window.aiConfig.setDefaultModelConfig(configId);
    await loadConfig();
    console.log('默认配置设置成功');
  } catch (error) {
    console.error('设置默认配置失败:', error);
  }
}

async function deleteConfig(configId: string): Promise<void> {
  if (!confirm('确定要删除这个配置吗？此操作不可恢复。')) {
    return;
  }

  try {
    await window.aiConfig.deleteModelConfig(configId);
    await loadConfig();
    console.log('配置删除成功');
  } catch (error) {
    console.error('删除配置失败:', error);
  }
}

// 生命周期
onMounted(() => {
  loadConfig();
});
</script>

<style scoped>
/* 自定义滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
