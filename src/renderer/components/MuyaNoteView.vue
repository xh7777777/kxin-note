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
import { ref, onMounted, onUnmounted } from 'vue';
import {
  MoreHorizontal,
  Link,
  ArrowRight,
  Trash,
  Edit,
  Languages,
  Upload,
} from 'lucide-vue-next';
import {
  CodeBlockLanguageSelector,
  EmojiSelector,
  ImageResizeBar,
  ImageToolBar,
  InlineFormatToolbar,
  MarkdownToHtml,
  Muya,
  ParagraphFrontButton,
  ParagraphFrontMenu,
  ParagraphQuickInsertMenu,
  PreviewToolBar,
  TableColumnToolbar,
  TableDragBar,
  TableRowColumMenu,
  zh,
} from '@muyajs/core';

Muya.use(EmojiSelector);
Muya.use(InlineFormatToolbar);
Muya.use(ImageToolBar);
Muya.use(ImageResizeBar);
Muya.use(CodeBlockLanguageSelector);

Muya.use(ParagraphFrontButton);
Muya.use(ParagraphFrontMenu);
Muya.use(TableColumnToolbar);
Muya.use(ParagraphQuickInsertMenu);
Muya.use(TableDragBar);
Muya.use(TableRowColumMenu);
Muya.use(PreviewToolBar);

import '@muyajs/core/lib/style.css';

const containerRef = ref<HTMLElement>();

const props = defineProps<{
  noteId: string;
}>();

const emit = defineEmits<{
  (e: 'update-note-item', noteId: string, key: string, value: any): void;
  (e: 'delete-note', noteId: string): void;
  (e: 'move-to-trash', noteId: string): void;
}>();

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
  switch (action) {
    case 'move-to-trash':
      emit('move-to-trash', props.noteId);
      break;
    default:
      break;
  }
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

const changeNotePage = async (noteId: string) => {};

const handleUpdateNoteItem = (noteId: string, key: string, value: any) => {
  emit('update-note-item', noteId, key, value);
};

onMounted(() => {
  try {
    const muya = new Muya(containerRef.value, {
      markdown: 'Hello world',
    });

    muya.locale(zh);

    muya.init();
  } catch (error) {
    console.error(error);
  }
});

onUnmounted(async () => {
  // TODO: 保存笔记, 记录到最近打开队列中
});

defineExpose({
  changeNotePage,
});
</script>
<style lang="scss" scoped></style>
