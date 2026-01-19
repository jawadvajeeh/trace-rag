import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const knowledgeBasesTable = pgTable('knowledge_bases', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt')
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export const sourcesTable = pgTable('sources', {
  id: uuid('id').defaultRandom().primaryKey(),
  kb_id: uuid('kb_id').references(() => knowledgeBasesTable.id),
  rawText: text('rawText').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt')
    .defaultNow()
    .$onUpdate(() => new Date()),
})
export const chunksTable = pgTable('chunks', {
  id: uuid('id').defaultRandom().primaryKey(),
  kb_id: uuid('kb_id').references(() => knowledgeBasesTable.id),
  sources_id: uuid('sources_id').references(() => sourcesTable.id),
  chunkIndex: integer('chunkIndex').notNull(),
  text: text('text').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt')
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export type InsertKnowledgeBase = typeof knowledgeBasesTable.$inferInsert
export type SelectKnowledgeBase = typeof knowledgeBasesTable.$inferSelect

export type InsertSourcesTable = typeof sourcesTable.$inferInsert
export type SelectSourcesTable = typeof sourcesTable.$inferSelect

export type InsertChunksTable = typeof chunksTable.$inferInsert
export type SelectChunksTable = typeof chunksTable.$inferSelect
