import type {
  Blockquote,
  Code,
  Html,
  List,
  Nodes,
  Paragraph,
  PhrasingContent,
  RootContent,
} from 'mdast'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { parse as parseYaml } from 'yaml'
import { languages } from '../blocks/Code'

// Converts frippz.se's Jekyll Posts into Payload-ready data. Jekyll ran Liquid
// before kramdown, so the Liquid is resolved first and the Markdown parsed
// after. The import is one-off: this module goes when it has run.

/** One file from frippz.se's `_posts` */
export interface SourcePost {
  /** The filename without `.md`, such as `2014-12-05-finally` */
  name: string
  source: string
}

/** A Lexical node, in the shape Payload stores rich text */
export interface Node {
  type: string
  version: number
  children?: Node[]
  [field: string]: unknown
}

export interface RichText {
  root: Node
}

export interface ImportedPost {
  slug: string
  title: string
  description: string
  publishedAt: string
  revisedAt?: string
  /** Tag names */
  tags: string[]
  /**
   * Figure blocks hold their image's source URL in `image`, and HTML blocks and
   * Figure links may point at images too: the import swaps in the uploads
   */
  body: RichText
  /** Every image the body uses, by source URL, with alt text for Media */
  images: Map<string, string>
}

// --- Front matter and dates ---------------------------------------------------

interface FrontMatter {
  title: string
  description: string
  date?: string
  updated?: string
  tags?: string[]
}

function splitFrontMatter({ name, source }: SourcePost) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(source)
  if (!match) throw new Error(`${name} has no front matter`)
  return {
    frontMatter: parseYaml(match[1]) as FrontMatter,
    markdown: source.slice(match[0].length),
  }
}

/**
 * `2017-05-18 09:30:00 +0100` or `2019-09-05 11:55` as an ISO date. Dates
 * without an offset are UTC, as Jekyll built frippz.se.
 */
function toIsoDate(value: unknown) {
  const match =
    /^(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}:\d{2})(:\d{2})?)?(?:\s*([+-]\d{2}):?(\d{2}))?$/.exec(
      String(value).trim(),
    )
  if (!match) throw new Error(`Can't read the date "${value}"`)
  const [, day, time = '00:00', seconds = ':00', hours, minutes] = match
  const offset = hours ? `${hours}:${minutes}` : 'Z'
  return new Date(`${day}T${time}${seconds}${offset}`).toISOString()
}

const filenameDate = (name: string) => name.slice(0, 10)
const filenameSlug = (name: string) => name.slice(11)

/**
 * Publish date from the front-matter `date`, otherwise from the filename.
 * `published` is ignored: Jekyll read it as a boolean, not a date.
 */
const publishDate = (name: string, frontMatter: FrontMatter) =>
  toIsoDate(frontMatter.date ?? filenameDate(name))

/** `/:year/:month/:day/:slug/`, as the site builds it */
const postPath = (publishedAt: string, slug: string) =>
  `/${publishedAt.slice(0, 10).replaceAll('-', '/')}/${slug}/`

// --- Liquid ---------------------------------------------------------------------

/** The attributes of one `{% include image.html %}` */
type ImageInclude = Record<string, string>

const rawPattern = /\{%-?\s*raw\s*-?%\}([\s\S]*?)\{%-?\s*endraw\s*-?%\}/g

/** The content of each `{% raw %}` block in a Post, for checking leftovers */
export const rawBlocks = (source: string) =>
  [...source.matchAll(rawPattern)].map((match) => match[1])

/** Marks where a Figure goes, as an HTML comment the Markdown parser keeps */
const figureMarker = (index: number) => `<!--figure:${index}-->`
const figureMarkerPattern = /<!--figure:(\d+)-->/g

/**
 * The Markdown Jekyll would have handed kramdown: Liquid resolved, raw blocks
 * kept literally, and image includes swapped for Figure markers
 */
function resolveLiquid(
  markdown: string,
  resolvePostUrl: (name: string) => string,
) {
  const includes: ImageInclude[] = []

  const resolve = (text: string) => {
    const resolved = text
      .replace(
        /\{%-?\s*include\s+image\.html\s+([\s\S]*?)-?%\}/g,
        (_, args) => {
          const attributes = Object.fromEntries(
            [...String(args).matchAll(/(\w+)="([^"]*)"/g)].map(([, k, v]) => [
              k,
              v,
            ]),
          )
          return figureMarker(includes.push(attributes) - 1)
        },
      )
      .replace(/\{%-?\s*post_url\s+(\S+)\s*-?%\}/g, (_, name) =>
        resolvePostUrl(name),
      )
      // frippz.se had no base URL
      .replace(/\{\{-?\s*site\.baseurl\s*-?\}\}/g, '')

    // Anything else would have rendered as something only Jekyll knew
    const leftover = /\{%|\{\{/.exec(resolved)
    if (leftover) {
      throw new Error(
        `Unsupported Liquid near "${resolved.slice(leftover.index, leftover.index + 40)}"`,
      )
    }
    return resolved
  }

  let resolved = ''
  let last = 0
  for (const match of markdown.matchAll(rawPattern)) {
    resolved += resolve(markdown.slice(last, match.index)) + match[1]
    last = match.index + match[0].length
  }
  resolved += resolve(markdown.slice(last))

  return { markdown: resolved, includes }
}

/**
 * kramdown ends an HTML block at its closing tag, while CommonMark runs it on
 * to the next blank line, swallowing Markdown that follows straight after
 */
function endHtmlBlocks(markdown: string) {
  let fence: string | undefined
  return markdown
    .split('\n')
    .map((line, index, lines) => {
      const marker = /^(```|~~~)/.exec(line)?.[1]
      if (marker && (!fence || marker === fence)) {
        fence = fence ? undefined : marker
      }
      const next = lines[index + 1]
      return !fence && /^<\/[a-z]+>\s*$/.test(line) && next?.trim()
        ? `${line}\n`
        : line
    })
    .join('\n')
}

// --- Typography -------------------------------------------------------------------

/**
 * kramdown's smart quotes and typographic symbols, which frippz.se's text was
 * rendered with. `before` is the character preceding `text` in its block.
 */
function smarten(text: string, before: string) {
  return text.replace(/---|--|\.\.\.|['"]/g, (match, offset: number) => {
    if (match === '---') return '—'
    if (match === '--') return '–'
    if (match === '...') return '…'
    const previous = offset > 0 ? text[offset - 1] : before
    const next = text[offset + match.length] ?? ''
    // '90s and the like
    if (match === "'" && /\s/.test(previous) && /\d/.test(next)) return '’'
    const opening = previous === '' || /[\s([{—–-]/.test(previous)
    if (match === "'") return opening ? '‘' : '’'
    return opening ? '“' : '”'
  })
}

/** Tracks the last character written in a block, for `smarten` */
interface TextState {
  before: string
}

function smartText(value: string, state: TextState) {
  const text = smarten(value.replace(/\n/g, ' '), state.before)
  state.before = text.at(-1) ?? state.before
  return text
}

// --- Markdown to HTML, for HTML blocks ---------------------------------------------

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/** Tags kramdown kept as HTML inside a paragraph; others it showed as text */
const spanTags = new Set(['a', 'abbr', 'em', 'strong', 'code', 'kbd', 'br'])

const isSpanHtml = (html: string) =>
  spanTags.has(/^<\/?([a-z]+)/i.exec(html)?.[1]?.toLowerCase() ?? '')

function phrasingToHtml(node: PhrasingContent, state: TextState): string {
  switch (node.type) {
    case 'text':
      return escapeHtml(smartText(node.value, state))
    case 'emphasis':
      return `<em>${inlineHtml(node.children, state)}</em>`
    case 'strong':
      return `<strong>${inlineHtml(node.children, state)}</strong>`
    case 'inlineCode':
      state.before = node.value.at(-1) ?? state.before
      return `<code>${escapeHtml(node.value)}</code>`
    case 'link':
      return `<a href="${escapeHtml(node.url)}">${inlineHtml(node.children, state)}</a>`
    case 'break':
      return '<br>'
    case 'html':
      return isSpanHtml(node.value)
        ? node.value
        : escapeHtml(smartText(node.value, state))
    default:
      throw new Error(`Can't convert inline Markdown "${node.type}" to HTML`)
  }
}

const inlineHtml = (nodes: PhrasingContent[], state: TextState) =>
  nodes.map((node) => phrasingToHtml(node, state)).join('')

function flowToHtml(node: RootContent): string {
  switch (node.type) {
    case 'paragraph':
      return `<p>${inlineHtml(node.children, { before: '' })}</p>`
    case 'blockquote':
      return `<blockquote>\n${node.children.map(flowToHtml).join('\n')}\n</blockquote>`
    case 'list': {
      const tag = node.ordered ? 'ol' : 'ul'
      const items = node.children.map(
        (item) => `<li>${item.children.map(flowToHtml).join('\n')}</li>`,
      )
      return `<${tag}>\n${items.join('\n')}\n</${tag}>`
    }
    case 'html':
      return node.value
    default:
      throw new Error(`Can't convert Markdown "${node.type}" to HTML`)
  }
}

// --- Markdown to Lexical -------------------------------------------------------------

// Lexical's text format flags
const bold = 1
const italic = 2
const code = 16

const element = (type: string, children: Node[], fields = {}): Node => ({
  type,
  version: 1,
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  ...fields,
})

const textNode = (text: string, format: number): Node => ({
  type: 'text',
  version: 1,
  text,
  format,
  detail: 0,
  mode: 'normal',
  style: '',
})

const paragraphNode = (children: Node[]) =>
  element('paragraph', children, { textFormat: 0, textStyle: '' })

const root = (children: Node[]): RichText => ({
  root: element('root', children),
})

function inlineNodes(
  nodes: PhrasingContent[],
  state: TextState,
  format = 0,
): Node[] {
  return nodes.flatMap((node): Node[] => {
    switch (node.type) {
      case 'text':
        return [textNode(smartText(node.value, state), format)]
      case 'emphasis':
        return inlineNodes(node.children, state, format | italic)
      case 'strong':
        return inlineNodes(node.children, state, format | bold)
      case 'inlineCode':
        state.before = node.value.at(-1) ?? state.before
        return [textNode(node.value, format | code)]
      case 'link':
        return [
          element('link', inlineNodes(node.children, state, format), {
            fields: { linkType: 'custom', url: node.url, newTab: false },
          }),
        ]
      case 'break':
        return [{ type: 'linebreak', version: 1 }]
      default:
        throw new Error(`Can't convert inline Markdown "${node.type}"`)
    }
  })
}

const hasHtml = (node: Nodes): boolean =>
  node.type === 'html' ||
  ('children' in node && node.children.some((child) => hasHtml(child)))

/** Whether a node needs an HTML block, because Lexical can't hold it */
function needsHtml(node: RootContent) {
  if (node.type === 'blockquote') {
    // A Lexical quote holds a single paragraph
    const [first, ...rest] = node.children
    return first?.type !== 'paragraph' || rest.length > 0 || hasHtml(node)
  }
  return (node.type === 'paragraph' || node.type === 'list') && hasHtml(node)
}

function listNode(list: List): Node {
  const items: Node[] = []
  let value = list.start ?? 1

  for (const item of list.children) {
    const [first, ...rest] = item.children
    if (
      first?.type !== 'paragraph' ||
      rest.some(({ type }) => type !== 'list')
    ) {
      throw new Error('List items must be a paragraph and nested lists')
    }
    items.push(
      element('listitem', inlineNodes(first.children, { before: '' }), {
        value,
      }),
    )
    // Lexical puts a nested list in an item of its own, after its parent item
    for (const nested of rest as List[]) {
      items.push(element('listitem', [listNode(nested)], { value: value + 1 }))
    }
    value++
  }

  return element('list', items, {
    listType: list.ordered ? 'number' : 'bullet',
    tag: list.ordered ? 'ol' : 'ul',
    start: list.start ?? 1,
  })
}

/** Shiki IDs for the fence languages frippz.se used */
function codeLanguage({ lang }: Code) {
  const language = lang ?? 'text'
  if (!(languages as readonly string[]).includes(language)) {
    throw new Error(`Unsupported code language "${language}"`)
  }
  return language
}

/** Alt text for images frippz.se showed without any */
const missingAlt: Record<string, string> = {
  '/images/basic-focus-links.gif':
    'Focusing links in a paragraph of black text: each focused link turns white on black',
  '/images/themed-focus-links.gif':
    'Focusing links in six boxes of different colours: each focused link swaps its text and background colours',
  '/images/pe-nut.jpeg':
    'A peanut M&M cut open, labelled content for the peanut, presentation for the chocolate and client-side scripting for the candy shell',
}

const plainText = (markdown: string) =>
  markdown.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*_`]/g, '')

/** The largest image of a `srcset`, since the site makes its own widths */
function largestImage({ url, srcset }: ImageInclude) {
  if (!srcset) return url
  const candidates = srcset.split(',').map((candidate) => {
    const [src, width] = candidate.trim().split(/\s+/)
    return { src, width: parseInt(width, 10) }
  })
  return candidates.reduce((a, b) => (b.width > a.width ? b : a)).src
}

/** Image sources in an HTML string that point at frippz.se's `/images/` */
const localImages = (html: string) =>
  [...html.matchAll(/(?<=(?:src|href)=")\/images\/[^"]+/g)].map(([src]) => src)

class BodyConverter {
  images = new Map<string, string>()
  private blockCount = 0

  constructor(
    private slug: string,
    private includes: ImageInclude[],
  ) {}

  private block(fields: Record<string, unknown>): Node {
    return {
      type: 'block',
      version: 2,
      format: '',
      fields: {
        id: `${this.slug}-${++this.blockCount}`,
        blockName: '',
        ...fields,
      },
    }
  }

  private addImage(src: string, alt: string) {
    if (!this.images.get(src)) this.images.set(src, alt)
  }

  private htmlBlock(html: string) {
    for (const src of localImages(html)) {
      this.addImage(src, missingAlt[src] ?? '')
    }
    return this.block({ blockType: 'html', html })
  }

  private figure(include: ImageInclude) {
    const image = largestImage(include)
    const caption = include.caption
    const alt =
      include.alt ??
      (caption ? plainText(caption) : undefined) ??
      missingAlt[include.url]
    if (!alt) throw new Error(`No alt text for ${include.url}`)

    this.addImage(image, alt)
    if (include.link?.startsWith('/images/')) this.addImage(include.link, alt)

    const captionNodes = caption
      ? (fromMarkdown(caption).children[0] as Paragraph).children
      : []

    return this.block({
      blockType: 'figure',
      image,
      alt,
      caption: caption
        ? root([paragraphNode(inlineNodes(captionNodes, { before: '' }))])
        : undefined,
      link: include.link,
    })
  }

  /** An HTML node, split around any Figures inside it */
  private html({ value }: Html): Node[] {
    const nodes: Node[] = []
    let last = 0
    for (const match of value.matchAll(figureMarkerPattern)) {
      const before = value.slice(last, match.index).trim()
      if (before) nodes.push(this.htmlBlock(before))
      nodes.push(this.figure(this.includes[Number(match[1])]))
      last = match.index + match[0].length
    }
    const after = value.slice(last).trim()
    if (after) nodes.push(this.htmlBlock(after))
    return nodes
  }

  convert(node: RootContent): Node[] {
    if (needsHtml(node)) return [this.htmlBlock(flowToHtml(node))]

    switch (node.type) {
      case 'paragraph':
        return [paragraphNode(inlineNodes(node.children, { before: '' }))]
      case 'heading':
        return [
          element('heading', inlineNodes(node.children, { before: '' }), {
            tag: `h${node.depth}`,
          }),
        ]
      case 'blockquote':
        return [this.quote(node)]
      case 'list':
        return [listNode(node)]
      case 'code':
        return [
          this.block({
            blockType: 'code',
            language: codeLanguage(node),
            code: node.value,
          }),
        ]
      case 'thematicBreak':
        return [{ type: 'horizontalrule', version: 1 }]
      case 'html':
        return this.html(node)
      default:
        throw new Error(`Can't convert Markdown "${node.type}"`)
    }
  }

  private quote({ children: [paragraph] }: Blockquote) {
    return element(
      'quote',
      inlineNodes((paragraph as Paragraph).children, { before: '' }),
    )
  }
}

// --- Posts ---------------------------------------------------------------------------

/**
 * Every Post converted, with links between them resolved through each other's
 * publish dates
 */
export function convertPosts(files: SourcePost[]): ImportedPost[] {
  const parsed = files.map((file) => {
    const { frontMatter, markdown } = splitFrontMatter(file)
    return {
      name: file.name,
      frontMatter,
      markdown,
      slug: filenameSlug(file.name),
      publishedAt: publishDate(file.name, frontMatter),
    }
  })

  const paths = new Map(
    parsed.map(({ name, slug, publishedAt }) => [
      name,
      postPath(publishedAt, slug),
    ]),
  )
  const resolvePostUrl = (name: string) => {
    const path = paths.get(name)
    if (!path) throw new Error(`post_url to a missing Post: ${name}`)
    return path
  }

  return parsed.map(({ name, frontMatter, markdown, slug, publishedAt }) => {
    const { markdown: resolved, includes } = resolveLiquid(
      markdown,
      resolvePostUrl,
    )
    const converter = new BodyConverter(slug, includes)
    let children: Node[]
    try {
      children = fromMarkdown(endHtmlBlocks(resolved)).children.flatMap(
        (node) => converter.convert(node),
      )
    } catch (error) {
      throw new Error(`${name}: ${(error as Error).message}`, { cause: error })
    }

    return {
      slug,
      title: frontMatter.title,
      description: frontMatter.description,
      publishedAt,
      revisedAt: frontMatter.updated
        ? toIsoDate(frontMatter.updated)
        : undefined,
      tags: [...new Set((frontMatter.tags ?? []).map((tag) => tag.trim()))],
      body: root(children),
      images: converter.images,
    }
  })
}
