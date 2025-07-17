<template>
  <div
    class="h-full w-full rounded-lg shadow-md overflow-hidden flex-1 relative bg-gray-50"
  >
    <!-- 设置面板容器 -->
    <div class="flex h-full">
      <!-- 左侧tab导航 -->
      <div class="w-64 bg-white border-r border-gray-200 flex flex-col">
        <!-- 标题 -->
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900">设置</h1>
              <p class="text-sm text-gray-600 mt-1">配置应用的各项功能</p>
            </div>
            <button
              @click="handleClose"
              class="p-1 hover:bg-gray-100 rounded-md transition-colors"
              title="关闭设置"
            >
              <X class="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <!-- Tab导航列表 -->
        <nav class="flex-1 px-4 py-4">
          <ul class="space-y-1">
            <li v-for="tab in tabs" :key="tab.id">
              <button
                @click="activeTab = tab.id"
                class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200"
                :class="
                  activeTab === tab.id
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                "
              >
                <component :is="tab.icon" class="w-5 h-5 mr-3" />
                {{ tab.name }}
              </button>
            </li>
          </ul>
        </nav>

        <!-- 底部版本信息 -->
        <div class="px-6 py-4 border-t border-gray-200">
          <div class="text-xs text-gray-500">
            <p>Kxin Note v1.0.0</p>
            <p>© 2024 Kxin Team</p>
          </div>
        </div>
      </div>

      <!-- 右侧内容区域 -->
      <div class="flex-1 flex flex-col min-h-0">
        <!-- 内容头部 -->
        <div class="bg-white border-b border-gray-200 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">
                {{ currentTabName }}
              </h2>
              <p class="text-sm text-gray-600 mt-1">
                {{ currentTabDescription }}
              </p>
            </div>
            <!-- 可选的操作按钮 -->
            <div class="flex space-x-2">
              <button
                v-if="showResetButton"
                @click="resetCurrentTab"
                class="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                重置
              </button>
            </div>
          </div>
        </div>

        <!-- 内容主体 -->
        <div class="flex-1 overflow-auto bg-gray-50">
          <component :is="currentTabComponent" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Info, Cpu, FolderOpen, Settings, X } from 'lucide-vue-next';

// 导入tab组件
import AboutTab from './SettingComponent/AboutTab.vue';
import ModelConfigTab from './SettingComponent/ModelConfigTab.vue';
import FileManagementTab from './SettingComponent/FileManagementTab.vue';
import GeneralSettingsTab from './SettingComponent/GeneralSettingsTab.vue';

// 定义事件
const emit = defineEmits<{
  (e: 'close'): void;
}>();

// 当前激活的tab
const activeTab = ref('about');

// Tab配置
const tabs = [
  {
    id: 'about',
    name: '关于',
    description: '应用信息和版本详情',
    icon: Info,
    component: AboutTab,
  },
  {
    id: 'model-config',
    name: '模型配置',
    description: '配置AI模型和API设置',
    icon: Cpu,
    component: ModelConfigTab,
  },
  {
    id: 'file-management',
    name: '文件管理',
    description: '管理文件存储和同步设置',
    icon: FolderOpen,
    component: FileManagementTab,
  },
  {
    id: 'general',
    name: '通用设置',
    description: '应用的常规配置选项',
    icon: Settings,
    component: GeneralSettingsTab,
  },
];

// 计算属性
const currentTab = computed(() => {
  return tabs.find(tab => tab.id === activeTab.value) || tabs[0];
});

const currentTabName = computed(() => currentTab.value.name);
const currentTabDescription = computed(() => currentTab.value.description);
const currentTabComponent = computed(() => currentTab.value.component);

// 是否显示重置按钮（排除关于页面）
const showResetButton = computed(() => activeTab.value !== 'about');

// 处理关闭事件
const handleClose = () => {
  emit('close');
};

// 重置当前tab的设置
const resetCurrentTab = () => {
  console.log('重置设置:', activeTab.value);
};

// 暴露方法给父组件
defineExpose({
  setActiveTab: (tabId: string) => {
    if (tabs.some(tab => tab.id === tabId)) {
      activeTab.value = tabId;
    }
  },
});
</script>

<style lang="scss" scoped>
/* 自定义滚动条 */
.overflow-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Tab导航动画 */
.transition-colors {
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
}
</style>
