#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get current file directory with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const ROOT_DIR = path.resolve(__dirname, '..');
const NEXT_COMPONENTS_DIR = path.resolve(ROOT_DIR, '..', 'components');
const NEXT_APP_COMPONENTS_DIR = path.resolve(ROOT_DIR, '..', 'app', 'components');
const VITE_COMPONENTS_DIR = path.resolve(ROOT_DIR, 'src', 'components');

// Helper functions
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

function migrateComponent(sourcePath, destPath, componentName) {
  if (!fs.existsSync(sourcePath)) {
    console.error(`Source file doesn't exist: ${sourcePath}`);
    return;
  }

  const sourceContent = fs.readFileSync(sourcePath, 'utf8');
  
  // Create the destination directory if it doesn't exist
  const destDir = path.dirname(destPath);
  ensureDirectoryExists(destDir);
  
  // Transform component content (from functional to class-based)
  let transformedContent = transformToClassComponent(sourceContent, componentName);
  
  // Write to destination
  fs.writeFileSync(destPath, transformedContent);
  console.log(`Migrated: ${sourcePath} -> ${destPath}`);
}

function transformToClassComponent(content, componentName) {
  // This is a simplified transformation that would need to be enhanced
  // for real-world components with hooks, etc.
  
  // Look for hooks usage
  const usesState = content.includes('useState');
  const usesEffect = content.includes('useEffect');
  const usesRef = content.includes('useRef');
  
  // Create a basic class component structure
  let classComponent = `import React, { Component } from 'react';\n`;
  
  // Extract imports from original content
  const importLines = content.match(/^import.*$/gm) || [];
  importLines.forEach(line => {
    if (!line.includes("'react'") && !line.includes('"react"')) {
      classComponent += line + '\n';
    }
  });
  
  // Component props type
  const propsTypeMatch = content.match(/interface\s+(\w+Props)\s*{([\s\S]*?)}/);
  let propsType = 'any';
  if (propsTypeMatch) {
    propsType = propsTypeMatch[1];
    classComponent += `\n${propsTypeMatch[0]}\n`;
  }
  
  // Component state type
  let stateType = 'any';
  if (usesState) {
    classComponent += `\ninterface ${componentName}State {\n  // TODO: Add state properties\n}\n`;
    stateType = `${componentName}State`;
  }
  
  // Start class definition
  classComponent += `\nclass ${componentName} extends Component<${propsType}, ${stateType}> {\n`;
  
  // Constructor for state initialization
  if (usesState) {
    classComponent += `  constructor(props: ${propsType}) {\n`;
    classComponent += `    super(props);\n`;
    classComponent += `    this.state = {\n      // TODO: Initialize state from useState hooks\n    };\n`;
    classComponent += `  }\n\n`;
  }
  
  // Lifecycle methods
  if (usesEffect) {
    classComponent += `  componentDidMount() {\n`;
    classComponent += `    // TODO: Move useEffect with empty dependency array here\n`;
    classComponent += `  }\n\n`;
    
    classComponent += `  componentDidUpdate(prevProps: ${propsType}, prevState: ${stateType}) {\n`;
    classComponent += `    // TODO: Move useEffect with dependencies here\n`;
    classComponent += `  }\n\n`;
    
    classComponent += `  componentWillUnmount() {\n`;
    classComponent += `    // TODO: Move cleanup functions from useEffect here\n`;
    classComponent += `  }\n\n`;
  }
  
  // Ref creation if needed
  if (usesRef) {
    classComponent += `  // TODO: Replace useRef with React.createRef()\n\n`;
  }
  
  // Render method
  classComponent += `  render() {\n`;
  
  // Try to extract the return statement
  const returnMatch = content.match(/return\s*\(([\s\S]*?)\);/);
  if (returnMatch) {
    classComponent += `    return (${returnMatch[1]});\n`;
  } else {
    classComponent += `    // TODO: Implement render method based on original component\n`;
    classComponent += `    return null;\n`;
  }
  
  classComponent += `  }\n`;
  classComponent += `}\n\n`;
  classComponent += `export default ${componentName};\n`;
  
  return classComponent;
}

// Main migration function
function migrateAllComponents() {
  // First, migrate UI components
  const nextUIDir = path.join(NEXT_COMPONENTS_DIR, 'ui');
  const viteUIDir = path.join(VITE_COMPONENTS_DIR, 'ui');
  ensureDirectoryExists(viteUIDir);
  
  // Read all UI components
  const uiFiles = fs.readdirSync(nextUIDir);
  uiFiles.forEach(file => {
    if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      const sourcePath = path.join(nextUIDir, file);
      const fileName = path.basename(file);
      // Convert to PascalCase for the destination filename
      const baseName = fileName.split('.')[0];
      const pascalCaseName = baseName
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
      const destPath = path.join(viteUIDir, `${pascalCaseName}.tsx`);
      
      // Skip if destination file already exists
      if (fs.existsSync(destPath)) {
        console.log(`Skipping existing component: ${destPath}`);
        return;
      }
      
      migrateComponent(sourcePath, destPath, pascalCaseName);
    }
  });

  // Migrate layout components
  const layoutsSrc = path.join(NEXT_COMPONENTS_DIR, 'layouts');
  const layoutsDest = path.join(VITE_COMPONENTS_DIR, 'layouts');
  if (fs.existsSync(layoutsSrc)) {
    ensureDirectoryExists(layoutsDest);
    const layoutFiles = fs.readdirSync(layoutsSrc);
    layoutFiles.forEach(file => {
      if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
        const sourcePath = path.join(layoutsSrc, file);
        const fileName = path.basename(file);
        // Convert to PascalCase
        const baseName = fileName.split('.')[0];
        const pascalCaseName = baseName
          .split('-')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join('');
        const destPath = path.join(layoutsDest, `${pascalCaseName}.tsx`);
        
        if (fs.existsSync(destPath)) {
          console.log(`Skipping existing component: ${destPath}`);
          return;
        }
        
        migrateComponent(sourcePath, destPath, pascalCaseName);
      }
    });
  }

  // Migrate other component folders (jobs, auth, etc.)
  const componentFolders = ['auth', 'jobs', 'resume', 'employer'];
  componentFolders.forEach(folder => {
    const folderSrc = path.join(NEXT_COMPONENTS_DIR, folder);
    if (fs.existsSync(folderSrc)) {
      const folderDest = path.join(VITE_COMPONENTS_DIR, folder);
      ensureDirectoryExists(folderDest);
      
      // Process all files in the folder recursively
      migrateFilesRecursively(folderSrc, folderDest);
    }
  });

  // Migrate app/components
  if (fs.existsSync(NEXT_APP_COMPONENTS_DIR)) {
    const appComponentFolders = fs.readdirSync(NEXT_APP_COMPONENTS_DIR);
    appComponentFolders.forEach(folder => {
      const folderSrc = path.join(NEXT_APP_COMPONENTS_DIR, folder);
      if (fs.statSync(folderSrc).isDirectory()) {
        const folderDest = path.join(VITE_COMPONENTS_DIR, folder);
        ensureDirectoryExists(folderDest);
        
        // Process all files in the folder recursively
        migrateFilesRecursively(folderSrc, folderDest);
      }
    });
  }

  // Migrate root components like navbar.tsx, footer.tsx
  const rootComponents = ['navbar.tsx', 'footer.tsx', 'theme-provider.tsx'];
  rootComponents.forEach(file => {
    const sourcePath = path.join(NEXT_COMPONENTS_DIR, file);
    if (fs.existsSync(sourcePath)) {
      const fileName = path.basename(file);
      // Convert to PascalCase
      const baseName = fileName.split('.')[0];
      const pascalCaseName = baseName
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
      const destPath = path.join(VITE_COMPONENTS_DIR, `${pascalCaseName}.tsx`);
      
      if (fs.existsSync(destPath)) {
        console.log(`Skipping existing component: ${destPath}`);
        return;
      }
      
      migrateComponent(sourcePath, destPath, pascalCaseName);
    }
  });

  console.log('Migration completed!');
}

function migrateFilesRecursively(sourceDir, destDir) {
  ensureDirectoryExists(destDir);
  
  const items = fs.readdirSync(sourceDir);
  items.forEach(item => {
    const sourcePath = path.join(sourceDir, item);
    const stat = fs.statSync(sourcePath);
    
    if (stat.isDirectory()) {
      // Recursively process subdirectories
      const subDestDir = path.join(destDir, item);
      migrateFilesRecursively(sourcePath, subDestDir);
    } else if (item.endsWith('.tsx') || item.endsWith('.jsx')) {
      // Process component file
      const baseName = item.split('.')[0];
      const pascalCaseName = baseName
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
      const destPath = path.join(destDir, `${pascalCaseName}.tsx`);
      
      if (fs.existsSync(destPath)) {
        console.log(`Skipping existing component: ${destPath}`);
        return;
      }
      
      migrateComponent(sourcePath, destPath, pascalCaseName);
    }
  });
}

// Execute migration
migrateAllComponents(); 