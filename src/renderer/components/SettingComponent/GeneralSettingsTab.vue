<template>
  <div class="p-6 space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">通用设置</h2>
      <p class="text-sm text-gray-600">配置应用的常规选项和行为</p>
    </div>

    <!-- 应用程序设置 -->
    <div class="bg-white border border-gray-200 rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">应用程序</h3>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-sm font-medium text-gray-900">开机自启动</h4>
            <p class="text-sm text-gray-500">系统启动时自动启动应用</p>
          </div>
          <input
            type="checkbox"
            v-model="appConfig.autoStart"
            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-sm font-medium text-gray-900">最小化到系统托盘</h4>
            <p class="text-sm text-gray-500">关闭窗口时最小化到系统托盘</p>
          </div>
          <input
            type="checkbox"
            v-model="appConfig.minimizeToTray"
            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-sm font-medium text-gray-900">检查更新</h4>
            <p class="text-sm text-gray-500">自动检查应用更新</p>
          </div>
          <input
            type="checkbox"
            v-model="appConfig.autoUpdate"
            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            语言
          </label>
          <select
            v-model="appConfig.language"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="zh-CN">简体中文</option>
            <option value="zh-TW">繁体中文</option>
            <option value="en-US">English</option>
            <option value="ja-JP">日本語</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 外观设置 -->
    <div class="bg-white border border-gray-200 rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">外观</h3>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            主题
          </label>
          <div class="grid grid-cols-3 gap-3">
            <div
              v-for="theme in themes"
              :key="theme.value"
              @click="appearanceConfig.theme = theme.value"
              class="relative border-2 rounded-lg p-3 cursor-pointer transition-colors"
              :class="
                appearanceConfig.theme === theme.value
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              "
            >
              <div class="flex items-center space-x-2">
                <div :class="theme.iconClass" class="w-4 h-4"></div>
                <span class="text-sm font-medium">{{ theme.label }}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            字体大小
          </label>
          <div class="flex items-center space-x-4">
            <input
              type="range"
              min="12"
              max="20"
              step="1"
              v-model="appearanceConfig.fontSize"
              class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span class="text-sm text-gray-600 w-10">
              {{ appearanceConfig.fontSize }}px
            </span>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            字体族
          </label>
          <select
            v-model="appearanceConfig.fontFamily"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="system">系统默认</option>
            <option value="serif">宋体</option>
            <option value="sans-serif">黑体</option>
            <option value="monospace">等宽字体</option>
          </select>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-sm font-medium text-gray-900">显示行号</h4>
            <p class="text-sm text-gray-500">在编辑器中显示行号</p>
          </div>
          <input
            type="checkbox"
            v-model="appearanceConfig.showLineNumbers"
            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
        </div>
      </div>
    </div>

    <!-- 编辑器设置 -->
    <div class="bg-white border border-gray-200 rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">编辑器</h3>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-sm font-medium text-gray-900">自动保存</h4>
            <p class="text-sm text-gray-500">输入时自动保存文档</p>
          </div>
          <input
            type="checkbox"
            v-model="editorConfig.autoSave"
            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
        </div>

        <div v-if="editorConfig.autoSave">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            自动保存延迟 (毫秒)
          </label>
          <input
            type="number"
            v-model="editorConfig.autoSaveDelay"
            min="500"
            max="5000"
            step="100"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-sm font-medium text-gray-900">拼写检查</h4>
            <p class="text-sm text-gray-500">检查拼写错误</p>
          </div>
          <input
            type="checkbox"
            v-model="editorConfig.spellCheck"
            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-sm font-medium text-gray-900">自动换行</h4>
            <p class="text-sm text-gray-500">当文本超出编辑器宽度时自动换行</p>
          </div>
          <input
            type="checkbox"
            v-model="editorConfig.wordWrap"
            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            默认笔记格式
          </label>
          <select
            v-model="editorConfig.defaultFormat"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="markdown">Markdown</option>
            <option value="rich-text">富文本</option>
            <option value="plain-text">纯文本</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 快捷键设置 -->
    <div class="bg-white border border-gray-200 rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">快捷键</h3>

      <div class="space-y-3">
        <div
          v-for="shortcut in shortcuts"
          :key="shortcut.action"
          class="flex items-center justify-between py-2"
        >
          <div>
            <h4 class="text-sm font-medium text-gray-900">
              {{ shortcut.name }}
            </h4>
            <p class="text-xs text-gray-500">{{ shortcut.description }}</p>
          </div>
          <div class="flex items-center space-x-2">
            <kbd
              class="px-2 py-1 text-xs font-mono bg-gray-100 border border-gray-300 rounded"
            >
              {{ shortcut.key }}
            </kbd>
            <button
              @click="editShortcut(shortcut.action)"
              class="text-xs text-indigo-600 hover:text-indigo-800"
            >
              编辑
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 隐私设置 -->
    <div class="bg-white border border-gray-200 rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">隐私</h3>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-sm font-medium text-gray-900">发送匿名使用统计</h4>
            <p class="text-sm text-gray-500">
              帮助我们改进产品（不包含个人信息）
            </p>
          </div>
          <input
            type="checkbox"
            v-model="privacyConfig.analytics"
            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-sm font-medium text-gray-900">崩溃报告</h4>
            <p class="text-sm text-gray-500">应用崩溃时自动发送错误报告</p>
          </div>
          <input
            type="checkbox"
            v-model="privacyConfig.crashReports"
            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
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
import { reactive } from 'vue';

const appConfig = reactive({
  autoStart: false,
  minimizeToTray: true,
  autoUpdate: true,
  language: 'zh-CN',
});

const appearanceConfig = reactive({
  theme: 'light',
  fontSize: 14,
  fontFamily: 'system',
  showLineNumbers: false,
});

const editorConfig = reactive({
  autoSave: true,
  autoSaveDelay: 1000,
  spellCheck: true,
  wordWrap: true,
  defaultFormat: 'markdown',
});

const privacyConfig = reactive({
  analytics: false,
  crashReports: true,
});

const themes = [
  {
    value: 'light',
    label: '浅色',
    iconClass: 'bg-white border border-gray-300 rounded-full',
  },
  { value: 'dark', label: '深色', iconClass: 'bg-gray-800 rounded-full' },
  {
    value: 'auto',
    label: '自动',
    iconClass:
      'bg-gradient-to-r from-white to-gray-800 border border-gray-300 rounded-full',
  },
];

const shortcuts = [
  {
    action: 'new-note',
    name: '新建笔记',
    description: '创建新的笔记',
    key: 'Ctrl+N',
  },
  { action: 'save', name: '保存', description: '保存当前笔记', key: 'Ctrl+S' },
  { action: 'search', name: '搜索', description: '全局搜索', key: 'Ctrl+F' },
  {
    action: 'toggle-sidebar',
    name: '切换侧边栏',
    description: '显示/隐藏侧边栏',
    key: 'Ctrl+/',
  },
  {
    action: 'toggle-ai',
    name: 'AI助手',
    description: '打开/关闭AI助手',
    key: 'Ctrl+L',
  },
  {
    action: 'export',
    name: '导出',
    description: '导出当前笔记',
    key: 'Ctrl+E',
  },
];

const editShortcut = (action: string) => {
  // TODO: 实现快捷键编辑逻辑
  console.log('编辑快捷键:', action);
};

const saveConfig = () => {
  // TODO: 实现保存配置逻辑
  console.log('保存通用设置', {
    app: appConfig,
    appearance: appearanceConfig,
    editor: editorConfig,
    privacy: privacyConfig,
  });
};

const resetConfig = () => {
  // TODO: 实现重置配置逻辑
  console.log('重置通用设置');
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

/* 主题选择器样式 */
.grid > div:hover {
  transform: translateY(-1px);
}
</style>
