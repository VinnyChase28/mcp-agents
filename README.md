# MCP Agents - Complete TypeScript Monorepo

A comprehensive TypeScript monorepo featuring Model Context Protocol (MCP) servers, Next.js frontend with shadcn/ui, Express API backend, and shared packages.

## 🏗️ Project Structure

```
mcp-agents/
├── apps/
│   ├── web/                    # Next.js frontend with shadcn/ui
│   └── api/                    # Express API backend
├── packages/
│   ├── shared-types/           # Shared TypeScript types + MCP types
│   ├── utils/                  # Shared utility functions
│   └── config/                 # Shared configurations
├── servers/                    # MCP Servers
│   ├── calculator-mcp/         # Calculator MCP server
│   ├── file-manager-mcp/       # File management MCP server
│   └── api-client-mcp/         # API client MCP server
├── package.json               # Root package with MCP scripts
├── pnpm-workspace.yaml        # PNPM workspace configuration
├── turbo.json                 # Turborepo build configuration
├── tsconfig.base.json         # Base TypeScript configuration
└── claude_desktop_config.example.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PNPM 9+
- Git

### Installation
```bash
# Clone and install
git clone <your-repo>
cd mcp-agents
pnpm install

# Build everything
pnpm build

# Start development servers
pnpm dev
```

## 🤖 MCP Servers

### Calculator Server
Provides mathematical operations:
- `add` - Add two numbers
- `multiply` - Multiply two numbers  
- `divide` - Divide two numbers

### File Manager Server
File system operations:
- `read_file` - Read file contents
- `write_file` - Write content to file
- `list_directory` - List directory contents

### API Client Server
HTTP request capabilities:
- `get_request` - Make GET requests
- `post_request` - Make POST requests

## 🧪 Testing MCP Servers

Test individual servers with the MCP Inspector:

```bash
# Calculator server
cd servers/calculator-mcp
pnpm build
pnpm inspector

# File manager server
cd servers/file-manager-mcp  
pnpm build
pnpm inspector

# API client server
cd servers/api-client-mcp
pnpm build
pnpm inspector
```

## 🔧 Claude Desktop Integration

1. Copy `claude_desktop_config.example.json` to your Claude Desktop config location
2. Update the absolute paths to match your system:
   ```json
   {
     "mcpServers": {
       "calculator": {
         "command": "node",
         "args": ["/Users/your-username/path/to/mcp-agents/servers/calculator-mcp/dist/index.js"]
       }
     }
   }
   ```
3. Restart Claude Desktop

## 📦 Available Scripts

```bash
# Build everything
pnpm build

# Build only MCP servers
pnpm mcp:build

# Start MCP servers in dev mode
pnpm mcp:dev

# Development mode (all apps)
pnpm dev

# Lint all packages
pnpm lint

# Type check all packages
pnpm typecheck

# Format code
pnpm format
```

## 🌐 Development Servers

When running `pnpm dev`:
- **Frontend**: http://localhost:3000 (Next.js with shadcn/ui)
- **API**: http://localhost:3001 (Express backend)
- **MCP Servers**: Available via stdio for Claude Desktop

## 🏛️ Architecture

### Monorepo Benefits
- **Shared Types**: Common interfaces across frontend, backend, and MCP servers
- **Shared Utils**: Reusable functions and validation helpers
- **Unified Tooling**: Single build system, linting, and type checking
- **Efficient Caching**: Turborepo optimizes builds and tests

### MCP Integration
- **Type Safety**: Full TypeScript support for MCP protocol
- **Modular Design**: Each server is independently deployable
- **Shared Infrastructure**: Common types and utilities
- **Easy Testing**: Built-in inspector support

## 🛠️ Technology Stack

- **Build System**: Turborepo + PNPM workspaces
- **Language**: TypeScript (ESM modules)
- **Frontend**: Next.js 15 + React 19 + shadcn/ui
- **Backend**: Express.js + CORS
- **MCP**: @modelcontextprotocol/sdk
- **Validation**: Zod schemas
- **Styling**: Tailwind CSS

## 📝 Adding New MCP Servers

1. Create new server directory:
   ```bash
   mkdir servers/my-new-server
   cd servers/my-new-server
   ```

2. Copy package.json from existing server and update name

3. Create `src/index.ts` following the pattern:
   ```typescript
   import { Server } from "@modelcontextprotocol/sdk/server/index.js";
   import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
   // ... implement your tools
   ```

4. Build and test:
   ```bash
   pnpm build
   pnpm inspector
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `pnpm test`
5. Build everything: `pnpm build`
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
