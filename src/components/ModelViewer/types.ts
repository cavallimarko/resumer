// Shared type definitions for the ModelViewer component

export type ViewMode = 
  | 'default' 
  | 'wireframe' 
  | 'normals' 
  | 'normalMap' 
  | 'roughnessMap' 
  | 'metalnessMap' 
  | 'aoMap' 
  | 'emissiveMap' 
  | 'baseColor';

export type LayoutMode = 'single' | 'split';

export type ModelViewerProps = {
  modelFileId: string | {_ref?: string; [key: string]: any};
  height?: number;
};

// Add labels for view modes
export const viewModeLabels: Record<ViewMode, string> = {
  default: 'Default',
  wireframe: 'Wireframe',
  normals: 'Normals',
  baseColor: 'Base Color',
  normalMap: 'Normal Map',
  roughnessMap: 'Roughness',
  metalnessMap: 'Metalness',
  aoMap: 'AO',
  emissiveMap: 'Emissive'
};

// List of available view modes
export const availableViewModes: ViewMode[] = [
  'default', 
  'wireframe', 
  'normals', 
  'baseColor', 
  'normalMap', 
  'roughnessMap', 
  'metalnessMap', 
  'aoMap', 
  'emissiveMap'
]; 