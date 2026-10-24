const entities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
}

/** Safe in text and in double-quoted attributes */
export const escapeHtml = (text: string) =>
  text.replace(/[&<>"]/g, (char) => entities[char])
