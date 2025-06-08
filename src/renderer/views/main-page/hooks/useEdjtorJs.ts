import { ref } from 'vue';
import EditorJS from '@editorjs/editorjs';
import { NoteContent } from '@common/models/note.types';

const editorBaseConfig = {};

const editorJs = new EditorJS(editorBaseConfig);

function useEditorJs() {
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
        console.log('Editor.js is ready to work!');
        renderEditor();
      },
      onChange: () => {
        console.log('Editor.js content changed!');
      },
    });
  };

  const saveEditor = () => {
    if (readOnly.value) {
      return;
    }
    saveLoading.value = true;
    editor
      .save()
      .then(outputData => {
        noteContent.value = outputData;
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        saveLoading.value = false;
      });
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
    initEditor,
    saveEditor,
    renderEditor,
  };
}

export { useEditorJs };
