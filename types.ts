
export enum CameraAction {
  PAN_LEFT = "PAN LEFT",
  PAN_RIGHT = "PAN RIGHT",
  TILT_UP = "TILT UP",
  TILT_DOWN = "TILT DOWN",
  ZOOM_IN = "ZOOM IN",
  ZOOM_OUT = "ZOOM OUT"
}

export enum AppMode {
  CAMERA = 'CAMERA',
  EDIT = 'EDIT'
}

export interface SavedWorld {
  id: string;
  name: string;
  imageData: string;
  createdAt: string;
}

export type AnchorPoint = 'head' | 'nose' | 'forehead' | 'chin';

export interface Transform {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: number;
}
