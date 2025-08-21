import { ref, onMounted, onUnmounted, computed } from 'vue';
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
import { debounce } from 'lodash';

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

export function useMuya(handleSelectionChange: (selection: string) => void) {
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
    const selectionChange = debounce((changes: any) => {
      const res = getSelectionRange();
      if (res) {
        handleSelectionChange(res);
      }
    }, 100);
    editor.on('selection-change', selectionChange);
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

  const getSelectionRange = () => {
    const selection = muya?.editor.selection;
    if (selection.type == 'Range') {
      const focus = selection.focus.offset;
      const anchor = selection.anchor.offset;
      const st = focus > anchor ? anchor : focus;
      const ed = focus > anchor ? focus : anchor;
      console.log(selection.focusBlock._text, st, ed);
      const content = selection.focusBlock._text.slice(st, ed);
      return content;
    }
    return '';
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
