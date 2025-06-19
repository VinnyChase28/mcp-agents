# @mcp-agents/shared-types

Shared TypeScript types and Zod schemas for the MCP Agents monorepo.

## 📁 Structure

This package is organized into modular files for better maintainability:

```
src/
├── index.ts       # Re-exports all types
├── api.ts         # API response types
├── chat.ts        # Chat and message types
├── mcp.ts         # MCP server and tool schemas
├── tools.ts       # Tool definitions and schemas
└── user.ts        # User and preference types
```

## 🔧 Usage

### Import Everything (Barrel Export)
```typescript
import { Message, ToolCall, ApiResponse } from '@mcp-agents/shared-types';
```

### Import from Specific Modules
```typescript
// For better tree-shaking and explicit dependencies
import { Message, ChatSession } from '@mcp-agents/shared-types/chat';
import { ToolCall, ToolDefinition } from '@mcp-agents/shared-types/tools';
import { ApiResponse } from '@mcp-agents/shared-types/api';
```

## 📋 Module Contents

### `api.ts`
- `ApiResponse<T>` - Standard API response wrapper
- `PaginatedResponse<T>` - Paginated API responses

### `chat.ts`
- `Message` - Chat message interface
- `ChatSession` - Chat session with message history

### `mcp.ts`
- `MCPAgent` - MCP agent configuration
- `McpServerConfig` - MCP server configuration
- `McpToolResponse` - MCP tool response format
- `CalculatorToolsSchema` - Zod schemas for calculator tools
- `FileManagerToolsSchema` - Zod schemas for file manager tools
- `ApiClientToolsSchema` - Zod schemas for API client tools
- Utility functions: `createSuccessResponse`, `createErrorResponse`, `validateFilePath`

### `tools.ts`
- `ToolCall` - Individual tool invocation
- `ToolDefinition` - Tool schema definition
- `ToolUsage` - Tool usage tracking
- Zod schemas: `ToolCallSchema`, `ToolDefinitionSchema`, `ToolUsageSchema`

### `user.ts`
- `User` - User profile interface
- `UserPreferences` - User settings and preferences

## 🎯 Benefits of Modular Structure

1. **Better Organization**: Related types are grouped together
2. **Easier Maintenance**: Changes to one domain don't affect others
3. **Better Tree-Shaking**: Import only what you need
4. **Clearer Dependencies**: Explicit imports show relationships
5. **Reduced Merge Conflicts**: Multiple developers can work on different modules

## 🔄 Migration from Single File

The old single `index.ts` file has been refactored into multiple modules. All exports remain the same, so existing imports will continue to work:

```typescript
// This still works (backwards compatible)
import { Message, ToolCall, ApiResponse } from '@mcp-agents/shared-types';

// But this is now preferred for new code
import { Message } from '@mcp-agents/shared-types/chat';
import { ToolCall } from '@mcp-agents/shared-types/tools';
import { ApiResponse } from '@mcp-agents/shared-types/api';
```

## 🚀 Adding New Types

When adding new types:

1. **Determine the correct module** based on the type's domain
2. **Add to the appropriate file** (`api.ts`, `chat.ts`, etc.)
3. **Export from that module**
4. **The main `index.ts` will automatically re-export it**

Example:
```typescript
// In tools.ts
export interface NewToolType {
  // ...
}

// Automatically available via:
import { NewToolType } from '@mcp-agents/shared-types';
```

## 🔍 Type Safety

All schemas use Zod for runtime validation and TypeScript type inference:

```typescript
import { ToolCallSchema, type ToolCall } from '@mcp-agents/shared-types/tools';

// Runtime validation
const result = ToolCallSchema.parse(data);

// TypeScript type
const toolCall: ToolCall = {
  id: '123',
  name: 'add',
  arguments: { a: 1, b: 2 },
  status: 'pending',
  timestamp: new Date(),
};
``` 