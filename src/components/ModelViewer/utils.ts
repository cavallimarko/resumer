import * as THREE from 'three';
import { ViewMode } from './types';

// Type guard for materials that support wireframe
const supportsWireframe = (mat: THREE.Material): mat is THREE.MeshBasicMaterial | 
  THREE.MeshStandardMaterial | THREE.MeshPhongMaterial | 
  THREE.MeshLambertMaterial | THREE.MeshNormalMaterial => {
  return 'wireframe' in mat;
};

// Type guard for materials that support a base color map
const supportsBaseColorMap = (mat: THREE.Material): mat is THREE.MeshBasicMaterial | 
  THREE.MeshStandardMaterial | THREE.MeshPhongMaterial | 
  THREE.MeshLambertMaterial => {
  return 'map' in mat;
};

export const applyViewMode = (material: THREE.Material, mode: ViewMode) => {
  // Store original material properties if not already stored
  if (!material.userData.originalProps) {
    material.userData.originalProps = {
      wireframe: supportsWireframe(material) ? material.wireframe : false,
    }
  }
  
  // Only modify wireframe property if material supports it
  if (supportsWireframe(material)) {
    // Reset to default first
    material.wireframe = material.userData.originalProps.wireframe || false
    
    // Store original color for resetting later
    if (material instanceof THREE.MeshStandardMaterial && !material.userData.originalColor) {
      material.userData.originalColor = material.color.clone();
    }
    
    // Apply wireframe mode - make the model gray and add black wireframe overlay
    if (mode === 'wireframe') {
      const parentObject = material.userData.parentObject;
      
      // Skip if this is already a wireframe overlay or has one
      if (parentObject && 
          parentObject instanceof THREE.Mesh && 
          parentObject.name !== 'wireframeOverlay' &&
          !parentObject.userData.hasWireframeOverlay) {
        
        // Mark that this object has a wireframe overlay to prevent recursion
        parentObject.userData.hasWireframeOverlay = true;
        
        // Store original material properties for restoration
        if (material instanceof THREE.MeshStandardMaterial) {
          if (!material.userData.originalMaterialProps) {
            material.userData.originalMaterialProps = {
              color: material.color.clone(),
              map: material.map,
              normalMap: material.normalMap,
              roughnessMap: material.roughnessMap,
              metalnessMap: material.metalnessMap,
              emissiveMap: material.emissiveMap,
              aoMap: material.aoMap,
              // Additional properties
              emissive: material.emissive.clone(),
              roughness: material.roughness,
              metalness: material.metalness,
              envMap: material.envMap,
              envMapIntensity: material.envMapIntensity
            };
          }
          
          // Make the main material completely gray by setting color and disabling all textures and properties
          material.color.set(0xcccccc);
          material.map = null;
          material.normalMap = null;
          material.roughnessMap = null;
          material.metalnessMap = null;
          material.emissiveMap = null;
          material.aoMap = null;
          // Additional properties to ensure gray appearance
          material.emissive.set(0x000000);
          material.roughness = 0.7;
          material.metalness = 0.0;
          material.envMap = null;
          material.envMapIntensity = 0;
          // Force material update
          material.needsUpdate = true;
        } else if (material instanceof THREE.MeshBasicMaterial || 
                   material instanceof THREE.MeshLambertMaterial || 
                   material instanceof THREE.MeshPhongMaterial) {
          if (!material.userData.originalMaterialProps) {
            material.userData.originalMaterialProps = {
              color: material.color.clone(),
              map: material.map
            };
          }
          
          // Make gray and disable texture
          material.color.set(0xcccccc);
          material.map = null;
        }
        
        // Only add wireframe if not already added
        if (!parentObject.userData.wireframeMaterial) {
          // Create wireframe material
          const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            wireframe: true,
            transparent: true,
            opacity: 0.5
          });
          
          // Store the wireframe material for cleanup
          parentObject.userData.wireframeMaterial = wireframeMaterial;
          
          // Create a new mesh with the wireframe material and add it as a child
          const wireframeMesh = new THREE.Mesh(parentObject.geometry, wireframeMaterial);
          wireframeMesh.name = 'wireframeOverlay';
          parentObject.add(wireframeMesh);
        }
      }
    } else {
      // When not in wireframe mode, restore original material properties
      if (material.userData.originalMaterialProps) {
        if (material instanceof THREE.MeshStandardMaterial) {
          material.color.copy(material.userData.originalMaterialProps.color);
          material.map = material.userData.originalMaterialProps.map;
          material.normalMap = material.userData.originalMaterialProps.normalMap;
          material.roughnessMap = material.userData.originalMaterialProps.roughnessMap;
          material.metalnessMap = material.userData.originalMaterialProps.metalnessMap;
          material.emissiveMap = material.userData.originalMaterialProps.emissiveMap;
          material.aoMap = material.userData.originalMaterialProps.aoMap;
          // Restore additional properties
          material.emissive.copy(material.userData.originalMaterialProps.emissive);
          material.roughness = material.userData.originalMaterialProps.roughness;
          material.metalness = material.userData.originalMaterialProps.metalness;
          material.envMap = material.userData.originalMaterialProps.envMap;
          material.envMapIntensity = material.userData.originalMaterialProps.envMapIntensity;
          // Force material update
          material.needsUpdate = true;
        } else if (material instanceof THREE.MeshBasicMaterial || 
                   material instanceof THREE.MeshLambertMaterial || 
                   material instanceof THREE.MeshPhongMaterial) {
          material.color.copy(material.userData.originalMaterialProps.color);
          material.map = material.userData.originalMaterialProps.map;
        }
      }
      
      // Make sure parent object's wireframe flag is reset
      const parentObject = material.userData.parentObject;
      if (parentObject) {
        parentObject.userData.hasWireframeOverlay = false;
      }
    }
  } else {
    // Remove wireframe overlay when not in wireframe mode
    const parentObject = material.userData.parentObject;
    if (parentObject && parentObject instanceof THREE.Mesh) {
      // Find and remove any wireframe overlay
      const wireframeOverlay = parentObject.children.find(child => child.name === 'wireframeOverlay');
      if (wireframeOverlay) {
        parentObject.remove(wireframeOverlay);
        // Cleanup wireframe material
        if (parentObject.userData.wireframeMaterial) {
          parentObject.userData.wireframeMaterial.dispose();
          parentObject.userData.wireframeMaterial = null;
        }
      }
    }
  }
  
  // Handle normals visualization
  if (mode === 'normals') {
    const parentObject = material.userData.parentObject;
    
    if (parentObject && parentObject instanceof THREE.Mesh) {
      // Create new normal material with wireframe explicitly set to false
      parentObject.userData.normalMaterial = new THREE.MeshNormalMaterial({
        wireframe: false,
        flatShading: false
      });
      
      // Store the original material
      parentObject.userData.originalMaterial = parentObject.material;
      
      // Apply the normal material
      parentObject.material = parentObject.userData.normalMaterial;
    }
  } else if (mode === 'normalMap') {
    const parentObject = material.userData.parentObject;
    
    if (parentObject && parentObject instanceof THREE.Mesh) {
      // Only apply to materials that have normal maps
      if (material instanceof THREE.MeshStandardMaterial && material.normalMap) {
        // Store the original material if not already stored
        if (!parentObject.userData.originalMaterial) {
          parentObject.userData.originalMaterial = parentObject.material;
        }
        
        // Create a new material that only shows the normal map
        // Use a custom shader material to enhance the blue appearance
        const normalMapMaterial = new THREE.ShaderMaterial({
          uniforms: {
            normalMap: { value: material.normalMap }
          },
          vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform sampler2D normalMap;
            varying vec2 vUv;
            void main() {
              vec4 normalColor = texture2D(normalMap, vUv);
              // Enhance the blue channel to make it more prominent
              normalColor.b = normalColor.b * 1.5;
              // Adjust overall brightness
              normalColor.rgb = normalColor.rgb * 1.2;
              gl_FragColor = normalColor;
            }
          `
        });
        
        // Store the normal map material
        parentObject.userData.normalMapMaterial = normalMapMaterial;
        
        // Apply the normal map material
        parentObject.material = normalMapMaterial;
      }
    }
  } else if (mode === 'roughnessMap' || mode === 'metalnessMap' || mode === 'aoMap' || mode === 'emissiveMap') {
    const parentObject = material.userData.parentObject;
    
    if (parentObject && parentObject instanceof THREE.Mesh) {
      // Only apply to MeshStandardMaterial which supports these maps
      if (material instanceof THREE.MeshStandardMaterial) {
        // Get the appropriate map based on the mode
        let map = null;
        let useShader = false;
        let channel = '';
        
        if (mode === 'roughnessMap' && material.roughnessMap) {
          map = material.roughnessMap;
          useShader = true;
          channel = 'g'; // Roughness is often stored in green channel
        } else if (mode === 'metalnessMap' && material.metalnessMap) {
          map = material.metalnessMap;
          useShader = true;
          channel = 'b'; // Metalness is often stored in blue channel
        } else if (mode === 'aoMap' && material.aoMap) {
          map = material.aoMap;
        } else if (mode === 'emissiveMap' && material.emissiveMap) {
          map = material.emissiveMap;
        }
        
        // Only proceed if we have a map to display
        if (map) {
          // Store the original material if not already stored
          if (!parentObject.userData.originalMaterial) {
            parentObject.userData.originalMaterial = parentObject.material;
          }
          
          let mapMaterial;
          
          if (useShader) {
            // Use a shader material for roughness and metalness to extract specific channels
            mapMaterial = new THREE.ShaderMaterial({
              uniforms: {
                mapTexture: { value: map }
              },
              vertexShader: `
                varying vec2 vUv;
                void main() {
                  vUv = uv;
                  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
              `,
              fragmentShader: `
                uniform sampler2D mapTexture;
                varying vec2 vUv;
                void main() {
                  vec4 texColor = texture2D(mapTexture, vUv);
                  float channelValue = texColor.${channel};
                  
                  // Create a grayscale visualization with enhanced contrast
                  gl_FragColor = vec4(channelValue, channelValue, channelValue, 1.0);
                }
              `
            });
          } else {
            // Use basic material for other maps
            mapMaterial = new THREE.MeshBasicMaterial({
              map: map,
              wireframe: false
            });
          }
          
          // Store the map material with a unique key based on the mode
          parentObject.userData[`${mode}Material`] = mapMaterial;
          
          // Apply the map material
          parentObject.material = mapMaterial;
        }
      }
    }
  } else if (mode === 'baseColor') {
    const parentObject = material.userData.parentObject;
    
    if (parentObject && parentObject instanceof THREE.Mesh) {
      // Only apply to materials that have a base color map
      if (supportsBaseColorMap(material) && material.map) {
        // Store the original material if not already stored
        if (!parentObject.userData.originalMaterial) {
          parentObject.userData.originalMaterial = parentObject.material;
        }
        
        // Create a new basic material that only shows the base color map
        const baseColorMaterial = new THREE.MeshBasicMaterial({
          map: material.map,
          wireframe: false // Ensure wireframe is off
        });
        
        // Store the base color material
        parentObject.userData.baseColorMaterial = baseColorMaterial;
        
        // Apply the base color material
        parentObject.material = baseColorMaterial;
      }
    }
  } else {
    // Restore the original material when not in special modes
    const parentObject = material.userData.parentObject;
    if (parentObject && parentObject.userData.originalMaterial &&
        (parentObject.material instanceof THREE.MeshNormalMaterial || 
         parentObject.userData.normalMapMaterial === parentObject.material ||
         parentObject.userData.roughnessMapMaterial === parentObject.material ||
         parentObject.userData.metalnessMapMaterial === parentObject.material ||
         parentObject.userData.aoMapMaterial === parentObject.material ||
         parentObject.userData.emissiveMapMaterial === parentObject.material ||
         parentObject.userData.baseColorMaterial === parentObject.material)) {
      parentObject.material = parentObject.userData.originalMaterial;
    }
  }
};

export const resetMaterial = (material: THREE.Material) => {
  if (material.userData.originalProps && supportsWireframe(material)) {
    material.wireframe = material.userData.originalProps.wireframe;
  }
  // Add more reset logic if needed for other modes upon unmount/cleanup
};

export const resetAllMaterials = (scene: THREE.Object3D) => {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      // Remove any wireframe overlays
      const wireframeOverlay = child.children.find(c => c.name === 'wireframeOverlay');
      if (wireframeOverlay) {
        child.remove(wireframeOverlay);
        if (child.userData.wireframeMaterial) {
          child.userData.wireframeMaterial.dispose();
          child.userData.wireframeMaterial = null;
        }
      }
      
      // Reset wireframe flag
      child.userData.hasWireframeOverlay = false;
      
      // Clear any previous normal materials
      if (child.userData.normalMaterial) {
        child.userData.normalMaterial = null; // Don't dispose, it's managed by THREE
      }
      
      // Reset to original material if it exists
      if (child.userData.originalMaterial) {
        child.material = child.userData.originalMaterial;
        child.userData.originalMaterial = null;
      }
      
      // Reset other map materials
      if (child.userData.normalMapMaterial) child.userData.normalMapMaterial = null;
      if (child.userData.roughnessMapMaterial) child.userData.roughnessMapMaterial = null;
      if (child.userData.metalnessMapMaterial) child.userData.metalnessMapMaterial = null;
      if (child.userData.aoMapMaterial) child.userData.aoMapMaterial = null;
      if (child.userData.emissiveMapMaterial) child.userData.emissiveMapMaterial = null;
      if (child.userData.baseColorMaterial) child.userData.baseColorMaterial = null;

      // Reset original properties if they exist
      if (child.material && child.material.userData.originalMaterialProps) {
         if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.color.copy(child.material.userData.originalMaterialProps.color);
            child.material.map = child.material.userData.originalMaterialProps.map;
            child.material.normalMap = child.material.userData.originalMaterialProps.normalMap;
            child.material.roughnessMap = child.material.userData.originalMaterialProps.roughnessMap;
            child.material.metalnessMap = child.material.userData.originalMaterialProps.metalnessMap;
            child.material.emissiveMap = child.material.userData.originalMaterialProps.emissiveMap;
            child.material.aoMap = child.material.userData.originalMaterialProps.aoMap;
            child.material.emissive.copy(child.material.userData.originalMaterialProps.emissive);
            child.material.roughness = child.material.userData.originalMaterialProps.roughness;
            child.material.metalness = child.material.userData.originalMaterialProps.metalness;
            child.material.envMap = child.material.userData.originalMaterialProps.envMap;
            child.material.envMapIntensity = child.material.userData.originalMaterialProps.envMapIntensity;
            child.material.needsUpdate = true;
          } else if (child.material instanceof THREE.MeshBasicMaterial || 
                     child.material instanceof THREE.MeshLambertMaterial || 
                     child.material instanceof THREE.MeshPhongMaterial) {
            child.material.color.copy(child.material.userData.originalMaterialProps.color);
            child.material.map = child.material.userData.originalMaterialProps.map;
          }
          child.material.userData.originalMaterialProps = null; // Clear after restoring
      }
      if (child.material && child.material.userData.originalColor) {
        if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.color.copy(child.material.userData.originalColor);
        }
        child.material.userData.originalColor = null;
      }
      if (child.material && child.material.userData.originalProps) {
        child.material.userData.originalProps = null;
      }
    }
  });
}; 