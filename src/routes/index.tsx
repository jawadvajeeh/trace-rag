import { AssistantChat } from '@/components/features/chat-ui/assistant-chat'
import { SourceSelection } from '@/components/features/chat-ui/source-selection'
import { UserChat } from '@/components/features/chat-ui/user-chat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fetchKnowledgeBase } from '@/db/dal'
import { askAI } from '@/lib/ai'
import { createFileRoute } from '@tanstack/react-router'
import { MessageCircleX } from 'lucide-react'
import { ChangeEvent, FormEvent, useState } from 'react'

export const Route = createFileRoute('/')({
  component: App,
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

type UserChat = {
  id: string
  role: 'User'
  prompt: string
  createdAt: number
}
type AssistantPendingChat = {
  id: string
  role: 'Assistant'
  status: 'pending'
  createdAt: number
}
export type AssistantDoneChat = {
  id: string
  role: 'Assistant'
  status: 'done'
  createdAt: number
  response: {
    answer: string
    citations: number[]
    sources: {
      index: number
      text: string
      score: number
    }[]
    meta: { topScore: number }
  }
}

type AssistantErrorChat = {
  id: string
  role: 'Assistant'
  status: 'error'
  createdAt: number
  errorMessage: string
}

type Chat =
  | UserChat
  | AssistantPendingChat
  | AssistantDoneChat
  | AssistantErrorChat

function App() {
  const [question, setQuestion] = useState('')
  const [chats, setChats] = useState<Chat[]>([])
  const { kbs } = Route.useLoaderData()
  const [knowledge, setKnowledge] = useState<{
    name: string
    id: string
  } | null>(null)
  const [isAIThinking, setIsAIThinking] = useState(false)

  function handleTextChange(e: ChangeEvent<HTMLInputElement>) {
    setQuestion(e.target.value)
  }

  function handleKnowledgeChange(kb: (typeof kbs)[0]) {
    setKnowledge(kb)
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (knowledge === null || isAIThinking) return
    const q = question.trim()
    if (!q) return
    const now = Date.now()
    const userId = crypto.randomUUID()
    const assistantId = crypto.randomUUID()
    setChats((prev) => [
      ...prev,
      { role: 'User', prompt: q, createdAt: now, id: userId },
      {
        role: 'Assistant',
        status: 'pending',
        createdAt: now + 1,
        id: assistantId,
      },
    ])
    setQuestion('')
    try {
      setIsAIThinking(true)
      const response = await askAI({
        data: { kbid: knowledge.id, question: q },
      })
      setChats((prev) =>
        prev.map((c) => {
          if (c.role !== 'Assistant') return c
          if (c.status !== 'pending') return c
          if (c.id !== assistantId) return c
          const done: AssistantDoneChat = {
            id: assistantId,
            role: 'Assistant',
            status: 'done',
            createdAt: c.createdAt,
            response,
          }
          return done
        }),
      )
    } catch (err) {
      console.log(err)
      const message =
        err instanceof Error ? err.message : 'Something went wrong'
      setChats((prev) =>
        prev.map((c) => {
          if (c.role !== 'Assistant') return c
          if (c.status !== 'pending') return c
          if (c.id !== assistantId) return c

          const errored: AssistantErrorChat = {
            id: assistantId,
            role: 'Assistant',
            status: 'error',
            createdAt: c.createdAt,
            errorMessage: message,
          }
          return errored
        }),
      )
    } finally {
      setIsAIThinking(false)
    }
  }

  function reset() {
    setQuestion('')
    setChats([])
  }

  return (
    <main className="max-w-3xl mx-auto px-4">
      <div className="flex flex-col h-screen ">
        <div className="chats flex-1 overflow-scroll no-scrollbar flex flex-col gap-4 my-4">
          {chats.length === 0 && (
            <div className="w-full  h-full flex justify-center items-center flex-col gap-2">
              <h1 className="text-3xl font-black">
                Ask <span className="text-blue-800">KnowledgeAI</span>
              </h1>
              <div className="text-center">
                <p>Ask questions from the text you save.</p>
                <p>Get grounded answers with sources you can verify.</p>
              </div>
            </div>
          )}
          {chats.length > 0 &&
            chats.map((chat) => {
              if (chat.role === 'User') {
                return <UserChat key={chat.id} prompt={chat.prompt} />
              }
              // Assistant
              if (chat.status === 'pending') {
                return <AssistantChat key={chat.id} status="pending" />
              }
              if (chat.status === 'error') {
                return (
                  <AssistantChat
                    key={chat.id}
                    status="error"
                    errorMessage="Something went wrong"
                  />
                )
              }
              // status === 'done'
              return (
                <AssistantChat
                  key={chat.id}
                  status="done"
                  response={chat.response}
                />
              )
            })}
        </div>

        <div className="mb-4 relative">
          {chats.length > 0 && (
            <Button
              onClick={reset}
              variant={`outline`}
              size={`icon`}
              className="rounded-full absolute left-1/2 -translate-x-1/2 -top-12"
            >
              <MessageCircleX />
            </Button>
          )}

          <form
            onSubmit={(e) => handleSubmit(e)}
            className="flex rounded-r-none"
          >
            <div className="flex flex-1 h-12 border p-1 rounded-md rounded-r-none">
              <SourceSelection
                kbs={kbs}
                handleKnowledgeChange={handleKnowledgeChange}
              />
              <Input
                value={question}
                onChange={(e) => handleTextChange(e)}
                placeholder={
                  !knowledge ? `Ask anything` : `Ask about ${knowledge.name}`
                }
                className="h-full border-none focus-visible:ring-0"
              />
            </div>
            <Button
              disabled={isAIThinking}
              className="h-12 rounded-l-none flex items-center justify-center"
            >
              Send
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}
