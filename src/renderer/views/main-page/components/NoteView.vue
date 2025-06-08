<template>
  <!-- <div ref="editorContainer" class="editor-container"></div> -->
  <div class="w-full h-full flex justify-center items-center flex-col relative">
    <!-- 笔记信息区域 -->
    <!-- 封面图预留区 -->
    <div class="w-full h-64 bg-blue-500"></div>
    <div class="max-w-3xl w-3xl h-full flex flex-col">
      <!-- 标题区域 -->
      <div class="w-full h-12 bg-red-200" v-if="noteInfo">
        <input
          type="text"
          v-model="noteInfo.title"
          placeholder="请输入笔记标题"
          class="w-full h-full bg-transparent outline-none text-2xl font-bold pl-2"
        />
      </div>
      <!-- 编辑器区域 -->
      <div
        class="max-w-3xl w-3xl min-h-[100vh] bg-blue-200 flex-1"
        ref="containerRef"
        id="editorjs"
      ></div>
    </div>
    <!-- 底部预留区 -->
    <div class="w-full h-[30vh] bg-green-200"></div>
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
