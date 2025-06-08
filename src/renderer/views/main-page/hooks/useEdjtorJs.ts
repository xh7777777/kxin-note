import { ref } from 'vue';
import EditorJS from '@editorjs/editorjs';

function useEditorJs() {
  const editor = ref<EditorJS | null>(null);

  return { editor };
}

export { useEditorJs };
