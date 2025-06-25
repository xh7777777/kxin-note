import { ref } from 'vue';
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
  const editorRef = ref<InstanceType<typeof Muya>>();
  const init = (markdown: string) => {
    const editor = new Muya(containerRef.value, {
      markdown,
    });
    console.log('editor', editor, containerRef.value);
    editor.locale(zh);
    editor.init();
    editorRef.value = editor;
  };

  const clear = () => {
    editorRef.value?.destroy();
    editorRef.value = null;
  };
  return {
    Muya,
    containerRef,
    init,
    editorRef,
    clear,
  };
}
