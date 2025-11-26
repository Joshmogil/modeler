import { Camera } from '../core/Camera';

/**
 * KeyboardController - Handles WASD keyboard input for camera movement
 * 
 * Constitution Compliance:
 * - No external dependencies
 * - Browser-native keyboard events only
 * 
 * Features:
 * - WASD movement (forward, back, left, right)
 * - Space/Shift for up/down
 * - Smooth velocity-based movement
 * - Key state tracking for simultaneous inputs
 */

export class KeyboardController {
  private camera: Camera;
  private keyState: Map<string, boolean> = new Map();
  private moveSpeed = 50; // Units per second (3x increase from 50.0)

  constructor(camera: Camera) {
    this.camera = camera;
    this.bindEvents();
  }

  /**
   * Bind keyboard event listeners
   */
  private bindEvents(): void {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  /**
   * Unbind keyboard event listeners
   */
  public dispose(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  /**
   * Handle keydown events
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    this.keyState.set(event.code, true);
  };

  /**
   * Handle keyup events
   */
  private handleKeyUp = (event: KeyboardEvent): void => {
    this.keyState.set(event.code, false);
  };

  /**
   * Update camera position based on key state
   * Call this every frame from your render loop
   * 
   * @param deltaTime - Time since last frame in seconds
   */
  public update(deltaTime: number): void {
    let forward = 0;
    let right = 0;
    let up = 0;

    // Forward/Backward (W/S) - FIXED: W should move forward (positive)
    if (this.keyState.get('KeyW')) {
      forward -= 1 * this.moveSpeed; // Changed from += to -= (move in negative Z = forward)
    }
    if (this.keyState.get('KeyS')) {
      forward += 1 * this.moveSpeed; // Changed from -= to += (move in positive Z = backward)
    }

    // Strafe Left/Right (A/D) - FIXED: A left, D right
    if (this.keyState.get('KeyA')) {
      right -= 1 * this.moveSpeed; // Strafe left (negative right direction)
    }
    if (this.keyState.get('KeyD')) {
      right += 1 * this.moveSpeed; // Strafe right (positive right direction)
    }

    // Up/Down (Space/Shift)
    if (this.keyState.get('Space')) {
      up += 1 * this.moveSpeed;
    }
    if (this.keyState.get('ShiftLeft') || this.keyState.get('ShiftRight')) {
      up -= 1 * this.moveSpeed;
    }

    // Apply movement via Camera.move() which handles local space transform
    if (forward !== 0 || right !== 0 || up !== 0) {
      this.camera.move(forward, right, up, deltaTime);
    }
  }

  /**
   * Set movement speed
   * 
   * @param speed - Units per second
   */
  public setMoveSpeed(speed: number): void {
    this.moveSpeed = speed;
  }

  /**
   * Get current movement speed
   */
  public getMoveSpeed(): number {
    return this.moveSpeed;
  }

  /**
   * Check if a key is currently pressed
   * 
   * @param code - KeyboardEvent.code (e.g., 'KeyW', 'Space')
   */
  public isKeyPressed(code: string): boolean {
    return this.keyState.get(code) || false;
  }

  /**
   * Reset all key states (useful when losing focus)
   */
  public reset(): void {
    this.keyState.clear();
  }
}
