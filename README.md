# MCP Agents

## Overview

This is a TypeScript monorepo for building and running Model Context Protocol (MCP) agents. It features a Next.js frontend and a collection of backend MCP servers that provide various tools to the AI model.

The project is built with **PNPM Workspaces** and accelerated by **Turborepo** for efficient monorepo management.

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- PNPM >= 9.1.1

### Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/mcp-agents.git
    cd mcp-agents
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**
    Copy the `.env.example` file to `.env.local` and add your API keys.

    ```bash
    cp .env.example .env.local
    ```

4.  **Run in development mode:**
    This command starts all development servers, including the Next.js frontend and all MCP servers, in watch mode.
    ```bash
    pnpm dev
    ```
    The web interface will be available at `http://localhost:3000`.

## Scripts

This monorepo uses PNPM workspaces. You can run the following commands from the root directory:

| Command                 | Description                                            |
| :---------------------- | :----------------------------------------------------- |
| `pnpm dev`              | Starts all development servers in watch mode.          |
| `pnpm build`            | Builds all packages and apps for production.           |
| `pnpm test`             | Runs all tests in watch mode.                          |
| `pnpm test:integration` | Runs the full test suite once.                         |
| `pnpm lint`             | Lints all files across the monorepo.                   |
| `pnpm typecheck`        | Runs a full TypeScript build to check for type errors. |
| `pnpm clean`            | Removes all `dist` and `.turbo` directories.           |

## Project Structure

The monorepo is organized into the following main directories:

- `apps/web`: The Next.js chat interface.
- `packages/*`: Shared libraries for types (`shared-types`), utilities (`utils`), and configurations (`config`).
- `servers/*`: The individual MCP servers that provide tools to the AI model.
- `tests/`: Integration tests for the complete tool-calling API flow.

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## License

This project is licensed under the **MIT License**.

## The Pillars of MCP Servers

MCP (Model Context Protocol) servers are designed to extend the capabilities of AI models by providing structured, secure, and standardized access to external tools, data, and workflows. The core pillars of MCP servers can be summarized as follows:

**1. Tools**

- Tools are executable functions that AI models can invoke through the MCP protocol. Each tool has defined parameters and return values, allowing models to perform actions such as querying a database, sending an email, or manipulating files.
- Tool invocation is typically controlled by explicit user approval or permissions, ensuring a human-in-the-loop for safety and oversight.

**2. Resources**

- Resources represent structured access to data—such as files, databases, APIs, or other information sources. MCP servers standardize how this data is exposed, so AI models do not need to understand the underlying structure; they simply request what they need via the MCP interface.
- This abstraction layer enables secure and consistent data access across different environments.

**3. Prompts**

- Prompts are pre-defined templates or instructions for common tasks. They help standardize model behavior for specific workflows, making interactions more predictable and maintainable.
- Prompts can guide the AI in how to approach certain problems or requests, improving reliability and reducing ambiguity.

## Supporting Components

In addition to the three main pillars, MCP servers rely on several supporting architectural components:

- **Communication Layer:** Handles the MCP protocol, typically using JSON-RPC 2.0 for structured, stateful communication between clients and servers.
- **Session Management:** Maintains conversation state across interactions, enabling context-aware responses and actions.
- **Authentication & Security:** Ensures that only authorized clients and users can access tools and resources, often employing OAuth or similar protocols.
- **Capability Negotiation:** At connection, the server advertises its available tools, resources, and prompts, allowing clients to dynamically discover and utilize server capabilities.

## Summary Table

| Pillar    | Description                                                                            |
| --------- | -------------------------------------------------------------------------------------- |
| Tools     | Executable functions the AI can call (with defined parameters and results)             |
| Resources | Secure, abstracted access to structured data (files, databases, APIs)                  |
| Prompts   | Pre-written templates or instructions for standardized, predictable model interactions |

These pillars, supported by robust communication, security, and session management, enable MCP servers to act as powerful, safe, and flexible bridges between AI models and real-world capabilities.

## End-to-End Invocation Flow

Here is a step-by-step breakdown of the data flow from the user to the MCP servers and back:

1.  **User**: Interacts with the chat interface, sending a message like `"What is 2+2?"`.
2.  **Frontend (Next.js App)**: Captures the message and makes a `POST` request to the `/api/chat` endpoint with the conversation history.
3.  **Chat API (`/api/chat`)**:
    - Calls the `withMCPTools` helper function.
    - The helper initializes clients for all MCP servers (Math, File Manager, etc.) and aggregates their `tools`.
4.  **`withMCPTools` Helper**:
    - Invokes the AI SDK's `streamText` function.
    - This sends the user's prompt, message history, and the combined list of available tools to the LLM.
5.  **LLM (Anthropic Claude)**:
    - Analyzes the request and decides to use a tool.
    - Responds with a structured "tool call" object, e.g., `{ toolName: 'evaluate', args: { expression: '2+2' } }`.
6.  **`withMCPTools` Helper**:
    - Receives the tool call from the LLM.
    - Identifies the correct MCP server responsible for the `evaluate` tool (the Math server).
    - Sends a `tools/call` JSON-RPC request to the Math server over its stdio transport.
7.  **MCP Server (Math)**:
    - Receives the request and executes the `evaluate("2+2")` function.
    - Returns the result (`"4"`) back to the helper via stdio.
8.  **`withMCPTools` Helper**:
    - Receives the tool result.
    - Sends the result back to the LLM for interpretation.
9.  **LLM (Anthropic Claude)**:
    - Formulates a natural language response based on the tool's output (e.g., "The result is 4.").
10. **API & Frontend**:
    - The final response is streamed from the `Chat API` back to the `Frontend`.
    - The `User` sees the final answer rendered in the chat window.

These pillars, supported by robust communication, security, and session management, enable MCP servers to act as powerful, safe, and flexible bridges between AI models and real-world capabilities.
