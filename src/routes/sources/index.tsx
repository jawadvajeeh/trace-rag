import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { fetchKnowledgeBase, saveSource } from '@/db/dal'
import { Link } from '@tanstack/react-router'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/sources/')({
  component: RouteComponent,
  loader: async () => {
    try {
      const data = await fetchKnowledgeBase()
      return { kbs: data, error: null }
    } catch (error) {
      if (error instanceof AppError) {
        return { kbs: [], error: error.message }
      }
      return { kbs: [], error: 'Something went wrong.' }
    }
  },
})

function RouteComponent() {
  const [knowledgeBase, setKnowledgeBase] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { kbs } = Route.useLoaderData()
  const router = useRouter()

  async function save() {
    try {
      setIsLoading(true)
      await saveSource({ data: { name, rawText: knowledgeBase } })
      reset()
      router.invalidate()
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  function reset() {
    setName('')
    setKnowledgeBase('')
  }

  return (
    <main className="max-w-3xl mx-auto px-4">
      <div className="flex flex-col gap-4 mt-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">Name</h2>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">Source</h2>
          <Textarea
            value={knowledgeBase}
            onChange={(e) => setKnowledgeBase(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button disabled={isLoading} onClick={save}>
            Save
          </Button>
          <Button onClick={reset}>Reset</Button>
        </div>
        <div className="flex flex-col gap-2">
          {kbs.length > 0
            ? kbs.map((kb) => (
                <Link
                  className="text-blue-500 underline italic font-semibold"
                  params={{ kbid: kb.id }}
                  to={`/sources/$kbid/preview`}
                  key={kb.id}
                >
                  {kb.name}
                </Link>
              ))
            : null}
        </div>
      </div>
    </main>
  )
}
