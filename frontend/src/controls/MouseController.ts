import { Camera } from '../core/Camera';

/**
 * MouseController - Handles mouse input for first-person camera look
 * 
 * Constitution Compliance:
 * - Browser-native Pointer Lock API
 * - No external dependencies
 * 
 * Features:
 * - First-person mouse look (pitch/yaw)
 * - Pointer lock for immersive control
 * - Configurable mouse sensitivity
 * - Automatic pitch clamping
 */

export class MouseController {
  private camera: Camera;
  private canvas: HTMLCanvasElement;
  private sensitivity = 0.002; // Radians per pixel
  private isLocked = false;

  constructor(camera: Camera, canvas: HTMLCanvasElement) {
    this.camera = camera;
    this.canvas = canvas;
    this.bindEvents();
  }

  /**
   * Bind mouse and pointer lock events
   */
  private bindEvents(): void {
    this.canvas.addEventListener('click', this.handleCanvasClick);
    document.addEventListener('pointerlockchange', this.handlePointerLockChange);
    document.addEventListener('mousemove', this.handleMouseMove);
  }

  /**
   * Unbind events and release pointer lock
   */
  public dispose(): void {
    this.canvas.removeEventListener('click', this.handleCanvasClick);
    document.removeEventListener('pointerlockchange', this.handlePointerLockChange);
    document.removeEventListener('mousemove', this.handleMouseMove);
    
    if (this.isLocked) {
      document.exitPointerLock();
    }
  }

  /**
   * Handle canvas click to request pointer lock
   */
  private handleCanvasClick = (): void => {
    if (!this.isLocked) {
      this.canvas.requestPointerLock();
    }
  };

  /**
   * Handle pointer lock state changes
   */
  private handlePointerLockChange = (): void => {
    this.isLocked = document.pointerLockElement === this.canvas;
  };

  /**
   * Handle mouse movement for camera rotation
   */
  private handleMouseMove = (event: MouseEvent): void => {
    if (!this.isLocked) return;

    // movementX/Y provide relative mouse movement
    // FIXED: Inverted deltaX to fix left/right being reversed
    const deltaX = -event.movementX * this.sensitivity; // Added negative sign
    const deltaY = event.movementY * this.sensitivity;

    // Rotate camera (yaw = horizontal, pitch = vertical)
    // Negate deltaY because moving mouse up should look up (decrease pitch)
    this.camera.rotate(-deltaY, deltaX);
  };

  /**
   * Request pointer lock manually
   */
  public requestLock(): void {
    this.canvas.requestPointerLock();
  }

  /**
   * Exit pointer lock manually
   */
  public exitLock(): void {
    if (this.isLocked) {
      document.exitPointerLock();
    }
  }

  /**
   * Check if pointer is currently locked
   */
  public isPointerLocked(): boolean {
    return this.isLocked;
  }

  /**
   * Set mouse sensitivity
   * 
   * @param sensitivity - Radians per pixel (default: 0.002)
   */
  public setSensitivity(sensitivity: number): void {
    this.sensitivity = sensitivity;
  }

  /**
   * Get current mouse sensitivity
   */
  public getSensitivity(): number {
    return this.sensitivity;
  }
}
