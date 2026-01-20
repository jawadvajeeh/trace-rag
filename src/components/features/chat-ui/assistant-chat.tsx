import { AIChat } from '@/routes'

type AssistantChatProps = {
  response: AIChat['response']
}

const AssistantChat = ({ response }: AssistantChatProps) => {
  return (
    <div className="md:max-w-2xl w-full  bg-gray-200 p-4 rounded-xl">
      <p className="font-semibold">AI</p>
      <p className="text-sm">{response.answer}</p>
      <div className="flex justify-end">
        <p>
          {response.citations.map((c, i) => (
            <span key={i}>{`[${c}]`}</span>
          ))}
        </p>
      </div>
    </div>
  )
}

export { AssistantChat }
