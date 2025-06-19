# Best Practices for Using MCP with the AI SDK

Based on the search results and industry best practices, here's a concise guide to effectively using MCP with the AI SDK:

## Core Principles

- **Use `experimental_createMCPClient` for tool integration**  
  Connect to MCP servers and pass tools to AI generation functions:

  ```typescript
  const mcpClient = await createMCPClient({
    transport: {
      type: "sse",
      url: "https://your-server.com/sse",
      headers: { Authorization: "Bearer YOUR_TOKEN" },
    },
  });

  return streamText({
    model: yourModel,
    messages,
    tools: await mcpClient.tools(),
  });
  ```

- **Choose the right transport method**

  - `stdio`: Best for **local development** (faster, lower latency)
  - `sse`: Essential for **production** (secure, remote connections)

- **Implement robust error handling**
  ```typescript
  try {
    const tools = await mcpClient.tools();
  } catch (error) {
    console.error("MCP connection failed:", error);
    // Fallback to default tools or safe behavior
  }
  ```

## Security Best Practices

1. **Always use authentication headers** for SSE connections
2. **Validate tool outputs** before passing to LLMs
3. **Implement timeouts** for MCP tool execution
   ```typescript
   const mcpClient = await createMCPClient({
     transport: {
       type: "stdio",
       command: "node",
       args: ["./mcp-server.js"],
       timeout: 5000, // 5-second timeout
     },
   });
   ```

## Performance Optimization

- **Cache tool lists** when possible to reduce discovery latency
- **Reuse MCP clients** across requests instead of recreating
- **Prioritize local stdio** for CPU-intensive tools

## Resource Management

- **Close clients properly** to avoid resource leaks:
  ```typescript
  try {
    // Use client
  } finally {
    await mcpClient.close();
  }
  ```
- **Monitor server sessions** (especially for long-running agents)

## Advanced Patterns

- **Combine multiple MCP servers** for complex workflows:

  ```typescript
  const [fsClient, webClient] = await Promise.all([
    createFileSystemMCPClient(),
    createWebToolMCPClient(),
  ]);

  return streamText({
    tools: [...(await fsClient.tools()), ...(await webClient.tools())],
  });
  ```

- **Implement fallback mechanisms** when MCP servers are unavailable
- **Use MCP for local tooling** to enhance security:
  ```typescript
  // Securely expose local filesystem via MCP
  const fsClient = await createMCPClient({
    transport: {
      type: "stdio",
      command: "node",
      args: ["@modelcontextprotocol/server-filesystem", "./secure-dir"],
    },
  });
  ```

## Debugging Tips

- **Enable verbose logging** during development
- **Use MCP Inspector** for server testing:
  ```bash
  npx @modelcontextprotocol/inspector dist/index.js
  ```
- **Monitor tool usage** through SDK tracing features

Key resources:  
[Vercel AI SDK Documentation](https://vercel.com/blog/ai-sdk-4-2) |  
[MCP Specification](https://www.getzep.com/ai-agents/developer-guide-to-mcp)
