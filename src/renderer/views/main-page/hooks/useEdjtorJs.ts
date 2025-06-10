import { ref } from 'vue';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';
import Quote from '@editorjs/quote';
import Delimiter from '@editorjs/delimiter';
import EditorjsList from '@editorjs/list';
import Undo from 'editorjs-undo';
import { NoteContent, NotePage } from '@common/models/note.types';

const editorBaseConfig = {
  tools: {
    header: Header,
    paragraph: {
      class: Paragraph,
      inlineToolbar: true,
      config: {
        placeholder: '/输入快捷指令，alt+k唤起AI功能',
      },
    },
    quote: {
      class: Quote,
      inlineToolbar: true,
      shortcut: 'CMD+SHIFT+O',
      config: {
        quotePlaceholder: '输入快捷指令，alt+q唤起AI功能',
        captionPlaceholder: '输入快捷指令，alt+c唤起AI功能',
      },
    },
    delimiter: {
      class: Delimiter,
      inlineToolbar: true,
      config: {
        styleOptions: ['star', 'dash', 'line'],
        defaultStyle: 'star',
        lineWidthOptions: [8, 15, 25, 35, 50, 60, 100],
        defaultLineWidth: 25,
        lineThicknessOptions: [1, 2, 3, 4, 5, 6],
        defaultLineThickness: 2,
      },
    },
    list: {
      class: EditorjsList,
      inlineToolbar: true,
      config: {
        defaultStyle: 'unordered',
      },
    },
  },
};

function useEditorJs() {
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
        console.log('Editor.js is ready to work!');
        renderEditor();
        new Undo({ editor });
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
        console.log('saveEditor', outputData);
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
    noteInfo,
    initEditor,
    saveEditor,
    renderEditor,
  };
}

export { useEditorJs };
