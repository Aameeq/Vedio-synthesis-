import React, { useRef, useEffect, useCallback } from 'react';
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
  // Fix: Add missing audioDescription prop to the interface.
  audioDescription: string | null;
}

const VideoDisplay: React.FC<VideoDisplayProps> = (props) => {
  // Fix: Destructure the new audioDescription prop.
  const { videoUrl, stereoVideoUrls, audioUrl, frameUrl, onVideoEnd, isLoading, isReady, isStereo, onSave, onAddAmbiance, isGeneratingAudio, audioDescription } = props;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const vrButtonContainerRef = useRef<HTMLDivElement>(null);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleVideoEndCallback = useCallback(() => {
    const video = videoUrl ? videoRef.current : null;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      onVideoEnd(canvas.toDataURL('image/jpeg'));
    }
  }, [videoUrl, onVideoEnd]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.addEventListener('ended', handleVideoEndCallback);

    return () => {
      video.removeEventListener('ended', handleVideoEndCallback);
    };
  }, [videoUrl, handleVideoEndCallback]);
  
  // --- WebXR Logic ---
  useEffect(() => {
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
    button.style.zIndex = '10';
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
    screenLeft.position.set(-0.02, 0, 0); // Slight offset for left eye
    scene.add(screenLeft);
    
    let videoRightEl: HTMLVideoElement, screenRight: THREE.Mesh;
    if (stereoVideoUrls) {
        camera.layers.enable(RIGHT_LAYER);

        videoRightEl = document.createElement('video');
        videoRightEl.src = stereoVideoUrls.right;
        videoRightEl.crossOrigin = 'anonymous';
        videoRightEl.loop = false;
        videoRightEl.playsInline = true;
        
        const videoTextureRight = new THREE.VideoTexture(videoRightEl);
        const materialRight = new THREE.MeshBasicMaterial({ map: videoTextureRight });
        screenRight = new THREE.Mesh(screenGeometry, materialRight);
        screenRight.layers.set(RIGHT_LAYER);
        screenRight.position.set(0.02, 0, 0); // Slight offset for right eye
        scene.add(screenRight);
    }

    // VR Controls UI
    const uiCanvas = document.createElement('canvas');
    uiCanvas.width = 1024;
    uiCanvas.height = 128;
    const uiContext = uiCanvas.getContext('2d')!;
    const uiTexture = new THREE.CanvasTexture(uiCanvas);
    const uiMaterial = new THREE.MeshBasicMaterial({ map: uiTexture, transparent: true });
    const uiGeometry = new THREE.PlaneGeometry(screenWidth / 2, (screenWidth / 2) * (128 / 1024));
    const uiPlane = new THREE.Mesh(uiGeometry, uiMaterial);
    uiPlane.position.set(0, -screenHeight / 2 - 0.2, -0.5);
    scene.add(uiPlane);
    
    let isSeeking = false;
    let intersectedObject: THREE.Object3D | null = null;
    const interactiveObjects = [uiPlane];

    function drawUI() {
        if (!uiContext) return;
        const video = videoLeftEl;
        
        uiContext.clearRect(0, 0, uiCanvas.width, uiCanvas.height);
        uiContext.fillStyle = 'rgba(0, 0, 0, 0.4)';
        uiContext.fillRect(0, 0, uiCanvas.width, uiCanvas.height);

        uiContext.fillStyle = intersectedObject?.name === 'play' ? '#818cf8' : '#e2e8f0';
        uiContext.beginPath();
        if (video.paused) {
            uiContext.moveTo(40, 32); uiContext.lineTo(40, 96); uiContext.lineTo(88, 64);
        } else {
            uiContext.fillRect(35, 32, 20, 64); uiContext.fillRect(65, 32, 20, 64);
        }
        uiContext.closePath();
        uiContext.fill();

        const seekBarX = 140;
        const seekBarY = 60;
        const seekBarWidth = uiCanvas.width - 180 - 140;
        uiContext.fillStyle = '#475569';
        uiContext.fillRect(seekBarX, seekBarY, seekBarWidth, 8);

        const progress = (video.currentTime / video.duration) || 0;
        uiContext.fillStyle = intersectedObject?.name === 'seek' ? '#a5b4fc' : '#4f46e5';
        uiContext.fillRect(seekBarX, seekBarY, seekBarWidth * progress, 8);

        uiContext.fillStyle = '#e2e8f0';
        uiContext.font = '32px Inter';
        const timeText = `${formatTime(video.currentTime)} / ${formatTime(video.duration || 0)}`;
        uiContext.fillText(timeText, uiCanvas.width - 180, 72);
        
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
            if (intersectedObject) {
                if(intersectedObject.name === 'play') videoLeftEl.paused ? videoLeftEl.play() : videoLeftEl.pause();
                if(intersectedObject.name === 'seek') isSeeking = true;
            }
        });
        controller.addEventListener('selectend', () => { isSeeking = false; });
    });


    renderer.setAnimationLoop(() => {
        const session = renderer.xr.getSession();
        if(!session) return;
        
        let controllerWithIntersection: THREE.Object3D | undefined = undefined;
        
        controllers.forEach(controller => {
            tempMatrix.identity().extractRotation(controller.matrixWorld);
            raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
            raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
            
            const intersects = raycaster.intersectObjects(interactiveObjects);
            
            if (intersects.length > 0) {
                 controllerWithIntersection = controller;
                 const point = intersects[0].point;
                 uiPlane.worldToLocal(point);
                 
                 const x = point.x + uiGeometry.parameters.width / 2;
                 const normalizedX = x / uiGeometry.parameters.width;

                 if (normalizedX > 0.03 && normalizedX < 0.12) {
                     intersectedObject = { name: 'play' } as THREE.Object3D;
                 } else if (normalizedX > 0.13 && normalizedX < 0.72) {
                     intersectedObject = { name: 'seek' } as THREE.Object3D;
                     if(isSeeking) {
                         const seekProgress = (normalizedX - 0.13) / (0.72 - 0.13);
                         videoLeftEl.currentTime = videoLeftEl.duration * seekProgress;
                     }
                 } else {
                     intersectedObject = null;
                 }
                 
            } 
            ((controller.children[0] as THREE.Line).material as THREE.LineBasicMaterial).color.set(intersects.length > 0 ? 0x818cf8 : 0xffffff);
        });

        if(!controllerWithIntersection) intersectedObject = null;

        if (videoRightEl) videoRightEl.currentTime = videoLeftEl.currentTime;

        drawUI();
        renderer.render(scene, camera);
    });

    renderer.xr.addEventListener('sessionstart', () => {
        videoLeftEl.play();
        if(videoRightEl) videoRightEl.play();
    });
    
    renderer.xr.addEventListener('sessionend', () => {
        videoLeftEl.pause();
        if(videoRightEl) videoRightEl.pause();
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
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-full h-full relative">
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
        
        {audioUrl && <audio ref={audioRef} src={audioUrl} autoPlay loop />}
        
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <SaveWorldButton onClick={onSave} isDisabled={!isReady} />
            <AudioControl onGenerateAudio={onAddAmbiance} isGenerating={isGeneratingAudio} isDisabled={!isReady} audioDescription={audioDescription} />
        </div>
        <div className="absolute bottom-24 left-4 z-10">
            <DownloadButton videoUrl={videoUrl ?? stereoVideoUrls?.left} isDisabled={!showVideo} isStereo={isStereo} />
        </div>
        <div ref={vrButtonContainerRef} />
      </div>
    </div>
  );
};

export default VideoDisplay;