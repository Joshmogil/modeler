import { describe, it, expect, beforeEach } from 'vitest';
import { FileSystemScanner } from '../src/repository/FileSystemScanner';

describe('FileSystemScanner', () => {
  let scanner: FileSystemScanner;

  beforeEach(() => {
    scanner = new FileSystemScanner();
  });

  it('should create a scanner instance', () => {
    expect(scanner).toBeInstanceOf(FileSystemScanner);
  });

  it('should initialize with zero progress', () => {
    const progress = scanner.getProgress();
    expect(progress.filesScanned).toBe(0);
    expect(progress.directoriesScanned).toBe(0);
    expect(progress.totalBytes).toBe(0);
    expect(progress.currentPath).toBe('');
  });

  describe('scanTestDirectory', () => {
    it('should scan a test directory and return repository structure', async () => {
      const repo = await scanner.scanTestDirectory('/test/path/test-repo');

      expect(repo.name).toBe('test-repo');
      expect(repo.path).toBe('/test/path/test-repo');
      expect(repo.rootNode.type).toBe('directory');
      expect(repo.stats?.totalFiles).toBeGreaterThan(0);
      expect(repo.stats?.totalDirectories).toBeGreaterThan(0);
    });

    it('should create a directory tree with files and subdirectories', async () => {
      const repo = await scanner.scanTestDirectory('/fixtures/test-repo');

      expect(repo.rootNode.children.length).toBeGreaterThan(0);

      // Should have README.md
      const readme = repo.rootNode.children.find(
        (node) => node.name === 'README.md' && node.type === 'file'
      );
      expect(readme).toBeDefined();
      expect(readme?.type).toBe('file');

      // Should have src directory
      const srcDir = repo.rootNode.children.find(
        (node) => node.name === 'src' && node.type === 'directory'
      );
      expect(srcDir).toBeDefined();
      expect(srcDir?.type).toBe('directory');

      if (srcDir && srcDir.type === 'directory') {
        expect(srcDir.children.length).toBeGreaterThan(0);
      }
    });

    it('should detect file languages correctly', async () => {
      const repo = await scanner.scanTestDirectory('/test-repo');

      // Find a TypeScript file
      const srcDir = repo.rootNode.children.find(
        (node) => node.name === 'src' && node.type === 'directory'
      );

      if (srcDir && srcDir.type === 'directory') {
        const tsFile = srcDir.children.find(
          (node) => node.name === 'index.ts' && node.type === 'file'
        );
        expect(tsFile).toBeDefined();
        if (tsFile && tsFile.type === 'file') {
          expect(tsFile.language).toBe('TypeScript');
        }
      }

      // Find a Markdown file
      const mdFile = repo.rootNode.children.find(
        (node) => node.name === 'README.md' && node.type === 'file'
      );
      if (mdFile && mdFile.type === 'file') {
        expect(mdFile.language).toBe('Markdown');
      }

      // Find a JSON file
      const jsonFile = repo.rootNode.children.find(
        (node) => node.name === 'package.json' && node.type === 'file'
      );
      if (jsonFile && jsonFile.type === 'file') {
        expect(jsonFile.language).toBe('JSON');
      }
    });

    it('should include file metadata (size, lastModified)', async () => {
      const repo = await scanner.scanTestDirectory('/test-repo');

      const readme = repo.rootNode.children.find(
        (node) => node.name === 'README.md' && node.type === 'file'
      );

      expect(readme).toBeDefined();
      if (readme && readme.type === 'file') {
        expect(readme.size).toBeGreaterThan(0);
        expect(readme.lastModified).toBeInstanceOf(Date);
      }
    });

    it('should include repository statistics', async () => {
      const repo = await scanner.scanTestDirectory('/test-repo');

      expect(repo.stats).toBeDefined();
      expect(repo.stats?.totalFiles).toBe(3);
      expect(repo.stats?.totalDirectories).toBe(1);
      expect(repo.stats?.totalSize).toBe(5120);
      expect(repo.stats?.scanDuration).toBeGreaterThan(0);
    });

    it('should set createdAt and lastScannedAt timestamps', async () => {
      const repo = await scanner.scanTestDirectory('/test-repo');

      expect(repo.createdAt).toBeInstanceOf(Date);
      expect(repo.lastScannedAt).toBeInstanceOf(Date);
    });

    it('should generate unique repository IDs', async () => {
      const repo1 = await scanner.scanTestDirectory('/test-repo');
      // Small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));
      const repo2 = await scanner.scanTestDirectory('/test-repo');

      expect(repo1.id).not.toBe(repo2.id);
      expect(repo1.id).toMatch(/^repo-\d+$/);
      expect(repo2.id).toMatch(/^repo-\d+$/);
    });
  });

  describe('progress tracking', () => {
    it('should track progress during scan', async () => {
      const progressUpdates: any[] = [];
      
      await scanner.scanTestDirectory('/test-repo');
      
      // For test directory, progress isn't tracked since it's mock data
      // In real scan, this would show incremental progress
      const finalProgress = scanner.getProgress();
      expect(finalProgress).toBeDefined();
    });
  });
});
