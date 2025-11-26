import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Renderer } from '../src/core/Renderer'
import { Camera } from '../src/core/Camera'

describe('Renderer and Camera Integration', () => {
  let canvas: HTMLCanvasElement
  let renderer: Renderer | null
  let camera: Camera

  beforeEach(() => {
    // Create a mock canvas element
    canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600

    // Mock window dimensions
    vi.stubGlobal('innerWidth', 800)
    vi.stubGlobal('innerHeight', 600)
    
    renderer = null
  })

  afterEach(() => {
    if (renderer) {
      renderer.dispose()
    }
    if (camera) {
      camera.dispose()
    }
    vi.unstubAllGlobals()
  })

  // Note: Renderer tests skipped in test environment (no WebGL)
  // These tests should pass in browser E2E tests
  it.skip('should initialize renderer with default settings', () => {
    renderer = new Renderer(canvas)
    expect(renderer).toBeDefined()
    expect(renderer.getScene()).toBeDefined()
    expect(renderer.getFPS()).toBeGreaterThanOrEqual(0)
  })

  it('should initialize camera with default position', () => {
    camera = new Camera()
    expect(camera).toBeDefined()
    
    const position = camera.getPosition()
    expect(position.x).toBe(0)
    expect(position.y).toBe(5)
    expect(position.z).toBe(10)
  })

  it('should update camera position', () => {
    camera = new Camera()
    
    camera.setPosition({ x: 10, y: 20, z: 30 })
    const position = camera.getPosition()
    
    expect(position.x).toBe(10)
    expect(position.y).toBe(20)
    expect(position.z).toBe(30)
  })

  it('should clamp camera pitch to prevent flipping', () => {
    camera = new Camera()
    
    // Try to set pitch beyond limits
    camera.setRotation(Math.PI, 0, 0) // Way beyond max
    const rotation = camera.getRotation()
    
    // Should be clamped
    expect(rotation.pitch).toBeLessThan(Math.PI / 2)
    expect(rotation.pitch).toBeGreaterThan(-Math.PI / 2)
  })

  it.skip('should render scene with camera', () => {
    renderer = new Renderer(canvas, { quality: 'low' })
    camera = new Camera()
    
    // Should not throw
    expect(() => {
      renderer!.render(camera.getCamera())
    }).not.toThrow()
    
    // FPS should be tracked
    expect(renderer!.getFPS()).toBeGreaterThanOrEqual(0)
  })

  it('should update camera with movement', () => {
    camera = new Camera()
    
    const initialPosition = camera.getPosition()
    
    // Apply forward movement
    camera.move(1, 0, 0, 0.1) // forward, right, up, delta
    camera.update(0.1)
    
    const newPosition = camera.getPosition()
    
    // Position should have changed
    expect(newPosition.x !== initialPosition.x || newPosition.z !== initialPosition.z).toBe(true)
  })

  it('should calculate forward and right vectors correctly', () => {
    camera = new Camera()
    camera.setRotation(0, 0) // Looking forward along Z axis
    
    const forward = camera.getForwardVector()
    const right = camera.getRightVector()
    
    // Forward should be mostly along Z
    expect(Math.abs(forward.z)).toBeGreaterThan(0.9)
    
    // Right should be mostly along X
    expect(Math.abs(right.x)).toBeGreaterThan(0.9)
    
    // Vectors should be roughly perpendicular (dot product near 0)
    const dot = forward.x * right.x + forward.y * right.y + forward.z * right.z
    expect(Math.abs(dot)).toBeLessThan(0.1)
  })

  it.skip('should support different quality settings', () => {
    const lowQuality = new Renderer(canvas, { quality: 'low' })
    expect(lowQuality).toBeDefined()
    lowQuality.dispose()
    
    const highQuality = new Renderer(canvas, { quality: 'high' })
    expect(highQuality).toBeDefined()
    highQuality.dispose()
    
    const ultraQuality = new Renderer(canvas, { quality: 'ultra' })
    expect(ultraQuality).toBeDefined()
    ultraQuality.dispose()
  })

  it.skip('should update quality settings at runtime', () => {
    renderer = new Renderer(canvas, { quality: 'low' })
    
    expect(() => {
      renderer!.setQuality('ultra')
    }).not.toThrow()
  })
})
