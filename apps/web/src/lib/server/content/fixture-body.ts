import type {
  CodeBlock,
  FigureBlock,
  HtmlBlock,
  Media,
  Post as PayloadPost,
} from 'cms-types'

// Builders for Lexical rich text in the shape Payload stores it

type RichText = PayloadPost['body']
type Node = RichText['root']['children'][number]

const element = (type: string, children: Node[], fields = {}): Node => ({
  type,
  version: 1,
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  ...fields,
})

const root = (children: Node[]): RichText => ({
  root: { ...element('root', children), type: 'root' } as RichText['root'],
})

const formats = {
  bold: 1,
  italic: 2,
  code: 16,
}

type Inline = string | Node

const text = (content: string, ...format: (keyof typeof formats)[]): Node => ({
  type: 'text',
  version: 1,
  text: content,
  format: format.reduce((flags, name) => flags | formats[name], 0),
  detail: 0,
  mode: 'normal',
  style: '',
})

const inline = (children: Inline[]) =>
  children.map((child) => (typeof child === 'string' ? text(child) : child))

const paragraph = (...children: Inline[]) =>
  element('paragraph', inline(children), { textFormat: 0, textStyle: '' })

const heading = (tag: 'h3' | 'h4', content: string) =>
  element('heading', [text(content)], { tag })

const quote = (...children: Inline[]) => element('quote', inline(children))

const link = (url: string, content: string, newTab = false) =>
  element('link', [text(content)], {
    fields: { linkType: 'custom', url, newTab },
  })

const listItem = (value: number, ...children: Inline[]) =>
  element('listitem', inline(children), { value })

const list = (listType: 'bullet' | 'number', items: Node[]) =>
  element('list', items, {
    listType,
    tag: listType === 'bullet' ? 'ul' : 'ol',
    start: 1,
  })

let blockId = 0

const block = (
  fields:
    Omit<CodeBlock, 'id'> | Omit<FigureBlock, 'id'> | Omit<HtmlBlock, 'id'>,
): Node => ({
  type: 'block',
  version: 2,
  format: '',
  fields: { id: `fixture-block-${++blockId}`, blockName: '', ...fields },
})

/** A body of plain paragraphs */
export const paragraphs = (...texts: string[]) =>
  root(texts.map((content) => paragraph(content)))

const media = (
  id: number,
  filename: string,
  width: number,
  height: number,
): Media => ({
  id,
  alt: '',
  filename,
  mimeType: filename.endsWith('.png') ? 'image/png' : 'image/jpeg',
  width,
  height,
  filesize: width * height,
  url: `/api/media/file/${filename}`,
  createdAt: '2023-11-01T08:00:00.000Z',
  updatedAt: '2023-11-01T08:00:00.000Z',
})

/** Every block type and the common inline formatting, in one body */
export const everyBlockBody = root([
  paragraph(
    'A progress bar needs ',
    text('no', 'italic'),
    ' JavaScript, ',
    text('just', 'bold'),
    ' a ',
    text('conic-gradient()', 'code'),
    ' and a custom property. ',
    link(
      'https://developer.mozilla.org/en-US/docs/Web/CSS/conic-gradient',
      'MDN',
    ),
    ' has the details.',
  ),
  heading('h3', 'The markup'),
  block({
    blockType: 'code',
    language: 'html',
    code: '<div class="progress" style="--value: 42">\n  <span>42%</span>\n</div>\n',
  }),
  heading('h3', 'The CSS'),
  block({
    blockType: 'code',
    language: 'css',
    code: [
      '.progress {',
      '  /* Fill the circle up to --value */',
      '  background: conic-gradient(hsl(12, 85%, 40%) calc(var(--value) * 1%), #333 0);',
      '  border-radius: 50%;',
      '}',
    ].join('\n'),
  }),
  block({
    blockType: 'code',
    language: 'javascript',
    code: "const bar = document.querySelector('.progress')\nbar.style.setProperty('--value', 84)",
  }),
  block({
    blockType: 'code',
    language: 'text',
    code: 'No highlighting <here>',
  }),
  block({
    blockType: 'figure',
    image: media(1, 'progress-bar.png', 1600, 900),
    alt: 'A circular progress bar at 42 percent',
    caption: root([
      paragraph(
        'The finished bar, as seen on ',
        link('https://codepen.io/frippz', 'CodePen'),
      ),
    ]),
    link: 'https://codepen.io/frippz',
  }),
  block({
    blockType: 'figure',
    image: media(2, 'progress-bar-small.jpg', 400, 400),
    alt: 'The same bar at a smaller size',
  }),
  heading('h4', 'Browser support'),
  list('bullet', [
    listItem(1, 'Chrome'),
    listItem(2, 'Firefox'),
    listItem(
      3,
      list('number', [listItem(1, 'Desktop'), listItem(2, 'Android')]),
    ),
    listItem(3, 'Safari'),
  ]),
  quote('Support is not a binary choice.'),
  block({
    blockType: 'html',
    html: '<table class="fixture-html-block"><tr><td>Raw HTML</td></tr></table>',
  }),
])
