import { useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ViewMode } from './types';
import { applyViewMode, resetMaterial, resetAllMaterials } from './utils';

type ModelProps = {
  url: string;
  viewMode: ViewMode;
  setTriangleCount: (count: number) => void;
  isPrimary?: boolean; // Default to true for single view
};

export function Model({ 
  url, 
  viewMode, 
  setTriangleCount,
  isPrimary = true 
}: ModelProps) {
  const { camera } = useThree(); 
  const gltf = useGLTF(url); 
  
  // Clone the scene AND its materials to prevent shared state issues in split view
  const scene = useMemo(() => {
    const clonedScene = gltf.scene.clone(); 
    clonedScene.traverse((object) => {
      if (object instanceof THREE.Mesh && object.material) {
        if (Array.isArray(object.material)) {
          object.material = object.material.map(material => material.clone()); 
        } else {
          object.material = object.material.clone();
        }
      }
    });
    return clonedScene;
  }, [gltf]); 
  
  useEffect(() => {
    // Adjust camera position based on model bounding box
    const box = new THREE.Box3().setFromObject(scene); 
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera instanceof THREE.PerspectiveCamera ? camera.fov * (Math.PI / 180) : 45 * (Math.PI / 180);
    let cameraDistance = maxDim / (2 * Math.tan(fov / 2));
    cameraDistance *= 1.5; // Add padding
    
    if (isPrimary) {
        camera.position.set(center.x, center.y, center.z + cameraDistance);
    } else {
        // For secondary view, use a slightly different default or rely on SplitScreenView's initial camera
        camera.position.set(center.x + cameraDistance * 0.5, center.y, center.z + cameraDistance); 
    }
    camera.lookAt(center.x, center.y, center.z);

  }, [scene, camera, isPrimary]); 
  
  // Calculate and set triangle count (only if primary instance)
  useEffect(() => {
    if (!isPrimary) return; 

    let totalTriangles = 0;
    scene.traverse((object) => { 
      if (object instanceof THREE.Mesh && object.name !== 'wireframeOverlay') {
        const geometry = object.geometry;
        if (geometry.index !== null) {
          totalTriangles += geometry.index.count / 3;
        } else if (geometry.attributes.position) {
          totalTriangles += geometry.attributes.position.count / 3;
        }
      }
    });
    setTriangleCount(Math.round(totalTriangles));
  }, [scene, setTriangleCount, isPrimary]); 
  
  // Apply the selected view mode to materials
  useEffect(() => {
    // Reset all materials first before applying the new mode
    resetAllMaterials(scene);
    
    // Now apply the current view mode
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material && child.name !== 'wireframeOverlay') {
        // Store reference to the parent object for each material
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => {
            mat.userData.parentObject = child; // Ensure parent is set before applying
            applyViewMode(mat, viewMode);
          });
        } else {
          child.material.userData.parentObject = child; // Ensure parent is set before applying
          applyViewMode(child.material, viewMode);
        }
      }
    });
    
    // Cleanup on unmount or when viewMode changes before next effect run
    return () => {
      resetAllMaterials(scene);
    }
  }, [scene, viewMode]); // Depend on scene and viewMode
  
  // Render the cloned scene
  return <primitive object={scene} />; 
} 