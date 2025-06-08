<template>
  <div class="flex h-full bg-white relative font-sans">
    <!-- 左侧边栏组件 -->
    <SideBar
      :search-query="searchQuery"
      :note-pages="notePages"
      :active-note-id="activeNoteId"
      @add-note="addNote"
      @select-note="handleSelectNote"
      @toggle-dark-mode="toggleDarkMode"
      @open-settings="openSettings"
      @open-trash="openTrash"
    />

    <!-- 右侧内容区域 -->
    <div
      class="flex-1 flex items-center justify-center bg-white min-h-screen overflow-auto ml-[280px]"
    >
      <!-- 没有选中笔记时显示 -->
      <div class="text-center max-w-xs" v-if="activeNoteId === null">
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
      <NoteView :note-id="activeNoteId" ref="noteViewRef" v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import SideBar from './components/SideBar.vue';
import NoteView from './components/NoteView.vue';
import { useNotes } from './hooks/useNotes';

const { notePages, activeNoteId, createNote, getAllNotes, selectNote } =
  useNotes();

// 响应式数据
const searchQuery = ref('');

// 笔记视图组件引用
const noteViewRef = ref<InstanceType<typeof NoteView> | null>(null);

onMounted(async () => {
  await getAllNotes();
});

const addNote = async () => {
  console.log('添加新笔记');
  try {
    const note = await createNote();
    console.log('添加新笔记成功', note);
  } catch (error) {
    console.error('添加新笔记失败', error);
  }
};

const handleSelectNote = async (noteId: string) => {
  await selectNote(noteId);
  if (noteViewRef.value) {
    await noteViewRef.value.changeNotePage(noteId);
  }
};

const toggleDarkMode = () => {
  console.log('切换黑暗模式');
  // 这里可以实现全局的黑暗模式切换逻辑
  // 例如切换 CSS 类，更新 Pinia store 等
};

const openSettings = () => {
  console.log('打开设置');
  // 这里可以打开设置模态框或跳转到设置页面
};

const openTrash = () => {
  console.log('打开垃圾桶');
  // 这里可以显示已删除的笔记列表
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
