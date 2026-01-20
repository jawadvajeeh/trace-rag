import { AssistantChat } from '@/components/features/chat-ui/assistant-chat'
import { SourceSelection } from '@/components/features/chat-ui/source-selection'
import { UserChat } from '@/components/features/chat-ui/user-chat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fetchKnowledgeBase } from '@/db/dal'
import { askAI } from '@/lib/ai'
import { createFileRoute } from '@tanstack/react-router'
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
  prompt: string
  role: 'User'
}
export type AIChat = {
  role: 'Assistant'
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

type Chat = UserChat | AIChat

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
    if (knowledge === null) return
    const q = question.trim()
    if (!q) return
    setChats((prev) => [...prev, { role: 'User', prompt: q }])
    setQuestion('')
    try {
      setIsAIThinking(true)
      const response = await askAI({
        data: { kbid: knowledge.id, question: q },
      })
      setChats((prev) => [...prev, { role: 'Assistant', response }])
    } catch (error) {
      console.log(error)
    } finally {
      setIsAIThinking(false)
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4">
      <div className="flex flex-col h-screen">
        <div className="chats flex-1 overflow-scroll no-scrollbar flex flex-col gap-4 my-4">
          {chats.length > 0 &&
            chats.map((chat, index) => {
              if (chat.role === 'User') {
                return <UserChat prompt={chat.prompt} key={index} />
              } else {
                if (isAIThinking) {
                  return <span>...</span>
                }
                return <AssistantChat response={chat.response} key={index} />
              }
            })}
        </div>
        <div className="mb-4">
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
            <Button className="h-12 rounded-l-none flex items-center justify-center">
              Send
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}
