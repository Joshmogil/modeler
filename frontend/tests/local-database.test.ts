import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { LocalDatabase } from '../src/repository/LocalDatabase'
import { Repository, UserPreferences } from '../src/types'

describe('LocalDatabase', () => {
  let db: LocalDatabase

  beforeEach(async () => {
    // Use a test database name
    db = new LocalDatabase('modeler-test-db', 1)
    await db.init()
  })

  afterEach(async () => {
    db.close()
    await LocalDatabase.deleteDatabase('modeler-test-db')
  })

  describe('Repository Operations', () => {
    it('should save and retrieve repository', async () => {
      const repo: Repository = {
        id: 'test-repo-1',
        name: 'Test Repository',
        rootPath: '/test/path',
        statistics: {
          totalFiles: 100,
          totalLines: 5000,
          totalSize: 1024000,
          languageBreakdown: { TypeScript: 50, JavaScript: 50 },
        },
        loadedAt: new Date(),
      }

      await db.saveRepository(repo)
      const retrieved = await db.getRepository('test-repo-1')

      expect(retrieved).toBeDefined()
      expect(retrieved?.name).toBe('Test Repository')
      expect(retrieved?.rootPath).toBe('/test/path')
    })

    it('should get all repositories', async () => {
      const repo1: Repository = {
        id: 'repo-1',
        name: 'Repo 1',
        rootPath: '/path1',
        statistics: {
          totalFiles: 10,
          totalLines: 500,
          totalSize: 10240,
          languageBreakdown: { Python: 10 },
        },
        loadedAt: new Date(),
      }

      const repo2: Repository = {
        id: 'repo-2',
        name: 'Repo 2',
        rootPath: '/path2',
        statistics: {
          totalFiles: 20,
          totalLines: 1000,
          totalSize: 20480,
          languageBreakdown: { Go: 20 },
        },
        loadedAt: new Date(),
      }

      await db.saveRepository(repo1)
      await db.saveRepository(repo2)

      const repos = await db.getAllRepositories()
      expect(repos).toHaveLength(2)
      expect(repos.map((r) => r.name)).toContain('Repo 1')
      expect(repos.map((r) => r.name)).toContain('Repo 2')
    })

    it('should delete repository', async () => {
      const repo: Repository = {
        id: 'delete-test',
        name: 'To Delete',
        rootPath: '/delete',
        statistics: {
          totalFiles: 1,
          totalLines: 10,
          totalSize: 100,
          languageBreakdown: {},
        },
        loadedAt: new Date(),
      }

      await db.saveRepository(repo)
      await db.deleteRepository('delete-test')

      const retrieved = await db.getRepository('delete-test')
      expect(retrieved).toBeUndefined()
    })
  })

  describe('Preferences Operations', () => {
    it('should save and retrieve preferences', async () => {
      const prefs: UserPreferences = {
        cameraSpeed: 10,
        mouseSensitivity: 0.5,
        colorScheme: 'high-contrast',
        renderQuality: 'ultra',
        showMinimap: true,
        showBreadcrumbs: false,
      }

      await db.savePreferences(prefs)
      const retrieved = await db.getPreferences()

      expect(retrieved).toBeDefined()
      expect(retrieved?.cameraSpeed).toBe(10)
      expect(retrieved?.colorScheme).toBe('high-contrast')
    })

    it('should return undefined for non-existent preferences', async () => {
      const prefs = await db.getPreferences()
      expect(prefs).toBeUndefined()
    })
  })

  describe('Cache Operations', () => {
    it('should set and get cache', async () => {
      await db.setCache('test-key', { data: 'test value' })
      const cached = await db.getCache<{ data: string }>('test-key')

      expect(cached).toBeDefined()
      expect(cached?.data).toBe('test value')
    })

    it('should return undefined for expired cache', async () => {
      // Set cache with very short TTL
      await db.setCache('expire-test', 'value', 0.001) // ~60ms

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 100))

      const cached = await db.getCache('expire-test')
      expect(cached).toBeUndefined()
    })

    it('should clear expired cache entries', async () => {
      await db.setCache('expire1', 'value1', 0.001)
      await db.setCache('persist1', 'value2', 60)

      // Wait for first to expire
      await new Promise((resolve) => setTimeout(resolve, 100))

      await db.clearExpiredCache()

      const expired = await db.getCache('expire1')
      const persisted = await db.getCache('persist1')

      expect(expired).toBeUndefined()
      expect(persisted).toBe('value2')
    })
  })

  describe('Storage Management', () => {
    it('should get storage estimate if available', async () => {
      const estimate = await db.getStorageEstimate()

      if (estimate) {
        expect(typeof estimate.usage).toBe('number')
        expect(typeof estimate.quota).toBe('number')
        expect(estimate.quota).toBeGreaterThan(0)
      }
      // Note: May be undefined in test environment
    })
  })
})
