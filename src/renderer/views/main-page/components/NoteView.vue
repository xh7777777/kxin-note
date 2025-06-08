<template>
  <!-- <div ref="editorContainer" class="editor-container"></div> -->
  <div class="w-full h-full flex justify-center items-center flex-col relative">
    <div class="max-w-3xl w-3xl h-full bg-blue-200"></div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { useNotes } from '../hooks/useNotes';
import EditorJS from '@editorjs/editorjs';
import type { NoteContent } from '@common/models/note.types';

const props = defineProps<{
  noteId: string;
}>();

const { getNoteById } = useNotes();

const note = ref<NoteContent | null>(null);

const editor = ref<EditorJS | null>(null);

watch(
  () => props.noteId,
  async newVal => {
    if (newVal) {
      const res = await getNoteById(newVal);
      if (res) {
        note.value = res.content;
      }
    }
  }
);

onMounted(() => {
  editor.value = new EditorJS({});
});

onUnmounted(() => {
  editor.value?.destroy();
  // TODO: 保存笔记, 记录到最近打开队列中
});
</script>
<style lang="scss" scoped></style>
