/**
 * Core type definitions for the 3D Repository Explorer
 * Constitution: All data structures are local-only, no external transmission
 */

/**
 * 3D Vector representation
 */
export interface Vector3 {
  x: number
  y: number
  z: number
}

/**
 * Git metadata for a repository
 */
export interface GitMetrics {
  currentBranch: string
  commitCount: number
  lastCommitDate: Date
  authors: string[]
}

/**
 * Code metrics for files/directories
 */
export interface CodeMetrics {
  lineCount: number
  characterCount: number
  complexity?: number
  changeFrequency?: number
}

/**
 * Represents a loaded git repository
 */
export interface Repository {
  id: string
  name: string
  path?: string // Optional path (browser security limits full paths)
  rootPath?: string // Legacy - kept for compatibility
  rootNode: DirectoryNode // Root directory structure
  gitMetadata?: GitMetrics
  statistics?: {
    totalFiles: number
    totalLines: number
    totalSize: number
    languageBreakdown: Record<string, number>
  }
  stats?: {
    totalFiles: number
    totalDirectories: number
    totalSize: number
    scanDuration: number
  }
  loadedAt?: Date
  createdAt: Date
  lastScannedAt: Date
}

/**
 * Represents a file in the repository
 */
export interface FileNode {
  type: 'file'
  id?: string
  name: string
  path: string
  relativePath?: string
  size: number
  lineCount?: number
  language: string
  lastModified: Date
  gitHistory?: {
    lastCommitDate: Date
    commitCount: number
  }
  position?: Vector3
  content?: string // Cached file content
}

/**
 * Represents a directory in the repository
 */
export interface DirectoryNode {
  type: 'directory'
  id?: string
  name: string
  path: string
  relativePath?: string
  children: Array<FileNode | DirectoryNode>
  metrics?: {
    totalFiles: number
    totalSize: number
    maxDepth: number
  }
  position?: Vector3
}

/**
 * Type guard to check if node is a FileNode
 */
export function isFileNode(node: FileNode | DirectoryNode): node is FileNode {
  return 'size' in node && 'lineCount' in node
}

/**
 * Type guard to check if node is a DirectoryNode
 */
export function isDirectoryNode(node: FileNode | DirectoryNode): node is DirectoryNode {
  return 'children' in node
}

/**
 * Spatial layout map for positioning nodes in 3D space
 */
export interface WorldMap {
  repositoryId: string
  nodes: Map<string, Vector3> // nodeId -> position
  bounds: {
    min: Vector3
    max: Vector3
  }
  layoutAlgorithm: 'grid' | 'treemap' | 'force-directed'
}

/**
 * Camera state for first-person navigation
 */
export interface CameraState {
  position: Vector3
  rotation: {
    pitch: number
    yaw: number
    roll: number
  }
  velocity: Vector3
  movementSpeed: number
}

/**
 * User preferences (stored in localStorage - constitution compliant)
 */
export interface UserPreferences {
  cameraSpeed: number
  mouseSensitivity: number
  colorScheme: 'default' | 'high-contrast'
  renderQuality: 'low' | 'medium' | 'high' | 'ultra'
  showMinimap: boolean
  showBreadcrumbs: boolean
}

/**
 * Database schema for IndexedDB (local storage)
 */
export interface DatabaseSchema {
  repositories: Repository
  fileNodes: FileNode
  directoryNodes: DirectoryNode
  preferences: UserPreferences
}
