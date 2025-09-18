import React, { useRef, useEffect, useState } from 'react';

// Simple vertex shader to position and texture the video screen
const vertexShaderSource = `
  attribute vec4 a_position;
  attribute vec2 a_texcoord;
  uniform mat4 u_matrix;
  varying vec2 v_texcoord;
  void main() {
    gl_Position = u_matrix * a_position;
    v_texcoord = a_texcoord;
  }
`;

// Simple fragment shader to apply the video texture
const fragmentShaderSource = `
  precision mediump float;
  varying vec2 v_texcoord;
  uniform sampler2D u_texture;
  void main() {
    gl_FragColor = texture2D(u_texture, v_texcoord);
  }
`;

interface VideoDisplayProps {
  videoUrl: string | null;
  stereoVideoUrls?: { left: string; right: string } | null;
  audioUrl: string | null;
  frameUrl: string | null;
  onVideoEnd: (lastFrameDataUrl: string) => void;
  isLoading: boolean;
}

const PlayIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M8 5v14l11-7z" /></svg>;
const PauseIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>;
const VolumeHighIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>;
const VolumeOffIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>;
const FullscreenEnterIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>;
const FullscreenExitIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 0-2-2h-3M3 16h3a2 2 0 0 0 2-2v-3" /></svg>;

const formatTime = (timeInSeconds: number): string => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '00:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const VideoDisplay: React.FC<VideoDisplayProps> = ({ videoUrl, audioUrl, frameUrl, onVideoEnd, isLoading, stereoVideoUrls }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hideControlsTimeoutRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [areControlsVisible, setAreControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // --- VR State and Refs ---
  const [isVRSupported, setIsVRSupported] = useState(false);
  const [xrSession, setXRSession] = useState<any | null>(null);
  const vrCanvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const videoRefRight = useRef<HTMLVideoElement | null>(null);
  const videoTextureLeftRef = useRef<WebGLTexture | null>(null);
  const videoTextureRightRef = useRef<WebGLTexture | null>(null);
  const xrRefSpaceRef = useRef<any>(null);
  const positionBufferRef = useRef<WebGLBuffer | null>(null);
  const texcoordBufferRef = useRef<WebGLBuffer | null>(null);
  
  // Auto-play new videos
  useEffect(() => {
    const videoElement = videoRef.current;
    const audioElement = audioRef.current;

    if (videoUrl && videoElement) {
      setIsPlaying(true);
      videoElement.currentTime = 0;
      if(audioElement) audioElement.currentTime = 0;

      videoElement.play().catch(error => {
        console.error("Video auto-play failed:", error);
        setIsPlaying(false);
      });

      if (audioElement && audioUrl) {
        audioElement.play().catch(e => console.error("Audio auto-play failed", e));
      }
    }
  }, [videoUrl, audioUrl]);

  const handleVideoEndInternal = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    audioRef.current?.pause();

    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onVideoEnd(dataUrl);
      }
    }
  };
  
  const togglePlay = () => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      audio?.play();
    } else {
      video.pause();
      audio?.pause();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) videoRef.current.currentTime = newTime;
    if (audioRef.current) audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (audioRef.current) {
        audioRef.current.volume = newVolume;
        audioRef.current.muted = newVolume === 0;
    }
  };
  
  const toggleMute = () => {
    if (audioRef.current) {
        audioRef.current.muted = !audioRef.current.muted;
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        containerRef.current?.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        document.exitFullscreen();
    }
  };

  const showControls = () => {
    setAreControlsVisible(true);
    if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
    }
  };

  const hideControls = () => {
    if (isPlaying) {
        setAreControlsVisible(false);
    }
  };

  const startHideTimer = () => {
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    hideControlsTimeoutRef.current = window.setTimeout(() => {
        if (isPlaying) {
            hideControls();
        }
    }, 3000);
  };

  const handleMouseMove = () => {
    showControls();
    startHideTimer();
  };
  
  useEffect(() => {
      if (!isPlaying) {
          showControls();
      } else {
          startHideTimer();
      }
  }, [isPlaying]);


  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
        setIsPlaying(false);
        handleVideoEndInternal();
    };
    const onVolumeChange = () => {
        if(audio){
            setVolume(audio.volume);
            setIsMuted(audio.muted);
        }
    };
    
    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);
    audio?.addEventListener('volumechange', onVolumeChange);

    return () => {
        video.removeEventListener('timeupdate', updateTime);
        video.removeEventListener('loadedmetadata', updateDuration);
        video.removeEventListener('play', onPlay);
        video.removeEventListener('pause', onPause);
        video.removeEventListener('ended', onEnded);
        audio?.removeEventListener('volumechange', onVolumeChange);
    };
  }, [onVideoEnd]);
  
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
    // --- VR Effects and Handlers ---
  useEffect(() => {
    if ((navigator as any).xr) {
        (navigator as any).xr.isSessionSupported('immersive-vr').then((supported: boolean) => {
            setIsVRSupported(supported);
        });
    }
  }, []);

  useEffect(() => {
    return () => {
        xrSession?.end();
    };
  }, [xrSession]);

  const createVideoElement = (videoSrc: string) => {
      const video = document.createElement('video');
      video.src = videoSrc;
      video.crossOrigin = 'anonymous';
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      return video;
  }

  const initWebGLProgram = (gl: WebGLRenderingContext) => {
      const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
      gl.shaderSource(vertexShader, vertexShaderSource);
      gl.compileShader(vertexShader);

      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
      gl.shaderSource(fragmentShader, fragmentShaderSource);
      gl.compileShader(fragmentShader);

      const program = gl.createProgram()!;
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      gl.useProgram(program);

      return program;
  };
  
  const initBuffers = (gl: WebGLRenderingContext) => {
      const screenWidth = 2;
      const screenHeight = screenWidth * (9/16);
      const positions = [ -screenWidth/2,-screenHeight/2,-2.5,  screenWidth/2,-screenHeight/2,-2.5, -screenWidth/2, screenHeight/2,-2.5, -screenWidth/2, screenHeight/2,-2.5,  screenWidth/2,-screenHeight/2,-2.5,  screenWidth/2, screenHeight/2,-2.5 ];
      positionBufferRef.current = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferRef.current);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

      const texcoords = [0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0];
      texcoordBufferRef.current = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBufferRef.current);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
  };

  const initTexture = (gl: WebGLRenderingContext) => {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      return texture;
  }

  const onSessionStarted = async (session: any) => {
      setXRSession(session);
      
      const canvas = vrCanvasRef.current!;
      const gl = canvas.getContext('webgl', { xrCompatible: true })! as WebGLRenderingContext;
      glRef.current = gl;

      await (gl as any).makeXRCompatible();
      session.updateRenderState({ baseLayer: new (window as any).XRWebGLLayer(session, gl) });
      
      xrRefSpaceRef.current = await session.requestReferenceSpace('local');
      programRef.current = initWebGLProgram(gl);
      initBuffers(gl);

      const mainVideo = videoRef.current;
      if (!mainVideo) {
          console.error("Main video element not found for VR session.");
          session.end();
          return;
      }
      mainVideo.loop = true; 
      
      videoTextureLeftRef.current = initTexture(gl);
      
      if (stereoVideoUrls) {
          videoRefRight.current = createVideoElement(stereoVideoUrls.right);
          videoTextureRightRef.current = initTexture(gl);
      }
      
      mainVideo.play();
      videoRefRight.current?.play();
      audioRef.current?.play();

      session.requestAnimationFrame(onXRFrame);
  };

  const onXRFrame = (time: number, frame: any) => {
      const session = frame.session;
      session.requestAnimationFrame(onXRFrame);

      const gl = glRef.current!;
      const program = programRef.current!;
      
      const baseLayer = session.renderState.baseLayer;
      gl.bindFramebuffer(gl.FRAMEBUFFER, baseLayer.framebuffer);

      gl.clearColor(0.1, 0.1, 0.1, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      const pose = frame.getViewerPose(xrRefSpaceRef.current);
      if (!pose) return;
      
      const videoLeft = videoRef.current;
      const videoRight = videoRefRight.current;

      if (videoRight && videoLeft) {
          videoRight.currentTime = videoLeft.currentTime;
      }
      if (audioRef.current && videoLeft) {
          audioRef.current.currentTime = videoLeft.currentTime;
      }

      const positionAttribLocation = gl.getAttribLocation(program, 'a_position');
      const texcoordAttribLocation = gl.getAttribLocation(program, 'a_texcoord');
      const matrixUniformLocation = gl.getUniformLocation(program, 'u_matrix');

      for (const view of pose.views) {
          const viewport = baseLayer.getViewport(view);
          gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

          gl.enableVertexAttribArray(positionAttribLocation);
          gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferRef.current);
          gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);

          gl.enableVertexAttribArray(texcoordAttribLocation);
          gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBufferRef.current);
          gl.vertexAttribPointer(texcoordAttribLocation, 2, gl.FLOAT, false, 0, 0);
          
          let videoElement: HTMLVideoElement | null = null;
          let texture: WebGLTexture | null = null;

          if (stereoVideoUrls && view.eye === 'right') {
              videoElement = videoRight;
              texture = videoTextureRightRef.current;
          } else {
              videoElement = videoLeft;
              texture = videoTextureLeftRef.current;
          }

          if (videoElement && videoElement.readyState >= videoElement.HAVE_CURRENT_DATA) {
              gl.bindTexture(gl.TEXTURE_2D, texture);
              gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, videoElement);
          }

          gl.uniformMatrix4fv(matrixUniformLocation, false, view.projectionMatrix);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
  };

  const startVRSession = async () => {
      if (!videoUrl) return;
      try {
          const session = await (navigator as any).xr.requestSession('immersive-vr', {
              optionalFeatures: ['local-floor', 'bounded-floor']
          });
          session.addEventListener('end', () => {
              setXRSession(null);
              if (videoRef.current) {
                  videoRef.current.loop = false;
              }
              videoRefRight.current?.pause();
              videoRefRight.current = null;
          });
          onSessionStarted(session);
      } catch (e) {
          console.error("Failed to start VR session:", e);
      }
  };


  return (
    <>
      {xrSession && <canvas ref={vrCanvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 100 }} />}
      <div 
          ref={containerRef}
          className="w-full h-full relative"
          onMouseEnter={showControls}
          onMouseLeave={hideControls}
          onMouseMove={handleMouseMove}
      >
        {isLoading && (
          <div className="absolute inset-0 z-10 border-4 border-brand-primary rounded-lg animate-pulse-border pointer-events-none"></div>
        )}
        {videoUrl ? (
          <video
            ref={videoRef}
            key={videoUrl}
            src={videoUrl}
            className="w-full h-full object-contain"
            muted
            playsInline
            crossOrigin="anonymous"
          />
        ) : (
          frameUrl && <img src={frameUrl} alt="Current frame" className="w-full h-full object-contain" />
        )}
        {audioUrl && (
            <audio ref={audioRef} src={audioUrl} loop />
        )}
        <canvas ref={canvasRef} className="hidden"></canvas>
        
        {isVRSupported && videoUrl && !xrSession && (
          <button
            onClick={startVRSession}
            className="absolute bottom-16 right-4 z-20 px-4 py-2 bg-black bg-opacity-60 text-white font-bold rounded-lg hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all transform hover:scale-105"
          >
            View in VR
          </button>
        )}
        
        {videoUrl && (
          <div className={`absolute bottom-0 left-0 right-0 p-2 md:p-4 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300 z-20 ${areControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step="any"
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer range-thumb"
                  aria-label="Seek"
              />
              <style>{`
                .range-thumb { -webkit-appearance: none; appearance: none; }
                .range-thumb::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 16px; height: 16px; background: #4f46e5; border-radius: 50%; cursor: pointer; margin-top: -7px; }
                .range-thumb::-moz-range-thumb { width: 16px; height: 16px; background: #4f46e5; border-radius: 50%; cursor: pointer; border: 0; }
              `}</style>

              <div className="flex items-center justify-between text-white mt-2">
                  <div className="flex items-center gap-2 md:gap-4">
                      <button onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>{isPlaying ? <PauseIcon/> : <PlayIcon/>}</button>
                      
                      <div className="flex items-center gap-2 group">
                          <button onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
                              {(isMuted || volume === 0) ? <VolumeOffIcon/> : <VolumeHighIcon/>}
                          </button>
                          <input
                              type="range"
                              min="0"
                              max="1"
                              step="any"
                              value={isMuted ? 0 : volume}
                              onChange={handleVolumeChange}
                              className="w-0 group-hover:w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer transition-all duration-300 range-thumb"
                              aria-label="Volume"
                          />
                      </div>

                      <span className="text-xs md:text-sm font-mono">{formatTime(currentTime)} / {formatTime(duration)}</span>
                  </div>
                  
                  <button onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
                      {isFullscreen ? <FullscreenExitIcon/> : <FullscreenEnterIcon/>}
                  </button>
              </div>
          </div>
        )}
      </div>
    </>
  );
};

export default VideoDisplay;
