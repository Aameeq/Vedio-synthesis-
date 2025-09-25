// Fix: Changed React import to a namespace import to resolve JSX intrinsic element errors.
import * as React from 'react';
import * as THREE from 'three';
import { XRButton } from 'three/examples/jsm/webxr/XRButton.js';
import DownloadButton from './DownloadButton';
import SaveWorldButton from './SaveWorldButton';
import AudioControl from './AudioControl';

interface VideoDisplayProps {
  videoUrl: string | null;
  stereoVideoUrls?: { left: string; right: string } | null;
  audioUrl: string | null;
  frameUrl: string | null;
  onVideoEnd: (lastFrameDataUrl: string) => void;
  isLoading: boolean;
  isReady: boolean;
  isStereo: boolean;
  onSave: () => void;
  onAddAmbiance: () => void;
  isGeneratingAudio: boolean;
  audioDescription: string | null;
}

const VideoDisplay: React.FC<VideoDisplayProps> = (props) => {
  const { videoUrl, stereoVideoUrls, audioUrl, frameUrl, onVideoEnd, isLoading, isReady, isStereo, onSave, onAddAmbiance, isGeneratingAudio, audioDescription } = props;
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const vrButtonContainerRef = React.useRef<HTMLDivElement>(null);

  const formatTime = (time: number) => {
    if (isNaN(time) || time === Infinity) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleVideoEndCallback = React.useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      onVideoEnd(canvas.toDataURL('image/jpeg'));
    }
  }, [onVideoEnd]);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.addEventListener('ended', handleVideoEndCallback);

    return () => {
      video.removeEventListener('ended', handleVideoEndCallback);
    };
  }, [videoUrl, stereoVideoUrls, handleVideoEndCallback]);
  
  // --- WebXR Logic ---
  React.useEffect(() => {
    if (!vrButtonContainerRef.current || (!videoUrl && !stereoVideoUrls)) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 2;

    const button = XRButton.createButton(renderer, { optionalFeatures: ['local-floor', 'bounded-floor'] });
    button.style.position = 'absolute';
    button.style.bottom = '120px';
    button.style.right = '16px';
    button.style.zIndex = '20';
    vrButtonContainerRef.current.appendChild(button);

    // Video setup
    const videoLeftEl = document.createElement('video');
    videoLeftEl.src = stereoVideoUrls ? stereoVideoUrls.left : videoUrl!;
    videoLeftEl.crossOrigin = 'anonymous';
    videoLeftEl.loop = false;
    videoLeftEl.playsInline = true;
    
    const videoTextureLeft = new THREE.VideoTexture(videoLeftEl);

    const screenWidth = 4;
    const screenHeight = screenWidth * (9 / 16);
    const screenGeometry = new THREE.PlaneGeometry(screenWidth, screenHeight);

    // Stereo setup
    const LEFT_LAYER = 1;
    const RIGHT_LAYER = 2;
    camera.layers.enable(LEFT_LAYER);

    const materialLeft = new THREE.MeshBasicMaterial({ map: videoTextureLeft });
    const screenLeft = new THREE.Mesh(screenGeometry, materialLeft);
    screenLeft.layers.set(LEFT_LAYER);
    screenLeft.position.set(-0.02, 0, 0); 
    scene.add(screenLeft);
    
    let videoRightEl: HTMLVideoElement | null = null;
    if (stereoVideoUrls) {
        camera.layers.enable(RIGHT_LAYER);

        videoRightEl = document.createElement('video');
        videoRightEl.src = stereoVideoUrls.right;
        videoRightEl.crossOrigin = 'anonymous';
        videoRightEl.loop = false;
        videoRightEl.playsInline = true;
        
        const videoTextureRight = new THREE.VideoTexture(videoRightEl);
        const materialRight = new THREE.MeshBasicMaterial({ map: videoTextureRight });
        const screenRight = new THREE.Mesh(screenGeometry, materialRight);
        screenRight.layers.set(RIGHT_LAYER);
        screenRight.position.set(0.02, 0, 0);
        scene.add(screenRight);
    }

    // VR Controls UI
    const UI_WIDTH = 1024;
    const UI_HEIGHT = 128;
    const UI_ASPECT = UI_WIDTH / UI_HEIGHT;
    const UI_PLANE_WIDTH = screenWidth / 1.8;
    const UI_PLANE_HEIGHT = UI_PLANE_WIDTH / UI_ASPECT;

    const uiGroup = new THREE.Group();
    uiGroup.position.set(0, -screenHeight / 2 - 0.25, -0.5);
    scene.add(uiGroup);

    const uiCanvas = document.createElement('canvas');
    uiCanvas.width = UI_WIDTH;
    uiCanvas.height = UI_HEIGHT;
    const uiContext = uiCanvas.getContext('2d')!;
    const uiTexture = new THREE.CanvasTexture(uiCanvas);
    const uiMaterial = new THREE.MeshBasicMaterial({ map: uiTexture, transparent: true });
    const uiGeometry = new THREE.PlaneGeometry(UI_PLANE_WIDTH, UI_PLANE_HEIGHT);
    const uiPlane = new THREE.Mesh(uiGeometry, uiMaterial);
    uiGroup.add(uiPlane);

    const uiElements = {
        play: { x: 40, y: 32, w: 64, h: 64 },
        seek: { x: 140, y: 56, w: UI_WIDTH - 320, h: 16 }
    };

    let isSeeking = false;
    let intersectedElementName: string | null = null;
    
    function drawUI() {
        if (!uiContext) return;
        const video = videoLeftEl;
        
        uiContext.clearRect(0, 0, UI_WIDTH, UI_HEIGHT);
        uiContext.fillStyle = 'rgba(15, 23, 42, 0.6)';
        uiContext.roundRect(0, 0, UI_WIDTH, UI_HEIGHT, 20);
        uiContext.fill();

        // Draw Play/Pause Button
        uiContext.fillStyle = intersectedElementName === 'play' ? '#a5b4fc' : '#e2e8f0';
        uiContext.beginPath();
        if (video.paused) {
            uiContext.moveTo(uiElements.play.x + 20, uiElements.play.y + 12);
            uiContext.lineTo(uiElements.play.x + 20, uiElements.play.y + uiElements.play.h - 12);
            uiContext.lineTo(uiElements.play.x + uiElements.play.w - 15, uiElements.play.y + uiElements.play.h / 2);
        } else {
            uiContext.fillRect(uiElements.play.x + 15, uiElements.play.y + 12, 15, uiElements.play.h - 24);
            uiContext.fillRect(uiElements.play.x + uiElements.play.w - 30, uiElements.play.y + 12, 15, uiElements.play.h - 24);
        }
        uiContext.closePath();
        uiContext.fill();

        // Draw Seek Bar
        uiContext.fillStyle = '#475569';
        uiContext.roundRect(uiElements.seek.x, uiElements.seek.y, uiElements.seek.w, uiElements.seek.h, 8);
        uiContext.fill();
        
        const progress = (video.currentTime / video.duration) || 0;
        if (progress > 0) {
            uiContext.fillStyle = intersectedElementName === 'seek' ? '#818cf8' : '#4f46e5';
            uiContext.roundRect(uiElements.seek.x, uiElements.seek.y, uiElements.seek.w * progress, uiElements.seek.h, 8);
            uiContext.fill();
        }
        
        uiContext.fillStyle = '#e2e8f0';
        uiContext.beginPath();
        uiContext.arc(uiElements.seek.x + uiElements.seek.w * progress, uiElements.seek.y + uiElements.seek.h / 2, 12, 0, Math.PI * 2);
        uiContext.fill();

        // Draw Time Display
        uiContext.fillStyle = '#e2e8f0';
        uiContext.font = 'bold 36px Inter';
        uiContext.textAlign = 'right';
        const timeText = `${formatTime(video.currentTime)} / ${formatTime(video.duration || 0)}`;
        uiContext.fillText(timeText, UI_WIDTH - 40, 80);
        
        uiTexture.needsUpdate = true;
    }
    
    const raycaster = new THREE.Raycaster();
    const tempMatrix = new THREE.Matrix4();
    const controllers = [renderer.xr.getController(0), renderer.xr.getController(1)];
    
    controllers.forEach(controller => {
        const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -5)]));
        line.scale.z = 5;
        controller.add(line);
        scene.add(controller);

        controller.addEventListener('selectstart', () => {
            if (intersectedElementName) {
                if (intersectedElementName === 'play') {
                    if (videoLeftEl.paused) {
                        videoLeftEl.play();
                        videoRightEl?.play();
                    } else {
                        videoLeftEl.pause();
                        videoRightEl?.pause();
                    }
                }
                if (intersectedElementName === 'seek') isSeeking = true;
            }
        });
        controller.addEventListener('selectend', () => { isSeeking = false; });
    });

    renderer.setAnimationLoop(() => {
        const session = renderer.xr.getSession();
        if(!session) return;
        
        let frameIntersection: string | null = null;
        
        controllers.forEach(controller => {
            if (frameIntersection) return; 
            tempMatrix.identity().extractRotation(controller.matrixWorld);
            raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
            raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
            
            const intersects = raycaster.intersectObject(uiPlane);
            
            if (intersects.length > 0) {
                const localPoint = new THREE.Vector3();
                uiPlane.worldToLocal(localPoint.copy(intersects[0].point));
                
                const canvasX = (localPoint.x / UI_PLANE_WIDTH + 0.5) * UI_WIDTH;
                const canvasY = (-localPoint.y / UI_PLANE_HEIGHT + 0.5) * UI_HEIGHT;

                const play = uiElements.play;
                if (canvasX >= play.x && canvasX <= play.x + play.w && canvasY >= play.y && canvasY <= play.y + play.h) {
                    frameIntersection = 'play';
                }
                
                const seek = uiElements.seek;
                // Add vertical padding to the seek bar's hitbox for easier interaction
                if (canvasX >= seek.x && canvasX <= seek.x + seek.w && canvasY >= seek.y - 10 && canvasY <= seek.y + seek.h + 10) {
                    frameIntersection = 'seek';

                     if (isSeeking) {
                         const seekProgress = (canvasX - seek.x) / seek.w;
                         const newTime = videoLeftEl.duration * Math.max(0, Math.min(1, seekProgress));
                         // Apply time update to both videos for perfect sync
                         if (isFinite(newTime)) {
                            videoLeftEl.currentTime = newTime;
                            if (videoRightEl) videoRightEl.currentTime = newTime;
                         }
                     }
                }
                 ((controller.children[0] as THREE.Line).material as THREE.LineBasicMaterial).color.set(0x818cf8);
            } else {
                 ((controller.children[0] as THREE.Line).material as THREE.LineBasicMaterial).color.set(0xffffff);
            }
        });
        intersectedElementName = frameIntersection;

        // Fallback sync in case of drift
        if (videoRightEl && Math.abs(videoRightEl.currentTime - videoLeftEl.currentTime) > 0.1) {
            videoRightEl.currentTime = videoLeftEl.currentTime;
        }

        drawUI();
        renderer.render(scene, camera);
    });

    renderer.xr.addEventListener('sessionstart', () => {
        videoLeftEl.play();
        videoRightEl?.play();
    });
    
    renderer.xr.addEventListener('sessionend', () => {
        videoLeftEl.pause();
        videoRightEl?.pause();
        handleVideoEndCallback();
    });

    return () => {
      renderer.setAnimationLoop(null);
      if (vrButtonContainerRef.current && button.parentNode === vrButtonContainerRef.current) {
        vrButtonContainerRef.current.removeChild(button);
      }
      renderer.dispose();
    };
  }, [videoUrl, stereoVideoUrls, handleVideoEndCallback]);
  
  const showVideo = !!(videoUrl || stereoVideoUrls);

  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <div className="w-full h-full relative">
        <div className="w-full h-full pb-24">
            {showVideo ? (
              <video
                ref={videoRef}
                src={videoUrl ?? stereoVideoUrls?.left}
                className="w-full h-full object-contain"
                autoPlay
                playsInline
                controls={false}
              />
            ) : frameUrl ? (
              <img src={frameUrl} alt="Current scene" className="w-full h-full object-contain" />
            ) : null}
        </div>
        
        {audioUrl && <audio ref={audioRef} src={audioUrl} autoPlay loop />}
        
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
            <SaveWorldButton onClick={onSave} isDisabled={!isReady} />
            <AudioControl onGenerateAudio={onAddAmbiance} isGenerating={isGeneratingAudio} isDisabled={!isReady} audioDescription={audioDescription} />
        </div>
        <div className="absolute bottom-24 left-4 z-20">
            <DownloadButton videoUrl={videoUrl ?? stereoVideoUrls?.left} isDisabled={!showVideo} isStereo={isStereo} />
        </div>
        <div ref={vrButtonContainerRef} />
      </div>
    </div>
  );
};

export default VideoDisplay;
