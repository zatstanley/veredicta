import { Chatbot } from '@/components/chatbot'

export default function ChatbotPage() {
  return (
    <div className="app-shell min-h-screen text-foreground">
      <div className="relative z-10 min-h-screen">
        <Chatbot />
      </div>
    </div>
  )
}
