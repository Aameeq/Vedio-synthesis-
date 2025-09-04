
import React, { useRef, useEffect } from 'react';

interface VideoDisplayProps {
  videoUrl: string | null;
  frameUrl: string | null;
  onVideoEnd: (lastFrameDataUrl: string) => void;
}

const VideoDisplay: React.FC<VideoDisplayProps> = ({ videoUrl, frameUrl, onVideoEnd }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoUrl && videoElement) {
      videoElement.play().catch(error => {
        console.error("Video play failed:", error);
      });
    }
  }, [videoUrl]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && video.duration > 0 && video.currentTime === video.duration) {
      handleVideoEnd();
    }
  };

  const handleVideoEnd = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
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
          onEnded={handleVideoEnd}
          onTimeUpdate={handleTimeUpdate} // Fallback for browsers that don't fire onEnded consistently
          className="w-full h-full object-contain"
          muted
          autoPlay
        />
      ) : (
        frameUrl && <img src={frameUrl} alt="Current frame" className="w-full h-full object-contain" />
      )}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default VideoDisplay;
