import React, { useRef, useEffect } from 'react';

interface VideoDisplayProps {
  videoUrl: string | null;
  audioUrl: string | null;
  frameUrl: string | null;
  onVideoEnd: (lastFrameDataUrl: string) => void;
}

const VideoDisplay: React.FC<VideoDisplayProps> = ({ videoUrl, audioUrl, frameUrl, onVideoEnd }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    const audioElement = audioRef.current;

    if (videoUrl && videoElement) {
      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Video play failed:", error);
        });
      }
      if (audioElement && audioUrl) {
         audioElement.currentTime = 0;
         audioElement.play().catch(e => console.error("Audio play failed", e));
      }
    }

    return () => {
      audioElement?.pause();
    }
  }, [videoUrl, audioUrl]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && video.duration > 0 && video.currentTime === video.duration) {
      handleVideoEndInternal();
    }
  };

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

  return (
    <div className="w-full h-full relative">
      {videoUrl ? (
        <video
          ref={videoRef}
          key={videoUrl}
          src={videoUrl}
          onEnded={handleVideoEndInternal}
          onTimeUpdate={handleTimeUpdate} // Fallback for browsers that don't fire onEnded consistently
          className="w-full h-full object-contain"
          muted
          autoPlay
          playsInline
        />
      ) : (
        frameUrl && <img src={frameUrl} alt="Current frame" className="w-full h-full object-contain" />
      )}
      {audioUrl && (
          <audio ref={audioRef} src={audioUrl} loop />
      )}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default VideoDisplay;
