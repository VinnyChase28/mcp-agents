import { Chat } from '@/components/chat';

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            MCP Agents
          </h1>
          <p className="text-muted-foreground text-lg">
            AI-powered chat interface with the Vercel AI SDK
          </p>
        </div>
        <Chat />
      </div>
    </div>
  );
}
