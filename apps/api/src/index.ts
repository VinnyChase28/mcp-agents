import express from 'express';
import cors from 'cors';
import type { ApiResponse, Message, ChatSession } from '@mcp-agents/shared-types';
import { createApiResponse, createMessage } from '@mcp-agents/utils';

const app = express();
const PORT = process.env.API_PORT || process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
const mockMessages: Message[] = [
  createMessage('Hello! How can I help you today?', 'assistant'),
  createMessage('I need help with my project', 'user'),
];

const mockSession: ChatSession = {
  id: 'session_1',
  title: 'Project Help',
  messages: mockMessages,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Routes
app.get('/health', (req, res) => {
  res.json(createApiResponse(true, { status: 'healthy' }, undefined, 'API is running'));
});

app.get('/api/chat/sessions', (req, res) => {
  res.json(createApiResponse(true, [mockSession]));
});

app.get('/api/chat/sessions/:id', (req, res) => {
  const { id } = req.params;
  if (id === mockSession.id) {
    res.json(createApiResponse(true, mockSession));
  } else {
    res.status(404).json(createApiResponse(false, undefined, 'Session not found'));
  }
});

app.post('/api/chat/sessions/:id/messages', (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json(createApiResponse(false, undefined, 'Content is required'));
  }

  const userMessage = createMessage(content, 'user');
  const assistantMessage = createMessage(`I received your message: "${content}"`, 'assistant');
  
  res.json(createApiResponse(true, [userMessage, assistantMessage]));
});

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
}); 