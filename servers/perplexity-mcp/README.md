# Perplexity MCP Server

A Model Context Protocol (MCP) server that provides web search capabilities using the Perplexity AI API.

## Features

- **Real-time Web Search**: Search the web using Perplexity's Sonar models for up-to-date information
- **Academic Search**: Specialized search for scholarly and academic content
- **Domain Filtering**: Search within specific domains (e.g., reddit.com, github.com)
- **Recency Filtering**: Filter results by time (hour, day, week, month)
- **Multiple Models**: Support for different Perplexity models (sonar-pro, sonar-reasoning, sonar)

## Setup

1. **Get a Perplexity API Key**:

   - Visit [Perplexity API](https://docs.perplexity.ai/guides/getting-started)
   - Create an account and generate an API key
   - Set up billing (required for API usage)

2. **Set Environment Variable**:

   ```bash
   export PERPLEXITY_API_KEY="your_api_key_here"
   ```

3. **Install Dependencies**:

   ```bash
   pnpm install
   ```

4. **Build the Server**:
   ```bash
   pnpm build
   ```

## Available Tools

### `search`

General web search using Perplexity AI.

**Parameters**:

- `query` (required): The search query
- `model`: Model to use (sonar-pro, sonar-reasoning, sonar) - default: sonar-pro
- `search_domain_filter`: Array of domains to search within
- `search_recency_filter`: Filter by recency (hour, day, week, month)
- `return_images`: Whether to return relevant images
- `return_related_questions`: Whether to return related questions
- `max_tokens`: Maximum tokens in response (default: 1000)
- `temperature`: Temperature for response generation (0-2, default: 0.2)

**Example**:

```javascript
{
  "query": "latest developments in AI",
  "model": "sonar-pro",
  "search_recency_filter": "week",
  "return_related_questions": true
}
```

### `academic_search`

Specialized search for academic and scholarly content.

**Parameters**:

- `query` (required): The academic search query
- `max_tokens`: Maximum tokens in response (default: 1500)
- `return_related_questions`: Whether to return related questions (default: true)

**Example**:

```javascript
{
  "query": "machine learning in healthcare",
  "max_tokens": 2000
}
```

## Usage Examples

### Basic Web Search

```javascript
const result = await perplexityServer.search({
  query: "What are the latest trends in web development?",
});
```

### Domain-Specific Search

```javascript
const result = await perplexityServer.search({
  query: "React best practices",
  search_domain_filter: ["github.com", "stackoverflow.com"],
  search_recency_filter: "month",
});
```

### Academic Research

```javascript
const result = await perplexityServer.academicSearch({
  query: "quantum computing applications in cryptography",
});
```

## Integration with MCP Agents

This server integrates with the main MCP agents project and can be used alongside other tools like:

- Calculator tools (add, multiply, divide)
- File manager tools (read, write, list)
- API client tools (GET, POST requests)

## API Reference

Based on the [Perplexity API documentation](https://docs.perplexity.ai/guides/getting-started), this server supports:

- **Sonar Models**: Real-time web search capabilities
- **Search Filters**: Domain and recency filtering
- **Academic Focus**: Specialized academic search functionality
- **Rate Limiting**: Respects Perplexity API rate limits

## Environment Variables

- `PERPLEXITY_API_KEY`: Your Perplexity API key (required)
