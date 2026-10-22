import { postPath } from '#lib/posts'
import { everyBlockBody, paragraphs } from './fixture-body'
import type { ContentSource, Post, Tag } from './types'

type FixturePost = Post & { status: 'published' | 'draft' }

const tag = (name: string): Tag => ({
  name,
  slug: name.toLowerCase().replaceAll(' ', '-'),
})

const tags = {
  a11y: tag('a11y'),
  animation: tag('animation'),
  browserSupport: tag('browser support'),
  css: tag('css'),
  customProperties: tag('custom properties'),
  html: tag('html'),
  jsonFeed: tag('json feed'),
  progressiveEnhancement: tag('progressive enhancement'),
  rss: tag('rss'),
  viewTransitions: tag('view transitions'),
}

// Eleven published Posts, so pagination has a first, a middle and a last page,
// plus a Draft that must never show up anywhere. One Post has every body block.
// Tags are used by up to seven Posts, so the tag cloud has several sizes, and
// one Tag is used only by the Draft. One Post has an updated date.
const posts: FixturePost[] = [
  {
    status: 'published',
    title: 'Fixture: Focus styles that respect your brand',
    slug: 'focus-styles-that-respect-your-brand',
    description: 'Making keyboard focus visible without fighting the design.',
    publishedAt: '2024-03-14T08:00:00.000Z',
    body: paragraphs(
      'Making keyboard focus visible without fighting the design.',
    ),
    tags: [tags.a11y, tags.css],
  },
  {
    status: 'published',
    title: 'Fixture: A circular progress bar in plain CSS',
    slug: 'a-circular-progress-bar-in-plain-css',
    description: 'Conic gradients, custom properties and no JavaScript.',
    publishedAt: '2023-11-02T08:00:00.000Z',
    body: everyBlockBody,
    tags: [tags.css, tags.animation],
  },
  {
    status: 'draft',
    title: 'Fixture: Half-written thoughts on view transitions',
    slug: 'half-written-thoughts-on-view-transitions',
    description: 'This Draft must never be visible on the site.',
    publishedAt: '2024-05-01T08:00:00.000Z',
    body: paragraphs('This Draft must never be visible on the site.'),
    tags: [tags.viewTransitions, tags.css],
  },
  {
    status: 'published',
    title: 'Fixture: Dark mode with a single media query',
    slug: 'dark-mode-with-a-single-media-query',
    description: 'Swapping custom properties under prefers-color-scheme.',
    publishedAt: '2023-06-20T08:00:00.000Z',
    body: paragraphs('Swapping custom properties under prefers-color-scheme.'),
    tags: [tags.css, tags.customProperties],
  },
  {
    status: 'published',
    title: 'Fixture: The lobotomized owl, ten years later',
    slug: 'the-lobotomized-owl-ten-years-later',
    description: 'Is `* + *` still the best spacing reset around?',
    publishedAt: '2022-09-08T08:00:00.000Z',
    body: paragraphs('Is `* + *` still the best spacing reset around?'),
    tags: [tags.css],
  },
  {
    status: 'published',
    title: 'Fixture: Accessible footnotes',
    slug: 'accessible-footnotes',
    description: 'CSS counters and aria-describedby for footnotes.',
    publishedAt: '2021-01-17T08:00:00.000Z',
    body: paragraphs('CSS counters and aria-describedby for footnotes.'),
    tags: [tags.a11y, tags.html, tags.css],
  },
  {
    status: 'published',
    title: 'Fixture: Feeds are not dead',
    slug: 'feeds-are-not-dead',
    description: 'Why this blog still ships Atom and JSON Feed.',
    publishedAt: '2019-04-30T08:00:00.000Z',
    revisedAt: '2020-02-01T12:00:00.000Z',
    body: paragraphs('Why this blog still ships Atom and JSON Feed.'),
    tags: [tags.jsonFeed, tags.rss],
  },
  {
    status: 'published',
    title: 'Fixture: Skip links still matter',
    slug: 'skip-links-still-matter',
    description: 'The first focusable element on the page.',
    publishedAt: '2018-10-05T08:00:00.000Z',
    body: paragraphs('The first focusable element on the page.'),
    tags: [tags.a11y, tags.html],
  },
  {
    status: 'published',
    title: 'Fixture: Print stylesheets',
    slug: 'print-stylesheets',
    description: 'Paper is a medium too.',
    publishedAt: '2017-05-18T08:30:00.000Z',
    body: paragraphs('Paper is a medium too.'),
    tags: [tags.css],
  },
  {
    status: 'published',
    title: 'Fixture: On browser support',
    slug: 'on-browser-support',
    description: 'Support is not a binary choice.',
    publishedAt: '2015-12-07T08:00:00.000Z',
    body: paragraphs('Support is not a binary choice.'),
    tags: [tags.browserSupport, tags.progressiveEnhancement],
  },
  {
    status: 'published',
    title: 'Fixture: On styling your anchors',
    slug: 'on-styling-your-anchors',
    description: 'Links deserve more than an underline.',
    publishedAt: '2014-12-06T08:00:00.000Z',
    body: paragraphs('Links deserve more than an underline.'),
    tags: [tags.css, tags.a11y],
  },
  {
    status: 'published',
    title: 'Fixture: Hello again',
    slug: 'hello-again',
    description: 'The oldest fixture Post.',
    publishedAt: '2014-02-11T08:00:00.000Z',
    body: paragraphs('The oldest fixture Post.'),
    tags: [],
  },
]

export const fixtureSource: ContentSource = {
  async getPosts() {
    return posts
      .filter((post) => post.status === 'published')
      .map(({ status, ...post }) => post)
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  },

  async getPost({ year, month, day, slug }) {
    const path = `/${year}/${month}/${day}/${slug}/`
    return (await this.getPosts()).find((post) => postPath(post) === path)
  },
}
