export type ChunkRecord = {
  chunkIndex: number
  text: string
}

export type Match = {
  chunkIndex: number
  score: number
  text: string
  snippet: string
}

export function normalize(s: string) {
  return s.toLowerCase().trim()
}

export function extractKeywords(question: string) {
  const stop = new Set([
    'the',
    'and',
    'is',
    'to',
    'of',
    'in',
    'a',
    'an',
    'for',
    'on',
    'with',
    'do',
    'does',
  ])
  return normalize(question)
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !stop.has(w))
}

export function findScoreOfChunk(
  chunk: string,
  keywords: string[],
  options: { earlyWindowTokens: number; earlyBonus: number } = {
    earlyBonus: 0.5,
    earlyWindowTokens: 40,
  },
) {
  let score = 0
  const { earlyWindowTokens, earlyBonus } = options

  const tokens = chunk.toLowerCase().match(/[a-z0-9']+/g) ?? []
  if (tokens.length === 0) return 0

  const freq = new Map()
  for (const t of tokens) freq.set(t, (freq.get(t) ?? 0) + 1)

  const earlySet = new Set(tokens.slice(0, earlyWindowTokens))

  for (const kw of keywords) {
    const count = freq.get(kw) ?? 0
    if (count === 0) continue

    score += count // term frequency

    if (earlySet.has(kw)) {
      score += earlyBonus // early match matters a bit more
    }
  }

  return score
}

export function naiveRetrieveFromChunks(
  chunks: ChunkRecord[],
  question: string,
  k = 3,
): Match[] {
  const keywords = extractKeywords(question)
  if (keywords.length === 0) return []

  const scored = chunks.map((c) => {
    const textNorm = normalize(c.text)
    const score = findScoreOfChunk(textNorm, keywords)

    return {
      chunkIndex: c.chunkIndex,
      score,
      text: c.text,
      snippet: c.text.slice(0, 220),
    }
  })

  return scored
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score || a.chunkIndex - b.chunkIndex)
    .slice(0, k)
}

export function extractInlineCitations(answer: string) {
  const found = new Set<number>()
  const re = /\[(\d+)\]/g
  let m: RegExpExecArray | null
  while ((m = re.exec(answer)) !== null) found.add(Number(m[1]))
  return [...found].sort((a, b) => a - b)
}

export function chunkByParagraph(rawText: string): string[] {
  // Normalize newlines and split on blank lines (one or more)
  return rawText
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n+/g)
    .map((p) => p.trim())
    .filter(Boolean)
}
