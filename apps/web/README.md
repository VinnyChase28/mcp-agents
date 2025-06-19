# MCP Agents Web App

A Next.js application with AI chat capabilities using the Vercel AI SDK.

## Features

- 🤖 AI Chat interface with streaming responses
- 🎨 Beautiful UI built with shadcn/ui components
- 🔥 Real-time chat with Anthropic's Claude
- 📱 Responsive design with dark/light mode support

## Setup

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the `apps/web` directory:

   ```bash
   # Anthropic API Key (required)
   ANTHROPIC_API_KEY=your_anthropic_api_key_here

   # Optional: OpenAI API Key (if you want to use OpenAI instead)
   # OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Get your API keys:**

   - **Anthropic**: Get your API key from [Anthropic Console](https://console.anthropic.com/)
   - **OpenAI**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

4. **Start the development server:**

   ```bash
   pnpm dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

- Type your message in the chat input
- Press Enter or click the Send button
- Watch the AI respond in real-time with streaming
- The chat history is maintained during your session

## Switching AI Providers

To use OpenAI instead of Anthropic, update the API route (`src/app/api/chat/route.ts`):

```typescript
import { openai } from '@ai-sdk/openai';

// Replace the anthropic model with:
model: openai('gpt-4-turbo'),
```

## Architecture

- **Frontend**: Next.js 14 with App Router
- **UI**: shadcn/ui components with Tailwind CSS
- **AI**: Vercel AI SDK with streaming support
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with CSS variables

## Components

- `Chat`: Main chat interface with message history
- `Button`, `Input`, `Card`: shadcn/ui components
- `ScrollArea`: For chat message scrolling

## API Routes

- `/api/chat`: Handles AI chat requests with streaming responses

## Error Handling

The app includes comprehensive error handling:

- Missing API key detection
- Network error handling
- User-friendly error messages
- Loading states and indicators

## Development

This app is part of the MCP Agents monorepo. Use the following commands from the project root:

```bash
# Start web app only
pnpm dev --filter @mcp-agents/web

# Build web app
pnpm build --filter @mcp-agents/web

# Run from web directory
cd apps/web
pnpm dev
```
