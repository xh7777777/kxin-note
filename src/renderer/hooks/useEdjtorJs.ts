import { ref } from 'vue';
import EditorJS from '@editorjs/editorjs';
import Undo from 'editorjs-undo';
import { NoteContent, NotePage } from '@common/models/note.types';
import { debounce } from 'lodash';
import { editorBaseConfig } from '../utils/editorjs';

export interface UseEditorJsProps {
  onSave: (data: NoteContent) => Promise<void>;
  onReady?: () => void;
}

function useEditorJs({ onSave, onReady }: UseEditorJsProps) {
  const noteInfo = ref<NotePage | null>(null);
  const noteContent = ref<NoteContent | null>(null);
  const containerRef = ref<HTMLDivElement | null>(null);
  const readOnly = ref(false);
  const saveLoading = ref(false);

  let editor = null;
  const initEditor = () => {
    editor = new EditorJS({
      ...editorBaseConfig,
      holder: containerRef.value,
      data: noteContent.value || { blocks: [] },
      onReady: () => {
        renderEditor();
        new Undo({ editor });
        onReady?.();
      },
      onChange: debounce(() => {
        saveEditor();
      }, 2000),
    });
  };

  const saveEditor = async () => {
    if (readOnly.value || !editor) {
      return;
    }
    saveLoading.value = true;
    try {
      const outputData = await editor.save();
      console.log('saveEditor', outputData);
      await onSave(outputData);
    } catch (err) {
      console.error(err);
    } finally {
      saveLoading.value = false;
    }
  };

  const renderEditor = () => {
    if (!noteContent.value) {
      return;
    }
    if (typeof noteContent.value === 'string') {
      editor.blocks.renderFromHTML(noteContent.value);
    } else {
      editor.blocks.render(noteContent.value);
    }
  };

  return {
    editor,
    containerRef,
    readOnly,
    noteContent,
    saveLoading,
    noteInfo,
    initEditor,
    saveEditor,
    renderEditor,
  };
}

export { useEditorJs };
