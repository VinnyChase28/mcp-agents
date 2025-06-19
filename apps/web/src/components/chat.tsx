"use client";

import { useChat } from "ai/react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Send, Bot, User, Wrench } from "lucide-react";
import { ToolSidebar, type ToolUsage } from "./tool-sidebar";
import { MarkdownRenderer } from "./markdown-renderer";

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat();
  const [toolUsages, setToolUsages] = useState<ToolUsage[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Extract tool calls from messages
  useEffect(() => {
    const newToolUsages: ToolUsage[] = [];

    messages.forEach((message) => {
      if (message.toolInvocations) {
        message.toolInvocations.forEach((tool) => {
          newToolUsages.push({
            id: tool.toolCallId,
            name: tool.toolName,
            status:
              tool.state === "result"
                ? "completed"
                : tool.state === "call"
                  ? "active"
                  : "error",
            timestamp: new Date(message.createdAt || Date.now()),
            arguments: tool.args,
            result: "result" in tool ? tool.result : undefined,
            error:
              tool.state === "result" ? undefined : "Tool execution failed",
          });
        });
      }
    });

    setToolUsages(newToolUsages);
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  return (
    <div className="flex gap-6 w-full max-w-7xl mx-auto h-[calc(100vh-8rem)] max-h-[calc(100vh-8rem)]">
      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col max-h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Chat Assistant
            {toolUsages.filter((t) => t.status === "active").length > 0 && (
              <div className="flex items-center gap-1 text-blue-500">
                <Wrench className="h-4 w-4 animate-spin" />
                <span className="text-sm">Tools active</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        {/* Scrollable message area */}
        <div className="flex-1 min-h-0 flex flex-col gap-4 p-6">
          <ScrollArea
            ref={scrollAreaRef}
            className="flex-1 pr-4 h-full max-h-full"
          >
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-center">
                <div>
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-2">
                    Start a conversation with the AI assistant!
                  </p>
                  <p className="text-sm">
                    Try asking for calculations, file operations, or web
                    requests.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    <div className="flex-shrink-0">
                      {message.role === "user" ? (
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
                        {message.role === "user" ? "You" : "Assistant"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {message.role === "user" ? (
                          <div className="whitespace-pre-wrap">
                            {message.content}
                          </div>
                        ) : (
                          <MarkdownRenderer content={message.content} />
                        )}
                      </div>
                      {/* Show tool invocations */}
                      {message.toolInvocations &&
                        message.toolInvocations.length > 0 && (
                          <div className="space-y-2 mt-2">
                            {message.toolInvocations.map((tool, index) => (
                              <div
                                key={index}
                                className="p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg text-xs"
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <Wrench className="h-3 w-3" />
                                  <span className="font-medium">
                                    {tool.toolName}
                                  </span>
                                  <span className="text-blue-600 dark:text-blue-400">
                                    {tool.state === "result"
                                      ? "✓"
                                      : tool.state === "call"
                                        ? "⏳"
                                        : "❌"}
                                  </span>
                                </div>
                                <div className="text-muted-foreground font-mono text-xs bg-muted/50 p-2 rounded">
                                  {JSON.stringify(tool.args, null, 2)}
                                </div>
                                {tool.state === "result" &&
                                  "result" in tool && (
                                    <div className="mt-2 text-green-700 dark:text-green-400 font-mono text-xs bg-green-50 dark:bg-green-950/50 p-2 rounded">
                                      <div className="font-medium mb-1">
                                        Result:
                                      </div>
                                      {typeof tool.result === "string"
                                        ? tool.result
                                        : JSON.stringify(tool.result, null, 2)}
                                    </div>
                                  )}
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
        </div>
        <Separator />
        {/* Chat input bar pinned to bottom */}
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 p-4 border-t bg-background sticky bottom-0 z-10"
        >
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask me to calculate, read files, or make web requests..."
            disabled={isLoading}
            className="flex-1"
            autoFocus
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>

      {/* Tool Sidebar */}
      <ToolSidebar toolUsages={toolUsages} />
    </div>
  );
}
