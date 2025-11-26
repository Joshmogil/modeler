import * as THREE from 'three';
import { CodeRelationship } from '../analysis/CodeAnalyzer';

/**
 * RelationshipVisualizer - Visualizes code relationships as 3D connections
 * 
 * Constitution Compliance:
 * - All visualization happens locally in browser
 * - Uses Three.js for WebGL rendering
 * - No external dependencies
 * 
 * Features:
 * - Draw lines between related files
 * - Color-code by relationship type
 * - Animated flow effects
 * - Toggle visibility
 */

export class RelationshipVisualizer {
  private scene: THREE.Scene;
  private connections: THREE.Line[] = [];
  private particles: THREE.Points[] = [];
  private visible: boolean = true;
  private animationTime: number = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  /**
   * Build visual connections from relationships
   */
  buildConnections(
    relationships: CodeRelationship[],
    filePositions: Map<string, THREE.Vector3>
  ): void {
    this.clearConnections();

    relationships.forEach(rel => {
      const fromPos = filePositions.get(rel.fromFile);
      const toPos = filePositions.get(rel.toFile);

      if (fromPos && toPos) {
        this.createConnection(fromPos, toPos, rel.type);
      }
    });

    console.log(`Created ${this.connections.length} relationship connections`);
  }

  /**
   * Create a connection line between two points
   */
  private createConnection(
    from: THREE.Vector3,
    to: THREE.Vector3,
    type: CodeRelationship['type']
  ): void {
    // Create curved line using quadratic bezier
    const midPoint = new THREE.Vector3(
      (from.x + to.x) / 2,
      Math.max(from.y, to.y) + 2, // Arc upward
      (from.z + to.z) / 2
    );

    const curve = new THREE.QuadraticBezierCurve3(from, midPoint, to);
    const points = curve.getPoints(20);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // Color based on relationship type
    const color = this.getColorForType(type);
    const material = new THREE.LineBasicMaterial({
      color,
      opacity: 0.4,
      transparent: true,
      linewidth: 2,
    });

    const line = new THREE.Line(geometry, material);
    line.visible = this.visible;
    
    // Store metadata
    (line as any).userData = {
      type,
      from: from.clone(),
      to: to.clone(),
    };

    this.scene.add(line);
    this.connections.push(line);

    // Add animated particle flowing along the line
    this.createFlowingParticle(curve, color);
  }

  /**
   * Create animated particle that flows along connection
   */
  private createFlowingParticle(curve: THREE.QuadraticBezierCurve3, color: number): void {
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 5;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      const point = curve.getPoint(t);
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color,
      size: 0.2,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    particles.visible = this.visible;
    
    // Store curve for animation
    (particles as any).userData = {
      curve,
      particleCount,
    };

    this.scene.add(particles);
    this.particles.push(particles);
  }

  /**
   * Get color for relationship type
   */
  private getColorForType(type: CodeRelationship['type']): number {
    switch (type) {
      case 'import':
        return 0x00ff00; // Green for imports
      case 'export':
        return 0x0000ff; // Blue for exports
      case 'function-call':
        return 0xff9900; // Orange for function calls
      case 'variable-ref':
        return 0xff00ff; // Magenta for variable references
      default:
        return 0xffffff; // White as fallback
    }
  }

  /**
   * Animate particles flowing along connections
   * Call this every frame
   */
  animate(deltaTime: number): void {
    if (!this.visible) return;

    this.animationTime += deltaTime * 0.5; // Slow down animation

    this.particles.forEach(particles => {
      const userData = (particles as any).userData;
      const curve = userData.curve as THREE.QuadraticBezierCurve3;
      const particleCount = userData.particleCount as number;
      
      const positionAttr = particles.geometry.attributes.position;
      if (!positionAttr) return;
      
      const positions = positionAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        // Calculate animated position along curve
        const t = ((this.animationTime + i / particleCount) % 1);
        const point = curve.getPoint(t);
        
        positions[i * 3] = point.x;
        positions[i * 3 + 1] = point.y;
        positions[i * 3 + 2] = point.z;
      }

      positionAttr.needsUpdate = true;
    });
  }

  /**
   * Toggle visibility of all connections
   */
  setVisible(visible: boolean): void {
    this.visible = visible;
    this.connections.forEach(line => {
      line.visible = visible;
    });
    this.particles.forEach(particles => {
      particles.visible = visible;
    });
  }

  /**
   * Check if connections are visible
   */
  isVisible(): boolean {
    return this.visible;
  }

  /**
   * Clear all connections
   */
  clearConnections(): void {
    this.connections.forEach(line => {
      this.scene.remove(line);
      line.geometry.dispose();
      if (Array.isArray(line.material)) {
        line.material.forEach(m => m.dispose());
      } else {
        line.material.dispose();
      }
    });
    this.connections = [];

    this.particles.forEach(particles => {
      this.scene.remove(particles);
      particles.geometry.dispose();
      if (Array.isArray(particles.material)) {
        particles.material.forEach(m => m.dispose());
      } else {
        particles.material.dispose();
      }
    });
    this.particles = [];

    this.animationTime = 0;
  }

  /**
   * Get statistics about connections
   */
  getStats(): { total: number; byType: Record<string, number> } {
    const byType: Record<string, number> = {};
    
    this.connections.forEach(line => {
      const type = (line as any).userData.type;
      byType[type] = (byType[type] || 0) + 1;
    });

    return {
      total: this.connections.length,
      byType,
    };
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.clearConnections();
  }
}
