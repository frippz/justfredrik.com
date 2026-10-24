import type { ThemeRegistration } from 'shiki'

/** `hsl(h, s%, l%)` as `#rrggbb`, since Shiki themes take hex colours */
function hsl(h: number, s: number, l: number) {
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100)
  const channel = (n: number) => {
    const k = (n + h / 30) % 12
    const value = l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return Math.round(value * 255)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${channel(0)}${channel(8)}${channel(4)}`
}

/**
 * frippz.se's code colours, from its Rouge/Pygments `syntax.css`, mapped onto
 * TextMate scopes. The comments name the Pygments class each colour came from.
 */
const colors = {
  /** `--code-color`, for anything without a colour of its own */
  foreground: hsl(33, 96, 78),
  /** `--code-background` in light mode; code blocks are always dark */
  background: hsl(0, 0, 15),
  comment: hsl(120, 14, 56), // .c, .cp
  keyword: hsl(44, 68, 81), // .k
  declaration: hsl(60, 100, 76), // .kd
  constant: hsl(0, 45, 75), // .kc
  operator: hsl(58, 52, 88), // .o
  punctuation: hsl(179, 40, 60), // .p
  number: hsl(183, 45, 69), // .m
  string: hsl(0, 36, 69), // .s
  tag: hsl(127, 25, 68), // .nt, .na
  builtin: hsl(60, 75, 75), // .nb, .nf, .nc
  namespace: hsl(204, 54, 72), // .nn
  name: hsl(60, 19, 83), // .n, .nv
  other: hsl(0, 0, 80), // .nx, .nl, .nd, .py
  entity: hsl(359, 35, 63), // .ni
  inserted: hsl(120, 100, 40), // .gi
  deleted: hsl(0, 100, 40), // .gd
  error: hsl(1, 67, 66), // .err
  errorBackground: hsl(0, 7, 22),
}

export const frippzTheme: ThemeRegistration = {
  name: 'frippz',
  type: 'dark',
  fg: colors.foreground,
  bg: colors.background,
  settings: [
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: colors.comment },
    },
    {
      scope: ['keyword', 'storage.modifier', 'keyword.control'],
      settings: { foreground: colors.keyword },
    },
    {
      scope: ['storage.type'],
      settings: { foreground: colors.declaration },
    },
    {
      scope: ['constant.language', 'variable.language'],
      settings: { foreground: colors.constant },
    },
    {
      scope: ['keyword.operator'],
      settings: { foreground: colors.operator },
    },
    {
      scope: ['punctuation', 'meta.brace'],
      settings: { foreground: colors.punctuation },
    },
    {
      scope: [
        'constant.numeric',
        'keyword.other.unit',
        'constant.other.color',
        'punctuation.definition.constant',
      ],
      settings: { foreground: colors.number },
    },
    {
      scope: ['string'],
      settings: { foreground: colors.string },
    },
    // Rouge leaves string delimiters (.dl) in the default code colour
    {
      scope: ['punctuation.definition.string'],
      settings: { foreground: colors.foreground },
    },
    {
      scope: [
        'entity.name.tag',
        'punctuation.definition.tag',
        'entity.other.attribute-name',
      ],
      settings: { foreground: colors.tag },
    },
    {
      scope: [
        'entity.name.function',
        'support.function',
        'support.class',
        'support.variable',
        'entity.name.type',
        'entity.name.class',
        'entity.other.attribute-name.class',
        'punctuation.definition.entity',
        'entity.name.command',
      ],
      settings: { foreground: colors.builtin },
    },
    {
      scope: ['entity.other.attribute-name.id'],
      settings: { foreground: colors.namespace },
    },
    {
      scope: [
        // Rouge colours CSS functions as plain names
        'source.css support.function',
        'support.constant.property-value',
        'support.constant.color',
        'variable.other.normal.shell',
        'variable.other.positional.shell',
      ],
      settings: { foreground: colors.name },
    },
    {
      scope: [
        'variable',
        'support.type.property-name',
        'entity.other.attribute-name.pseudo-class',
        'entity.other.attribute-name.pseudo-element',
      ],
      settings: { foreground: colors.other },
    },
    {
      scope: ['keyword.other.important'],
      settings: { foreground: colors.comment },
    },
    {
      scope: ['constant.character.entity'],
      settings: { foreground: colors.entity },
    },
    {
      scope: ['markup.heading'],
      settings: { foreground: colors.name, fontStyle: 'bold' },
    },
    {
      scope: ['markup.bold'],
      settings: { foreground: colors.other, fontStyle: 'bold' },
    },
    {
      scope: ['markup.italic'],
      settings: { foreground: colors.other, fontStyle: 'italic' },
    },
    {
      scope: ['markup.inserted'],
      settings: { foreground: colors.inserted },
    },
    {
      scope: ['markup.deleted'],
      settings: { foreground: colors.deleted },
    },
    {
      scope: ['invalid'],
      settings: {
        foreground: colors.error,
        background: colors.errorBackground,
      },
    },
  ],
}
