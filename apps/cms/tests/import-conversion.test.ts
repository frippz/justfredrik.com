import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parse as parseYaml } from 'yaml'
import {
  convertPosts,
  rawBlocks,
  type ImportedPost,
  type Node,
} from '../src/import/convert'
import { frippzDir, readPosts } from '../src/import/source'

// Seam C: the import conversion, run over the real frippz.se Posts. They live
// in a sibling checkout, so CI, which has none, skips these.

const hasSource = fs.existsSync(frippzDir)

const files = hasSource ? await readPosts() : []
const posts = hasSource ? convertPosts(files) : []
const pairs = files.map((file, index) => ({ file, post: posts[index] }))

const nodes = (node: Node): Node[] => [
  node,
  ...(node.children ?? []).flatMap(nodes),
]

const blocks = (post: ImportedPost, blockType: string) =>
  nodes(post.body.root)
    .filter((node) => node.type === 'block')
    .map((node) => node.fields as Record<string, unknown>)
    .filter((fields) => fields.blockType === blockType)

/** Every string in a value, however deeply nested */
const strings = (value: unknown): string[] =>
  typeof value === 'string'
    ? [value]
    : value && typeof value === 'object'
      ? Object.values(value).flatMap(strings)
      : []

const frontMatter = (source: string) =>
  parseYaml(/^---\n([\s\S]*?)\n---\n/.exec(source)![1]) as {
    date?: string
    updated?: string
    tags?: string[]
  }

const postPath = (post: ImportedPost) =>
  `/${post.publishedAt.slice(0, 10).replaceAll('-', '/')}/${post.slug}/`

describe.skipIf(!hasSource)('Converting the frippz.se Posts', () => {
  it('converts all 43 Posts', () => {
    expect(posts).toHaveLength(43)
  })

  it('leaves no Liquid, except as literal text from raw blocks', () => {
    for (const { file, post } of pairs) {
      const raw = rawBlocks(file.source)
      for (const text of strings(post.body)) {
        for (const [liquid] of text.matchAll(/\{%.*?%\}|\{\{.*?\}\}/g)) {
          expect(
            raw.some((block) => block.includes(liquid)),
            `${file.name}: ${liquid}`,
          ).toBe(true)
        }
      }
    }
  })

  it('turns every image include into a Figure', () => {
    for (const { file, post } of pairs) {
      const includes = file.source.match(/\{%\s*include image\.html/g) ?? []
      const figures = blocks(post, 'figure')

      expect(figures, file.name).toHaveLength(includes.length)
      for (const figure of figures) {
        expect(figure.image).toEqual(expect.any(String))
        expect(figure.alt).toEqual(expect.any(String))
        expect(post.images.has(figure.image as string)).toBe(true)
      }
    }
  })

  it('makes every post_url a path to an imported Post', () => {
    const paths = new Set(posts.map(postPath))
    const postUrls = files.flatMap(
      ({ source }) => source.match(/\{%\s*post_url /g) ?? [],
    )
    const links = posts.flatMap((post) =>
      nodes(post.body.root)
        .filter((node) => node.type === 'link')
        .map((node) => (node.fields as { url: string }).url)
        .filter((url) => /^\/\d{4}\//.test(url)),
    )

    expect(links.length).toBeGreaterThanOrEqual(postUrls.length)
    for (const url of links) expect(paths).toContain(url)
  })

  it('takes the publish date from the front-matter date, or else the filename', () => {
    for (const { file, post } of pairs) {
      const { date } = frontMatter(file.source)
      const expected = date
        ? String(date).replace(' ', 'T')
        : `${file.name.slice(0, 10)}T00:00`

      expect(post.publishedAt.slice(0, 10), file.name).toBe(
        file.name.slice(0, 10),
      )
      if (!/[+-]\d{4}$/.test(String(date))) {
        expect(post.publishedAt, file.name).toMatch(new RegExp(`^${expected}`))
      }
    }

    const byName = (name: string) =>
      pairs.find(({ file }) => file.name === name)!.post

    // Its `published` key is ignored
    expect(byName('2014-12-05-finally').publishedAt).toBe(
      '2014-12-05T00:00:00.000Z',
    )
    // A date with an offset
    expect(byName('2017-05-18-getting-json-feed-in-jekyll').publishedAt).toBe(
      '2017-05-18T08:30:00.000Z',
    )
  })

  it('takes the updated date from the front matter', () => {
    for (const { file, post } of pairs) {
      const { updated } = frontMatter(file.source)
      expect(post.revisedAt, file.name).toBe(
        updated
          ? new Date(`${String(updated).replace(' ', 'T')}Z`).toISOString()
          : undefined,
      )
    }
  })

  it('takes the slug from the filename', () => {
    for (const { file, post } of pairs) {
      expect(`${file.name.slice(0, 11)}${post.slug}`).toBe(file.name)
    }
  })

  it('keeps the Tags of each Post', () => {
    for (const { file, post } of pairs) {
      const tags = (frontMatter(file.source).tags ?? []).map((tag) =>
        tag.trim(),
      )
      expect(post.tags, file.name).toEqual(tags)
    }
    expect(new Set(posts.flatMap((post) => post.tags)).size).toBe(41)
  })
})
