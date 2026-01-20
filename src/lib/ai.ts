import { getChunks } from '@/db/dal'
import { createServerFn } from '@tanstack/react-start'
import { extractInlineCitations, naiveRetrieveFromChunks } from './rag-utils'
import { openai } from '@ai-sdk/openai'
import { generateText, Output } from 'ai'
import * as z from 'zod'

const AnswerSchema = z.object({
  answer: z.string(),
  citations: z.array(z.number()),
})

export const askAI = createServerFn({ method: 'POST' })
  .inputValidator((reqModel: { kbid: string; question: string }) => reqModel)
  .handler(async ({ data: request }) => {
    const { kbid, question } = request
    const chunks = await getChunks({ data: { kbid } })
    const matches = naiveRetrieveFromChunks(chunks, question, 3)
    const THRESHOLD = 1
    const topScore = matches[0]?.score ?? 0
    if (matches.length === 0 || topScore < THRESHOLD) {
      return {
        answer: 'I couldn’t find relevant information in the knowledge base.',
        citations: [],
        sources: [],
        meta: { topScore },
      }
    }
    const sources = matches.map((m) => ({
      index: m.chunkIndex,
      text: m.text,
      score: m.score,
    }))
    const contextBlock = sources
      .map((s) => `[${s.index}] ${s.text}`)
      .join('\n\n')
    const { output } = await generateText({
      model: openai('gpt-4o'),
      system:
        'Answer ONLY using the provided context. Dont fomat the text. Stick to ONLY the question asked. DONT give additional information from the context. If insufficient, say you don’t know. Every factual claim must include citations like [0], [1]. Only cite indices that exist in the context.',
      output: Output.object({ schema: AnswerSchema }),
      prompt: `Question: ${question}\n\nContext:\n${contextBlock}\n`,
    })
    const allowed = new Set(sources.map((s) => s.index))
    const schemaCitations = output.citations.filter((c) => allowed.has(c))
    const inlineCitations = extractInlineCitations(output.answer).filter((c) =>
      allowed.has(c),
    )
    const citations = (
      inlineCitations.length > 0 ? inlineCitations : schemaCitations
    )
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .sort((a, b) => a - b)
    if (citations.length === 0) {
      return {
        answer:
          'I couldn’t produce a grounded answer from the provided sources.',
        citations: [],
        sources,
        meta: { topScore },
      }
    }
    return {
      answer: output.answer,
      citations,
      sources,
      meta: { topScore },
    }
  })
