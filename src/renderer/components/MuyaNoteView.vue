<template>
  <!-- <div ref="editorContainer" class="editor-container"></div> -->
  <div
    class="w-full h-full flex justify-center items-center flex-col relative bg-white overflow-auto p-8 scrollbar-hide flex-1"
  >
    <!-- 操作区 -->
    <NoteActionHeader
      :note-id="props.currentNote.id"
      @move-to="handleMoveToAction"
      @move-to-trash="handleMoveToTrashAction"
      @translate="handleTranslateAction"
      @export-markdown="handleExportMarkdownAction"
      @export-html="handleExportHtmlAction"
    />

    <!-- 封面图预留区 -->
    <div class="max-w-3xl w-full h-full flex flex-col pt-8">
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
import { INote } from '@customTypes/models/note.types';
import { useMuya } from '@renderer/hooks/useMuya';
import NoteActionHeader from './NoteComponent/NoteActionHeader.vue';

const {
  containerRef,
  init,
  clear,
  registerIpcListeners,
  unregisterIpcListeners,
} = useMuya();

const props = defineProps<{
  currentNote: INote;
}>();

const emit = defineEmits<{
  (e: 'update-note-item', noteId: string, key: string, value: any): void;
  (e: 'delete-note', noteId: string): void;
  (e: 'move-to-trash', noteId: string): void;
  (e: 'move-to', noteId: string): void;
  (e: 'translate', noteId: string): void;
  (e: 'export-markdown', noteId: string): void;
  (e: 'export-html', noteId: string): void;
}>();

// 处理从NoteActionHeader传递过来的事件
const handleMoveToAction = (noteId: string) => {
  emit('move-to', noteId);
};

const handleMoveToTrashAction = (noteId: string) => {
  emit('move-to-trash', noteId);
};

const handleTranslateAction = (noteId: string) => {
  emit('translate', noteId);
};

const handleExportMarkdownAction = (noteId: string) => {
  emit('export-markdown', noteId);
};

const handleExportHtmlAction = (noteId: string) => {
  emit('export-html', noteId);
};

onMounted(() => {
  init(props.currentNote.metadata.content || '');
  registerIpcListeners();
});

onUnmounted(async () => {
  // TODO: 保存笔记, 记录到最近打开队列中
  console.log('onUnmounted');
  unregisterIpcListeners();
});

defineExpose({});
</script>

<style lang="scss" scoped></style>
