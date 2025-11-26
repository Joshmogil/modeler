import { useState, useEffect, useRef } from 'react'
import './App.css'
import { LocalDatabase } from './repository/LocalDatabase'
import { FileSystemScanner } from './repository/FileSystemScanner'
import { Renderer } from './core/Renderer'
import { Camera } from './core/Camera'
import { KeyboardController } from './controls/KeyboardController'
import { MouseController } from './controls/MouseController'
import { WorldBuilder } from './world/WorldBuilder'
import { CodeAnalyzer } from './analysis/CodeAnalyzer'
import { RelationshipVisualizer } from './world/RelationshipVisualizer'
import { Repository } from './types'

/**
 * Main Application Component
 * Constitution: Local-first, privacy-first, no external data transmission
 */
function App() {
  const [status, setStatus] = useState<string>('Initializing...')
  const [db, setDb] = useState<LocalDatabase | null>(null)
  const [repository, setRepository] = useState<Repository | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [fps, setFps] = useState(0)
  const [cameraPos, setCameraPos] = useState({ x: 0, y: 5, z: 10 })
  const [cameraRot, setCameraRot] = useState({ pitch: 0, yaw: 0, roll: 0 })
  const [showRelationships, setShowRelationships] = useState(true)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const rendererRef = useRef<Renderer | null>(null)
  const cameraRef = useRef<Camera | null>(null)
  const keyboardControllerRef = useRef<KeyboardController | null>(null)
  const mouseControllerRef = useRef<MouseController | null>(null)
  const worldBuilderRef = useRef<WorldBuilder | null>(null)
  const codeAnalyzerRef = useRef<CodeAnalyzer | null>(null)
  const relationshipVisualizerRef = useRef<RelationshipVisualizer | null>(null)
  const animationFrameRef = useRef<number>(0)
  const lastFrameTimeRef = useRef<number>(performance.now())

  useEffect(() => {
    // Initialize database and 3D renderer
    const init = async () => {
      try {
        const database = new LocalDatabase()
        await database.init()
        setDb(database)

        // Initialize Three.js renderer
        if (canvasRef.current) {
          const renderer = new Renderer(canvasRef.current)
          rendererRef.current = renderer

          const camera = new Camera()
          camera.setPosition({ x: 0, y: 5, z: 10 })
          camera.setRotation(0, Math.PI, 0) // Face toward -Z
          cameraRef.current = camera

          // Initialize input controllers
          const keyboardController = new KeyboardController(camera)
          keyboardControllerRef.current = keyboardController

          const mouseController = new MouseController(camera, canvasRef.current)
          mouseControllerRef.current = mouseController

          // Initialize world builder
          const worldBuilder = new WorldBuilder(renderer.getScene())
          worldBuilderRef.current = worldBuilder

          // Initialize code analyzer
          const codeAnalyzer = new CodeAnalyzer()
          codeAnalyzerRef.current = codeAnalyzer

          // Initialize relationship visualizer
          const relationshipVisualizer = new RelationshipVisualizer(renderer.getScene())
          relationshipVisualizerRef.current = relationshipVisualizer

          // Start render loop
          const animate = () => {
            if (!rendererRef.current || !cameraRef.current || !keyboardControllerRef.current) return

            // Calculate delta time
            const now = performance.now()
            const deltaTime = (now - lastFrameTimeRef.current) / 1000 // Convert to seconds
            lastFrameTimeRef.current = now

            // Update input controllers
            keyboardControllerRef.current.update(deltaTime)

            // Update camera
            cameraRef.current.update(deltaTime)

            // Animate relationship visualizer
            if (relationshipVisualizerRef.current) {
              relationshipVisualizerRef.current.animate(deltaTime)
            }

            // Render scene
            rendererRef.current.render(cameraRef.current.getCamera())

            // Update FPS display
            setFps(Math.round(rendererRef.current.getFPS()))

            // Update camera position display
            const pos = cameraRef.current.getPosition()
            const rot = cameraRef.current.getRotation()
            setCameraPos(pos)
            setCameraRot(rot)

            animationFrameRef.current = requestAnimationFrame(animate)
          }
          animate()

          setStatus('Ready - Click "Load Repository" to begin')
        }
      } catch (error) {
        setStatus(`Error initializing: ${error}`)
      }
    }

    init()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (rendererRef.current) {
        rendererRef.current.dispose()
      }
      if (keyboardControllerRef.current) {
        keyboardControllerRef.current.dispose()
      }
      if (mouseControllerRef.current) {
        mouseControllerRef.current.dispose()
      }
      if (db) {
        db.close()
      }
    }
  }, [])

  const handleLoadRepository = async () => {
    if (!db) {
      setStatus('Database not initialized')
      return
    }

    setIsLoading(true)
    setStatus('Opening directory picker...')

    try {
      const scanner = new FileSystemScanner()
      let repo: Repository;
      
      // Check if File System Access API is available
      if ('showDirectoryPicker' in window) {
        try {
          // Request directory access from user
          const dirHandle = await (window as any).showDirectoryPicker({
            mode: 'read',
            startIn: 'downloads', // Suggest starting in downloads folder
          });
          
          setStatus(`Scanning ${dirHandle.name}...`)
          repo = await scanner.scanDirectory(dirHandle, (progress) => {
            setStatus(
              `Scanning: ${progress.filesScanned} files, ${progress.directoriesScanned} directories (${Math.round(progress.totalBytes / 1024)}KB)...`
            )
          });
        } catch (error: any) {
          if (error.name === 'AbortError') {
            setStatus('Directory selection cancelled. Click "Load Directory" to try again.')
            setIsLoading(false)
            return
          }
          throw error
        }
      } else {
        // Fallback for Safari/Firefox: use webkitdirectory file input
        setStatus('Opening folder picker...')
        if (fileInputRef.current) {
          fileInputRef.current.click()
          setIsLoading(false)
          return
        } else {
          // Ultimate fallback if file input not available
          setStatus('Loading demo repository...')
          repo = await scanner.scanTestDirectory('test-repo')
        }
      }
      
      // Save to IndexedDB
      await db.saveRepository(repo)
      setRepository(repo)
      
      // Build 3D world
      if (worldBuilderRef.current) {
        setStatus('Building 3D world...')
        worldBuilderRef.current.buildWorld(repo)
        
        // Analyze code relationships
        if (codeAnalyzerRef.current && relationshipVisualizerRef.current) {
          setStatus('Analyzing code relationships...')
          const analyzer = codeAnalyzerRef.current
          const fileMap = analyzer.buildFileMap(repo.rootNode)
          
          // Analyze all files to find relationships
          const allRelationships: any[] = []
          fileMap.forEach(file => {
            const relationships = analyzer.analyzeFile(file, fileMap)
            allRelationships.push(...relationships)
          })
          
          // Build visual connections
          const filePositions = worldBuilderRef.current.getFilePositions()
          relationshipVisualizerRef.current.buildConnections(allRelationships, filePositions)
          
          const stats = relationshipVisualizerRef.current.getStats()
          console.log(`Found ${stats.total} code relationships:`, stats.byType)
        }
        
        setStatus(`Loaded ${repo.name}: ${repo.stats?.totalFiles} files in ${repo.stats?.totalDirectories} directories`)
      }
    } catch (error: any) {
      console.error('Error loading repository:', error)
      setStatus(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0 || !db) return

    setIsLoading(true)
    setStatus('Processing files...')

    try {
      const scanner = new FileSystemScanner()
      
      // Convert FileList to repository structure
      setStatus(`Scanning ${files.length} files...`)
      const repo = await scanner.scanFromFileList(files)
      
      // Save to IndexedDB
      await db.saveRepository(repo)
      setRepository(repo)
      
      // Build 3D world
      if (worldBuilderRef.current) {
        setStatus('Building 3D world...')
        worldBuilderRef.current.buildWorld(repo)
        
        // Analyze code relationships
        if (codeAnalyzerRef.current && relationshipVisualizerRef.current) {
          setStatus('Analyzing code relationships...')
          const analyzer = codeAnalyzerRef.current
          const fileMap = analyzer.buildFileMap(repo.rootNode)
          
          // Analyze all files to find relationships
          const allRelationships: any[] = []
          fileMap.forEach(file => {
            const relationships = analyzer.analyzeFile(file, fileMap)
            allRelationships.push(...relationships)
          })
          
          // Build visual connections
          const filePositions = worldBuilderRef.current.getFilePositions()
          relationshipVisualizerRef.current.buildConnections(allRelationships, filePositions)
          
          const stats = relationshipVisualizerRef.current.getStats()
          console.log(`Found ${stats.total} code relationships:`, stats.byType)
        }
        
        setStatus(`Loaded ${repo.name}: ${repo.stats?.totalFiles} files in ${repo.stats?.totalDirectories} directories`)
      }
    } catch (error: any) {
      console.error('Error loading from files:', error)
      setStatus(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
      // Reset file input
      if (event.target) event.target.value = ''
    }
  }

  // For E2E testing: expose path-based loading
  useEffect(() => {
    (window as any).__loadRepositoryByPath = async (path: string) => {
      if (!db) return

      setIsLoading(true)
      const scanner = new FileSystemScanner()
      const repo = await scanner.scanTestDirectory(path)
      await db.saveRepository(repo)
      setRepository(repo)
      
      // Build 3D world
      if (worldBuilderRef.current) {
        worldBuilderRef.current.buildWorld(repo)
      }
      
      setIsLoading(false)
      setStatus(`Loaded ${repo.name}`)
    };

    // Expose Three.js scene for testing
    if (rendererRef.current) {
      (window as any).__THREE_SCENE__ = rendererRef.current.getScene()
    }

    // Expose camera state for testing
    (window as any).__CAMERA_POSITION__ = cameraPos;
    (window as any).__CAMERA_ROTATION__ = cameraRot;
    (window as any).__RENDERER_FPS__ = fps;
  }, [db, cameraPos, cameraRot, fps])

  return (
    <div className="app">
      {/* 3D Canvas */}
      <canvas ref={canvasRef} className="webgl-canvas" />

      {/* Hidden file input for Safari/Firefox fallback */}
      <input
        ref={fileInputRef}
        type="file"
        /* @ts-ignore - webkitdirectory is not in standard types */
        webkitdirectory="true"
        directory="true"
        multiple
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />

      {/* Loading indicator for E2E tests */}
      {isLoading && <div data-testid="loading-indicator" className="loading">Loading...</div>}
      {!isLoading && <div data-testid="loading-indicator" style={{ display: 'none' }} />}

      {/* UI Overlay */}
      <div className="ui-overlay">
        <div className="header">
          <h1>🌍 Modeler</h1>
          <div className="header-controls">
            <button 
              onClick={handleLoadRepository} 
              disabled={isLoading}
              className="load-btn"
            >
              {isLoading ? 'Loading...' : 'Load Directory'}
            </button>
            {repository && (
              <button 
                onClick={() => {
                  setShowRelationships(!showRelationships)
                  if (relationshipVisualizerRef.current) {
                    relationshipVisualizerRef.current.setVisible(!showRelationships)
                  }
                }}
                className="toggle-btn"
                title="Toggle code relationship connections"
              >
                {showRelationships ? '🔗 Hide Links' : '🔗 Show Links'}
              </button>
            )}
          </div>
        </div>

        {/* HUD */}
        <div className="hud">
          <div className="hud-section">
            <div data-testid="fps-counter">{fps} FPS</div>
            {repository && (
              <>
                <div data-testid="repo-name">{repository.name}</div>
                <div data-testid="file-count">{repository.stats?.totalFiles || 0} files</div>
              </>
            )}
          </div>
          <div className="hud-section">
            <div data-testid="camera-position">
              x: {cameraPos.x.toFixed(2)} y: {cameraPos.y.toFixed(2)} z: {cameraPos.z.toFixed(2)}
            </div>
            <div data-testid="camera-rotation">
              pitch: {cameraRot.pitch.toFixed(0)}° yaw: {cameraRot.yaw.toFixed(0)}°
            </div>
          </div>
          <div className="hud-section">
            <div data-testid="breadcrumb" className="breadcrumb">{repository?.name || 'No repository loaded'}</div>
          </div>
          {!repository && (
            <div className="hud-section instructions">
              <div>📁 Click "Load Directory" to explore a repository</div>
              <div>🎮 WASD to move • Mouse to look • Space/Shift for up/down</div>
              <div>🖱️ Click canvas to enable mouse look</div>
              {!('showDirectoryPicker' in window) && (
                <div style={{ color: '#f7df1e', marginTop: '0.5rem' }}>
                  💡 Safari: Select any folder to load its contents
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status message */}
        <div className="status-bar">{status}</div>
      </div>
    </div>
  )
}

export default App
