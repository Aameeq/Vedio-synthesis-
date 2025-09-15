import { CameraAction } from './types';

export const VEO_PROMPT_TEMPLATE = (action: string) => 
  `Continuation of the uploaded image, professional cinematic color grading, hyper-realistic, 8k, Unreal Engine 5 look.
Camera action: ${action} 3 meters in 2 seconds.
Style: Zero cuts, continuous shot, 60 fps, 8 seconds duration, 720p resolution, 16:9 aspect ratio.
Seed: 12345`;

export const KEY_MAP: { [key: string]: CameraAction } = {
  'A': CameraAction.PAN_LEFT,
  'D': CameraAction.PAN_RIGHT,
  'W': CameraAction.TILT_UP,
  'S': CameraAction.TILT_DOWN,
  'Q': CameraAction.ZOOM_OUT,
  'E': CameraAction.ZOOM_IN,
};

export const LOADING_MESSAGES = [
  "Waking up the AI artists...",
  "Brewing a cup of digital coffee...",
  "Stretching the digital canvas...",
  "Teaching the AI about cinematography...",
  "Directing the virtual camera...",
  "Rendering the first take...",
  "The AI is checking its work...",
  "Applying the final polish...",
  "Rolling the credits...",
  "Your video is premiering now!",
];

export const PRESET_MOVEMENTS: { [key: string]: CameraAction[] } = {
  'Orbit Left': [CameraAction.PAN_LEFT, CameraAction.PAN_LEFT, CameraAction.TILT_DOWN],
  'Crane Up': [CameraAction.TILT_UP, CameraAction.ZOOM_OUT],
  'Dolly Forward': [CameraAction.ZOOM_IN, CameraAction.ZOOM_IN],
  'Establishing Shot': [CameraAction.PAN_RIGHT, CameraAction.TILT_DOWN, CameraAction.ZOOM_OUT],
  'Push In & Pan Right': [CameraAction.ZOOM_IN, CameraAction.PAN_RIGHT],
};
