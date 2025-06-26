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

export const DEFAULT_MARKDOWN = `---
title: muya
author: jocs
---

# Inline Format

**strong** *emphasis* \`inline code\` &gt; <u>underline</u> <mark>highlight</mark> <ruby>北京<rt>Beijing</rt></ruby> [Baidu](http://www.baidu.com) H0~2~ X^5^

GitHub and Extra
Inline format
===

:man:  ~~del~~ http://google.com $a \\ne b$

# Line Break

soft line break
hard line break  
line end

    const a = "nice"
    function add(){}

\`\`\`
const b = "foo"
\`\`\`

\`\`\`math
a \\ne b
\`\`\`

\`\`\`mermaid
mindmap
  root((mindmap))
    Origins
      Long history
      ::icon(fa fa-book)
      Popularisation
        British popular psychology author Tony Buzan
    Research
      On effectiveness<br/>and features
      On Automatic creation
        Uses
            Creative techniques
            Strategic planning
            Argument mapping
    Tools
      Pen and paper
      Mermaid
\`\`\`

\`\`\`vega-lite
{
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "description": "A basic bar chart example, with value labels shown upon pointer hover.",
  "width": 400,
  "height": 200,
  "padding": 5,

  "data": [
    {
      "name": "table",
      "values": [
        {"category": "A", "amount": 28},
        {"category": "B", "amount": 55},
        {"category": "C", "amount": 43},
        {"category": "D", "amount": 91},
        {"category": "E", "amount": 81},
        {"category": "F", "amount": 53},
        {"category": "G", "amount": 19},
        {"category": "H", "amount": 87}
      ]
    }
  ],

  "signals": [
    {
      "name": "tooltip",
      "value": {},
      "on": [
        {"events": "rect:pointerover", "update": "datum"},
        {"events": "rect:pointerout",  "update": "{}"}
      ]
    }
  ],

  "scales": [
    {
      "name": "xscale",
      "type": "band",
      "domain": {"data": "table", "field": "category"},
      "range": "width",
      "padding": 0.05,
      "round": true
    },
    {
      "name": "yscale",
      "domain": {"data": "table", "field": "amount"},
      "nice": true,
      "range": "height"
    }
  ],

  "axes": [
    { "orient": "bottom", "scale": "xscale" },
    { "orient": "left", "scale": "yscale" }
  ],

  "marks": [
    {
      "type": "rect",
      "from": {"data":"table"},
      "encode": {
        "enter": {
          "x": {"scale": "xscale", "field": "category"},
          "width": {"scale": "xscale", "band": 1},
          "y": {"scale": "yscale", "field": "amount"},
          "y2": {"scale": "yscale", "value": 0}
        },
        "update": {
          "fill": {"value": "steelblue"}
        },
        "hover": {
          "fill": {"value": "red"}
        }
      }
    },
    {
      "type": "text",
      "encode": {
        "enter": {
          "align": {"value": "center"},
          "baseline": {"value": "bottom"},
          "fill": {"value": "#333"}
        },
        "update": {
          "x": {"scale": "xscale", "signal": "tooltip.category", "band": 0.5},
          "y": {"scale": "yscale", "signal": "tooltip.amount", "offset": -2},
          "text": {"signal": "tooltip.amount"},
          "fillOpacity": [
            {"test": "datum === tooltip", "value": 0},
            {"value": 1}
          ]
        }
      }
    }
  ]
}
\`\`\`

\`\`\`plantuml
@startuml
Alice -> Bob: Authentication Request
Bob --> Alice: Authentication Response
@enduml
\`\`\`

\`\`\`javascript
const foo = \`bar\`
\`\`\`

$$
a \\ne b
$$

<div>
foo bar
</div>

| foo | bar     |
| ---:| ------- |
| zar | foo\\|bar |

0. foo
   bar
- foo bar1
  
  foo bar2

- [ ] a
- [x] b
- [ ] c
- [ ] d

---

> foo
> bar

![](https://jingan2.guankou.net/haopic/jj20/389023/010323033238341796.jpg)IMAGE`;

export function useMuya() {
  const containerRef = ref<HTMLElement>();
  let muya: InstanceType<typeof Muya> | null = null;
  const init = (markdown: string) => {
    const editor = new Muya(containerRef.value, {
      markdown: DEFAULT_MARKDOWN,
    });
    editor.locale(zh);
    editor.init();
    muya = editor;
  };

  const clear = () => {
    muya?.destroy();
    muya = null;
  };

  const keyDownCallback = (e: KeyboardEvent) => {
    try {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          muya?.redo();
        } else {
          muya?.undo();
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const registerKeyDownEvent = () => {
    document.addEventListener('keydown', keyDownCallback);
  };

  const unregisterKeyDownEvent = () => {
    document.removeEventListener('keydown', keyDownCallback);
  };

  return {
    Muya,
    containerRef,
    init,
    muya,
    clear,
    registerKeyDownEvent,
    unregisterKeyDownEvent,
  };
}
