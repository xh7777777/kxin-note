<template>
  <!-- <div ref="editorContainer" class="editor-container"></div> -->
  <div class="w-full h-full flex justify-center items-center flex-col relative">
    <!-- 标题区域 -->
    <div class="w-full h-10 bg-red-200" v-if="noteInfo">
      <input type="text" v-model="noteInfo.title" />
    </div>
    <!-- 编辑器区域 -->
    <div
      class="max-w-3xl w-3xl h-full bg-blue-200"
      ref="containerRef"
      id="editorjs"
    ></div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { useNotes } from '../hooks/useNotes';
import { useEditorJs } from '../hooks/useEdjtorJs';
import type { NoteContent } from '@common/models/note.types';

const props = defineProps<{
  noteId: string;
}>();

const { getNoteById } = useNotes();

const { editor, containerRef, initEditor, noteContent, noteInfo } =
  useEditorJs();

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

onMounted(() => {});

onUnmounted(() => {
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
