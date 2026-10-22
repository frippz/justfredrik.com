import type { CodeBlock, FigureBlock, HtmlBlock, Post } from 'cms-types'
import { postPath } from '#lib/posts'
import type { Post as ContentPost } from '#lib/server/content'
import { renderCode } from './code'
import { escapeHtml } from './escape'
import { renderFigure } from './figure'

/** A Lexical document, as Payload stores rich text */
export type RichText = Post['body']

type Block = CodeBlock | FigureBlock | HtmlBlock

/** The Lexical nodes Payload's default editor features produce */
interface Node {
  type: string
  children?: Node[]
  [field: string]: unknown
}

interface TextNode extends Node {
  text: string
  format: number
}

interface LinkNode extends Node {
  fields: {
    linkType?: 'custom' | 'internal'
    url?: string
    newTab?: boolean
    doc?: { relationTo: string; value: unknown }
  }
}

// Lexical's text format flags, wrapped innermost first
const textFormats: [flag: number, tag: string][] = [
  [16, 'code'],
  [32, 'sub'],
  [64, 'sup'],
  [4, 's'],
  [8, 'u'],
  [2, 'em'],
  [1, 'strong'],
]

function renderText({ text, format }: TextNode) {
  let html = escapeHtml(text)
  for (const [flag, tag] of textFormats) {
    if (format & flag) html = `<${tag}>${html}</${tag}>`
  }
  return html
}

function linkHref({ fields }: LinkNode) {
  if (fields.linkType === 'internal') {
    const value = fields.doc?.value as Post | undefined
    if (fields.doc?.relationTo !== 'posts' || typeof value !== 'object') {
      throw new Error('Internal links must point to a populated Post')
    }
    return postPath({ publishedAt: value.publishedAt!, slug: value.slug! })
  }
  return fields.url ?? ''
}

function renderLink(node: LinkNode, children: string) {
  const target = node.fields.newTab
    ? ' target="_blank" rel="noopener noreferrer"'
    : ''
  return `<a href="${escapeHtml(linkHref(node))}"${target}>${children}</a>`
}

/** kramdown's automatic header ids, which frippz.se's headings had */
const headingId = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N} -]/gu, '')
    .replace(/ /g, '-')

const textContent = (node: Node): string =>
  node.type === 'text'
    ? (node as TextNode).text
    : (node.children ?? []).map(textContent).join('')

async function renderList(node: Node) {
  const tag = node.tag === 'ol' ? 'ol' : 'ul'
  const start = tag === 'ol' && node.start !== 1 ? ` start="${node.start}"` : ''
  const items: string[] = []

  for (const item of node.children ?? []) {
    const children = item.children ?? []
    // Lexical puts a nested list in an item of its own, after its parent item
    if (children.length > 0 && children.every(({ type }) => type === 'list')) {
      const nested = await renderChildren(item)
      const last = items.pop() ?? '<li></li>'
      items.push(last.replace(/<\/li>$/, `${nested}</li>`))
      continue
    }
    const checkbox =
      node.listType === 'check'
        ? `<input type="checkbox" disabled${item.checked ? ' checked' : ''}> `
        : ''
    items.push(`<li>${checkbox}${await renderChildren(item)}</li>`)
  }

  return `<${tag}${start}>${items.join('')}</${tag}>`
}

async function renderBlock(block: Block) {
  switch (block.blockType) {
    case 'code':
      return renderCode(block)
    case 'figure':
      return renderFigure(block, await renderRichText(block.caption, true))
    case 'html':
      return block.html
  }
}

async function renderNode(node: Node): Promise<string> {
  switch (node.type) {
    case 'text':
      return renderText(node as TextNode)
    case 'linebreak':
      return '<br>'
    case 'tab':
      return '\t'
    case 'paragraph': {
      const children = await renderChildren(node)
      return children ? `<p>${children}</p>` : ''
    }
    case 'heading': {
      const tag = String(node.tag)
      const id = headingId(textContent(node))
      return `<${tag} id="${escapeHtml(id)}">${await renderChildren(node)}</${tag}>`
    }
    case 'quote':
      return `<blockquote><p>${await renderChildren(node)}</p></blockquote>`
    case 'list':
      return renderList(node)
    case 'link':
    case 'autolink':
      return renderLink(node as LinkNode, await renderChildren(node))
    case 'horizontalrule':
      return '<hr>'
    case 'block':
      return renderBlock(node.fields as Block)
    default:
      // A build that drops content silently is worse than one that fails
      throw new Error(`Can't render Lexical node of type "${node.type}"`)
  }
}

async function renderChildren(node: Node) {
  const children = await Promise.all((node.children ?? []).map(renderNode))
  return children.join('')
}

/**
 * Lexical rich text as HTML. `inline` drops the paragraphs around the text,
 * as frippz.se did for Figure captions.
 */
export async function renderRichText(
  richText: RichText | null | undefined,
  inline = false,
) {
  if (!richText) return ''
  const blocks = await Promise.all(
    richText.root.children.map((node) =>
      inline && node.type === 'paragraph'
        ? renderChildren(node)
        : renderNode(node),
    ),
  )
  return blocks.filter(Boolean).join(inline ? ' ' : '\n\n')
}

/** A Post with its body rendered, ready for a page */
export type RenderedPost = Omit<ContentPost, 'body'> & { html: string }

export async function renderPost({
  body,
  ...post
}: ContentPost): Promise<RenderedPost> {
  return { ...post, html: await renderRichText(body) }
}
