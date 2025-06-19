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
