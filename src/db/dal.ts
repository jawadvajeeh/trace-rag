import { createServerFn } from '@tanstack/react-start'
import { db } from './drizzle'
import { chunksTable, knowledgeBasesTable } from './schema'
import { asc, eq } from 'drizzle-orm'

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
