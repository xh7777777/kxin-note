<template>
  <div class="flex h-full relative font-sans bg-blue-200/20">
    <!-- 左侧边栏组件 -->
    <SideBar
      :search-query="searchQuery"
      :note-pages="sideBarNotes"
      :active-note-id="state.currentNote?.id || ''"
      @add-note="addNote"
      @select-note="handleSelectNote"
      @toggle-dark-mode="toggleDarkMode"
      @open-settings="openSettings"
      @open-trash="openTrash"
      @toggle-collapse="handleSidebarCollapse"
    />

    <!-- 中间内容区域 -->
    <div
      class="flex-1 flex items-center justify-center h-screen overflow-hidden transition-all duration-300"
      :class="[
        sidebarCollapsed ? 'p-0' : 'ml-[280px] p-2.5',
        chatVisible ? (sidebarCollapsed ? 'mr-[300px]' : 'mr-[300px]') : '',
      ]"
    >
      <!-- 设置面板 -->
      <SettingView v-if="tabManager.setting" @close="handleCloseSettings" />
      <!-- 垃圾桶面板 -->
      <TrashView v-if="tabManager.trash" @close="handleCloseTrash" />
      <!-- 没有选中笔记时显示 -->
      <div
        class="w-full h-full rounded-lg shadow-md overflow-hidden flex justify-center items-center bg-white"
        v-if="!state.currentNote && !anyTabVisible"
      >
        <div class="text-center max-w-xs">
          <div class="text-center">
            <svg
              class="w-16 h-16 text-gray-200 mb-4 mx-auto stroke-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
              ></path>
              <polyline points="14,2 14,8 20,8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10,9 9,9 8,9"></polyline>
            </svg>
            <h3 class="text-lg font-medium text-gray-500 mb-2">
              选择一个笔记开始编辑
            </h3>
            <p class="text-sm text-gray-400 leading-relaxed">
              从左侧选择笔记本和笔记，或创建一个新笔记
            </p>
            <p class="text-xs text-gray-400 mt-4">
              <kbd class="px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                Ctrl+/
              </kbd>
              显示/隐藏侧边栏
            </p>
            <p class="text-xs text-gray-400 mt-4">
              <kbd class="px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                Ctrl+L
              </kbd>
              打开 AI 助手
            </p>
            <p class="text-xs text-gray-400 mt-4">
              <kbd class="px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                Ctrl+K
              </kbd>
              打开 AI 浮窗
            </p>
          </div>
        </div>
      </div>
      <!-- 笔记内容 -->
      <div
        class="h-full w-full rounded-lg shadow-md overflow-hidden relative"
        v-else-if="!anyTabVisible"
      >
        <MuyaNoteView
          :current-note="state.currentNote"
          :key="state.currentNote?.id"
          @update-note-item="handleUpdateNoteItem"
          @delete-note="handleMoveToTrash"
          @move-to-trash="handleMoveToTrash"
          @move-to="handleMoveTo"
          @translate="handleTranslate"
          @export-markdown="handleExportMarkdown"
          @export-html="handleExportHtml"
          @rename="handleRename"
          @tag="handleTag"
        />
      </div>
    </div>

    <!-- 右侧 AI 聊天区域 -->
    <div
      v-if="chatVisible"
      class="fixed top-0 right-0 w-[300px] h-screen transition-all duration-300 ease-in-out transform z-40"
      :class="chatVisible ? 'translate-x-0' : 'translate-x-full'"
    >
      <AIChatView @close="toggleChat" />
    </div>

    <!-- AI 聊天快捷按钮（当聊天未显示时） -->
    <button
      v-if="!chatVisible"
      @click="toggleChat"
      class="fixed bottom-6 right-6 w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-30 group"
      title="Open AI Chat (Ctrl+L)"
    >
      <svg
        class="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        ></path>
      </svg>

      <!-- 快捷键提示 -->
      <div
        class="absolute bottom-full mb-2 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
      >
        Press Ctrl+L
      </div>
    </button>

    <!-- 全局消息组件 -->
    <PopMessage />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive, computed } from 'vue';
import SideBar from '../../components/SideBar.vue';
import MuyaNoteView from '../../components/MuyaNoteView.vue';
import AIChatView from '../../components/AIChatView.vue';
import PopMessage from '../../components/PopMessage.vue';
import { useMessage } from '../../hooks/useMessage';
import { useNotes } from '../../hooks/useNotes';
import { useNoteActions } from '../../hooks/useNoteActions';
import { eventBus, EventBusKey } from '../../utils/eventBus';
import SettingView from '../../components/SettingView.vue';
import TrashView from '../../components/TrashView.vue';

const { warning, info } = useMessage();

// 响应式数据
const searchQuery = ref('');
const sidebarCollapsed = ref(false);
const chatVisible = ref(false);
const tabManager = reactive({
  setting: false,
  trash: false,
});

// 基础笔记状态管理
const notesInstance = useNotes();
const { getNotesList, sideBarNotes, state } = notesInstance;

// 组合操作方法
const {
  addNoteAndRefresh,
  selectNoteById,
  updateNoteItem,
  moveNoteToTrash,
  saveEditorContent,
} = useNoteActions(notesInstance);

// 快捷键处理
const handleKeyDown = (event: any) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
    event.preventDefault();
    toggleChat();
  }
};

// 是否有任何tab为true
const anyTabVisible = computed(() => {
  return Object.values(tabManager).some(tab => tab);
});

// 切换 AI 聊天显示状态
const toggleChat = () => {
  chatVisible.value = !chatVisible.value;
};

// 使用组合方法替换原有实现
const addNote = () => addNoteAndRefresh();
const handleSelectNote = (noteId: string) => selectNoteById(noteId);
const handleUpdateNoteItem = (noteId: string, key: string, value: any) =>
  updateNoteItem(noteId, key, value);
const handleMoveToTrash = (noteId: string) => moveNoteToTrash(noteId);
const handleEditorSave = (newContent: string) => saveEditorContent(newContent);

// 处理NoteActionHeader组件的事件
const handleMoveTo = (noteId: string) => {
  console.log('移动笔记到:', noteId);
  info('功能开发中', '移动笔记功能正在开发中');
};

const handleTranslate = (noteId: string) => {
  console.log('翻译笔记:', noteId);
  info('功能开发中', '翻译功能正在开发中');
};

const handleExportMarkdown = (noteId: string) => {
  console.log('导出为Markdown:', noteId);
  info('功能开发中', '导出为Markdown功能正在开发中');
};

const handleExportHtml = (noteId: string) => {
  console.log('导出为HTML:', noteId);
  info('功能开发中', '导出为HTML功能正在开发中');
};

const handleRename = async (noteId: string, newName: string) => {
  console.log('重命名笔记:', noteId, '新名称:', newName);
  // 使用updateNoteItem来更新笔记标题
  await updateNoteItem(noteId, 'title', newName);
  await getNotesList(true);
};

const handleTag = (noteId: string) => {
  console.log('标签笔记:', noteId);
  info('功能开发中', '标签功能正在开发中');
};

// UI 相关方法保持不变
const handleSidebarCollapse = (collapsed: boolean) => {
  sidebarCollapsed.value = collapsed;
};

const toggleDarkMode = () => {
  console.log('切换黑暗模式');
  info('功能开发中', '黑暗模式功能正在开发中');
};

const openSettings = () => {
  tabManager.setting = true;
};

const handleCloseSettings = () => {
  tabManager.setting = false;
};

const openTrash = () => {
  console.log('打开垃圾桶');
  info('垃圾桶功能', '垃圾桶功能正在开发中');
};

const handleCloseTrash = () => {
  tabManager.trash = false;
};

onMounted(async () => {
  // 初始化加载笔记列表
  await getNotesList(true);

  // 注册事件监听器
  eventBus.on(EventBusKey.EditorSave, handleEditorSave);
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  // 清理事件监听器
  eventBus.off(EventBusKey.EditorSave, handleEditorSave);
  document.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
/* 响应式设计 */
@media (max-width: 768px) {
  .ml-\[280px\] {
    margin-left: 260px;
  }

  .ml-\[60px\] {
    margin-left: 50px;
  }

  .mr-\[400px\] {
    margin-right: 350px;
  }

  .w-\[400px\] {
    width: 350px;
  }
}

/* kbd 样式 */
kbd {
  font-family:
    ui-monospace, SFMono-Regular, 'SF Mono', Monaco, Consolas,
    'Liberation Mono', 'Courier New', monospace;
  font-size: 0.75rem;
  font-weight: 600;
}

/* 确保按钮不会因为聚焦而产生额外的样式 */
button:focus {
  outline: none;
}

button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>
