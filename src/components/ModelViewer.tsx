'use client'

import { useEffect, useState, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, Center } from '@react-three/drei'
import { Suspense } from 'react'
import * as THREE from 'three'
import { client } from '@/sanity/lib/client'

type ModelViewerProps = {
  modelFileId: string | {_ref?: string; [key: string]: any}
  height?: number
}

type ViewMode = 'default' | 'wireframe' | 'normals' | 'normalMap' | 'roughnessMap' | 'metalnessMap' | 'aoMap' | 'emissiveMap'

function Model({ url, viewMode, setTriangleCount }: { url: string; viewMode: ViewMode; setTriangleCount: (count: number) => void }) {
  const { scene } = useGLTF(url)
  const { camera } = useThree()
  
  useEffect(() => {
    // Adjust camera position based on model bounding box
    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    
    const maxDim = Math.max(size.x, size.y, size.z)
    // Check if camera is PerspectiveCamera
    const fov = camera instanceof THREE.PerspectiveCamera ? camera.fov * (Math.PI / 180) : 45 * (Math.PI / 180)
    let cameraDistance = maxDim / (2 * Math.tan(fov / 2))
    
    // Add a bit of padding
    cameraDistance *= 1.5
    
    camera.position.set(center.x, center.y, center.z + cameraDistance)
    camera.lookAt(center.x, center.y, center.z)
  }, [scene, camera])
  
  // Calculate and set triangle count
  useEffect(() => {
    let totalTriangles = 0;
    
    scene.traverse((object) => {
      // Skip wireframe overlays to avoid double-counting
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
  }, [scene, setTriangleCount]);
  
  // Apply the selected view mode to materials
  useEffect(() => {
    // Reset all materials first
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
          child.userData.normalMaterial = null;
        }
        
        // Reset to original material if it exists
        if (child.userData.originalMaterial) {
          child.material = child.userData.originalMaterial;
          child.userData.originalMaterial = null;
        }
      }
    });
    
    // Now apply the current view mode
    scene.traverse((child) => {
      // Skip wireframe overlay meshes to prevent recursion
      if (child instanceof THREE.Mesh && child.material && child.name !== 'wireframeOverlay') {
        // Store reference to the parent object for each material
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => {
            mat.userData.parentObject = child;
            applyViewMode(mat, viewMode);
          });
        } else {
          child.material.userData.parentObject = child;
          applyViewMode(child.material, viewMode);
        }
      }
    });
    
    return () => {
      // Reset materials when component unmounts
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => resetMaterial(mat))
          } else {
            resetMaterial(child.material)
          }
        }
      })
    }
  }, [scene, viewMode])
  
  const applyViewMode = (material: THREE.Material, mode: ViewMode) => {
    // Create type guard for materials that support wireframe
    const supportsWireframe = (mat: THREE.Material): mat is THREE.MeshBasicMaterial | 
      THREE.MeshStandardMaterial | THREE.MeshPhongMaterial | 
      THREE.MeshLambertMaterial | THREE.MeshNormalMaterial => {
      return 'wireframe' in mat;
    };

    // Store original material properties if not already stored
    if (!material.userData.originalProps) {
      material.userData.originalProps = {
        wireframe: supportsWireframe(material) ? material.wireframe : false,
        // Don't clone the material here - it creates circular references
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
    } else {
      // Restore the original material when not in special modes
      const parentObject = material.userData.parentObject;
      if (parentObject && parentObject.userData.originalMaterial &&
          (parentObject.material instanceof THREE.MeshNormalMaterial || 
           parentObject.userData.normalMapMaterial === parentObject.material ||
           parentObject.userData.roughnessMapMaterial === parentObject.material ||
           parentObject.userData.metalnessMapMaterial === parentObject.material ||
           parentObject.userData.aoMapMaterial === parentObject.material ||
           parentObject.userData.emissiveMapMaterial === parentObject.material)) {
        parentObject.material = parentObject.userData.originalMaterial;
      }
    }
  }
  
  const resetMaterial = (material: THREE.Material) => {
    const supportsWireframe = (mat: THREE.Material): mat is THREE.MeshBasicMaterial | 
      THREE.MeshStandardMaterial | THREE.MeshPhongMaterial | 
      THREE.MeshLambertMaterial | THREE.MeshNormalMaterial => {
      return 'wireframe' in mat;
    };
    
    if (material.userData.originalProps && supportsWireframe(material)) {
      material.wireframe = material.userData.originalProps.wireframe
    }
  }
  
  return <primitive object={scene} />
}

export function ModelViewer({ modelFileId, height = 400 }: ModelViewerProps) {
  const [modelUrl, setModelUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('default')
  const [triangleCount, setTriangleCount] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    async function fetchModelUrl() {
      setIsLoading(true)
      setError(null)
      
      try {
        // Ensure we're working with a string ID
        const id = typeof modelFileId === 'object' ? 
          (modelFileId._ref || modelFileId.toString()) : 
          modelFileId.toString();
        
        // First, fetch the 3D model document by reference ID
        const modelDocument = await client.fetch(
          `*[_type == "model3d" && _id == $id][0]{
            "fileAsset": modelFile.asset->
          }`, 
          { id }
        )
        
        // If the model or file asset doesn't exist, throw an error
        if (!modelDocument || !modelDocument.fileAsset || !modelDocument.fileAsset.url) {
          // Try direct file asset approach as fallback
          const fileAsset = await client.fetch(
            `*[_type == "sanity.fileAsset" && _id == $id][0]`, 
            { id }
          )
          
          if (!fileAsset || !fileAsset.url) {
            throw new Error('Model file not found')
          }
          
          setModelUrl(fileAsset.url)
        } else {
          // Set the model URL from the file asset
          setModelUrl(modelDocument.fileAsset.url)
        }
      } catch (err) {
        console.error('Error fetching model:', err)
        setError('Failed to load 3D model')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (modelFileId) {
      fetchModelUrl()
    }
  }, [modelFileId])
  
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      // Exit fullscreen
      document.exitFullscreen();
    }
  };
  
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);
  
  if (error) {
    return (
      <div className="bg-red-50 text-red-500 p-4 rounded-lg">
        Error: {error}
      </div>
    )
  }
  
  if (isLoading || !modelUrl) {
    return (
      <div 
        className="bg-gray-100 rounded-lg flex items-center justify-center"
        style={{ height: `${height}px` }}
      >
        <div className="animate-pulse">Loading 3D model...</div>
      </div>
    )
  }
  
  return (
    <div 
      ref={containerRef}
      className="w-full rounded-lg overflow-hidden relative" 
      style={{ height: `${height}px` }}
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <Suspense fallback={null}>
          <Center>
            <Model url={modelUrl} viewMode={viewMode} setTriangleCount={setTriangleCount} />
          </Center>
          <Environment preset="city" />
        </Suspense>
        <OrbitControls />
      </Canvas>
      
      {/* Control Panel */}
      <div className="absolute top-4 left-4 bg-white bg-opacity-70 p-2 rounded shadow-md max-h-[80%] overflow-y-auto">
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => setViewMode('default')}
            className={`px-2 py-1 text-sm rounded ${viewMode === 'default' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Default
          </button>
          <button
            onClick={() => setViewMode('wireframe')}
            className={`px-2 py-1 text-sm rounded ${viewMode === 'wireframe' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Wireframe
          </button>
          <button
            onClick={() => setViewMode('normals')}
            className={`px-2 py-1 text-sm rounded ${viewMode === 'normals' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Normals
          </button>
          <button
            onClick={() => setViewMode('normalMap')}
            className={`px-2 py-1 text-sm rounded ${viewMode === 'normalMap' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Normal Map
          </button>
          <button
            onClick={() => setViewMode('roughnessMap')}
            className={`px-2 py-1 text-sm rounded ${viewMode === 'roughnessMap' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Roughness Map
          </button>
          <button
            onClick={() => setViewMode('metalnessMap')}
            className={`px-2 py-1 text-sm rounded ${viewMode === 'metalnessMap' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Metalness Map
          </button>
          <button
            onClick={() => setViewMode('aoMap')}
            className={`px-2 py-1 text-sm rounded ${viewMode === 'aoMap' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            AO Map
          </button>
          <button
            onClick={() => setViewMode('emissiveMap')}
            className={`px-2 py-1 text-sm rounded ${viewMode === 'emissiveMap' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Emissive Map
          </button>
        </div>
      </div>
      
      {/* Triangle Count Display */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-70 px-2 py-1 rounded text-xs font-mono">
        {triangleCount.toLocaleString()} triangles
      </div>
      
      <button
        onClick={toggleFullScreen}
        className="absolute bottom-4 right-4 bg-white bg-opacity-70 hover:bg-opacity-100 text-gray-800 p-2 rounded-full shadow transition-all transform hover:scale-125"
        aria-label={isFullScreen ? "Exit full screen" : "Enter full screen"}
        title={isFullScreen ? "Exit full screen" : "Enter full screen"}
      >
        {isFullScreen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
          </svg>
        )}
      </button>
    </div>
  )
} 