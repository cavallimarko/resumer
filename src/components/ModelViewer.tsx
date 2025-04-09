'use client'

import { useEffect, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, Center } from '@react-three/drei'
import { Suspense } from 'react'
import * as THREE from 'three'
import { client } from '@/sanity/lib/client'

type ModelViewerProps = {
  modelFileId: string
  height?: number
}

function Model({ url }: { url: string }) {
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
  
  return <primitive object={scene} />
}

export function ModelViewer({ modelFileId, height = 400 }: ModelViewerProps) {
  const [modelUrl, setModelUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function fetchModelUrl() {
      setIsLoading(true)
      setError(null)
      
      try {
        // First, fetch the 3D model document by reference ID
        const modelDocument = await client.fetch(
          `*[_type == "model3d" && _id == $id][0]{
            "fileAsset": modelFile.asset->
          }`, 
          { id: modelFileId }
        )
        
        // If the model or file asset doesn't exist, throw an error
        if (!modelDocument || !modelDocument.fileAsset || !modelDocument.fileAsset.url) {
          // Try direct file asset approach as fallback
          const fileAsset = await client.fetch(
            `*[_type == "sanity.fileAsset" && _id == $id][0]`, 
            { id: modelFileId }
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
    <div className="w-full rounded-lg overflow-hidden" style={{ height: `${height}px` }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <Suspense fallback={null}>
          <Center>
            <Model url={modelUrl} />
          </Center>
          <Environment preset="city" />
        </Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  )
} 