#!/usr/bin/env node

/**
 * Script to automatically generate TypeScript path mappings for all packages
 * This ensures new packages are automatically available via @/mcp-agents/* imports
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function findPackages() {
  const packagesDir = path.join(rootDir, 'packages');
  const appsDir = path.join(rootDir, 'apps');
  const serversDir = path.join(rootDir, 'servers');
  
  const packages = [];
  
  // Find all packages
  if (fs.existsSync(packagesDir)) {
    const packageFolders = fs.readdirSync(packagesDir);
    for (const folder of packageFolders) {
      const packageJsonPath = path.join(packagesDir, folder, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        packages.push({
          name: packageJson.name,
          path: `packages/${folder}`,
          type: 'package'
        });
      }
    }
  }
  
  // Find all apps
  if (fs.existsSync(appsDir)) {
    const appFolders = fs.readdirSync(appsDir);
    for (const folder of appFolders) {
      const packageJsonPath = path.join(appsDir, folder, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        packages.push({
          name: packageJson.name,
          path: `apps/${folder}`,
          type: 'app'
        });
      }
    }
  }
  
  // Find all servers
  if (fs.existsSync(serversDir)) {
    const serverFolders = fs.readdirSync(serversDir);
    for (const folder of serverFolders) {
      const packageJsonPath = path.join(serversDir, folder, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        packages.push({
          name: packageJson.name,
          path: `servers/${folder}`,
          type: 'server'
        });
      }
    }
  }
  
  return packages;
}

function generatePathMappings() {
  const packages = findPackages();
  const pathMappings = {
    // Base mappings
    "@/*": ["./src/*"],
    "@/apps/*": ["apps/*"],
    "@/packages/*": ["packages/*"],
    "@/servers/*": ["servers/*"]
  };
  
  // Add mappings for each package
  for (const pkg of packages) {
    if (pkg.name.startsWith('@mcp-agents/')) {
      const shortName = pkg.name.replace('@mcp-agents/', '');
      
      // Add both old-style and new-style mappings
      pathMappings[pkg.name] = [`${pkg.path}/src/index`];
      pathMappings[`${pkg.name}/*`] = [`${pkg.path}/src/*`];
      pathMappings[`@/mcp-agents/${shortName}`] = [`${pkg.path}/src/index`];
      pathMappings[`@/mcp-agents/${shortName}/*`] = [`${pkg.path}/src/*`];
    }
  }
  
  return pathMappings;
}

function updateTsConfig() {
  const tsConfigPath = path.join(rootDir, 'tsconfig.base.json');
  const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
  
  const pathMappings = generatePathMappings();
  tsConfig.compilerOptions.paths = pathMappings;
  
  fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2) + '\n');
  console.log('✅ Updated tsconfig.base.json with automatic path mappings');
  
  return pathMappings;
}

function updateWebAppTsConfig(pathMappings) {
  const webTsConfigPath = path.join(rootDir, 'apps/web/tsconfig.json');
  const webTsConfig = JSON.parse(fs.readFileSync(webTsConfigPath, 'utf8'));
  
  // Generate relative paths for web app
  const webPaths = {
    "@/*": ["./src/*"]
  };
  
  // Add package mappings with relative paths
  for (const [key, value] of Object.entries(pathMappings)) {
    if (key.startsWith('@/mcp-agents/')) {
      // For Next.js, point to the compiled dist files for packages
      if (key.includes('/config') || key.includes('/shared-types') || key.includes('/utils')) {
        webPaths[key] = value.map(p => `../../${p.replace('/src/index', '/dist/index')}`);
      } else {
        webPaths[key] = value.map(p => `../../${p}`);
      }
    }
  }
  
  webTsConfig.compilerOptions.paths = webPaths;
  fs.writeFileSync(webTsConfigPath, JSON.stringify(webTsConfig, null, 2) + '\n');
  console.log('✅ Updated apps/web/tsconfig.json');
}

function updateApiTsConfig(pathMappings) {
  const apiTsConfigPath = path.join(rootDir, 'apps/api/tsconfig.json');
  const apiTsConfig = JSON.parse(fs.readFileSync(apiTsConfigPath, 'utf8'));
  
  // Generate relative paths for API app
  const apiPaths = {
    "@/*": ["./src/*"],
    "@/routes/*": ["./src/routes/*"],
    "@/middleware/*": ["./src/middleware/*"],
    "@/utils/*": ["./src/utils/*"]
  };
  
  // Add package mappings with relative paths
  for (const [key, value] of Object.entries(pathMappings)) {
    if (key.startsWith('@/mcp-agents/')) {
      apiPaths[key] = value.map(p => `../../${p}`);
    }
  }
  
  apiTsConfig.compilerOptions.paths = apiPaths;
  fs.writeFileSync(apiTsConfigPath, JSON.stringify(apiTsConfig, null, 2) + '\n');
  console.log('✅ Updated apps/api/tsconfig.json');
}

// Main execution
console.log('🔧 Generating automatic TypeScript path mappings...');

const packages = findPackages();
console.log(`📦 Found ${packages.length} packages:`);
packages.forEach(pkg => {
  console.log(`  - ${pkg.name} (${pkg.type})`);
});

const pathMappings = updateTsConfig();
updateWebAppTsConfig(pathMappings);
updateApiTsConfig(pathMappings);

console.log('\n✅ All TypeScript configurations updated!');
console.log('\n📋 Available import patterns:');
console.log('  Local imports: import { Component } from "@/components/Button"');
console.log('  Package imports: import { Utils } from "@/mcp-agents/utils"');
console.log('  Monorepo navigation: import { Tool } from "@/servers/calculator-mcp/src/tools"'); 