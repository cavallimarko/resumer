import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Center } from '@react-three/drei';
import { Model } from './Model';
import { ViewMode } from './types';

type SplitScreenViewProps = {
  url: string;
  leftViewMode: ViewMode;
  rightViewMode: ViewMode;
  setTriangleCount: (count: number) => void;
};

export function SplitScreenView({ 
  url, 
  leftViewMode, 
  rightViewMode, 
  setTriangleCount 
}: SplitScreenViewProps) {
  return (
    <>
      {/* Left View (Primary) */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '100%', borderRight: '1px solid #ccc' }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}> {/* Consistent initial camera */}
          <Suspense fallback={null}>
            <Center>
              <Model url={url} viewMode={leftViewMode} setTriangleCount={setTriangleCount} isPrimary={true} /> 
            </Center>
            <Environment preset="city" />
          </Suspense>
          <OrbitControls makeDefault />
        </Canvas>
      </div>
      {/* Right View (Not Primary) */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%' }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}> {/* Consistent initial camera */}
          <Suspense fallback={null}>
            <Center>
              <Model url={url} viewMode={rightViewMode} setTriangleCount={setTriangleCount} isPrimary={false} /> 
            </Center>
            <Environment preset="city" />
          </Suspense>
          <OrbitControls makeDefault />
        </Canvas>
      </div>
    </>
  );
} 