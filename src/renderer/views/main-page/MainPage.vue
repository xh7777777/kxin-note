<template>
  <div class="flex h-full bg-white relative font-sans">
    <!-- 左侧边栏组件 -->
    <SideBar
      :search-query="searchQuery"
      :active-tab="activeTab"
      :active-notebook="activeNotebook"
      :active-note-id="activeNoteId"
      :notebooks="notebooks"
      :notes="notes"
      @add-notebook="addNotebook"
    />

    <!-- 右侧内容区域 -->
    <div
      class="flex-1 flex items-center justify-center bg-white min-h-screen overflow-auto ml-[280px]"
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SideBar, { type Note, type Notebook } from './components/side-bar.vue';

// 响应式数据
const searchQuery = ref('');
const activeNoteId = ref<string | null>(null);
const activeTab = ref('notebooks');
const activeNotebook = ref<string | null>('1');

// 模拟笔记本数据
const notebooks = ref<Notebook[]>([
  { id: '1', name: 'Work Notes', emoji: '💼', color: '#6366f1', noteCount: 12 },
  { id: '2', name: 'Personal', emoji: '🏠', color: '#10b981', noteCount: 8 },
  { id: '3', name: 'Learning', emoji: '📚', color: '#f59e0b', noteCount: 15 },
  { id: '4', name: 'Ideas', emoji: '💡', color: '#ec4899', noteCount: 6 },
  { id: '5', name: 'Travel', emoji: '✈️', color: '#8b5cf6', noteCount: 4 },
]);

// 模拟笔记数据
const notes = ref<Note[]>([
  {
    id: '1',
    title: 'Project Planning Meeting',
    preview:
      'Discussed the Q1 roadmap and key milestones for the upcoming product launch...',
    updatedAt: new Date('2024-01-15'),
    tags: ['work', 'meeting'],
    notebookId: '1',
  },
  {
    id: '2',
    title: 'Learning Vue 3 Composition API',
    preview:
      'The Composition API provides a more flexible way to organize component logic...',
    updatedAt: new Date('2024-01-14'),
    tags: ['vue', 'learning'],
    notebookId: '3',
  },
  {
    id: '3',
    title: 'Weekend Trip Ideas',
    preview:
      'Planning a weekend getaway to the mountains. Need to check hiking trails...',
    updatedAt: new Date('2024-01-13'),
    tags: ['travel', 'personal'],
    notebookId: '5',
  },
]);

// 方法
const addNotebook = () => {
  console.log('添加新笔记本');
};
</script>

<style scoped>
/* 响应式设计 */
@media (max-width: 768px) {
  .ml-\[280px\] {
    margin-left: 260px;
  }
}
</style>
