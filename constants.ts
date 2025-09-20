import { CameraAction, Transform } from './types';

export const VEO_PROMPT_TEMPLATE = (action: string, animationPrompt?: string, isStyleLocked?: boolean) => {
  const animationLine = animationPrompt ? `\nScene Animation: ${animationPrompt}.` : '';
  const styleLockLine = isStyleLocked ? `\nStyle Lock: Adhere strictly to the artistic style of the starting frame.` : '';
  return `Continuation of the uploaded image, professional cinematic color grading, hyper-realistic, 8k, Unreal Engine 5 look.
Camera action: ${action} 3 meters in 2 seconds.${animationLine}${styleLockLine}
Style: Zero cuts, continuous shot, 60 fps, 8 seconds duration, 720p resolution, 16:9 aspect ratio.
Seed: 12345`;
};

export const KEY_MAP: { [key: string]: CameraAction } = {
  'A': CameraAction.PAN_LEFT,
  'D': CameraAction.PAN_RIGHT,
  'W': CameraAction.TILT_UP,
  'S': CameraAction.TILT_DOWN,
  'Q': CameraAction.ZOOM_OUT,
  'E': CameraAction.ZOOM_IN,
};

export const LOADING_MESSAGES = [
  "Initializing video synthesis...",
  "Contacting generative model...",
  "Generating initial frames...",
  "Analyzing motion vectors...",
  "Rendering video sequence...",
  "Stitching frames together...",
  "Applying cinematic color grade...",
  "Finalizing video stream...",
  "Almost there, preparing for playback...",
];

export const PRESET_MOVEMENTS: { [key: string]: CameraAction[] } = {
  'Orbit Left': [CameraAction.PAN_LEFT, CameraAction.PAN_LEFT, CameraAction.TILT_DOWN],
  'Crane Up': [CameraAction.TILT_UP, CameraAction.ZOOM_OUT],
  'Dolly Forward': [CameraAction.ZOOM_IN, CameraAction.ZOOM_IN],
  'Establishing Shot': [CameraAction.PAN_RIGHT, CameraAction.TILT_DOWN, CameraAction.ZOOM_OUT],
  'Push In & Pan Right': [CameraAction.ZOOM_IN, CameraAction.PAN_RIGHT],
};

export const DEFAULT_TRANSFORM: Transform = {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: 1,
};