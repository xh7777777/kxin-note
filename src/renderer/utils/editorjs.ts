import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';
import Quote from '@editorjs/quote';
import Delimiter from '@editorjs/delimiter';
import EditorjsList from '@editorjs/list';
import AttachesTool from '@editorjs/attaches';

/**
 * 编辑器基础配置
 * @description 编辑器基础配置，包括工具栏、快捷键、配置等
 */

export const editorBaseConfig = {
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
    attaches: {
      class: AttachesTool,
      inlineToolbar: true,
      config: {
        uploader: {
          uploadByFile: true,
        },
      },
    },
  },
};
