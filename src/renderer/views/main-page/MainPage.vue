<template>
  <div class="flex h-full relative font-sans bg-blue-200/20">
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
      @toggle-collapse="handleSidebarCollapse"
    />

    <!-- 右侧内容区域 -->
    <div
      class="flex-1 flex items-center justify-center h-screen overflow-hidden transition-all duration-300"
      :class="sidebarCollapsed ? 'p-0' : 'ml-[280px] p-2.5'"
    >
      <div
        class="w-full h-full rounded-lg shadow-md overflow-hidden flex justify-center items-center bg-white"
        v-if="!activeNoteId"
      >
        <!-- 没有选中笔记时显示 -->
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
      <div class="h-full w-full rounded-lg shadow-md overflow-hidden" v-else>
        <NoteView
          :note-id="activeNoteId"
          ref="noteViewRef"
          :key="activeNoteId"
          @update-note-item="handleUpdateNoteItem"
        />
      </div>
    </div>

    <!-- 全局消息组件 -->
    <PopMessage />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import SideBar from '../../components/SideBar.vue';
import NoteView from '../../components/NoteView.vue';
import PopMessage from '../../components/PopMessage.vue';
import { useNotes } from '../../hooks/useNotes';
import { useMessage } from '../../hooks/useMessage';
import { useNoteStore } from '../../store/modules/noteStore';

const noteStore = useNoteStore();
const {
  notePages,
  activeNoteId,
  createNote,
  getAllNotes,
  selectNote,
  updateNote,
} = useNotes();

const { success, error, warning, info } = useMessage();

// 响应式数据
const searchQuery = ref('');
const sidebarCollapsed = ref(false);

// 笔记视图组件引用
const noteViewRef = ref<InstanceType<typeof NoteView> | null>(null);

onMounted(async () => {
  await getAllNotes();
});

const addNote = async () => {
  try {
    const note = await createNote();
    if (note && note.id) {
      // 笔记创建成功
      handleSelectNote(note.id);
    } else {
      throw new Error('创建失败');
    }
  } catch (error) {
    console.error('添加新笔记失败', error);
    error('创建失败', '无法创建新笔记，请重试');
  }
};

const handleSelectNote = async (noteId: string) => {
  const res = await selectNote(noteId);
  if (res && noteViewRef.value) {
    await noteViewRef.value.changeNotePage(noteId);
  }
};

const handleSidebarCollapse = (collapsed: boolean) => {
  sidebarCollapsed.value = collapsed;
};

const handleUpdateNoteItem = async (
  noteId: string,
  key: string,
  value: any
) => {
  // console.log('handleUpdateNoteInfo', noteId, updates);
  const res = await updateNote(noteId, { [key]: value });
  if (res) {
    console.log('handleUpdateNoteInfo', noteId, key, value);
    if (key == 'title' || key == 'icon') {
      await getAllNotes();
    }
  } else {
    console.error('handleUpdateNoteInfo11', noteId, key, value);
  }
};

const toggleDarkMode = () => {
  console.log('切换黑暗模式');
  info('功能开发中', '黑暗模式功能正在开发中');
  // 这里可以实现全局的黑暗模式切换逻辑
  // 例如切换 CSS 类，更新 Pinia store 等
};

const openSettings = () => {
  console.log('打开设置');
  warning('功能开发中', '设置功能正在开发中');
  // 这里可以打开设置模态框或跳转到设置页面
};

const openTrash = () => {
  console.log('打开垃圾桶');
  info('垃圾桶功能', '垃圾桶功能正在开发中');
  // 这里可以显示已删除的笔记列表
};
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
}
</style>
