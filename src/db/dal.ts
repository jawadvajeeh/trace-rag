import { createServerFn } from '@tanstack/react-start'
import { db } from './drizzle'
import { chunksTable, knowledgeBasesTable, sourcesTable } from './schema'
import { asc, eq } from 'drizzle-orm'
import { chunkByParagraph } from '@/lib/rag-utils'
import { notFound } from '@tanstack/react-router'

export const fetchKnowledgeBase = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const data = await db.select().from(knowledgeBasesTable)
      return data
    } catch (error) {
      throw toAppError(error, {
        code: 'FETCH_KNOWLEDGEBASES_FAILED',
        message: 'Failed to fetch knowledge',
        status: 500,
      })
    }
  },
)

export const getChunks = createServerFn({ method: 'GET' })
  .inputValidator((reqModel: { kbid: string }) => reqModel)
  .handler(async ({ data: request }) => {
    try {
      const data = await db
        .select({ chunkIndex: chunksTable.chunkIndex, text: chunksTable.text })
        .from(chunksTable)
        .where(eq(chunksTable.kb_id, request.kbid))
        .orderBy(asc(chunksTable.chunkIndex))
      return data
    } catch (error) {
      return []
      // throw toAppError(error, {
      //   code: 'FETCH_CHUNKS_FAILED',
      //   message: 'Failed to fetch chunks',
      //   status: 500,
      // })
    }
  })

export const saveSource = createServerFn({ method: 'POST' })
  .inputValidator((reqModel: { name: string; rawText: string }) => reqModel)
  .handler(async ({ data: request }) => {
    try {
      const { name, rawText } = request
      const paragraphs = chunkByParagraph(rawText)
      const result = await db.transaction(async (tx) => {
        const [kb] = await tx
          .insert(knowledgeBasesTable)
          .values({ name })
          .returning({ id: knowledgeBasesTable.id })
        const [src] = await tx
          .insert(sourcesTable)
          .values({ rawText, kb_id: kb.id })
          .returning({ id: sourcesTable.id })
        if (paragraphs.length > 0) {
          await tx.insert(chunksTable).values(
            paragraphs.map((text, i) => ({
              kb_id: kb.id,
              sources_id: src.id,
              chunkIndex: i,
              text,
            })),
          )
        }
        return {
          knowledgeBaseId: kb.id,
          sourceId: src.id,
          chunkCount: paragraphs.length,
        }
      })
      return result
    } catch (error) {
      throw toAppError(error, {
        code: 'SAVE_SOURCES_FAILED',
        message: 'Failed to save source',
        status: 500,
      })
    }
  })

export const getSourceByKBid = createServerFn({ method: 'GET' })
  .inputValidator((data: { kbid: string }) => data)
  .handler(async ({ data }) => {
    const sources = await db
      .select()
      .from(sourcesTable)
      .where(eq(sourcesTable.kb_id, data.kbid))
    if (sources.length === 0) {
      throw notFound()
    }
    return sources
  })
