# File Manager MCP Server

A Model Context Protocol (MCP) server that provides file system operations for Claude Desktop.

## 📁 Available Tools

### `read_file`
Read the contents of a file.

**Parameters:**
- `path` (string): Path to the file to read

**Returns:** File contents as text

### `write_file`
Write content to a file (creates directories if needed).

**Parameters:**
- `path` (string): Path to the file to write
- `content` (string): Content to write to the file

**Returns:** Success confirmation message

### `list_directory`
List the contents of a directory.

**Parameters:**
- `path` (string): Path to the directory to list

**Returns:** JSON array of directory contents with file/directory types

## 💬 Example Claude Desktop Prompts

### Reading Files
```
"Can you read the contents of my package.json file?"
"Please show me what's in /Users/username/Documents/notes.txt"
"Read the README.md file in my project"
"What's in the file at ./src/index.ts?"
```

### Writing Files
```
"Create a file called shopping-list.txt with a list of groceries"
"Write a simple HTML file at ./public/index.html"
"Save this JSON data to a file called config.json: {\"name\": \"test\", \"version\": \"1.0\"}"
"Create a new README.md file with project documentation"
```

### Directory Operations
```
"List all files in my Documents folder"
"Show me what's in the current directory"
"What files are in /Users/username/Desktop?"
"List the contents of the src folder"
```

### File Management Tasks
```
"Create a backup of my important notes to a new file"
"Read my todo.txt file and create a formatted version"
"List all files in my project directory and tell me about the structure"
"Create a log file with today's date and some initial content"
```

### Development Workflows
```
"Read my package.json and tell me about the dependencies"
"Create a new component file in ./src/components/Button.tsx"
"Show me the contents of my .gitignore file"
"List all TypeScript files in the src directory"
```

## 🧪 Testing

### Using MCP Inspector
```bash
cd servers/file-manager-mcp
pnpm build
pnpm inspector
```

### Direct Testing (JSON-RPC)
```bash
# List available tools
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' | node dist/index.js

# Write a test file
echo '{"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "write_file", "arguments": {"path": "/tmp/test.txt", "content": "Hello MCP!"}}}' | node dist/index.js

# Read the test file
echo '{"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "read_file", "arguments": {"path": "/tmp/test.txt"}}}' | node dist/index.js

# List directory contents
echo '{"jsonrpc": "2.0", "id": 4, "method": "tools/call", "params": {"name": "list_directory", "arguments": {"path": "/tmp"}}}' | node dist/index.js
```

## 🔒 Security Considerations

**Important:** This server can read and write files on your system. Use with caution:

- Only use with trusted prompts
- Be careful with file paths (no `..` traversal protection implemented)
- Consider running in a sandboxed environment for production use
- Review file operations before confirming in Claude Desktop

## 📦 Installation & Setup

1. **Build the server:**
   ```bash
   cd servers/file-manager-mcp
   pnpm install
   pnpm build
   ```

2. **Add to Claude Desktop config:**
   ```json
   {
     "mcpServers": {
       "file-manager": {
         "command": "node",
         "args": ["/absolute/path/to/servers/file-manager-mcp/dist/index.js"]
       }
     }
   }
   ```

3. **Restart Claude Desktop**

## 🔧 Development

- **Language**: TypeScript
- **Framework**: @modelcontextprotocol/sdk
- **File System**: Node.js fs/promises
- **Validation**: Zod schemas
- **Build**: TypeScript compiler

### File Structure
```
servers/file-manager-mcp/
├── src/
│   └── index.ts          # Main server implementation
├── dist/                 # Compiled JavaScript
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## 🚀 Use Cases

- **Documentation**: Read and create project documentation
- **Configuration**: Manage config files and settings
- **Logging**: Create and read log files
- **Backup**: Copy important files
- **Development**: Read source code and create new files
- **Data Management**: Handle JSON, CSV, and text files 