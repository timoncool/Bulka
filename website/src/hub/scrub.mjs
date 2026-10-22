// A failure reason made safe to send: what failed and why, without anything about the person. The same rules as
// studio-hub-client/src/scrub.rs: quoted text, paths, links, mail and network addresses, ids and long numbers are
// replaced by placeholders before the reason is stored or sent.

export const MAX_REASON = 200;

const RULES = [
  [/"[^"]*"|'[^'\n]*'|«[^»]*»|“[^”]*”|„[^“”]*[“”]/g, '"…"'],
  [/\b[a-z][a-z0-9+.-]*:\/\/\S+/gi, '<url>'],
  [/\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi, '<email>'],
  [/\b[a-z]:[\\/][^"'<>|:;,\n]*/gi, '<path>'],
  [/\\\\[^"'<>|:;,\n]+/g, '<path>'],
  [/(^|[\s(=])~?\/[^\s"'<>|:;,]+\/[^"'<>|:;,\n]*/g, '$1<path>'],
  [/\b\d{1,3}(?:\.\d{1,3}){3}(?::\d+)?\b/g, '<ip>'],
  [/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '<id>'],
  [/\b[0-9a-f]{12,}\b/gi, '<id>'],
  [/\b\d{6,}\b/g, '<n>'],
];

export function scrubReason(text) {
  // eslint-disable-next-line no-control-regex
  let out = String(text ?? '').replace(/[\u0000-\u001f\u007f-\u009f]/g, ' ');
  for (const [pattern, replacement] of RULES) out = out.replace(pattern, replacement);
  out = out.split(/\s+/).filter(Boolean).join(' ');
  if (out.length <= MAX_REASON) return out;
  let cut = '';
  for (const ch of out) {
    if (cut.length + ch.length > MAX_REASON - 1) break;
    cut += ch;
  }
  return cut + '…';
}
