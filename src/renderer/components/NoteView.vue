<template>
  <!-- <div ref="editorContainer" class="editor-container"></div> -->
  <div
    class="w-full h-full flex justify-center items-center flex-col relative bg-white overflow-auto p-8 scrollbar-hide flex-1"
  >
    <!-- 操作区 -->
    <div class="w-full h-16 bg-white flex justify-end items-center px-4 gap-2">
      <!-- 更多操作按钮 -->
      <div class="relative" ref="moreActionsRef">
        <button
          @click="toggleMoreActions"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 group"
          title="更多操作"
        >
          <MoreHorizontal
            class="w-5 h-5 text-gray-600 group-hover:text-gray-800"
          />
        </button>

        <!-- 更多操作菜单 -->
        <div
          v-if="showMoreActions"
          class="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50"
        >
          <button
            @click="handleMenuAction('copy-link')"
            class="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
          >
            <Link class="w-4 h-4" />
            拷贝链接
          </button>
          <button
            @click="handleMenuAction('move-to')"
            class="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
          >
            <ArrowRight class="w-4 h-4" />
            移动到
          </button>
          <button
            @click="handleMenuAction('move-to-trash')"
            class="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
          >
            <Trash class="w-4 h-4" />
            移至垃圾桶
          </button>
          <button
            @click="handleMenuAction('edit-suggestion')"
            class="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
          >
            <Edit class="w-4 h-4" />
            编辑建议
          </button>
          <button
            @click="handleMenuAction('translate')"
            class="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
          >
            <Languages class="w-4 h-4" />
            翻译
          </button>
          <div class="border-t border-gray-100 my-1"></div>
          <button
            @click="handleMenuAction('import')"
            class="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
          >
            <Upload class="w-4 h-4" />
            导入
          </button>
          <button
            @click="handleMenuAction('export')"
            class="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
          >
            <Download class="w-4 h-4" />
            导出
          </button>
        </div>
      </div>
    </div>
    <!-- 封面图预留区 -->
    <div class="max-w-3xl w-full h-full flex flex-col pt-12">
      <!-- 标题区域 -->
      <div class="w-full h-14 border-b border-gray-200" v-if="noteInfo">
        <input
          type="text"
          v-model="noteInfo.title"
          placeholder="请输入笔记标题"
          class="w-full h-full bg-transparent outline-none text-2xl font-bold pl-2"
          @blur="handleUpdateNoteItem(noteInfo.id, 'title', noteInfo.title)"
        />
      </div>
      <!-- 编辑器区域 -->
      <div
        class="max-w-3xl min-h-[100vh] flex-1"
        ref="containerRef"
        id="editorjs"
      ></div>
    </div>
    <!-- 底部预留区 -->
    <div class="w-full h-[30vh] bg-green-200"></div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, nextTick } from 'vue';
import { useNotes } from '../hooks/useNotes';
import { useEditorJs } from '../hooks/useEdjtorJs';
import type { NoteContent } from '@customTypes/models/note.types';
import {
  Trash2,
  Download,
  MoreHorizontal,
  FileText,
  Globe,
  FileDown,
  Link,
  Plus,
  ArrowRight,
  Trash,
  Type,
  Maximize,
  Settings,
  Lock,
  Edit,
  Languages,
  Upload,
  RefreshCw,
  BarChart3,
  History,
  Bell,
  Star,
  ExternalLink,
} from 'lucide-vue-next';

const props = defineProps<{
  noteId: string;
}>();

const emit = defineEmits<{
  (e: 'update-note-item', noteId: string, key: string, value: any): void;
  (e: 'delete-note', noteId: string): void;
}>();

const { getNoteById, updateContent } = useNotes();

const { editor, containerRef, initEditor, noteContent, noteInfo, saveEditor } =
  useEditorJs({
    onSave: async (data: NoteContent) => {
      await updateContent(noteInfo.value.id, data);
    },
  });

// 下拉菜单状态
const showExportDropdown = ref(false);
const showMoreActions = ref(false);
const exportDropdownRef = ref<HTMLElement>();
const moreActionsRef = ref<HTMLElement>();

// 切换导出下拉菜单
const toggleExportDropdown = () => {
  showExportDropdown.value = !showExportDropdown.value;
  showMoreActions.value = false; // 关闭其他菜单
};

// 切换更多操作菜单
const toggleMoreActions = () => {
  showMoreActions.value = !showMoreActions.value;
  showExportDropdown.value = false; // 关闭其他菜单
};

// 处理删除
const handleDelete = () => {
  if (confirm('确定要删除这篇笔记吗？')) {
    emit('delete-note', props.noteId);
  }
};

// 处理导出
const handleExport = (format: 'markdown' | 'html' | 'pdf') => {
  console.log(`导出为 ${format}`);
  // TODO: 实现具体的导出逻辑
  showExportDropdown.value = false;
};

// 处理菜单操作
const handleMenuAction = (action: string) => {
  console.log(`执行操作: ${action}`);
  // TODO: 实现具体的菜单操作逻辑
  showMoreActions.value = false;
};

// 点击外部关闭菜单
const handleClickOutside = (event: MouseEvent) => {
  if (
    exportDropdownRef.value &&
    !exportDropdownRef.value.contains(event.target as Node)
  ) {
    showExportDropdown.value = false;
  }
  if (
    moreActionsRef.value &&
    !moreActionsRef.value.contains(event.target as Node)
  ) {
    showMoreActions.value = false;
  }
};

const changeNotePage = async (noteId: string) => {
  if (editor) {
    editor.destroy();
  }
  const res = await getNoteById(noteId);
  if (res) {
    noteContent.value = res.content;
    noteInfo.value = res;
    console.log('noteInfo', noteInfo.value);
    initEditor();
  } else {
    console.error('笔记不存在');
  }
};

const handleUpdateNoteItem = (noteId: string, key: string, value: any) => {
  emit('update-note-item', noteId, key, value);
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(async () => {
  document.removeEventListener('click', handleClickOutside);
  await saveEditor();
  if (editor) {
    editor.destroy();
  }
  // TODO: 保存笔记, 记录到最近打开队列中
});

defineExpose({
  changeNotePage,
});
</script>
<style lang="scss" scoped></style>
