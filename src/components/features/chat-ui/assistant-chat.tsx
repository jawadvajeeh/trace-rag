import { AssistantDoneChat } from '@/routes'

type AssistantBubbleProps =
  | {
      status: 'pending'
    }
  | {
      status: 'done'
      response: AssistantDoneChat['response']
    }
  | {
      status: 'error'
      errorMessage: string
    }

const AssistantChat = (props: AssistantBubbleProps) => {
  if (props.status === 'pending') {
    return <div>Thinking…</div>
  }
  if (props.status === 'error') {
    return (
      <div className="assistant-bubble error">
        <p>{props.errorMessage}</p>
        <button>Retry</button>
      </div>
    )
  }
  return (
    <div className="md:max-w-2xl w-full   p-4 rounded-xl">
      <p className="font-semibold">AI</p>
      <p className="text-sm">{props.response.answer}</p>
      <div className="flex justify-start">
        <p>
          {props.response.citations.map((c, i) => (
            <span key={i}>{`[${c}]`}</span>
          ))}
        </p>
      </div>
    </div>
  )
}

export { AssistantChat }
