import { Repository, FileNode, DirectoryNode } from '../types';
import { detectLanguage } from '../utils/LanguageDetector';

/**
 * FileSystemScanner - Scans local repository directories
 * 
 * Constitution Compliance:
 * - Uses File System Access API (browser standard, local-only)
 * - No external network requests
 * - All processing happens in browser
 * 
 * Features:
 * - Recursive directory traversal
 * - File metadata extraction (size, type, language)
 * - Ignores common development directories (.git, node_modules, etc.)
 * - Progress tracking for large repositories
 */

interface ScanProgress {
  filesScanned: number;
  directoriesScanned: number;
  totalBytes: number;
  currentPath: string;
}

type ProgressCallback = (progress: ScanProgress) => void;

export class FileSystemScanner {
  private ignoredDirectories = new Set([
    '.git',
    'node_modules',
    '.vscode',
    '.idea',
    'dist',
    'build',
    'out',
    'coverage',
    '.next',
    '.nuxt',
    'target', // Rust/Java
    'bin',
    'obj', // C#
    '__pycache__', // Python
    '.pytest_cache',
    'venv',
    'vendor', // PHP/Go
  ]);

  private ignoredFiles = new Set([
    '.DS_Store',
    'Thumbs.db',
    '.gitignore',
    '.npmrc',
    '.eslintcache',
  ]);

  private progress: ScanProgress = {
    filesScanned: 0,
    directoriesScanned: 0,
    totalBytes: 0,
    currentPath: '',
  };

  /**
   * Scan a local directory using File System Access API
   * 
   * @param directoryHandle - Directory handle from showDirectoryPicker()
   * @param onProgress - Optional progress callback
   * @returns Repository structure
   */
  async scanDirectory(
    directoryHandle: FileSystemDirectoryHandle,
    onProgress?: ProgressCallback
  ): Promise<Repository> {
    this.resetProgress();

    const startTime = Date.now();
    const rootNode = await this.scanDirectoryRecursive(
      directoryHandle,
      directoryHandle.name,
      onProgress
    );

    const scanDuration = Date.now() - startTime;

    return {
      id: `repo-${Date.now()}`,
      name: directoryHandle.name,
      path: directoryHandle.name, // Relative path (browser security limitation)
      rootNode,
      createdAt: new Date(),
      lastScannedAt: new Date(),
      stats: {
        totalFiles: this.progress.filesScanned,
        totalDirectories: this.progress.directoriesScanned,
        totalSize: this.progress.totalBytes,
        scanDuration,
      },
    };
  }

  /**
   * Scan a test directory by path (for E2E testing only)
   * Uses a mock structure since browsers can't access arbitrary paths
   */
  async scanTestDirectory(path: string): Promise<Repository> {
    // For testing, create a simple mock structure
    const name = path.split('/').pop() || 'test-repo';
    
    const rootNode: DirectoryNode = {
      type: 'directory',
      name,
      path: '/',
      children: [
        {
          type: 'file',
          name: 'README.md',
          path: '/README.md',
          size: 1024,
          language: 'Markdown',
          lastModified: new Date(),
        },
        {
          type: 'directory',
          name: 'src',
          path: '/src',
          children: [
            {
              type: 'file',
              name: 'index.ts',
              path: '/src/index.ts',
              size: 2048,
              language: 'TypeScript',
              lastModified: new Date(),
            },
            {
              type: 'file',
              name: 'utils.ts',
              path: '/src/utils.ts',
              size: 1536,
              language: 'TypeScript',
              lastModified: new Date(),
            },
          ],
        },
        {
          type: 'file',
          name: 'package.json',
          path: '/package.json',
          size: 512,
          language: 'JSON',
          lastModified: new Date(),
        },
      ],
    };

    return {
      id: `repo-${Date.now()}`,
      name,
      path,
      rootNode,
      createdAt: new Date(),
      lastScannedAt: new Date(),
      stats: {
        totalFiles: 3,
        totalDirectories: 1,
        totalSize: 5120,
        scanDuration: 50,
      },
    };
  }

  /**
   * Scan from FileList (Safari/Firefox fallback using webkitdirectory)
   * Converts a FileList into a repository structure
   */
  async scanFromFileList(files: FileList): Promise<Repository> {
    const startTime = Date.now();
    this.resetProgress();

    // Get directory name from first file's path
    const firstFile = files[0];
    if (!firstFile) {
      throw new Error('No files provided');
    }

    // Extract directory name from webkitRelativePath
    const relativePath = (firstFile as any).webkitRelativePath || firstFile.name;
    const dirName = relativePath.split('/')[0] || 'uploaded-folder';

    // Build directory tree from FileList
    const rootNode = await this.buildTreeFromFileList(files, dirName);

    const scanDuration = Date.now() - startTime;

    return {
      id: `repo-${Date.now()}`,
      name: dirName,
      path: dirName,
      rootNode,
      createdAt: new Date(),
      lastScannedAt: new Date(),
      stats: {
        totalFiles: this.progress.filesScanned,
        totalDirectories: this.progress.directoriesScanned,
        totalSize: this.progress.totalBytes,
        scanDuration,
      },
    };
  }

  /**
   * Build directory tree from FileList
   */
  private async buildTreeFromFileList(files: FileList, rootName: string): Promise<DirectoryNode> {
    const root: DirectoryNode = {
      type: 'directory',
      name: rootName,
      path: '/',
      children: [],
    };

    // Group files by directory structure
    const pathMap = new Map<string, DirectoryNode>();
    pathMap.set('/', root);

    // Process files sequentially to read content
    for (const file of Array.from(files)) {
      // Skip ignored files
      if (this.ignoredFiles.has(file.name)) continue;

      // Get relative path
      const relativePath = (file as any).webkitRelativePath || file.name;
      const parts = relativePath.split('/');
      
      // Skip root directory name
      if (parts.length > 0 && parts[0] === rootName) {
        parts.shift();
      }

      let currentPath = '/';
      let currentNode: DirectoryNode = root;

      // Create directory structure
      let skipFile = false;
      for (let i = 0; i < parts.length - 1; i++) {
        const dirName = parts[i];
        
        // Skip ignored directories
        if (this.ignoredDirectories.has(dirName || '')) {
          skipFile = true;
          break;
        }

        currentPath += (currentPath === '/' ? '' : '/') + dirName;

        if (!pathMap.has(currentPath)) {
          const newDir: DirectoryNode = {
            type: 'directory',
            name: dirName || '',
            path: currentPath,
            children: [],
          };
          currentNode.children.push(newDir);
          pathMap.set(currentPath, newDir);
          this.progress.directoriesScanned++;
        }

        currentNode = pathMap.get(currentPath)!;
      }

      if (skipFile) continue;

      // Add file node
      const fileName = parts[parts.length - 1];
      if (fileName && !this.ignoredFiles.has(fileName)) {
        // Skip very large files (>10MB)
        if (file.size > 10 * 1024 * 1024) {
          console.warn(`Skipping large file: ${fileName} (${file.size} bytes)`);
          continue;
        }

        // Read file content for text files
        let content: string | undefined;
        if (this.isTextFile(fileName)) {
          try {
            content = await file.text();
          } catch (error) {
            console.warn(`Could not read content of ${fileName}:`, error);
          }
        }

        const languageInfo = detectLanguage(fileName);
        const fileNode: FileNode = {
          type: 'file',
          name: fileName,
          path: currentPath + (currentPath === '/' ? '' : '/') + fileName,
          size: file.size,
          language: languageInfo.name,
          lastModified: new Date(file.lastModified),
          content, // Include content for code analysis
        };

        currentNode.children.push(fileNode);
        this.progress.filesScanned++;
        this.progress.totalBytes += file.size;
      }
    }

    return root;
  }

  /**
   * Recursively scan a directory and its children
   */
  private async scanDirectoryRecursive(
    dirHandle: FileSystemDirectoryHandle,
    path: string,
    onProgress?: ProgressCallback
  ): Promise<DirectoryNode> {
    this.progress.directoriesScanned++;
    this.progress.currentPath = path;
    
    if (onProgress) {
      onProgress({ ...this.progress });
    }

    const children: (FileNode | DirectoryNode)[] = [];

    // Iterate over directory entries
    // Type assertion needed for File System Access API
    for await (const entry of (dirHandle as any).values() as AsyncIterable<FileSystemHandle>) {
      // Skip ignored files/directories
      if (this.ignoredDirectories.has(entry.name) || this.ignoredFiles.has(entry.name)) {
        continue;
      }

      const entryPath = `${path}/${entry.name}`;

      if (entry.kind === 'file') {
        const fileNode = await this.createFileNode(entry as FileSystemFileHandle, entryPath);
        if (fileNode) {
          children.push(fileNode);
        }
      } else if (entry.kind === 'directory') {
        const dirNode = await this.scanDirectoryRecursive(
          entry as FileSystemDirectoryHandle,
          entryPath,
          onProgress
        );
        children.push(dirNode);
      }
    }

    return {
      type: 'directory',
      name: dirHandle.name,
      path,
      children,
    };
  }

  /**
   * Create a FileNode from a file handle
   */
  private async createFileNode(
    fileHandle: FileSystemFileHandle,
    path: string
  ): Promise<FileNode | null> {
    try {
      const file = await fileHandle.getFile();
      
      // Skip very large files (>10MB) to avoid memory issues
      if (file.size > 10 * 1024 * 1024) {
        console.warn(`Skipping large file: ${path} (${file.size} bytes)`);
        return null;
      }

      this.progress.filesScanned++;
      this.progress.totalBytes += file.size;

      const languageInfo = detectLanguage(file.name);

      // Read file content for code analysis (only for text files)
      let content: string | undefined;
      if (this.isTextFile(file.name)) {
        try {
          content = await file.text();
        } catch (error) {
          console.warn(`Could not read content of ${path}:`, error);
        }
      }

      return {
        type: 'file',
        name: file.name,
        path,
        size: file.size,
        language: languageInfo.name,
        lastModified: new Date(file.lastModified),
        content, // Include content for code analysis
      };
    } catch (error) {
      console.error(`Error reading file ${path}:`, error);
      return null;
    }
  }

  /**
   * Check if file is a text file that should have content loaded
   */
  private isTextFile(filename: string): boolean {
    const textExtensions = [
      '.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.c', '.cpp', '.h', '.hpp',
      '.cs', '.go', '.rs', '.rb', '.php', '.swift', '.kt', '.scala', '.sh',
      '.html', '.css', '.scss', '.sass', '.less', '.json', '.xml', '.yaml', '.yml',
      '.md', '.txt', '.sql', '.graphql', '.vue', '.svelte'
    ];
    return textExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  }

  /**
   * Reset progress tracking
   */
  private resetProgress(): void {
    this.progress = {
      filesScanned: 0,
      directoriesScanned: 0,
      totalBytes: 0,
      currentPath: '',
    };
  }

  /**
   * Get current scan progress
   */
  getProgress(): ScanProgress {
    return { ...this.progress };
  }
}
