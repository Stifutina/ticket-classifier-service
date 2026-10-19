// Card titles are made with plain rules, not with a text-generation model:
// a small model on a CPU invented facts and was slow, so we only clean up the customer's own words.

const GREETING = /^(?:hi|hello|hey|hiya|dear [\w .'-]{1,30}|good (?:morning|afternoon|evening))\b[\s,!.:-]*/i
const FILLER = /^(?:(?:pls|plz|please|um+|uh+|so|well|ok(?:ay)?|btw|hmm+)\b[\s,!.:-]*)+/i
const MAX_WORDS = 9
const MIN_WORDS = 3

const words = (text: string) => text.split(' ').filter(Boolean)

export function makeTitle(raw: string): string {
  let text = raw.replace(/\s+/g, ' ').trim()
  text = text.replace(GREETING, '').replace(FILLER, '')
  text = text.replace(/\?{2,}/g, '?').replace(/!{2,}/g, '!')

  // Break into short fragments (sentences, then clauses) and take fragments until there are enough words.
  const fragments = text
    .split(/(?<=[.!?])\s+/)
    .flatMap((sentence) => sentence.split(/\s*[,;:]\s+|\s+[-–—]\s+/))
    .filter(Boolean)

  let title = ''
  for (const fragment of fragments) {
    title = title ? `${title}, ${fragment}` : fragment
    if (words(title).length >= MIN_WORDS) break
  }

  let list = words(title)
  let truncated = false
  if (list.length > MAX_WORDS) {
    list = list.slice(0, MAX_WORDS)
    truncated = true
  }
  title = list.join(' ').replace(/[\s.,;:!-]+$/, '')
  if (!/[\p{L}\p{N}]/u.test(title)) return 'Untitled message'
  title = title[0].toUpperCase() + title.slice(1)
  return truncated ? `${title}…` : title
}
