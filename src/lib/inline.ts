/**
 * A deliberately tiny inline-markdown renderer.
 *
 * The track summaries use only **bold** and *italic* emphasis, so we don't need
 * a full markdown engine (and its dependencies). This escapes HTML first, then
 * turns `**x**` into <strong> and `*x*` into <em>.
 */

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Render a single line of inline markdown to safe HTML. */
export function renderInline(text: string): string {
  let html = escapeHtml(text);
  // Bold first (double asterisks), then italic (single asterisk).
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return html;
}

/**
 * Render a summary block into paragraph HTML. Blank lines separate paragraphs;
 * single line breaks within a paragraph are treated as spaces.
 */
export function renderSummary(summary: string): string {
  return summary
    .split(/\n{2,}/)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para) => `<p>${renderInline(para.replace(/\s*\n\s*/g, ' '))}</p>`)
    .join('\n');
}
