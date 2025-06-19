# API Client MCP Server

A Model Context Protocol (MCP) server that provides HTTP request capabilities for Claude Desktop.

## 🌐 Available Tools

### `get_request`
Make a GET request to a URL.

**Parameters:**
- `url` (string): URL to make GET request to
- `headers` (object, optional): Optional HTTP headers

**Returns:** HTTP status and response data

### `post_request`
Make a POST request to a URL.

**Parameters:**
- `url` (string): URL to make POST request to
- `body` (string): Request body (typically JSON)
- `headers` (object, optional): Optional HTTP headers

**Returns:** HTTP status and response data

## 💬 Example Claude Desktop Prompts

### API Testing & Development
```
"Make a GET request to https://jsonplaceholder.typicode.com/posts/1"
"Fetch user data from https://jsonplaceholder.typicode.com/users/1"
"Get the current weather data from a weather API"
"Test my API endpoint at http://localhost:3000/api/status"
```

### Data Fetching
```
"Get a random quote from an API"
"Fetch the latest news headlines from a news API"
"Get cryptocurrency prices from a crypto API"
"Retrieve GitHub repository information for a specific repo"
```

### API Integration
```
"Post this data to my webhook: {\"message\": \"Hello from Claude\"}"
"Send a POST request to https://httpbin.org/post with test data"
"Make a request to my local development server"
"Test my authentication endpoint with sample credentials"
```

### Web Scraping & Data Collection
```
"Get the response from https://api.github.com/users/octocat"
"Fetch data from a public REST API and show me the structure"
"Make a request to check if my website is responding"
"Get JSON data from a public dataset API"
```

### Debugging & Monitoring
```
"Check the status of my API at http://localhost:3001/health"
"Test if my webhook endpoint is working"
"Make a request to see what headers my server returns"
"Send a test payload to my API and show me the response"
```

## 🧪 Testing

### Using MCP Inspector
```bash
cd servers/api-client-mcp
pnpm build
pnpm inspector
```

### Direct Testing (JSON-RPC)
```bash
# List available tools
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' | node dist/index.js

# Test GET request
echo '{"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "get_request", "arguments": {"url": "https://jsonplaceholder.typicode.com/posts/1"}}}' | node dist/index.js

# Test POST request
echo '{"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "post_request", "arguments": {"url": "https://httpbin.org/post", "body": "{\"test\": \"data\"}"}}}' | node dist/index.js

# Test with custom headers
echo '{"jsonrpc": "2.0", "id": 4, "method": "tools/call", "params": {"name": "get_request", "arguments": {"url": "https://api.github.com/users/octocat", "headers": {"User-Agent": "MCP-Client"}}}}' | node dist/index.js
```

## 🔗 Common APIs to Test With

### Public Testing APIs
- **JSONPlaceholder**: `https://jsonplaceholder.typicode.com/posts/1`
- **HTTPBin**: `https://httpbin.org/get` (for testing)
- **GitHub API**: `https://api.github.com/users/octocat`
- **Random Quotes**: `https://api.quotable.io/random`

### Local Development
- **Your API**: `http://localhost:3000/api/endpoint`
- **Health Checks**: `http://localhost:3001/health`
- **Webhooks**: `http://localhost:8080/webhook`

## 🔒 Security Considerations

**Important:** This server can make HTTP requests to any URL. Use responsibly:

- Be cautious with sensitive APIs and authentication
- Don't expose API keys in prompts (consider environment variables)
- Be aware of rate limits on external APIs
- Review requests before confirming in Claude Desktop
- Consider network security and firewall rules

## 📦 Installation & Setup

1. **Build the server:**
   ```bash
   cd servers/api-client-mcp
   pnpm install
   pnpm build
   ```

2. **Add to Claude Desktop config:**
   ```json
   {
     "mcpServers": {
       "api-client": {
         "command": "node",
         "args": ["/absolute/path/to/servers/api-client-mcp/dist/index.js"]
       }
     }
   }
   ```

3. **Restart Claude Desktop**

## 🔧 Development

- **Language**: TypeScript
- **Framework**: @modelcontextprotocol/sdk
- **HTTP Client**: Node.js fetch API
- **Validation**: Zod schemas
- **Build**: TypeScript compiler

### File Structure
```
servers/api-client-mcp/
├── src/
│   └── index.ts          # Main server implementation
├── dist/                 # Compiled JavaScript
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## 🚀 Use Cases

- **API Testing**: Test your own APIs during development
- **Data Integration**: Fetch data from external services
- **Webhook Testing**: Send test payloads to webhooks
- **Monitoring**: Check API health and status
- **Development**: Debug HTTP requests and responses
- **Research**: Explore public APIs and datasets
- **Automation**: Trigger external services and workflows

## 🔄 Future Enhancements

Potential improvements for this server:
- Authentication support (API keys, OAuth)
- Request timeout configuration
- Response caching
- Request retry logic
- Support for other HTTP methods (PUT, DELETE, PATCH)
- File upload capabilities
- Cookie handling 