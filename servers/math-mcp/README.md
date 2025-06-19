# Calculator MCP Server

A Model Context Protocol (MCP) server that provides mathematical calculation tools for Claude Desktop.

## 🧮 Available Tools

### `add`

Add two numbers together.

**Parameters:**

- `a` (number): First number
- `b` (number): Second number

### `multiply`

Multiply two numbers.

**Parameters:**

- `a` (number): First number
- `b` (number): Second number

### `divide`

Divide two numbers with error handling for division by zero.

**Parameters:**

- `a` (number): Dividend
- `b` (number): Divisor

## 💬 Example Claude Desktop Prompts

### Basic Calculations

```
"Can you add 15 and 27 for me?"
"What's 8 times 9?"
"Please divide 100 by 4"
"Calculate 25 + 75"
```

### Word Problems

```
"I have 12 apples and buy 8 more. How many do I have total?"
"If a pizza costs $18 and I want to split it among 3 people, how much does each person pay?"
"What's 7 multiplied by 13?"
```

### Multiple Operations

```
"Add 10 and 5, then multiply the result by 3"
"Calculate (20 + 30) ÷ 2"
"I need to do several calculations: 15+25, 8×7, and 100÷4"
```

### Error Handling

```
"What happens if I divide 10 by 0?"
"Can you divide any number by zero?"
```

## 🧪 Testing

### Using MCP Inspector

```bash
cd servers/calculator-mcp
pnpm build
pnpm inspector
```

### Direct Testing (JSON-RPC)

```bash
# List available tools
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' | node dist/index.js

# Test addition
echo '{"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "add", "arguments": {"a": 15, "b": 25}}}' | node dist/index.js

# Test multiplication
echo '{"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "multiply", "arguments": {"a": 7, "b": 8}}}' | node dist/index.js

# Test division
echo '{"jsonrpc": "2.0", "id": 4, "method": "tools/call", "params": {"name": "divide", "arguments": {"a": 100, "b": 4}}}' | node dist/index.js

# Test error handling
echo '{"jsonrpc": "2.0", "id": 5, "method": "tools/call", "params": {"name": "divide", "arguments": {"a": 10, "b": 0}}}' | node dist/index.js
```

## 📦 Installation & Setup

1. **Build the server:**

   ```bash
   cd servers/calculator-mcp
   pnpm install
   pnpm build
   ```

2. **Add to Claude Desktop config:**

   ```json
   {
     "mcpServers": {
       "calculator": {
         "command": "node",
         "args": ["/absolute/path/to/servers/calculator-mcp/dist/index.js"]
       }
     }
   }
   ```

3. **Restart Claude Desktop**

## 🔧 Development

- **Language**: TypeScript
- **Framework**: @modelcontextprotocol/sdk
- **Validation**: Zod schemas
- **Build**: TypeScript compiler

### File Structure

```
servers/calculator-mcp/
├── src/
│   └── index.ts          # Main server implementation
├── dist/                 # Compiled JavaScript
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```
