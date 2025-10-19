#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.resolve(ROOT_DIR, 'src');

// Regular expressions for identifying common issues
const NEXT_LINK_IMPORT_REGEX = /import\s+(?:Link|(?:{[^}]*}))\s+from\s+['"]next\/link['"]/g;
const NEXT_ROUTER_IMPORT_REGEX = /import\s+(?:{[^}]*useRouter[^}]*}|useRouter)\s+from\s+['"]next\/(?:router|navigation)['"]/g;
const NEXT_IMAGE_IMPORT_REGEX = /import\s+(?:Image|(?:{[^}]*}))\s+from\s+['"]next\/image['"]/g;
const ALIAS_IMPORT_REGEX = /import\s+(?:{[^}]*}|\w+)\s+from\s+['"]@\/([^'"]+)['"]/g;
const DUPLICATE_IMPORT_REGEX = /import\s+{[\s\S]*?import\s+{/g;

// Replacement templates
const REACT_ROUTER_LINK_IMPORT = 'import { Link } from "react-router-dom"';
const REACT_ROUTER_HOOK_IMPORT = 'import { useNavigate, useLocation } from "react-router-dom"';

// Process a single file
function processFile(filePath) {
  // Skip node_modules and other non-source files
  if (filePath.includes('node_modules') || !filePath.match(/\.(tsx|ts|jsx|js)$/)) {
    return false;
  }

  // Read file content
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return false;
  }

  let hasChanges = false;
  let newContent = content;

  // Fix Next.js Link imports
  if (newContent.match(NEXT_LINK_IMPORT_REGEX)) {
    newContent = newContent.replace(NEXT_LINK_IMPORT_REGEX, REACT_ROUTER_LINK_IMPORT);
    hasChanges = true;
  }

  // Fix Next.js Router imports
  if (newContent.match(NEXT_ROUTER_IMPORT_REGEX)) {
    newContent = newContent.replace(NEXT_ROUTER_IMPORT_REGEX, REACT_ROUTER_HOOK_IMPORT);
    hasChanges = true;
  }

  // Fix Next.js Image imports (replace with regular img tag)
  if (newContent.match(NEXT_IMAGE_IMPORT_REGEX)) {
    newContent = newContent.replace(NEXT_IMAGE_IMPORT_REGEX, '// Next Image replaced with standard img');
    hasChanges = true;
  }

  // Fix path alias imports
  if (newContent.match(ALIAS_IMPORT_REGEX)) {
    // Get the relative path from the file to src directory
    const relativeToSrc = path.relative(path.dirname(filePath), SRC_DIR);
    
    // Replace @/ with relative path
    newContent = newContent.replace(ALIAS_IMPORT_REGEX, (match, importPath) => {
      const relativePath = relativeToSrc 
        ? `${relativeToSrc}/${importPath}`
        : `./${importPath}`;
      
      return match.replace(`@/${importPath}`, relativePath);
    });
    
    hasChanges = true;
  }

  // Fix duplicate import statements
  if (newContent.match(DUPLICATE_IMPORT_REGEX)) {
    // This is a more complex fix that would need custom handling for each case
    console.warn(`⚠️ Potential duplicate imports in ${filePath} - needs manual review`);
  }

  // Write changes if needed
  if (hasChanges) {
    try {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Fixed imports in ${filePath}`);
      return true;
    } catch (error) {
      console.error(`Error writing file ${filePath}:`, error);
      return false;
    }
  }

  return false;
}

// Process all files in a directory recursively
function processDirectory(directoryPath) {
  let fixedFiles = 0;

  const files = fs.readdirSync(directoryPath);

  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      fixedFiles += processDirectory(filePath);
    } else {
      if (processFile(filePath)) {
        fixedFiles++;
      }
    }
  }

  return fixedFiles;
}

// Main function
function main() {
  console.log('🔍 Analyzing and fixing import issues...');
  const startTime = Date.now();
  
  const fixedFiles = processDirectory(SRC_DIR);
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log(`\n✨ Done! Fixed imports in ${fixedFiles} files in ${duration}s`);
}

main(); 