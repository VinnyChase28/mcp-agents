#!/usr/bin/env node

import { spawn, exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MCP_SERVERS = {
  math: 'servers/math-mcp',
  'file-manager': 'servers/file-manager-mcp',
  'api-client': 'servers/api-client-mcp',
  perplexity: 'servers/perplexity-mcp',
};

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function buildServer(serverName) {
  return new Promise((resolve, reject) => {
    const serverPath = MCP_SERVERS[serverName];
    if (!serverPath) {
      reject(new Error(`Unknown server: ${serverName}`));
      return;
    }

    log(`Building ${serverName} server...`, 'yellow');
    
    const buildProcess = spawn('pnpm', ['--filter', `@mcp-agents/${serverName}-mcp`, 'build'], {
      stdio: 'pipe',
      cwd: path.resolve(__dirname, '..'),
    });

    let output = '';
    buildProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    buildProcess.stderr.on('data', (data) => {
      output += data.toString();
    });

    buildProcess.on('close', (code) => {
      if (code === 0) {
        log(`✓ ${serverName} server built successfully`, 'green');
        resolve();
      } else {
        log(`✗ Failed to build ${serverName} server`, 'red');
        console.log(output);
        reject(new Error(`Build failed with code ${code}`));
      }
    });
  });
}

function restartWebServer() {
  return new Promise((resolve) => {
    log('Sending restart signal to web server...', 'cyan');
    
    // Send a request to a special restart endpoint (we'll create this)
    exec('curl -X POST http://localhost:3000/api/dev/restart-mcp 2>/dev/null', (error) => {
      if (error) {
        log('Web server restart signal failed (server might not be running)', 'yellow');
      } else {
        log('✓ Restart signal sent to web server', 'green');
      }
      resolve();
    });
  });
}

async function restartServer(serverName) {
  try {
    await buildServer(serverName);
    await restartWebServer();
    log(`🚀 ${serverName} server restarted successfully!`, 'bright');
  } catch (error) {
    log(`Failed to restart ${serverName}: ${error.message}`, 'red');
    process.exit(1);
  }
}

async function restartAllServers() {
  log('Restarting all MCP servers...', 'cyan');
  
  for (const serverName of Object.keys(MCP_SERVERS)) {
    try {
      await buildServer(serverName);
    } catch (error) {
      log(`Failed to build ${serverName}: ${error.message}`, 'red');
      process.exit(1);
    }
  }
  
  await restartWebServer();
  log('🚀 All MCP servers restarted successfully!', 'bright');
}

function showHelp() {
  log('MCP Development Utility', 'bright');
  log('');
  log('Usage:', 'yellow');
  log('  node scripts/dev-mcp.js <command> [server]', 'cyan');
  log('');
  log('Commands:', 'yellow');
  log('  restart <server>  - Restart a specific MCP server', 'cyan');
  log('  restart all       - Restart all MCP servers', 'cyan');
  log('  build <server>    - Build a specific MCP server', 'cyan');
  log('  list             - List available servers', 'cyan');
  log('');
  log('Available servers:', 'yellow');
  Object.keys(MCP_SERVERS).forEach(name => {
    log(`  - ${name}`, 'cyan');
  });
  log('');
  log('Examples:', 'yellow');
  log('  node scripts/dev-mcp.js restart math', 'cyan');
  log('  node scripts/dev-mcp.js restart all', 'cyan');
  log('  node scripts/dev-mcp.js build file-manager', 'cyan');
  log('');
  log('Or use the npm scripts:', 'yellow');
  log('  pnpm mcp:math', 'cyan');
  log('  pnpm mcp:restart', 'cyan');
}

function listServers() {
  log('Available MCP servers:', 'yellow');
  Object.entries(MCP_SERVERS).forEach(([name, serverPath]) => {
    const fullPath = path.resolve(__dirname, '..', serverPath);
    const exists = fs.existsSync(fullPath);
    const status = exists ? '✓' : '✗';
    const color = exists ? 'green' : 'red';
    log(`  ${status} ${name} (${serverPath})`, color);
  });
}

// Main CLI logic
const [,, command, target] = process.argv;

if (!command) {
  showHelp();
  process.exit(0);
}

switch (command) {
  case 'restart':
    if (!target) {
      log('Error: Please specify a server name or "all"', 'red');
      showHelp();
      process.exit(1);
    }
    
    if (target === 'all') {
      restartAllServers();
    } else if (MCP_SERVERS[target]) {
      restartServer(target);
    } else {
      log(`Error: Unknown server "${target}"`, 'red');
      listServers();
      process.exit(1);
    }
    break;
    
  case 'build':
    if (!target) {
      log('Error: Please specify a server name', 'red');
      showHelp();
      process.exit(1);
    }
    
    if (MCP_SERVERS[target]) {
      buildServer(target);
    } else {
      log(`Error: Unknown server "${target}"`, 'red');
      listServers();
      process.exit(1);
    }
    break;
    
  case 'list':
    listServers();
    break;
    
  default:
    log(`Error: Unknown command "${command}"`, 'red');
    showHelp();
    process.exit(1);
} 