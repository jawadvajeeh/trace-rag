type UserChatProps = {
  prompt: string
}

const UserChat = ({ prompt }: UserChatProps) => {
  return (
    <div className="md:max-w-lg md:w-full w-[80%]  ml-auto bg-gray-100 p-4 rounded-xl">
      <p className="font-semibold">You</p>
      <p className="text-sm">{prompt}</p>
    </div>
  )
}

export { UserChat }
