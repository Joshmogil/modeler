/**
 * IndexedDB Wrapper for Local Storage
 * Constitution: All data stored locally, no cloud sync
 */

import { Repository, FileNode, UserPreferences } from '../types'

const DB_NAME = 'modeler-db'
const DB_VERSION = 1

export class LocalDatabase {
  private db: IDBDatabase | null = null
  private readonly dbName: string
  private readonly version: number

  constructor(dbName: string = DB_NAME, version: number = DB_VERSION) {
    this.dbName = dbName
    this.version = version
  }

  /**
   * Initialize database connection
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => {
        reject(new Error(`Failed to open database: ${request.error}`))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('repositories')) {
          const repoStore = db.createObjectStore('repositories', { keyPath: 'id' })
          repoStore.createIndex('name', 'name', { unique: false })
          repoStore.createIndex('loadedAt', 'loadedAt', { unique: false })
        }

        if (!db.objectStoreNames.contains('fileNodes')) {
          const fileStore = db.createObjectStore('fileNodes', { keyPath: 'id' })
          fileStore.createIndex('repositoryId', 'repositoryId', { unique: false })
          fileStore.createIndex('path', 'path', { unique: false })
        }

        if (!db.objectStoreNames.contains('directoryNodes')) {
          const dirStore = db.createObjectStore('directoryNodes', { keyPath: 'id' })
          dirStore.createIndex('repositoryId', 'repositoryId', { unique: false })
          dirStore.createIndex('path', 'path', { unique: false })
        }

        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences', { keyPath: 'id' })
        }

        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' })
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })
  }

  /**
   * Save repository metadata
   */
  async saveRepository(repository: Repository): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['repositories'], 'readwrite')
      const store = transaction.objectStore('repositories')
      const request = store.put(repository)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get repository by ID
   */
  async getRepository(id: string): Promise<Repository | undefined> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['repositories'], 'readonly')
      const store = transaction.objectStore('repositories')
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get all repositories
   */
  async getAllRepositories(): Promise<Repository[]> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['repositories'], 'readonly')
      const store = transaction.objectStore('repositories')
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Delete repository and all associated data
   */
  async deleteRepository(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        ['repositories', 'fileNodes', 'directoryNodes'],
        'readwrite'
      )

      // Delete repository
      const repoStore = transaction.objectStore('repositories')
      repoStore.delete(id)

      // Delete all file nodes for this repository
      const fileStore = transaction.objectStore('fileNodes')
      const fileIndex = fileStore.index('repositoryId')
      const fileRequest = fileIndex.openCursor(IDBKeyRange.only(id))
      fileRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        }
      }

      // Delete all directory nodes for this repository
      const dirStore = transaction.objectStore('directoryNodes')
      const dirIndex = dirStore.index('repositoryId')
      const dirRequest = dirIndex.openCursor(IDBKeyRange.only(id))
      dirRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        }
      }

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  /**
   * Save file node
   */
  async saveFileNode(fileNode: FileNode & { repositoryId: string }): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['fileNodes'], 'readwrite')
      const store = transaction.objectStore('fileNodes')
      const request = store.put(fileNode)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get file nodes for a repository
   */
  async getFileNodes(repositoryId: string): Promise<FileNode[]> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['fileNodes'], 'readonly')
      const store = transaction.objectStore('fileNodes')
      const index = store.index('repositoryId')
      const request = index.getAll(repositoryId)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Save user preferences
   */
  async savePreferences(preferences: UserPreferences): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['preferences'], 'readwrite')
      const store = transaction.objectStore('preferences')
      const request = store.put({ id: 'user-preferences', ...preferences })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get user preferences
   */
  async getPreferences(): Promise<UserPreferences | undefined> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['preferences'], 'readonly')
      const store = transaction.objectStore('preferences')
      const request = store.get('user-preferences')

      request.onsuccess = () => {
        const result = request.result
        if (result) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...preferences } = result
          resolve(preferences as UserPreferences)
        } else {
          resolve(undefined)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Cache arbitrary data with TTL
   */
  async setCache(key: string, value: unknown, ttlMinutes: number = 60): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    const expiresAt = Date.now() + ttlMinutes * 60 * 1000

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite')
      const store = transaction.objectStore('cache')
      const request = store.put({
        key,
        value,
        timestamp: Date.now(),
        expiresAt,
      })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get cached data
   */
  async getCache<T>(key: string): Promise<T | undefined> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readonly')
      const store = transaction.objectStore('cache')
      const request = store.get(key)

      request.onsuccess = () => {
        const result = request.result
        if (result && result.expiresAt > Date.now()) {
          resolve(result.value as T)
        } else {
          // Expired or not found
          resolve(undefined)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Clear expired cache entries
   */
  async clearExpiredCache(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite')
      const store = transaction.objectStore('cache')
      const request = store.openCursor()

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          if (cursor.value.expiresAt < Date.now()) {
            cursor.delete()
          }
          cursor.continue()
        }
      }

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  /**
   * Get database size estimate (for monitoring)
   */
  async getStorageEstimate(): Promise<{ usage: number; quota: number } | undefined> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
      }
    }
    return undefined
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }

  /**
   * Delete entire database (for testing or reset)
   */
  static async deleteDatabase(dbName: string = DB_NAME): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(dbName)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}
