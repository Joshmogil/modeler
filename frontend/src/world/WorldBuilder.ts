import * as THREE from 'three';
import { FileNode, DirectoryNode, Repository } from '../types';
import { getLanguageColor } from '../utils/ColorPalette';

/**
 * WorldBuilder - Creates 3D representations of repository structure
 * 
 * Constitution Compliance:
 * - All rendering happens locally in browser
 * - Uses Three.js for WebGL rendering
 * - No external API calls
 * 
 * Features:
 * - Files rendered as colored boxes (color by language)
 * - Directories rendered as transparent containers
 * - Grid layout for spatial organization
 * - Size represents file size
 */

interface WorldObject {
  mesh: THREE.Mesh;
  node: FileNode | DirectoryNode;
  type: 'file' | 'directory';
}

export class WorldBuilder {
  private scene: THREE.Scene;
  private objects: WorldObject[] = [];
  private fileSpacing = 2; // Reduced from 4 to 2
  private dirSpacing = 4; // Reduced from 8 to 4

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  /**
   * Build 3D world from repository structure
   */
  buildWorld(repository: Repository): void {
    this.clearWorld();
    
    // Add ground plane
    this.addGroundPlane();
    
    // Add grid helper
    this.addGridHelper();
    
    // Use flat layout instead of recursive nesting
    this.buildFlatLayout(repository.rootNode);
    
    console.log(`Built world with ${this.objects.length} objects`);
  }

  /**
   * Build a flat layout where all files are visible on the ground plane
   */
  private buildFlatLayout(rootNode: DirectoryNode): void {
    // Collect all files and directories in a flat list
    const allNodes: Array<{ node: FileNode | DirectoryNode; depth: number; parentPath: string }> = [];
    
    const collectNodes = (node: FileNode | DirectoryNode, depth: number, parentPath: string) => {
      allNodes.push({ node, depth, parentPath });
      
      if (node.type === 'directory') {
        node.children.forEach(child => {
          collectNodes(child, depth + 1, node.path);
        });
      }
    };
    
    collectNodes(rootNode, 0, '');
    
    // Organize by directory
    const dirGroups = new Map<string, Array<FileNode | DirectoryNode>>();
    allNodes.forEach(({ node, parentPath }) => {
      if (!dirGroups.has(parentPath)) {
        dirGroups.set(parentPath, []);
      }
      dirGroups.get(parentPath)?.push(node);
    });
    
    // Layout each directory group in a row
    let currentZ = 0;
    
    Array.from(dirGroups.entries()).forEach(([_dirPath, nodes]) => {
      let currentX = 0;
      
      nodes.forEach(node => {
        const position = {
          x: currentX,
          y: 0,
          z: currentZ,
        };
        
        if (node.type === 'file') {
          this.createFileObject(node, position);
        } else {
          this.createDirectoryObject(node, position);
        }
        
        currentX += this.fileSpacing;
      });
      
      currentZ += this.dirSpacing;
    });
  }

  /**
   * Create a 3D mesh for a file
   */
  private createFileObject(file: FileNode, position: { x: number; y: number; z: number }): void {
    // Size based on file size (logarithmic scale for better visualization)
    const sizeScale = Math.log10(Math.max(file.size, 100)) / 5;
    const width = 0.5 + sizeScale;
    const height = 1.0 + sizeScale;
    const depth = 0.3;

    const geometry = new THREE.BoxGeometry(width, height, depth);
    
    // Color based on language
    const colorInfo = getLanguageColor(file.language);
    const material = new THREE.MeshStandardMaterial({
      color: colorInfo.primary,
      roughness: 0.7,
      metalness: 0.3,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position.x, position.y + height / 2, position.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Store reference to node data
    (mesh as any).userData = {
      node: file,
      type: 'file',
    };

    this.scene.add(mesh);
    this.objects.push({ mesh, node: file, type: 'file' });
    
    // Add text label
    this.createTextLabel(file.name, position.x, position.y + height + 0.3, position.z);
  }

  /**
   * Create a 3D mesh for a directory
   */
  private createDirectoryObject(
    directory: DirectoryNode,
    position: { x: number; y: number; z: number }
  ): void {
    // Directories are larger, transparent boxes
    const width = 2.0;
    const height = 0.5;
    const depth = 2.0;

    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({
      color: 0x3178c6,
      transparent: true,
      opacity: 0.3,
      roughness: 0.5,
      metalness: 0.2,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position.x, position.y + height / 2, position.z);
    
    // Add wireframe outline
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x61dafb })
    );
    mesh.add(line);

    // Store reference to node data
    (mesh as any).userData = {
      node: directory,
      type: 'directory',
    };

    this.scene.add(mesh);
    this.objects.push({ mesh, node: directory, type: 'directory' });
    
    // Add text label
    this.createTextLabel(directory.name, position.x, position.y + height + 0.3, position.z);
  }

  /**
   * Create a text label using canvas-based sprite
   */
  private createTextLabel(text: string, x: number, y: number, z: number): void {
    // Create canvas for text texture
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;

    // Canvas size
    canvas.width = 256;
    canvas.height = 64;

    // Style text
    context.fillStyle = 'rgba(255, 255, 255, 0.9)';
    context.font = 'Bold 24px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    // Add background for better visibility
    context.fillStyle = 'rgba(0, 0, 0, 0.6)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text
    context.fillStyle = 'rgba(255, 255, 255, 0.9)';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    // Create sprite material
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.9,
    });

    // Create sprite
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(x, y, z);
    sprite.scale.set(1.5, 0.4, 1); // Adjust size

    this.scene.add(sprite);
  }

  /**
   * Add ground plane for reference
   */
  private addGroundPlane(): void {
    const geometry = new THREE.PlaneGeometry(100, 100);
    const material = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.8,
      metalness: 0.2,
    });
    
    const ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    
    this.scene.add(ground);
  }

  /**
   * Add grid helper for spatial reference
   */
  private addGridHelper(): void {
    const gridHelper = new THREE.GridHelper(100, 50, 0x444444, 0x222222);
    gridHelper.position.y = 0.01; // Slightly above ground to avoid z-fighting
    this.scene.add(gridHelper);
  }

  /**
   * Clear all objects from the world
   */
  clearWorld(): void {
    this.objects.forEach(({ mesh }) => {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(m => m.dispose());
      } else {
        mesh.material.dispose();
      }
    });
    this.objects = [];
    
    // Clear ground and grid (rebuild them fresh)
    const toRemove: THREE.Object3D[] = [];
    this.scene.children.forEach(child => {
      if (child instanceof THREE.Mesh || child instanceof THREE.GridHelper) {
        toRemove.push(child);
      }
    });
    toRemove.forEach(obj => this.scene.remove(obj));
  }

  /**
   * Get all world objects
   */
  getObjects(): WorldObject[] {
    return this.objects;
  }

  /**
   * Get file positions for relationship visualization
   */
  getFilePositions(): Map<string, THREE.Vector3> {
    const positions = new Map<string, THREE.Vector3>();
    
    this.objects.forEach(obj => {
      if (obj.type === 'file') {
        const file = obj.node as FileNode;
        positions.set(file.path, obj.mesh.position.clone());
        
        // Also add by relative path if available
        if (file.relativePath) {
          positions.set(file.relativePath, obj.mesh.position.clone());
        }
      }
    });

    return positions;
  }

  /**
   * Find object at screen coordinates (for raycasting)
   */
  findObjectAtPoint(raycaster: THREE.Raycaster): WorldObject | null {
    const meshes = this.objects.map(obj => obj.mesh);
    const intersects = raycaster.intersectObjects(meshes);
    
    if (intersects.length > 0 && intersects[0]) {
      const mesh = intersects[0].object as THREE.Mesh;
      return this.objects.find(obj => obj.mesh === mesh) || null;
    }
    
    return null;
  }
}
