import { FileNode, DirectoryNode } from '../types';

/**
 * CodeAnalyzer - Analyzes code files to extract relationships
 * 
 * Constitution Compliance:
 * - All analysis happens locally in browser
 * - No external API calls
 * - Simple regex-based parsing (no heavy parsers)
 * 
 * Features:
 * - Extract import statements
 * - Detect function calls
 * - Find variable references
 */

export interface CodeRelationship {
  fromFile: string; // File path that references
  toFile: string;   // File path being referenced
  type: 'import' | 'export' | 'function-call' | 'variable-ref';
  lineNumber?: number;
  identifier?: string; // Function/variable name
}

export class CodeAnalyzer {
  /**
   * Analyze a file's content to extract relationships
   */
  analyzeFile(file: FileNode, allFiles: Map<string, FileNode>): CodeRelationship[] {
    if (!file.content) {
      return [];
    }

    const relationships: CodeRelationship[] = [];
    const language = file.language;

    // Extract imports based on language
    if (language === 'TypeScript' || language === 'JavaScript' || language === 'TSX' || language === 'JSX') {
      relationships.push(...this.analyzeJavaScriptImports(file, allFiles));
    } else if (language === 'Python') {
      relationships.push(...this.analyzePythonImports(file, allFiles));
    } else if (language === 'Java') {
      relationships.push(...this.analyzeJavaImports(file, allFiles));
    } else if (language === 'Swift') {
      relationships.push(...this.analyzeSwiftImports(file, allFiles));
    } else if (language === 'Go') {
      relationships.push(...this.analyzeGoImports(file, allFiles));
    } else if (language === 'C' || language === 'C++' || language === 'C Header') {
      relationships.push(...this.analyzeCImports(file, allFiles));
    } else if (language === 'Rust') {
      relationships.push(...this.analyzeRustImports(file, allFiles));
    }

    return relationships;
  }

  /**
   * Analyze JavaScript/TypeScript imports
   */
  private analyzeJavaScriptImports(file: FileNode, allFiles: Map<string, FileNode>): CodeRelationship[] {
    const relationships: CodeRelationship[] = [];
    const content = file.content || '';
    const lines = content.split('\n');

    // Match various import patterns
    const importPatterns = [
      /import\s+.*\s+from\s+['"](.+?)['"]/g,  // import X from 'Y'
      /import\s+['"](.+?)['"]/g,              // import 'Y'
      /require\s*\(\s*['"](.+?)['"]\s*\)/g,   // require('Y')
      /import\s*\(\s*['"](.+?)['"]\s*\)/g,    // import('Y')
    ];

    lines.forEach((line, index) => {
      importPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const importPath = match[1];
          if (importPath) {
            const resolvedPath = this.resolveImportPath(file.path, importPath);
            const targetFile = this.findFileByPath(resolvedPath, allFiles);
            
            if (targetFile) {
              relationships.push({
                fromFile: file.path,
                toFile: targetFile.path,
                type: 'import',
                lineNumber: index + 1,
                identifier: importPath,
              });
            }
          }
        }
      });
    });

    return relationships;
  }

  /**
   * Analyze Python imports
   */
  private analyzePythonImports(file: FileNode, allFiles: Map<string, FileNode>): CodeRelationship[] {
    const relationships: CodeRelationship[] = [];
    const content = file.content || '';
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Pattern 1: import module (with optional alias)
      // import os, sys, json
      // import numpy as np
      // import pandas as pd, matplotlib.pyplot as plt
      const importMatch = /^import\s+(.+)/.exec(trimmed);
      if (importMatch && importMatch[1]) {
        const modules = importMatch[1].split(',').map(m => m.trim());
        modules.forEach(moduleSpec => {
          // Handle "module as alias" or just "module"
          const asMatch = /^([a-zA-Z0-9_.]+)(?:\s+as\s+\w+)?/.exec(moduleSpec);
          if (asMatch && asMatch[1]) {
            const moduleName = asMatch[1];
            const targetFile = this.findPythonModule(file.path, moduleName, allFiles);
            if (targetFile) {
              relationships.push({
                fromFile: file.path,
                toFile: targetFile.path,
                type: 'import',
                lineNumber: index + 1,
                identifier: moduleName,
              });
            }
          }
        });
      }
      
      // Pattern 2: from module import X (with optional alias)
      // from package.module import Class, function
      // from typing import List as L, Dict as D
      const fromImportMatch = /^from\s+([a-zA-Z0-9_.]+)\s+import/.exec(trimmed);
      if (fromImportMatch && fromImportMatch[1]) {
        const moduleName = fromImportMatch[1];
        const targetFile = this.findPythonModule(file.path, moduleName, allFiles);
        if (targetFile) {
          relationships.push({
            fromFile: file.path,
            toFile: targetFile.path,
            type: 'import',
            lineNumber: index + 1,
            identifier: moduleName,
          });
        }
      }
      
      // Pattern 3: Relative imports (with optional alias)
      // from . import module
      // from .. import module
      // from .module import Class as C
      const relativeImportMatch = /^from\s+(\.+)(\w*)\s+import/.exec(trimmed);
      if (relativeImportMatch && relativeImportMatch[1]) {
        const dots = relativeImportMatch[1];
        const moduleName = relativeImportMatch[2] || '';
        const targetFile = this.findPythonRelativeImport(file.path, dots, moduleName, allFiles);
        if (targetFile) {
          relationships.push({
            fromFile: file.path,
            toFile: targetFile.path,
            type: 'import',
            lineNumber: index + 1,
            identifier: `${dots}${moduleName}`,
          });
        }
      }
    });

    return relationships;
  }

  /**
   * Analyze Java imports
   */
  private analyzeJavaImports(file: FileNode, allFiles: Map<string, FileNode>): CodeRelationship[] {
    const relationships: CodeRelationship[] = [];
    const content = file.content || '';
    const lines = content.split('\n');

    // Match Java import patterns
    const importPattern = /^import\s+(static\s+)?([a-zA-Z0-9_.]+);/;

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      const match = importPattern.exec(trimmed);
      if (match && match[2]) {
        const className = match[2];
        const simpleName = className.split('.').pop() || className;
        
        // Try to find matching Java file
        const targetFile = this.findFileByName(simpleName + '.java', allFiles);
        if (targetFile) {
          relationships.push({
            fromFile: file.path,
            toFile: targetFile.path,
            type: 'import',
            lineNumber: index + 1,
            identifier: className,
          });
        }
      }
    });

    return relationships;
  }

  /**
   * Analyze Swift relationships
   * Swift uses module imports (Foundation, UIKit, etc), not file imports.
   * Instead, we detect class/struct/protocol usage across files.
   */
  private analyzeSwiftImports(file: FileNode, allFiles: Map<string, FileNode>): CodeRelationship[] {
    const relationships: CodeRelationship[] = [];
    const content = file.content || '';

    // Extract type definitions (class, struct, protocol, enum, actor) from this file
    const typeDefPattern = /^\s*(public\s+|private\s+|internal\s+|open\s+)?(class|struct|protocol|enum|actor)\s+([a-zA-Z0-9_]+)/;
    
    // Look for type usage in other Swift files
    allFiles.forEach((otherFile, _path) => {
      if (otherFile.type === 'file' && 
          otherFile.language === 'Swift' && 
          otherFile.path !== file.path &&
          otherFile.content) {
        
        const otherLines = otherFile.content.split('\n');
        
        // Find types defined in the other file
        otherLines.forEach((line, index) => {
          const match = typeDefPattern.exec(line);
          if (match && match[3]) {
            const typeName = match[3];
            
            // Check if this file uses that type
            const usagePattern = new RegExp(`\\b${typeName}\\b`);
            if (content.match(usagePattern)) {
              relationships.push({
                fromFile: file.path,
                toFile: otherFile.path,
                type: 'import',
                lineNumber: index + 1,
                identifier: typeName,
              });
            }
          }
        });
      }
    });

    return relationships;
  }

  /**
   * Analyze Go imports
   */
  private analyzeGoImports(file: FileNode, allFiles: Map<string, FileNode>): CodeRelationship[] {
    const relationships: CodeRelationship[] = [];
    const content = file.content || '';
    const lines = content.split('\n');

    // Match Go import patterns
    const importPatterns = [
      /^import\s+"([^"]+)"/,                    // import "package"
      /^\s+"([^"]+)"/,                          // "package" (inside import block)
    ];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      importPatterns.forEach(pattern => {
        const match = pattern.exec(trimmed);
        if (match && match[1]) {
          const packagePath = match[1];
          const packageName = packagePath.split('/').pop() || packagePath;
          
          // Try to find matching Go file
          const targetFile = this.findFileByName(packageName + '.go', allFiles) || 
                            this.findFileInDirectory(packagePath, allFiles);
          if (targetFile) {
            relationships.push({
              fromFile: file.path,
              toFile: targetFile.path,
              type: 'import',
              lineNumber: index + 1,
              identifier: packagePath,
            });
          }
        }
      });
    });

    return relationships;
  }

  /**
   * Analyze C/C++ includes
   */
  private analyzeCImports(file: FileNode, allFiles: Map<string, FileNode>): CodeRelationship[] {
    const relationships: CodeRelationship[] = [];
    const content = file.content || '';
    const lines = content.split('\n');

    // Match C/C++ include patterns
    const includePatterns = [
      /#include\s+"([^"]+)"/,                   // #include "file.h"
      /#include\s+<([^>]+)>/,                   // #include <file.h>
    ];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      includePatterns.forEach(pattern => {
        const match = pattern.exec(trimmed);
        if (match && match[1]) {
          const headerName = match[1];
          
          // Try to find matching header or source file
          const targetFile = this.findFileByPath(headerName, allFiles) ||
                            this.findFileByName(headerName, allFiles);
          if (targetFile) {
            relationships.push({
              fromFile: file.path,
              toFile: targetFile.path,
              type: 'import',
              lineNumber: index + 1,
              identifier: headerName,
            });
          }
        }
      });
    });

    return relationships;
  }

  /**
   * Analyze Rust imports
   */
  private analyzeRustImports(file: FileNode, allFiles: Map<string, FileNode>): CodeRelationship[] {
    const relationships: CodeRelationship[] = [];
    const content = file.content || '';
    const lines = content.split('\n');

    // Match Rust use patterns
    const usePatterns = [
      /^use\s+([a-zA-Z0-9_:]+)/,                // use module::item
      /^mod\s+([a-zA-Z0-9_]+)/,                 // mod module
    ];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      usePatterns.forEach(pattern => {
        const match = pattern.exec(trimmed);
        if (match && match[1]) {
          const modulePath = match[1];
          const moduleName = modulePath.split('::')[0] || modulePath;
          
          // Try to find matching Rust file
          const targetFile = this.findFileByName(moduleName + '.rs', allFiles);
          if (targetFile) {
            relationships.push({
              fromFile: file.path,
              toFile: targetFile.path,
              type: 'import',
              lineNumber: index + 1,
              identifier: modulePath,
            });
          }
        }
      });
    });

    return relationships;
  }

  /**
   * Resolve relative import path to absolute
   */
  private resolveImportPath(fromPath: string, importPath: string): string {
    // Handle relative imports
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      const fromDir = fromPath.substring(0, fromPath.lastIndexOf('/'));
      const parts = fromDir.split('/').filter(p => p);
      const importParts = importPath.split('/').filter(p => p);

      importParts.forEach(part => {
        if (part === '..') {
          parts.pop();
        } else if (part !== '.') {
          parts.push(part);
        }
      });

      let resolved = parts.join('/');
      return resolved;
    }

    // Absolute or node_modules imports - just return as is
    return importPath;
  }

  /**
   * Find a file by path in the files map
   */
  private findFileByPath(searchPath: string, allFiles: Map<string, FileNode>): FileNode | null {
    // Try exact match first
    if (allFiles.has(searchPath)) {
      return allFiles.get(searchPath) || null;
    }

    // Try with common extensions
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '/index.ts', '/index.tsx', '/index.js'];
    for (const ext of extensions) {
      const withExt = searchPath + ext;
      if (allFiles.has(withExt)) {
        return allFiles.get(withExt) || null;
      }
    }

    // Try fuzzy match (ends with)
    for (const [path, file] of allFiles.entries()) {
      if (path.endsWith(searchPath) || path.endsWith(searchPath + '.ts') || 
          path.endsWith(searchPath + '.tsx') || path.endsWith(searchPath + '.js')) {
        return file;
      }
    }

    return null;
  }

  /**
   * Find Python module by name
   */
  private findPythonModule(_fromPath: string, moduleName: string, allFiles: Map<string, FileNode>): FileNode | null {
    // Convert module name to file path
    const modulePath = moduleName.replace(/\./g, '/');
    
    // Try as .py file
    const pyFile = modulePath + '.py';
    if (allFiles.has(pyFile)) {
      return allFiles.get(pyFile) || null;
    }

    // Try as __init__.py in directory
    const initFile = modulePath + '/__init__.py';
    if (allFiles.has(initFile)) {
      return allFiles.get(initFile) || null;
    }

    // For absolute imports (e.g., "from app.config import settings"),
    // try to find files that contain the module path
    // This handles cases where the root package name is in the import
    for (const [path, file] of allFiles.entries()) {
      // Check if the file path ends with the module path
      if (path.endsWith(modulePath + '.py')) {
        return file;
      }
      if (path.endsWith(modulePath + '/__init__.py')) {
        return file;
      }
      
      // Also check if removing the first segment matches
      // e.g., "app.config.settings" -> "config/settings.py" might match "app/config/settings.py"
      const parts = modulePath.split('/');
      if (parts.length > 1) {
        const withoutRoot = parts.slice(1).join('/');
        if (path.endsWith(withoutRoot + '.py')) {
          return file;
        }
        if (path.endsWith(withoutRoot + '/__init__.py')) {
          return file;
        }
      }
    }

    // Try finding by filename only (for single-level imports)
    const fileName = moduleName.split('.').pop() + '.py';
    return this.findFileByName(fileName, allFiles);
  }

  /**
   * Find Python module using relative import syntax
   * dots: number of parent directories to traverse ('.' = same dir, '..' = parent, etc)
   */
  private findPythonRelativeImport(
    fromPath: string, 
    dots: string, 
    moduleName: string, 
    allFiles: Map<string, FileNode>
  ): FileNode | null {
    // Get directory of the importing file
    let currentDir = fromPath.substring(0, fromPath.lastIndexOf('/'));
    
    // Move up directories based on number of dots
    const levelUp = dots.length - 1; // '.' = 0 levels up, '..' = 1 level up, etc.
    for (let i = 0; i < levelUp; i++) {
      const lastSlash = currentDir.lastIndexOf('/');
      if (lastSlash === -1) break;
      currentDir = currentDir.substring(0, lastSlash);
    }
    
    // If moduleName is empty, we're importing from __init__.py in that directory
    if (!moduleName) {
      const initPath = currentDir + '/__init__.py';
      if (allFiles.has(initPath)) {
        return allFiles.get(initPath) || null;
      }
      return null;
    }
    
    // Build the full path to the module
    const fullPath = currentDir + '/' + moduleName.replace(/\./g, '/');
    
    // Try as .py file
    const pyFile = fullPath + '.py';
    if (allFiles.has(pyFile)) {
      return allFiles.get(pyFile) || null;
    }
    
    // Try as __init__.py in directory
    const initFile = fullPath + '/__init__.py';
    if (allFiles.has(initFile)) {
      return allFiles.get(initFile) || null;
    }
    
    return null;
  }

  /**
   * Find a file by its name (searches all files)
   */
  private findFileByName(fileName: string, allFiles: Map<string, FileNode>): FileNode | null {
    for (const [_path, file] of allFiles.entries()) {
      if (file.name === fileName) {
        return file;
      }
    }
    return null;
  }

  /**
   * Find a file in a directory by path
   */
  private findFileInDirectory(dirPath: string, allFiles: Map<string, FileNode>): FileNode | null {
    // Look for any file whose path contains the directory path
    for (const [path, file] of allFiles.entries()) {
      if (path.includes(dirPath)) {
        return file;
      }
    }
    return null;
  }

  /**
   * Build a map of all files in the repository
   */
  buildFileMap(rootNode: DirectoryNode): Map<string, FileNode> {
    const fileMap = new Map<string, FileNode>();
    this.collectFiles(rootNode, fileMap);
    return fileMap;
  }

  /**
   * Recursively collect all files
   */
  private collectFiles(node: FileNode | DirectoryNode, fileMap: Map<string, FileNode>): void {
    if (node.type === 'file') {
      fileMap.set(node.path, node);
      // Also add relative path variant if available
      if (node.relativePath) {
        fileMap.set(node.relativePath, node);
      }
    } else {
      node.children.forEach(child => this.collectFiles(child, fileMap));
    }
  }
}
