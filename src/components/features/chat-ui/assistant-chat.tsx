import { AssistantDoneChat } from '@/routes'
import { Link } from '@tanstack/react-router'

type AssistantBubbleProps =
  | {
      status: 'pending'
    }
  | {
      status: 'done'
      response: AssistantDoneChat['response']
      kbid?: string
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
            <Link
              search={{ chunkIndex: c }}
              params={{ kbid: props.kbid! }}
              to={`/sources/$kbid/preview`}
              key={i}
            >{`[${c}]`}</Link>
          ))}
        </p>
      </div>
    </div>
  )
}

export { AssistantChat }
