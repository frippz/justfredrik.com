import type { CodeBlock } from 'cms-types'
import { createHighlighter, type ThemedToken } from 'shiki'
import { escapeHtml } from './escape'
import { frippzTheme } from './theme'

type Language = CodeBlock['language']

const highlightedLanguages = [
  'bash',
  'css',
  'html',
  'javascript',
  'json',
  'liquid',
  'markdown',
  'svelte',
  'typescript',
  'yaml',
] as const satisfies Exclude<Language, 'text'>[]

let highlighter: ReturnType<typeof createHighlighter> | undefined

function getHighlighter() {
  highlighter ??= createHighlighter({
    themes: [frippzTheme],
    langs: [...highlightedLanguages],
  })
  return highlighter
}

// Shiki's FontStyle flags
const italic = 1
const bold = 2
const underline = 4

function renderToken({ content, color, fontStyle = 0 }: ThemedToken) {
  const styles = []
  // Tokens in the default colour inherit `--code-color` from the stylesheet
  if (color && color.toLowerCase() !== frippzTheme.fg) {
    styles.push(`color:${color}`)
  }
  if (fontStyle & italic) styles.push('font-style:italic')
  if (fontStyle & bold) styles.push('font-weight:bold')
  if (fontStyle & underline) styles.push('text-decoration:underline')

  const text = escapeHtml(content)
  return styles.length
    ? `<span style="${styles.join(';')}">${text}</span>`
    : text
}

/**
 * A Code block in the markup Jekyll and Rouge gave frippz.se, highlighted by
 * Shiki. The line numbers are empty spans that CSS counters number.
 */
export async function renderCode({ language, code }: CodeBlock) {
  const source = code.replace(/\n+$/, '')
  const lines =
    language === 'text'
      ? source.split('\n').map(escapeHtml)
      : (await getHighlighter())
          .codeToTokensBase(source, { lang: language, theme: frippzTheme })
          .map((line) => line.map(renderToken).join(''))

  const className = language === 'text' ? 'plaintext' : language
  const lineNumbers = '<span></span>'.repeat(lines.length)

  return (
    `<div class="language-${className} highlighter-rouge"><div class="highlight">` +
    `<pre class="highlight"><code>${lines.join('\n')}\n</code>` +
    `<span class="ln" aria-hidden="true">${lineNumbers}</span></pre>` +
    `</div></div>`
  )
}
