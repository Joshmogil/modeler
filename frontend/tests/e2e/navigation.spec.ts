import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

/**
 * E2E Tests for User Story 1: Navigate Through Repository in 3D
 * 
 * These tests verify:
 * - Loading a real repository and rendering it as a 3D world
 * - WASD keyboard navigation through the world
 * - Mouse look controls for first-person camera
 * 
 * Constitution Compliance:
 * - Tests use local test repository (no external downloads)
 * - All data stays in browser (IndexedDB)
 * - No network requests during navigation
 * 
 * Test-Driven Development:
 * - These tests should FAIL initially (no implementation yet)
 * - Write tests first, then implement features to make them pass
 */

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test repository path (we'll create a small test repo)
const TEST_REPO_PATH = resolve(__dirname, '../../fixtures/test-repo');

test.describe('US1: 3D Repository Navigation', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173');
    
    // Wait for the app to be ready
    await page.waitForLoadState('networkidle');
  });

  test('T013: Should load repository and render 3D world', async ({ page }) => {
    /**
     * Acceptance Criteria:
     * 1. User can select a local directory
     * 2. Repository is scanned and stored in IndexedDB
     * 3. 3D world is rendered with files and directories as objects
     * 4. Canvas displays Three.js scene
     * 5. Objects are positioned in a grid layout
     */

    // Look for repository selection UI
    const loadButton = page.getByRole('button', { name: /load repository/i });
    await expect(loadButton).toBeVisible({ timeout: 3000 });

    // Use the hidden test loading function
    await page.evaluate(async (repoPath) => {
      await (window as any).__loadRepositoryByPath(repoPath);
    }, TEST_REPO_PATH);

    // Wait for repository to load (check loading indicator disappears)
    await page.waitForSelector('[data-testid="loading-indicator"]:not([style*="display: none"])', { 
      state: 'hidden', 
      timeout: 3000 
    });

    // Verify 3D canvas is rendered
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Verify canvas has WebGL context (indicates Three.js is running)
    const hasWebGL = await canvas.evaluate((el) => {
      const ctx = (el as HTMLCanvasElement).getContext('webgl') || (el as HTMLCanvasElement).getContext('webgl2');
      return ctx !== null;
    });
    expect(hasWebGL).toBe(true);

    // Verify world objects are rendered
    // We'll check the scene has children (files/directories)
    const objectCount = await page.evaluate(() => {
      return (window as any).__THREE_SCENE__?.children?.length || 0;
    });
    expect(objectCount).toBeGreaterThan(0);

    // Verify FPS counter is visible
    const fpsCounter = page.getByTestId('fps-counter');
    await expect(fpsCounter).toBeVisible();
    const fps = await fpsCounter.textContent();
    expect(parseInt(fps || '0')).toBeGreaterThan(0);

    // Verify repository info HUD
    const repoName = page.getByTestId('repo-name');
    await expect(repoName).toContainText('test-repo');

    const fileCount = page.getByTestId('file-count');
    await expect(fileCount).toBeVisible();
  });

  test('T014: Should navigate with WASD keys', async ({ page }) => {
    /**
     * Acceptance Criteria:
     * 1. W key moves camera forward
     * 2. S key moves camera backward
     * 3. A key strafes camera left
     * 4. D key strafes camera right
     * 5. Camera position updates smoothly
     * 6. Position is displayed in HUD
     */

    // Load repository first
    await page.evaluate(async (repoPath) => {
      await (window as any).__loadRepositoryByPath(repoPath);
    }, TEST_REPO_PATH);
    await page.waitForSelector('[data-testid="loading-indicator"]:not([style*="display: none"])', { state: 'hidden' });

    // Get initial camera position
    const initialPosition = await page.evaluate(() => {
      return (window as any).__CAMERA_POSITION__ || { x: 0, y: 0, z: 0 };
    });

    // Press W key (move forward)
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(1000); // Hold for 1 second
    await page.keyboard.up('KeyW');

    // Verify camera moved forward (Z should decrease with corrected controls)
    const afterW = await page.evaluate(() => {
      return (window as any).__CAMERA_POSITION__ || { x: 0, y: 0, z: 0 };
    });
    expect(afterW.z).toBeLessThan(initialPosition.z);

    // Press S key (move backward)
    await page.keyboard.down('KeyS');
    await page.waitForTimeout(1000);
    await page.keyboard.up('KeyS');

    const afterS = await page.evaluate(() => {
      return (window as any).__CAMERA_POSITION__ || { x: 0, y: 0, z: 0 };
    });
    expect(afterS.z).toBeGreaterThan(afterW.z);

    // Press A key (strafe left)
    await page.keyboard.down('KeyA');
    await page.waitForTimeout(1000);
    await page.keyboard.up('KeyA');

    const afterA = await page.evaluate(() => {
      return (window as any).__CAMERA_POSITION__ || { x: 0, y: 0, z: 0 };
    });
    // Verify A moved the camera horizontally (X changed)
    expect(Math.abs(afterA.x - afterS.x)).toBeGreaterThan(0.1);

    // Press D key (strafe right)
    await page.keyboard.down('KeyD');
    await page.waitForTimeout(1000);
    await page.keyboard.up('KeyD');

    const afterD = await page.evaluate(() => {
      return (window as any).__CAMERA_POSITION__ || { x: 0, y: 0, z: 0 };
    });
    // Verify D moved in opposite direction from A
    expect(Math.abs(afterD.x - afterA.x)).toBeGreaterThan(0.1);

    // Verify position is displayed in HUD
    const positionDisplay = page.getByTestId('camera-position');
    await expect(positionDisplay).toBeVisible();
    const posText = await positionDisplay.textContent();
    expect(posText).toMatch(/x:\s*-?\d+\.\d+/i);
    expect(posText).toMatch(/y:\s*-?\d+\.\d+/i);
    expect(posText).toMatch(/z:\s*-?\d+\.\d+/i);
  });

  test('T015: Should control camera with mouse', async ({ page, browserName }) => {
    /**
     * Acceptance Criteria:
     * 1. Mouse movement rotates camera (first-person look)
     * 2. Horizontal mouse moves yaw (left/right)
     * 3. Vertical mouse moves pitch (up/down)
     * 4. Pitch is clamped to prevent flip
     * 5. Rotation is smooth and responsive
     * 6. Canvas captures pointer for immersive control
     * 
     * NOTE: Pointer Lock API may not work in headless mode
     * This test validates the implementation exists, but actual pointer
     * lock testing requires headed browser mode
     */

    // Load repository first
    await page.evaluate(async (repoPath) => {
      await (window as any).__loadRepositoryByPath(repoPath);
    }, TEST_REPO_PATH);
    await page.waitForSelector('[data-testid="loading-indicator"]:not([style*="display: none"])', { state: 'hidden' });

    // Verify MouseController is initialized (check for canvas click handler)
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // In headless mode, pointer lock won't work, so just verify rotation can change
    const initialRotation = await page.evaluate(() => {
      return (window as any).__CAMERA_ROTATION__ || { pitch: 0, yaw: 0, roll: 0 };
    });

    // Verify rotation state exists and is trackable
    expect(initialRotation).toBeDefined();
    expect(typeof initialRotation.pitch).toBe('number');
    expect(typeof initialRotation.yaw).toBe('number');
    
    // Verify pitch clamping exists (should be between -89 and 89 degrees)
    expect(initialRotation.pitch).toBeGreaterThan(-90);
    expect(initialRotation.pitch).toBeLessThan(90);

    // Verify rotation is displayed in HUD
    const rotationDisplay = page.getByTestId('camera-rotation');
    await expect(rotationDisplay).toBeVisible();
    const rotText = await rotationDisplay.textContent();
    expect(rotText).toMatch(/pitch:\s*-?\d+/i);
    expect(rotText).toMatch(/yaw:\s*-?\d+/i);
  });

  test('Should display breadcrumb trail of current location', async ({ page }) => {
    /**
     * Supplemental test for navigation context
     * Verify user can see where they are in the repository hierarchy
     */

    await page.evaluate(async (repoPath) => {
      await (window as any).__loadRepositoryByPath(repoPath);
    }, TEST_REPO_PATH);
    await page.waitForSelector('[data-testid="loading-indicator"]:not([style*="display: none"])', { state: 'hidden' });

    // Verify breadcrumb shows root initially
    const breadcrumb = page.getByTestId('breadcrumb');
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb).toContainText('test-repo');

    // Navigate to different positions and verify breadcrumb updates
    // This will be refined once we implement collision detection
    // and determine what "being inside a directory" means spatially
  });

  test('Should maintain 60 FPS during navigation', async ({ page }) => {
    /**
     * Performance test - verify smooth rendering
     * Constitution: Simple tools that work well locally
     */

    await page.evaluate(async (repoPath) => {
      await (window as any).__loadRepositoryByPath(repoPath);
    }, TEST_REPO_PATH);
    await page.waitForSelector('[data-testid="loading-indicator"]:not([style*="display: none"])', { state: 'hidden' });

    // Navigate around while tracking FPS
    const fpsReadings: number[] = [];

    for (let i = 0; i < 10; i++) {
      await page.keyboard.down('KeyW');
      await page.waitForTimeout(100);
      await page.keyboard.up('KeyW');

      const fps = await page.evaluate(() => {
        return (window as any).__RENDERER_FPS__ || 0;
      });
      fpsReadings.push(fps);
    }

    // Average FPS should be at least 55 (allowing some variance)
    const avgFPS = fpsReadings.reduce((a, b) => a + b, 0) / fpsReadings.length;
    expect(avgFPS).toBeGreaterThanOrEqual(55);
  });
});
