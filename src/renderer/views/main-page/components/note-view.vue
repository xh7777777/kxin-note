<template>
  <div ref="editorContainer" class="editor-container"></div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import EditorJS from '@editorjs/editorjs';

const editor = ref<EditorJS | null>(null);

onMounted(() => {
  editor.value = new EditorJS({});
});
</script>
<style lang="scss" scoped></style>
