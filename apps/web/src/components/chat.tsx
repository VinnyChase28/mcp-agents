'use client';

import { useChat } from 'ai/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Send, Bot, User, Wrench } from 'lucide-react';
import { ToolSidebar, type ToolUsage } from './tool-sidebar';

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const [toolUsages, setToolUsages] = useState<ToolUsage[]>([]);

  // Extract tool calls from messages
  useEffect(() => {
    const newToolUsages: ToolUsage[] = [];
    
    messages.forEach((message) => {
      if (message.toolInvocations) {
        message.toolInvocations.forEach((tool) => {
          newToolUsages.push({
            id: tool.toolCallId,
            name: tool.toolName,
            status: tool.state === 'result' ? 'completed' : tool.state === 'call' ? 'active' : 'error',
            timestamp: new Date(message.createdAt || Date.now()),
            arguments: tool.args,
            result: 'result' in tool ? tool.result : undefined,
            error: tool.state === 'result' ? undefined : 'Tool execution failed',
          });
        });
      }
    });
    
    setToolUsages(newToolUsages);
  }, [messages]);

  return (
    <div className="flex gap-6 w-full max-w-7xl mx-auto h-[600px]">
      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Chat Assistant
            {toolUsages.filter(t => t.status === 'active').length > 0 && (
              <div className="flex items-center gap-1 text-blue-500">
                <Wrench className="h-4 w-4 animate-spin" />
                <span className="text-sm">Tools active</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col flex-1 gap-4">
          <ScrollArea className="flex-1 pr-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-center">
                <div>
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-2">Start a conversation with the AI assistant!</p>
                  <p className="text-sm">
                    Try asking for calculations, file operations, or web requests.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    <div className="flex-shrink-0">
                      {message.role === 'user' ? (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <User className="h-4 w-4 text-primary-foreground" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          <Bot className="h-4 w-4 text-secondary-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="text-sm font-medium">
                        {message.role === 'user' ? 'You' : 'Assistant'}
                      </div>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {message.content}
                      </div>
                      {/* Show tool invocations */}
                      {message.toolInvocations && message.toolInvocations.length > 0 && (
                        <div className="space-y-2 mt-2">
                          {message.toolInvocations.map((tool, index) => (
                            <div key={index} className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                              <div className="flex items-center gap-2 mb-1">
                                <Wrench className="h-3 w-3" />
                                <span className="font-medium">{tool.toolName}</span>
                                <span className="text-blue-600">
                                  {tool.state === 'result' ? '✓' : tool.state === 'call' ? '⏳' : '❌'}
                                </span>
                              </div>
                              <div className="text-muted-foreground">
                                {JSON.stringify(tool.args, null, 2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <Bot className="h-4 w-4 text-secondary-foreground" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="text-sm font-medium">Assistant</div>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.1s]" />
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.2s]" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
          <Separator />
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask me to calculate, read files, or make web requests..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Tool Sidebar */}
      <ToolSidebar toolUsages={toolUsages} />
    </div>
  );
} 