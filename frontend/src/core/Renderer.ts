/**
 * Three.js Renderer Wrapper
 * Manages WebGL rendering with configurable quality settings
 * Constitution: Local-only rendering, no external assets required
 */

import * as THREE from 'three'

export interface RendererOptions {
  antialias?: boolean
  shadowsEnabled?: boolean
  quality?: 'low' | 'medium' | 'high' | 'ultra'
}

export class Renderer {
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private clock: THREE.Clock
  private stats: {
    fps: number
    lastFrameTime: number
    frameCount: number
  }

  constructor(canvas: HTMLCanvasElement, options: RendererOptions = {}) {
    // Initialize WebGL renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: options.antialias ?? true,
      alpha: false,
      powerPreference: 'high-performance',
    })

    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Configure shadows
    if (options.shadowsEnabled ?? true) {
      this.renderer.shadowMap.enabled = true
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    }

    // Configure quality settings
    this.applyQualitySettings(options.quality ?? 'high')

    // Initialize scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x0a0a0a)
    this.scene.fog = new THREE.Fog(0x0a0a0a, 50, 200)

    // Setup basic lighting
    this.setupLighting()

    // Initialize clock and stats
    this.clock = new THREE.Clock()
    this.stats = {
      fps: 60,
      lastFrameTime: 0,
      frameCount: 0,
    }

    // Handle window resize
    window.addEventListener('resize', this.handleResize.bind(this))
  }

  /**
   * Apply quality settings based on preset
   */
  private applyQualitySettings(quality: 'low' | 'medium' | 'high' | 'ultra'): void {
    switch (quality) {
      case 'low':
        this.renderer.shadowMap.enabled = false
        this.renderer.setPixelRatio(1)
        break
      case 'medium':
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.BasicShadowMap
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
        break
      case 'high':
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        break
      case 'ultra':
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping
        this.renderer.toneMappingExposure = 1
        break
    }
  }

  /**
   * Setup scene lighting
   */
  private setupLighting(): void {
    // Ambient light for base illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    this.scene.add(ambientLight)

    // Directional light (sun-like)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(50, 100, 50)
    directionalLight.castShadow = true
    directionalLight.shadow.camera.left = -100
    directionalLight.shadow.camera.right = 100
    directionalLight.shadow.camera.top = 100
    directionalLight.shadow.camera.bottom = -100
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    this.scene.add(directionalLight)

    // Hemisphere light for sky/ground effect
    const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x545454, 0.3)
    this.scene.add(hemisphereLight)
  }

  /**
   * Handle window resize
   */
  private handleResize(): void {
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  /**
   * Render a frame
   */
  render(camera: THREE.Camera): void {
    const currentTime = performance.now()
    const delta = currentTime - this.stats.lastFrameTime

    // Update FPS calculation (every 60 frames)
    this.stats.frameCount++
    if (this.stats.frameCount >= 60) {
      this.stats.fps = Math.round(1000 / (delta / 60))
      this.stats.frameCount = 0
    }

    this.stats.lastFrameTime = currentTime

    this.renderer.render(this.scene, camera)
  }

  /**
   * Get current FPS
   */
  getFPS(): number {
    return this.stats.fps
  }

  /**
   * Get the Three.js scene
   */
  getScene(): THREE.Scene {
    return this.scene
  }

  /**
   * Get the Three.js renderer
   */
  getRenderer(): THREE.WebGLRenderer {
    return this.renderer
  }

  /**
   * Get elapsed time since start
   */
  getElapsedTime(): number {
    return this.clock.getElapsedTime()
  }

  /**
   * Get delta time since last frame
   */
  getDelta(): number {
    return this.clock.getDelta()
  }

  /**
   * Update quality settings at runtime
   */
  setQuality(quality: 'low' | 'medium' | 'high' | 'ultra'): void {
    this.applyQualitySettings(quality)
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    window.removeEventListener('resize', this.handleResize.bind(this))
    this.renderer.dispose()
  }
}
