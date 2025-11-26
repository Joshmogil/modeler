import { describe, it, expect, beforeEach } from 'vitest';
import { FileSystemScanner } from '../src/repository/FileSystemScanner';

describe('FileSystemScanner - Safari Fallback', () => {
  let scanner: FileSystemScanner;

  beforeEach(() => {
    scanner = new FileSystemScanner();
  });

  describe('scanFromFileList', () => {
    it('should handle FileList with webkitRelativePath', async () => {
      // Mock FileList with webkitRelativePath
      const mockFiles = [
        {
          name: 'README.md',
          size: 1024,
          lastModified: Date.now(),
          webkitRelativePath: 'my-project/README.md',
        },
        {
          name: 'index.ts',
          size: 2048,
          lastModified: Date.now(),
          webkitRelativePath: 'my-project/src/index.ts',
        },
        {
          name: 'utils.ts',
          size: 1536,
          lastModified: Date.now(),
          webkitRelativePath: 'my-project/src/utils.ts',
        },
      ] as unknown as FileList;

      const repo = await scanner.scanFromFileList(mockFiles);

      expect(repo.name).toBe('my-project');
      expect(repo.stats?.totalFiles).toBe(3);
      expect(repo.rootNode.type).toBe('directory');
      expect(repo.rootNode.children.length).toBeGreaterThan(0);
    });

    it('should skip ignored directories', async () => {
      const mockFiles = [
        {
          name: 'index.ts',
          size: 2048,
          lastModified: Date.now(),
          webkitRelativePath: 'project/src/index.ts',
        },
        {
          name: 'package.json',
          size: 512,
          lastModified: Date.now(),
          webkitRelativePath: 'project/node_modules/package.json',
        },
      ] as unknown as FileList;

      const repo = await scanner.scanFromFileList(mockFiles);

      // node_modules should be ignored
      expect(repo.stats?.totalFiles).toBe(1);
    });

    it('should skip large files', async () => {
      const mockFiles = [
        {
          name: 'small.txt',
          size: 1024,
          lastModified: Date.now(),
          webkitRelativePath: 'project/small.txt',
        },
        {
          name: 'huge.bin',
          size: 20 * 1024 * 1024, // 20MB
          lastModified: Date.now(),
          webkitRelativePath: 'project/huge.bin',
        },
      ] as unknown as FileList;

      const repo = await scanner.scanFromFileList(mockFiles);

      // Large file should be skipped
      expect(repo.stats?.totalFiles).toBe(1);
    });
  });
});
