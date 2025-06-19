# 📁 Import Patterns Guide

This monorepo uses consistent `@` import patterns across all packages and applications for better developer experience and maintainability.

## 🎯 Import Pattern Overview

### **Within Packages/Apps (Local Imports)**
Use `@/` for imports within the same package or app:

```typescript
// ✅ Good - within the same package
import { SomeUtil } from '@/utils/helper.js';
import { Component } from '@/components/Button.js';
import { Config } from '@/config.js';
```

### **Cross-Package Imports**
Use full package names for imports between packages:

```typescript
// ✅ Good - between packages
import { Message, ToolCall } from '@mcp-agents/shared-types';
import { McpClient } from '@mcp-agents/utils';
```

### **Monorepo-Level Imports (From Root)**
Use `@/` prefixes for navigating the monorepo structure:

```typescript
// ✅ Available from root tsconfig
import { WebComponent } from '@/apps/web/src/components/Button';
import { ApiRoute } from '@/apps/api/src/routes/chat';
import { ServerTool } from '@/servers/calculator-mcp/src/tools';
```

## 📋 Configuration by Package

### **Next.js Web App** (`apps/web/`)
```json
{
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

**Usage Examples:**
```typescript
import { Chat } from '@/components/chat';
import { ToolSidebar } from '@/components/tool-sidebar';
import { Button } from '@/components/ui/button';
```

### **API Server** (`apps/api/`)
```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@/routes/*": ["./src/routes/*"],
    "@/middleware/*": ["./src/middleware/*"],
    "@/utils/*": ["./src/utils/*"]
  }
}
```

**Usage Examples:**
```typescript
import { authMiddleware } from '@/middleware/auth';
import { chatRouter } from '@/routes/chat';
import { logger } from '@/utils/logger';
```

### **Shared Types** (`packages/shared-types/`)
```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@/types/*": ["./src/*"]
  }
}
```

**Usage Examples:**
```typescript
// Internal imports (within package)
import { ToolCall } from '@/tools';
import { ApiResponse } from '@/api';

// External imports (from other packages)
import { Message } from '@mcp-agents/shared-types';
```

### **Utils Package** (`packages/utils/`)
```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@/utils/*": ["./src/*"]
  }
}
```

**Usage Examples:**
```typescript
// Internal imports
import { McpClient } from '@/mcp-client';
import { formatDate } from '@/date-utils';

// External imports
import { ToolDefinition } from '@mcp-agents/shared-types';
```

### **MCP Servers** (`servers/*/`)
```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@/tools/*": ["./src/tools/*"],
    "@/utils/*": ["./src/utils/*"]
  }
}
```

**Usage Examples:**
```typescript
import { calculatorTool } from '@/tools/calculator';
import { validateInput } from '@/utils/validation';
```

## 🎯 Benefits of @ Imports

### **1. Cleaner Imports**
```typescript
// ❌ Before
import { Chat } from '../../../components/chat/Chat';
import { utils } from '../../utils/index';

// ✅ After
import { Chat } from '@/components/chat/Chat';
import { utils } from '@/utils';
```

### **2. Refactor-Safe**
Moving files doesn't break imports:
```typescript
// This stays the same even if you move the file
import { Button } from '@/components/ui/button';
```

### **3. IDE Support**
- ✅ Auto-completion works perfectly
- ✅ Go-to-definition navigates correctly
- ✅ Refactoring tools understand the paths

### **4. Consistent Patterns**
Every package follows the same pattern, making it easy to switch between them.

## 🔧 Setup for New Packages

When creating a new package, add path mapping to its `tsconfig.json`:

```json
{
  "extends": "@mcp-agents/config/tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "paths": {
      "@/*": ["./src/*"],
      "@/your-domain/*": ["./src/your-domain/*"]
    }
  }
}
```

## 🚨 Important Rules

### **1. Package Exports Use Relative Paths**
In `index.ts` files that export to other packages, use relative imports:

```typescript
// ✅ In packages/shared-types/src/index.ts
export * from './api.js';
export * from './chat.js';

// ❌ Don't use @ imports in export files
export * from '@/api.js'; // This breaks cross-package imports
```

### **2. Internal Files Can Use @ Imports**
Within a package, non-export files can use @ imports:

```typescript
// ✅ In packages/shared-types/src/chat.ts
import { ToolCall } from './tools.js'; // Relative import

// ✅ In packages/utils/src/some-internal-file.ts  
import { helper } from '@/internal-helper.js'; // @ import OK
```

### **3. Cross-Package Always Use Package Names**
```typescript
// ✅ Always use full package names
import { Message } from '@mcp-agents/shared-types';

// ❌ Never use @ for cross-package
import { Message } from '@/shared-types'; // Won't work
```

## 🎨 IDE Configuration

### **VS Code**
Add to `.vscode/settings.json`:
```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "typescript.suggest.paths": true
}
```

### **WebStorm/IntelliJ**
Path mapping is automatically detected from `tsconfig.json` files.

## 🔍 Troubleshooting

### **Import Not Found**
1. Check if the path mapping exists in `tsconfig.json`
2. Ensure the file extension is correct (`.js` for compiled output)
3. Verify the target file actually exports what you're importing

### **Build Errors**
1. Make sure export files use relative imports
2. Check that all `tsconfig.json` files extend the base config
3. Ensure `baseUrl` is set correctly

### **IDE Not Recognizing Paths**
1. Restart TypeScript service: `Cmd+Shift+P` → "TypeScript: Restart TS Server"
2. Check that the `tsconfig.json` is in the workspace root
3. Verify path mapping syntax is correct

## 📚 Examples by Use Case

### **Creating a New Component**
```typescript
// apps/web/src/components/new-feature/NewComponent.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ToolCall } from '@mcp-agents/shared-types';
import { formatDate } from '@mcp-agents/utils';
```

### **Adding a New API Route**
```typescript
// apps/api/src/routes/new-route.ts
import express from 'express';
import { authMiddleware } from '@/middleware/auth';
import { validateRequest } from '@/utils/validation';
import { ApiResponse } from '@mcp-agents/shared-types';
```

### **Creating a New MCP Tool**
```typescript
// servers/new-mcp/src/tools/new-tool.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { validateInput } from '@/utils/validation';
import { ToolDefinition } from '@mcp-agents/shared-types';
```

This pattern ensures consistency, maintainability, and a great developer experience across the entire monorepo! 🚀 