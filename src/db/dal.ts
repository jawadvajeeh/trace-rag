import { createServerFn } from '@tanstack/react-start'
import { db } from './drizzle'
import { knowledgeBasesTable } from './schema'

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
