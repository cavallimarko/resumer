'use client'

import { useEffect, useState, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Center } from '@react-three/drei';
import * as THREE from 'three'; // Keep THREE import if needed elsewhere, otherwise remove
import { client } from '@/sanity/lib/client';

import { ModelViewerProps, ViewMode, LayoutMode } from './types';
import { Model } from './Model';
import { SplitScreenView } from './SplitScreenView';
import { ViewModeControls } from './ViewModeControls';

export function ModelViewer({ modelFileId, height = 400 }: ModelViewerProps) {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [leftViewMode, setLeftViewMode] = useState<ViewMode>('default');
  const [rightViewMode, setRightViewMode] = useState<ViewMode>('default');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('single');
  const [triangleCount, setTriangleCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    async function fetchModelUrl() {
      setIsLoading(true);
      setError(null);
      
      try {
        const id = typeof modelFileId === 'object' ? 
          (modelFileId._ref || modelFileId.toString()) : 
          modelFileId.toString();
        
        const modelDocument = await client.fetch(
          `*[_type == "model3d" && _id == $id][0]{
            "fileAsset": modelFile.asset->
          }`, 
          { id }
        );
        
        if (!modelDocument || !modelDocument.fileAsset || !modelDocument.fileAsset.url) {
          const fileAsset = await client.fetch(
            `*[_type == "sanity.fileAsset" && _id == $id][0]`, 
            { id }
          );
          
          if (!fileAsset || !fileAsset.url) {
            throw new Error('Model file not found');
          }
          setModelUrl(fileAsset.url);
        } else {
          setModelUrl(modelDocument.fileAsset.url);
        }
      } catch (err) {
        console.error('Error fetching model:', err);
        setError('Failed to load 3D model');
      } finally {
        setIsLoading(false);
      }
    }
    
    if (modelFileId) {
      fetchModelUrl();
    } else {
        setIsLoading(false);
        setError('No model file ID provided.');
    }
  }, [modelFileId]);
  
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
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
  
  const toggleLayoutMode = () => {
    setLayoutMode(prevMode => prevMode === 'single' ? 'split' : 'single');
  };
  
  if (error) {
    return (
      <div className="bg-red-50 text-red-500 p-4 rounded-lg" style={{ height: `${height}px` }}>
        Error: {error}
      </div>
    );
  }
  
  if (isLoading || !modelUrl) {
    return (
      <div 
        className="bg-gray-100 rounded-lg flex items-center justify-center"
        style={{ height: `${height}px` }}
      >
        <div className="animate-pulse">Loading 3D model...</div>
      </div>
    );
  }
  
  return (
    <div 
      ref={containerRef}
      className={`w-full rounded-lg overflow-hidden relative ${
        isFullScreen ? 'bg-black' : 'bg-black' 
      }`} 
      style={{ height: isFullScreen ? '100%' : `${height}px` }}
    >
      {layoutMode === 'single' ? (
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <Suspense fallback={null}>
            <Center>
              <Model url={modelUrl!} viewMode={leftViewMode} setTriangleCount={setTriangleCount} isPrimary={true} /> 
            </Center>
            <Environment preset="city" />
          </Suspense>
          <OrbitControls makeDefault />
        </Canvas>
      ) : (
        <SplitScreenView 
          url={modelUrl!} 
          leftViewMode={leftViewMode} 
          rightViewMode={rightViewMode} 
          setTriangleCount={setTriangleCount} 
        />
      )}
      
      {/* Control Panel (Left) */}
      <div className="absolute top-4 left-4 bg-gray-800 bg-opacity-90 p-2 rounded shadow-md max-h-[calc(100%-5rem)] overflow-y-auto w-auto"> 
        <div className="flex flex-col space-y-2">
          <ViewModeControls 
            title={layoutMode === 'split' ? 'Left View' : ''} 
            currentMode={leftViewMode} 
            setMode={setLeftViewMode} 
            columns={1} 
          />
        </div>
      </div>
      
      {/* Control Panel (Right) - Only visible in split mode */}
      {layoutMode === 'split' && (
        <div className="absolute top-4 right-4 bg-gray-800 bg-opacity-90 p-2 rounded shadow-md max-h-[calc(100%-5rem)] overflow-y-auto w-auto"> 
          <div className="flex flex-col space-y-2">
            <ViewModeControls 
              title="Right View" 
              currentMode={rightViewMode} 
              setMode={setRightViewMode} 
              columns={1} 
            />
          </div>
        </div>
      )}
      
      {/* Triangle Count Display */}
      <div className="absolute bottom-4 left-4 bg-gray-800 bg-opacity-90 px-2 py-1 rounded text-xs font-mono text-white shadow">
        {triangleCount.toLocaleString()} triangles
      </div>
      
      {/* Bottom Right Controls */}
      <div className="absolute bottom-4 right-4 flex space-x-2">
        {/* Help Button */}
        <div className="relative group">
          <button
            className="bg-gray-800 bg-opacity-90 hover:bg-opacity-100 text-white p-2 rounded-full shadow transition-all transform hover:scale-110"
            aria-label="Help"
            title="Help"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </button>
          
          {/* Help Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 py-2 px-3 bg-gray-800 bg-opacity-95 rounded-lg shadow-lg text-white text-xs transform scale-0 group-hover:scale-100 transition-transform origin-bottom-right duration-150 z-10 w-auto whitespace-nowrap">
           
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="6" y="3" width="12" height="18" rx="6" stroke="currentColor" />
                  <line x1="12" y1="7" x2="12" y2="11" stroke="currentColor" />
                </svg>
                <span>Zoom</span>
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="6" y="3" width="12" height="18" rx="6" stroke="currentColor" />
                  <rect x="6" y="3" width="6" height="9" rx="3" fill="currentColor" fillOpacity="0.2" />
                </svg>
                <span>Rotate</span>
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="6" y="3" width="12" height="18" rx="6" stroke="currentColor" />
                  <rect x="12" y="3" width="6" height="9" rx="3" fill="currentColor" fillOpacity="0.2" />
                </svg>
                <span>Pan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Layout Toggle Button */}
        <button
          onClick={toggleLayoutMode}
          className="bg-gray-800 bg-opacity-90 hover:bg-opacity-100 text-white p-2 rounded-full shadow transition-all transform hover:scale-110"
          aria-label={layoutMode === 'single' ? "Switch to split view" : "Switch to single view"}
          title={layoutMode === 'single' ? "Switch to split view" : "Switch to single view"}
        >
          {layoutMode === 'single' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="12" y1="3" x2="12" y2="21"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            </svg>
          )}
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullScreen}
          className="bg-gray-800 bg-opacity-90 hover:bg-opacity-100 text-white p-2 rounded-full shadow transition-all transform hover:scale-110"
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
    </div>
  );
}

// Re-export the main component for easier import elsewhere
export default ModelViewer; 