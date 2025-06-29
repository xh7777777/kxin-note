import { ref, onMounted, onUnmounted } from 'vue';
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
import { INote } from '@customTypes/models/note.types';

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

export function useMuya() {
  const containerRef = ref<HTMLElement>();
  let muya: InstanceType<typeof Muya> | null = null;
  let removeUndoListener: (() => void) | null = null;
  let removeRedoListener: (() => void) | null = null;
  const init = (markdown: string) => {
    const editor = new Muya(containerRef.value, {
      markdown: markdown || '',
    });
    editor.locale(zh);
    editor.init();
    editor.on('content-change', handleContentChange);
    editor.on('selection-change', (changes: any) => {
      console.log('selection-change', changes);
    });
    // editor.on('json-change', (changes: any) => {
    //   console.log('json-change', changes);
    // });
    muya = editor;
  };

  const clear = () => {
    muya?.destroy();
    muya = null;
  };

  // IPC 消息处理函数
  const handleEditorUndo = () => {
    try {
      muya?.undo();
    } catch (error) {
      console.error('Undo operation failed:', error);
    }
  };

  const handleEditorRedo = () => {
    try {
      muya?.redo();
    } catch (error) {
      console.error('Redo operation failed:', error);
    }
  };

  // 注册 IPC 监听器
  const registerIpcListeners = () => {
    if (window.editorAPI) {
      removeUndoListener = window.editorAPI.onUndo(handleEditorUndo);
      removeRedoListener = window.editorAPI.onRedo(handleEditorRedo);
    }
  };

  // 移除 IPC 监听器
  const unregisterIpcListeners = () => {
    if (removeUndoListener) {
      removeUndoListener();
      removeUndoListener = null;
    }
    if (removeRedoListener) {
      removeRedoListener();
      removeRedoListener = null;
    }
  };

  const handleContentChange = (changes: any) => {
    if (!muya) {
      throw new Error('Muya is not initialized');
    }
    const currentMarkdown = muya.getMarkdown();
    console.log('handleContentChange', currentMarkdown);
  };

  return {
    Muya,
    containerRef,
    init,
    muya,
    clear,
    registerIpcListeners,
    unregisterIpcListeners,
  };
}
