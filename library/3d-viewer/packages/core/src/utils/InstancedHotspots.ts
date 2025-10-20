/**
 * GPU-instanced hotspot rendering
 * Render thousands of hotspots with minimal performance impact
 */
import * as THREE from 'three';
import type { Hotspot } from '../types';

export class InstancedHotspots {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private instancedMesh: THREE.InstancedMesh | null = null;
  private hotspots: Map<string, { index: number; hotspot: Hotspot }> = new Map();
  private maxInstances: number = 1000;
  private currentInstanceCount: number = 0;
  private dummy: THREE.Object3D = new THREE.Object3D();

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, maxInstances: number = 1000) {
    this.scene = scene;
    this.camera = camera;
    this.maxInstances = maxInstances;
    this.createInstancedMesh();
  }

  /**
   * Create instanced mesh for hotspots
   */
  private createInstancedMesh(): void {
    // Create simple sphere geometry for hotspots
    const geometry = new THREE.SphereGeometry(5, 16, 16);
    
    // Create material with instancing support
    const material = new THREE.MeshBasicMaterial({
      color: 0x4CAF50,
      transparent: true,
      opacity: 0.8,
    });

    // Create instanced mesh
    this.instancedMesh = new THREE.InstancedMesh(
      geometry,
      material,
      this.maxInstances
    );

    // Set initial count to 0 (nothing visible)
    this.instancedMesh.count = 0;
    this.scene.add(this.instancedMesh);
  }

  /**
   * Add hotspot with GPU instancing
   */
  public addHotspot(hotspot: Hotspot): void {
    if (this.currentInstanceCount >= this.maxInstances) {
      console.warn('Maximum instanced hotspots reached');
      return;
    }

    const index = this.currentInstanceCount;
    this.hotspots.set(hotspot.id, { index, hotspot });
    
    // Update instance matrix
    this.updateHotspotInstance(index, hotspot);
    
    this.currentInstanceCount++;
    if (this.instancedMesh) {
      this.instancedMesh.count = this.currentInstanceCount;
    }
  }

  /**
   * Update hotspot instance matrix
   */
  private updateHotspotInstance(index: number, hotspot: Hotspot): void {
    if (!this.instancedMesh) return;

    // Convert spherical to cartesian coordinates
    const { theta, phi } = hotspot.position;
    const radius = 490; // Slightly inside sphere surface
    
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    // Set position
    this.dummy.position.set(x, y, z);
    
    // Make hotspot face camera
    this.dummy.lookAt(0, 0, 0);
    
    // Apply transformation
    this.dummy.updateMatrix();
    this.instancedMesh.setMatrixAt(index, this.dummy.matrix);
    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }

  /**
   * Remove hotspot
   */
  public removeHotspot(id: string): void {
    const entry = this.hotspots.get(id);
    if (!entry) return;

    const removedIndex = entry.index;
    
    // Swap with last instance
    const lastIndex = this.currentInstanceCount - 1;
    if (removedIndex !== lastIndex) {
      // Find hotspot at last index
      const lastHotspot = Array.from(this.hotspots.values())
        .find(h => h.index === lastIndex);
      
      if (lastHotspot) {
        // Update its index
        lastHotspot.index = removedIndex;
        this.updateHotspotInstance(removedIndex, lastHotspot.hotspot);
      }
    }

    this.hotspots.delete(id);
    this.currentInstanceCount--;
    
    if (this.instancedMesh) {
      this.instancedMesh.count = this.currentInstanceCount;
    }
  }

  /**
   * Update all hotspot positions (call when camera moves)
   */
  public update(): void {
    // Hotspots are already positioned in world space
    // They automatically move with camera due to instancing
    // This method can be used for additional updates if needed
  }

  /**
   * Get number of active instances
   */
  public getCount(): number {
    return this.currentInstanceCount;
  }

  /**
   * Clear all hotspots
   */
  public clear(): void {
    this.hotspots.clear();
    this.currentInstanceCount = 0;
    if (this.instancedMesh) {
      this.instancedMesh.count = 0;
    }
  }

  /**
   * Set hotspot color
   */
  public setColor(color: number): void {
    if (this.instancedMesh) {
      (this.instancedMesh.material as THREE.MeshBasicMaterial).color.setHex(color);
    }
  }

  /**
   * Set hotspot opacity
   */
  public setOpacity(opacity: number): void {
    if (this.instancedMesh) {
      (this.instancedMesh.material as THREE.MeshBasicMaterial).opacity = opacity;
    }
  }

  /**
   * Dispose
   */
  public dispose(): void {
    if (this.instancedMesh) {
      this.instancedMesh.geometry.dispose();
      (this.instancedMesh.material as THREE.Material).dispose();
      this.scene.remove(this.instancedMesh);
      this.instancedMesh = null;
    }
    this.hotspots.clear();
  }
}

