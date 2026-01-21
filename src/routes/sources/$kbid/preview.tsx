import { getSourceByKBid } from '@/db/dal'
import { createFileRoute } from '@tanstack/react-router'
import * as z from 'zod'

const previewChunkIndex = z.object({
  chunkIndex: z.number().optional(),
})

export const Route = createFileRoute('/sources/$kbid/preview')({
  component: RouteComponent,
  loader: ({ params }) => getSourceByKBid({ data: { kbid: params.kbid } }),
  validateSearch: previewChunkIndex,
})

function RouteComponent() {
  const kb = Route.useLoaderData()
  const { chunkIndex } = Route.useSearch()
  return (
    <main className="max-w-3xl mx-auto px-4 py-2">
      {kb.length > 0 && (
        <div>
          {kb.map((k) => {
            const paras = k.rawText
              .split(/\r?\n/)
              .filter((line) => line.trim() !== '')
            return (
              <div className="flex flex-col gap-2">
                {paras.map((p, i) => (
                  <p
                    className={chunkIndex === i ? 'bg-yellow-300' : ''}
                    key={i}
                  >
                    {p}
                  </p>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
