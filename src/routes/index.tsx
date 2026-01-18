import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return <main className="max-w-6xl ml-auto">Hello World</main>
}
