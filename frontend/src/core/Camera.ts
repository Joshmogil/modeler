/**
 * First-Person Camera Controller
 * Manages camera position, rotation, and movement
 * Constitution: Local-only, no network-based camera control
 */

import * as THREE from 'three'
import { CameraState, Vector3 } from '../types'

export class Camera {
  private camera: THREE.PerspectiveCamera
  private state: CameraState
  private readonly MIN_PITCH = -Math.PI / 2 + 0.1
  private readonly MAX_PITCH = Math.PI / 2 - 0.1

  constructor(fov: number = 75, aspect?: number, near: number = 0.1, far: number = 1000) {
    // Initialize Three.js perspective camera
    this.camera = new THREE.PerspectiveCamera(
      fov,
      aspect ?? window.innerWidth / window.innerHeight,
      near,
      far
    )

    // Initialize camera state
    this.state = {
      position: { x: 0, y: 5, z: 10 },
      rotation: { pitch: 0, yaw: 0, roll: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      movementSpeed: 5, // units per second
    }

    this.updateCameraTransform()

    // Handle window resize
    window.addEventListener('resize', this.handleResize.bind(this))
  }

  /**
   * Set camera position
   */
  setPosition(position: Vector3): void {
    this.state.position = { ...position }
    this.updateCameraTransform()
  }

  /**
   * Set camera rotation (in radians)
   */
  setRotation(pitch: number, yaw: number, roll: number = 0): void {
    // Clamp pitch to prevent camera flipping
    this.state.rotation = {
      pitch: Math.max(this.MIN_PITCH, Math.min(this.MAX_PITCH, pitch)),
      yaw,
      roll,
    }
    this.updateCameraTransform()
  }

  /**
   * Get current position
   */
  getPosition(): Vector3 {
    return { ...this.state.position }
  }

  /**
   * Get current rotation
   */
  getRotation(): { pitch: number; yaw: number; roll: number } {
    return { ...this.state.rotation }
  }

  /**
   * Set movement speed
   */
  setMovementSpeed(speed: number): void {
    this.state.movementSpeed = speed
  }

  /**
   * Get movement speed
   */
  getMovementSpeed(): number {
    return this.state.movementSpeed
  }

  /**
   * Apply velocity to position (called each frame)
   */
  update(delta: number): void {
    if (
      this.state.velocity.x !== 0 ||
      this.state.velocity.y !== 0 ||
      this.state.velocity.z !== 0
    ) {
      // Apply velocity
      this.state.position.x += this.state.velocity.x * delta
      this.state.position.y += this.state.velocity.y * delta
      this.state.position.z += this.state.velocity.z * delta

      // Apply damping (smooth deceleration)
      const damping = 0.9
      this.state.velocity.x *= damping
      this.state.velocity.y *= damping
      this.state.velocity.z *= damping

      // Stop if velocity is very small
      if (Math.abs(this.state.velocity.x) < 0.01) this.state.velocity.x = 0
      if (Math.abs(this.state.velocity.y) < 0.01) this.state.velocity.y = 0
      if (Math.abs(this.state.velocity.z) < 0.01) this.state.velocity.z = 0

      this.updateCameraTransform()
    }
  }

  /**
   * Apply movement in camera's local space
   */
  move(forward: number, right: number, up: number, delta: number): void {
    const speed = this.state.movementSpeed * delta

    // Calculate movement direction based on camera rotation
    const direction = new THREE.Vector3()

    // Forward/backward movement
    if (forward !== 0) {
      direction.x += Math.sin(this.state.rotation.yaw) * forward * speed
      direction.z += Math.cos(this.state.rotation.yaw) * forward * speed
    }

    // Left/right movement (strafe)
    if (right !== 0) {
      direction.x += Math.cos(this.state.rotation.yaw) * right * speed
      direction.z -= Math.sin(this.state.rotation.yaw) * right * speed
    }

    // Up/down movement
    if (up !== 0) {
      direction.y += up * speed
    }

    // Apply to velocity
    this.state.velocity.x += direction.x
    this.state.velocity.y += direction.y
    this.state.velocity.z += direction.z
  }

  /**
   * Rotate camera by delta angles
   */
  rotate(pitchDelta: number, yawDelta: number): void {
    this.state.rotation.pitch = Math.max(
      this.MIN_PITCH,
      Math.min(this.MAX_PITCH, this.state.rotation.pitch + pitchDelta)
    )
    this.state.rotation.yaw += yawDelta
    this.updateCameraTransform()
  }

  /**
   * Look at a specific point in 3D space
   */
  lookAt(target: Vector3): void {
    const direction = new THREE.Vector3(
      target.x - this.state.position.x,
      target.y - this.state.position.y,
      target.z - this.state.position.z
    ).normalize()

    // Calculate yaw and pitch from direction
    this.state.rotation.yaw = Math.atan2(direction.x, direction.z)
    this.state.rotation.pitch = Math.asin(-direction.y)

    this.updateCameraTransform()
  }

  /**
   * Get forward direction vector
   */
  getForwardVector(): Vector3 {
    return {
      x: Math.sin(this.state.rotation.yaw),
      y: -Math.sin(this.state.rotation.pitch),
      z: Math.cos(this.state.rotation.yaw),
    }
  }

  /**
   * Get right direction vector
   */
  getRightVector(): Vector3 {
    return {
      x: Math.cos(this.state.rotation.yaw),
      y: 0,
      z: -Math.sin(this.state.rotation.yaw),
    }
  }

  /**
   * Update Three.js camera transform from state
   */
  private updateCameraTransform(): void {
    this.camera.position.set(this.state.position.x, this.state.position.y, this.state.position.z)

    // Apply rotation using quaternion for smooth interpolation
    const euler = new THREE.Euler(
      this.state.rotation.pitch,
      this.state.rotation.yaw,
      this.state.rotation.roll,
      'YXZ' // Yaw-pitch-roll order
    )
    this.camera.quaternion.setFromEuler(euler)
  }

  /**
   * Handle window resize
   */
  private handleResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
  }

  /**
   * Get the Three.js camera object
   */
  getCamera(): THREE.PerspectiveCamera {
    return this.camera
  }

  /**
   * Get camera state
   */
  getState(): CameraState {
    return { ...this.state }
  }

  /**
   * Cleanup
   */
  dispose(): void {
    window.removeEventListener('resize', this.handleResize.bind(this))
  }
}
