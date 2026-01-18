import { AssistantChat } from '@/components/features/assistant-chat'
import { UserChat } from '@/components/features/user-chat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createFileRoute } from '@tanstack/react-router'
import { ChangeEvent, FormEvent, useState } from 'react'

export const Route = createFileRoute('/')({ component: App })

type UserChat = {
  prompt: string
  role: 'User'
}
type AIChat = {
  role: 'Assistant'
  response: string
}

type Chat = UserChat | AIChat

function App() {
  const [question, setQuestion] = useState('')
  const [chats, setChats] = useState<Chat[]>([])

  function handleTextChange(e: ChangeEvent<HTMLInputElement>) {
    setQuestion(e.target.value)
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (question !== '') {
      setChats([...chats, { role: 'User', prompt: question }])
      setQuestion('')
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
                return <AssistantChat key={index} />
              }
            })}
        </div>
        <div className="mb-4">
          <form onSubmit={(e) => handleSubmit(e)} className="flex">
            <Input
              value={question}
              onChange={(e) => handleTextChange(e)}
              placeholder="Ask anything"
              className="h-10 rounded-r-none"
            />
            <Button className="h-10 rounded-l-none flex items-center justify-center">
              Send
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}
