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
import { eventBus, EventBusKey } from '../utils/eventBus';

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
  let removeSaveListener: (() => void) | null = null;

  const init = (markdown: string) => {
    const editor = new Muya(containerRef.value, {
      markdown: markdown || '',
    });
    editor.locale(zh);
    editor.init();
    editor.on('selection-change', (changes: any) => {
      console.log('selection-change', changes);
    });
    editor.on('json-change', handleContentChange);
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

  const handleEditorSave = async () => {
    try {
      if (!muya) {
        throw new Error('Muya is not initialized');
      }
      eventBus.emit(EventBusKey.EditorSave, muya.getMarkdown());
    } catch (error) {
      console.error('Save operation failed:', error);
    }
  };

  // 注册 IPC 监听器
  const registerIpcListeners = () => {
    if (window.editorAPI) {
      removeUndoListener = window.editorAPI.onUndo(handleEditorUndo);
      removeRedoListener = window.editorAPI.onRedo(handleEditorRedo);
      removeSaveListener = window.editorAPI.onSave(handleEditorSave);
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

    if (removeSaveListener) {
      removeSaveListener();
      removeSaveListener = null;
    }
  };

  const handleContentChange = (changes: any) => {
    if (!muya) {
      throw new Error('Muya is not initialized');
    }
    const currentMarkdown = muya.getMarkdown();
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
