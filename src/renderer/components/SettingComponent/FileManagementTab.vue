<template>
  <div class="p-6 space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">文件管理</h2>
      <p class="text-sm text-gray-600">管理笔记存储位置、备份和同步设置</p>
    </div>

    <!-- 存储位置 -->
    <div class="bg-white border border-gray-200 rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">存储位置</h3>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            笔记存储目录
          </label>
          <div class="flex items-center space-x-3">
            <input
              type="text"
              v-model="storageConfig.notesPath"
              readonly
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
            />
            <button
              @click="selectNotesFolder"
              class="px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
            >
              选择目录
            </button>
          </div>
          <p class="mt-1 text-xs text-gray-500">更改后需要重启应用</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            附件存储目录
          </label>
          <div class="flex items-center space-x-3">
            <input
              type="text"
              v-model="storageConfig.attachmentsPath"
              readonly
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
            />
            <button
              @click="selectAttachmentsFolder"
              class="px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
            >
              选择目录
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 自动备份 -->
    <div class="bg-white border border-gray-200 rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">自动备份</h3>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-sm font-medium text-gray-900">启用自动备份</h4>
            <p class="text-sm text-gray-500">定期自动备份你的笔记</p>
          </div>
          <input
            type="checkbox"
            v-model="backupConfig.enabled"
            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
        </div>

        <div
          v-if="backupConfig.enabled"
          class="space-y-4 pl-4 border-l-2 border-indigo-200"
        >
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              备份频率
            </label>
            <select
              v-model="backupConfig.frequency"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="daily">每天</option>
              <option value="weekly">每周</option>
              <option value="monthly">每月</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              备份位置
            </label>
            <div class="flex items-center space-x-3">
              <input
                type="text"
                v-model="backupConfig.path"
                readonly
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
              />
              <button
                @click="selectBackupFolder"
                class="px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
              >
                选择目录
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              保留备份数量
            </label>
            <input
              type="number"
              v-model="backupConfig.keepCount"
              min="1"
              max="50"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p class="mt-1 text-xs text-gray-500">
              超过此数量的旧备份将被自动删除
            </p>
          </div>

          <div class="flex items-center space-x-3">
            <button
              @click="createBackupNow"
              class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
            >
              立即备份
            </button>
            <span class="text-sm text-gray-500">
              最后备份: {{ lastBackupTime || '从未' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 云同步 -->
    <div class="bg-white border border-gray-200 rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">云同步</h3>

      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- GitHub同步 -->
          <div class="border border-gray-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-2">
                <svg
                  class="w-5 h-5 text-gray-700"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span class="text-sm font-medium">GitHub</span>
              </div>
              <input
                type="checkbox"
                v-model="syncConfig.github.enabled"
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
            </div>
            <div v-if="syncConfig.github.enabled" class="space-y-2">
              <input
                type="text"
                v-model="syncConfig.github.token"
                placeholder="GitHub Token"
                class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <input
                type="text"
                v-model="syncConfig.github.repo"
                placeholder="username/repo"
                class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <!-- WebDAV同步 -->
          <div class="border border-gray-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-2">
                <svg
                  class="w-5 h-5 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                  ></path>
                </svg>
                <span class="text-sm font-medium">WebDAV</span>
              </div>
              <input
                type="checkbox"
                v-model="syncConfig.webdav.enabled"
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
            </div>
            <div v-if="syncConfig.webdav.enabled" class="space-y-2">
              <input
                type="url"
                v-model="syncConfig.webdav.url"
                placeholder="WebDAV URL"
                class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <input
                type="text"
                v-model="syncConfig.webdav.username"
                placeholder="用户名"
                class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <input
                type="password"
                v-model="syncConfig.webdav.password"
                placeholder="密码"
                class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <!-- OneDrive同步 -->
          <div class="border border-gray-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-2">
                <svg
                  class="w-5 h-5 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M5.5 4A4.5 4.5 0 001 8.5c0 .36.04.71.13 1.05C.47 10.42 0 11.42 0 12.5A3.5 3.5 0 003.5 16h16a4.5 4.5 0 00.97-8.88A6 6 0 005.5 4z"
                  />
                </svg>
                <span class="text-sm font-medium">OneDrive</span>
              </div>
              <input
                type="checkbox"
                v-model="syncConfig.onedrive.enabled"
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
            </div>
            <div v-if="syncConfig.onedrive.enabled" class="space-y-2">
              <button
                @click="connectOneDrive"
                class="w-full px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                {{ syncConfig.onedrive.connected ? '已连接' : '连接账户' }}
              </button>
              <div
                v-if="syncConfig.onedrive.connected"
                class="text-xs text-gray-500"
              >
                最后同步: {{ syncConfig.onedrive.lastSync || '从未' }}
              </div>
            </div>
          </div>
        </div>

        <div
          class="flex items-center justify-between pt-4 border-t border-gray-200"
        >
          <div>
            <h4 class="text-sm font-medium text-gray-900">自动同步</h4>
            <p class="text-sm text-gray-500">在笔记更改时自动同步到云端</p>
          </div>
          <input
            type="checkbox"
            v-model="syncConfig.autoSync"
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
import { ref, reactive } from 'vue';

const lastBackupTime = ref('2024-01-01 12:00:00');

const storageConfig = reactive({
  notesPath: '/Users/username/Documents/KxinNotes',
  attachmentsPath: '/Users/username/Documents/KxinNotes/attachments',
});

const backupConfig = reactive({
  enabled: false,
  frequency: 'daily',
  path: '/Users/username/Documents/KxinNotes/backups',
  keepCount: 10,
});

const syncConfig = reactive({
  autoSync: false,
  github: {
    enabled: false,
    token: '',
    repo: '',
  },
  webdav: {
    enabled: false,
    url: '',
    username: '',
    password: '',
  },
  onedrive: {
    enabled: false,
    connected: false,
    lastSync: null,
  },
});

const selectNotesFolder = async () => {
  // TODO: 实现选择文件夹逻辑
  console.log('选择笔记存储目录');
};

const selectAttachmentsFolder = async () => {
  // TODO: 实现选择文件夹逻辑
  console.log('选择附件存储目录');
};

const selectBackupFolder = async () => {
  // TODO: 实现选择文件夹逻辑
  console.log('选择备份目录');
};

const createBackupNow = async () => {
  // TODO: 实现立即备份逻辑
  console.log('创建备份');
  lastBackupTime.value = new Date().toLocaleString('zh-CN');
};

const connectOneDrive = async () => {
  // TODO: 实现OneDrive连接逻辑
  console.log('连接OneDrive');
  syncConfig.onedrive.connected = !syncConfig.onedrive.connected;
};

const saveConfig = () => {
  // TODO: 实现保存配置逻辑
  console.log('保存文件管理配置', {
    storage: storageConfig,
    backup: backupConfig,
    sync: syncConfig,
  });
};

const resetConfig = () => {
  // TODO: 实现重置配置逻辑
  console.log('重置文件管理配置');
};
</script>

<style lang="scss" scoped></style>
