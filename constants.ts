
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
